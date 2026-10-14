// Makes web copies of assets/photography/* (640px thumbnails and 1600px lightbox images) and photos.json.
// Uses macOS `sips`. Name originals <category>-<n>.jpg, for example birds-2.JPG.
import { readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
const d = new URL("../assets/photography/", import.meta.url).pathname;
mkdirSync(d + "web", { recursive: true });
const out = [];
for (const f of readdirSync(d).sort()) {
  if (!/\.jpe?g$/i.test(f)) continue;
  const id = f.replace(/\.[^.]+$/, "").toLowerCase();
  for (const [pre, size, q] of [["t", 640, 70], ["l", 1600, 78]])
    execFileSync("sips", ["-Z", size, "--setProperty", "format", "jpeg", "--setProperty", "formatOptions", q, d + f, "--out", `${d}web/${pre}-${id}.jpg`], { stdio: "ignore" });
  const cat = id.replace(/-\d+$/, "");
  out.push({ id, cat, alt: `${cat[0].toUpperCase() + cat.slice(1)} photograph by Anil` });
}
writeFileSync(d + "photos.json", JSON.stringify(out, null, 1) + "\n");
console.log(out.length + " photos");
