'use strict';

var util = require('util');
var assert = require('assert');

var Pak = require('pak');
var bach = require('bach');
var values = require('lodash/object/values');
var isEmpty = require('lodash/lang/isEmpty');
var compact = require('lodash/array/compact');
var flatten = require('lodash/array/flatten');
var domReady = require('dooomrdy');

function asyncNoop(cb){
  process.nextTick(cb);
}

function layoutNoop(el, cb){
  asyncNoop(cb);
}

function Irken(){
  Pak.call(this);

  this.lifecycle = {};
  this.mountpoints = {};
  this.mountpointElements = {};

  this._renderCalled = false;

  var container = document.createElement('div');
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.margin = 0;
  container.style.padding = 0;
  document.body.insertBefore(container, document.body.firstChild);
  this._container = container;

  this.layout(layoutNoop);
}

util.inherits(Irken, Pak);

Irken.prototype.expose = function expose(namespace, exposed){
  assert(!this[namespace], namespace + ' is already defined');
  this[namespace] = exposed;
};

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
  var container = this._container;

  function layoutLifecycle(cb){
    return fn(container, cb);
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
  this._renderCalled = true;

  var layout = this.lifecycle.layout;

  var pipeline = [layout];

  if(!isEmpty(this.mountpoints)){
    var mountpointPipeline = compact(flatten(values(this.mountpoints)));
    if(mountpointPipeline.length){
      pipeline.push(bach.parallel(mountpointPipeline));
    }
  }

  var renderPipeline = bach.series(pipeline);

  domReady(function(){
    renderPipeline(cb);
  });
};

module.exports = Irken;
