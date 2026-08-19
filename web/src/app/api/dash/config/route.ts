import { NextResponse } from "next/server";
import { readConfig, writeConfig, apiKey, type DashConfig } from "@/lib/opencloud";

export const dynamic = "force-dynamic";

export async function GET() {
  // hasKey, never the key itself.
  return NextResponse.json({ config: readConfig(), hasKey: Boolean(apiKey()) });
}

export async function PUT(req: Request) {
  let patch: Partial<DashConfig> & { gameId?: string; game?: unknown };
  try { patch = await req.json(); } catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }
  const cur = readConfig();
  // Two shapes: a top-level patch (username/userId), or one game's settings.
  if (patch.gameId) {
    cur.games[patch.gameId] = { ...(cur.games[patch.gameId] ?? {}), ...(patch.game as object ?? {}) };
  }
  if (patch.username !== undefined) cur.username = patch.username;
  if (patch.userId !== undefined) cur.userId = patch.userId;
  return NextResponse.json({ config: writeConfig(cur) });
}
