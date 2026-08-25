// Snapshot the whole Roblox discovery board — every game across the public
// sorts, with its live CCU — so "is it us or the platform" stops being
// unanswerable.
//
//   npm run platform-ccu              take a snapshot, compare to earlier ones
//   npm run platform-ccu -- --top 40  show more rows
//
// Why this exists. On 2026-08-25 all our games sat ~50% below their own
// baseline and the mechanism was clearly EXPOSURE — impressions fell 28–46%
// while conversion fell only 8–20%, so Roblox was showing the games to far
// fewer people. Two causes produce that and they need opposite responses:
//
//   - the platform's audience shrank (calendar, seasonal) -> wait it out
//   - a mega-hit is eating the discovery surface -> a positioning problem
//
// Telling them apart needs ONE number over time: total concurrent players
// across the board. We had a snapshot and no history, so the question could not
// be answered on the day it mattered. This file exists so that is a one-off.
//
// Public, unauthenticated endpoints only — the same ones the logged-out website
// calls. No cookie is read or sent, which keeps this on the right side of the
// project's standing rule about credentials.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";

const OUT_DIR = path.resolve(process.cwd(), "..", "data", "platform");
const args = process.argv.slice(2);
const ti = args.indexOf("--top");
const TOP = ti > -1 ? Number(args[ti + 1]) : 25;

type Game = {
  universeId: number;
  rootPlaceId: number;
  name: string;
  playerCount: number;
  genreL1?: string;
  created?: string;
  sorts: string[];
};

const UA = { accept: "application/json", "user-agent": "Mozilla/5.0" };
const num = (v: number) => Math.round(v).toLocaleString("en-US");

async function board(): Promise<Game[]> {
  // sessionId is required but not validated — any UUID works, and none of it
  // identifies the caller.
  const sid = crypto.randomUUID();
  const r = await fetch(
    `https://apis.roblox.com/explore-api/v1/get-sorts?sessionId=${sid}&device=computer&country=all`,
    { headers: UA }
  );
  if (!r.ok) throw new Error(`get-sorts ${r.status}`);
  const body = (await r.json()) as { sorts?: { sortId: string; games?: Game[] }[] };

  // A game appears in several sorts; keep one row and remember where it ranked.
  const seen = new Map<number, Game>();
  for (const s of body.sorts ?? [])
    for (const g of s.games ?? []) {
      const prev = seen.get(g.universeId);
      if (!prev) seen.set(g.universeId, { ...g, sorts: [s.sortId] });
      else {
        prev.sorts.push(s.sortId);
        // Counts are sampled per sort and drift by seconds; keep the highest.
        if (g.playerCount > prev.playerCount) prev.playerCount = g.playerCount;
      }
    }
  return [...seen.values()].sort((a, b) => b.playerCount - a.playerCount);
}

async function enrich(games: Game[]) {
  for (let i = 0; i < games.length; i += 50) {
    const slice = games.slice(i, i + 50);
    const r = await fetch(
      `https://games.roblox.com/v1/games?universeIds=${slice.map((g) => g.universeId).join(",")}`,
      { headers: UA }
    );
    if (!r.ok) continue;
    const meta = new Map<number, { created?: string }>();
    for (const d of ((await r.json()) as { data?: { id: number; created?: string }[] }).data ?? [])
      meta.set(d.id, d);
    for (const g of slice) g.created = meta.get(g.universeId)?.created?.slice(0, 10);
    await new Promise((res) => setTimeout(res, 400));
  }
}

const games = await board();
await enrich(games);

const total = games.reduce((s, g) => s + g.playerCount, 0);
const stamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
mkdirSync(OUT_DIR, { recursive: true });
const file = path.join(OUT_DIR, `ccu-${stamp.replace(/[:]/g, "-")}.json`);
writeFileSync(file, JSON.stringify({ capturedAt: stamp, total, count: games.length, games }, null, 1));

console.log(`captured ${stamp}`);
console.log(`${games.length} distinct games across the public sorts · combined CCU ${num(total)}`);
console.log(`written to data/platform/${path.basename(file)}`);

// The top of the board, with age. A very large game created days ago is the
// shape that displaces everyone else's impressions.
console.log(`\nrank  CCU          created      share   name`);
for (const [i, g] of games.slice(0, TOP).entries())
  console.log(
    String(i + 1).padStart(4) + "  " + num(g.playerCount).padStart(10) +
    "  " + (g.created ?? "?").padEnd(12) +
    (100 * g.playerCount / total).toFixed(1).padStart(5) + "%   " + g.name.slice(0, 46)
  );

// Compare against every earlier snapshot. This is the whole point of the file.
const prior = existsSync(OUT_DIR)
  ? readdirSync(OUT_DIR).filter((f) => f.startsWith("ccu-") && f.endsWith(".json") && !file.endsWith(f)).sort()
  : [];
if (!prior.length) {
  console.log(`\nNo earlier snapshot to compare against — this is the baseline.`);
  console.log(`Run it daily (the scheduler can, or a cron) and the platform-vs-us`);
  console.log(`question answers itself from the second run onward.`);
} else {
  console.log(`\nvs earlier snapshots:`);
  console.log("  captured                 total CCU     change   top game");
  for (const f of prior.slice(-10)) {
    const p = JSON.parse(readFileSync(path.join(OUT_DIR, f), "utf8")) as
      { capturedAt: string; total: number; games: Game[] };
    console.log(
      "  " + p.capturedAt.padEnd(24) + num(p.total).padStart(10) +
      "  " + ((total / p.total - 1) * 100).toFixed(1).padStart(8) + "%" +
      "   " + (p.games?.[0]?.name ?? "?").slice(0, 32)
    );
  }
}
