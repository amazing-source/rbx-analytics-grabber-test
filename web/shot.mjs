import { chromium } from "playwright";
import fs from "node:fs";
const A = "C:/Users/bfhdh/Desktop/rbx-analytics-grabber-test/tools/artifacts/out/";
const SHELL = (b)=>`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html{color-scheme:light}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>${b}</body></html>`;
const b = await chromium.launch();
for (const [name,w] of [["cover",1200],["seal",1200],["verity",1200],["monkey",430]]) {
  const p = await b.newPage({ viewport:{width:w,height:1100} });
  fs.writeFileSync(A+`_${name}.tmp.html`, SHELL(fs.readFileSync(A+`${name}.html`,"utf8")));
  await p.goto("file:///"+A+`_${name}.tmp.html`);
  await p.waitForTimeout(2500);
  await p.screenshot({ path:A+`_shot-${name}-${w}.png`, fullPage:false });
  const d = await p.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
  console.log(name.padEnd(11), w, "scrollW",d.sw,"clientW",d.cw, d.sw>d.cw+1?"<-- H-SCROLL":"ok");
  await p.close();
}
await b.close();
