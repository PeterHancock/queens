import { createUniformGrid } from './grid';
import type { Grid, Sizes } from './types';

type CellSelect = 0 | 1 | 2;

export type SelectionGrid = Grid<CellSelect>;

export const createInitial = (size: Sizes): SelectionGrid =>
  createUniformGrid<CellSelect>(size, 0);

export const toggle = (
  grid: SelectionGrid,
  row: number,
  col: number
): SelectionGrid => {
  const current = grid[row][col];
  const next = ((current + 1) % 3) as CellSelect;
  grid[row][col] = next;
  return grid;
};
