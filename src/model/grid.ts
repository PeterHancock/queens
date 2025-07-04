import type { Coord, Grid } from './types';

import { coords } from './types';

export const createGrid = <T>(
  createCell: (row: Coord, col: Coord) => T
): Grid<T> =>
  coords.map((row) => coords.map((col) => createCell(row, col))) as Grid<T>;

export const createUniformGrid = <T>(t: T): Grid<T> => createGrid(() => t);

export const forEachCell = <T>(
  grid: Grid<T>,
  callback: (cell: T, row: Coord, col: Coord) => void
): void => {
  for (let row = 0; row < coords.length; row++) {
    for (let col = 0; col < coords.length; col++) {
      callback(grid[row][col], row as Coord, col as Coord);
    }
  }
};
