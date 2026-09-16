<div align="center">

# 💰 PocketMint

**Smart expense tracker with AI-powered budget planning**

Track income & expenses, visualize your 50/30/20 budget, set savings goals, and get tailored financial advice — all in one fast, offline-first PWA.

</div>

## ✨ Features

- **Financial Snapshot** — earnings, fixed essentials, variable spending, and net leftover at a glance
- **50/30/20 Breakdown** — donut chart, target-vs-actual bars, and per-category spend views
- **AI Budget Advice** — Gemini (server-side) or any OpenAI-compatible endpoint (Groq, Ollama, OpenRouter), with a smart **rule-based fallback** that works fully offline
- **Goal Planner** — describe a goal ("save for a laptop for 60,000") and get a personalized timeline
- **Multi-Currency** — 21 currencies incl. PKR, USD, EUR, GBP, INR and more
- **PWA + Offline** — installable, works offline, backs up/restores data as JSON
- **Dark Mode** — toggle between light and dark themes
- **Profile Tailoring** — advice is adjusted for students, freelancers, salaried staff, and more
- **Local-first** — all data stays in your browser; export/import anytime

## 🚀 Getting Started

**Prerequisites:** Node.js 18+

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

### Setting up Gemini AI (optional)

1. Copy `.env.example` to `.env` and add your key:
   ```
   GEMINI_API_KEY=your_key_here
   ```
2. Restart the app. Without a key, PocketMint automatically falls back to its built-in rule-based financial consultant, so the app works everywhere.

### Using a custom AI endpoint (Groq / Ollama / OpenRouter)

Open **AI Planning Settings** in the sidebar and set the API base URL, key, and model. Leave it at `default` to use the built-in server proxy.

## 🏗️ Production Build

```bash
npm run build    # bundles the frontend and server
npm start        # serves the built app on http://localhost:3000
```

## 📦 Tech Stack

- React 19 + Vite 6 + TypeScript
- Tailwind CSS v4
- Express server (Node) with `@google/genai` for Gemini calls
- lucide-react icons, motion
- Service worker for offline PWA support

## 🧰 Scripts

| Command          | Description                              |
| ---------------- | ---------------------------------------- |
| `npm run dev`    | Start dev server with HMR                |
| `npm run build`  | Production build (frontend + server)     |
| `npm start`      | Run the production server                |
| `npm run lint`   | Type-check the whole project (`tsc --noEmit`) |

## 📄 License

MIT © [mhklogs](https://github.com/mhklogs)