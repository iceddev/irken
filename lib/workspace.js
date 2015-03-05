'use strict';

var fs = require('fs');
var path = require('path');

var mkdirp = require('mkdirp');
var Immstruct = require('immstruct').Immstruct;

var root = process.browser ? '/' : './';

function Workspace(){
  var self = this;

  var inst = this._inst = new Immstruct();

  var structure = this._structure = inst.get({
    filename: '',
    current: 'function helloWorld(hello){\n  hello = "world";\n}',
    cwd: root,
    directory: [],
    projects: []
  });

  this.filename = structure.cursor('filename');
  this.current = structure.cursor('current');
  this.cwd = structure.cursor('cwd');
  this.directory = structure.cursor('directory');
  this.projects = structure.cursor('projects');

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

    if(updatedPath.indexOf('cwd') === 0){
      self.cwd = structure.cursor('cwd');
      return;
    }

    if(updatedPath.indexOf('directory') === 0){
      self.directory = structure.cursor('directory');
      return;
    }

    if(updatedPath.indexOf('projects') === 0){
      self.projects = structure.cursor('projects');
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

  var cwd = this.cwd.deref();
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

Workspace.prototype.changeDir = function changeDir(dirpath, cb){
  var self = this;
  var cwd = this.cwd;
  var directory = this.directory;
  var projects = this.projects;

  // TODO: support more than root resolution
  var resolvedDir = path.resolve(root, dirpath);

  mkdirp(resolvedDir, function(mkdirpErr){
    if(mkdirpErr){
      return cb(mkdirpErr);
    }

    fs.readdir(root, function(projectsErr, directories){
      if(projectsErr){
        return cb(projectsErr);
      }

      projects.update(function(list){
        var empty = list.clear();
        return empty.concat(directories);
      });

      fs.readdir(resolvedDir, function(err, files){
        directory.update(function(list){
          var empty = list.clear();
          return empty.concat(files);
        });

        cwd.update(function(){
          return resolvedDir;
        });

        cb(err, self.directory);
      });
    });
  });
};

module.exports = Workspace;
