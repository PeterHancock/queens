import { create } from '../utils/lcg';
import { random } from '../utils/random';
import type { Queens, Board, Grid, Domain, Sizes } from './types';
import { createUniformGrid, createGrid, cells } from './grid';

const checkQueens = (order: Queens): boolean => {
  let j = -2;
  for (let i = 0; i < order.length; i++) {
    if (order[i] - j === 1 || order[i] - j === -1) {
      return false; // queens are in the same diagonal
    }
    j = order[i];
  }
  return true;
};

export const assignQueens = (size: Sizes, pick?: () => number): Queens => {
  const shuf = random(pick).shuffle;

  let shuffledCoords = shuf(Array.from({ length: size }, (_, i) => i));

  do {
    shuffledCoords = shuf(shuffledCoords);
  } while (!checkQueens(shuffledCoords));

  return shuffledCoords as Queens;
};

const getNeighbors = (
  size: Sizes,
  row: number,
  col: number
): [number, number][] => {
  const neighbors: [number, number][] = [];
  if (row > 0) {
    neighbors.push([(row - 1) as number, col]);
  }
  if (col > 0) {
    neighbors.push([row, (col - 1) as number]);
  }
  if (row < size - 1) {
    neighbors.push([(row + 1) as number, col]);
  }
  if (col < size - 1) {
    neighbors.push([row, (col + 1) as number]);
  }

  return neighbors;
};

export const generateDomains = (queens: Queens, pick?: () => number): Board => {
  const rand = random(pick).rand;

  const size = queens.length as Sizes;

  const board: Grid<number | null> = createUniformGrid(size, null);

  const bordered: Set<number> = new Set();

  queens.forEach((queenId, row) => {
    board[row][queenId] = queenId;
    const neighbors = getNeighbors(size, row, queenId);
    neighbors.forEach(([nRow, nCol]) => {
      bordered.add(nRow * size + nCol);
    });
  });

  while (bordered.size > 0) {
    const choice = rand(bordered.size);
    const index = [...bordered][choice];

    const [row, col] = [Math.floor(index / size), index % size];
    const neighbors = getNeighbors(size, row, col);

    const occupiedNeighbors = neighbors.filter(
      ([nRow, nCol]) => board[nRow][nCol] !== null
    );

    const [nRow, nCol] = occupiedNeighbors[rand(occupiedNeighbors.length)];

    board[row][col] = board[nRow][nCol];

    bordered.delete(index);

    neighbors.forEach(([nRow, nCol]) => {
      if (board[nRow][nCol] === null) {
        bordered.add(nRow * size + nCol);
      }
    });
  }

  const finalGrid: Board = createGrid(size, (row, col) => ({
    row,
    col,
    queenId: board[row][col]!,
    isQueen: queens[row] === col,
  }));

  return finalGrid;
};

export function* domains(board: Board): Generator<Domain> {
  const domains: Record<number, Domain> = {} as Record<number, Domain>;

  for (const [cell] of cells(board)) {
    const domain: Domain = (domains[cell.queenId] =
      domains[cell.queenId] || {});
    domain.queenId = cell.queenId;
    domain.cells = domain.cells || [];
    domain.cells.push(cell);
    domain.cellMap = domain.cellMap || {};
    domain.cellMap[cell.row] = domain.cellMap[cell.row] || {};
    domain.cellMap[cell.row][cell.col] = cell;
  }

  yield* Object.values(domains);
}

export const generateBoard = (size: Sizes, seed = 0): Board => {
  const pick = create(BigInt(seed)).rand;
  const queens = assignQueens(size, pick);
  const board = generateDomains(queens, pick);
  return board;
};
