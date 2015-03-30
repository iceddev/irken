'use strict';

var expect = require('expect');

var Irken = require('../');

function noop(){}

describe('Irken', function(){

  var app;
  var el;
  var container;

  beforeEach(function(done){
    container = document.createElement('div');
    app = new Irken({ container: container });
    el = document.createElement('div');
    done();
  });

  afterEach(function(done){
    container = null;
    app = null;
    el = null;
    done();
  });

  it('generates a new container if not passed in options', function(done){
    expect(app._container).toEqual(container);
    app = new Irken();
    expect(app._container).toNotEqual(container);
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
    app.view('sidebar', function(_, cb){
      cb();
    });
    app.addMountpoint('editor', el);
    app.render(function(err){
      expect(err).toNotExist();
      done();
    });
  });

  it('renders views at mountpoints', function(done){
    var called = false;
    app.addMountpoint('sidebar', el);
    app.view('sidebar', function(mountEl, cb){
      console.log('sidebar');
      expect(mountEl).toBe(el);
      called = true;
      cb();
    });
    app.render(function(err){
      expect(err).toNotExist();
      expect(called).toEqual(true);
      done();
    });
  });
});
