import { NextResponse } from "next/server";
import { getGames } from "@/lib/store";

export async function GET() {
  return NextResponse.json({ games: await getGames() });
}
