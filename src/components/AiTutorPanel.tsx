import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import clsx from "clsx";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function AiTutorPanel({ experimentId, experimentTitle, fullSource, selectedLine }: { experimentId: number, experimentTitle: string, fullSource: string, selectedLine: { number: number, content: string } | null }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hi! I'm your NetLabAI tutor. Click any line of code to get an explanation, or ask me a question about the experiment." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedLine) {
      handleLineClick(selectedLine);
    }
  }, [selectedLine]);

  const handleLineClick = async (line: { number: number, content: string }) => {
    if (!line.content.trim()) return;

    const userMessage: Message = { role: "user", content: `Explain line ${line.number}: \`${line.content.trim()}\`` };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experiment_id: experimentId,
          exp_title: experimentTitle,
          full_source: fullSource,
          line: line.content,
          line_number: line.number,
          context: "code_walkthrough"
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "ai", content: data.explanation }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "ai", content: "Sorry, I couldn't generate an explanation right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exp_title: experimentTitle,
          message: input,
          history: messages
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "ai", content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "ai", content: "Sorry, I couldn't process your question." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950/50">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={clsx("flex gap-3 max-w-[90%]", msg.role === "user" ? "ml-auto flex-row-reverse" : "")}>
            <div className={clsx(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              msg.role === "user" ? "bg-indigo-500/20 text-indigo-400" : "bg-emerald-500/20 text-emerald-400"
            )}>
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={clsx(
              "p-3 rounded-2xl text-sm leading-relaxed",
              msg.role === "user" 
                ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-100 rounded-tr-sm" 
                : "bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-sm"
            )}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 max-w-[90%]">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 rounded-tl-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span className="text-sm text-zinc-400">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-zinc-900 border-t border-zinc-800 shrink-0">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask a question about the code..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-4 pr-12 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 rounded-lg text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-600 justify-center">
          <Sparkles className="w-3 h-3" />
          <span>Powered by Claude Sonnet 3.5</span>
        </div>
      </div>
    </div>
  );
}
