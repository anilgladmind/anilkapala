// Visual answers for the Ask chat: career graph and photo gallery, plus a small markdown renderer.
// Everything is built with DOM nodes (no innerHTML). Facts come from ask-data/profile.md.
const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

// [company, role, start, end (null = now), highlight]
export const CAREER = [
  ["Bitla Software", "Software Engineer", [2012, 10], [2015, 2], "SaaS for transport and hospitality"],
  ["Gladminds", "Software Engineer", [2015, 3], [2015, 7], "Offline hybrid apps, +20% field productivity"],
  ["NTT DATA", "Senior Consultant, UI", [2015, 7], [2018, 12], "Accessible enterprise UI for global clients"],
  ["Digital Harbor", "Senior Software Engineer", [2018, 12], [2021, 3], "Reusable Angular packages, -30% effort"],
  ["EKA Software", "Senior Software Engineer", [2021, 4], [2022, 8], "Commodity trading and supply chain apps"],
  ["Perfios", "Senior Technical Lead", [2022, 8], [2024, 10], "Led Digital Lending Platform delivery"],
  ["FICO", "Senior Engineer", [2024, 10], null, "Micro Frontends, +30% faster, -25% effort"]
];
const FACTS = ["13+ years", "7 companies", "~30% faster apps", "~25% less effort"];

const frac = ([y, m]) => y + (m - 1) / 12;

export function visualIntent(q) {
  const t = String(q).toLowerCase();
  const show = /\b(show|see|view|display|share|visuali[sz]e|draw|plot)\b/.test(t);
  if (/\b(career|journey|growth|progress\w*|experience|timeline|roles?)\b/.test(t) && (/\b(graph|chart|visual\w*|diagram|timeline|map)\b/.test(t) || (show && /\bcareer\b/.test(t)))) return "career";
  if (/\b(photos?|pictures?|pics?|gallery|images?|shots)\b/.test(t) && (show || /\b(your|ur|his|anil'?s?)\b/.test(t) || /^\s*(photos?|gallery|photography)\s*\??\s*$/.test(t))) return "photos";
  return null;
}
export const wantsPhotos = (q) => /\b(photo\w*|camera|pictures?|hobb(y|ies)|interests?|passions?|free time|spare time|outside (of )?work|bird\w*)\b/i.test(q);
// Photo category the visitor named, matching the filename prefix in assets/photography.
const CATS = [["birds", /\bbirds?\b|birding/i], ["flower", /\bflowers?\b/i], ["macro", /\bmacro\b/i], ["travel", /\btravel\w*\b/i], ["nature", /\bnature\b/i], ["edited", /\bedit\w*\b/i]];
export const photoCat = (q) => (CATS.find(([, r]) => r.test(q)) || [])[0] || null;

export const LEAD = {
  career: "Here is my career since 2012: 7 roles in 13+ years, from Software Engineer to Senior Technical Lead and now Senior Engineer at FICO.",
  photos: "Photography is my main interest. Here are some of my shots:"
};
export const leadFor = (kind, q) => (kind === "photos" && photoCat(q) === "birds" ? "Here are some of my bird photographs:" : LEAD[kind]);

export function careerGraph() {
  const now = new Date();
  const end = now.getFullYear() + now.getMonth() / 12;
  const t0 = 2012.5, span = end + 0.4 - t0;
  const w = el("figure", "rc");
  w.setAttribute("role", "img");
  w.setAttribute("aria-label", "Career timeline: " + CAREER.map((r) => `${r[1]} at ${r[0]}`).join(", "));
  const facts = el("div", "rc-f");
  FACTS.forEach((f) => facts.appendChild(el("span", null, f)));
  w.appendChild(facts);
  const rows = el("div", "rc-rows");
  CAREER.slice().reverse().forEach((r, i) => {
    const a = frac(r[2]), b = r[3] ? frac(r[3]) + 1 / 12 : end;
    const row = el("div", "rc-r" + (r[3] ? "" : " now"));
    const lab = el("div", "rc-l");
    lab.append(el("b", null, r[0]), el("span", null, r[1]));
    const track = el("div", "rc-t");
    const bar = el("i", "rc-b");
    bar.style.left = ((a - t0) / span) * 100 + "%";
    bar.style.width = Math.max(((b - a) / span) * 100, 1.6) + "%";
    bar.style.setProperty("--d", i * 90 + "ms");
    track.appendChild(bar);
    const yrs = r[3] ? `${r[2][0]}-${r[3][0]}` : `${r[2][0]}-now`;
    const meta = el("div", "rc-m", `${yrs} · ${r[4]}`);
    row.append(lab, track, meta);
    rows.appendChild(row);
  });
  w.appendChild(rows);
  const axis = el("div", "rc-a");
  for (let y = 2013; y <= Math.floor(end); y += 3) {
    const s = el("span", null, String(y));
    s.style.left = ((y - t0) / span) * 100 + "%";
    axis.appendChild(s);
  }
  w.appendChild(axis);
  return w;
}

const DIR = "/assets/photography/";
let manifest;
async function loadPhotos() {
  if (!manifest) {
    try {
      const r = await fetch(DIR + "photos.json", { cache: "no-cache" });
      const j = r.ok ? await r.json() : [];
      manifest = Array.isArray(j) ? j.filter((p) => p && /^[\w-]+$/.test(p.id) && /^[\w-]+$/.test(p.cat || "x")) : [];
    } catch { manifest = []; }
  }
  return manifest;
}
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

function lightbox(p) {
  const o = el("div", "lb-o");
  o.setAttribute("role", "dialog");
  o.setAttribute("aria-label", p.alt || "Photo");
  const img = el("img");
  img.src = `${DIR}web/l-${p.id}.jpg`;
  img.alt = p.alt || "";
  const close = el("button", "lb-x", "Close");
  close.type = "button";
  const done = () => { o.remove(); document.removeEventListener("keydown", key); };
  const key = (e) => { if (e.key === "Escape") done(); };
  o.addEventListener("click", done);
  document.addEventListener("keydown", key);
  o.append(img, close);
  document.body.appendChild(o);
  close.focus();
}

// A named category shows all its photos; otherwise a random handful. Returns null when nothing matches.
export async function gallery(q = "") {
  const all = await loadPhotos();
  const cat = photoCat(q);
  const pool = cat ? all.filter((p) => p.cat === cat) : all.filter((p) => p.cat !== "edited");
  const list = (cat ? pool : shuffle(pool)).slice(0, 6);
  if (!list.length) return null;
  const g = el("div", "gal");
  list.forEach((p) => {
    const b = el("button", "gal-i");
    b.type = "button";
    b.setAttribute("aria-label", p.alt || "Open photo");
    const img = el("img");
    img.src = `${DIR}web/t-${p.id}.jpg`;
    img.alt = p.alt || "";
    img.loading = "lazy";
    img.decoding = "async";
    b.appendChild(img);
    b.onclick = () => lightbox(p);
    g.appendChild(b);
  });
  return g;
}

// Markdown subset the model may use: **bold**, `code`, [text](url), "- " and "1. " lists, paragraphs.
function inline(parent, text) {
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\((?:https?:\/\/|mailto:|\/)[^)\s]+\))/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) parent.appendChild(document.createTextNode(text.slice(last, m.index)));
    const tok = m[0];
    if (tok[0] === "*") parent.appendChild(el("strong", null, tok.slice(2, -2)));
    else if (tok[0] === "`") parent.appendChild(el("code", null, tok.slice(1, -1)));
    else {
      const [, label, href] = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      const a = el("a", null, label);
      a.href = href;
      if (/^https?:/.test(href)) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
      parent.appendChild(a);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) parent.appendChild(document.createTextNode(text.slice(last)));
}
// Parsed blocks: [{type:"p"|"ul"|"ol", items:[string]}]
export function parseMd(text) {
  const out = [];
  for (const raw of String(text).split(/\n+/)) {
    const s = raw.trim();
    if (!s) continue;
    const ul = s.match(/^[-*•]\s+(.*)$/), ol = s.match(/^\d+[.)]\s+(.*)$/);
    const type = ul ? "ul" : ol ? "ol" : "p";
    const body = ul ? ul[1] : ol ? ol[1] : s.replace(/^#{1,4}\s+/, "");
    const last = out[out.length - 1];
    if (type !== "p" && last && last.type === type) last.items.push(body);
    else out.push({ type, items: [body] });
  }
  return out;
}
export function blockNode(b) {
  if (b.type === "p") { const p = el("p"); inline(p, b.items[0]); return p; }
  const l = el(b.type === "ul" ? "ul" : "ol", "ml");
  b.items.forEach((t) => { const li = el("li"); inline(li, t); l.appendChild(li); });
  return l;
}
