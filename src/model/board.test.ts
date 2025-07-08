import { assignQueens, generateBoard, generateDomains, domains } from './board';
import { create } from '../utils/lcg';

describe('assignQueens', () => {
  it('should return an array of 8 coordinates from 1 to 8', () => {
    const result = assignQueens(8, create(1n).rand);
    expect(result).toHaveLength(8);
    expect(result).toEqual([3, 1, 4, 7, 2, 6, 0, 5]);
  });

  it('should return a permutation of [0..size-1]', () => {
    const size = 6;
    const result = assignQueens(size, create(2n).rand);
    expect(result).toHaveLength(size);
    expect([...result].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('should not place queens on the same diagonal', () => {
    const size = 6;
    const result = assignQueens(size, create(1n).rand);
    for (let i = 0; i < size - 1; i++) {
      expect(Math.abs(result[i] - result[i + 1])).not.toBe(1);
    }
  });
});

describe('generateBoard', () => {
  it('should generate a board of correct size', () => {
    const size = 5;
    const board = generateBoard(size, 42);
    expect(board).toHaveLength(size);
    board.forEach((row) => expect(row).toHaveLength(size));
  });

  it('should mark exactly one queen per row', () => {
    const size = 7;
    const board = generateBoard(size, 123);
    for (let row = 0; row < size; row++) {
      const queensInRow = board[row].filter((cell) => cell.isQueen);
      expect(queensInRow).toHaveLength(1);
    }
  });

  it('should mark exactly one queen per column', () => {
    const size = 7;
    const board = generateBoard(size, 123);
    for (let col = 0; col < size; col++) {
      let queensInCol = 0;
      for (let row = 0; row < size; row++) {
        if (board[row][col].isQueen) queensInCol++;
      }
      expect(queensInCol).toBe(1);
    }
  });
});

describe('generateDomains', () => {
  it('should assign all cells to a queen domain', () => {
    const queens = assignQueens(8, create(5n).rand);
    const board = generateDomains(queens, create(5n).rand);
    board.forEach((row) =>
      row.forEach((cell) => {
        expect(typeof cell.queenId).toBe('number');
        expect(cell.queenId).toBeGreaterThanOrEqual(0);
        expect(cell.queenId).toBeLessThan(8);
      })
    );
  });

  it('should mark queen cells correctly', () => {
    const queens = assignQueens(8, create(6n).rand);
    const board = generateDomains(queens, create(6n).rand);
    board.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (queens[r] === c) {
          expect(cell.isQueen).toBe(true);
        } else {
          expect(cell.isQueen).toBe(false);
        }
      });
    });
  });
});

describe('domains', () => {
  it('should visit each domain exactly once', () => {
    const size = 6;
    const queens = assignQueens(size, create(7n).rand);
    const board = generateDomains(queens, create(7n).rand);
    const seen: number[] = [];
    for (const domain of domains(board)) {
      seen.push(domain.queenId);
    }
    expect(seen.sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5]);
  });
});

describe('forEachCellInDomain', () => {
  it('should visit all cells in a domain', () => {
    const size = 6;
    const queens = assignQueens(size, create(8n).rand);
    const board = generateDomains(queens, create(8n).rand);
    for (const domain of domains(board)) {
      // All cells in the domain should have the same queenId
      domain.cells.forEach((cell) => {
        expect(board[cell.row][cell.col].queenId).toBe(domain.queenId);
      });
      expect(domain.cells.length).toBeGreaterThan(0);
    }
  });
});
