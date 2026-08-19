import { NextResponse } from "next/server";
import { userGroups, groupsOwningUniverses } from "@/lib/rbx-public";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const userId = Number(sp.get("userId"));
  // Fallback path: with no user yet, seed the picker from the groups that own
  // universes we already hold data for, so the dashboard is useful on first run.
  if (!Number.isFinite(userId) || userId <= 0) {
    const seed = (sp.get("seedUniverses") ?? "").split(",").map(Number).filter((n) => Number.isFinite(n) && n > 0);
    return NextResponse.json({ groups: await groupsOwningUniverses(seed), seeded: true });
  }
  return NextResponse.json({ groups: await userGroups(userId), seeded: false });
}
