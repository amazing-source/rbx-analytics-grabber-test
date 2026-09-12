import { NextResponse } from "next/server";
import { getMetrics, SPECS } from "@/lib/live-metrics";

export const dynamic = "force-dynamic";

// Key metrics for the live board. Served from a disk cache and refreshed in the
// background, because a full pass is 36 paced Open Cloud POSTs (~80s) and a
// page load must never wait on it. `?refresh=1` forces one.
export async function GET(req: Request) {
  const force = new URL(req.url).searchParams.get("refresh") === "1";
  try {
    const snap = await getMetrics(force);
    return NextResponse.json({ ...snap, specs: SPECS });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message, games: [], specs: SPECS, problems: [] }, { status: 502 });
  }
}
