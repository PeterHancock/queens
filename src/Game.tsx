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
      <div className="mt-4 mb-4">
        <label
          htmlFor="board-size"
          className="block text-white mb-2 font-semibold"
        >
          <span className="ml-2 text-blue-200">Board Size: </span>
          {size}
        </label>
        <input
          id="board-size"
          type="range"
          disabled={sizeLocked}
          min={5}
          max={16}
          value={size}
          className="w-full accent-blue-500"
          onChange={handleSizeChange}
        />
      </div>
      <Board
        size={size}
        width={width}
        onStarted={handleStarted}
        onCleared={handleCleared}
      />
    </div>
  );
};
