// One look at a rendered page: full-page screenshot at desktop and phone width, plus an H-scroll check.
//   node tools/r0919/shot.mjs <slug> [width...]
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const OUT = path.resolve("reports/2026-09-19/out");
const SHELL = b => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html{color-scheme:light}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>${b}</body></html>`;
const [slug, ...ws] = process.argv.slice(2);
const b = await chromium.launch();
for (const w of (ws.length ? ws.map(Number) : [1200, 420])) {
  const p = await b.newPage({ viewport: { width: w, height: 1000 }, deviceScaleFactor: 1 });
  const tmp = path.join(OUT, `_${slug}.tmp.html`);
  fs.writeFileSync(tmp, SHELL(fs.readFileSync(path.join(OUT, `${slug}.html`), "utf8")));
  await p.goto(pathToFileURL(tmp).href);
  await p.waitForTimeout(2000);
  await p.screenshot({ path: path.join(OUT, `_shot-${slug}-${w}.png`), fullPage: true });
  const doc = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, h: document.documentElement.scrollHeight }));
  console.log(slug, w, "height", doc.h, doc.sw > doc.cw + 1 ? "<-- H-SCROLL" : "no h-scroll");
  await p.close(); fs.unlinkSync(tmp);
}
await b.close();
