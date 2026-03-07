import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ExperimentPage from "./pages/ExperimentPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-indigo-500/30">
        <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
                N
              </div>
              <span className="font-semibold text-lg tracking-tight">NetLabAI</span>
            </div>
            <nav className="flex items-center gap-6 text-sm font-medium text-zinc-400">
              <a href="/" className="hover:text-zinc-50 transition-colors">Experiments</a>
              <a href="#" className="hover:text-zinc-50 transition-colors">Exam Mode</a>
            </nav>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/experiments/:id" element={<ExperimentPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
