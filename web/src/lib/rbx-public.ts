// Thin wrappers over Roblox's PUBLIC web APIs — the ones that need no auth at
// all. These power the dashboard's identity and game-picker screens.
//
// They are deliberately separate from the Open Cloud analytics client: these
// carry no credential, so they can fail loudly and be cached freely. The one
// credential in this app (the Open Cloud key) lives in `opencloud.ts` and never
// leaves the server.
//
// Verified working 2026-08-19 against the three Indigo universes.

export type RbxUser = { userId: number; name: string; displayName: string; avatarUrl: string | null };
export type RbxGroup = { id: number; name: string; role: string; memberCount: number; emblemUrl: string | null };
export type RbxGame = { universeId: number; name: string; rootPlaceId: number | null; playing: number | null; iconUrl: string | null };

const UA = { "user-agent": "indigo-liveops-dashboard/1.0" };

async function get<T>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url, { headers: UA, next: { revalidate: 60 } });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

/** Batch thumbnail lookup. Roblox returns `state` per row; anything but
 *  "Completed" means the image is still rendering, so we treat it as absent
 *  rather than shipping a broken <img>. */
async function thumbs(url: string): Promise<Map<number, string>> {
  const out = new Map<number, string>();
  const j = await get<{ data?: { targetId: number; state: string; imageUrl: string }[] }>(url);
  for (const d of j?.data ?? []) if (d.state === "Completed" && d.imageUrl) out.set(d.targetId, d.imageUrl);
  return out;
}

export async function resolveUsername(username: string): Promise<RbxUser | null> {
  let id: number | null = null;
  let name = username, displayName = username;
  try {
    const r = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: { "content-type": "application/json", ...UA },
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: false }),
    });
    if (r.ok) {
      const j = (await r.json()) as { data?: { id: number; name: string; displayName: string }[] };
      const u = j.data?.[0];
      if (u) { id = u.id; name = u.name; displayName = u.displayName || u.name; }
    }
  } catch { /* fall through to null */ }
  if (id == null) return null;
  const t = await thumbs(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${id}&size=150x150&format=Png`);
  return { userId: id, name, displayName, avatarUrl: t.get(id) ?? null };
}

export async function userGroups(userId: number): Promise<RbxGroup[]> {
  const j = await get<{ data?: { group: { id: number; name: string; memberCount: number }; role: { name: string } }[] }>(
    `https://groups.roblox.com/v1/users/${userId}/groups/roles`
  );
  const rows = (j?.data ?? []).map((x) => ({
    id: x.group.id, name: x.group.name, role: x.role?.name ?? "", memberCount: x.group.memberCount ?? 0, emblemUrl: null as string | null,
  }));
  if (!rows.length) return rows;
  const t = await thumbs(`https://thumbnails.roblox.com/v1/groups/icons?groupIds=${rows.map((r) => r.id).join(",")}&size=150x150&format=Png`);
  for (const r of rows) r.emblemUrl = t.get(r.id) ?? null;
  return rows.sort((a, b) => a.name.localeCompare(b.name));
}

export async function groupGames(groupId: number): Promise<RbxGame[]> {
  // accessFilter=All includes private/unpublished experiences, which is what a
  // developer wants to see — a game does not stop needing a watch because it is
  // not public yet.
  const j = await get<{ data?: { id: number; name: string; rootPlace?: { id: number } }[] }>(
    `https://games.roblox.com/v2/groups/${groupId}/games?accessFilter=All&limit=50&sortOrder=Desc`
  );
  const rows = (j?.data ?? []).map((x) => ({
    universeId: x.id, name: x.name, rootPlaceId: x.rootPlace?.id ?? null, playing: null as number | null, iconUrl: null as string | null,
  }));
  if (!rows.length) return rows;
  const ids = rows.map((r) => r.universeId).join(",");
  const [icons, live] = await Promise.all([
    thumbs(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${ids}&size=256x256&format=Png`),
    get<{ data?: { id: number; playing: number; rootPlaceId: number }[] }>(`https://games.roblox.com/v1/games?universeIds=${ids}`),
  ]);
  const playing = new Map((live?.data ?? []).map((d) => [d.id, d.playing]));
  for (const r of rows) {
    r.iconUrl = icons.get(r.universeId) ?? null;
    r.playing = playing.get(r.universeId) ?? null;
  }
  // Live players first: the games that matter today sort to the top by
  // themselves, without anyone maintaining a priority list.
  return rows.sort((a, b) => (b.playing ?? -1) - (a.playing ?? -1));
}

/** Groups that own at least one of the universes we already hold data for.
 *  Used to seed the picker before a username is known. */
export async function groupsOwningUniverses(universeIds: number[]): Promise<RbxGroup[]> {
  if (!universeIds.length) return [];
  const j = await get<{ data?: { id: number; creator?: { id: number; type: string; name: string } }[] }>(
    `https://games.roblox.com/v1/games?universeIds=${universeIds.join(",")}`
  );
  const seen = new Map<number, RbxGroup>();
  for (const g of j?.data ?? []) {
    if (g.creator?.type !== "Group" || !g.creator.id) continue;
    seen.set(g.creator.id, { id: g.creator.id, name: g.creator.name, role: "", memberCount: 0, emblemUrl: null });
  }
  const rows = [...seen.values()];
  if (rows.length) {
    const t = await thumbs(`https://thumbnails.roblox.com/v1/groups/icons?groupIds=${rows.map((r) => r.id).join(",")}&size=150x150&format=Png`);
    for (const r of rows) r.emblemUrl = t.get(r.id) ?? null;
  }
  return rows.sort((a, b) => a.name.localeCompare(b.name));
}
