// Discord notification for a finished grab.
//
// The rule this file exists to honour, from the settings hint the tool has been
// showing since before it could send anything: a webhook fires when a metric
// falls outside what THAT WEEKDAY normally does for THAT GAME — a measured
// seasonal baseline, not a typed threshold. A fixed number would fire every
// Wednesday on a game whose Wednesday runs 42% below its own weekly mean, and
// an alert that fires every Wednesday is an alert nobody reads by March.
//
// Scoring is scoreSeries() in anomaly-score.ts, the same one `npm run anomaly`
// prints. Reading is from the exported corpus rather than a fresh query: the
// grab has just written it, the freeze policy has already been applied, and
// re-asking Roblox would spend the POST budget to get a number we hold.
//
// Quiet by default. Nothing to report means nothing is sent — a heartbeat that
// says "all normal" every hour trains the reader to ignore the channel, which
// is the same failure as the Wednesday alarm.

import { promises as fs } from "node:fs";
import path from "node:path";
import { resolveDataDir, totalSeries, type GameExport } from "@/lib/export-files";
import { scoreSeries, perDau, type Scored } from "@/lib/anomaly-score";
import type { DashConfig } from "@/lib/opencloud";

/** |z| at which a day stops being ordinary. 2 sigma on log residuals — the
 *  same bar `npm run anomaly` prints its "worst" table at, kept identical so
 *  the alert and the report never disagree about what counts. */
const Z_ALERT = 2;

/** Only these get scored. Not a taste list: every one is in CLAUDE.md's
 *  indispensable set, and a metric that cannot carry a LiveOps conclusion has
 *  no business waking anyone up. */
const WATCHED = new Set([
  "DailyActiveUsers",
  "PeakConcurrentPlayers",
  "ForwardD1Retention",
  "AverageSessionLengthMinutes",
  "DauMauStickiness",
  "PayingUsersCVR",
  "AverageRevenuePerUser",
  // DailyRevenue is deliberately NOT here. Every volume metric is normalised by
  // DAU before scoring, and DailyRevenue/DAU *is* AverageRevenuePerUser — the
  // two produced byte-identical findings (-20.7%, z -1.17) on 2026-08-18, which
  // is one problem reported twice. An alert that inflates its own count is
  // worse than one that misses: it makes a normal day look like a pile-up.
  "ErrorCount",
  "ClientCrashRate15m",
  "OomUnexpectedExits",
  "ClientFpsP10",
]);

const DAY = "METRIC_GRANULARITY_ONE_DAY";

async function readExport(universeId: string): Promise<GameExport | null> {
  try {
    const dir = await resolveDataDir();
    const raw = await fs.readFile(path.join(dir, "games", universeId, "series.json"), "utf8");
    return JSON.parse(raw) as GameExport;
  } catch {
    return null;
  }
}

/** Daily headline values for one metric, settled points only.
 *
 *  `partial` points are excluded for the reason CLAUDE.md gives: an interval
 *  that had not elapsed when we captured it is not a low day, it is an
 *  incomplete one, and scoring it produces an alert on every grab that runs
 *  before midnight. FILLED_ZERO is excluded too — a synthesized zero would read
 *  as a total outage to a log-space model. */
function dailyValues(m: Parameters<typeof totalSeries>[0]): Map<string, number> {
  const out = new Map<string, number>();
  const s = totalSeries(m);
  if (!s || s.granularity !== DAY) return out;
  for (const p of s.points) {
    if (p.value == null || p.partial || p.status === "FILLED_ZERO") continue;
    if (p.value > 0) out.set(p.date, p.value);
  }
  return out;
}

export type Finding = Scored & { bad: boolean; pct: number };

/** Score every watched metric in a game's corpus and return the outliers on the
 *  most recent day that has any scoreable data. */
export async function findingsFor(
  universeId: string,
  opts: { z?: number } = {}
): Promise<{ date: string | null; findings: Finding[] }> {
  const zAlert = opts.z ?? Z_ALERT;
  const g = await readExport(universeId);
  if (!g) return { date: null, findings: [] };

  const dau = dailyValues(g.metrics["DailyActiveUsers"] ?? ({ series: [] } as never));

  const all: Scored[] = [];
  for (const [name, metric] of Object.entries(g.metrics)) {
    if (!WATCHED.has(name)) continue;
    let values = dailyValues(metric);
    if (values.size === 0) continue;

    // Volume metrics are normalised by DAU first, or the detector fires on
    // growth: every volume series moves together when a game gets bigger.
    let label = name;
    if (metric.kind === "volume" && name !== "DailyActiveUsers") {
      if (dau.size === 0) continue;
      values = perDau(values, dau);
      label = `${name}/100kDAU`;
    }
    const dir: 1 | -1 = metric.higherIsBetter ? 1 : -1;
    const { scored } = scoreSeries(values, { metric: label, dir });
    all.push(...scored);
  }

  if (!all.length) return { date: null, findings: [] };
  const latest = all.map((s) => s.date).sort().at(-1)!;

  const findings = all
    .filter((s) => s.date === latest && Math.abs(s.z) >= zAlert)
    .map((s) => ({
      ...s,
      // "bad" is the sign of the move times what the metric wants. A crash
      // count that halves is not an incident, and a retention rate that halves
      // is — the same |z| means opposite things.
      bad: Math.sign(s.obs - s.exp) !== s.dir,
      pct: s.exp > 0 ? ((s.obs - s.exp) / s.exp) * 100 : 0,
    }))
    .sort((a, b) => Number(b.bad) - Number(a.bad) || Math.abs(b.z) - Math.abs(a.z));

  return { date: latest, findings };
}

// ------------------------------------------------------------------ dedupe
//
// The scheduler can run hourly, but a day's numbers only settle once. Without
// this the same anomaly is re-posted every hour until the date rolls over,
// which is indistinguishable from twenty new problems.

type NotifyState = Record<string, string>; // universeId -> last signature sent

async function notifyStatePath() {
  return path.join(await resolveDataDir(), "notify-state.json");
}

async function readNotifyState(): Promise<NotifyState> {
  try {
    return JSON.parse(await fs.readFile(await notifyStatePath(), "utf8")) as NotifyState;
  } catch {
    return {};
  }
}

async function writeNotifyState(s: NotifyState) {
  const p = await notifyStatePath();
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(s, null, 2) + "\n", "utf8");
}

function signature(date: string, findings: Finding[]): string {
  return `${date}|${findings.map((f) => `${f.metric}:${f.z.toFixed(1)}`).sort().join(",")}`;
}

// ------------------------------------------------------------------ sending

const fmt = (v: number) =>
  Math.abs(v) >= 1000 ? Math.round(v).toLocaleString("en-US") : v >= 1 ? v.toFixed(2) : v.toFixed(4);

export function buildMessage(universeId: string, date: string, findings: Finding[]) {
  const worst = findings.filter((f) => f.bad);
  const color = worst.length ? 0xd9534f : 0xf0ad4e; // red when bad, amber when merely unusual
  const lines = findings.map((f) => {
    const arrow = f.obs > f.exp ? "▲" : "▼";
    const sign = f.pct > 0 ? "+" : "";
    return (
      `${f.bad ? "🔴" : "🟡"} **${f.metric}** ${arrow} ${sign}${f.pct.toFixed(1)}% vs this weekday\n` +
      ` observed ${fmt(f.obs)} · expected ${fmt(f.exp)} · z ${f.z >= 0 ? "+" : ""}${f.z.toFixed(2)}`
    );
  });

  return {
    username: "RBX Analytics",
    embeds: [
      {
        title: `${worst.length ? "Anomaly" : "Unusual day"} — universe ${universeId}`,
        description: lines.join("\n"),
        color,
        footer: {
          // The scored DAY spelled out. Putting it in `timestamp` instead made
          // Discord render 2026-08-18 as "Yesterday at 2:00 AM" in the reader's
          // local zone — a UTC day is not an instant, and showing it as one
          // invites someone to think the anomaly happened at 2am.
          text:
            `Day scored: ${date} (UTC) · against this weekday's own median, ` +
            "7-day local level, z on log residuals. Not a threshold.",
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

async function post(webhook: string, payload: unknown): Promise<{ ok: boolean; detail: string }> {
  try {
    const r = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    // Discord answers 204 with no body on success.
    if (r.ok) return { ok: true, detail: `HTTP ${r.status}` };
    return { ok: false, detail: `HTTP ${r.status}: ${(await r.text()).slice(0, 200)}` };
  } catch (e) {
    return { ok: false, detail: (e as Error).message };
  }
}

/** Per-game webhook wins over the global one — that is what the settings panel
 *  has always said it does. */
export function webhookFor(cfg: DashConfig, universeId: string): string | null {
  const g = cfg.games?.[universeId];
  const url = (g?.discordWebhook || cfg.discordWebhook || "").trim();
  return /^https:\/\/discord(app)?\.com\/api\/webhooks\//.test(url) ? url : null;
}

export type NotifyOutcome =
  | { sent: false; reason: string }
  | { sent: true; findings: number; detail: string };

/** Called after each grab — by the scheduler, and by /api/ingest when the
 *  browser path finishes an ACTIVE grab. Both paths alert, or a game watched
 *  only from the browser would be silently unalerted while looking configured.
 *
 *  Never throws: a notification failure must not take the grab down with it.
 *  The data is already on disk and that is the part that cannot be redone. */
export async function notifyGrab(universeId: string, cfg: DashConfig): Promise<NotifyOutcome> {
  try {
    const webhook = webhookFor(cfg, universeId);
    if (!webhook) return { sent: false, reason: "no webhook configured" };

    const { date, findings } = await findingsFor(universeId);
    if (!date || !findings.length) return { sent: false, reason: "nothing outside the weekday baseline" };

    const state = await readNotifyState();
    const sig = signature(date, findings);
    if (state[universeId] === sig) return { sent: false, reason: "already sent for this day" };

    const res = await post(webhook, buildMessage(universeId, date, findings));
    if (res.ok) {
      state[universeId] = sig;
      await writeNotifyState(state);
      return { sent: true, findings: findings.length, detail: res.detail };
    }
    return { sent: false, reason: `post failed: ${res.detail}` };
  } catch (e) {
    return { sent: false, reason: `notify failed: ${(e as Error).message}` };
  }
}
