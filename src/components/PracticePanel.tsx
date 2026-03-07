import { useState } from "react";
import { CheckCircle2, ChevronRight, AlertCircle } from "lucide-react";

export default function PracticePanel({ practice }: { practice: any }) {
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [results, setResults] = useState<{ [key: number]: { correct: boolean, feedback: string } }>({});

  const handleSubmit = (exerciseId: number) => {
    const exercise = practice.exercises.find((e: any) => e.id === exerciseId);
    const answer = answers[exerciseId] || "";
    
    // Simple exact match for MVP, normally this would go to the AI evaluator endpoint
    const isCorrect = answer.trim() === exercise.answer;
    
    setResults(prev => ({
      ...prev,
      [exerciseId]: {
        correct: isCorrect,
        feedback: isCorrect ? "Correct! Great job." : `Not quite. Hint: ${exercise.hint}`
      }
    }));
  };

  return (
    <div className="p-8 overflow-y-auto h-full space-y-8">
      <div className="flex items-center gap-2 text-indigo-400 mb-6">
        <CheckCircle2 className="w-5 h-5" />
        <h2 className="text-xl font-semibold text-zinc-50">Practice Exercises</h2>
      </div>

      <div className="space-y-6">
        {practice.exercises.map((exercise: any) => (
          <div key={exercise.id} className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-zinc-700 bg-zinc-800 text-zinc-300 uppercase tracking-wider">
                Exercise {exercise.id}
              </span>
              <span className="text-xs font-mono text-zinc-500">{exercise.difficulty}</span>
            </div>
            
            <p className="text-zinc-300 text-lg mb-4">{exercise.description}</p>
            
            {exercise.type === "fill_blank" && (
              <div className="space-y-4">
                <div className="bg-[#1e1e1e] p-4 rounded-xl border border-zinc-800 font-mono text-sm text-zinc-300 overflow-x-auto">
                  <pre>{exercise.code_template}</pre>
                </div>
                
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={answers[exercise.id] || ""}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [exercise.id]: e.target.value }))}
                    placeholder="Type your answer here..."
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-mono"
                  />
                  <button
                    onClick={() => handleSubmit(exercise.id)}
                    className="px-6 py-2.5 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                  >
                    Submit <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {results[exercise.id] && (
              <div className={`mt-4 p-4 rounded-xl border flex items-start gap-3 ${
                results[exercise.id].correct 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                  : "bg-amber-500/10 border-amber-500/20 text-amber-400"
              }`}>
                {results[exercise.id].correct ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                <p className="text-sm leading-relaxed">{results[exercise.id].feedback}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
