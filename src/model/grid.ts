import type { Grid, Sizes } from './types';

export const createGrid = <T>(
  size: Sizes,
  createCell: (row: number, col: number) => T
): Grid<T> =>
  Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => createCell(row, col))
  );

export const createUniformGrid = <T>(size: Sizes, t: T): Grid<T> =>
  createGrid(size, () => t);

export function* cells<T>(grid: Grid<T>): Generator<[T, number, number]> {
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid.length; col++) {
      yield [grid[row][col], row, col];
    }
  }
}
