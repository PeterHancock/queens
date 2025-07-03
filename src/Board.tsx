import React, { useLayoutEffect, useRef, useMemo } from "react";
import { generateBoard } from "./model/board";
import { drawBoard, drawInvalidSections, drawSelected, getCoordinates } from "./draw/draw-board";
import { createInitial, toggle as toggleSelection } from "./model/selected";
import { validateSelection } from "./model/rules";

type Props = {
  width: number;
}

export const Board: React.FC<Props> = ({ width }) => {

  const [solved, setSolved] = React.useState(false);
  const canvas = useRef<HTMLCanvasElement | null>(null);

  const board = useMemo(() => generateBoard(Date.now()), []);

  const selectedRef = useRef(createInitial());

  useLayoutEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;

    drawBoard(ctx, board, width);

    return () => {
      selectedRef.current = createInitial();
    };
  }, [board, width]);

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (solved) return;
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const [row, col] = getCoordinates(event, board, width);

    toggleSelection(selectedRef.current, row, col);

    drawBoard(ctx, board, width);
    drawSelected(ctx, board, selectedRef.current, width);

    const state = validateSelection(board, selectedRef.current);

    if (state === true) {
      setSolved(true);
      return;
    } else if (state) {
      drawInvalidSections(ctx,board, width, state)
      // state.invalidDomains.forEach((domain) => {
      //   drawDomainShade(ctx, domain, board, width); // Highlight invalid domains
      // });

      // state.invalidRows.forEach((row) => {
      //   row.forEach((cell) => {
      //     drawCell(ctx, board, width, cell.row, cell.col, 0); // Clear invalid cells
      //   });
      // }
      // );
     
    }

  };

  return (
    <div className="relative flex justify-center items-center">
      {solved &&
        <div className="absolute text-9xl font-bold opacity-80 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          <div>Solved!</div>
        </div>
      }
      <canvas
        id="board-canvas"
        onClick={handleClick}
        ref={canvas}
        width={width}
        height={width}
        className="border-10 border-black rounded-lg shadow-2xl ring-4 ring-white ring-offset-2 ring-offset-black"
      ></canvas>
    </div>
  );
};

