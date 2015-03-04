'use strict';

var fs = require('fs');
var path = require('path');

var mkdirp = require('mkdirp');
var Immstruct = require('immstruct').Immstruct;

function Workspace(){
  var self = this;

  var inst = this._inst = new Immstruct();

  var structure = this._structure = inst.get({
    current: 'function helloWorld(hello){\n  hello = "world";\n}',
    cwd: './',
    directory: []
  });

  this.current = structure.cursor('current');
  this.directory = structure.cursor('directory');

  structure.on('swap', function(){
    self.current = structure.cursor('current');
    self.directory = structure.cursor('directory');
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

  var cwd = this._structure.cursor('cwd').deref();
  var dir = path.dirname(filepath);
  var filename = path.basename(filepath);

  var resolvedDir = path.resolve(cwd, dir);
  var resolvedFilepath = path.resolve(resolvedDir, filename);

  mkdirp(resolvedDir, function(err){
    if(err){
      return cb(err);
    }

    fs.writeFile(resolvedFilepath, content, 'utf8', cb);
  });
};

Workspace.prototype.changeDir = function changeDir(filepath, cb){
  var self = this;
  var dirPath = this._structure.cursor('cwd');
  var directory = this._structure.cursor('directory');

  fs.readdir(filepath, function(err, files){
    directory.merge(files);

    dirPath.update(function(){
      return filepath;
    });

    cb(err, self.directory);
  });
};

module.exports = Workspace;
