import { create } from "../utils/lcg";
import { random } from "../utils/random";
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
 // 8,9,10,11,12,13,14,15
] as const;

type Size = typeof base.length;

const size: Size = base.length;

type Coord = typeof base[number];

const coords: Tuple<Coord, Size> = base as Tuple<Coord, Size>;

type GridCell = {
  row: Coord;
  col: Coord;
  queenId: Coord;
  isQueen: boolean;
}

type Grid<T> = Tuple<Tuple<T, Size>, Size>;

export type Board = Grid<GridCell>;

type Queens = Tuple<Coord, Size>;

const checkQueens = (order: Queens): boolean => {
  let j = -2;
  for (let i = 0; i < order.length; i++) {
    if (order[i] - j === 1 || order[i] - j === -1) {
      return false; // queens are in the same diagonal
    }
    j = order[i];
  }
  return true;
}

export const assignQueens = (pick?: () => number): Queens => {
  const shuf = random(pick).shuffleT;

  let shuffledCoords = shuf<Coord, Size>(coords);

  do {
    shuffledCoords = shuf<Coord, Size>(shuffledCoords);
  } while ((!checkQueens(shuffledCoords)))

  return shuffledCoords as Queens;
}

const getNeighbors = (row: Coord, col: Coord): [Coord, Coord][] => {
  const neighbors: [Coord, Coord][] = [];
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue; // skip the cell itself
      const newRow = row + i;
      const newCol = col + j;
      if (newRow >= 0 && newRow < coords.length && newCol >= 0 && newCol < coords.length) {
        neighbors.push([newRow as Coord, newCol as Coord]);
      }
    }
  }
  return neighbors;
}

export const generateBoard = (queens: Queens, pick?: () => number): Board => {
  const rand = random(pick).rand;

  const board: Grid<Coord | null> = coords.map(() => coords.map(() => null)) as Grid<Coord | null>;

  const bordered: Set<number> = new Set();

  queens.forEach((queenId, row) => {
    board[row][queenId] = queenId;
    const neighbors = getNeighbors(row as Coord, queenId);
    neighbors.forEach(([nRow, nCol]) => {
      bordered.add(nRow * size + nCol);
    });
  });

  dumpBoard2(board);


  while (bordered.size > 0) { // limit iterations to prevent infinite loop
    const choice = rand(bordered.size);
    const index = [...bordered][choice];

    const [row, col] = [Math.floor(index / size), index % size] as [Coord, Coord];
    const neighbors = getNeighbors(row, col);

    const occupiedNeighbors = neighbors.filter(([nRow, nCol]) => board[nRow][nCol] !== null);

    const [nRow, nCol] = occupiedNeighbors[rand(occupiedNeighbors.length)];

    board[row][col] = board[nRow][nCol];

    bordered.delete(index);
    neighbors.forEach(([nRow, nCol]) => {
      if (board[nRow][nCol] === null) {
        bordered.add(nRow * size + nCol);
      }
    });
  }

  const regions: Board = coords.map((row) => coords.map((col) => ({
    row,
    col,
    queenId: board[row][col]!,
    isQueen: queens[col] === row,
  }))) as Board;


  dumpBoard(regions);


  return regions;
}

const dumpBoard = (board: Board): void => {
  for (let i = 0; i < size; i++) {
    console.log(board[i].map(cell => cell.queenId).join(' '));
  }
}

const dumpBoard2 = (board: Grid<Coord | null>): void => {
  for (let i = 0; i < size; i++) {
    console.log(board[i].join('  '));
  }
}

export const generate = (pick: () => number = create(0n).rand): Board => {

  const queens = assignQueens(pick);

  const board = generateBoard(queens, pick);

  return board;
};