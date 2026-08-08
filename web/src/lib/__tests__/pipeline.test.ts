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
