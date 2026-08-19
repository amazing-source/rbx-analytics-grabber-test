import { NextResponse } from "next/server";
import { apiKey } from "@/lib/opencloud";

export const dynamic = "force-dynamic";

const BASE = "https://apis.roblox.com/analytics-query-api/v1";

// One universe per call, on purpose. Four metrics at ~2.1s apart is ~8s, and a
// portfolio page that asked for twelve games at once would sit behind a minute
// of rate-limited silence. Per-game calls let the grid fill in progressively.
const METRICS = [
  { key: "dau", metric: "DailyActiveUsers" },
  { key: "d1", metric: "ForwardD1Retention" },
  { key: "revenue", metric: "DailyRevenue" },
  { key: "playtime", metric: "AveragePlayTimeMinutesPerDAU" },
] as const;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function series(key: string, universeId: string, metric: string) {
  const end = new Date(); end.setUTCHours(0, 0, 0, 0);
  const start = new Date(end.getTime() - 21 * 86400_000);
  const res = await fetch(`${BASE}/universes/${universeId}/metrics`, {
    method: "POST",
    headers: { "x-api-key": key, "content-type": "application/json" },
    body: JSON.stringify({
      metric, granularity: "OneDay",
      startTime: start.toISOString().replace(/\.\d{3}Z$/, "Z"),
      endTime: end.toISOString().replace(/\.\d{3}Z$/, "Z"),
    }),
  });
  if (!res.ok) return null;
  let b = (await res.json()) as Record<string, unknown>;
  for (let i = 0; i < 20 && b.done === false && typeof b.path === "string"; i++) {
    await sleep(900);
    const r = await fetch(`https://apis.roblox.com/analytics-query-api/${b.path}`, { headers: { "x-api-key": key } });
    if (!r.ok) return null;
    b = (await r.json()) as Record<string, unknown>;
  }
  const resp = (b.response ?? {}) as { values?: { breakdowns?: unknown[]; dataPoints?: { time: string; value: number }[] }[] };
  // Headline = the series with no breakdown. Never series[0].
  const tot = (resp.values ?? []).find((v) => !v.breakdowns || v.breakdowns.length === 0);
  if (!tot?.dataPoints?.length) return null;
  return tot.dataPoints.slice().sort((a, b2) => a.time.localeCompare(b2.time));
}

/** Latest settled value plus a LIKE-FOR-LIKE week-over-week delta.
 *
 *  Same weekday only. This game's weekly shape is large enough that a
 *  yesterday-vs-today comparison is mostly day-of-week — Wednesday runs ~42%
 *  below the weekly mean on PCU — so a naive delta reports a crash every
 *  Wednesday and a boom every Saturday.
 */
function latestAndDelta(pts: { time: string; value: number }[] | null) {
  if (!pts?.length) return null;
  const last = pts[pts.length - 1];
  const prevDate = new Date(new Date(last.time).getTime() - 7 * 86400_000).toISOString().slice(0, 10);
  const prev = pts.find((p) => p.time.slice(0, 10) === prevDate);
  const delta = prev && prev.value !== 0 ? ((last.value - prev.value) / Math.abs(prev.value)) * 100 : null;
  return { value: last.value, date: last.time.slice(0, 10), delta };
}

export async function GET(req: Request) {
  const universeId = new URL(req.url).searchParams.get("universeId") ?? "";
  if (!/^\d+$/.test(universeId)) return NextResponse.json({ error: "universeId required" }, { status: 400 });
  const key = apiKey();
  if (!key) return NextResponse.json({ error: "no key" }, { status: 503 });

  const out: Record<string, unknown> = {};
  for (const { key: k, metric } of METRICS) {
    out[k] = latestAndDelta(await series(key, universeId, metric));
    await sleep(2100); // 30 query POSTs/min per key owner
  }
  return NextResponse.json({ universeId, summary: out });
}
