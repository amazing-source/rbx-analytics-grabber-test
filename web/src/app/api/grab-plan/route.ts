import { NextResponse } from "next/server";
import { getGrabPlan, getDiscoveryRequests } from "@/lib/store";
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
    return NextResponse.json(
      { ...plan, discovery: getDiscoveryRequests(universe, start, end) },
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
    return NextResponse.json(plan, { headers: CORS });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500, headers: CORS });
  }
}
