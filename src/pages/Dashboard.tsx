import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Code2, Activity, Play } from "lucide-react";

interface ExperimentSummary {
  id: number;
  title: string;
  type: string;
  category: string;
  description: string;
}

export default function Dashboard() {
  const [experiments, setExperiments] = useState<ExperimentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/experiments")
      .then(res => res.json())
      .then(data => {
        setExperiments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading experiments...</div>;
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "routing": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "flow_control": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "traffic_control": return "text-amber-400 bg-amber-400/10 border-amber-400/20";
      default: return "text-zinc-400 bg-zinc-400/10 border-zinc-400/20";
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Lab Experiments</h1>
        <p className="text-zinc-400">Master C socket programming and networking protocols.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {experiments.map(exp => (
          <Link 
            key={exp.id} 
            to={`/experiments/${exp.id}`}
            className="group block bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getCategoryColor(exp.category)} uppercase tracking-wider`}>
                {exp.category.replace('_', ' ')}
              </div>
              <span className="text-zinc-500 font-mono text-sm">EXP_{exp.id.toString().padStart(2, '0')}</span>
            </div>
            
            <h2 className="text-xl font-semibold mb-2 group-hover:text-indigo-400 transition-colors">{exp.title}</h2>
            <p className="text-zinc-400 text-sm mb-6 line-clamp-2">{exp.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-zinc-500">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" /> Theory
              </div>
              <div className="flex items-center gap-1.5">
                <Code2 className="w-4 h-4" /> Code
              </div>
              <div className="flex items-center gap-1.5">
                <Play className="w-4 h-4" /> Sim
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-zinc-800/50 flex items-center justify-between">
              <div className="w-full bg-zinc-800 rounded-full h-1.5 mr-4">
                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '0%' }}></div>
              </div>
              <span className="text-xs font-medium text-zinc-400">0%</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
