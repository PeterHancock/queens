import logo from "/logo.svg";
import "./App.css";
import { Board } from "./Board";

function App() {
  return (
    <section className="bg-gradient-to-b from-blue-600 to-blue-400 min-h-screen flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
      <img src={logo} className="mx-auto mb-8 w-24 h-24" alt="logo" />
      <h1 className="text-5xl font-extrabold text-white mb-4">
        <em>QUEENS</em>
      </h1>
      <p className="text-lg text-blue-100 mb-8">
        A clone of the Linkedin puzzle "Queens"
      </p>
      <div>
        <Board width={800} />
      </div>
      
      </div>
    </section>
  );
}

export default App;
