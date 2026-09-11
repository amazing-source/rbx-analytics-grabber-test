// Assemble every number the D+7 artifacts need, from tools/lib.js only, so
// nothing is hand-transcribed.
//
// WINDOW: D+7 point to point — the publish days (3–4 Sep) against the same two
// weekdays seven days on (10–11 Sep) — PLUS the full daily run from 3 Sep to
// 11 Sep for every metric, so the path between the endpoints is visible.
// 11 Sep is not served for behavioural metrics (they lag ~2 days) and four do
// not reach 10 Sep either; each metric records WHICH day it landed on rather
// than silently substituting one.
const { daily, byBreakdown } = require("../lib.js");
const METRICS = require("./metrics.js");
const fs = require("fs");
const path = require("path");

const PRE  = ["2026-09-03","2026-09-04"];
const POST = ["2026-09-10","2026-09-11"];
const FALLBACK = ["2026-09-09","2026-09-08"];
const RUN = (() => { const o=[]; const d=new Date("2026-09-03T00:00:00Z");
  while (d <= new Date("2026-09-11T00:00:00Z")) { o.push(d.toISOString().slice(0,10)); d.setUTCDate(d.getUTCDate()+1); }
  return o; })();

const mean = (m, ds) => { if (!m) return null;
  const v = ds.map(d => m.get(d)).filter(x => x != null && Number.isFinite(x));
  return v.length ? v.reduce((a,b)=>a+b,0)/v.length : null; };

const GAMES = [
  { id:"9963622286",  slug:"brainrot",   name:"Become a Brainrot",            peak:"2026-07-25", peakDau:776393,
    build:"v608", buildAt:"2026-09-04 12:17", newest:"v612" },
  { id:"10030829154", slug:"waterslide", name:"Climb Waterslide and Slide",   peak:"2026-08-02", peakDau:688061,
    build:"03 Sep update", buildAt:"2026-09-03 18:00", newest:"v1721 + new world place" },
  { id:"10399712766", slug:"monkey",     name:"+1 Banana Monkey Destruction", peak:"2026-08-05", peakDau:975727,
    build:"v1246", buildAt:"2026-09-04 17:35", newest:"v1251" },
  { id:"10565445771", slug:"verity",     name:"Verity Companion [AI]",        peak:"2026-08-23", peakDau:1281398,
    build:"v684", buildAt:"2026-09-04 19:40", newest:"v693" },
  { id:"10638354731", slug:"seal",       name:"Seal A Driveway",              peak:"2026-08-28", peakDau:533776,
    build:"v914", buildAt:"2026-09-04 20:22", newest:"v915" },
];

const out = { generated:new Date().toISOString(), pre:PRE, post:POST, run:RUN, games:[] };

for (const g of GAMES) {
  const rec = { ...g, metrics:[], daily:{}, funnel:[], peakPct:[] };

  for (const [group, label, metric, unit, lower] of METRICS) {
    let m = null; try { m = daily(g.id, metric); } catch (e) { m = null; }
    const before = mean(m, PRE);
    let after = mean(m, POST), postDays = POST.filter(d => m && m.has(d)), lag = null;
    if (after == null) {
      for (const d of FALLBACK) if (m && m.has(d)) { after = m.get(d); postDays = [d]; lag = d; break; }
    }
    const run = RUN.map(d => (m && m.has(d)) ? m.get(d) : null);
    if (before == null && after == null && !run.some(v => v != null)) continue;
    rec.metrics.push({ group, label, metric, unit, lower, before, after, postDays, lag, run,
      // A percentage change across zero is meaningless (-7 -> +35 is not -567%).
      // Mark it and let the renderer print the absolute move instead.
      signFlip: (before != null && after != null && before * after < 0),
      delta: (before != null && after != null && before && before * after > 0) ? (after/before - 1) : null });
  }

  for (const k of ["DailyActiveUsers","UniqueUsersWithImpressions","PeakConcurrentPlayers"]) {
    let m = null; try { m = daily(g.id, k); } catch (e) {}
    rec.daily[k] = m ? [...m].filter(([d]) => d >= "2026-08-25" && d <= "2026-09-11") : [];
  }

  let dau = null; try { dau = daily(g.id, "DailyActiveUsers"); } catch (e) {}
  if (dau) rec.peakPct = [...dau].filter(([d]) => d >= "2026-07-18" && d <= "2026-09-11").map(([d,v]) => [d, v/g.peakDau]);

  // Funnels, grouped by FunnelName scope. A scope naming several funnels is a
  // union query and is skipped, so a completion rate is never a blend.
  const raw = JSON.parse(fs.readFileSync(path.join(__dirname,"../../data/games",g.id,"series.json"),"utf8"));
  const fm = raw.metrics["FunnelCohortCompletionRate"];
  if (fm) {
    const scopes = {};
    for (const s of fm.series) {
      if (s.granularity !== "METRIC_GRANULARITY_ONE_DAY") continue;
      if (!Object.keys(s.breakdown||{}).includes("FunnelStep")) continue;
      const fn = ((s.filters||[]).find(f => (f.dimension||f.name) === "FunnelName")||{}).values;
      if (!fn || fn.length !== 1) continue;
      const step = (s.breakdownLabels && s.breakdownLabels.FunnelStep) || s.breakdown.FunnelStep;
      const pts = new Map();
      for (const p of s.points) { if (p.partial || p.status === "FILLED_ZERO") continue; if (!pts.has(p.date)) pts.set(p.date, p.value); }
      const a = mean(pts, PRE), b = mean(pts, POST) ?? mean(pts, FALLBACK);
      if (a == null || b == null) continue;
      (scopes[fn[0]] ??= []).push({ step, before:a, after:b, dpp:(b-a)*100 });
    }
    for (const [name, steps] of Object.entries(scopes)) {
      const ord = steps.slice().sort((a,b) => b.after - a.after);
      ord.forEach((s,i) => {
        const pa = i ? ord[i-1].before : null, pb = i ? ord[i-1].after : null;
        s.stepBefore = i ? (pa ? s.before/pa : null) : 1;
        s.stepAfter  = i ? (pb ? s.after/pb  : null) : 1;
        s.churnBefore = s.stepBefore == null ? null : 1 - s.stepBefore;
        s.churnAfter  = s.stepAfter  == null ? null : 1 - s.stepAfter;
        s.idx = i+1;
      });
      let worst = null;
      for (const s of ord) if (s.churnAfter != null && (!worst || s.churnAfter > worst.churnAfter)) worst = s;
      rec.funnel.push({ name, steps: ord, total: ord.length ? ord[ord.length-1].after : null,
        biggestDrop: worst ? worst.step : null });
    }
  }
  out.games.push(rec);
}

fs.writeFileSync(__dirname + "/data.json", JSON.stringify(out));
console.log("wrote data.json — metrics per game:",
  out.games.map(g => `${g.slug}:${g.metrics.length}`).join(" "));
