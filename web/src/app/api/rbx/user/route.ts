import { NextResponse } from "next/server";
import { resolveUsername } from "@/lib/rbx-public";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const username = new URL(req.url).searchParams.get("username")?.trim();
  if (!username) return NextResponse.json({ error: "username required" }, { status: 400 });
  const user = await resolveUsername(username);
  if (!user) return NextResponse.json({ error: `no Roblox user named "${username}"` }, { status: 404 });
  return NextResponse.json(user);
}
