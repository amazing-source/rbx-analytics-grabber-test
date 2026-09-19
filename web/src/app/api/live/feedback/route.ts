import { NextResponse } from "next/server";
import {
  addReviews, feedbackLog, isFirstSightOf, knownReviewIds, lastPoll, recordPoll,
  type PollGame, type Review,
} from "@/lib/live";
import { readConfig } from "@/lib/opencloud";
import { webhookFor } from "@/lib/notify";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // The poller asks for this before each pass so it knows how far back to page.
  if (new URL(req.url).searchParams.get("known") === "1")
    return NextResponse.json({ known: await knownReviewIds() });
  return NextResponse.json({ reviews: (await feedbackLog()).slice(0, 300), poll: await lastPoll() });
}

/** The in-browser poller POSTs here; this route dedups and alerts. */
export async function POST(req: Request) {
  let body: { reviews?: Review[]; poll?: { every?: number; games?: PollGame[] } };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }

  // Heartbeat first, and on every pass — a pass that found nothing new is still
  // proof the feed is running, which the log's own dates cannot show.
  const every = Number(body.poll?.every) || 180;
  if (body.poll) await recordPoll({ at: new Date().toISOString(), every, games: body.poll.games ?? [] });

  const incoming = body.reviews ?? [];
  if (!incoming.length) return NextResponse.json({ added: 0, alerted: 0, backfilled: 0 });

  // A cold start would otherwise fire an alert for every historical review.
  const coldStart = new Set<string>();
  for (const u of new Set(incoming.map(r => r.universeId)))
    if (await isFirstSightOf(u)) coldStart.add(u);

  const fresh = await addReviews(incoming);
  // After a gap the poller pages back and backfills — days of reviews that are
  // new to the log but not new. Only a review written within a few poll
  // intervals is announced; the rest are logged silently.
  const since = Date.now() - Math.max(15 * 60_000, 3 * every * 1000);
  const recent = fresh.filter(r => Date.parse(r.createdUtc) >= since);
  const alertable = recent.filter(r => !coldStart.has(r.universeId));

  let alerted = 0;
  if (alertable.length) {
    const cfg = readConfig();
    const byGame = new Map<string, Review[]>();
    for (const r of alertable) byGame.set(r.universeId, [...(byGame.get(r.universeId) ?? []), r]);
    for (const [universeId, rows] of byGame) {
      const hook = webhookFor(cfg, universeId);
      if (!hook) continue;
      const lines = rows.slice(0, 8).map(r =>
        `> ${r.comment.replace(/\n/g, " ").slice(0, 220)}${r.assetVersion ? `\n> — v${r.assetVersion}` : ""}`);
      const more = rows.length > 8 ? `\n…and ${rows.length - 8} more` : "";
      try {
        const res = await fetch(hook, {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({
            content: `**${rows[0].game}** — ${rows.length} new review${rows.length > 1 ? "s" : ""}\n${lines.join("\n\n")}${more}`,
          }),
        });
        if (res.ok) alerted += rows.length;
      } catch { /* a webhook failure must never lose the stored review */ }
    }
  }
  return NextResponse.json({
    added: fresh.length, alerted, backfilled: fresh.length - recent.length, coldStart: [...coldStart],
  });
}
