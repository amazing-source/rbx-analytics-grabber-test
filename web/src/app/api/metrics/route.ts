import { NextResponse } from "next/server";
import { getMetrics } from "@/lib/store";
import { metricKind } from "@/lib/metric-info";

export async function GET(req: Request) {
  const game = new URL(req.url).searchParams.get("game");
  if (!game) return NextResponse.json({ error: "missing ?game" }, { status: 400 });
  const metrics = (await getMetrics(game)).map((m) => ({ ...m, kind: metricKind(m.metric) }));
  return NextResponse.json({ metrics });
}
