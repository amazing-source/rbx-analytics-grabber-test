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

// The endpoint is newest-first and pages with `?cursor=<next_cursor>` — measured
// 2026-09-14 on Verity: page 2 had zero overlap and older dates. `next_cursor`
// and `pageToken` as the param name are silently IGNORED and return page 1
// again, so a wrong name looks like a clean run that found nothing new.
// One page is 50 reviews, and Verity wrote 50 in ~40 hours; a single page per
// pass lost every review past the first 50 whenever the poller was down.
const PAGE = 50;
const MAX_PAGES = 20;

async function fetchPage(placeId: string, cursor: string | null) {
  return page.evaluate(async ({ pid, cur, limit }) => {
    const u = `https://apis.roblox.com/player-generated-reviews-service/v1/channels/`
      + `experience-discovery-page/assets/${pid}/reviews?limit=${limit}`
      + (cur ? `&cursor=${encodeURIComponent(cur)}` : "");
    try {
      const res = await fetch(u, { credentials: "include" });
      return { status: res.status, body: await res.text() };
    } catch (e) { return { status: 0, body: String(e) }; }
  }, { pid: placeId, cur: cursor, limit: PAGE });
}

async function pass() {
  const kr = await fetch(`${APP}/api/live/feedback?known=1`);
  if (!kr.ok) throw new Error(`app not answering (${kr.status})`);
  const known = (await kr.json()).known as Record<string, string[]>;

  const out: unknown[] = [];
  const status: unknown[] = [];
  for (const g of games) {
    const seen = new Set(known[g.universeId] ?? []);
    // A game with nothing logged takes one page, as before — paging a cold start
    // back 1,000 reviews buys history nobody asked the live feed for.
    const budget = seen.size ? MAX_PAGES : 1;
    let cursor: string | null = null, pages = 0, returned = 0, code = 0, error: string | undefined;
    let metKnown = false, hasMore = false;

    while (pages < budget) {
      const r = await fetchPage(g.placeId, cursor);
      code = r.status;
      if (r.status !== 200) { error = r.body.slice(0, 160); break; }
      let j: { reviews?: Array<Record<string, unknown>>; next_cursor?: string; has_more?: boolean };
      try { j = JSON.parse(r.body); } catch { error = "non-JSON"; break; }
      pages++;
      for (const rv of j.reviews ?? []) {
        if (seen.has(String(rv.id))) { metKnown = true; continue; }
        const comment = String(rv.comment ?? "").trim();
        if (!comment) continue;                     // a rating with no text is not feedback
        returned++;
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
      hasMore = !!j.has_more && !!j.next_cursor;
      if (metKnown || !hasMore) break;              // caught up with the log, or the game's first review
      cursor = j.next_cursor!;
      await new Promise(s => setTimeout(s, 400));
    }
    // Ran out of budget without meeting a logged review: there is a hole in the
    // log, and the board has to say so rather than look complete.
    const truncated = !error && seen.size > 0 && !metKnown && hasMore;
    status.push({ universeId: g.universeId, game: g.name, status: code, pages, returned, truncated, error });
    if (error) console.log(`  ${g.name}: HTTP ${code}${error === "non-JSON" ? " non-JSON" : ""}`);
    else if (truncated) console.log(`  ${g.name}: gap longer than ${MAX_PAGES * PAGE} reviews — older ones not backfilled`);
    else if (pages > 1) console.log(`  ${g.name}: paged back ${pages} pages to meet the log`);
    await new Promise(s => setTimeout(s, 700));     // be polite between games
  }

  const res = await fetch(`${APP}/api/live/feedback`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ reviews: out, poll: { every, games: status } }),
  });
  const j = await res.json();
  const stamp = new Date().toISOString().slice(11, 19);
  if (j.added) console.log(`[${stamp}] ${out.length} unseen · ${j.added} new · ${j.alerted} alerted`
    + (j.backfilled ? ` · ${j.backfilled} backfilled, not alerted` : "")
    + (j.coldStart?.length ? ` · cold start for ${j.coldStart.length} game(s), not alerted` : ""));
  else console.log(`[${stamp}] nothing new`);
}

try { await pass(); } catch (e) { console.error("pass failed:", (e as Error).message); }
if (!once) {
  // eslint-disable-next-line no-constant-condition
  while (true) { await new Promise(s => setTimeout(s, every * 1000)); try { await pass(); } catch (e) { console.error("pass failed:", (e as Error).message); } }
}
await context.close();
