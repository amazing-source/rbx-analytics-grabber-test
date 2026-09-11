// CCU is current to the hour, so 11 Sep IS readable at D+7 — but only against the
// same elapsed clock window on 4 Sep. A partial day's peak vs a whole day's is
// a manufactured collapse. Reads Open Cloud directly: the corpus half-hour rows
// are largely gap-filled zeros (F18) and cannot be used for this.
const { query, points } = require("../oc.js");
const fs = require("fs");
const G = [["9963622286","Brainrot"],["10030829154","Waterslide"],["10399712766","Monkey"],
           ["10565445771","Verity"],["10638354731","Seal"]];
(async () => {
  const now = new Date();
  const cutoff = now.getUTCHours()*60 + now.getUTCMinutes();
  const OUT = { cutoff: now.toISOString().slice(11,16), pre:"2026-09-04", post:"2026-09-11", games:{} };
  for (const [id,n] of G) {
    const j = await query(id, { metric:"PeakConcurrentPlayers", granularity:"HalfHour",
      startTime:"2026-09-04T00:00:00Z", endTime:"2026-09-12T00:00:00Z", limit:2000 });
    if (j.error) { console.log(`${n}: ${j.error}`); continue; }
    const byDay = {};
    for (const p of points(j)) {
      const d = p.ts.slice(0,10), hm = p.ts.slice(11,16);
      if (+hm.slice(0,2)*60 + +hm.slice(3,5) > cutoff) continue;
      (byDay[d] ??= {})[hm] = p.value;
    }
    const a = byDay[OUT.pre]||{}, b = byDay[OUT.post]||{};
    const bk = Object.keys(b).sort(); if (bk.length) delete b[bk[bk.length-1]];  // F19 carry-forward
    const shared = Object.keys(a).filter(k => k in b).sort();
    if (!shared.length) continue;
    const pa = Math.max(...shared.map(k=>a[k])), pb = Math.max(...shared.map(k=>b[k]));
    OUT.games[id] = { before:pa, after:pb, delta:pb/pa-1, slots:shared.length };
    console.log(`${n.padEnd(12)} ${Math.round(pa)} -> ${Math.round(pb)}  ${((pb/pa-1)*100).toFixed(1)}%  ${shared.length} slots`);
  }
  fs.writeFileSync(__dirname+"/ccu.json", JSON.stringify(OUT,null,1));
  console.log("wrote ccu.json");
})();
