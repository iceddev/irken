'use strict';

var lab = exports.lab = require('lab').script();
var code = require('code');

var Irken = require('../');

function noop(){}

lab.experiment('Irken', function(){

  var app;

  lab.beforeEach(function(done){
    app = new Irken();

    app.addMountpoint('sidebar', noop);
    done();
  });

  lab.test('#view adds function to valid mountpoint', function(done){
    app.view('sidebar', noop);
    code.expect(app.mountpoints.sidebar).to.have.length(1);
    done();
  });
});
