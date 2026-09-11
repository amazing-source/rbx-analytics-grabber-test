import { chromium } from "playwright";
import fs from "node:fs";
const A="C:/Users/bfhdh/Desktop/rbx-analytics-grabber-test/tools/artifacts/out/";
const SHELL=(b)=>`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html{color-scheme:light}body{margin:0;font:14px system-ui}img{max-width:100%}</style></head><body>${b}</body></html>`;
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:430,height:900}});
fs.writeFileSync(A+"_of.tmp.html", SHELL(fs.readFileSync(A+"monkey.html","utf8")));
await p.goto("file:///"+A+"_of.tmp.html"); await p.waitForTimeout(2000);
const bad=await p.evaluate(()=>{const out=[];const W=document.documentElement.clientWidth;
 document.querySelectorAll("*").forEach(e=>{const r=e.getBoundingClientRect();
  if(r.right>W+1) out.push({tag:e.tagName.toLowerCase(),cls:e.className&&String(e.className).slice(0,40),
   right:Math.round(r.right),w:Math.round(r.width),txt:(e.textContent||"").trim().slice(0,45)});});
 return out.slice(0,12);});
console.log("clientWidth 430 — elements past it:"); for(const x of bad) console.log(x);
await b.close();
