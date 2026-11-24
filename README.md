# iwroteit

Paste a paragraph or report, answer a few quick questions, and get it back in your own voice.

- `index.html` — the site (voice quiz, rewrite, history; saved in your browser)
- `api/rewrite.js` — Vercel function that calls the AI (Gemini free tier, Groq or Claude)
- `creator-egg.js` — "Made by" credit

## Vercel environment variables
Add **one** AI key (the site uses the first one it finds):
- `GEMINI_API_KEY` — **free**, from aistudio.google.com (recommended)
- `GROQ_API_KEY` — **free** backup, from console.groq.com
- `ANTHROPIC_API_KEY` — paid, Claude

Optional:
- `APP_PASSWORD` — locks the site so only you can use your key
- `MODEL` — override the model (defaults: gemini-3.8-flash / openai/gpt-oss-120b / claude-sonnet-5-5)
