// The live board's key-metric rung: one settled daily figure per game, with a
// day-on-day and a same-weekday delta beside it.
//
// THIS IS NOT "LIVE" THE WAY CCU IS, AND THE UI MUST NOT PRETEND IT IS.
// Measured on 9963622286 on 2026-09-12:
//
//   DailyActiveUsers / DailyRevenue / ARPDAU / CVR / session length  newest = 09-10
//   ForwardD1Retention                                              newest = 09-09
//
// The behavioural rung lags ~2 days and D1 lags a further day because the
// cohort has to mature. One global "as of" stamp would therefore be wrong for
// at least one column, so every cell carries its OWN date and the UI prints it.
//
// TODAY IS NEVER A HEADLINE. The same probe watched a current-to-the-hour
// metric (ErrorCount, since dropped from this board) read 2,110,627 and then
// 2,114,867 seconds later — a day still accumulating. Differencing a part-day
// against whole ones is what once printed "▼85.6%" off a 7-hour day (CLAUDE.md).
// Nothing in SPECS currently reaches today, but the guard stays: the lag is
// Roblox's to change, not ours, and the failure is silent when it returns.
//
// AUTH: Open Cloud key only. Nothing here reads a session cookie — the metrics
// half of the API is key-authenticated, so the board needs no browser at all.
import { promises as fs } from "node:fs";
import path from "node:path";
import { resolveDataDir } from "./export-files";
import { apiKey } from "./opencloud";
import { runQuery } from "./opencloud-grab";
import { GAMES } from "./live";

/** 2200ms, not 2000ms — see opencloud-grab.ts. A full pass is 6 metrics across
 *  6 games = 36 POSTs ~= 80s, which is why this is cached and never run inline
 *  on a page load. */
const POST_INTERVAL_MS = 2200;
/** The figures move once a day. A short TTL would spend the whole rate-limit
 *  budget re-reading numbers that cannot have changed. */
const TTL_MS = 30 * 60_000;
const WINDOW_DAYS = 17;   // enough for a settled day plus its D-7 twin
const CACHE = "metrics.json";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type MetricSpec = {
  key: string;
  metric: string;
  label: string;
  gloss: string;
  kind: "int" | "robux" | "rate" | "pct" | "minutes";
};

/** Producers know these names (CLAUDE.md: "Producers know metric names"), so the
 *  series is named and then glossed, never replaced by a friendly invention. */
export const SPECS: MetricSpec[] = [
  { key: "dau",     metric: "DailyActiveUsers",            label: "DAU",         gloss: "DailyActiveUsers",           kind: "int" },
  { key: "revenue", metric: "DailyRevenue",                label: "Revenue",     gloss: "DailyRevenue, Robux",        kind: "robux" },
  { key: "arpdau",  metric: "AverageRevenuePerUser",       label: "ARPDAU",      gloss: "AverageRevenuePerUser",      kind: "rate" },
  { key: "cvr",     metric: "PayingUsersCVR",              label: "Payer CVR",   gloss: "PayingUsersCVR",             kind: "pct" },
  { key: "d1",      metric: "ForwardD1Retention",          label: "D1",          gloss: "ForwardD1Retention",         kind: "pct" },
  { key: "session", metric: "AverageSessionLengthMinutes", label: "Session",     gloss: "AverageSessionLengthMinutes", kind: "minutes" },
];

export type Point = { date: string; value: number };
export type Cell = {
  /** The newest SETTLED day — strictly before today UTC. */
  latest: Point;
  /** The calendar day before `latest`, when served. */
  prev: Point | null;
  /** `latest` minus 7 days — the same weekday, which is the comparison the
   *  producer asked for by name. Absent when the horizon is too short. */
  weekAgo: Point | null;
  /** Today's still-accumulating value, shown greyed and never differenced. */
  partialToday: Point | null;
  /** Every settled day we hold, oldest first — drives the row sparkline. */
  history: Point[];
};

export type GameMetrics = {
  universeId: string;
  name: string;
  cells: Record<string, Cell | null>;
  /** Per-metric reasons a cell is null, so an absent number never reads as a
   *  zero or as a game that does not have the feature. */
  notes: Record<string, string>;
};

export type Snapshot = {
  computedAt: string;
  windowStart: string;
  windowEnd: string;
  games: GameMetrics[];
  /** True while a refresh is in flight, so the page can say so. */
  refreshing?: boolean;
  /** Transport-level problems worth surfacing (no key, 429s, 5xx). */
  problems: string[];
};

const isoDay = (d: Date) => d.toISOString().slice(0, 10);
const isoStamp = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, "Z");
const todayUtc = () => isoDay(new Date());
function shiftDay(date: string, days: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return isoDay(d);
}

/** The headline series is the one with NO breakdown. Never series[0] — that
 *  fallback is what once printed a 30,393-crash incident as "5" (CLAUDE.md). */
function headlinePoints(body: unknown): Point[] | null {
  const values = ((body as { response?: { values?: unknown[] } })?.response?.values ?? []) as Array<{
    breakdowns?: unknown[];
    dataPoints?: Array<{ time?: string; value?: number }>;
  }>;
  const headline = values.filter((v) => !v.breakdowns || v.breakdowns.length === 0);
  if (!headline.length) return null;
  const byDay = new Map<string, number>();
  for (const v of headline) {
    for (const p of v.dataPoints ?? []) {
      if (!p.time || typeof p.value !== "number") continue;
      byDay.set(String(p.time).slice(0, 10), p.value);
    }
  }
  return [...byDay.entries()].map(([date, value]) => ({ date, value })).sort((a, b) => a.date.localeCompare(b.date));
}

function toCell(points: Point[]): { cell: Cell | null; note: string } {
  const today = todayUtc();
  const settled = points.filter((p) => p.date < today);
  const partialToday = points.find((p) => p.date === today) ?? null;
  if (!settled.length) {
    return {
      cell: null,
      note: partialToday
        ? "only today served, and a part-day is not comparable"
        : "no settled day in the window",
    };
  }
  const latest = settled[settled.length - 1];
  const at = (date: string) => settled.find((p) => p.date === date) ?? null;
  return {
    cell: {
      latest,
      prev: at(shiftDay(latest.date, -1)),
      weekAgo: at(shiftDay(latest.date, -7)),
      partialToday,
      history: settled,
    },
    note: "",
  };
}

async function cacheDir() {
  const d = path.join(await resolveDataDir(), "live");
  await fs.mkdir(d, { recursive: true });
  return d;
}
async function readCache(): Promise<Snapshot | null> {
  try {
    return JSON.parse(await fs.readFile(path.join(await cacheDir(), CACHE), "utf8")) as Snapshot;
  } catch {
    return null;
  }
}
async function writeCache(s: Snapshot) {
  await fs.writeFile(path.join(await cacheDir(), CACHE), JSON.stringify(s));
}

/** One pass over every game × every metric. ~80s; callers must not await this
 *  on a request path. */
async function collect(): Promise<Snapshot> {
  const key = apiKey();
  const now = new Date();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  const start = new Date(end.getTime() - WINDOW_DAYS * 86_400_000);
  const base: Snapshot = {
    computedAt: new Date().toISOString(),
    windowStart: isoStamp(start),
    windowEnd: isoStamp(end),
    games: [],
    problems: [],
  };
  if (!key) {
    base.problems.push("no Open Cloud key — put one in web/.opencloud-key or ROBLOX_API_KEY");
    return base;
  }

  for (const g of GAMES) {
    const cells: Record<string, Cell | null> = {};
    const notes: Record<string, string> = {};
    for (const spec of SPECS) {
      // endTime is EXCLUSIVE at the day boundary: tomorrow 00:00Z is the ask
      // that includes today. Anything later fabricates a carried-forward row.
      const res = await runQuery(
        g.universeId,
        {
          metric: spec.metric,
          granularity: "OneDay",
          startTime: isoStamp(start),
          endTime: isoStamp(end),
        },
        key
      );
      if (!res.ok) {
        cells[spec.key] = null;
        notes[spec.key] = `${res.status}: ${res.error}`.slice(0, 160);
        if (res.status === 429 || res.status === 0) base.problems.push(`${g.name} ${spec.metric}: ${res.error}`);
      } else {
        const pts = headlinePoints(res.body);
        if (!pts) {
          cells[spec.key] = null;
          notes[spec.key] = "no unbroken-down series returned";
        } else if (!pts.length) {
          // An empty 200 is a measurement of the query, not of the game.
          cells[spec.key] = null;
          notes[spec.key] = "empty result — not evidence the game lacks this";
        } else {
          const { cell, note } = toCell(pts);
          cells[spec.key] = cell;
          if (note) notes[spec.key] = note;
        }
      }
      await sleep(POST_INTERVAL_MS);
    }
    base.games.push({ universeId: g.universeId, name: g.name, cells, notes });
  }
  base.computedAt = new Date().toISOString();
  return base;
}

let inFlight: Promise<Snapshot> | null = null;
let lastError: string | null = null;

/** Kick a refresh if one is not already running. Returns immediately.
 *
 *  The result is deliberately a RESOLVED snapshot even on failure. Callers
 *  detach this promise, and a detached rejection takes the dev server down with
 *  an unhandled rejection — so a transport failure becomes a `problems` line on
 *  the board instead of a crash. */
export function refreshMetrics(): Promise<Snapshot> {
  if (!inFlight) {
    inFlight = collect()
      .then(async (s) => {
        lastError = null;
        await writeCache(s);
        return s;
      })
      .catch(async (e) => {
        lastError = (e as Error).message;
        const cached = await readCache();
        return cached
          ? { ...cached, problems: [...cached.problems, `refresh failed: ${lastError}`] }
          : { computedAt: new Date().toISOString(), windowStart: "", windowEnd: "",
              games: [], problems: [`refresh failed: ${lastError}`] };
      })
      .finally(() => { inFlight = null; });
  }
  return inFlight;
}

/** Serve whatever is cached at once, refreshing behind it when stale. A page
 *  load must never block on an 80-second pass. */
export async function getMetrics(force = false): Promise<Snapshot> {
  const cached = await readCache();
  const stale = !cached || Date.now() - Date.parse(cached.computedAt) > TTL_MS;
  if (force || stale) {
    const run = refreshMetrics();
    if (!cached) return run;                       // nothing to show yet: wait
    void run;                                      // detached, and cannot reject
    return { ...cached, refreshing: true };
  }
  return { ...cached, refreshing: inFlight != null };
}
