// Poll player reviews for every game and hand new ones to the local app, which
// logs them and fires the Discord webhook.
//
//   npm run live            # poll every 3 minutes until stopped
//   npm run live -- --once  # single pass
//   npm run live -- --every 600
//
// WHY THIS RUNS IN A BROWSER AND NOT ON THE SERVER: the reviews endpoint is
// cookie-authenticated. The repo's standing rule is that nothing reads, stores
// or transmits .ROBLOSECURITY, so the request is issued INSIDE the logged-in
// page and only the resulting JSON leaves it. Nothing here touches the cookie —
// no context.cookies(), no storageState(). Keep it that way.
//
// Live concurrents are NOT polled here: that endpoint needs no auth, so the app
// fetches it directly and this process never has to be running for CCU to work.
import { launchWithExtension, isLoggedIn } from "./browser-context.ts";

const argv = process.argv.slice(2);
const once = argv.includes("--once");
const every = Number(argv[argv.indexOf("--every") + 1]) || 180;
const APP = process.env.RBX_APP ?? "http://localhost:3000";

type Game = { universeId: string; placeId: string; name: string };

async function loadGames(): Promise<Game[]> {
  const r = await fetch(`${APP}/api/live/games`);
  if (!r.ok) throw new Error(`app not answering (${r.status}) — start it with npm run dev`);
  return (await r.json()).games as Game[];
}

const { context } = await launchWithExtension();
if (!(await isLoggedIn(context))) {
  console.error("profile is not logged into Roblox — run `npm run grab:login` once");
  await context.close(); process.exit(1);
}
const page = await context.newPage();
await page.goto("https://create.roblox.com/dashboard/creations", { waitUntil: "domcontentloaded", timeout: 60_000 });
await page.waitForTimeout(4000);

let games: Game[];
try { games = await loadGames(); }
catch (e) { console.error((e as Error).message); await context.close(); process.exit(1); }
console.log(`polling ${games.length} games every ${every}s — Ctrl+C to stop\n`);

async function pass() {
  const out: unknown[] = [];
  for (const g of games) {
    const r = await page.evaluate(async (pid) => {
      const u = `https://apis.roblox.com/player-generated-reviews-service/v1/channels/`
        + `experience-discovery-page/assets/${pid}/reviews?limit=50`;
      try {
        const res = await fetch(u, { credentials: "include" });
        return { status: res.status, body: await res.text() };
      } catch (e) { return { status: 0, body: String(e) }; }
    }, g.placeId);

    if (r.status !== 200) { console.log(`  ${g.name}: HTTP ${r.status}`); continue; }
    let j: { reviews?: Array<Record<string, unknown>> };
    try { j = JSON.parse(r.body); } catch { console.log(`  ${g.name}: non-JSON`); continue; }
    for (const rv of j.reviews ?? []) {
      const comment = String(rv.comment ?? "").trim();
      if (!comment) continue;                       // a rating with no text is not feedback
      out.push({
        id: String(rv.id), universeId: g.universeId, game: g.name, comment,
        // created_utc arrives as epoch milliseconds in a string; store ISO.
        createdUtc: (() => { const v = String(rv.created_utc ?? "");
          const d = /^[0-9]+$/.test(v) ? new Date(Number(v)) : new Date(v);
          return Number.isNaN(d.getTime()) ? v : d.toISOString(); })(),
        assetVersion: rv.asset_version ?? null,
        category: rv.category_type ?? null, seenAt: new Date().toISOString(),
      });
    }
    await new Promise(s => setTimeout(s, 700));     // be polite between games
  }

  const res = await fetch(`${APP}/api/live/feedback`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ reviews: out }),
  });
  const j = await res.json();
  const stamp = new Date().toISOString().slice(11, 19);
  if (j.added) console.log(`[${stamp}] ${out.length} seen · ${j.added} new · ${j.alerted} alerted`
    + (j.coldStart?.length ? ` · cold start for ${j.coldStart.length} game(s), not alerted` : ""));
  else console.log(`[${stamp}] ${out.length} seen · nothing new`);
}

await pass();
if (!once) {
  // eslint-disable-next-line no-constant-condition
  while (true) { await new Promise(s => setTimeout(s, every * 1000)); try { await pass(); } catch (e) { console.error("pass failed:", (e as Error).message); } }
}
await context.close();
