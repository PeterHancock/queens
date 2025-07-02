import { forEachCell } from "./grid";
import type { SelectionGrid } from "./selected";
import type { Board } from "./types";

export const foundSolution = (board: Board, selectionGrid: SelectionGrid): boolean => {
  const size = board.length;

  let numQueens = 0;
  forEachCell(selectionGrid, (cell) => {
    if (cell === 2) { // Selected
      numQueens++;
    } 
  });

  if (numQueens !== size) {
    return false; 
  }

  let found = true;
  forEachCell(selectionGrid, (cell, row, col) => {
     if (cell === 2) {
      found = found && board[row][col].isQueen;
     }
  });

  return found;
}
