import React, { useLayoutEffect, useRef, useState } from "react";
import { generate } from "./model/generate";
import { drawBoard } from "./draw/draw-board";

type Props = {
  width: number;
  height: number;
}

export const Board: React.FC<Props> = ({  width, height }) => {
  const canvas = useRef<HTMLCanvasElement | null>(null);

  const [board] = useState(generate);

  useLayoutEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (ctx) {
      return drawBoard(ctx, board, width, height);
    }
  }, [width, height]);

  return (
    <>
      <canvas id="board-canvas" ref={canvas} width={width} height={height}></canvas>
    </>
  );
};

