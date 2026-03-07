import { BookOpen, Lightbulb, ListChecks } from "lucide-react";

export default function TheoryPanel({ theory }: { theory: any }) {
  return (
    <div className="p-8 overflow-y-auto h-full space-y-8">
      <section>
        <div className="flex items-center gap-2 text-indigo-400 mb-4">
          <BookOpen className="w-5 h-5" />
          <h2 className="text-xl font-semibold text-zinc-50">Overview</h2>
        </div>
        <p className="text-zinc-300 leading-relaxed text-lg">
          {theory.overview}
        </p>
      </section>

      <section>
        <div className="flex items-center gap-2 text-amber-400 mb-4">
          <Lightbulb className="w-5 h-5" />
          <h2 className="text-xl font-semibold text-zinc-50">Key Concepts</h2>
        </div>
        <div className="grid gap-4">
          {theory.key_concepts.map((concept: any, idx: number) => (
            <div key={idx} className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
              <h3 className="text-lg font-medium text-zinc-200 mb-2">{concept.term}</h3>
              <p className="text-zinc-400 leading-relaxed">{concept.definition}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 text-emerald-400 mb-4">
          <ListChecks className="w-5 h-5" />
          <h2 className="text-xl font-semibold text-zinc-50">Protocol Flow</h2>
        </div>
        <div className="space-y-3">
          {theory.protocol_flow.map((step: string, idx: number) => (
            <div key={idx} className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono text-sm font-bold shrink-0 mt-0.5 border border-emerald-500/20">
                {idx + 1}
              </div>
              <p className="text-zinc-300 leading-relaxed pt-1">{step}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
