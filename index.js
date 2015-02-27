'use strict';

var util = require('util');
var assert = require('assert');

var Pak = require('pak');
var has = require('lodash/object/has');
var domReady = require('domready');

function Irken(){
  Pak.call(this);

  this.layout = function(){};
  this.mountpoints = {};
  this.mountpointElements = {};
}

util.inherits(Irken, Pak);

Irken.prototype.view = function view(mountpoint, fn){
  var isValid = has(this.mountpoints, mountpoint);

  assert(isValid, '`mountpoint` must be one of: ' + Object.keys(this.mountpoints).join(', '));

  this.mountpoints[mountpoint].push(fn);
};

Irken.prototype.layout = function layout(fn){
  this.layout = fn;
};

Irken.prototype.registerMountpoint = function registerMountpoint(mountpoint, element){
  this.mountpointElements[mountpoint] = element;
  this.mountpoints[mountpoint] = [];
};

Irken.prototype.render = function render(){
  var layout = this.layout;
  domReady(function(){
    layout(document.body);
  });
};

module.exports = Irken;
