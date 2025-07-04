import { forEachCellInDomain, forEachDomain } from '../model/board';
import { forEachCell } from '../model/grid';
import type { InvalidSections } from '../model/rules';
import type { SelectionGrid } from '../model/selected';
import { coords, type Board, type Coord, type Domain } from '../model/types';

import { drawCrown } from './draw-crown';

const drawQueen = false;

const queenColor = '#0007';

const colors = [
  '#ffadad',
  '#ffd6a5',
  '#fdffb6',
  '#caffbf',
  '#9bf6ff',
  '#a0c4ff',
  '#bdb2ff',
  '#ffc6ff',
  '#003f5c',
  '#2c4875',
  '#8a508f',
  '#bc5090',
  '#ff6361',
  '#ff8531',
  '#ffa600',
  '#ffd380',
];

const delta = 1 / 3;

const drawCross = (
  ctx: CanvasRenderingContext2D,
  row: number,
  col: number,
  cellSize: number,
  color: `#${string}`
): void => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo((col + delta) * cellSize, (row + delta) * cellSize);
  ctx.lineTo(
    col * cellSize + cellSize * (1 - delta),
    (row + 1 - delta) * cellSize
  );
  ctx.moveTo((col + 1 - delta) * cellSize, (row + delta) * cellSize);
  ctx.lineTo((col + delta) * cellSize, (row + 1 - delta) * cellSize);
  ctx.stroke();
  ctx.restore();
};

export const drawCell = (
  ctx: CanvasRenderingContext2D,
  board: Board,
  width: number,
  row: number,
  col: number,
  selected: 0 | 1 | 2
): void => {
  const size = board.length;
  const cellSize = width / size;

  const cell = board[row][col];

  ctx.fillStyle = colors[cell.queenId];

  ctx.fillRect(
    col * cellSize + 2,
    row * cellSize + 2,
    cellSize - 4,
    cellSize - 4
  );

  if (drawQueen && cell.isQueen) {
    ctx.fillStyle = queenColor;
    ctx.fillRect(
      col * cellSize + 2,
      row * cellSize + 2,
      cellSize - 4,
      cellSize - 4
    );
  }

  switch (selected) {
    case 0:
      return;
    case 1:
      drawCross(ctx, row, col, cellSize, '#0005');
      break;
    case 2:
      drawCrown(ctx, row, col, cellSize, '#000b');
      break;
  }
};
export const drawSelected = (
  ctx: CanvasRenderingContext2D,
  board: Board,
  selected: SelectionGrid,
  width: number
): void => {
  forEachCell(selected, (cell, row, col) => {
    if (cell === 0) return; // Not selected
    drawCell(ctx, board, width, row, col, cell);
  });
};

const drawDomainOutline = (
  ctx: CanvasRenderingContext2D,
  domain: Domain,
  cellSize: number
): void => {
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;

  forEachCellInDomain(domain, (cell) => {
    const { row, col } = cell;

    if (!domain.cellMap[row - 1]?.[col]) {
      ctx.beginPath();
      ctx.moveTo(col * cellSize, row * cellSize);
      ctx.lineTo((col + 1) * cellSize, row * cellSize);
      ctx.stroke();
    }

    if (!domain.cellMap[row]?.[col - 1]) {
      ctx.beginPath();
      ctx.moveTo(col * cellSize, row * cellSize);
      ctx.lineTo(col * cellSize, (row + 1) * cellSize);
      ctx.stroke();
    }
  });
};

export const drawInvalidSections = (
  ctx: CanvasRenderingContext2D,
  board: Board,
  width: number,
  invalidSections: InvalidSections
): void => {
  const invalidCells: Record<number, Set<Coord>> = {};

  const addInvalidCell = (row: Coord, col: Coord) => {
    if (!invalidCells[row]) {
      invalidCells[row] = new Set();
    }
    invalidCells[row].add(col);
  };

  invalidSections.invalidDomains.forEach((domain) => {
    forEachCellInDomain(domain, (cell) => {
      addInvalidCell(cell.row, cell.col);
    });
  });

  invalidSections.invalidRows.forEach((row) => {
    coords.forEach((col) => {
      addInvalidCell(row, col);
    });
  });

  invalidSections.invalidCols.forEach((col) => {
    coords.forEach((row) => {
      addInvalidCell(row, col);
    });
  });

  invalidSections.invalidDiagonals.forEach(([row, col]) => {
    addInvalidCell(row, col);
  });

  const flatCells = Object.entries(invalidCells).flatMap(([row, cols]) => {
    return Array.from(cols).map((col) => ({
      row: parseInt(row) as Coord,
      col: col as Coord,
    }));
  });

  drawDomainShade(ctx, board, width, flatCells);
};

export const drawDomainShade = (
  ctx: CanvasRenderingContext2D,
  board: Board,
  width: number,
  cells: { row: Coord; col: Coord }[]
): void => {
  const size = board.length;
  const cellSize = width / size;

  // Create a diagonal stripe pattern
  const patternCanvas = document.createElement('canvas');
  patternCanvas.width = 12;
  patternCanvas.height = 12;
  const pctx = patternCanvas.getContext('2d')!;
  pctx.fillStyle = '#0000'; // Transparent background
  pctx.fillRect(0, 0, 12, 12);
  pctx.strokeStyle = '#f006';
  pctx.lineWidth = 2;
  pctx.beginPath();
  pctx.moveTo(-2, 14);
  pctx.lineTo(14, -2);
  pctx.stroke();

  const pattern = ctx.createPattern(patternCanvas, 'repeat');
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.fillStyle = pattern!;
  cells.forEach((cell) => {
    const { row, col } = cell;
    ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
  });
  ctx.restore();
};

const drawGridLines = (
  ctx: CanvasRenderingContext2D,
  size: number,
  cellSize: number
): void => {
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  for (let i = 0; i <= size; i++) {
    // Horizontal lines
    ctx.beginPath();
    ctx.moveTo(0, i * cellSize);
    ctx.lineTo(size * cellSize, i * cellSize);
    ctx.stroke();

    // Vertical lines
    ctx.beginPath();
    ctx.moveTo(i * cellSize, 0);
    ctx.lineTo(i * cellSize, size * cellSize);
    ctx.stroke();
  }
};

export const drawBoard = (
  ctx: CanvasRenderingContext2D,
  board: Board,
  width: number
): void => {
  const size = board.length;
  const cellSize = width / size;

  ctx.clearRect(0, 0, width, width);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, width, width);

  forEachCell(board, (cell, row, col) => {
    ctx.fillStyle = colors[cell.queenId];
    ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
    if (drawQueen && cell.isQueen) {
      ctx.fillStyle = queenColor;
      ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
    }
  });

  forEachDomain(board, (domain) => {
    drawDomainOutline(ctx, domain, cellSize);
  });

  drawGridLines(ctx, size, cellSize);
};

export const getCoordinates = (
  event: React.MouseEvent<HTMLCanvasElement>,
  board: Board,
  width: number,
  offset: number
): [number, number] => {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left - offset;
  const y = event.clientY - rect.top - offset;

  const cellSize = width / board.length;
  const col = Math.floor(x / cellSize);
  const row = Math.floor(y / cellSize);

  if (col < 0 || col >= board.length || row < 0 || row >= board.length) {
    return [-1, -1]; // Out of bounds
  }

  return [row, col];
};
