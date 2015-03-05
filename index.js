'use strict';

var util = require('util');

var Pak = require('pak');
var bach = require('bach');
var values = require('lodash/object/values');
var flatten = require('lodash/array/flatten');
var domReady = require('domready');

var Workspace = require('./lib/workspace');

function asyncNoop(cb){
  cb();
}

/**
 * Creates a new Irken.  'irken, crank out'
 * @property {Object} lifecycle stores context-based functions.
 * @property {Object} mountpoints names of target DOM nodes.
 * @property {Object} mountpointElements target DOM nodes.
 * @property {Function} workspace returns user interactivity api.
 * @property {Function} layout renders mountpoints.
 */
function Irken(){
  Pak.call(this);

  var self = this;

  this.lifecycle = {};
  this.mountpoints = {};
  this.mountpointElements = {};

  this.workspace = new Workspace();

  this._renderCalled = false;

  this.layout(asyncNoop);

  // TODO: make workspace an EE?
  this.workspace._structure.on('swap', function(){
    // allow initial setup without render
    if(self._renderCalled){
      self.render();
    }
  });
}

util.inherits(Irken, Pak);

/**
 * Registers and renders a mountpoint with callback.
 * @param  {string|Cursor}
 * @param  {Function}
 * @return {undefined}
 */
Irken.prototype.view = function view(mountpoint, fn){
  var elements = this.mountpointElements;
  if(!this.mountpoints[mountpoint]){
    this.mountpoints[mountpoint] = [];
  }

  function viewLifecycle(cb){
    return fn(elements[mountpoint], cb);
  }

  this.mountpoints[mountpoint].push(viewLifecycle);
};

/**
 * Sets the layout render function at irken.lifecycle.layout
 * @param  {Function}
 * @return {undefined}
 */
Irken.prototype.layout = function layout(fn){
  function layoutLifecycle(cb){
    return fn(document.body, cb);
  }

  this.lifecycle.layout = layoutLifecycle;
};

/**
 * Registers a mountpoint name and element type
 * @param {string|Cursor}
 * @param {string|Cursor}
 */
Irken.prototype.addMountpoint = function addMountpoint(mountpoint, element){
  if(!this.mountpoints[mountpoint]){
    this.mountpoints[mountpoint] = [];
  }

  if(!this.mountpointElements[mountpoint]){
    this.mountpointElements[mountpoint] = element;
  }
};

/**
 * Removes a mountpoint from the irken object
 * @param  {string|Cursor}
 * @return {undefined}
 */
Irken.prototype.removeMountpoint = function removeMountpoint(mountpoint){
  delete this.mountpoints[mountpoint];
  delete this.mountpointElements[mountpoint];
};

/**
 * Render baby, yeah! Renders and mounts all the mountpoints to DOM
 * @param  {Function}
 * @return {undefined}
 */
Irken.prototype.render = function render(cb){
  this._renderCalled = true;

  var layout = this.lifecycle.layout;
  var mountpoints = bach.parallel(flatten(values(this.mountpoints)));

  var renderPipeline = bach.series(layout, mountpoints);

  domReady(function(){
    renderPipeline(cb);
  });
};

module.exports = Irken;
