import {
  validateSelection,
  type InvalidSections,
  type ValidationResult,
} from './rules';
import { domains, generateBoard } from './board';
import { createInitial, type SelectionGrid } from './selected';
import type { Board, Domain, GridCell, Sizes } from './types';
import { cells } from './grid';

// Helper function to create a test board
const createTestBoard = (size: Sizes): Board => {
  return generateBoard(size, 12345);
};

// Helper function to create a selection grid with specific queen placements
const createSelectionWithQueens = (
  size: Sizes,
  queenPositions: [number, number][]
): SelectionGrid => {
  const selection = createInitial(size);

  // Place queens (value 2) at specified positions
  queenPositions.forEach(([row, col]) => {
    selection[row][col] = 2;
  });

  return selection;
};

// Helper function to create a selection grid with blocked cells
const createSelectionWithBlocks = (
  size: Sizes,
  blockedPositions: [number, number][]
): SelectionGrid => {
  const selection = createInitial(size);

  // Place blocks (value 1) at specified positions
  blockedPositions.forEach(([row, col]) => {
    selection[row][col] = 1;
  });

  return selection;
};

// Helper function to create a complete board for testing different states
const createCompleteSelection = (size: Sizes): SelectionGrid => {
  const selection = createInitial(size);

  // Fill entire board with blocks (value 1) for testing "cleared" state
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      selection[row][col] = 1;
    }
  }

  return selection;
};

const expectInvalidState: (
  result: ValidationResult
) => asserts result is InvalidSections = (result) => {
  expect(result.state).toBe('invalid');
};

describe('validateSelection', () => {
  describe('Cleared State', () => {
    it('should return cleared state when all cells are empty (value 0)', () => {
      const board = createTestBoard(5);
      const selection = createInitial(5);

      const result = validateSelection(board, selection);

      expect(result).toEqual({ state: 'cleared' });
    });

    it('should return cleared state for different board sizes', () => {
      const sizes: Sizes[] = [6, 8, 10];
      for (const size of sizes) {
        const board = createTestBoard(size);
        const selection = createInitial(size);

        const result = validateSelection(board, selection);

        expect(result).toEqual({ state: 'cleared' });
      }
    });
  });

  describe('Started State', () => {
    it('should return started state when some cells are selected but not solved', () => {
      const board = createTestBoard(5);
      const selection = createSelectionWithQueens(5, [
        [0, 0],
        [1, 2],
      ]);

      const result = validateSelection(board, selection);

      expect(result).toEqual({ state: 'started' });
    });

    it('should return started state when some cells are blocked', () => {
      const board = createTestBoard(5);
      const selection = createSelectionWithBlocks(5, [
        [0, 0],
        [1, 1],
        [2, 2],
      ]);

      const result = validateSelection(board, selection);

      expect(result).toEqual({ state: 'started' });
    });

    it('should return started state with mixed selections', () => {
      const board = createTestBoard(6);
      const selection = createInitial(6);

      // Mix of queens and blocks
      selection[0][0] = 2; // Queen
      selection[1][1] = 1; // Block
      selection[2][3] = 2; // Queen
      selection[3][2] = 1; // Block

      const result = validateSelection(board, selection);

      expect(result).toEqual({ state: 'started' });
    });
  });

  describe('Solved State', () => {
    it('should return solved state when exactly the right number of queens are placed validly', () => {
      const board = createTestBoard(5);

      const queens: [number, number][] = [...cells(board)].flatMap(([cell]) =>
        cell.isQueen ? [[cell.row, cell.col]] : []
      );

      const selection = createSelectionWithQueens(5, [...queens]);

      const result = validateSelection(board, selection);

      expect(result).toEqual({ state: 'solved' });
    });
  });

  describe('Invalid State - Row Conflicts', () => {
    it('should detect multiple queens in the same row', () => {
      const board = createTestBoard(5);
      const selection = createSelectionWithQueens(5, [
        [0, 0],
        [0, 2],
        [1, 1], // Two queens in row 0
      ]);

      const result = validateSelection(board, selection);

      expect(result.state).toBe('invalid');
      if (result.state === 'invalid') {
        expect(result.invalidRows).toContain(0);
        expect(result.invalidRows).toHaveLength(1);
      }
    });

    it('should detect multiple row conflicts', () => {
      const board = createTestBoard(6);
      const selection = createSelectionWithQueens(6, [
        [0, 0],
        [0, 2], // Two queens in row 0
        [1, 1],
        [1, 3], // Two queens in row 1
        [2, 4],
      ]);

      const result = validateSelection(board, selection);

      expectInvalidState(result);
      expect(result.invalidRows).toContain(0);
      expect(result.invalidRows).toContain(1);
      expect(result.invalidRows).toHaveLength(2);
    });

    it('should detect three queens in the same row', () => {
      const board = createTestBoard(5);
      const selection = createSelectionWithQueens(5, [
        [0, 0],
        [0, 2],
        [0, 4], // Three queens in row 0
      ]);

      const result = validateSelection(board, selection);

      expectInvalidState(result);
      expect(result.invalidRows).toContain(0);
    });
  });

  describe('Invalid State - Column Conflicts', () => {
    it('should detect multiple queens in the same column', () => {
      const board = createTestBoard(5);
      const selection = createSelectionWithQueens(5, [
        [0, 0],
        [2, 0],
        [1, 1], // Two queens in column 0
      ]);

      const result = validateSelection(board, selection);

      expect(result.state).toBe('invalid');
      expectInvalidState(result);
      expect(result.invalidCols).toContain(0);
      expect(result.invalidCols).toHaveLength(1);
    });

    it('should detect multiple column conflicts', () => {
      const board = createTestBoard(6);
      const selection = createSelectionWithQueens(6, [
        [0, 0],
        [2, 0], // Two queens in column 0
        [1, 1],
        [3, 1], // Two queens in column 1
        [4, 2],
      ]);

      const result = validateSelection(board, selection);

      expectInvalidState(result);
      expect(result.invalidCols).toContain(0);
      expect(result.invalidCols).toContain(1);
      expect(result.invalidCols).toHaveLength(2);
    });
  });

  describe('Invalid State - Diagonal Conflicts', () => {
    it('should detect diagonal conflicts (down-right)', () => {
      const board = createTestBoard(5);
      const selection = createSelectionWithQueens(5, [
        [0, 0],
        [1, 1], // Diagonal conflict
      ]);

      const result = validateSelection(board, selection);

      expectInvalidState(result);
      expect(result.invalidDiagonals).toContainEqual([0, 0]);
      expect(result.invalidDiagonals).toContainEqual([1, 1]);
    });

    it('should detect diagonal conflicts (down-left)', () => {
      const board = createTestBoard(5);
      const selection = createSelectionWithQueens(5, [
        [0, 2],
        [1, 1], // Diagonal conflict
      ]);

      const result = validateSelection(board, selection);

      expectInvalidState(result);
      expect(result.invalidDiagonals).toContainEqual([0, 2]);
      expect(result.invalidDiagonals).toContainEqual([1, 1]);
    });

    it('should detect diagonal conflicts (up-right)', () => {
      const board = createTestBoard(5);
      const selection = createSelectionWithQueens(5, [
        [1, 0],
        [0, 1], // Diagonal conflict
      ]);

      const result = validateSelection(board, selection);

      expectInvalidState(result);
      expect(result.invalidDiagonals).toContainEqual([0, 1]);
      expect(result.invalidDiagonals).toContainEqual([1, 0]);
    });

    it('should detect diagonal conflicts (up-left)', () => {
      const board = createTestBoard(5);
      const selection = createSelectionWithQueens(5, [
        [1, 2],
        [0, 1], // Diagonal conflict
      ]);

      const result = validateSelection(board, selection);

      expectInvalidState(result);
      if (result.state === 'invalid') {
        expect(result.invalidDiagonals).toContainEqual([0, 1]);
        expect(result.invalidDiagonals).toContainEqual([1, 2]);
      }
    });

    it('should detect multiple diagonal conflicts', () => {
      const board = createTestBoard(6);
      const selection = createSelectionWithQueens(6, [
        [0, 0],
        [1, 1], // Diagonal pair 1
        [2, 2],
        [3, 3], // Diagonal pair 2
      ]);

      const result = validateSelection(board, selection);

      expectInvalidState(result);
      if (result.state === 'invalid') {
        expect(result.invalidDiagonals.length).toBeGreaterThanOrEqual(4);
      }
    });
  });

  const gridCellToCoordinates = (cell: GridCell): [number, number] => {
    return [cell.row, cell.col];
  };

  describe('Invalid State - Domain Conflicts', () => {
    it('should detect multiple queens in the same domain', () => {
      const board = createTestBoard(5);

      let invalidDomain: Domain | null = null;

      for (const domain of domains(board)) {
        if (domain.cells.length < 2) continue;
        invalidDomain = domain;
        break;
      }

      if (invalidDomain) {
        const selection = createSelectionWithQueens(5, [
          gridCellToCoordinates(invalidDomain.cells[0]),
          gridCellToCoordinates(invalidDomain.cells[1]),
        ]);

        const result = validateSelection(board, selection);

        expectInvalidState(result);
        expect(result.invalidDomains.length).toBe(1);
        expect(result.invalidDomains[0].queenId).toBe(invalidDomain.queenId);
      }
    });

    it('should detect multiple domain conflicts', () => {
      const board = createTestBoard(6);

      const invalidDomains: Domain[] = [...domains(board)].filter(
        (domain) => domain.cells.length > 1
      );

      if (invalidDomains.length < 2) {
        fail('Not enough invalid domains to test multiple conflicts');
      }

      const selection = createSelectionWithQueens(
        6,
        invalidDomains.flatMap((domain) => [
          gridCellToCoordinates(domain.cells[0]),
          gridCellToCoordinates(domain.cells[1]),
        ])
      );

      const result = validateSelection(board, selection);

      expectInvalidState(result);

      expect(result.invalidDomains).toHaveLength(invalidDomains.length);
    });
  });

  describe('Invalid State - Multiple Conflict Types', () => {
    it('should detect both row and column conflicts', () => {
      const board = createTestBoard(5);
      const selection = createSelectionWithQueens(5, [
        [0, 0],
        [0, 1], // Row conflict in row 0
        [1, 0],
        [2, 0], // Column conflict in column 0
      ]);

      const result = validateSelection(board, selection);

      expectInvalidState(result);
      expect(result.invalidRows).toContain(0);
      expect(result.invalidCols).toContain(0);
    });

    it('should detect row, column, and diagonal conflicts', () => {
      const board = createTestBoard(6);
      const selection = createSelectionWithQueens(6, [
        [0, 0],
        [0, 1], // Row conflict in row 0
        [1, 0],
        [2, 0], // Column conflict in column 0
        [3, 3],
        [4, 4], // Diagonal conflict
      ]);

      const result = validateSelection(board, selection);

      expectInvalidState(result);
      expect(result.invalidRows).toContain(0);
      expect(result.invalidCols).toContain(0);
      expect(result.invalidDiagonals).toContainEqual([3, 3]);
      expect(result.invalidDiagonals).toContainEqual([4, 4]);
    });

    it('should handle complex conflict scenarios', () => {
      const board = createTestBoard(8);
      const selection = createSelectionWithQueens(8, [
        [0, 0],
        [0, 1],
        [0, 2], // Multiple queens in row 0
        [1, 0],
        [2, 0],
        [3, 0], // Multiple queens in column 0
        [4, 4],
        [5, 5], // Diagonal conflict
        [6, 6],
        [7, 7], // Another diagonal conflict
      ]);

      const result = validateSelection(board, selection);

      expectInvalidState(result);
      expect(result.invalidRows).toContain(0);
      expect(result.invalidCols).toContain(0);
      expect(result.invalidDiagonals.length).toBeGreaterThanOrEqual(4);
    });
  });
});

describe('Edge Cases', () => {
  it('should handle minimum board size (5x5)', () => {
    const board = createTestBoard(5);
    const selection = createInitial(5);

    const result = validateSelection(board, selection);

    expect(result).toEqual({ state: 'cleared' });
  });

  it('should handle single queen placement', () => {
    const board = createTestBoard(5);
    const selection = createSelectionWithQueens(5, [[2, 2]]);

    const result = validateSelection(board, selection);

    expect(result).toEqual({ state: 'started' });
  });

  it('should handle almost solved state (one queen missing)', () => {
    const board = createTestBoard(5);
    const queens: [number, number][] = [...cells(board)].flatMap(([cell]) =>
      cell.isQueen ? [[cell.row, cell.col]] : []
    );
    queens.pop(); // Remove one queen to simulate almost solved state
    const selection = createSelectionWithQueens(5, queens);

    const result = validateSelection(board, selection);

    expect(result).toEqual({ state: 'started' });
  });

  it('should handle board with all blocked cells', () => {
    const board = createTestBoard(5);
    const selection = createCompleteSelection(5);

    const result = validateSelection(board, selection);

    expect(result).toEqual({ state: 'started' });
  });
});

describe('Return Type Structure', () => {
  it('should return correct structure for invalid state', () => {
    const board = createTestBoard(5);
    const selection = createSelectionWithQueens(5, [
      [0, 0],
      [0, 1], // Row conflict
    ]);

    const result = validateSelection(board, selection);

    expect(result).toHaveProperty('state', 'invalid');
    expect(result).toHaveProperty('invalidDomains');
    expect(result).toHaveProperty('invalidRows');
    expect(result).toHaveProperty('invalidCols');
    expect(result).toHaveProperty('invalidDiagonals');

    expectInvalidState(result);

    expect(Array.isArray(result.invalidDomains)).toBe(true);
    expect(Array.isArray(result.invalidRows)).toBe(true);
    expect(Array.isArray(result.invalidCols)).toBe(true);
    expect(Array.isArray(result.invalidDiagonals)).toBe(true);
  });

  it('should return tuples for diagonal conflicts', () => {
    const board = createTestBoard(5);
    const selection = createSelectionWithQueens(5, [
      [0, 0],
      [1, 1], // Diagonal conflict
    ]);

    const result = validateSelection(board, selection);

    expectInvalidState(result);
    result.invalidDiagonals.forEach((diagonal) => {
      expect(Array.isArray(diagonal)).toBe(true);
      expect(diagonal).toHaveLength(2);
      expect(typeof diagonal[0]).toBe('number');
      expect(typeof diagonal[1]).toBe('number');
    });
  });
});
