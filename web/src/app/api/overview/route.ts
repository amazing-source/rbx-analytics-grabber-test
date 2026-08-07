import { NextResponse } from "next/server";
import { getOverview } from "@/lib/store";

export async function GET(req: Request) {
  const game = new URL(req.url).searchParams.get("game");
  if (!game) return NextResponse.json({ error: "missing ?game" }, { status: 400 });
  return NextResponse.json(await getOverview(game));
}
