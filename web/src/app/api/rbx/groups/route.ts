import { NextResponse } from "next/server";
import { readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { userGroups, groupsOwningUniverses, knownGroupIds } from "@/lib/rbx-public";

export const dynamic = "force-dynamic";

/** Universes we already hold a data folder for — the local record of what this
 *  operator actually works on, which is what makes 3 studios findable among 42
 *  group memberships. */
function heldUniverses(): number[] {
  const dir = path.resolve(process.cwd(), "..", "data", "games");
  if (!existsSync(dir)) return [];
  return readdirSync(dir).map(Number).filter((n) => Number.isFinite(n) && n > 0);
}

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const userId = Number(sp.get("userId"));
  const held = heldUniverses();

  if (!Number.isFinite(userId) || userId <= 0) {
    const seed = (sp.get("seedUniverses") ?? "").split(",").map(Number).filter((n) => Number.isFinite(n) && n > 0);
    const groups = await groupsOwningUniverses(seed.length ? seed : held);
    return NextResponse.json({ groups: groups.map((g) => ({ ...g, known: true })), seeded: true, held });
  }

  const [groups, known] = await Promise.all([userGroups(userId), knownGroupIds(held)]);
  // Studios first, then everything else alphabetically. The flag is also
  // returned so the client can section them rather than just sort.
  const marked = groups.map((g) => ({ ...g, known: known.has(g.id) }));
  marked.sort((a, b) => (Number(b.known) - Number(a.known)) || a.name.localeCompare(b.name));
  return NextResponse.json({ groups: marked, seeded: false, held });
}
