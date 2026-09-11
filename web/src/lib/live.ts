// Shared state for the live board: the game roster, the CCU poll, and the
// file-backed feedback log.
//
// TWO SOURCES, TWO AUTH MODELS — this is the whole design constraint:
//   CCU       games.roblox.com/v1/games       NO auth, one call for every game
//   Feedback  player-generated-reviews-service  session cookie required
// So CCU is polled here, server-side. Feedback cannot be: the repo's standing
// rule is that nothing reads, stores or transmits .ROBLOSECURITY, so reviews are
// fetched inside the logged-in browser by scripts/live-feedback.ts and POSTed to
// /api/live/feedback. This module only ever receives them.
import { promises as fs } from "node:fs";
import path from "node:path";
import { resolveDataDir } from "./export-files";

export type Game = { universeId: string; placeId: string; name: string; slug: string };

/** Root place ids, needed because the reviews API is keyed by place, not universe. */
export const GAMES: Game[] = [
  { universeId:"9963622286",  placeId:"99255447043899",  name:"Become a Brainrot",            slug:"brainrot" },
  { universeId:"10030829154", placeId:"139617346573330", name:"Climb Waterslide and Slide",   slug:"waterslide" },
  { universeId:"10399712766", placeId:"83256791430098",  name:"+1 Banana Monkey Destruction", slug:"monkey" },
  { universeId:"10565445771", placeId:"74542317333958",  name:"Verity Companion [AI]",        slug:"verity" },
  { universeId:"10638354731", placeId:"120014184236770", name:"Seal A Driveway",              slug:"seal" },
  { universeId:"9610561918",  placeId:"125003919504672", name:"My Knife Farm",                slug:"knife-farm" },
];

export type CcuRow = { universeId: string; name: string; playing: number; visits: number; favorites: number };
export type Review = {
  id: string; universeId: string; game: string; comment: string;
  createdUtc: string; assetVersion?: string | number | null; category?: string | null;
  seenAt: string;
};

async function liveDir() {
  const d = path.join(await resolveDataDir(), "live");
  await fs.mkdir(d, { recursive: true });
  return d;
}
const FEED = "feedback.json";
const CCU  = "ccu-history.json";

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try { return JSON.parse(await fs.readFile(path.join(await liveDir(), file), "utf8")) as T; }
  catch { return fallback; }
}
async function writeJson(file: string, v: unknown) {
  await fs.writeFile(path.join(await liveDir(), file), JSON.stringify(v));
}

/** Live concurrents for every game in one unauthenticated call. */
export async function fetchCcu(): Promise<CcuRow[]> {
  const ids = GAMES.map(g => g.universeId).join(",");
  const r = await fetch(`https://games.roblox.com/v1/games?universeIds=${ids}`, { cache: "no-store" });
  if (!r.ok) throw new Error(`games API ${r.status}`);
  const j = await r.json() as { data?: Array<Record<string, unknown>> };
  const byId = new Map((j.data ?? []).map(d => [String(d.id), d]));
  return GAMES.map(g => {
    const d = byId.get(g.universeId);
    return { universeId: g.universeId, name: g.name,
      playing: Number(d?.playing ?? 0), visits: Number(d?.visits ?? 0),
      favorites: Number(d?.favoritedCount ?? 0) };
  });
}

/** Append one CCU sample, keeping ~12h at 30s so the page can draw a live line. */
export async function pushCcuSample(rows: CcuRow[]) {
  const hist = await readJson<{ t: string; v: Record<string, number> }[]>(CCU, []);
  hist.push({ t: new Date().toISOString(), v: Object.fromEntries(rows.map(r => [r.universeId, r.playing])) });
  const MAX = 1440;
  await writeJson(CCU, hist.slice(-MAX));
  return hist;
}
export const ccuHistory = () => readJson<{ t: string; v: Record<string, number> }[]>(CCU, []);

/** Store new reviews, skipping any id already logged. Returns only the genuinely new ones. */
export async function addReviews(incoming: Review[]): Promise<Review[]> {
  const log = await readJson<Review[]>(FEED, []);
  const seen = new Set(log.map(r => r.id));
  const fresh = incoming.filter(r => r.id && !seen.has(r.id));
  if (!fresh.length) return [];
  const merged = [...fresh, ...log]
    .sort((a, b) => (a.createdUtc < b.createdUtc ? 1 : -1))
    .slice(0, 2000);
  await writeJson(FEED, merged);
  return fresh;
}
export const feedbackLog = () => readJson<Review[]>(FEED, []);

/** True on the first run for a game, so a cold start does not fire 200 alerts. */
export async function isFirstSightOf(universeId: string): Promise<boolean> {
  const log = await readJson<Review[]>(FEED, []);
  return !log.some(r => r.universeId === universeId);
}
