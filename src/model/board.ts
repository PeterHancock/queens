import { create } from '../utils/lcg';
import { random } from '../utils/random';
import type { Queens, Coord, Size, Board, Grid } from './types';
import { coords, size } from './types';
import { createUniformGrid, createGrid } from './grid';

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
  } while ((!checkQueens(shuffledCoords)));

  return shuffledCoords as Queens;
}

const getNeighbors = (row: Coord, col: Coord): [Coord, Coord][] => {
  const neighbors: [Coord, Coord][] = [];
  if (row > 0) {
    neighbors.push([row - 1 as Coord, col]);
  }
  if (col > 0) {
    neighbors.push([row, col - 1 as Coord]);
  }
  if (row < size - 1) {
    neighbors.push([row + 1 as Coord, col]);
  }
  if (col < size - 1) {
    neighbors.push([row, col + 1 as Coord]);
  }

  return neighbors;
}

export const generateBoard = (queens: Queens, pick?: () => number): Board => {
  const rand = random(pick).rand;

  const board: Grid<Coord | null> = createUniformGrid(null);

  const bordered: Set<number> = new Set();

  queens.forEach((queenId, row) => {
    board[row][queenId] = queenId;
    const neighbors = getNeighbors(row as Coord, queenId);
    neighbors.forEach(([nRow, nCol]) => {
      bordered.add(nRow * size + nCol);
    });
  });

  while (bordered.size > 0) {
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

  const finalGrid: Board = createGrid((row, col) => ({
    row,
    col,
    queenId: board[row][col]!,
    isQueen: queens[row] === col,
  }));

  return finalGrid;
}

export const generate = (seed = 0): Board => {
  const pick = create(BigInt(seed)).rand
  const queens = assignQueens(pick);
  const board = generateBoard(queens, pick);
  return board;
};
