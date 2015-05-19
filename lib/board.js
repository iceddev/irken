'use strict';

var _ = require('lodash');
var when = require('when');
var nodefn = require('when/node');
var Serialport = require('browser-serialport');

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
  var Board = this._boards[options.type];
  return new Board(options.board);
}

function generateEmptyPortlist(portList){
  return _.map(portList, function(port){
    return {
      name: null,
      path: port,
      board: {
        path: port
      }
    };
  });
}

function scanBoards(options){
  var opts = options || {};
  var targetBoards, targetTypes;
  if(opts.type){
    targetBoards = [this._boards[opts.type]];
    targetTypes = [opts.type];
  }else{
    targetBoards = _.values(this._boards);
    targetTypes = _.keys(this._boards);
  }
  return this.listPorts()
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
