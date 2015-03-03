'use strict';

var fs = require('fs');
var path = require('path');

var Immstruct = require('immstruct').Immstruct;

var utils = require('./utils');

function Workspace(){
  var self = this;

  var inst = this._inst = new Immstruct();

  var structure = this._structure = inst.get({
    current: 'function helloWorld(hello){\n  hello = "world";\n}'
  });

  this.current = structure.cursor('current');

  structure.on('swap', function(){
    self.current = structure.cursor('current');
  });
}

Workspace.prototype.loadFile = function loadFile(filepath, cb){
  var self = this;

  fs.readFile(filepath, 'utf8', function(err, contents){
    self.current.update(function(){
      return contents;
    });

    cb(err, self.current);
  });
};

Workspace.prototype.saveFile = function saveFile(filepath, content, cb){
  if(content && typeof content.deref === 'function'){
    content = content.deref();
  }

  var dir = path.dirname(filepath);
  utils.mkdirp(dir, function(err){
    if(err){
      return cb(err);
    }

    fs.writeFile(filepath, content, 'utf8', cb);
  });
};

module.exports = Workspace;
