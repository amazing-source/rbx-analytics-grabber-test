import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1240, height: 1150 } });
const errs = [];
p.on("console", m => { if (m.type() === "error") errs.push(m.text().slice(0, 160)); });
p.on("pageerror", e => errs.push("PAGEERROR " + e.message.slice(0, 160)));
await p.goto("http://localhost:3000/live", { waitUntil: "networkidle", timeout: 90_000 });
await p.waitForTimeout(4000);
await p.screenshot({ path: "C:/Users/bfhdh/Desktop/rbx-analytics-grabber-test/tools/artifacts/out/_shot-live.png" });
const d = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
  cards: document.querySelectorAll(".card").length, feed: document.querySelectorAll(".feed li").length }));
console.log("cards", d.cards, "feed rows", d.feed, "| scrollW", d.sw, "clientW", d.cw, d.sw > d.cw + 1 ? "H-SCROLL" : "ok");
console.log("console errors:", errs.length ? errs : "none");
await b.close();
