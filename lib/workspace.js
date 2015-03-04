'use strict';

var fs = require('fs');
var path = require('path');

var mkdirp = require('mkdirp');
var Immstruct = require('immstruct').Immstruct;

function Workspace(){
  var self = this;

  var inst = this._inst = new Immstruct();

  var structure = this._structure = inst.get({
    filename: '',
    current: 'function helloWorld(hello){\n  hello = "world";\n}',
    cwd: './',
    directory: []
  });

  this.filename = structure.cursor('filename');
  this.current = structure.cursor('current');
  this.directory = structure.cursor('directory');

  // TODO: this should probably be tested
  structure.on('swap', function(n, o, updatedPath){
    if(updatedPath.indexOf('filename') === 0){
      self.filename = structure.cursor('filename');
      return;
    }

    if(updatedPath.indexOf('current') === 0){
      self.current = structure.cursor('current');
      return;
    }

    if(updatedPath.indexOf('directory') === 0){
      self.directory = structure.cursor('directory');
      return;
    }
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
  // TODO: make sure all arguments are passed

  if(typeof content.deref === 'function'){
    content = content.deref();
  }

  var directory = this._structure.cursor('directory');

  var cwd = this._structure.cursor('cwd').deref();
  var dir = path.dirname(filepath);
  var filename = path.basename(filepath);

  var resolvedDir = path.resolve(cwd, dir);
  var resolvedFilepath = path.resolve(resolvedDir, filename);

  mkdirp(resolvedDir, function(mkdirpErr){
    if(mkdirpErr){
      return cb(mkdirpErr);
    }

    fs.writeFile(resolvedFilepath, content, 'utf8', function(writeErr){
      if(writeErr){
        return cb(writeErr);
      }

      if(!directory.contains(filepath)){
        directory.update(function(list){
          return list.push(filepath);
        });
      }

      cb();
    });
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
