import { domains } from './board';
import type { SelectionGrid } from './selected';
import type { Board, Domain } from './types';

export type InvalidSections = {
  state: 'invalid';
  invalidDomains: Domain[];
  invalidRows: number[];
  invalidCols: number[];
  invalidDiagonals: [number, number][];
};

export type ValidationResult =
  | InvalidSections
  | {
      state: 'solved' | 'started' | 'cleared';
    };

export const validateSelection = (
  board: Board,
  selected: SelectionGrid
): ValidationResult => {
  const invalidDomains: Set<Domain> = new Set();
  let numQueens = 0;
  let numEmpty = 0;
  const queens: Record<number, Set<number>> = {};

  const rows: Record<number, number> = {};
  const cols: Record<number, number> = {};

  for (const domain of domains(board)) {
    let queenInDomain = false;
    for (const cell of domain.cells) {
      const { row, col } = cell;
      if (selected[row][col] === 2) {
        numQueens++;
        rows[row] = (rows[row] || 0) + 1;
        cols[col] = (cols[col] || 0) + 1;
        queens[row] = queens[row] || new Set();
        queens[row].add(col);
        if (queenInDomain) {
          invalidDomains.add(domain);
        }
        queenInDomain = true;
      } else if (selected[row][col] === 0) {
        numEmpty++;
      }
    }
  }

  const invalidRows = Object.entries(rows)
    .filter(([, count]) => count > 1)
    .map(([row]) => parseInt(row));
  const invalidCols = Object.entries(cols)
    .filter(([, count]) => count > 1)
    .map(([col]) => parseInt(col));

  const invalidDiagonals: [number, number][] = [];

  Object.entries(queens).forEach(([rowS, cols]) => {
    const row = parseInt(rowS);
    cols.forEach((col) => {
      if (
        queens[row - 1]?.has(col - 1) ||
        queens[row - 1]?.has(col + 1) ||
        queens[row + 1]?.has(col - 1) ||
        queens[row + 1]?.has(col + 1)
      ) {
        invalidDiagonals.push([row, col]);
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
    return numQueens === board.length
      ? { state: 'solved' }
      : numEmpty === board.length * board.length
        ? { state: 'cleared' }
        : { state: 'started' };
  }

  return {
    state: 'invalid',
    invalidDomains: Array.from(invalidDomains),
    invalidRows,
    invalidCols,
    invalidDiagonals,
  };
};
