import logo from '/logo.svg';
import './App.css';
import { Game } from './Game';

export function App() {
  return (
    <section className="bg-gradient-to-b from-blue-600 to-blue-400 min-h-screen flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <img src={logo} className="mx-auto mb-8 w-24 h-24" alt="logo" />
        <p className="text-lg text-blue-100 mb-4">
          A recreation of{' '}
          <a
            href="https://www.linkedin.com/games/queens/"
            className="text-white underline hover:text-blue-100 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn&apos;s &quot;Queens&quot;
          </a>{' '}
          puzzle game
        </p>
        <div className="w-full flex justify-center">
          <Game width={280} />
        </div>
      </div>
    </section>
  );
}
