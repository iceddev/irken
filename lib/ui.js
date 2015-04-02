'use strict';

var bach = require('bach');
var values = require('lodash/object/values');
var isEmpty = require('lodash/lang/isEmpty');
var compact = require('lodash/array/compact');
var flatten = require('lodash/array/flatten');
var domReady = require('dooomrdy');

function view(mountpoint, fn){
  var elements = this.mountpointElements;
  if(!this.mountpoints[mountpoint]){
    this.mountpoints[mountpoint] = [];
  }

  function viewLifecycle(cb){
    return fn(elements[mountpoint], cb);
  }

  this.mountpoints[mountpoint].push(viewLifecycle);
}

function layout(fn){
  var container = this._container;

  function layoutLifecycle(cb){
    return fn(container, cb);
  }

  this.lifecycle.layout = layoutLifecycle;
}

function addMountpoint(mountpoint, element){
  if(!this.mountpoints[mountpoint]){
    this.mountpoints[mountpoint] = [];
  }

  if(!this.mountpointElements[mountpoint]){
    this.mountpointElements[mountpoint] = element;
  }
}

function removeMountpoint(mountpoint){
  delete this.mountpoints[mountpoint];
  delete this.mountpointElements[mountpoint];
}

function render(cb){
  this._renderCalled = true;

  var layoutPipeline = this.lifecycle.layout;

  var pipeline = [layoutPipeline];

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
}

module.exports = {
  view: view,
  layout: layout,
  addMountpoint: addMountpoint,
  removeMountpoint: removeMountpoint,
  render: render
};
