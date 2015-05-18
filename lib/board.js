'use strict';

function addBoard(type, Board){
  this._boards[type] = Board;
}

function removeBoard(type){
  delete this._boards[type];
}

module.exports = {
  addBoard: addBoard,
  removeBoard: removeBoard
};
