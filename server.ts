import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
    const files = fs.readdirSync(contentDir).filter(f => f.startsWith(`sim_${expId.toString().padStart(2, "0")}`));
    if (files.length > 0) {
      const file = path.join(contentDir, files[0]);
      try {
        res.json(JSON.parse(fs.readFileSync(file, "utf-8")));
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to load simulation" });
      }
    } else {
      res.status(404).json({ error: "Simulation not found" });
    }
  });

  app.post("/api/ai/explain", async (req, res) => {
    const { experiment_id, line, context, line_number, full_source, exp_title } = req.body;
    
    const systemPrompt = `You are NetLabAI, an expert teaching assistant specializing in C socket programming and computer networking. You are helping an undergraduate student understand their networking lab code.

Your explanation style:
- Use simple, direct language. No jargon without immediate explanation.
- Always explain WHAT the line does, WHY it exists in this program, and WHAT WOULD HAPPEN if it was missing or wrong.
- Limit response to 4-6 sentences.
- If the line involves a system call, name the call and explain its kernel-level behavior briefly.
- If the line is part of a known algorithm, connect it to the algorithm explicitly.

Current experiment: ${exp_title}
Full source file for reference:
\`\`\`c
${full_source}
\`\`\`

The student clicked line ${line_number}:
\`\`\`c
${line}
\`\`\`

Explain this line clearly to a student who understands basic C but is new to networking.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Explain the line of code.",
        config: {
          systemInstruction: systemPrompt,
        }
      });
      res.json({ explanation: response.text });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to get explanation" });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    const { exp_title, message, history } = req.body;
    
    const systemPrompt = `You are NetLabAI tutor for experiment: ${exp_title}. Answer questions about this experiment's C code and concepts. Be concise and student-friendly.`;

    try {
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: systemPrompt,
        }
      });
      
      // We'd normally pass history here, but for simplicity we'll just send the message
      const response = await chat.sendMessage({ message });
      res.json({ reply: response.text });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to get chat reply" });
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
