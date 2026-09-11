import { NextResponse } from "next/server";
import { fetchCcu, pushCcuSample, ccuHistory } from "@/lib/live";

export const dynamic = "force-dynamic";

// Live concurrents. Unauthenticated upstream, so this is a plain server fetch.
export async function GET(req: Request) {
  const withHistory = new URL(req.url).searchParams.get("history") === "1";
  try {
    const rows = await fetchCcu();
    await pushCcuSample(rows);
    return NextResponse.json({
      at: new Date().toISOString(), rows,
      history: withHistory ? await ccuHistory() : undefined,
    });
  } catch (e) {
    // A failed poll is not zero players — say so rather than drawing a cliff.
    return NextResponse.json({ error: (e as Error).message, rows: [] }, { status: 502 });
  }
}
