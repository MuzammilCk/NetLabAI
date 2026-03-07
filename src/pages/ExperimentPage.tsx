import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BookOpen, Code2, Play, CheckCircle2, MessageSquare } from "lucide-react";
import clsx from "clsx";
import CodeWalkthrough from "../components/CodeWalkthrough";
import AiTutorPanel from "../components/AiTutorPanel";
import TheoryPanel from "../components/TheoryPanel";
import SimulationPanel from "../components/SimulationPanel";
import PracticePanel from "../components/PracticePanel";

export default function ExperimentPage() {
  const { id } = useParams<{ id: string }>();
  const [experiment, setExperiment] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"concept" | "code" | "simulation" | "practice">("concept");
  const [loading, setLoading] = useState(true);
  
  // AI Context State
  const [selectedLine, setSelectedLine] = useState<{ number: number; content: string } | null>(null);

  useEffect(() => {
    fetch(`/api/experiments/${id}`)
      .then(async res => {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          return res.json();
        } else {
          const text = await res.text();
          throw new Error(`Expected JSON but received: ${text.substring(0, 50)}...`);
        }
      })
      .then(data => {
        setExperiment(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading experiment data...</div>;
  }

  if (!experiment) {
    return <div>Experiment not found.</div>;
  }

  const tabs = [
    { id: "concept", label: "Concept", icon: BookOpen },
    { id: "code", label: "Code", icon: Code2 },
    { id: "simulation", label: "Simulation", icon: Play },
    { id: "practice", label: "Practice", icon: CheckCircle2 },
  ] as const;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2.5 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-semibold tracking-wider uppercase">
              {experiment.category.replace('_', ' ')}
            </span>
            <span className="text-zinc-500 font-mono text-sm">EXP_{experiment.id.toString().padStart(2, '0')}</span>
          </div>
          <h1 className="text-2xl font-bold">{experiment.title}</h1>
          <p className="text-zinc-400 mt-1">{experiment.subtitle}</p>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex bg-zinc-950 p-1.5 rounded-xl border border-zinc-800">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === tab.id 
                  ? "bg-zinc-800 text-zinc-50 shadow-sm" 
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left Panel (60%) */}
        <div className="w-3/5 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
          {activeTab === "concept" && <TheoryPanel theory={experiment.theory} />}
          {activeTab === "code" && (
            <CodeWalkthrough 
              codeData={experiment.code.files[0]} 
              onLineClick={(num, content) => setSelectedLine({ number: num, content })}
            />
          )}
          {activeTab === "simulation" && <SimulationPanel experimentId={experiment.id} />}
          {activeTab === "practice" && <PracticePanel practice={experiment.practice} />}
        </div>

        {/* Right Panel (40%) - AI Tutor */}
        <div className="w-2/5 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-950/50 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <h2 className="font-semibold text-sm">AI Tutor</h2>
          </div>
          <AiTutorPanel 
            experimentId={experiment.id} 
            experimentTitle={experiment.title}
            fullSource={experiment.code.files[0].full_source}
            selectedLine={selectedLine} 
          />
        </div>
      </div>
    </div>
  );
}
