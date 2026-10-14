import { answer, START, MAIL_LINK, IN_LINK } from "./kb.mjs";
import { visualIntent, wantsPhotos, leadFor, careerGraph, gallery, parseMd, blockNode } from "./rich.mjs";

const $ = (id) => document.getElementById(id);
const list = $("list"), chipsEl = $("chips"), form = $("f"), input = $("q"), go = $("go");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const MAX_MSGS = 24;
const mobile = matchMedia("(max-width: 640px)");
const root = document.documentElement;
const convo = []; // [{role, content}] sent to the API, last 6 only
let busy = false;

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function trim() {
  while (list.children.length > MAX_MSGS) list.lastElementChild.remove(); // column-reverse: oldest is last
}
function addUser(text) {
  const row = el("div", "row u");
  row.appendChild(el("div", "bub", text));
  list.prepend(row);
  trim();
}
function addAi() {
  const row = el("div", "row");
  const box = el("div", "ai");
  box.appendChild(el("div", "lb", "ANIL.AI"));
  const dots = el("div", "dots");
  dots.setAttribute("aria-label", "Thinking");
  dots.append(el("i"), el("i"), el("i"));
  box.appendChild(dots);
  row.appendChild(box);
  list.prepend(row);
  trim();
  return { box, dots };
}
function line(box, l) {
  if (l.b) {
    const d = el("div", "bl");
    d.appendChild(el("span", null, l.t));
    box.appendChild(d);
  } else box.appendChild(el("p", null, l.t));
}
function links(box, items) {
  if (!items.length) return;
  const w = el("div", "lk");
  for (const k of items) {
    const a = el("a", k.dl ? "dl" : "", k.label);
    a.href = k.href;
    if (k.dl || /^https?:/.test(k.href)) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
    w.appendChild(a);
  }
  box.appendChild(w);
}
function setChips(labels) {
  chipsEl.textContent = "";
  for (const l of labels.slice(0, 4)) {
    const b = el("button", null, l);
    b.type = "button";
    b.onclick = () => ask(l);
    chipsEl.appendChild(b);
  }
}
function setBusy(v) {
  busy = v;
  go.disabled = v;
  input.disabled = v;
}

// Plain model text -> lines. "- " or "* " starts a bullet.
function parse(text) {
  return text.split(/\n+/).map((s) => s.trim()).filter(Boolean).map((s) => {
    const m = s.match(/^[-*•]\s+(.*)$/);
    return m ? { t: m[1], b: true } : { t: s, b: false };
  });
}
function linksFor(text) {
  const out = [];
  if (/bornfreeani@gmail\.com|email/i.test(text)) out.push(MAIL_LINK);
  if (/linkedin/i.test(text)) out.push(IN_LINK);
  return out;
}

async function callApi(q) {
  const r = await fetch("/api/ask", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ q, history: convo.slice(-4) }),
    signal: AbortSignal.timeout(25000)
  });
  if (!r.ok) throw new Error("api " + r.status);
  const j = await r.json();
  if (!j || typeof j.answer !== "string" || !j.answer) throw new Error("empty");
  return j.answer;
}

// Types the text of a node in word by word, like a streamed reply.
async function typeIn(node) {
  const tw = document.createTreeWalker(node, NodeFilter.SHOW_TEXT), parts = [];
  for (let n; (n = tw.nextNode()); ) parts.push([n, n.nodeValue]);
  parts.forEach(([n]) => (n.nodeValue = ""));
  const total = parts.reduce((a, [, t]) => a + t.length, 0);
  const step = Math.max(2, Math.ceil(total / 55)); // about 55 ticks per block
  for (const [n, full] of parts) {
    for (let i = step; i < full.length + step; i += step) {
      n.nodeValue = full.slice(0, i);
      await wait(22);
    }
    n.nodeValue = full;
  }
}
const nearEnd = () => list.scrollTo?.({ top: 0 }); // column-reverse: scrollTop 0 is the newest message

async function ask(raw) {
  const q = String(raw || "").trim().slice(0, 200);
  if (!q || busy) return;
  enterChat();
  setBusy(true);
  chipsEl.textContent = "";
  addUser(q);
  const { box, dots } = addAi();
  const kb = answer(q);
  const vis = visualIntent(q);
  const t0 = performance.now();
  let blocks = null, lines, lk = [], text = null;
  if (vis) {
    // Visual answers need no model call: instant and free.
    text = leadFor(vis, q);
    lines = [{ t: text, b: false }];
  } else {
    try {
      text = await callApi(q);
      blocks = parseMd(text);
      lk = wantsPhotos(q) ? [] : linksFor(text); // no contact links under hobby and photo answers
    } catch {
      // API down, rate limited or not deployed: use the offline matcher over the same profile.
      const unmatched = kb.lines === undefined || !kb.n || kb.lines[0].t.startsWith("I can only answer");
      if (unmatched) {
        lines = [{ t: "AI is unavailable right now. Please reach me directly:", b: false }];
        lk = [MAIL_LINK, IN_LINK];
      } else {
        lines = kb.lines;
        lk = kb.links || [];
        text = lines.map((l) => l.t).join("\n");
      }
    }
  }
  if (!reduce) await wait(Math.max(0, (vis ? 350 : 600) - (performance.now() - t0)));
  dots.remove();
  if (blocks) {
    for (let i = 0; i < blocks.length; i++) {
      const n = blockNode(blocks[i]);
      box.appendChild(n);
      if (!reduce) await typeIn(n);
    }
  } else {
    for (let i = 0; i < lines.length; i++) {
      line(box, lines[i]);
      if (!reduce && i < lines.length - 1) await wait(320);
    }
  }
  if (vis === "career") box.appendChild(careerGraph());
  if (vis === "photos" || (!vis && wantsPhotos(q))) {
    const g = await gallery(q);
    if (g) box.appendChild(g);
    else if (vis === "photos") box.appendChild(Object.assign(document.createElement("p"), { textContent: "Photos are coming soon." }));
  }
  links(box, lk);
  nearEnd();
  if (text) {
    convo.push({ role: "user", content: q }, { role: "assistant", content: text });
    convo.splice(0, Math.max(0, convo.length - 6));
  }
  setChips(vis ? NEXT[vis] : kb.n || START);
  setBusy(false);
  if (!mobile.matches) input.focus({ preventScroll: true });
}
const NEXT = {
  career: ["What impact have you had?", "Tell me about FICO", "What do you do outside work?"],
  photos: ["Show your career graph", "What are your hobbies?", "How can I contact you?"]
};

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const v = input.value;
  input.value = "";
  ask(v);
});

// Mobile: landing (step 1) and full-screen chat (step 2)
// Landing <-> chat transition. The black ASK box grows to full screen while the yellow ASK button
// turns into the round chat button and slides to the bottom right, and an input bar fades in.
// Going back plays the same thing in reverse.
const EASE = "cubic-bezier(.65,0,.25,1)";
const DUR = 720;
let active = null;

function clearActive() {
  root.classList.remove("noanim");
  if (!active) return;
  active.anims.forEach((x) => x.cancel());
  active.els.forEach((e) => e.remove());
  active = null;
}
const px = (r) => ({ left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px" });
const fixed = (e, r, z) => {
  Object.assign(e.style, { position: "fixed", margin: "0", boxSizing: "border-box", zIndex: z, pointerEvents: "none", ...px(r) });
  document.body.appendChild(e);
  return e;
};
// Returns the overlay pieces: black box, button clone and a fake input bar.
function pieces(boxR, btnR, goR, qR) {
  const gloss = document.querySelector(".gloss");
  const ov = gloss.cloneNode(true);
  ov.removeAttribute("id");
  ov.setAttribute("aria-hidden", "true");
  ov.querySelector("button").remove();
  const btn = $("lgo").cloneNode(true);
  btn.removeAttribute("id");
  btn.tabIndex = -1;
  btn.className = "fl-btn";
  btn.setAttribute("aria-hidden", "true");
  const fake = el("div", "fl-in", "Ask: who are you? what have you done with Angular?");
  fake.setAttribute("aria-hidden", "true");
  fixed(ov, boxR, "100");
  fixed(fake, qR, "101");
  fixed(btn, btnR, "102");
  return { ov, btn, fake, label: btn.querySelector("span") };
}
const BOX_FULL = () => ({ left: 0, top: 0, width: innerWidth, height: innerHeight });
const set = (e, o) => e.animate(o, { duration: DUR, easing: EASE, fill: "forwards" });

function run(p, from, to, done) {
  // from/to: { box, btn, rBox, rBtn, pad, gap, labelOn, inputOn }
  const A = [];
  const frame = (side) => ({ ...px(side.box), borderRadius: side.rBox });
  A.push(set(p.ov, [frame(from), frame(to)]));
  A.push(set(p.btn, [{ ...px(from.btn), padding: from.pad, gap: from.gap }, { ...px(to.btn), padding: to.pad, gap: to.gap }]));
  A.push(set(p.label, [{ opacity: from.labelOn ? 1 : 0, maxWidth: from.labelOn ? "60px" : "0px" }, { opacity: to.labelOn ? 1 : 0, maxWidth: to.labelOn ? "60px" : "0px" }]));
  const fk = from.inputOn
    ? [{ opacity: 1, offset: 0 }, { opacity: 0, offset: 0.5 }, { opacity: 0, offset: 1 }]
    : [{ opacity: 0, offset: 0 }, { opacity: 0, offset: 0.45 }, { opacity: 1, offset: 1 }];
  A.push(p.fake.animate(fk, { duration: DUR, easing: "ease-out", fill: "forwards" }));
  active = { els: [p.ov, p.btn, p.fake], anims: A };
  A[0].onfinish = () => {
    const out = [p.ov, p.btn, p.fake].map((e) => e.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 240, easing: "ease-out", fill: "forwards" }));
    active.anims.push(...out);
    out[0].onfinish = () => { clearActive(); if (done) done(); };
  };
}

function enterChat() {
  if (!mobile.matches || root.classList.contains("on")) return;
  clearActive();
  const gloss = document.querySelector(".gloss");
  const boxR = gloss.getBoundingClientRect();
  const btnR = $("lgo").getBoundingClientRect();
  const animate = !reduce && gloss.animate && boxR.height > 0;
  root.classList.add("on");
  history.pushState({ chat: 1 }, "");
  list.scrollTop = 0;
  if (!animate) return;
  const goR = $("go").getBoundingClientRect(), qR = $("q").getBoundingClientRect();
  const p = pieces(boxR, btnR, goR, qR);
  run(p,
    { box: boxR, btn: btnR, rBox: "22px", pad: "0px 36px", gap: "12px", labelOn: true, inputOn: false },
    { box: BOX_FULL(), btn: goR, rBox: "0px", pad: "0px", gap: "0px", labelOn: false, inputOn: true });
}

function leaveChat() {
  if (!root.classList.contains("on")) return;
  clearActive();
  root.classList.add("noanim");
  const goR = $("go").getBoundingClientRect(), qR = $("q").getBoundingClientRect();
  if (reduce || !document.body.animate || !mobile.matches) { root.classList.remove("on", "noanim"); return; }
  // Cover the chat with the full-screen black box first, then reveal the landing underneath.
  root.classList.remove("on");
  const gloss = document.querySelector(".gloss");
  const boxR = gloss.getBoundingClientRect();
  const btnR = $("lgo").getBoundingClientRect();
  root.classList.add("on");
  const p = pieces(BOX_FULL(), goR, goR, qR);
  p.label.style.maxWidth = "0px"; p.label.style.opacity = "0";
  Object.assign(p.btn.style, { padding: "0px", gap: "0px" });
  const cover = [p.ov, p.btn, p.fake].map((e) => e.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 140, easing: "ease-out", fill: "forwards" }));
  active = { els: [p.ov, p.btn, p.fake], anims: cover };
  cover[0].onfinish = () => {
    root.classList.remove("on");
    cover.forEach((x) => x.cancel());
    run(p,
      { box: BOX_FULL(), btn: goR, rBox: "0px", pad: "0px", gap: "0px", labelOn: false, inputOn: true },
      { box: boxR, btn: btnR, rBox: "22px", pad: "0px 36px", gap: "12px", labelOn: true, inputOn: false });
  };
}
addEventListener("popstate", leaveChat);
$("back").addEventListener("click", () => {
  if (history.state && history.state.chat) history.back();
  else leaveChat();
});
$("lgo").addEventListener("click", enterChat);
// Leaving to the portfolio: the page slides out to the right, for the link and for the swipe.
const wrapEl = document.querySelector(".wrap");
function leavePage(from) {
  // The slide is a phone-only effect. On larger screens it is a normal link.
  if (!mobile.matches || reduce || !wrapEl.animate) { location.href = "/"; return; }
  try { sessionStorage.setItem("askBack", "1"); } catch {}
  root.style.overflow = "hidden";
  // Shorter when the finger already dragged part of the way. Navigation starts before the slide ends
  // so the portfolio is ready the moment the animation finishes, with no dead pause.
  const dur = Math.max(140, Math.round(240 * (1 - Math.max(0, from) / innerWidth)));
  const a = wrapEl.animate([{ transform: `translateX(${from}px)` }, { transform: "translateX(100%)" }], { duration: dur, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" });
  let gone = false;
  const go = () => { if (!gone) { gone = true; location.href = "/"; } };
  setTimeout(go, Math.round(dur * 0.7));
  a.onfinish = go;
}
document.querySelector(".top a").addEventListener("click", (e) => {
  if (!mobile.matches || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
  e.preventDefault();
  leavePage(0);
});
// Swipe left to right on the landing drags the page with the finger, like a native back gesture.
{
  let x0 = 0, y0 = 0, dx = 0, mode = ""; // mode: "" idle, "pending", "drag", "scroll"
  addEventListener("touchstart", (e) => {
    mode = mobile.matches && !root.classList.contains("on") && e.touches.length === 1 ? "pending" : "";
    if (mode) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; dx = 0; }
  }, { passive: true });
  addEventListener("touchmove", (e) => {
    if (!mode || mode === "scroll") return;
    const t = e.touches[0];
    dx = t.clientX - x0;
    const dy = t.clientY - y0;
    if (mode === "pending" && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) mode = dx > 0 && Math.abs(dx) > Math.abs(dy) ? "drag" : "scroll";
    if (mode === "drag") wrapEl.style.transform = `translateX(${Math.max(0, dx)}px)`;
  }, { passive: true });
  const end = () => {
    if (mode !== "drag") { mode = ""; return; }
    mode = "";
    if (dx > innerWidth * 0.3) {
      wrapEl.style.transform = "";
      leavePage(dx);
    } else {
      const a = wrapEl.animate([{ transform: `translateX(${dx}px)` }, { transform: "none" }], { duration: 220, easing: "ease-out" });
      wrapEl.style.transform = "";
      a.onfinish = () => a.cancel();
    }
  };
  addEventListener("touchend", end, { passive: true });
  addEventListener("touchcancel", end, { passive: true });
}
// Keep the input bar above the on-screen keyboard.
if (window.visualViewport) {
  const vv = window.visualViewport;
  const fit = () => {
    root.style.setProperty("--vvh", vv.height + "px");
    if (root.classList.contains("on")) scrollTo(0, 0);
  };
  vv.addEventListener("resize", fit);
  vv.addEventListener("scroll", fit);
  fit();
}

// Intro message
{
  const { box, dots } = addAi();
  dots.remove();
  line(box, { t: "Hi, I'm Anil's AI. Ask about his work and skills, see his career as a graph, or ask about photography. I only use his resume and profile.", b: false });
  line(box, { t: "Try a question below, or type your own.", b: false });
  setChips(START);
}
