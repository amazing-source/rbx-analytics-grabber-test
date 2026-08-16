const fs = require('fs');
const path = require('path');

const B = [];
const h1 = t => B.push({ type: 'h1', text: t });
const h2 = t => B.push({ type: 'h2', text: t });
const p = (...runs) => B.push({ type: 'para', runs: runs.map(r => typeof r === 'string' ? { t: r } : r) });
const li = (...runs) => B.push({ type: 'bullet', runs: runs.map(r => typeof r === 'string' ? { t: r } : r) });
const gap = () => B.push({ type: 'spacer' });
const b = t => ({ t, b: true });

h1('Dilan Djematene');
p({ t: 'Houilles, France  ·  dilandjematene@gmail.com  ·  06 64 71 22 68  ·  github.com/amazing-source', sz: 20, color: '5A5F7A' });
p({ t: 'Indigo Studios  ·  16 August 2026', sz: 20, color: '5A5F7A' });

gap();

p('Olivia,');

p("I have been testing games at Indigo since 2025. Over the last few weeks I started doing something the QA role does not cover: pulling the complete metrics history for a title, tracking what an update does to it after it ships, and reading the code when the numbers point somewhere specific. I would like to do that full time, and the document attached to this letter is the evidence for why the studio should want that.");

p("It started on 7 August. Become a Brainrot had been dropping since 30 July, I was not getting answers about why, so I went and looked myself. Nobody assigned me that. A forced model swap had broken day one retention on the publish day, the crash wave everyone had noticed was not the cause, and the build carried real defects including permanent inventory loss and a duplication bug. The fix for the inventory loss now refuses thousands of bad saves a week on a game that is still live.");

p("What I am good at is the join between the two halves. Plenty of people can file a bug, and plenty can read a retention chart. What has been useful here is going from a metric that moved on a specific day, to the deploy behind it, to the exact line of code, and back again to work out whether that line costs anything real. Most of what looks alarming in an error log is harmless, and some of what looks harmless is expensive. Neither side tells you which on its own.");

p("I also build the tooling rather than waiting for it. The pipeline behind those reports is mine. It pulls every metric Roblox serves, dates each change against the real publish log, and checks its own output against Roblox's exports so a wrong number gets caught before it reaches anyone. I work with AI agents daily, and that is a large part of how one person covers this much ground this fast. Full time, that gets built properly for the team instead of staying something I run by hand.");

p("I am going into my third year at Universite Paris Nanterre on the MIASHS computer science track, with the MIAGE master after it. Alongside my studies I build and ship production websites for businesses, so I am used to owning something end to end. I work in French, English and Spanish.");

p("What I want is simple. Right now whether a game gets watched after it ships depends on whether I am assigned to it and have time that week. That is a poor way to protect a portfolio, especially since Roblox deletes technical history after about a month, so a game nobody measured cannot be diagnosed later at any price. I would rather that coverage existed properly, across producers, not just on the titles I am handed.");

p("I am happy to walk through any of the attached findings, including the ones I got wrong and corrected. Those are probably the more useful ones to look at.");

gap();
p('Thank you for reading.');
gap();
p({ t: 'Dilan Djematene', b: true });

fs.writeFileSync(path.join(__dirname, 'blocks.json'), JSON.stringify(B, null, 1));
console.log('wrote ' + B.length + ' blocks');
