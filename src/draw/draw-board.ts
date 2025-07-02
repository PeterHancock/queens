import type { Board } from "../model/generate";

const queenColors = [...Array(8)].map((_, i) => {
  const hue = (i * 30) % 360; // Generate a hue for each queen
  return `hsl(${hue}, 100%, 50%)`; // Bright color for each queen
});

export const drawBoard = (ctx: CanvasRenderingContext2D, board: Board, width: number, height: number): void => {
  const size = board.length;
  const cellSize = Math.min(width, height) / size;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = board[row][col];
      
      ctx.fillStyle = queenColors[cell.queenId]; // Queen color

      ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      if (cell.isQueen) {
        ctx.fillStyle = "#000"; // Red for queens
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
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