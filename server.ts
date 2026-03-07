import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/experiments", (req, res) => {
    const contentDir = path.resolve(__dirname, "content/experiments");
    try {
      if (!fs.existsSync(contentDir)) {
        return res.json([]);
      }
      const files = fs.readdirSync(contentDir).filter(f => f.endsWith(".json"));
      const experiments = files.map(f => {
        const data = JSON.parse(fs.readFileSync(path.join(contentDir, f), "utf-8"));
        return {
          id: data.id,
          title: data.title,
          type: data.type,
          category: data.category,
          description: data.description,
        };
      });
      res.json(experiments.sort((a, b) => a.id - b.id));
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to load experiments" });
    }
  });

  app.get("/api/experiments/:id", (req, res) => {
    const expId = parseInt(req.params.id);
    const contentDir = path.resolve(__dirname, "content/experiments");
    const file = path.join(contentDir, `exp_${expId.toString().padStart(2, "0")}.json`);
    try {
      if (fs.existsSync(file)) {
        res.json(JSON.parse(fs.readFileSync(file, "utf-8")));
      } else {
        res.status(404).json({ error: "Experiment not found" });
      }
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to load experiment" });
    }
  });

  app.get("/api/simulate/:id", (req, res) => {
    const expId = parseInt(req.params.id);
    const contentDir = path.resolve(__dirname, "content/simulations");
    try {
      if (!fs.existsSync(contentDir)) {
        return res.status(404).json({ error: "Simulations directory not found" });
      }
      const files = fs.readdirSync(contentDir).filter(f => f.startsWith(`sim_${expId.toString().padStart(2, "0")}`));
      if (files.length > 0) {
        const file = path.join(contentDir, files[0]);
        res.json(JSON.parse(fs.readFileSync(file, "utf-8")));
      } else {
        res.status(404).json({ error: "Simulation not found" });
      }
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to load simulation" });
    }
  });

  app.post("/api/ai/explain", async (req, res) => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const { experiment_id, line, context, line_number, full_source, exp_title } = req.body;
    
    const lines = full_source.split('\n');
    const start = Math.max(0, line_number - 10);
    const end = Math.min(lines.length, line_number + 10);
    const contextWindow = lines.slice(start, end).map((l: string, i: number) => `${start + i + 1}: ${l}`).join('\n');

    const systemPrompt = `You are NetLabAI, an expert teaching assistant specializing in C socket programming and computer networking. You are helping an undergraduate student understand their networking lab code.

Your explanation style:
- Use simple, direct language. No jargon without immediate explanation.
- Always explain WHAT the line does, WHY it exists in this program, and WHAT WOULD HAPPEN if it was missing or wrong.
- Limit response to 4-6 sentences.
- If the line involves a system call, name the call and explain its kernel-level behavior briefly.
- If the line is part of a known algorithm, connect it to the algorithm explicitly.

Current experiment: ${exp_title}
Relevant code context (lines ${start + 1}-${end}):
\`\`\`c
${contextWindow}
\`\`\`

Explain the clicked line: what it does, why it exists, and what breaks if removed.
4-6 sentences. Connect to the networking concept if applicable.`;

    try {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3-flash-preview",
        contents: `Line ${line_number}: \`${line}\``,
        config: {
          systemInstruction: systemPrompt,
        }
      });

      for await (const chunk of responseStream) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (e: any) {
      console.error(e);
      let errorMessage = "Failed to get explanation";
      if (e.status === 400 || e.status === 403) {
        errorMessage = "API key is invalid or missing. Please check your environment variables.";
      } else if (e.message) {
        errorMessage = e.message;
      }
      res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
      res.end();
    }
  });

  app.post("/api/practice/submit", async (req, res) => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const { exp_title, exercise_description, correct_answer, student_answer } = req.body;

    const systemPrompt = `You are NetLabAI evaluating a student's understanding of a networking lab exercise.
You are NOT a compiler. You are evaluating CONCEPTUAL CORRECTNESS, not syntax.

Experiment: ${exp_title}
Exercise description: ${exercise_description}
Correct answer: ${correct_answer}

Evaluate using this JSON schema ONLY — no extra text:
{
  "correct": boolean,
  "partial": boolean,
  "score": 0-100,
  "missing_concepts": ["concept1", "concept2"],
  "correct_parts": ["what they got right"],
  "feedback": "2-3 sentence personalized explanation",
  "hint": "one specific hint if incorrect",
  "next_action": "retry | move_forward | review_concept"
}

Rules:
- Score 100 only if the student demonstrates full understanding
- Score 60-99 for partial credit — understands mechanism but wrong syntax/variable
- Score 0-59 for wrong conceptual approach
- "missing_concepts" must reference actual concepts from the experiment
- "feedback" must mention what the student got right first, then what is missing
- Never say "wrong" — say "not quite" or "almost"`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Student answer: ${student_answer}`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
        }
      });
      
      let result;
      try {
        result = JSON.parse(response.text);
      } catch (e) {
        result = {
          correct: false,
          partial: false,
          score: 0,
          missing_concepts: [],
          correct_parts: [],
          feedback: "Unable to evaluate right now. Please try again.",
          hint: "Review the experiment's code walkthrough section.",
          next_action: "retry"
        };
      }
      res.json(result);
    } catch (e: any) {
      console.error(e);
      let errorMessage = "Failed to evaluate practice";
      if (e.status === 400 || e.status === 403) {
        errorMessage = "API key is invalid or missing. Please check your environment variables.";
      } else if (e.message) {
        errorMessage = e.message;
      }
      res.status(500).json({ 
        correct: false,
        partial: false,
        score: 0,
        missing_concepts: [],
        correct_parts: [],
        feedback: `Error: ${errorMessage}`,
        hint: "Please check your API key or try again later.",
        next_action: "retry"
      });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const { exp_title, message, history } = req.body;
    
    const systemPrompt = `You are NetLabAI tutor for experiment: ${exp_title}. Answer questions about this experiment's C code and concepts. Be concise and student-friendly.`;

    try {
      const cleanHistory = (history || []).filter((msg: any) => msg.role === "user" || msg.role === "ai").map((msg: any) => ({
        role: msg.role === "ai" ? "model" : "user",
        parts: [{ text: msg.content.substring(0, 2000) }]
      }));

      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: systemPrompt,
        },
        history: cleanHistory
      });
      
      const response = await chat.sendMessage({ message });
      res.json({ reply: response.text });
    } catch (e: any) {
      console.error(e);
      let errorMessage = "Failed to get chat reply";
      if (e.status === 400 || e.status === 403) {
        errorMessage = "API key is invalid or missing. Please check your environment variables.";
      } else if (e.message) {
        errorMessage = e.message;
      }
      res.status(500).json({ error: errorMessage });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
