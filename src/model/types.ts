export type Sizes = 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;

export type GridCell = {
  row: number;
  col: number;
  queenId: number;
  isQueen: boolean;
};

export type Grid<T> = Array<Array<T>>;

export type Board = Grid<GridCell>;

export type Queens = Array<number>;

export type Domain = {
  queenId: number;

  cells: GridCell[];

  cellMap: Record<number, Record<number, GridCell>>;
};
