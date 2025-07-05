import { useEffect, useState } from 'react';

import { Board } from './Board';
import type { Sizes } from './model/types';

export const Game: React.FC<{ width: number }> = ({ width }) => {
  const [size, setSize] = useState<Sizes>(() => {
    const params = new URLSearchParams(window.location.search);
    const sizeParam = params.get('size');
    return sizeParam === null ? 8 : Number(sizeParam) as Sizes;
  });

  const [seed, setSeed] = useState<number>(() => {
    const params = new URLSearchParams(window.location.search);
    const seedParam = params.get('seed');
    return seedParam === null ? Date.now() : Number(seedParam);
  });

  const [boardKey, setBoardKey] = useState<number>(Date.now());

  useEffect(() => {
    window.history.pushState('', '', `?seed=${seed}&size=${size}`);
  }, [size, seed]);

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

  const handleShare = async () => {
    const shareData = {
      title: "Queens",
      text: "Share game!",
      url: window.location.href,
    };
    await window.navigator.share(shareData);
  };

  const handleReset = () => {
    setSizeLocked(false);
    setBoardKey(Date.now());

  };

  const handleNewGame = async () => {
    setSizeLocked(false);
    setSeed(Date.now());
  };

  return (
    <div className="game">
      <Board
        key={boardKey}
        size={size}
        width={width}
        seed={seed}
        onStarted={handleStarted}
        onReset={handleCleared}
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
      <div className="flex gap-4 justify-center">
        <button
          className="px-4 py-2 bg-white text-black rounded shadow font-semibold hover:bg-gray-200 transition"
          onClick={handleReset}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
          </svg>
        </button>
        <button
          className="flex items-center px-4 py-2 bg-white text-black rounded shadow font-semibold hover:bg-gray-200 transition"
          onClick={handleNewGame}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
        <button
          className="flex items-center px-4 py-2 bg-white text-black rounded shadow font-semibold hover:bg-gray-200 transition"
          onClick={handleShare}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
          </svg>
        </button>
      </div>
    </div >
  );
};

