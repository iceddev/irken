'use strict';

var _ = require('lodash');
var when = require('when');

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

function compile(options){
  var type = options.type || getFallbackType();
  var Board = this._boards[type];
  return Board.compile(options.source);
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

function scanBoards(options){
  var self = this;
  var opts = options || {};
  var delay = opts.delay || 0;
  var targetBoards, targetTypes;
  if(opts.type){
    targetBoards = [this._boards[opts.type]];
    targetTypes = [opts.type];
  }else{
    targetBoards = _.values(this._boards);
    targetTypes = _.keys(this._boards);
  }

  return this.releaseAllBoards()
    .delay(delay)
    .then(function(){
      self._devices = {};
      return when.reduce(targetBoards, function(boardList, board, ix){
        return board.search(opts)
          .then(function(newBoards){
            _.forEach(newBoards, function(boardInfo){
              boardInfo.type = targetTypes[ix];
            });
            return boardList.concat(newBoards);
          });
      }, []);
  });
}

function getOpenBoards(){
  return _.filter(this._devices, function(device){
    return device.isOpen();
  });
}

function releaseAllBoards(){
  var closingDevices = _.map(this.getOpenBoards(), function(device){
    return device.close();
  });

  return when.settle(closingDevices);
}

module.exports = {
  addBoard: addBoard,
  compile: compile,
  getBoard: getBoard,
  getOpenBoards: getOpenBoards,
  releaseAllBoards: releaseAllBoards,
  removeBoard: removeBoard,
  scanBoards: scanBoards
};
