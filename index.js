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

function Irken(){
  Pak.call(this);

  this.lifecycle = {};
  this.mountpoints = {};
  this.mountpointElements = {};

  this.workspace = new Workspace();

  this.layout(asyncNoop);
}

util.inherits(Irken, Pak);

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

Irken.prototype.layout = function layout(fn){
  function layoutLifecycle(cb){
    return fn(document.body, cb);
  }

  this.lifecycle.layout = layoutLifecycle;
};

Irken.prototype.addMountpoint = function addMountpoint(mountpoint, element){
  if(!this.mountpoints[mountpoint]){
    this.mountpoints[mountpoint] = [];
  }

  if(!this.mountpointElements[mountpoint]){
    this.mountpointElements[mountpoint] = element;
  }
};

Irken.prototype.removeMountpoint = function removeMountpoint(mountpoint){
  delete this.mountpoints[mountpoint];
  delete this.mountpointElements[mountpoint];
};

Irken.prototype.render = function render(cb){
  var layout = this.lifecycle.layout;
  var mountpoints = bach.parallel(flatten(values(this.mountpoints)));

  var renderPipeline = bach.series(layout, mountpoints);

  domReady(function(){
    renderPipeline(cb);
  });
};

module.exports = Irken;
