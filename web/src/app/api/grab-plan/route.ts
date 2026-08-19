import { NextResponse } from "next/server";
import { getGrabPlan, getDiscoveryRequests } from "@/lib/store";
import { parseExclude, filterPlan } from "@/lib/exclusions";
import { readConfig } from "@/lib/opencloud";
import type { Discovered } from "@/lib/default-plan";

// The extension fetches this from create.roblox.com — allow cross-origin reads.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
  // Public site (create.roblox.com) -> localhost is a Private Network Access
  // request; Chrome's preflight requires this header or it blocks with
  // "Failed to fetch".
  "Access-Control-Allow-Private-Network": "true",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

function daysAgoISO(days: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

/** Exclusions come from the caller when it has them (the extension knows its
 *  own settings and may be newer than the file), otherwise from the saved
 *  dashboard config. Explicit beats stored, so a grab always honours what the
 *  user is looking at. */
function excludeFrom(sp: URLSearchParams) {
  const explicit = sp.get("exclude");
  if (explicit !== null) return parseExclude(explicit);
  try { return parseExclude(readConfig().exclude as Record<string, unknown> | undefined); }
  catch { return parseExclude(null); }
}

/** Applies the filter and attaches what was removed. A silently shortened plan
 *  reads downstream as "this game has no crash data", which is exactly the
 *  failure mode CLAUDE.md warns about. */
function applyExclusions(plan: { requests?: unknown[] }, excluded: Set<string>) {
  const reqs = (plan.requests ?? []) as { kind?: string; metric?: string | null }[];
  const r = filterPlan(reqs, excluded as Set<never>);
  return {
    ...plan,
    requests: r.requests,
    excluded: {
      families: [...excluded],
      dropped: r.dropped,
      byFamily: r.byFamily,
      note: r.dropped
        ? "Excluded by settings, NOT missing from the game. Perf and error history age out (~28d / ~56d), so a skipped family cannot be backfilled later."
        : undefined,
    },
  };
}

function windowFrom(sp: URLSearchParams) {
  const start = sp.get("start") || daysAgoISO(28);
  const end = sp.get("end") || new Date(new Date().setUTCHours(0, 0, 0, 0)).toISOString();
  return { start, end };
}

// GET = phase 0. Returns the dimension-discovery requests plus a plan built
// with no discovered values (so a caller that ignores discovery still works,
// just without funnels). The extension runs `discovery`, then POSTs the values
// back for the real plan.
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const universe = sp.get("universe");
  if (!universe || !/^\d+$/.test(universe)) {
    return NextResponse.json(
      { error: "missing or invalid ?universe (numeric universeId)" },
      { status: 400, headers: CORS }
    );
  }
  const { start, end } = windowFrom(sp);
  try {
    const plan = await getGrabPlan(universe, start, end);
    const filtered = applyExclusions(plan, excludeFrom(sp));
    return NextResponse.json(
      { ...filtered, discovery: getDiscoveryRequests(universe, start, end) },
      { headers: CORS }
    );
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500, headers: CORS });
  }
}

// POST = phase 1. Body: { universe, start?, end?, discovered: { FunnelName: [...] } }
export async function POST(req: Request) {
  let payload: { universe?: string; start?: string; end?: string; discovered?: Discovered };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400, headers: CORS });
  }
  const universe = payload.universe;
  if (!universe || !/^\d+$/.test(universe)) {
    return NextResponse.json(
      { error: "missing or invalid universe (numeric universeId)" },
      { status: 400, headers: CORS }
    );
  }
  const sp = new URLSearchParams();
  if (payload.start) sp.set("start", payload.start);
  if (payload.end) sp.set("end", payload.end);
  const { start, end } = windowFrom(sp);
  try {
    const plan = await getGrabPlan(universe, start, end, payload.discovered);
    const exclude = parseExclude((payload as { exclude?: string }).exclude ?? null);
    const filtered = applyExclusions(plan, exclude.size ? exclude : excludeFrom(new URLSearchParams()));
    return NextResponse.json(filtered, { headers: CORS });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500, headers: CORS });
  }
}
