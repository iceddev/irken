'use strict';

function addBoard(name, board){
  this._boards[name] = board;
}

function removeBoard(name){
  delete this._boards[name];
}

module.exports = {
  addBoard: addBoard,
  removeBoard: removeBoard
};
