'use strict';

var fs = require('fs');

var lab = exports.lab = require('lab').script();
var code = require('code');

var Workspace = require('../lib/workspace');

lab.experiment('Workspace', function(){

  var space;
  var tmpFilepath = '.tmp/test.js';

  lab.beforeEach(function(done){
    space = new Workspace();
    done();
  });

  lab.test('#filename is a cursor for the current filename', function(done){
    code.expect(space.filename.deref).to.be.a.function();
    code.expect(space.filename.deref()).to.equal('');
    done();
  });

  lab.test('#filename allows updating current filename through update', function(done){
    var newFilename = 'test.js';

    code.expect(space.filename.update).to.be.a.function();

    space.filename.update(function(){
      return newFilename;
    });

    code.expect(space.filename.deref()).to.equal(newFilename);
    done();
  });

  lab.test('#current is a cursor for current file', function(done){
    code.expect(space.current.deref).to.be.a.function();
    code.expect(space.current.deref()).to.equal('function helloWorld(hello){\n  hello = "world";\n}');
    done();
  });

  lab.test('#current allows updating current data through .update', function(done){
    var newText = 'function helloWorld(hello){\n  foo = "bar";\n}';

    code.expect(space.current.update).to.be.a.function();

    space.current.update(function(){
      return newText;
    });

    code.expect(space.current.deref()).to.equal(newText);
    done();
  });

  lab.test('#cwd is a cursor for the current working directory', function(done){
    // TODO: root differs between browser and node
    code.expect(space.cwd.deref).to.be.a.function();
    code.expect(space.cwd.deref()).to.equal('./');
    done();
  });

  lab.test('#directory should default to an empty list', function(done){
    code.expect(space.directory.deref).to.be.a.function();
    code.expect(space.directory.size).to.equal(0);
    done();
  });

  lab.test('#projects should default to an empty list', function(done){
    code.expect(space.projects.deref).to.be.a.function();
    code.expect(space.projects.size).to.equal(0);
    done();
  });

  lab.test('#saveFile will mkdirp and save a file', function(done){
    var newText = 'function helloWorld(hello){\n  foo = "bar";\n}';

    space.saveFile(tmpFilepath, newText, function(err){
      var saved = fs.readFileSync(tmpFilepath, 'utf8');

      code.expect(err).to.not.exist();
      code.expect(saved).to.equal(newText);
      done(err);
    });
  });

  lab.test('#saveFile also handles cursors', function(done){
    var newText = 'function helloWorld(hello){\n  my = "cursor";\n}';

    space.current.update(function(){
      return newText;
    });

    space.saveFile(tmpFilepath, space.current, function(err){
      var saved = fs.readFileSync(tmpFilepath, 'utf8');

      code.expect(err).to.not.exist();
      code.expect(saved).to.equal(newText);
      done(err);
    });
  });

  lab.test('#saveFile adds the file to the directory listing', function(done){
    var newText = 'function helloWorld(hello){\n  foo = "bar";\n}';

    space.saveFile(tmpFilepath, newText, function(err){
      code.expect(err).to.not.exist();
      code.expect(space.directory.contains(tmpFilepath)).to.equal(true);
      done(err);
    });
  });

  lab.test('#saveFile does not add the file to the directory listing twice upon 2nd save', function(done){
    var newText = 'function helloWorld(hello){\n  foo = "bar";\n}';

    space.saveFile(tmpFilepath, newText, function(err){
      code.expect(err).to.not.exist();
      space.saveFile(tmpFilepath, newText, function(err2){
        code.expect(err2).to.not.exist();
        code.expect(space.directory.indexOf(tmpFilepath)).to.equal(space.directory.lastIndexOf(tmpFilepath));
        done(err2);
      });
    });
  });

  lab.test('#saveFile can take workspace.current', function(done){
    space.saveFile(tmpFilepath, space.current, function(err){
      var saved = fs.readFileSync(tmpFilepath, 'utf8');

      code.expect(err).to.not.exist();
      code.expect(space.current.deref()).to.equal(saved);
      done(err);
    });
  });

  lab.test('#loadFile will load a file into current', function(done){
    space.loadFile(tmpFilepath, function(err, contents){
      code.expect(err).to.not.exist();
      code.expect(contents).to.equal(space.current);
      done();
    });
  });

  lab.test('#changeDir should adjust cwd and add files to directory structure', function(done){
    space.changeDir('.tmp', function(err, files){
      code.expect(err).to.not.exist();
      code.expect(space.directory).to.equal(files);
      code.expect(files.size).to.equal(1);
      done(err);
    });
  });

  lab.test('#changeDir should add projects from the root to the projects cursor', function(done){
    space.changeDir('.tmp', function(err){
      code.expect(err).to.not.exist();
      code.expect(space.projects.contains('.tmp')).to.equal(true);
      done(err);
    });
  });

});
