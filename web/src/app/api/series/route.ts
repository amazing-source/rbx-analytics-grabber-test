import { NextResponse } from "next/server";
import { getSeries } from "@/lib/store";
import { metricKind } from "@/lib/metric-info";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const game = sp.get("game");
  const metric = sp.get("metric");
  if (!game || !metric)
    return NextResponse.json({ error: "missing ?game & ?metric" }, { status: 400 });
  const data = await getSeries(game, metric);
  return NextResponse.json({ ...data, kind: metricKind(metric) });
}
