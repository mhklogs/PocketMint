import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API route for AI Planning Feature (Llama 3 / Groq / Ollama / Gemini)
app.post("/api/ai/budget-plan", async (req, res) => {
  try {
    const { income, rent, grocery, travelExpenses, totalVariable, categorizedSpend, recentTransactions, aiConfig, currency, profession, _reportMode, userGoal } = req.body;
    const sym = currency?.symbol || "$";
    const roleContext = profession ? ` as a ${profession}` : "";

    if (_reportMode) {
      const reportPrompt = `You are a professional financial consultant specializing in personal budgeting. The user is${roleContext}.

Generate a concise monthly financial report (4-5 sentences) with:
- Total income: ${sym}${income || 0}
- Total expenses: ${sym}${(rent || 0) + (grocery || 0) + (totalVariable || 0)}
- Net savings: ${sym}${(income || 0) - ((rent || 0) + (grocery || 0) + (totalVariable || 0))}
- Top spending categories

Be professional, direct, and honest. Give a clear assessment of their financial health and one specific, actionable recommendation.`;

      if (process.env.GEMINI_API_KEY) {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: { headers: { "User-Agent": "aistudio-build" } }
        });
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: reportPrompt
        });
        const text = response.text?.trim();
        if (text) return res.json({ success: true, plan: text, source: "gemini_api" });
      }
      return res.json({ success: true, plan: "Add more data and configure your API key to generate a report." });
    }

    const formattedCategories = categorizedSpend 
      ? Object.entries(categorizedSpend)
          .map(([cat, amt]) => `- ${cat}: ${sym}${amt}`)
          .join("\n")
      : "None logged";

    const formattedRecent = recentTransactions && recentTransactions.length > 0
      ? recentTransactions.map((t: any) => `- ${t.title} (${t.category}): ${sym}${t.amount}`).join("\n")
      : "None logged";

    const goalSection = userGoal
      ? `\n\nThe user has a specific financial goal: "${userGoal}".\nProvide a personalized savings plan to achieve this goal, including a realistic timeline based on their income and expenses.\n`
      : "";

    const systemPrompt = `You are a professional financial consultant specializing in personal budgeting and expense management. The user is${roleContext}.

Analyze the following monthly budget data and provide expert financial advice:
- Total Monthly Income / Allowance / Earnings: ${sym}${income || 0}
- Fixed Monthly Rent: ${sym}${rent || 0}
- Average Groceries & Food: ${sym}${grocery || 0}
- Total Logged Variable Spending: ${sym}${totalVariable || 0}

Variable Spending by Category:
${formattedCategories}

Recent Logged Transactions:
${formattedRecent}${goalSection}

Return EXACTLY 3 actionable bullet points with professional financial advice. Each tip should be specific to their spending patterns and profession.
Rules:
1. No intro or outro text.
2. Each line must start with "• ".
3. Keep each tip under 25 words, specific to their actual data.
4. Be direct, practical, and encouraging like a real financial advisor.`;

    const baseUrl = aiConfig?.baseUrl?.trim();
    const apiKey = aiConfig?.apiKey?.trim() || process.env.GEMINI_API_KEY;
    const model = aiConfig?.model?.trim() || "llama3-8b-8192";

    // Option A: Custom Base URL provided (e.g., Groq, Ollama, OpenRouter)
    if (baseUrl && baseUrl !== "default") {
      const cleanUrl = baseUrl.replace(/\/+$/, "");
      const isOllama = cleanUrl.includes("localhost") || cleanUrl.includes("11434") || cleanUrl.endsWith("/api");
      const targetEndpoint = isOllama 
        ? `${cleanUrl}/chat` 
        : `${cleanUrl}/chat/completions`;

      const payload = isOllama
        ? {
            model: model || "llama3",
            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: "Give me my 3 simple budget tips." }],
            stream: false
          }
        : {
            model: model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: "Give me my 3 simple budget tips now." }
            ],
            temperature: 0.5,
            max_tokens: 250
          };

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

      const extResponse = await fetch(targetEndpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      if (!extResponse.ok) {
        throw new Error(`External API returned status ${extResponse.status}`);
      }

      const data = await extResponse.json();
      let adviceText = "";

      if (isOllama) {
        adviceText = data.message?.content || data.response || "";
      } else {
        adviceText = data.choices?.[0]?.message?.content || "";
      }

      if (!adviceText) {
        throw new Error("Empty response from AI model.");
      }

      return res.json({ success: true, plan: adviceText, source: "custom_api" });
    }

    // Option B: Fallback to Server-Side Gemini API if configured
    if (process.env.GEMINI_API_KEY) {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } }
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: systemPrompt + "\n\nUser request: Give me my 3 budget tips as a professional financial consultant."
      });

      const text = response.text?.trim();
      if (text) {
        return res.json({ success: true, plan: text, source: "gemini_api" });
      }
    }

    return res.status(400).json({ error: "Missing AI config. Triggering rule-based fallback." });

  } catch (error: any) {
    console.error("AI Planning error:", error.message);
    const msg = error.message?.includes("API_KEY_INVALID") || error.message?.includes("API key not valid")
      ? "Gemini API key is invalid. Please set a valid GEMINI_API_KEY in your .env file."
      : error.message || "AI Service unavailable";
    return res.status(503).json({ error: msg });
  }
});

// Vite middleware setup for Development & Static Serve for Production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PocketMint Server running on http://localhost:${PORT}`);
  });
}

startServer();
