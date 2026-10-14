// POST /api/ask  ->  { answer }
// Calls the Anthropic Messages API with the profile as the only source of truth.
// ANTHROPIC_API_KEY stays on the server. No analytics, nothing personal is logged.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { precheck, validate, makeLimiter, MAX_INPUT } from "./lib/guard.mjs";
import { extras, slimHistory } from "./lib/context.mjs";

export const config = { path: "/api/ask" };

const limiter = makeLimiter({ perMinute: 10, perDay: 60 });
let cache;

function loadData() {
  if (cache) return cache;
  const bases = [
    join(process.cwd(), "ask-data"),
    join(process.env.LAMBDA_TASK_ROOT || "/var/task", "ask-data"),
    fileURLToPath(new URL("../../ask-data/", import.meta.url))
  ];
  for (const b of bases) {
    try {
      cache = {
        profile: readFileSync(join(b, "profile.md"), "utf8"),
        prompt: readFileSync(join(b, "system-prompt.md"), "utf8"),
        java: readFileSync(join(b, "java.md"), "utf8"),
        interests: readFileSync(join(b, "interests.md"), "utf8")
      };
      return cache;
    } catch {}
  }
  throw new Error("ask-data not found");
}

function json(obj, status = 200, extra = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra }
  });
}

function allowedOrigins() {
  const list = (process.env.ALLOWED_ORIGIN || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (process.env.URL) list.push(process.env.URL);
  if (process.env.DEPLOY_PRIME_URL) list.push(process.env.DEPLOY_PRIME_URL);
  return list;
}

export default async (req, context) => {
  const origin = req.headers.get("origin");
  const allowed = allowedOrigins();
  const cors = origin && allowed.includes(origin) ? { "access-control-allow-origin": origin, vary: "origin" } : {};

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: { ...cors, "access-control-allow-methods": "POST", "access-control-allow-headers": "content-type" } });
  if (req.method !== "POST") return json({ error: "method" }, 405, cors);
  if (origin && allowed.length && !allowed.includes(origin)) return json({ error: "origin" }, 403);

  let body;
  try { body = await req.json(); } catch { return json({ error: "bad_request" }, 400, cors); }
  const v = validate(body);
  if (!v) return json({ error: "bad_request", max: MAX_INPUT }, 400, cors);

  const pre = precheck(v.q);
  if (pre.refuse) return json({ answer: pre.answer, refused: true }, 200, cors);

  const ip = context?.ip || req.headers.get("x-nf-client-connection-ip") || "unknown";
  if (!limiter(ip)) return json({ error: "rate_limited" }, 429, { ...cors, "retry-after": "60" });

  // AI_PROVIDER picks the model host: "anthropic" (default) or "groq" (free tier). Switch it in Netlify, no code change.
  const provider = (process.env.AI_PROVIDER || "anthropic").toLowerCase();
  const cfg = provider === "groq"
    ? { key: process.env.GROQ_API_KEY, model: process.env.GROQ_MODEL || "openai/gpt-oss-120b" }
    : { key: process.env.ANTHROPIC_API_KEY, model: process.env.ANTHROPIC_MODEL };
  if (!cfg.key || !cfg.model) return json({ error: "unavailable" }, 503, cors);

  let data;
  try { data = loadData(); } catch { return json({ error: "unavailable" }, 503, cors); }

  const more = extras(v.q, v.history).map((k) => data[k].trim()).join("\n");
  const system = `${data.prompt.trim()}\n\n<profile>\n${data.profile.trim()}\n</profile>${more ? `\n<context>\n${more}\n</context>` : ""}`;
  const messages = [...slimHistory(v.history), { role: "user", content: `<visitor_message>${v.q}</visitor_message>` }];

  try {
    const r = provider === "groq"
      ? await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "content-type": "application/json", authorization: `Bearer ${cfg.key}` },
          body: JSON.stringify({ model: cfg.model, max_tokens: 600, temperature: 0.2, ...(cfg.model.includes("gpt-oss") ? { reasoning_effort: "low" } : {}), messages: [{ role: "system", content: system }, ...messages] }),
          signal: AbortSignal.timeout(20000)
        })
      : await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "content-type": "application/json", "x-api-key": cfg.key, "anthropic-version": "2023-06-01" },
          body: JSON.stringify({ model: cfg.model, max_tokens: 350, system, messages }),
          signal: AbortSignal.timeout(20000)
        });
    if (!r.ok) {
      // Log only the status and error type (no visitor text, no key) so a failure can be diagnosed.
      let type = "";
      let msg = "";
      try { const e = (await r.json())?.error; type = (typeof e === "string" ? e : e?.type || e?.code) || ""; msg = (typeof e === "string" ? e : e?.message) || ""; } catch {}
      console.error(`${provider} ${r.status} ${type} model=${cfg.model} ${msg.slice(0, 160)}`);
      return json({ error: "unavailable", reason: `upstream_${r.status}${type ? "_" + type : ""}` }, 502, cors);
    }
    const out = await r.json();
    const text = (provider === "groq"
      ? out.choices?.[0]?.message?.content || ""
      : (out.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n")).trim();
    if (!text) return json({ error: "unavailable", reason: "empty_reply" }, 502, cors);
    return json({ answer: text }, 200, cors);
  } catch (e) {
    console.error(`${provider} fetch failed: ${e?.name || "error"}`);
    return json({ error: "unavailable", reason: e?.name === "TimeoutError" ? "timeout" : "network" }, 502, cors);
  }
};
