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

  lab.test('#saveFile will mkdirp and save a file', function(done){
    var newText = 'function helloWorld(hello){\n  foo = "bar";\n}';

    space.saveFile(tmpFilepath, newText, function(err){
      var saved = fs.readFileSync(tmpFilepath, 'utf8');

      code.expect(err).to.not.exist();
      code.expect(saved).to.equal(newText);
      done(err);
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

});
