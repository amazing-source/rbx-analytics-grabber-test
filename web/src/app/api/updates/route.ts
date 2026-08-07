import { NextResponse } from "next/server";
import { addUpdate, getUpdates } from "@/lib/store";

export async function GET(req: Request) {
  const game = new URL(req.url).searchParams.get("game");
  if (!game) return NextResponse.json({ error: "missing ?game" }, { status: 400 });
  return NextResponse.json({ updates: await getUpdates(game) });
}

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b?.gameId || !b?.title || !b?.occurredAt) {
    return NextResponse.json(
      { error: "expected { gameId, title, occurredAt, notes? }" },
      { status: 400 }
    );
  }
  const update = await addUpdate({
    gameId: String(b.gameId),
    title: String(b.title),
    occurredAt: String(b.occurredAt),
    notes: b.notes ? String(b.notes) : undefined,
  });
  return NextResponse.json({ ok: true, update });
}
