// Cheap pre-check run before any model call, plus input validation and rate limiting.

export const MAX_INPUT = 200;
export const MAX_HISTORY = 6;

const INJECTION = [
  /ignore (all |any |the |your |previous |prior |above )*(instructions|rules|prompt|guidelines)/i,
  /disregard (all |any |the |your |previous |prior )*(instructions|rules|prompt)/i,
  /(reveal|show|print|repeat|leak) (me )?(your |the )?(system|hidden|initial) (prompt|instructions|message)/i,
  /system prompt/i,
  /you are now/i,
  /pretend (to be|you are|you're)/i,
  /\bact as\b/i,
  /role-?play/i,
  /jailbreak|\bdan mode\b|developer mode/i,
  /forget (everything|all|your) (instructions|rules)?/i,
  /<\/?(profile|visitor_message|system)>/i
];

const OFF_TOPIC = [
  /\b(president|prime minister|capital of|weather|stock price|bitcoin|football|cricket score|election)\b/i,
  /\b(write|generate|create|give|make) (me )?(a |an |some |the )?(python|javascript|java|c\+\+|sql|bash|code|script|program|function|poem|story|essay|joke|song|email|cover letter)\b/i,
  /\btell me a (joke|story)\b/i,
  /\btranslate\b/i,
  /\brecipe\b/i
];

export const REFUSAL = "I can only answer questions about my work, skills and experience. Try asking about my Angular work, my tech stack or my career timeline.";

export function precheck(text) {
  const t = String(text || "");
  if (INJECTION.some((r) => r.test(t)) || OFF_TOPIC.some((r) => r.test(t))) return { refuse: true, answer: REFUSAL };
  return { refuse: false };
}

// Returns { q, history } or null when the payload is malformed.
export function validate(body) {
  if (!body || typeof body !== "object") return null;
  const q = typeof body.q === "string" ? body.q.trim() : "";
  if (!q || q.length > MAX_INPUT) return null;
  const raw = Array.isArray(body.history) ? body.history : [];
  const history = raw
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, 1500) }));
  // The API needs the first message to be from the user and roles to alternate.
  while (history.length && history[0].role !== "user") history.shift();
  const clean = [];
  for (const m of history) {
    if (clean.length && clean[clean.length - 1].role === m.role) clean[clean.length - 1] = m;
    else clean.push(m);
  }
  if (clean.length && clean[clean.length - 1].role === "user") clean.pop();
  return { q, history: clean };
}

// In-memory limiter. Per warm function instance only; see README for the durable option.
export function makeLimiter({ perMinute = 10, perDay = 60, now = () => Date.now() } = {}) {
  const hits = new Map();
  return function check(key) {
    const t = now();
    const arr = (hits.get(key) || []).filter((x) => t - x < 86400000);
    const lastMinute = arr.filter((x) => t - x < 60000).length;
    if (lastMinute >= perMinute || arr.length >= perDay) {
      hits.set(key, arr);
      return false;
    }
    arr.push(t);
    hits.set(key, arr);
    if (hits.size > 5000) for (const [k, v] of hits) if (!v.length || t - v[v.length - 1] > 86400000) hits.delete(k);
    return true;
  };
}
