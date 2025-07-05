import { useState } from 'react';

import { Board } from './Board';
import type { Sizes } from './model/types';

export const Game: React.FC<{ width: number }> = ({ width }) => {
  const [size, setSize] = useState<Sizes>(8);

  const [sizeLocked, setSizeLocked] = useState<boolean>(false);

  const handleSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setSize(value as Sizes);
  };

  const handleStarted = () => {
    setSizeLocked(true);
  };

  const handleCleared = () => {
    setSizeLocked(false);
  };

  return (
    <div className="game">
      <Board
        size={size}
        width={width}
        onStarted={handleStarted}
        onCleared={handleCleared}
      />
      <div className="mt-4 mb-4">
        <input
          id="board-size"
          type="range"
          disabled={sizeLocked}
          min={5}
          max={16}
          value={size}
          className="w-full bg-white accent-black"
          onChange={handleSizeChange}
        />
      </div>
    </div>
  );
};
