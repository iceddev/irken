'use strict';

var util = require('util');
var assert = require('assert');

var Pak = require('pak');

var mountpoints = [
  'appbar',
  'sidebar',
  'editor',
  'console'
];

function Irken(){
  Pak.call(this);

  this.mountpoints = mountpoints.reduce(function(result, mountpoint){
    result[mountpoint] = [];
    return result;
  }, {});
}

util.inherits(Irken, Pak);

Irken.prototype.view = function view(mountpoint, fn){
  var isValid = mountpoints.indexOf(mountpoint) !== -1;

  assert(isValid, '`mountpoint` must be one of: ' + mountpoints.join(', '));

  this.mountpoints[mountpoint].push(fn);
};

module.exports = Irken;
