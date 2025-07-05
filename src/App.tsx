import logo from '/logo.svg';
import './App.css';
import { Game } from './Game';
import { useState, useEffect } from 'react';

export function App() {
  // Track and update board width for responsiveness
  const [boardWidth, setBoardWidth] = useState<number>(() =>
    Math.min(480, window.innerWidth - 32)
  );

  useEffect(() => {
    const handleResize = () => {
      setBoardWidth(Math.min(480, window.innerWidth - 32));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="bg-gradient-to-b from-blue-600 to-blue-400 min-h-screen flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <img src={logo} className="mx-auto mb-8 w-24 h-24" alt="logo" />
        <p className="text-lg text-blue-100 mb-4">
          A recreation of LinkedIn's "Queens" puzzle game
        </p>
        <div className="w-full flex justify-center">
          <Game width={boardWidth} />
        </div>
      </div>
    </section>
  );
}
