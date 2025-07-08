import React, { useLayoutEffect, useRef, useMemo, useEffect } from 'react';
import { generateBoard } from './model/board';
import {
  drawBoard,
  drawInvalidSections,
  drawSelected,
  getCoordinates,
} from './draw/draw-board';
import { createInitial, toggle as toggleSelection } from './model/selected';
import { validateSelection } from './model/rules';
import type { Sizes } from './model/types';

type Props = {
  size: Sizes;
  width: number;
  seed?: number;
  onSolved?: () => void;
  onStarted?: () => void;
  onReset?: () => void;
};

export const Board: React.FC<Props> = ({
  size,
  width,
  seed = Date.now(),
  onSolved = () => {},
  onReset = () => {},
  onStarted = () => {},
}) => {
  const [solved, setSolved] = React.useState(false);
  const canvas = useRef<HTMLCanvasElement | null>(null);

  const board = useMemo(() => generateBoard(size, seed), [size, seed]);

  const selectedRef = useRef(createInitial(size));

  useEffect(() => {
    selectedRef.current = createInitial(size);
    setSolved(false);
  }, [size, seed]);

  useLayoutEffect(() => {
    const ctx = canvas.current?.getContext('2d');
    if (!ctx) return;

    drawBoard(ctx, board, width);

    return () => {
      selectedRef.current = createInitial(size);
    };
  }, [size, board, width]);

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (solved) return;
    const ctx = canvas.current?.getContext('2d');
    if (!ctx) return;
    const [row, col] = getCoordinates(event, board, width, 10);

    if (row < 0 || col < 0) return; // Out of bounds click

    toggleSelection(selectedRef.current, row, col);

    drawBoard(ctx, board, width);
    drawSelected(ctx, board, selectedRef.current, width);

    const selection = validateSelection(board, selectedRef.current);

    if (selection.state === 'solved') {
      setSolved(true);
      onSolved();
    } else if (selection.state === 'started') {
      onStarted();
    } else if (selection.state === 'cleared') {
      onReset();
    } else if (selection.state === 'invalid') {
      drawInvalidSections(ctx, board, width, selection);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center space-y-6 relative">
      {solved && (
        <div className="absolute text-9xl font-bold opacity-80 text-white drop-shadow-[0_3px_3px_rgba(0,0,0,0.8)]">
          <div>Solved!</div>
        </div>
      )}
      <canvas
        id="board-canvas"
        className="border-10 border-black rounded-lg shadow-2xl ring-4 ring-white ring-offset-2 ring-offset-black"
        onClick={handleClick}
        ref={canvas}
        width={width}
        height={width}
      ></canvas>
    </div>
  );
};
