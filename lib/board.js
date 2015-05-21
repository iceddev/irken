'use strict';

var _ = require('lodash');
var when = require('when');
var nodefn = require('when/node');
var Serialport = require('browser-serialport');

function getFallbackType(){
  //TODO eventually will be used to select a board type when one isn't detected.
  return 'bs2';
}

function generateUniqueName(device){
  return device.type + '-' + device.path;
}

function addBoard(type, Board){
  this._boards[type] = Board;
}

function removeBoard(type){
  delete this._boards[type];
}

function listPorts(){
  return nodefn.call(Serialport.list);
}

function getBoard(options){
  var uniqueName = generateUniqueName(options);
  var device = this._devices[uniqueName];
  if(!device){
    var Board = this._boards[options.type];
    device = new Board(options.board);
    this._devices[uniqueName] = device;
  }
  return device;
}

function generateEmptyPortlist(portList){
  var type = getFallbackType();
  return _.map(portList, function(port){
    return {
      name: null,
      path: port,
      type: type,
      board: {
        path: port
      }
    };
  });
}

function scanBoards(options){
  var self = this;
  var opts = options || {};
  var targetBoards, targetTypes;
  if(opts.type){
    targetBoards = [this._boards[opts.type]];
    targetTypes = [opts.type];
  }else{
    targetBoards = _.values(this._boards);
    targetTypes = _.keys(this._boards);
  }

  //close open ports so they can be scanned
  var closingDevices = _.map(_.values(this._devices), function(device){
    if(device.isOpen()){
      return device.close();
    }
  });

  return when.settle(closingDevices)
    .then(function(){
      self._devices = [];
      return self.listPorts();
    })
    .then(function(ports){
      var portList = _.pluck(ports, 'comName');
      return when.reduce(targetBoards, function(boardList, board, ix){
        return board.search(portList)
          .then(function(newBoards){
            _.forEach(newBoards, function(boardInfo){
              boardInfo.type = targetTypes[ix];
            });
            return boardList.concat(newBoards);
          });
      }, [])
      .then(function(boards){
        var allPorts = generateEmptyPortlist(portList);
        var emptyPorts = _.reject(allPorts, function(ep){
          return _.find(boards, { path: ep.path });
        });
        return boards.concat(emptyPorts);
      });
  });
}

module.exports = {
  addBoard: addBoard,
  getBoard: getBoard,
  listPorts: listPorts,
  removeBoard: removeBoard,
  scanBoards: scanBoards
};
