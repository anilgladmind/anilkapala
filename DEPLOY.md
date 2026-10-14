# Deploying to Netlify

The site is static, but Netlify also deploys `netlify/functions/ask.mjs` as a serverless function at `/api/ask`. That function is what makes the Ask AI page work. You do not need your own server, and the Anthropic API key stays on Netlify, never in the browser.

## 1. Commit and push the code

Netlify only deploys what is on GitHub. Make sure `ask.html`, `ask/`, `ask-data/`, `netlify/` and `netlify.toml` are committed.

```
git add -A
git commit -m "feat: add Ask AI page, menu and hero updates"
git push
```

## 2. Connect the repo in Netlify

Skip this if the site is already connected.

1. Add new site, then Import an existing project, then GitHub, then pick `anilkapala`.
2. Branch to deploy: `main`
3. Base directory: leave empty
4. Build command: leave empty (there is no build step)
5. Publish directory: `.`
6. Functions directory: `netlify/functions` (the default)

## 3. Add the environment variables

Site configuration, then Environment variables:

| name | value |
|---|---|
| `ANTHROPIC_API_KEY` | your key from console.anthropic.com (mark it as a secret) |
| `ANTHROPIC_MODEL` | `claude-haiku-4-5-20251001` (cheap and fast) |
| `ALLOWED_ORIGIN` | optional, your custom domain if you add one |

Environment changes only apply to new deploys. After saving, go to Deploys, then Trigger deploy, then Deploy site.

## 4. Test it

1. Open `https://your-site.netlify.app/ask.html` and ask "What have you done with Angular?"
2. Open Functions, then `ask`, then Logs.
   - 200: the AI answered.
   - 503: the key or model is missing. The page then falls back to the built-in matcher, so it still works.

## Things to watch

- **First deploy check.** The function reads `ask-data/profile.md` and `ask-data/system-prompt.md` at runtime, and `netlify.toml` includes that folder with `included_files`. If answers always look like the fallback, check the function logs for "ask-data not found".
- **Cost.** You pay Anthropic per question. Limits: 10 questions a minute and 60 a day per visitor, 200 characters per question and 350 output tokens. Set a monthly spend limit in the Anthropic console.
- **Rate limiter.** It lives in memory, so it resets when the function restarts. It is a soft limit, not a hard one.
- **Public files.** Everything in the repo root is published, including `ask-data/`. Keep only information you are happy to make public in `profile.md`.
- **Updating the resume.** The site serves its own copy at `assets/Anilkumar_Kapala_Resume.pdf`. Copy the new PDF over it and push.

## Local testing with the AI

```
# .env in the project root (already gitignored)
ANTHROPIC_API_KEY=your-key
ANTHROPIC_MODEL=claude-haiku-4-5-20251001

npx netlify-cli dev
```

Open http://localhost:8888. A plain `python3 -m http.server` also works, but the Ask page then uses only the built-in matcher, because that server does not run the function.
