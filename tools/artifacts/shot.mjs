import { chromium } from "playwright";
import fs from "node:fs";
const SHELL = (b)=>`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html{color-scheme:light}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>${b}</body></html>`;
const b = await chromium.launch();
for (const [name,w] of [["cover",1200],["seal",1200],["verity",1200],["monkey",430]]) {
  const p = await b.newPage({ viewport:{width:w,height:1000}, deviceScaleFactor:1 });
  fs.writeFileSync(`out/_${name}.tmp.html`, SHELL(fs.readFileSync(`out/${name}.html`,"utf8")));
  await p.goto(new URL(`./out/_${name}.tmp.html`, import.meta.url).href);
  await p.waitForTimeout(2200);
  await p.screenshot({ path:`out/_shot-${name}-${w}.png`, fullPage:false });
  const doc = await p.evaluate(()=>({ sw:document.documentElement.scrollWidth, cw:document.documentElement.clientWidth }));
  console.log(name, w, "scrollWidth", doc.sw, "clientWidth", doc.cw, doc.sw>doc.cw+1?"<-- H-SCROLL":"ok");
  await p.close();
}
await b.close();
