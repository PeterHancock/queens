import { forEachCellInDomain, forEachDomain } from './board';
import { forEachCell } from './grid';
import type { SelectionGrid } from './selected';
import type { Board, Coord, Domain } from './types';

const foundSolution = (board: Board, selectionGrid: SelectionGrid): boolean => {
  const size = board.length;

  let numQueens = 0;
  const rows: Set<Coord> = new Set();
  const cols: Set<Coord> = new Set();

  forEachCell(selectionGrid, (cell, row, col) => {
    if (cell === 2) {
      // Selected
      numQueens++;
    }
    rows.add(row);
    cols.add(col);
  });

  return numQueens === size && rows.size === size && cols.size === size;
};

export type InvalidSections = {
  invalidDomains: Domain[];
  invalidRows: Coord[];
  invalidCols: Coord[];
  invalidDiagonals: [Coord, Coord][];
};

type ValidationResult = InvalidSections | null | true;

export const validateSelection = (
  board: Board,
  selected: SelectionGrid
): ValidationResult => {
  const invalidDomains: Set<Domain> = new Set();

  const queens: Record<number, Set<number>> = {};

  const rows: Record<number, number> = {};
  const cols: Record<number, number> = {};

  forEachDomain(board, (domain) => {
    let queenInDomain = false;
    forEachCellInDomain(domain, (cell) => {
      const { row, col } = cell;
      if (selected[row][col] === 2) {
        rows[row] = (rows[row] || 0) + 1;
        cols[col] = (cols[col] || 0) + 1;
        queens[row] = queens[row] || new Set();
        queens[row].add(col);
        if (queenInDomain) {
          invalidDomains.add(domain);
        }
        queenInDomain = true;
      }
    });
  });

  const invalidRows = Object.entries(rows)
    .filter(([, count]) => count > 1)
    .map(([row]) => parseInt(row) as Coord);
  const invalidCols = Object.entries(cols)
    .filter(([, count]) => count > 1)
    .map(([col]) => parseInt(col) as Coord);

  const invalidDiagonals: [Coord, Coord][] = [];

  Object.entries(queens).forEach(([rowS, cols]) => {
    const row = parseInt(rowS) as Coord;
    cols.forEach((col) => {
      if (
        queens[row - 1]?.has(col - 1) ||
        queens[row - 1]?.has(col + 1) ||
        queens[row + 1]?.has(col - 1) ||
        queens[row + 1]?.has(col + 1)
      ) {
        invalidDiagonals.push([row, col as Coord]);
      }
    });
    const colCount = Object.keys(cols).length;
    return colCount > 1;
  });

  if (
    invalidRows.length === 0 &&
    invalidCols.length === 0 &&
    invalidDomains.size === 0 &&
    invalidDiagonals.length === 0
  ) {
    return foundSolution(board, selected) ? true : null;
  }

  return {
    invalidDomains: Array.from(invalidDomains),
    invalidRows,
    invalidCols,
    invalidDiagonals,
  };
};
