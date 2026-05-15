import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
//import connectDB from "./db.js";

dotenv.config();
//connectDB();

if (!process.env.OPENROUTER_API_KEY) {
  console.log("OPENROUTER_API_KEY is missing. Check your .env file.");
  process.exit(1);
}

const app = express();

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

app.get("/", (req, res) => {
  res.send("AI Chat Backend Running");
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        reply: "Message is required",
      });
    }

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
You are an advanced AI assistant similar to ChatGPT, Claude, and Meta AI.

You can:
- Answer general questions
- Help with coding and debugging
- Build websites and applications
- Generate complete source code
- Create ATS-friendly resumes
- Help students with projects
- Explain concepts step-by-step

Resume Builder Rules:
- If the user asks to build a resume, ask for:
  • Name
  • Education
  • Skills
  • Projects
  • Internship
  • Certifications
  • Experience
- Generate professional ATS-friendly resume content
- Use professional formatting
- Keep answers concise and useful

Coding Rules:
- Always provide complete working code
- Use markdown formatting
- Explain code clearly

Behavior:
- Be friendly and professional
- Give step-by-step guidance
- Provide examples where useful
`,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const reply = completion.choices[0].message.content;

    res.json({ reply });
  } catch (error) {
    console.error(error);

    if (error.status === 401) {
      return res.status(401).json({
        reply: "Authentication failed. Check your OpenRouter API key.",
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        reply: "Rate limit exceeded. Please wait and try again.",
      });
    }

    res.status(500).json({
      reply: "Something went wrong with AI API.",
    });
  }
});

app.listen(5001, () => {
  console.log("Server running on port 5001");
});