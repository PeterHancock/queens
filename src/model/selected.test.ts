import { createInitial, toggle } from './selected';

describe('SelectionGrid', () => {
  describe('createInitial', () => {
    it('should create a grid of the correct size filled with 0', () => {
      const sizes = [5, 6, 8, 10] as const;
      for (const size of sizes) {
        const grid = createInitial(size);
        expect(grid.length).toBe(size);
        for (const row of grid) {
          expect(row.length).toBe(size);
          for (const cell of row) {
            expect(cell).toBe(0);
          }
        }
      }
    });
  });

  describe('toggle', () => {
    it('should cycle cell value from 0 -> 1 -> 2 -> 0', () => {
      const grid = createInitial(5);

      // Initial value should be 0
      expect(grid[2][3]).toBe(0);

      // Toggle once: 0 -> 1
      toggle(grid, 2, 3);
      expect(grid[2][3]).toBe(1);

      // Toggle again: 1 -> 2
      toggle(grid, 2, 3);
      expect(grid[2][3]).toBe(2);

      // Toggle again: 2 -> 0
      toggle(grid, 2, 3);
      expect(grid[2][3]).toBe(0);
    });

    it('should only affect the specified cell', () => {
      const grid = createInitial(5);
      toggle(grid, 1, 1);
      expect(grid[1][1]).toBe(1);
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          if (row === 1 && col === 1) continue;
          expect(grid[row][col]).toBe(0);
        }
      }
    });

    it('should mutate the original grid', () => {
      const grid = createInitial(5);
      const result = toggle(grid, 0, 0);
      expect(result).toBe(grid);
      expect(grid[0][0]).toBe(1);
    });
  });
});
