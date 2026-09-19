import { chromium } from "playwright";
import fs from "node:fs";
const D = "C:/Users/bfhdh/AppData/Local/Temp/claude/C--Users-bfhdh-Desktop-rbx-analytics-grabber-test/fb8ff605-a6d6-42e6-8b98-633289ac7a69/scratchpad/profile/";
const body = fs.readFileSync(D + "rendered.html", "utf8");
// GitHub's own markdown stylesheet, so the preview matches the real page.
const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.1/github-markdown-light.min.css">
<style>body{margin:0;background:#fff;display:flex;justify-content:center}
.markdown-body{box-sizing:border-box;max-width:980px;padding:32px 40px;width:100%}</style>
</head><body><article class="markdown-body">${body}</article></body></html>`;
fs.writeFileSync(D + "preview.html", html);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1040, height: 1400 } });
const bad = [];
p.on("response", r => { if (r.request().resourceType() === "image" && r.status() >= 400) bad.push(`${r.status()} ${r.url().slice(0, 70)}`); });
await p.goto("file:///" + D + "preview.html", { waitUntil: "networkidle", timeout: 90_000 });
await p.waitForTimeout(3000);
await p.screenshot({ path: D + "preview.png", fullPage: true });
console.log("broken images:", bad.length ? bad : "none");
await b.close();
