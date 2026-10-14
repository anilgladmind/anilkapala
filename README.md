# Anilkumar Kapala, portfolio

Static site (no build step) plus one Netlify Function for the "Ask my AI" page.

- `index.html` portfolio
- `ask.html`, `ask/ask.js` chat page (served at `/ask`)
- `ask/kb.mjs` offline answer matcher, built from the same facts as the profile
- `ask-data/profile.md` the only facts the AI may use. Edit this to change what it knows
- `ask-data/system-prompt.md` the scoping rules sent to the model
- `netlify/functions/ask.mjs` `POST /api/ask`, calls the Anthropic API server-side
- `netlify/functions/lib/guard.mjs` input validation, prompt-injection and off-topic pre-check, rate limiter
- `tests/ask.test.mjs` run with `node --test tests/ask.test.mjs` (no dependencies)

## Environment variables (Netlify)

| name | purpose |
|---|---|
| `ANTHROPIC_API_KEY` | required, server-side only, never sent to the browser |
| `ANTHROPIC_MODEL` | required, model id to call (see `.env.example`) |
| `ALLOWED_ORIGIN` | optional, extra allowed origins for CORS. Your site's own URL is allowed automatically |

Without the key or model, `/api/ask` returns 503 and the page uses the offline matcher.

## Editing the profile

1. Edit `ask-data/profile.md` (what the AI model sees).
2. Mirror the change in `ask/kb.mjs` (what the offline fallback says), then run the tests.

## Deploy

Push to `main`. Netlify serves the site from the repo root and bundles the function. Set the env vars above, then redeploy. After the first deploy, open `/ask` and ask something unusual. If the answer says "AI is unavailable", check the function logs: the likely cause is the `ask-data` folder not being found (see `included_files` in `netlify.toml`).

## How answers stay on the profile

- The system prompt says to use only `<profile>`, answer in first person, refuse unrelated requests and never guess personal details.
- The visitor's text is wrapped in `<visitor_message>` tags and treated as data.
- A pre-check refuses obvious off-topic and injection phrases before any model call.
- Input is capped at 200 characters, history at the last 6 messages, output at 350 tokens.
- Rate limit: 10 requests per minute and 60 per day per IP.
- Nothing personal is logged. No analytics.

Known limits: the rate limiter lives in memory, so it is per warm function instance and resets on cold start. For a hard limit use a shared store such as Netlify Blobs or Upstash (adds a dependency). Files in `ask-data/` are also publicly downloadable because the site root is published.

See [DEPLOY.md](DEPLOY.md) for the Netlify deployment steps.
