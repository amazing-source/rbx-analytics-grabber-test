import { NextResponse } from "next/server";
import { GAMES } from "@/lib/live";

export const dynamic = "force-dynamic";

// The roster, so the poller does not carry its own copy of the place ids.
export async function GET() {
  return NextResponse.json({ games: GAMES });
}
