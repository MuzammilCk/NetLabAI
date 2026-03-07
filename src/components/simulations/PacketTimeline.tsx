import { useState, useEffect } from "react";
import { Play, Pause, SkipForward, RotateCcw, ArrowRight, ArrowLeft } from "lucide-react";
import clsx from "clsx";

export default function PacketTimeline({ data }: { data: any }) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentFrame < data.frames.length - 1) {
      interval = setInterval(() => {
        setCurrentFrame(prev => prev + 1);
      }, 2500);
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
        <h3 className="text-lg font-medium text-zinc-50">Packet Timeline</h3>
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

      {/* Timeline Visualization */}
      <div className="flex-1 min-h-0 relative p-8 flex flex-col items-center justify-center bg-zinc-950/50">
        <div className="w-full max-w-2xl flex justify-between relative">
          {/* Sender Node */}
          <div className="flex flex-col items-center gap-4 z-10">
            <div className="w-20 h-20 rounded-2xl bg-indigo-500/20 border-2 border-indigo-500 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)]">
              <span className="font-bold text-indigo-400">Sender</span>
            </div>
            <div className="w-0.5 h-64 bg-zinc-800 relative">
              {/* Timer Indicator */}
              {frame.event === "SEND" && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-amber-400 animate-pulse shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
              )}
              {frame.event === "TIMEOUT" && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-red-500 animate-ping shadow-[0_0_20px_rgba(239,68,68,0.8)]" />
              )}
            </div>
          </div>

          {/* Receiver Node */}
          <div className="flex flex-col items-center gap-4 z-10">
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <span className="font-bold text-emerald-400">Receiver</span>
            </div>
            <div className="w-0.5 h-64 bg-zinc-800 relative" />
          </div>

          {/* Animated Packet/ACK */}
          {frame.event === "SEND" && (
            <div className="absolute top-32 left-20 right-20 h-10 flex items-center justify-center animate-[slideRight_1.5s_ease-in-out_forwards]">
              <div className="bg-indigo-500 text-white px-4 py-1.5 rounded-lg font-mono text-sm shadow-lg flex items-center gap-2">
                {frame.label} <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          )}
          {frame.event === "RETRANSMIT" && (
            <div className="absolute top-48 left-20 right-20 h-10 flex items-center justify-center animate-[slideRight_1.5s_ease-in-out_forwards]">
              <div className="bg-amber-500 text-white px-4 py-1.5 rounded-lg font-mono text-sm shadow-lg flex items-center gap-2 border-2 border-dashed border-amber-300">
                {frame.label} <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          )}
          {frame.event === "ACK" && (
            <div className="absolute top-40 left-20 right-20 h-10 flex items-center justify-center animate-[slideLeft_1.5s_ease-in-out_forwards]">
              <div className="bg-emerald-500 text-white px-4 py-1.5 rounded-lg font-mono text-sm shadow-lg flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> {frame.label}
              </div>
            </div>
          )}
          {frame.event === "TIMEOUT" && (
            <div className="absolute top-40 left-1/2 -translate-x-1/2 h-10 flex items-center justify-center">
              <div className="bg-red-500/20 text-red-400 border border-red-500/50 px-4 py-1.5 rounded-lg font-mono text-sm shadow-lg font-bold tracking-widest uppercase">
                TIMEOUT
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Narration */}
      <div className="bg-zinc-950 border-t border-zinc-800 p-6 shrink-0">
        <div className="flex items-start gap-4">
          <div className={clsx(
            "w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-lg",
            frame.event === "SEND" ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" :
            frame.event === "ACK" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
            frame.event === "TIMEOUT" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
            "bg-amber-500/20 text-amber-400 border border-amber-500/30"
          )}>
            {currentFrame + 1}
          </div>
          <p className="text-zinc-300 leading-relaxed text-lg pt-1.5">{frame.narration}</p>
        </div>
      </div>
      
      <style>{`
        @keyframes slideRight {
          0% { transform: translateX(-40%); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateX(40%); opacity: 0; }
        }
        @keyframes slideLeft {
          0% { transform: translateX(40%); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateX(-40%); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
