import { useState, useRef, useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { ChevronLeft, ChevronRight, Code2 } from "lucide-react";

export default function CodeWalkthrough({ codeData, onLineClick }: { codeData: any, onLineClick: (num: number, content: string) => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const monaco = useMonaco();
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    editor.onMouseDown((e: any) => {
      const target = e.target;
      if (
        target.type === monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS ||
        target.type === monaco.editor.MouseTargetType.CONTENT_TEXT
      ) {
        const lineNumber = target.position?.lineNumber;
        if (lineNumber) {
          const model = editor.getModel();
          const lineContent = model.getLineContent(lineNumber);
          onLineClick(lineNumber, lineContent);
        }
      }
    });
  };

  useEffect(() => {
    if (monaco && editorRef.current && codeData.steps[currentStep]) {
      const step = codeData.steps[currentStep];
      
      // Highlight the current step
      const decorations = editorRef.current.createDecorationsCollection([
        {
          range: new monaco.Range(step.line_start, 1, step.line_end, 1),
          options: {
            isWholeLine: true,
            className: 'bg-indigo-500/20 border-l-4 border-indigo-500',
            marginClassName: 'bg-indigo-500/20',
          }
        }
      ]);

      // Reveal the lines
      editorRef.current.revealLinesInCenter(step.line_start, step.line_end);

      return () => {
        decorations.clear();
      };
    }
  }, [monaco, currentStep, codeData]);

  const step = codeData.steps[currentStep];

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] rounded-b-2xl overflow-hidden">
      <div className="flex-1 min-h-0 relative">
        <Editor
          height="100%"
          defaultLanguage="c"
          theme="vs-dark"
          value={codeData.full_source}
          onMount={handleEditorDidMount}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', monospace",
            lineHeight: 24,
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "solid",
            renderLineHighlight: "all",
            contextmenu: false,
          }}
        />
      </div>

      {/* Step Navigator */}
      <div className="bg-zinc-900 border-t border-zinc-800 p-4 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-indigo-400">
            <Code2 className="w-4 h-4" />
            <span className="text-sm font-semibold uppercase tracking-wider">Step {currentStep + 1} of {codeData.steps.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="p-1.5 rounded-md bg-zinc-800 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentStep(Math.min(codeData.steps.length - 1, currentStep + 1))}
              disabled={currentStep === codeData.steps.length - 1}
              className="p-1.5 rounded-md bg-zinc-800 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <h3 className="text-lg font-medium text-zinc-50 mb-1">{step.title}</h3>
        <p className="text-zinc-400 text-sm leading-relaxed">{step.explanation}</p>
        <div className="flex gap-2 mt-3">
          {step.concept_tags.map((tag: string, idx: number) => (
            <span key={idx} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-500 text-xs font-mono">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
