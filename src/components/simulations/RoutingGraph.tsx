import { useState, useEffect } from "react";
import { Play, Pause, SkipForward, RotateCcw } from "lucide-react";
import clsx from "clsx";

export default function RoutingGraph({ data }: { data: any }) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentFrame < data.frames.length - 1) {
      interval = setInterval(() => {
        setCurrentFrame(prev => prev + 1);
      }, 2000);
    } else if (currentFrame >= data.frames.length - 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentFrame, data.frames.length]);

  const frame = data.frames[currentFrame];

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] rounded-b-2xl overflow-hidden">
      {/* Simulation Controls */}
      <div className="bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between shrink-0">
        <h3 className="text-lg font-medium text-zinc-50">{frame.title}</h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setCurrentFrame(0); setIsPlaying(false); }}
            className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 transition-all"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => setCurrentFrame(Math.min(data.frames.length - 1, currentFrame + 1))}
            disabled={currentFrame === data.frames.length - 1}
            className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Graph Visualization */}
      <div className="flex-1 min-h-0 relative p-8 flex items-center justify-center bg-zinc-950/50">
        {/* Placeholder for actual SVG graph - simplified for MVP */}
        <div className="relative w-full max-w-md aspect-square border-2 border-dashed border-zinc-800 rounded-full flex items-center justify-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center font-bold text-zinc-300">1</div>
          <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center font-bold text-zinc-300">2</div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-12 h-12 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center font-bold text-zinc-300">3</div>
          <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center font-bold text-zinc-300">4</div>
          
          <div className="text-center text-zinc-500 text-sm">
            <p className="mb-2">Graph Visualization</p>
            <p className="font-mono text-xs">Active Router: {frame.active_router || 'None'}</p>
          </div>
        </div>
      </div>

      {/* Routing Tables */}
      <div className="bg-zinc-900 border-t border-zinc-800 p-4 shrink-0 grid grid-cols-2 gap-4">
        {Object.entries(frame.routing_tables).map(([routerId, table]: [string, any]) => (
          <div key={routerId} className={clsx(
            "border rounded-xl overflow-hidden",
            frame.active_router === parseInt(routerId) ? "border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]" : "border-zinc-800"
          )}>
            <div className={clsx(
              "px-3 py-1.5 text-xs font-semibold uppercase tracking-wider",
              frame.active_router === parseInt(routerId) ? "bg-indigo-500/20 text-indigo-300" : "bg-zinc-800 text-zinc-400"
            )}>
              Router {routerId} Table
            </div>
            <div className="grid grid-cols-4 gap-px bg-zinc-800">
              {Object.entries(table).map(([dest, cost]: [string, any]) => {
                const isUpdated = frame.updated_cells?.some((c: any) => c.router === parseInt(routerId) && c.dest === parseInt(dest));
                return (
                  <div key={dest} className={clsx(
                    "bg-zinc-950 p-2 text-center font-mono text-sm",
                    isUpdated ? "text-amber-400 font-bold bg-amber-400/10" : "text-zinc-300"
                  )}>
                    {cost === 999 ? 'â' : cost}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Narration */}
      <div className="bg-zinc-950 border-t border-zinc-800 p-4 shrink-0">
        <p className="text-zinc-300 leading-relaxed">{frame.narration}</p>
      </div>
    </div>
  );
}
