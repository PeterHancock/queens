import type { Board } from "../model/generate";


export const drawBoard = (ctx: CanvasRenderingContext2D, board: Board, width: number, height: number): void => {
  const size = board.length;
  const cellSize = Math.min(width, height) / size;

const queenColors = [...Array(size)].map((_, i) => {
  const hue = (i * 30) % 360; // Generate a hue for each queen
  return `rgb(${hue},${hue},${hue})`; // Bright color for each queen
});

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = board[row][col];
      
      ctx.fillStyle = queenColors[(cell.queenId * 3) % size]; // Queen color

      ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      if (cell.isQueen) {
        ctx.fillStyle = "#f004"; // Red for queens
          ctx.fillRect(col * cellSize, row * cellSize, cellSize/2, cellSize/2);
      } 
    }
  }

  // Draw black gridlines
  ctx.strokeStyle = "#000";
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
}