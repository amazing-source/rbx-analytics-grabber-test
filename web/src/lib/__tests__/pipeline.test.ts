// Regression tests: every bug the 2026-08-08 audit found, encoded so it
// cannot come back. Fixtures in ../__fixtures__ are trimmed excerpts of real
// capture bundles — values untouched — so these assert against what Roblox
// actually served, not against a mock.
//
//   npm test
//
// Each test ingests fixtures into a throwaway data dir through the real
// exportToFiles path, then reads back what a human (or an agent) would read.

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import { parseCaptures, type Capture } from "../parse-captures";
import {
  exportToFiles,
  detectIncidents,
  totalSeries,
  type GameExport,
  type ExportMetric,
} from "../export-files";

const GAME = "9610561918";
const FIXTURES = path.resolve(import.meta.dirname, "../__fixtures__");

const HOURLY_FIRST = "grab-1741-hourly-revenue.json";
const HOURLY_REGRESSED = "grab-1748-hourly-revenue-regressed.json";
const PERF_TAB = "perf-tab-passive-0808.json";

let tmpRoot: string;
const dirs: string[] = [];

before(async () => {
  tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "rbx-test-"));
});
after(async () => {
  await fs.rm(tmpRoot, { recursive: true, force: true });
});

/** Ingest fixtures in order into a fresh data dir; return what landed on disk. */
async function ingest(...fixtures: string[]): Promise<{
  game: GameExport;
  summary: string;
  dir: string;
  read: (rel: string) => Promise<string | null>;
}> {
  const dir = path.join(tmpRoot, `d${dirs.length}`);
  dirs.push(dir);
  await fs.mkdir(dir, { recursive: true });
  process.env.RBX_DATA_DIR = dir;
  for (const f of fixtures) {
    const captures: Capture[] = JSON.parse(await fs.readFile(path.join(FIXTURES, f), "utf8"));
    await exportToFiles(parseCaptures(captures));
  }
  const gameDir = path.join(dir, "games", GAME);
  const read = async (rel: string) => {
    try {
      return await fs.readFile(path.join(gameDir, rel), "utf8");
    } catch {
      return null;
    }
  };
  return {
    game: JSON.parse(await fs.readFile(path.join(gameDir, "series.json"), "utf8")),
    summary: (await read("summary.md"))!,
    dir,
    read,
  };
}

const metric = (g: GameExport, name: string): ExportMetric => {
  const m = g.metrics[name];
  assert.ok(m, `fixture should carry ${name}`);
  return m;
};

// The summary row for a metric label, as rendered.
function summaryRow(summary: string, label: string): string {
  const row = summary
    .split("\n")
    .find((l) => l.startsWith(`| ${label} |`));
  assert.ok(row, `summary.md should have a row for "${label}"`);
  return row;
}

describe("D1 — a breakdown slice is never presented as the metric", () => {
  test("the 30,393 crash incident is visible, not hidden behind its OutOfMemory slice", async () => {
    const { game, summary } = await ingest(PERF_TAB);

    const incidents = detectIncidents(game);
    const crash = incidents.find((i) => i.metric === "ServerCrashCount");
    assert.ok(crash, "ServerCrashCount incident must be detected");
    assert.equal(crash.peak, 30393, "peak must be the real Total-series peak");
    assert.ok(
      crash.from <= "2026-07-31" && crash.to >= "2026-07-31",
      `incident window ${crash.from}..${crash.to} must contain 2026-07-31`,
    );

    assert.match(summary, /## ⚠ Incidents/);
    assert.match(summary, /Server Crashes .*30\.4K/);
  });

  test("headline series always has an empty breakdown", async () => {
    const { game } = await ingest(PERF_TAB, HOURLY_FIRST);
    for (const m of Object.values(game.metrics)) {
      const total = totalSeries(m);
      if (!total) continue;
      assert.deepEqual(
        Object.keys(total.breakdown ?? {}),
        [],
        `${m.metric}: headline series "${total.label}" is a breakdown slice`,
      );
      // A Place filter still counts as Total (the whole Performance tab is
      // Place-scoped); a population filter does not.
      for (const f of total.filters ?? [])
        assert.equal(
          f.dimension,
          "Place",
          `${m.metric}: headline series is filtered by ${f.dimension} — that is a slice`,
        );
    }
  });

  test("a metric with only broken-down series prints no headline at all", async () => {
    const { game, summary } = await ingest(HOURLY_FIRST);
    const m = metric(game, "TotalSessionsEndedInBucket");
    assert.equal(totalSeries(m), null, "fixture metric has only SessionTimeBucket slices");
    const row = summaryRow(summary, "Sessions Ended");
    assert.match(row, /breakdown only/);
    assert.doesNotMatch(row, /shown: SessionTimeBucket/);
  });

  test("PeakConcurrentPlayers reads ~713, not the 0.5 of a live-tile slice", async () => {
    const { game, summary } = await ingest(PERF_TAB);
    const m = metric(game, "PeakConcurrentPlayers");
    const total = totalSeries(m);
    assert.ok(total, "PeakConcurrentPlayers must have a Total series");
    assert.notEqual(
      total.granularity,
      "METRIC_GRANULARITY_ONE_MINUTE",
      "a ONE_MINUTE live tile must never become the headline series",
    );
    const row = summaryRow(summary, "Peak Concurrent");
    const value = Number(row.split("|")[3].trim());
    assert.ok(value > 400, `headline peak concurrent was ${value}, expected the real ~713`);
  });
});

describe("D2 — omitted zero rows", () => {
  test("count volumes are gap-filled inside the requested window", async () => {
    const { game } = await ingest(PERF_TAB);
    const total = totalSeries(metric(game, "ServerCrashCount"))!;
    const filled = total.points.filter((p) => p.status === "FILLED_ZERO");
    assert.ok(filled.length > 0, "quiet crash days must be filled with explicit zeros");
    assert.ok(
      filled.every((p) => p.value === 0),
      "a filled point is a zero, never anything else",
    );
    // Consecutive daily coverage: no holes left between first and last point.
    const days = total.points.map((p) => p.date).sort();
    const span =
      (new Date(days[days.length - 1]).getTime() - new Date(days[0]).getTime()) / 86_400_000 + 1;
    assert.equal(total.points.length, span, "daily series must have no holes after filling");
  });

  test("rates are never gap-filled — a missing day is unknown, not 0%", async () => {
    const { game } = await ingest(PERF_TAB);
    for (const name of ["ClientCrashRate15m"]) {
      for (const s of metric(game, name).series)
        assert.equal(
          s.points.filter((p) => p.status === "FILLED_ZERO").length,
          0,
          `${name} is a rate and must never be gap-filled`,
        );
    }
  });
});

describe("D4 — partial trailing intervals", () => {
  test("an in-progress interval is flagged and kept out of the headline", async () => {
    const { game, summary } = await ingest(PERF_TAB);
    const m = metric(game, "ClientCrashCount");
    const total = totalSeries(m)!;
    const partials = total.points.filter((p) => p.partial);
    assert.ok(partials.length > 0, "the capture's trailing day was still in progress");

    const headlineDate = summaryRow(summary, "Crash Count").split("|")[4].trim();
    for (const p of partials)
      assert.notEqual(p.date, headlineDate, "a partial interval must not be quoted as Latest");
  });

  test("every headline date is a settled point", async () => {
    const { game, summary } = await ingest(PERF_TAB, HOURLY_FIRST);
    for (const m of Object.values(game.metrics)) {
      const total = totalSeries(m);
      if (!total) continue;
      const row = summary.split("\n").find((l) => l.startsWith(`| ${m.label} |`));
      if (!row) continue;
      const date = row.split("|")[4].trim();
      if (date === "—") continue;
      const quoted = total.points.filter((p) => p.date === date && p.value != null);
      if (!quoted.length) continue; // sub-daily rollups have no matching raw ts
      assert.ok(
        quoted.some((p) => !p.partial),
        `${m.metric}: headline date ${date} has only in-progress points`,
      );
    }
  });
});

describe("F2 — a re-grab must not overwrite settled values", () => {
  test("the gateway re-serving a settled hour is logged, not applied", async () => {
    const { game, read } = await ingest(HOURLY_FIRST, HOURLY_REGRESSED);
    const total = totalSeries(metric(game, "ItemMonetizationRevenue"))!;
    const hour = total.points.find((p) => p.ts.startsWith("2026-08-07T00"));
    assert.ok(hour, "the disputed hour must be stored");
    assert.equal(
      hour.value,
      3092,
      "the first settled read (dashboard-confirmed 3092) must survive the 747 re-serve",
    );

    const quality = await read("data-quality.md");
    assert.ok(quality, "a divergent re-read must produce data-quality.md");
    assert.match(quality, /revision \| ItemMonetizationRevenue/);
    assert.match(quality, /747/);
  });

  test("order does not matter: whichever settled read lands first is kept and the other reported", async () => {
    const { game, read } = await ingest(HOURLY_REGRESSED, HOURLY_FIRST);
    const total = totalSeries(metric(game, "ItemMonetizationRevenue"))!;
    const hour = total.points.find((p) => p.ts.startsWith("2026-08-07T00"))!;
    assert.equal(hour.value, 747, "first-write-wins for settled points, regardless of order");
    assert.match((await read("data-quality.md"))!, /3092/);
  });
});

describe("D3 — status semantics", () => {
  test("no row claims 'latest point is an estimate'", async () => {
    const { summary } = await ingest(PERF_TAB, HOURLY_FIRST);
    assert.doesNotMatch(
      summary,
      /estimate/i,
      "DATA_STATUS_INVALID is the protobuf zero-value, not an estimate flag",
    );
  });

  test("the not-statistically-significant series is surfaced and excluded from incidents", async () => {
    const { game, summary } = await ingest(PERF_TAB);
    const tv = metric(game, "ClientCrashRate15m").series.find((s) => s.breakdown.Platform === "TV");
    assert.ok(tv, "fixture carries the TV crash-rate series");
    assert.ok(
      tv.points.some((p) => p.status === "DATA_STATUS_NOT_STATISTICALLY_SIGNIFICANT"),
      "the TV series is the one Roblox marks not significant",
    );
    assert.match(summaryRow(summary, "Crash Rate (15m)"), /not statistically significant/);

    for (const i of detectIncidents(game))
      assert.notEqual(i.label, "Crash Rate (15m)", "a not-significant series cannot carry an incident");
  });
});

describe("D9 — unit plausibility", () => {
  test("no stored value sits outside its unit's plausible range", async () => {
    const { read } = await ingest(PERF_TAB, HOURLY_FIRST);
    const quality = await read("data-quality.md");
    if (quality)
      assert.doesNotMatch(
        quality,
        /implausible/,
        "an implausible value means the metric's unit mapping is wrong",
      );
  });
});

// G8 — a long grab must still retrieve the technical rung.
// Roblox caps the window on crash/perf/error metrics and 400s a longer ask
// instead of truncating it. Measured 2026-08-09: a 139-day grab returned every
// behavioural metric and lost all 19 perf/error shapes that had worked at 28
// days. The fix is to chunk the span into legal windows, so the data is pulled
// wherever it exists rather than abandoned.
describe("G8 — the technical rung is chunked into legal windows", () => {
  const LONG_START = "2026-03-23T00:00:00.000Z";
  const LONG_END = "2026-08-09T00:00:00.000Z"; // 139 days

  const planFor = async (start: string, end: string) => {
    // store.ts pulls in the Supabase client at module load. The plan itself
    // never needs it — the learned-template lookup fails soft and falls back to
    // the seed — but the import throws without these, so stub them.
    process.env.SUPABASE_URL ||= "http://localhost:54321";
    process.env.SUPABASE_SECRET_KEY ||= "test-not-a-real-key";
    const { getGrabPlan } = await import("../store");
    return getGrabPlan("9963622286", start, end, { __places: ["99255447043899"] });
  };

  const windowsFor = (plan: { requests: { metric: string | null; body: unknown }[] }, metric: string) =>
    plan.requests
      .filter((r) => r.metric === metric)
      .map((r) => (r.body as { query?: { startTime?: string; endTime?: string } })?.query)
      .filter((q): q is { startTime: string; endTime: string } => !!q?.startTime && !!q?.endTime);

  const spanDays = (w: { startTime: string; endTime: string }) =>
    (Date.parse(w.endTime) - Date.parse(w.startTime)) / 86_400_000;

  test("no crash request asks for more than 7 days", async () => {
    const plan = await planFor(LONG_START, LONG_END);
    const windows = windowsFor(plan, "ServerCrashCount");
    assert.ok(windows.length > 1, "a 139-day span must produce multiple crash requests");
    for (const w of windows)
      assert.ok(
        spanDays(w) <= 7,
        `crash window of ${spanDays(w)}d exceeds the 7-day cap — the gateway 400s this`,
      );
  });

  test("the chunks tile the asked span with no hole", async () => {
    const plan = await planFor(LONG_START, LONG_END);
    // ServerCrashCount has several templates (plain, by Platform, by CrashType)
    // and each tiles the span independently — group by template, not by metric,
    // or three correct tilings look like one broken one.
    const byTemplate = new Map<string, { startTime: string; endTime: string }[]>();
    for (const r of plan.requests as { id: string; metric: string | null; body: unknown }[]) {
      if (r.metric !== "ServerCrashCount") continue;
      const q = (r.body as {
        query?: { startTime?: string; endTime?: string; granularity?: string };
      })?.query;
      if (!q?.startTime || !q.endTime) continue;
      // Sub-daily templates are deliberately clamped to the final 24h by
      // alignWindow (the gateway truncates long sub-daily windows), so they
      // are not expected to tile the span.
      if (q.granularity !== "METRIC_GRANULARITY_ONE_DAY") continue;
      const base = r.id.split("@")[0];
      (byTemplate.get(base) ?? byTemplate.set(base, []).get(base)!).push({
        startTime: q.startTime,
        endTime: q.endTime,
      });
    }
    assert.ok(byTemplate.size > 0, "expected at least one ServerCrashCount template");
    for (const [base, ws] of byTemplate) {
      const windows = ws.sort((a, b) => a.startTime.localeCompare(b.startTime));
      // Since 2026-09-03 the technical rung is clamped to its retention
      // horizon before chunking (crash/perf ~30d, ErrorCount ~56d — measured;
      // older chunks are guaranteed 400s for data Roblox deleted). So the
      // tiling starts at the horizon, not at the grab start. What must still
      // hold is that it reaches the END and has no hole — a hole is a day we
      // silently never asked for.
      assert.equal(windows.at(-1)!.endTime, LONG_END, `${base}: last chunk must reach the grab end`);
      assert.ok(
        Date.parse(windows[0].startTime) >= Date.parse(LONG_START),
        `${base}: tiling must not start before the grab start`,
      );
      const askedDays = Math.round(
        (Date.parse(LONG_END) - Date.parse(windows[0].startTime)) / 86_400_000,
      );
      assert.ok(
        askedDays >= 30,
        `${base}: clamped to ${askedDays}d — crash data is served for ~30d, so a ` +
          `tighter clamp silently drops history that exists`,
      );
      for (let i = 1; i < windows.length; i++) {
        const gap = Date.parse(windows[i].startTime) - Date.parse(windows[i - 1].endTime);
        // Exactly one day: the gateway is inclusive on both ends, so sharing a
        // boundary instant refetches that day in both chunks (147 duplicate
        // points, measured 2026-08-09). More than one day would drop days.
        assert.equal(
          gap,
          86_400_000,
          `${base}: chunk ${i} must start exactly one interval after chunk ${i - 1} ends`,
        );
      }
    }
  });

  test("the horizon clamp is REPORTED, never silent", async () => {
    const plan = await planFor(LONG_START, LONG_END);
    const w = (plan.warnings ?? []).join(" | ");
    assert.match(
      w,
      /clamped to its retention horizon/,
      "an unreported clamp reads as a metric the game never had",
    );
    assert.match(
      w,
      /NOT AN ABSENCE OF INCIDENTS/,
      "the warning must say absence of coverage is not evidence of health",
    );
  });

  test("RBX_NO_HORIZON restores full-span tiling", async () => {
    process.env.RBX_NO_HORIZON = "1";
    try {
      const plan = await planFor(LONG_START, LONG_END);
      const starts = (plan.requests as { id: string; metric: string | null; body: unknown }[])
        .filter((r) => r.metric === "ServerCrashCount")
        .map((r) => (r.body as { query?: { startTime?: string; granularity?: string } })?.query)
        .filter((q) => q?.granularity === "METRIC_GRANULARITY_ONE_DAY")
        .map((q) => q!.startTime!)
        .sort();
      assert.equal(
        starts[0],
        LONG_START,
        "with the clamp off, the tiling must still cover the whole span as it did before",
      );
    } finally {
      delete process.env.RBX_NO_HORIZON;
    }
  });

  test("chunk requests carry distinct ids", async () => {
    const plan = await planFor(LONG_START, LONG_END);
    const ids = plan.requests.filter((r) => r.metric === "ServerCrashCount").map((r) => (r as { id: string }).id);
    assert.equal(new Set(ids).size, ids.length, "colliding ids hide attempts from grab-report.md");
  });

  test("a NONE-granularity metric is clamped, never split into several aggregates", async () => {
    const plan = await planFor(LONG_START, LONG_END);
    const reqs = (plan.requests as { metric: string | null; body: unknown }[]).filter(
      (r) => r.metric === "PotentialExtraEarningsTotalUsd",
    );
    assert.equal(reqs.length, 1, "NONE means one aggregate; chunking it changes the question");
    const q = (reqs[0].body as { query: { startTime: string; endTime: string } }).query;
    assert.ok(
      spanDays(q) <= 28,
      `clamped window is ${spanDays(q)}d; it 400s on a long span and 28d is proven to work`,
    );
    assert.equal(q.endTime, LONG_END, "the clamp must keep the most RECENT window, not the oldest");
  });

  test("behavioural metrics are NOT chunked — one request, full span", async () => {
    const plan = await planFor(LONG_START, LONG_END);
    const windows = windowsFor(plan, "DailyActiveUsers");
    assert.ok(windows.length >= 1);
    assert.ok(
      windows.some((w) => spanDays(w) > 100),
      "DAU served 138 days in one request; chunking it would multiply requests for nothing",
    );
  });

  test("a short grab is unaffected — no extra requests", async () => {
    const short = await planFor("2026-07-12T00:00:00.000Z", "2026-08-09T00:00:00.000Z");
    const windows = windowsFor(short, "ServerCrashCount");
    assert.ok(windows.length >= 1);
    for (const w of windows) assert.ok(spanDays(w) <= 7);
  });
});

// ---------------------------------------------------------------------------
// G9 — the gateway ships a human name for a dimension value and we dropped it.
// FunnelStep came out as bare integers 1..20, so "61% of players never reach
// step 4" could not be read as "61% never reach Rebirth1". The names were in
// data/raw the whole time; only the exporter threw them away. Fixture is a
// trimmed excerpt of the real 2026-08-10 grab of 9963622286.
// ---------------------------------------------------------------------------
describe("G9 — dimension display names survive into what a human reads", () => {
  const FUNNEL_GAME = "9963622286";
  const FUNNEL_FIXTURE = "funnel-step-displayvalue-0810.json";

  async function ingestFunnel() {
    const dir = path.join(tmpRoot, `funnel${dirs.length}`);
    dirs.push(dir);
    await fs.mkdir(dir, { recursive: true });
    process.env.RBX_DATA_DIR = dir;
    const captures: Capture[] = JSON.parse(
      await fs.readFile(path.join(FIXTURES, FUNNEL_FIXTURE), "utf8"),
    );
    await exportToFiles(parseCaptures(captures));
    const gameDir = path.join(dir, "games", FUNNEL_GAME);
    return {
      game: JSON.parse(await fs.readFile(path.join(gameDir, "series.json"), "utf8")) as GameExport,
      gameDir,
    };
  }

  test("parseCaptures keeps displayValue alongside the raw value", async () => {
    const captures: Capture[] = JSON.parse(
      await fs.readFile(path.join(FIXTURES, FUNNEL_FIXTURE), "utf8"),
    );
    const { snapshots } = parseCaptures(captures);
    const withStep = snapshots.filter((s) => s.breakdown.FunnelStep != null);
    assert.ok(withStep.length, "fixture should carry FunnelStep-broken-down points");
    const named = withStep.filter((s) => s.breakdownLabels?.FunnelStep);
    assert.ok(named.length, "displayValue must not be dropped by breakdownToMap");
    // identity stays on the raw value — a display name must never move the key
    for (const s of named) {
      assert.ok(
        s.seriesKey.includes(`FunnelStep=${s.breakdown.FunnelStep}`),
        `seriesKey must key on the raw value, got ${s.seriesKey}`,
      );
    }
  });

  test("step 4 of PlayerProgression reads Rebirth1, not 4", async () => {
    const { game } = await ingestFunnel();
    const labels = Object.values(game.metrics)
      .flatMap((m) => m.series)
      .map((s) => s.label);
    for (const name of ["OnboardingComplete", "FirstMorph", "Rebirth1", "Rebirth4"]) {
      assert.ok(
        labels.some((l) => l.includes(name)),
        `a series should be labelled ${name}; got e.g. ${labels.slice(0, 4).join(" | ")}`,
      );
    }
    // The gateway ships displayValue:"" for PlayerProgression step 2, so a bare
    // integer there is correct fallback, not the bug. What must never happen is
    // a step falling back while a name WAS supplied.
    const bare = labels.filter((l) => /^FunnelStep: \d+(?: ·|$)/.test(l));
    assert.equal(
      bare.length,
      1,
      `only the step Roblox left unnamed may stay numeric; got ${bare.join(" | ")}`,
    );
    assert.match(bare[0], /^FunnelStep: 2 · FunnelName=PlayerProgression/);
  });

  test("the raw value is still what identifies the series", async () => {
    const { game } = await ingestFunnel();
    const named = Object.values(game.metrics)
      .flatMap((m) => m.series)
      .filter((s) => s.breakdownLabels?.FunnelStep);
    assert.ok(named.length, "series should carry breakdownLabels");
    for (const s of named) {
      assert.match(s.breakdown.FunnelStep, /^\d+$/, "breakdown keeps the raw integer");
      assert.ok(s.key.includes(`FunnelStep=${s.breakdown.FunnelStep}`), "key uses the raw value");
    }
  });

  test("the CSV export carries the name, so a reader never sees a bare integer", async () => {
    const { gameDir } = await ingestFunnel();
    const csv = await fs.readFile(
      path.join(gameDir, "metrics", "FunnelUserChurnRate.csv"),
      "utf8",
    );
    assert.ok(csv.includes("Rebirth1"), "FunnelUserChurnRate.csv should name the step");
  });

  test("a series stored before names existed is re-labelled once they arrive", async () => {
    // Ingest twice: the first pass simulates already-merged data, the second
    // must refresh the label rather than leave the original in place forever.
    const dir = path.join(tmpRoot, `relabel${dirs.length}`);
    dirs.push(dir);
    await fs.mkdir(dir, { recursive: true });
    process.env.RBX_DATA_DIR = dir;
    const raw = await fs.readFile(path.join(FIXTURES, FUNNEL_FIXTURE), "utf8");

    // blank every displayValue on the first pass -> bare integers land on disk,
    // reproducing series.json as it existed before names were carried through
    const stripped: Capture[] = JSON.parse(raw.replace(/("displayValue":\s*)"[^"]*"/g, '$1""'));
    await exportToFiles(parseCaptures(stripped));
    const file = path.join(dir, "games", FUNNEL_GAME, "series.json");
    const before = JSON.parse(await fs.readFile(file, "utf8")) as GameExport;
    const bareBefore = Object.values(before.metrics)
      .flatMap((m) => m.series)
      .filter((s) => /^FunnelStep: \d+(?: ·|$)/.test(s.label));
    assert.ok(bareBefore.length, "first pass should produce bare integer labels");

    await exportToFiles(parseCaptures(JSON.parse(raw)));
    const after = JSON.parse(await fs.readFile(file, "utf8")) as GameExport;
    const series = Object.values(after.metrics).flatMap((m) => m.series);
    const bareAfter = series.filter((s) => /^FunnelStep: \d+(?: ·|$)/.test(s.label));
    assert.ok(
      bareAfter.length < bareBefore.length,
      `re-ingest must re-label existing series: ${bareBefore.length} bare before, ${bareAfter.length} after`,
    );
    assert.ok(
      series.some((s) => s.label.includes("Rebirth1")),
      "the name must reach an already-merged series, not only newly created ones",
    );
    // and the points survive the re-label — this must not fork the series
    const relabelled = series.find((s) => s.label.includes("Rebirth1"))!;
    assert.ok(relabelled.points.length, "re-labelled series keeps its points");
    assert.equal(
      series.filter((s) => s.breakdown.FunnelStep === "4" && s.label.includes("Rebirth")).length,
      1,
      "re-labelling must not create a second series for the same step",
    );
  });
});

// ---------------------------------------------------------------------------

describe("G10 — the Open Cloud path merges into the gateway's series, not beside it", () => {
  // The scheduled grab authenticates with a key instead of the browser session,
  // so its responses arrive in a different envelope: `response.values[]` with
  // `breakdowns[]`, granularity spelled "OneDay", and timestamps stamped
  // `+00:00` rather than `Z`. Every one of those is a chance to fork a metric
  // into two series that never merge — which would look exactly like a metric
  // that lost half its history, and would quietly defeat the freeze policy,
  // since a point can only be frozen against a point it collides with.

  const GATEWAY = (ts: string, value: number): Capture => ({
    url: "https://apis.roblox.com/analytics-query-gateway/v1/metrics/resource/RESOURCE_TYPE_UNIVERSE/id/" + GAME,
    method: "POST",
    ts: Date.parse("2026-08-19T10:00:00Z"),
    reqBody: JSON.stringify({
      resourceType: "RESOURCE_TYPE_UNIVERSE",
      resourceId: GAME,
      query: {
        metric: "DailyActiveUsers",
        granularity: "METRIC_GRANULARITY_ONE_DAY",
        startTime: "2026-08-01T00:00:00Z",
        endTime: "2026-08-18T00:00:00Z",
      },
    }),
    body: { operation: { path: "abc", queryResult: { values: [{ dataPoints: [{ time: ts, value }] }] } } },
  });

  const CLOUD = (ts: string, value: number): Capture => ({
    url: "https://apis.roblox.com/analytics-query-api/v1/universes/" + GAME + "/metrics",
    method: "POST",
    via: "opencloud",
    ts: Date.parse("2026-08-19T11:00:00Z"),
    reqBody: JSON.stringify({
      metric: "DailyActiveUsers",
      granularity: "OneDay",
      startTime: "2026-08-01T00:00:00Z",
      endTime: "2026-08-18T00:00:00Z",
    }),
    body: { done: true, response: { values: [{ dataPoints: [{ time: ts, value }] }] } },
  });

  test("the same day from both sources is ONE point, not two", () => {
    const r = parseCaptures([
      GATEWAY("2026-08-15T00:00:00Z", 180466),
      CLOUD("2026-08-15T00:00:00+00:00", 180466),
    ]);
    const rows = r.snapshots.filter((s) => s.metric === "DailyActiveUsers");
    assert.equal(rows.length, 1, "the +00:00 spelling must normalize onto the Z spelling");
    assert.equal(rows[0].ts, "2026-08-15T00:00:00Z");
    assert.equal(rows[0].granularity, "METRIC_GRANULARITY_ONE_DAY", "OneDay must map to the gateway enum");
  });

  test("a breakdown from Open Cloud carries the same series key and display name", () => {
    const cloud: Capture = {
      url: "https://apis.roblox.com/analytics-query-api/v1/universes/" + GAME + "/metrics",
      method: "POST",
      via: "opencloud",
      ts: Date.parse("2026-08-19T11:00:00Z"),
      reqBody: JSON.stringify({
        metric: "FunnelUserStepCompletionRate",
        granularity: "None",
        startTime: "2026-08-10T00:00:00Z",
        endTime: "2026-08-18T00:00:00Z",
        breakdown: ["FunnelStep"],
      }),
      body: {
        done: true,
        response: {
          values: [
            {
              breakdowns: [{ dimension: "FunnelStep", value: "7", displayValue: "Rebirth4" }],
              dataPoints: [{ time: "2026-08-10T00:00:00+00:00", value: 0.943 }],
            },
          ],
        },
      },
    };
    const row = parseCaptures([cloud]).snapshots[0];
    // G9 again, on the other source: a funnel of twenty anonymous integers is
    // a downgraded finding, and Open Cloud does ship displayValue.
    assert.equal(row.breakdown.FunnelStep, "7", "the raw value stays the series identity");
    assert.equal(row.breakdownLabels?.FunnelStep, "Rebirth4");
    assert.equal(row.seriesKey, "b[FunnelStep=7]f[]");
  });

  test("a settled gateway point is not overwritten by a later Open Cloud read", async () => {
    // The read-policy decision, made explicit: Open Cloud serves the CURRENT
    // value, the corpus keeps the FIRST settled one. Adopting the new number
    // silently would change figures that already went into delivered reports.
    const { game } = await ingestCaptures(
      GATEWAY("2026-08-15T00:00:00Z", 3170),
      CLOUD("2026-08-15T00:00:00+00:00", 3213)
    );
    const s = totalSeries(game.metrics.DailyActiveUsers)!;
    const p = s.points.find((x) => x.date === "2026-08-15")!;
    assert.equal(p.value, 3170, "first settled read wins regardless of which source served it");
    const revision = (game.quality ?? []).find((q) => q.kind === "revision");
    assert.ok(revision, "the divergence must be logged, not dropped");
    assert.match(String(revision!.detail), /3213/);
  });

  async function ingestCaptures(...captures: Capture[]) {
    const dir = path.join(tmpRoot, `oc${dirs.length}`);
    dirs.push(dir);
    await fs.mkdir(dir, { recursive: true });
    process.env.RBX_DATA_DIR = dir;
    for (const c of captures) await exportToFiles(parseCaptures([c]));
    const game = JSON.parse(
      await fs.readFile(path.join(dir, "games", GAME, "series.json"), "utf8")
    ) as GameExport;
    return { game, dir };
  }
});
