'use strict';

var util = require('util');

var Pak = require('pak');
var bach = require('bach');
var values = require('lodash/object/values');
var flatten = require('lodash/array/flatten');
var domReady = require('domready');

function asyncNoop(cb){
  cb();
}

function Irken(){
  Pak.call(this);

  this.lifecycle = {};
  this.mountpoints = {};
  this.mountpointElements = {};

  this.layout(asyncNoop);
}

util.inherits(Irken, Pak);

Irken.prototype.view = function view(mountpoint, fn){
  var elements = this.mountpointElements;
  if(!this.mountpoints[mountpoint]){
    this.mountpoints[mountpoint] = [];
  }
  this.mountpoints[mountpoint].push(viewLifecycle);

  function viewLifecycle(cb){
    return fn(elements[mountpoint], cb);
  }
};

Irken.prototype.layout = function layout(fn){

  this.lifecycle.layout = layoutLifecycle;

  function layoutLifecycle(cb){
    return fn(document.body, cb);
  }
};

Irken.prototype.registerMountpoint = function registerMountpoint(mountpoint, element){
  if(!this.mountpoints[mountpoint]){
    this.mountpoints[mountpoint] = [];
  }
  if(!this.mountpointElements[mountpoint]){
    this.mountpointElements[mountpoint] = element;
  }
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
