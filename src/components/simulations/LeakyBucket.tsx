import { useState, useEffect } from "react";
import { Play, Pause, SkipForward, RotateCcw, Droplet, ArrowDown } from "lucide-react";
import clsx from "clsx";

export default function LeakyBucket({ data }: { data: any }) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentFrame < data.frames.length - 1) {
      interval = setInterval(() => {
        setCurrentFrame(prev => prev + 1);
      }, 3000);
    } else if (currentFrame >= data.frames.length - 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentFrame, data.frames.length]);

  const frame = data.frames[currentFrame];
  const { bucket_size, output_rate } = data.config;

  const fillPercentage = (frame.bucket_level_after || frame.bucket_level_before) / bucket_size * 100;

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] rounded-b-2xl overflow-hidden">
      {/* Simulation Controls */}
      <div className="bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between shrink-0">
        <h3 className="text-lg font-medium text-zinc-50">Leaky Bucket Simulation</h3>
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

      {/* Bucket Visualization */}
      <div className="flex-1 min-h-0 relative p-8 flex flex-col items-center justify-center bg-zinc-950/50">
        
        {/* Incoming Packet */}
        <div className="h-24 flex items-end justify-center mb-4 relative">
          <div className={clsx(
            "flex flex-col items-center justify-center rounded-lg border-2 shadow-lg transition-all duration-500",
            frame.event === "REJECT" ? "bg-red-500/20 border-red-500 text-red-400 animate-bounce" :
            frame.event === "PARTIAL_DROP" ? "bg-amber-500/20 border-amber-500 text-amber-400 animate-pulse" :
            "bg-indigo-500/20 border-indigo-500 text-indigo-400 animate-pulse"
          )} style={{ width: Math.max(60, frame.packet_size * 2), height: Math.max(40, frame.packet_size) }}>
            <span className="font-mono font-bold">{frame.packet_size}B</span>
            {frame.event === "REJECT" && <span className="text-xs uppercase tracking-widest mt-1">Dropped</span>}
            {frame.event === "PARTIAL_DROP" && <span className="text-xs uppercase tracking-widest mt-1">Partial Drop</span>}
          </div>
          <ArrowDown className="absolute -bottom-6 text-zinc-600 w-6 h-6 animate-bounce" />
        </div>

        {/* The Bucket */}
        <div className="relative w-64 h-64 border-4 border-t-0 border-zinc-700 rounded-b-3xl overflow-hidden bg-zinc-900 shadow-inner">
          {/* Water level */}
          <div 
            className="absolute bottom-0 left-0 right-0 bg-blue-500/80 transition-all duration-1000 ease-in-out flex items-center justify-center"
            style={{ height: `${Math.min(100, fillPercentage)}%` }}
          >
            <div className="absolute top-0 left-0 right-0 h-2 bg-blue-400/50" />
            {fillPercentage > 10 && (
              <span className="text-white font-mono font-bold text-lg shadow-black drop-shadow-md">
                {frame.bucket_level_after || frame.bucket_level_before} / {bucket_size}
              </span>
            )}
          </div>
          
          {/* Capacity markers */}
          <div className="absolute top-0 left-0 right-0 h-px bg-red-500/50 border-t border-dashed border-red-500">
            <span className="absolute -top-6 right-2 text-xs text-red-400 font-mono">Max: {bucket_size}B</span>
          </div>
        </div>

        {/* Outgoing Traffic */}
        <div className="h-24 flex flex-col items-center justify-start mt-2 relative">
          <div className="w-4 h-8 bg-zinc-700 rounded-b-md" />
          <Droplet className="text-blue-400 w-6 h-6 animate-bounce mt-2" />
          <div className="mt-2 text-zinc-400 font-mono text-sm">
            Output Rate: <span className="text-blue-400 font-bold">{output_rate}B/s</span>
          </div>
        </div>

      </div>

      {/* Narration */}
      <div className="bg-zinc-950 border-t border-zinc-800 p-6 shrink-0">
        <div className="flex items-start gap-4">
          <div className={clsx(
            "w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-lg",
            frame.event === "ACCEPT" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
            frame.event === "REJECT" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
            "bg-amber-500/20 text-amber-400 border border-amber-500/30"
          )}>
            {currentFrame + 1}
          </div>
          <p className="text-zinc-300 leading-relaxed text-lg pt-1.5">{frame.narration}</p>
        </div>
      </div>
    </div>
  );
}
