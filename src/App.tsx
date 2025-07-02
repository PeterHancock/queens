import logo from "/logo.svg";
import "./App.css";

function App() {
  return (
    <section className="bg-gradient-to-b from-blue-600 to-blue-400 min-h-screen flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
      <img src={logo} className="mx-auto mb-8 w-24 h-24" alt="Vite logo" />
      <h1 className="text-5xl font-extrabold text-white mb-4">
        <em>TITLE</em>
      </h1>
      <p className="text-lg text-blue-100 mb-8">
        Welcome to your new project! Start building something amazing with React and Tailwind CSS.
      </p>
      <div>
      </div>
      </div>
    </section>
  );
}

export default App;
