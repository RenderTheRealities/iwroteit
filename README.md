# iwroteit

Paste a paragraph or report, answer a few quick questions, and get it back in your own voice.

- `index.html` — the site (voice quiz, rewrite, history; saved in your browser)
- `api/rewrite.js` — Vercel function that calls the Claude API
- `creator-egg.js` — "Made by" credit

## Vercel environment variables
- `ANTHROPIC_API_KEY` (required)
- `APP_PASSWORD` (optional, locks the site so only you can use your key)
- `MODEL` (optional, default `claude-sonnet-5-5`)
