import { NextResponse } from "next/server";
import { checkAccess } from "@/lib/opencloud";

export const dynamic = "force-dynamic";

// POST { universeIds: number[] } -> { access: { [id]: "ok"|"denied"|"error"|"nokey" } }
// Checked serially with a small gap: Open Cloud allows 30 query POSTs/minute per
// key owner, and a portfolio page firing 40 checks at once would throttle itself
// and report "denied" for games the user can actually see.
export async function POST(req: Request) {
  let ids: number[] = [];
  try {
    const body = (await req.json()) as { universeIds?: unknown };
    ids = Array.isArray(body.universeIds) ? body.universeIds.map(Number).filter((n) => Number.isFinite(n) && n > 0) : [];
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const access: Record<string, string> = {};
  for (const id of ids.slice(0, 25)) {
    access[String(id)] = await checkAccess(id);
    await new Promise((r) => setTimeout(r, 2100));
  }
  return NextResponse.json({ access });
}
