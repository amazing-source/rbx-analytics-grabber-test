import { NextResponse } from "next/server";
import { grabAndPersist } from "@/lib/opencloud-run";
import { apiKey } from "@/lib/opencloud";
import { getProgress } from "@/lib/grab-progress";

// The Open Cloud grab, on demand. Same handler the scheduler calls into, so
// "run it now" and "run it at 03:00" cannot diverge.
//
// A full 28-day pass is ~170 requests paced at 30/min — several minutes. That
// is longer than a default serverless timeout, which is fine here (this app is
// meant to run locally, `npm run dev`) but is the reason the scheduler does not
// go through HTTP at all: it calls grabAndPersist directly.
export const maxDuration = 900;

// Progress for a grab that is currently in flight (or the last one this process
// ran for that universe). The POST above cannot report it — it does not answer
// until the final request has landed — so the dashboard polls this while it
// waits. See src/lib/grab-progress.ts.
export async function GET(req: Request) {
  const universe = (new URL(req.url).searchParams.get("universe") ?? "").trim();
  if (!/^\d+$/.test(universe)) {
    return NextResponse.json({ error: "expected ?universe=<universeId>" }, { status: 400 });
  }
  return NextResponse.json({ progress: getProgress(universe) });
}

export async function POST(req: Request) {
  let body: { universe?: string; start?: string; end?: string; days?: number } = {};
  try {
    body = await req.json();
  } catch {
    /* all fields optional */
  }
  const universe = String(body.universe ?? "").trim();
  if (!/^\d+$/.test(universe)) {
    return NextResponse.json({ error: "expected { universe: \"<universeId>\" }" }, { status: 400 });
  }
  if (!apiKey()) {
    return NextResponse.json(
      { error: "no Open Cloud key — put one in web/.opencloud-key or set ROBLOX_API_KEY" },
      { status: 400 }
    );
  }

  try {
    const r = await grabAndPersist({
      universeId: universe,
      startTime: body.start,
      endTime: body.end,
      days: body.days,
    });
    return NextResponse.json({
      ok: r.ok,
      summary: r.summary,
      requested: r.report.requested,
      captures: r.captures.length,
      skipped: r.skipped,
      files: r.files,
      db: r.db,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
