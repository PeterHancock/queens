import type { Tuple } from "../utils/types";

const base = [
  0,
  1,
  2,
  3,
  4,
  5,
  6,
   7,
  // 8,
  // 9,
  // 10
  // ,11,
  // 12,
  // 13,14,15
] as const;

export type Size = typeof base.length;

export const size: Size = base.length;

export type Coord = typeof base[number];

export const coords: Tuple<Coord, Size> = base as Tuple<Coord, Size>;

export type GridCell = {
  row: Coord;
  col: Coord;
  queenId: Coord;
  isQueen: boolean;
}

export type Grid<T> = Tuple<Tuple<T, Size>, Size>;

export type Board = Grid<GridCell>;

export type Queens = Tuple<Coord, Size>;

export type Domain = {
  queenId: Coord;
  cellMap: Record<number, Record<number, GridCell>>;
}



