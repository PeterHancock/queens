import { forEachCell } from '../model/grid';
import type { Board } from '../model/types';

import { drawCrown } from './draw-crown';

const drawQueen = false;

const queenColor = '#0007';

const colors = [
  '#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff',
  '#00202e', '#003f5c', '#2c4875', '#8a508f', '#bc5090', '#ff6361', '#ff8531', '#ffa600', '#ffd380'
];

const drawCross = (ctx: CanvasRenderingContext2D, row: number, col: number, cellSize: number, color: `#${string}`): void => {
  ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(col * cellSize + cellSize / 4, row * cellSize + cellSize / 4);
      ctx.lineTo(col * cellSize + 3 * cellSize / 4, row * cellSize + 3 * cellSize / 4);
      ctx.moveTo(col * cellSize + 3 * cellSize / 4, row * cellSize + cellSize / 4);
      ctx.lineTo(col * cellSize + cellSize / 4, row * cellSize + 3 * cellSize / 4);
      ctx.stroke();
      ctx.restore();
}   

export const drawCell = (ctx: CanvasRenderingContext2D, board: Board,
  width: number, row: number, col: number, selected: 0 | 1 | 2): void => {
  const size = board.length;
  const cellSize = width / size;

  const cell = board[row][col];

  ctx.fillStyle = colors[cell.queenId];

  ctx.fillRect(col * cellSize + 2, row * cellSize + 2, cellSize - 4, cellSize - 4);

  if (drawQueen && cell.isQueen) {
    ctx.fillStyle = queenColor;
    ctx.fillRect(col * cellSize + 2, row * cellSize + 2, cellSize - 4, cellSize - 4);
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

}

export const drawBoard = (ctx: CanvasRenderingContext2D, board: Board, width: number): void => {
  const size = board.length;
  const cellSize = width / size;

  //ctx.translate(0.5, 0.5)
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

  // Draw black gridlines
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
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
}

export const getCoordinates = (event: React.MouseEvent<HTMLCanvasElement>, board: Board, width: number): [number, number] => {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const cellSize = width / board.length;
  const col = Math.floor(x / cellSize);
  const row = Math.floor(y / cellSize);

  return [row, col];
} 
