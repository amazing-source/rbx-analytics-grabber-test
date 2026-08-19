import { NextResponse } from "next/server";
import { groupGames } from "@/lib/rbx-public";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const groupId = Number(new URL(req.url).searchParams.get("groupId"));
  if (!Number.isFinite(groupId) || groupId <= 0) {
    return NextResponse.json({ error: "groupId required" }, { status: 400 });
  }
  return NextResponse.json({ games: await groupGames(groupId) });
}
