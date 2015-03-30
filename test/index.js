'use strict';

var expect = require('expect');

var Irken = require('../');

function noop(){}

describe('Irken', function(){

  var app;
  var el;

  beforeEach(function(done){
    app = new Irken();
    el = document.createElement('div');
    done();
  });

  afterEach(function(done){
    el = null;
    document.body.removeChild(app._container);
    done();
  });

  it('#view adds function to valid mountpoint', function(done){
    app.addMountpoint('sidebar', el);
    app.view('sidebar', noop);
    expect(app.mountpoints.sidebar.length).toEqual(1);
    done();
  });

  it('#expose makes an object available', function(done){
    var exposed = {};
    app.expose('test', exposed);
    expect(app.test).toEqual(exposed);
    done();
  });

  it('#expose makes a function available', function(done){
    var exposed = noop;
    app.expose('test', exposed);
    expect(app.test).toEqual(exposed);
    done();
  });

  it('#expose does not allow overriding `constructor`', function(done){
    function exists(){
      app.expose('constructor', {});
    }
    expect(exists).toThrow();
    done();
  });

  it('does not need mountpoints to render', function(done){
    app.render(function(err){
      expect(err).toNotExist();
      done();
    });
  });

  it('does not need views registered on mountpoints to render', function(done){
    app.addMountpoint('sidebar', el);
    app.render(function(err){
      expect(err).toNotExist();
      done();
    });
  });

  it('does not need views registered on all mountpoints to render', function(done){
    app.addMountpoint('sidebar', el);
    app.view('sidebar', noop);
    app.addMountpoint('editor', el);
    app.render(function(err){
      expect(err).toNotExist();
      done();
    });
  });
});
