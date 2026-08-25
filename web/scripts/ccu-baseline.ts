// Time-of-day CCU baseline — judges a part-finished day against the same clock
// slots on earlier days instead of against a whole-day number.
//
//   npm run ccu-baseline -- <universeId> [<universeId> ...] [--slots HH:MM-HH:MM]
//
// Why this exists. The daily-peak comparison cannot answer "is today actually
// down" before the day ends, because today is half a day and its baseline is
// whole days. Two failure modes follow, and we hit both:
//
//   - Read at noon, every day looks like a collapse.
//   - Read through `npm run anomaly`, a real 50% fall reads as normal. On
//     2026-08-25 the z-model scored PeakConcurrentPlayers at z -0.10 to -1.70
//     on three games that were each at or one off their 28-day floor, because a
//     series that swung 147K to 543K DAU inside a fortnight has a standard
//     deviation wide enough to swallow anything.
//
// The fix is to stop comparing aggregates. Every point here is one XX:00 or
// XX:30 UTC slot measured against that same slot on other days, so the
// time-of-day shape divides out and only elapsed slots are ever used.
//
// Source is Open Cloud, NOT the corpus CSVs, and that is not a preference:
//
//   - The gateway truncates sub-daily windows to the final 24h, and the
//     exporter then gap-fills the unserved slots as zero. Measured 2026-08-25,
//     390 of 504 half-hour PCU rows for 10030829154 are FILLED_ZERO against a
//     real value — 77% fabricated. The genuine rows agree with Open Cloud
//     (106/111, 70/70, 511/539); it is only the filled ones that are fiction.
//   - Open Cloud serves HalfHour across the whole 28-day retention window, so
//     the baseline is 27 prior days deep on the first run rather than however
//     many grabs happen to have accumulated.
//
// The final bucket is always dropped. With endTime past now,
// PeakConcurrentPlayers carries its last value forward — 11:30 and 12:00 came
// back byte-identical on three universes at 11:44Z. CLAUDE.md documents that
// phantom at OneDay; it fires at HalfHour too.

import "./loader-hooks.mjs";

// Dynamic, not static: ESM hoists static imports above the loader-hook
// registration, so "../src/lib/..." would resolve before the resolver is ready.
const { apiKey } = await import("../src/lib/opencloud.ts");

const BASE = "https://apis.roblox.com/analytics-query-api/v1";
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const RETENTION_DAYS = 27; // the API refuses 28+ on PeakConcurrentPlayers

const args = process.argv.slice(2);
const universes = args.filter((a) => /^\d+$/.test(a));
const si = args.indexOf("--slots");
const slotRange = si > -1 ? args[si + 1] : undefined;

if (!universes.length) {
  console.error("usage: npm run ccu-baseline -- <universeId> [...] [--slots 00:00-11:30]");
  process.exit(2);
}
const key = apiKey();
if (!key) {
  console.error("no Open Cloud key: put it in web/.opencloud-key or set ROBLOX_API_KEY");
  process.exit(2);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const iso = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, "Z");
const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
const med = (a: number[]) => {
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const dowOf = (d: string) => new Date(d + "T00:00:00Z").getUTCDay();
const num = (v: number) => Math.round(v).toLocaleString("en-US");

type Point = { time: string; value: number };

async function halfHourPcu(universeId: string): Promise<Point[]> {
  const now = new Date();
  // Tomorrow 00:00Z. endTime is exclusive at the day boundary, so this is what
  // includes today — see the Open Cloud section of CLAUDE.md.
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  const start = new Date(end.getTime() - RETENTION_DAYS * 86400_000);
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(BASE + "/universes/" + universeId + "/metrics", {
      method: "POST",
      headers: { "x-api-key": key as string, "content-type": "application/json" },
      body: JSON.stringify({
        metric: "PeakConcurrentPlayers",
        granularity: "HalfHour",
        startTime: iso(start),
        endTime: iso(end),
      }),
    });
    const text = await res.text();
    // A 429 is never an answer about a game — back off rather than record it.
    if (res.status === 429 && attempt < 4) {
      await sleep(4000 * (attempt + 1));
      continue;
    }
    if (!res.ok) throw new Error(res.status + " " + text.slice(0, 200).replace(/\s+/g, " "));
    let body = JSON.parse(text) as {
      done?: boolean;
      path?: string;
      response?: { values?: { dataPoints?: Point[] }[] };
    };
    for (let i = 0; i < 40 && body.done === false && body.path; i++) {
      await sleep(1000);
      const r = await fetch("https://apis.roblox.com/analytics-query-api/" + body.path, {
        headers: { "x-api-key": key as string },
      });
      if (!r.ok) throw new Error("poll " + r.status);
      body = await r.json();
    }
    const pts = (body.response?.values ?? []).flatMap((v) => v.dataPoints ?? []);
    return pts.sort((a, b) => a.time.localeCompare(b.time));
  }
}

for (const universeId of universes) {
  let points: Point[];
  try {
    points = await halfHourPcu(universeId);
  } catch (e) {
    console.error("\n" + universeId + ": FAILED — " + (e as Error).message);
    continue;
  }

  // Drop the carry-forward tail bucket, then index day -> slot -> value.
  const byDay: Record<string, Record<string, number>> = {};
  for (const p of points.slice(0, -1)) {
    const day = p.time.slice(0, 10);
    (byDay[day] ??= {})[p.time.slice(11, 16)] = p.value;
  }
  const days = Object.keys(byDay).sort();
  const today = days[days.length - 1];

  // Compare only slots we hold for today. A prior day must be complete to be a
  // baseline, or a truncated day would drag the level down for free.
  let slots = Object.keys(byDay[today]).sort();
  if (slotRange) {
    const [lo, hi] = slotRange.split("-");
    slots = slots.filter((s) => s >= lo && s <= hi);
  }
  const prior = days.filter((d) => d < today && Object.keys(byDay[d]).length >= 47);
  if (!slots.length || !prior.length) {
    console.error(
      "\n" + universeId + ": not enough data (" + slots.length + " slots today, " + prior.length + " complete prior days)"
    );
    continue;
  }

  const windowMean = (d: string) => mean(slots.map((s) => byDay[d][s] ?? 0));
  const todayMean = windowMean(today);

  console.log("\n" + "=".repeat(72));
  console.log(
    "universe " + universeId + " · " + today + " " + DOW[dowOf(today)] +
    " · slots " + slots[0] + "-" + slots[slots.length - 1] + " UTC (" + slots.length + ")" +
    " · " + prior.length + " complete prior days"
  );
  console.log("\ntoday, mean CCU over those slots: " + num(todayMean));

  // Four baselines, never one. A single window can sit on a trough or a spike
  // and make the same day read as a recovery or a collapse.
  const sets: Record<string, string[]> = {
    ["same weekday (" + DOW[dowOf(today)] + ")"]: prior.filter((d) => dowOf(d) === dowOf(today)),
    "last 7 days": prior.slice(-7),
    "last 14 days": prior.slice(-14),
    ["all " + prior.length + " days"]: prior,
  };
  console.log("\n  baseline                  n    base CCU     vs base   median per-slot");
  for (const [label, ds] of Object.entries(sets)) {
    if (!ds.length) continue;
    const base = mean(ds.map(windowMean));
    // Per-slot median is the robust reading: one wild slot cannot move it, and
    // it answers "how does a typical hour compare" rather than "how do the
    // totals compare", which a single spike can dominate.
    const perSlot = slots.map((s) => byDay[today][s] / med(ds.map((d) => byDay[d][s] ?? 0)));
    console.log(
      "  " + label.padEnd(24) + String(ds.length).padStart(2) +
      "  " + num(base).padStart(10) +
      "  " + ((todayMean / base - 1) * 100).toFixed(1).padStart(9) + "%" +
      "  " + ((med(perSlot) - 1) * 100).toFixed(1).padStart(14) + "%"
    );
  }

  // Rank is the claim that needs no baseline choice at all.
  const ranked = [...prior, today].map((d) => ({ d, v: windowMean(d) })).sort((a, b) => b.v - a.v);
  const pos = ranked.findIndex((r) => r.d === today) + 1;
  console.log("\n  rank on this window: " + pos + " of " + ranked.length + "  (1 = highest)");
  console.log("    highest: " + ranked.slice(0, 3).map((r) => r.d.slice(5) + " " + num(r.v)).join("   "));
  console.log("    lowest:  " + ranked.slice(-3).map((r) => r.d.slice(5) + " " + num(r.v)).join("   "));

  console.log("\n  same window, last 10 days + today:");
  const scale = ranked[0].v / 44;
  for (const d of [...prior.slice(-10), today]) {
    const v = windowMean(d);
    console.log(
      "    " + d + " " + DOW[dowOf(d)] + " " + num(v).padStart(8) +
      "  " + "#".repeat(Math.max(1, Math.round(v / scale))) + (d === today ? "  <- today" : "")
    );
  }

  // Uniform deficit vs one concentrated in particular hours. A break in the
  // game costs the same share of players in every slot; a calendar effect bites
  // only in the hours those players were online.
  const base14 = prior.slice(-14);
  console.log("\n  per-slot vs median of last " + base14.length + " days:");
  let line = "";
  for (const s of slots) {
    const b = med(base14.map((d) => byDay[d][s] ?? 0));
    line += "  " + s + (b > 0 ? ((byDay[today][s] / b - 1) * 100).toFixed(0) : "-").padStart(5) + "%";
    if (line.length > 88) {
      console.log("   " + line);
      line = "";
    }
  }
  if (line) console.log("   " + line);
}
