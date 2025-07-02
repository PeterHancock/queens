import { describe, it, expect } from 'vitest';
import { assignQueens, generate } from './board';
import { create } from '../utils/lcg';

describe('assignQueens', () => {
  it('should return an array of 8 coordinates from 1 to 8', () => {
    const result = assignQueens(create(1n).rand);
    expect(result).toHaveLength(8);
    expect(result).toEqual([3, 1, 4, 7, 2, 6, 0, 5]);

    for (let i = 0; i < result.length; i++) {
      console.log('  '.repeat(result[i]), '* ', );
    }

  });

  it('should have only unique values', () => {
    const result = assignQueens();
    const unique = Array.from(new Set(result));
    expect(unique).toHaveLength(8);
  });
});

describe('generate', () => {
  it('should throw "Not implemented yet" error', () => {
    expect(() => generate()).toThrowError('Not implemented yet');
  });
});