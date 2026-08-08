// Tests for the verification harness itself. If the harness silently stops
// comparing cells, every other guarantee in this repo becomes unfalsifiable —
// so its parser and its FAIL conditions get their own tests.
//
// The corpus gate at the bottom is the plan's verification item 2. It needs a
// built export (data/games/<id>/series.json), which is gitignored, so it skips
// with a clear reason on a fresh clone rather than failing for the wrong one.

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";

import {
  parseCsv,
  verifyFile,
  main,
  LABEL_TO_METRIC,
  LABEL_VALUE_SCALE,
  BREAKDOWN_ALIAS,
} from "../../../scripts/verify-csv";

const REPO = path.resolve(import.meta.dirname, "../../../..");
const CORPUS = path.join(REPO, "data/verify/9610561918");

describe("CSV parsing — all three dashboard export formats", () => {
  test("variant A: standard time series, first column name varies", () => {
    const p = parseCsv(
      "Crash Type,Date,Server crashes\nTotal,2026-07-31T00:00:00.000Z,30393\nOut of memory,2026-07-31T00:00:00.000Z,4\n",
    );
    assert.ok(p.variant === "A");
    assert.equal(p.label, "Server crashes");
    // one distinct midnight instant: no interval to measure, but midnight is
    // how daily points are stamped, so it stays comparable by date
    assert.equal(p.granularity, "ONE_DAY");
    assert.deepEqual(p.rows[0], { series: "Total", ts: "2026-07-31T00:00:00.000Z", value: 30393 });
  });

  test("a lone sub-daily instant refuses to guess its interval", () => {
    const p = parseCsv("Platform,Date,Client frame rate\nTotal,2026-08-07T08:30:00.000Z,30.5\n");
    assert.ok(p.variant === "A");
    assert.equal(p.granularity, "UNKNOWN");
  });

  test("variant A: half-hour granularity is inferred from the interval", () => {
    const rows = ["Platform,Date,Client frame rate"];
    for (let i = 0; i < 4; i++)
      rows.push(`Total,2026-08-07T0${8 + Math.floor(i / 2)}:${i % 2 ? "30" : "00"}:00.000Z,30.5`);
    const p = parseCsv(rows.join("\n"));
    assert.ok(p.variant === "A");
    assert.equal(p.granularity, "HALF_HOUR");
  });

  test("variant B: pivoted single-date", () => {
    const p = parseCsv(
      "Date,2026-06-12T00:00:00.000Z\nSource,Series,30D revenue per user\nSponsored Ads,30D revenue per user,15.04\n",
    );
    assert.ok(p.variant === "B");
    assert.equal(p.label, "30D revenue per user");
    assert.deepEqual(p.rows[0], {
      series: "Sponsored Ads",
      ts: "2026-06-12T00:00:00.000Z",
      value: 15.04,
    });
  });

  test("variant C: the session-survival curve is recognized and skipped, never misparsed", () => {
    const p = parseCsv(
      "Experience ID,9610561918\n\nBreakdown,Seconds Since Start,New user first session retention\n% still playing (current),0,1\n",
    );
    assert.ok(p.variant === "C");
    assert.match(p.note, /Seconds Since Start/);
  });

  test("quoted fields containing commas survive", () => {
    const p = parseCsv('Breakdown,Date,Revenue\n"Passes, third-party",2026-07-10T00:00:00.000Z,42\n');
    assert.ok(p.variant !== "C");
    assert.equal(p.rows[0].series, "Passes, third-party");
    assert.equal(p.rows[0].value, 42);
  });

  test("every committed corpus file parses into a known variant", async () => {
    const files = (await fs.readdir(CORPUS)).filter((f) => f.endsWith(".csv"));
    assert.ok(files.length >= 33, `expected the 33-file corpus, found ${files.length}`);
    for (const f of files) {
      const p = parseCsv(await fs.readFile(path.join(CORPUS, f), "utf8"));
      assert.ok(["A", "B", "C"].includes(p.variant), `${f}: unknown format`);
      if (p.variant !== "C")
        assert.ok(p.rows.length > 0, `${f}: parsed to zero rows — a silent parse failure`);
    }
  });
});

describe("the harness fails on the things it exists to catch", () => {
  const stored = {
    universeId: "1",
    metrics: {
      ServerCrashCount: {
        metric: "ServerCrashCount",
        latestAvailableTime: null,
        series: [
          {
            key: "b[]f[]",
            label: "Total",
            granularity: "METRIC_GRANULARITY_ONE_DAY",
            breakdown: {},
            filters: [],
            points: [
              { date: "2026-08-02", ts: "2026-08-02T00:00:00Z", value: 614, status: null },
              { date: "2026-08-03", ts: "2026-08-03T00:00:00Z", value: 5, status: null },
            ],
          },
        ],
      },
    },
  };
  const csv = (rows: string) => `Crash Type,Date,Server crashes\n${rows}`;

  test("matching values pass", () => {
    const rep = verifyFile(
      "x.csv",
      csv("Total,2026-08-02T00:00:00.000Z,614\nTotal,2026-08-03T00:00:00.000Z,5\n"),
      stored as never,
    );
    assert.equal(rep.verdict, "PASS");
  });

  test("a differing value FAILs and names both sides", () => {
    const rep = verifyFile(
      "x.csv",
      csv("Total,2026-08-02T00:00:00.000Z,999\nTotal,2026-08-03T00:00:00.000Z,5\n"),
      stored as never,
    );
    assert.equal(rep.verdict, "FAIL");
    const mism = rep.series[0].mismatches[0];
    assert.equal(mism.csv, 999);
    assert.equal(mism.ours, 614);
  });

  test("a zero row the API omitted FAILs — this is how D2 is caught", () => {
    const gapped = {
      ...stored,
      metrics: {
        ServerCrashCount: {
          ...stored.metrics.ServerCrashCount,
          series: [
            {
              ...stored.metrics.ServerCrashCount.series[0],
              points: [
                { date: "2026-08-02", ts: "2026-08-02T00:00:00Z", value: 614, status: null },
                { date: "2026-08-04", ts: "2026-08-04T00:00:00Z", value: 2, status: null },
              ],
            },
          ],
        },
      },
    };
    const rep = verifyFile(
      "x.csv",
      csv(
        "Total,2026-08-02T00:00:00.000Z,614\nTotal,2026-08-03T00:00:00.000Z,0\nTotal,2026-08-04T00:00:00.000Z,2\n",
      ),
      gapped as never,
    );
    assert.equal(rep.verdict, "FAIL", "a zero day inside the held window must not be silently absent");
    assert.deepEqual(
      rep.series[0].missingInWindow.map((m) => m.at),
      ["2026-08-03"],
    );
  });

  test("a CSV day beyond what we hold is reported out-of-span, not as a gap", () => {
    const rep = verifyFile(
      "x.csv",
      csv("Total,2026-08-02T00:00:00.000Z,614\nTotal,2026-08-03T00:00:00.000Z,5\nTotal,2026-08-09T00:00:00.000Z,0\n"),
      stored as never,
    );
    assert.equal(rep.verdict, "PASS", "we never requested 08-09 — its absence says nothing");
    assert.equal(rep.series[0].outOfSpan, 1);
  });

  test("an unmapped label SKIPs loudly instead of silently passing", () => {
    const rep = verifyFile(
      "x.csv",
      "Breakdown,Date,Some New Chart\nTotal,2026-08-02T00:00:00.000Z,1\n",
      stored as never,
    );
    assert.equal(rep.verdict, "SKIP");
    assert.match(rep.reason!, /do not guess/);
  });

  test("a granularity we do not hold SKIPs, and says a re-grab is needed", () => {
    const rows = ["Crash Type,Date,Server crashes"];
    for (let i = 0; i < 4; i++)
      rows.push(`Total,2026-08-02T0${8 + Math.floor(i / 2)}:${i % 2 ? "30" : "00"}:00.000Z,1`);
    const rep = verifyFile("x.csv", rows.join("\n"), stored as never);
    assert.equal(rep.verdict, "SKIP");
    assert.match(rep.reason!, /granularity not held/);
  });
});

describe("the measured mappings stay honest", () => {
  test("label map covers every metric COVERAGE.md claims to verify", () => {
    for (const label of [
      "Sessions", // -> Visits, resolved by value
      "Robux Spent (Realtime)", // -> ItemMonetizationRevenue, by value
      "Stickiness (DAU/MAU)",
      "Session time",
      "Server crashes",
    ])
      assert.ok(LABEL_TO_METRIC[label], `missing label mapping: ${label}`);
    assert.equal(LABEL_TO_METRIC["Sessions"], "Visits");
  });

  test("the minutes-vs-seconds trap stays scaled", () => {
    assert.equal(LABEL_VALUE_SCALE["Session time"], 60);
  });

  test("display names map to API dimension values", () => {
    assert.equal(BREAKDOWN_ALIAS["Platform crashes"], "Runtime");
    assert.equal(BREAKDOWN_ALIAS["Passes"], "GamePass");
  });
});

describe("corpus gate", () => {
  // Files that are known to disagree with the dashboard for a reason we have
  // written down and not yet resolved. Keeping the list explicit means a NEW
  // disagreement still breaks the build, while an open question stays visible
  // instead of being hidden behind a loosened tolerance.
  const KNOWN_OPEN = new Set([
    // One hour (2026-08-08T00:00) where the dashboard exported R$1,589 and the
    // gateway served us R$976. This metric is the "Realtime" revenue chart and
    // it restates: re-reads of settled hours have been seen moving 353 ->
    // 21,835. Which read is authoritative is unresolved — see the open
    // question in data-quality.md.
    "Hourly Robux spent- Robux Spent (Realtime), 2026-08-05T08-00-00.000Z to 2026-08-08T07-00-00.000Z.csv",
  ]);

  test("no corpus file disagrees with the dashboard except the known-open ones", async (t) => {
    const seriesFile = path.join(REPO, "data/games/9610561918/series.json");
    try {
      await fs.access(seriesFile);
    } catch {
      t.skip("no built export at data/games/9610561918/ — run a grab or npm run ingest:file first");
      return;
    }
    const files = (await fs.readdir(CORPUS)).filter((f) => f.endsWith(".csv"));
    const game = JSON.parse(await fs.readFile(seriesFile, "utf8"));
    const failed: string[] = [];
    for (const f of files) {
      const rep = verifyFile(f, await fs.readFile(path.join(CORPUS, f), "utf8"), game);
      if (rep.verdict === "FAIL") failed.push(f);
    }
    const unexpected = failed.filter((f) => !KNOWN_OPEN.has(f));
    assert.deepEqual(unexpected, [], "new disagreement with the dashboard — investigate before shipping");

    const fixed = [...KNOWN_OPEN].filter((f) => !failed.includes(f));
    assert.deepEqual(fixed, [], "a known-open file now passes — delete it from KNOWN_OPEN");
  });
});
