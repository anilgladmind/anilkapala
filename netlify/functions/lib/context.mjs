// Picks the extra profile files a question needs, so the model is only sent what it must read.
// Java and interests stay out of the prompt unless the visitor asks about them.
const JAVA = /\b(java|spring|springboot|hibernate|jpa|junit|swagger|openapi|microservices?|back-?end|server[- ]side|full[- ]?stack)\b/i;
const INTERESTS = /\b(hobb(y|ies)|interests?|photo\w*|bird\w*|camera|cook\w*|free time|spare time|outside (of )?work|passions?|leisure|for fun)\b/i;

export function extras(q, history = []) {
  // Look at this question and the previous visitor message so a follow-up ("which projects?") keeps its topic.
  const prev = [...history].reverse().find((m) => m.role === "user")?.content || "";
  const text = `${q} ${prev.replace(/<\/?visitor_message>/g, "")}`;
  const out = [];
  if (JAVA.test(text)) out.push("java");
  if (INTERESTS.test(text)) out.push("interests");
  return out;
}

// History sent to the model: last 4 turns, long assistant replies shortened.
export function slimHistory(history) {
  return history.slice(-4).map((m) => ({ role: m.role, content: m.role === "assistant" ? m.content.slice(0, 500) : m.content }));
}
