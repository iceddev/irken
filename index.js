'use strict';

var util = require('util');
var assert = require('assert');

var Pak = require('pak');
var assign = require('lodash/object/assign');

var ui = require('./lib/ui');
var board = require('./lib/board');

function asyncNoop(cb){
  process.nextTick(cb);
}

function layoutNoop(el, cb){
  asyncNoop(cb);
}

function generateContainer(){
  var container = document.createElement('div');
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.margin = 0;
  container.style.padding = 0;
  document.body.insertBefore(container, document.body.firstChild);
  return container;
}

function Irken(opts){
  opts = opts || {};

  Pak.call(this);

  this.lifecycle = {};
  this.mountpoints = {};
  this.mountpointElements = {};

  this._renderCalled = false;

  this._container = opts.container || generateContainer();

  this.layout(layoutNoop);
}

util.inherits(Irken, Pak);

Irken.prototype.expose = function expose(namespace, exposed){
  assert(!this[namespace], namespace + ' is already defined');
  this[namespace] = exposed;
};

assign(Irken.prototype, ui, board);

module.exports = Irken;
