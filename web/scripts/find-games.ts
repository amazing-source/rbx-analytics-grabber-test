// Enumerate every experience reachable through the operator's group
// memberships, using the LOGGED-IN grab profile.
//
//   npm run find-games                  # everything
//   npm run find-games -- brainrot seal  # filter by name fragment
//
// Authentication matters here: `accessFilter=All` returns private and
// unpublished experiences only when the request carries a session. Run
// unauthenticated it returns a handful of public games and none of the ones we
// actually hold data for, which reads as "you have access to nothing".
//
// Group membership is still not the same as analytics permission — this is a
// candidate list. `npm run grab -- <id> --days 1` is the cheap proof.
import { readdirSync, existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { launchWithExtension, isLoggedIn } from "./browser-context.ts";

const DATA = process.env.RBX_DATA_DIR
  ? path.resolve(process.env.RBX_DATA_DIR)
  : path.resolve(import.meta.dirname, "../../data");

const held = new Set(
  existsSync(path.join(DATA, "games"))
    ? readdirSync(path.join(DATA, "games")).filter((d) => /^\d+$/.test(d))
    : []
);

const cfgPath = path.join(DATA, "dashboard-config.json");
const userId = existsSync(cfgPath)
  ? Number((JSON.parse(readFileSync(cfgPath, "utf8")) as { userId?: number }).userId)
  : 0;
if (!Number.isFinite(userId) || userId <= 0) {
  console.error("no userId in data/dashboard-config.json");
  process.exit(1);
}

const filters = process.argv.slice(2).map((s) => s.toLowerCase());

const { context } = await launchWithExtension();
if (!(await isLoggedIn(context))) {
  console.error("the grab profile is not logged into Roblox — npm run grab:login");
  await context.close();
  process.exit(1);
}
const api = context.request;

type Row = { universeId: number; name: string; group: string; visits: number; playing: number };
const rows: Row[] = [];

const groupsRes = await api.get(
  `https://groups.roblox.com/v2/users/${userId}/groups/roles?includeLocked=true`
);
const groups = (
  (await groupsRes.json()) as { data?: { group: { id: number; name: string } }[] }
).data ?? [];
console.log(`user ${userId} — ${groups.length} group memberships, listing experiences…\n`);

for (const g of groups) {
  try {
    const r = await api.get(
      `https://games.roblox.com/v2/groups/${g.group.id}/games?accessFilter=All&limit=50&sortOrder=Desc`
    );
    if (!r.ok()) continue;
    const data = ((await r.json()) as { data?: { id: number; name: string }[] }).data ?? [];
    for (const x of data)
      rows.push({ universeId: x.id, name: x.name, group: g.group.name, visits: 0, playing: 0 });
  } catch {
    /* a group we cannot list is not an error worth stopping for */
  }
}

// Visits/playing come from the games API in one batch, so the list sorts by
// something meaningful rather than by group order.
const seen = new Set<number>();
const unique = rows.filter((r) => (seen.has(r.universeId) ? false : (seen.add(r.universeId), true)));
for (let i = 0; i < unique.length; i += 50) {
  const chunk = unique.slice(i, i + 50);
  try {
    const r = await api.get(
      `https://games.roblox.com/v1/games?universeIds=${chunk.map((c) => c.universeId).join(",")}`
    );
    const data = ((await r.json()) as { data?: { id: number; visits?: number; playing?: number }[] })
      .data ?? [];
    const by = new Map(data.map((d) => [d.id, d]));
    for (const c of chunk) {
      c.visits = by.get(c.universeId)?.visits ?? 0;
      c.playing = by.get(c.universeId)?.playing ?? 0;
    }
  } catch {
    /* leave zeros */
  }
}

const matched = filters.length
  ? unique.filter((r) => filters.some((f) => r.name.toLowerCase().includes(f)))
  : unique;
matched.sort((a, b) => b.visits - a.visits);

console.log(`${matched.length} experience(s)${filters.length ? ` matching ${filters.join(", ")}` : ""}\n`);
console.log(`${"universeId".padEnd(14)}${"held".padEnd(6)}${"visits".padStart(13)}${"live".padStart(8)}  name  ·  group`);
for (const r of matched)
  console.log(
    `${String(r.universeId).padEnd(14)}${(held.has(String(r.universeId)) ? "yes" : "-").padEnd(6)}` +
      `${r.visits.toLocaleString().padStart(13)}${String(r.playing).padStart(8)}  ${r.name.slice(0, 44)}  ·  ${r.group.slice(0, 26)}`
  );

const missing = [...held].filter((h) => !seen.has(Number(h)));
if (missing.length)
  console.log(`\nheld but not listed under any group (personal or archived): ${missing.join(", ")}`);

await context.close();
