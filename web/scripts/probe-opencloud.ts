// Probes the Open Cloud Analytics Query API (beta) to find out what it will
// actually serve for a universe we already hold ground truth for.
//
//   ROBLOX_API_KEY=... npm run probe-opencloud -- <universeId> [days]
//
// This answers one question and nothing else: for each metric class, does the
// official key-authenticated API return DATA, an EMPTY 200, or an ERROR?
//
// It exists because the documentation contradicts itself. cloud/llms.txt says
// DAU/MAU/engagement and revenue are NOT available over REST and that you must
// use the dashboard; the Analytics feature reference says they are. Only a real
// call decides, and per CLAUDE.md an invented shape that 400s tells us nothing —
// so the request shape below is the one a developer published as tested working
// on 2026-07-24, not one we made up:
//
//   POST https://apis.roblox.com/analytics-query-api/v1/universes/{id}/metrics
//   x-api-key: <key>
//   { metric, granularity: "OneDay", startTime, endTime }
//
// The key is read from the environment and never printed, stored or written to
// any output file. It is a scoped read-only Open Cloud key, not a session
// cookie — but it is still a credential and this script treats it as one.

import { readFileSync } from "node:fs";

const BASE = "https://apis.roblox.com/analytics-query-api/v1";

// One representative metric per class we care about. The two that matter most
// are the last two: nobody in the beta thread confirmed whether stability and
// error data are served, and those are exactly the ones that age out at 28 days.
const PROBES: { metric: string; klass: string }[] = [
  { metric: "DailyActiveUsers", klass: "engagement" },
  { metric: "MonthlyActiveUsers", klass: "engagement" },
  { metric: "PeakConcurrentPlayers", klass: "engagement" },
  { metric: "AverageSessionLengthMinutes", klass: "engagement" },
  { metric: "ForwardD1Retention", klass: "retention" },
  { metric: "ForwardD7Retention", klass: "retention" },
  { metric: "DauMauStickiness", klass: "retention" },
  { metric: "DailyRevenue", klass: "monetization" },
  { metric: "PayingUsers", klass: "monetization" },
  { metric: "PayingUsersCVR", klass: "monetization" },
  { metric: "AverageRevenuePerUser", klass: "monetization" },
  { metric: "ItemMonetizationRevenue", klass: "monetization" },
  { metric: "FunnelUserStepCompletionRate", klass: "funnel" },
  { metric: "PlayerFeedbackVotesCount", klass: "feedback" },
  { metric: "ServerCrashCount", klass: "stability" },
  { metric: "ClientCrashCount", klass: "stability" },
  { metric: "ClientCrashRate15m", klass: "stability" },
  { metric: "OomUnexpectedExits", klass: "stability" },
  { metric: "ClientFpsAvg", klass: "performance" },
  { metric: "ClientMemoryUsagePercentageAvg", klass: "performance" },
  { metric: "CpuTimeAvg", klass: "performance" },
  { metric: "ErrorCount", klass: "errors" },
];

// The key comes from the environment, or from a gitignored file next to the
// project. The file is preferred in practice for one reason: a key passed on a
// command line shows up in shell history and in the process list, where a file
// read does not. Nothing here ever echoes it.
function readKey(): string | undefined {
  if (process.env.ROBLOX_API_KEY) return process.env.ROBLOX_API_KEY.trim();
  for (const p of [".opencloud-key", "../.opencloud-key"]) {
    try {
      const v = readFileSync(new URL(p, import.meta.url), "utf8").trim();
      if (v) return v;
    } catch { /* not there; that is fine */ }
  }
  try {
    const v = readFileSync(".opencloud-key", "utf8").trim();
    if (v) return v;
  } catch { /* not there either */ }
  return undefined;
}

const key = readKey();
const universe = process.argv[2];
const days = Number(process.argv[3] || 28);

if (!key) {
  console.error("ROBLOX_API_KEY is not set.\n");
  console.error("Create one at https://create.roblox.com/dashboard/credentials");
  console.error('  scope: "universe-analytics"  operation: universe.analytics:read');
  console.error("  add the universe to the key, and set an IP allowlist.\n");
  console.error("Then:  ROBLOX_API_KEY=xxx npm run probe-opencloud -- <universeId>");
  process.exit(2);
}
if (!/^\d+$/.test(universe || "")) {
  console.error("usage: npm run probe-opencloud -- <universeId> [days]");
  process.exit(2);
}

// Snap to whole UTC days: ONE_DAY points are stamped 00:00:00Z, and asking for
// a partial day is how a half-elapsed bucket gets mistaken for a real drop.
const end = new Date();
end.setUTCHours(0, 0, 0, 0);
const start = new Date(end.getTime() - days * 86400_000);
const startTime = start.toISOString().replace(/\.\d{3}Z$/, "Z");
const endTime = end.toISOString().replace(/\.\d{3}Z$/, "Z");

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Outcome = {
  metric: string;
  klass: string;
  status: string;
  points: number;
  first?: string;
  last?: string;
  note?: string;
};

async function poll(path: string): Promise<Record<string, unknown> | null> {
  // 3,000 polls/min is generous; the limit worth respecting is the 30/min on
  // submissions, which is handled by the pause between probes below.
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    const res = await fetch(`https://apis.roblox.com/analytics-query-api/${path}`, {
      headers: { "x-api-key": key! },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as Record<string, unknown>;
    if (body.done) return body;
  }
  return null;
}

async function probe(metric: string, klass: string): Promise<Outcome> {
  let res: Response;
  try {
    res = await fetch(`${BASE}/universes/${universe}/metrics`, {
      method: "POST",
      headers: { "x-api-key": key!, "content-type": "application/json" },
      body: JSON.stringify({ metric, granularity: "OneDay", startTime, endTime }),
    });
  } catch (e) {
    return { metric, klass, status: "NETWORK", points: 0, note: String((e as Error).message) };
  }

  const text = await res.text();
  if (!res.ok) {
    // The message body is the whole point of a failure: a 400 that says
    // "unknown metric" and a 403 that says "scope missing" mean opposite things
    // about the game, and only one of them is about the API at all.
    return {
      metric, klass,
      status: `HTTP ${res.status}`,
      points: 0,
      note: text.slice(0, 180).replace(/\s+/g, " "),
    };
  }

  let body: Record<string, unknown>;
  try { body = JSON.parse(text); } catch {
    return { metric, klass, status: "BAD JSON", points: 0, note: text.slice(0, 120) };
  }

  if (body.done === false && typeof body.path === "string") {
    const polled = await poll(body.path);
    if (!polled) return { metric, klass, status: "TIMEOUT", points: 0, note: "operation never completed" };
    body = polled;
  }

  const response = (body.response ?? {}) as { values?: { breakdowns?: unknown[]; dataPoints?: { time: string; value: number }[] }[] };
  const values = response.values ?? [];
  const pts = values.flatMap((v) => v.dataPoints ?? []);
  if (!pts.length) {
    // Per CLAUDE.md: a 200 with zero points is NOT evidence the game lacks this
    // metric. It means the query matched nothing, and that is a different claim.
    return { metric, klass, status: "EMPTY 200", points: 0, note: "matched nothing — not proof of absence" };
  }
  const times = pts.map((p) => p.time).sort();
  return {
    metric, klass,
    status: "DATA",
    points: pts.length,
    first: times[0]?.slice(0, 10),
    last: times[times.length - 1]?.slice(0, 10),
    note: `${values.length} series`,
  };
}

console.log(`Open Cloud analytics probe · universe ${universe}`);
console.log(`window ${startTime.slice(0, 10)} → ${endTime.slice(0, 10)} (${days}d, OneDay)\n`);

const results: Outcome[] = [];
for (const p of PROBES) {
  const out = await probe(p.metric, p.klass);
  results.push(out);
  const mark = out.status === "DATA" ? "✓" : out.status === "EMPTY 200" ? "·" : "✗";
  const span = out.status === "DATA" ? `  ${out.first} → ${out.last}` : "";
  console.log(
    `${mark} ${out.klass.padEnd(12)} ${out.metric.padEnd(32)} ${out.status.padEnd(10)} ${String(out.points).padStart(4)} pts${span}` +
    (out.note && out.status !== "DATA" ? `\n      ${out.note}` : "")
  );
  // 30 submissions/minute per key owner. 2.2s keeps us under it with room to
  // spare even if a retry sneaks in.
  await sleep(2200);
}

const byStatus = (s: string) => results.filter((r) => r.status === s).length;
console.log(`\n${byStatus("DATA")} served · ${byStatus("EMPTY 200")} empty · ${results.length - byStatus("DATA") - byStatus("EMPTY 200")} failed`);

const stability = results.filter((r) => r.klass === "stability" || r.klass === "performance" || r.klass === "errors");
const stabilityOk = stability.filter((r) => r.status === "DATA").length;
console.log(
  `\nThe question that matters — stability/performance/errors: ${stabilityOk}/${stability.length} served.` +
  (stabilityOk === 0
    ? "\n  → Open Cloud does not serve the perishable data. The extension stays essential."
    : stabilityOk === stability.length
      ? "\n  → Open Cloud serves everything. The extension becomes optional."
      : "\n  → Partial. Hybrid: Open Cloud for the bulk, extension for the rest.")
);
console.log("\nEmpty results are NOT proof a metric is unavailable — check the dashboard before concluding.");
