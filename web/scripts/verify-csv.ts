// Verification harness: diff Creator Dashboard CSV exports against the stored
// series.json. This is the gate every number-changing fix must pass — see
// CORRECTNESS_PLAN.md Phase 2 and data/verify/COVERAGE.md for the measured
// label map, breakdown aliases, and format notes this file implements.
//
//   npm run verify -- ../data/verify/9610561918/
//   npm run verify -- "../data/verify/9610561918/Sessions- Sessions, ....csv"
//   npm run verify -- ../data/verify/9610561918/ --strict
//
// Exit codes: 0 = no value mismatches and no capture gaps inside the held
// window; 1 = at least one FAIL. SKIP (granularity we do not hold, metrics or
// breakdowns we do not pull, disjoint windows) never fails unless --strict.
//
// Verdicts per CSV series:
//   match        cell equal within tolerance
//   MISMATCH     both sides hold the cell, values differ         -> FAIL
//   MISSING      CSV holds a cell inside our held window that we
//                lack (zero rows here are how D2 was caught)     -> FAIL
//   ours-only    we hold points the CSV window lacks             (informational)
//   out-of-span  CSV cell outside what we ever requested/held    (informational)

import { promises as fs } from "node:fs";
import path from "node:path";

// ---------------------------------------------------------------- stored shape
// Mirrors ExportSeries/ExportMetric in ../src/lib/export-files.ts. Kept
// structural (this script must run with zero imports from src/ so it can gate
// changes to src/ itself).

type StoredPoint = {
  date: string;
  ts: string;
  value: number | null;
  status: string | null;
  capturedAt?: string;
  partial?: boolean;
};
type StoredSeries = {
  key: string;
  label: string;
  granularity: string;
  breakdown: Record<string, string>;
  filters: { dimension: string; values: string[]; operation?: string }[];
  points: StoredPoint[];
};
type StoredMetric = {
  metric: string;
  latestAvailableTime: string | null;
  series: StoredSeries[];
};
type StoredGame = { universeId: string; metrics: Record<string, StoredMetric> };

// ---------------------------------------------------------------- label map
// Measured in data/verify/COVERAGE.md — entries marked there "by value" were
// resolved by cell-matching against stored data, not guessed.

export const LABEL_TO_METRIC: Record<string, string> = {
  "30D revenue per user": "Attribution30DRobuxPerUser",
  "Average playtime": "AveragePlayTimeMinutesPerDAU",
  "Average revenue per DAU (ARPDAU)": "AverageRevenuePerUser",
  "Average revenue per paying user (ARPPU)": "AverageRevenuePerPayingUser",
  "Average session time": "AverageSessionLengthMinutes",
  "Client crash rate": "ClientCrashRate15m",
  "Client frame rate": "ClientFpsAvg",
  "Daily active users": "DailyActiveUsers",
  "Day 1 retention": "ForwardD1Retention",
  "Day 7 retention": "ForwardD7Retention",
  "Day 30 retention": "ForwardD30Retention",
  "Errors and warnings": "ErrorCount",
  "Monthly active users": "MonthlyActiveUsers",
  "Not interested rate per million impressions":
    "RFYUniqueNotInterestedUsersPerMillionImpressions",
  "Payer conversion rate": "PayingUsersCVR",
  "Paying users": "PayingUsers",
  "Peak concurrent players": "PeakConcurrentPlayers",
  Playtime: "TotalPlayTimeHours",
  Revenue: "DailyRevenue",
  "Robux Spent (Realtime)": "ItemMonetizationRevenue", // by value (56 cells)
  "Server crashes": "ServerCrashCount",
  "Session time": "SessionDurationSecondsAvg",
  Sessions: "Visits", // by value (27 cells)
  "Stickiness (DAU/MAU)": "DauMauStickiness",
  "Unexpected out of memory exits": "OomUnexpectedExits",
  "Unique users with impressions": "UniqueUsersWithImpressions",
  "Unique users with plays": "UniqueUsersWithPlaySessions",
  "Player Feedback Votes Count": "PlayerFeedbackVotesCount",
};

// The "User ratings" export has an EMPTY metric-label cell; identify by
// filename prefix instead.
const FILENAME_TO_METRIC: [RegExp, string][] = [
  [/^User ratings- /, "PlayerFeedbackVotesCount"],
];

// CSV values are in the dashboard's display unit; ours are the API's. Scale =
// factor that converts a CSV value INTO the API unit.
export const LABEL_VALUE_SCALE: Record<string, number> = {
  "Session time": 60, // dashboard exports minutes; SessionDurationSecondsAvg is seconds
};

// Dashboard display names -> API dimension values (measured, COVERAGE.md).
export const BREAKDOWN_ALIAS: Record<string, string> = {
  "Platform crashes": "Runtime",
  "Out of memory": "OutOfMemory",
  Desktop: "Computer",
  "Developer Products": "DevProduct",
  Passes: "GamePass",
  "Third-party avatar item commissions": "CommissionAvatar",
  "Private Servers": "PrivateServer",
  Unknown: "RAQI_RESERVED_DIMENSION_VALUES_UNKNOWN",
};

// The four Universe-<id>- acquisition exports are the IsNewUser=New slice
// (proven cell-for-cell, COVERAGE.md F7). Perf-tab exports share the prefix
// but are NOT filtered, so match on the specific chart labels.
const NEW_USER_FILE = /^Universe-\d+- (Daily active users|Average session time|Unique users with plays|Unique users with impressions),/;

const canon = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// ---------------------------------------------------------------- CSV parsing

export type CsvRow = { series: string; ts: string; value: number };
export type ParsedCsv =
  | { variant: "A" | "B"; label: string; rows: CsvRow[]; granularity: string }
  | { variant: "C"; label: string; note: string };

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else quoted = false;
      } else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

function inferGranularity(tss: string[]): string {
  const uniq = [...new Set(tss)].sort();
  if (uniq.length < 2) return "NONE";
  let min = Infinity;
  for (let i = 1; i < uniq.length; i++) {
    const d = (new Date(uniq[i]).getTime() - new Date(uniq[i - 1]).getTime()) / 1000;
    if (d > 0 && d < min) min = d;
  }
  if (min === 1800) return "HALF_HOUR";
  if (min === 3600) return "ONE_HOUR";
  if (min === 86400) return "ONE_DAY";
  return `OTHER(${min}s)`;
}

export function parseCsv(text: string): ParsedCsv {
  const lines = text
    .replace(/^﻿/, "")
    .split(/\r?\n/)
    .filter((l) => l.trim() !== "");
  const rows = lines.map(splitCsvLine);
  // Variant C: session-survival curve ("Experience ID" preamble, a
  // Seconds-Since-Start axis instead of dates). Recognized and skipped —
  // there is no API metric to diff it against.
  if (rows[0]?.[0] === "Experience ID") {
    return {
      variant: "C",
      label: "",
      note: "session-survival curve (Seconds Since Start axis) — no comparable metric",
    };
  }
  // Variant B: pivoted single-date. Line 1 "Date,<iso>", line 2 "<dim>,Series,<label>".
  if (rows[0]?.[0] === "Date" && rows[1]?.[1] === "Series") {
    const date = rows[0][1];
    const label = rows[1][2] ?? "";
    return {
      variant: "B",
      label,
      granularity: "NONE",
      rows: rows.slice(2).map((r) => ({ series: r[0], ts: date, value: Number(r[2]) })),
    };
  }
  // Variant A: "<dim>,Date,<label>".
  const label = rows[0]?.[2] ?? "";
  const dataRows = rows
    .slice(1)
    .map((r) => ({ series: r[0], ts: r[1], value: Number(r[2]) }))
    .filter((r) => r.ts != null && r.ts !== "");
  return {
    variant: "A",
    label,
    granularity: inferGranularity(dataRows.map((r) => r.ts)),
    rows: dataRows,
  };
}

// ---------------------------------------------------------------- comparison

export type SeriesReport = {
  csvSeries: string;
  verdict: "match" | "MISMATCH" | "MISSING" | "skip";
  reason?: string;
  ourLabel?: string;
  cellsCompared: number;
  mismatches: { at: string; csv: number; ours: number }[];
  missingInWindow: { at: string; csv: number }[];
  // Cells we hold only as a flagged in-progress capture — a partial value
  // legitimately differs from the CSV's final one, so it is not comparable.
  partialSkipped: number;
  oursOnly: number;
  outOfSpan: number;
};

export type FileReport = {
  file: string;
  metric: string | null;
  verdict: "PASS" | "FAIL" | "SKIP";
  reason?: string;
  series: SeriesReport[];
};

const OVERLAY = /^Benchmark \(|\(previous\)$/;

function relEq(a: number, b: number): boolean {
  return Math.abs(a - b) <= Math.max(1e-9, 1e-6 * Math.max(Math.abs(a), Math.abs(b)));
}

// A metric's held window: how far our data extends. A CSV cell outside every
// held point's range tells us nothing (we never asked for / never received
// that time); one INSIDE it that we lack is a capture gap. Epoch-based so a
// sub-daily boundary ("held through 16:00") is not rounded up to a whole day.
function heldSpan(series: StoredSeries): [number, number] | null {
  if (!series.points.length) return null;
  const ts = series.points.map((p) => new Date(p.ts).getTime()).sort((a, b) => a - b);
  return [ts[0], ts[ts.length - 1]];
}

function findSeries(
  metric: StoredMetric,
  gran: string,
  csvSeriesName: string,
  wantNewUserSlice: boolean
): { series?: StoredSeries; granMatch: boolean; reason?: string } {
  const wantTotal = csvSeriesName === "Total";
  const want = BREAKDOWN_ALIAS[csvSeriesName] ?? csvSeriesName;
  const candidates = metric.series.filter((s) => {
    const bdVals = Object.values(s.breakdown ?? {});
    const newUserFiltered = (s.filters ?? []).some(
      (f) => f.dimension === "IsNewUser" && f.values.join() === "New"
    );
    if (wantNewUserSlice !== newUserFiltered) return false;
    if (wantTotal) return bdVals.length === 0;
    return bdVals.length === 1 && canon(bdVals[0]) === canon(want);
  });
  if (!candidates.length) {
    return {
      granMatch: false,
      reason: wantTotal
        ? wantNewUserSlice
          ? "IsNewUser=New slice not pulled"
          : "no unbroken-down series held"
        : `breakdown "${csvSeriesName}" not pulled`,
    };
  }
  const exact = candidates.find((s) => s.granularity === `METRIC_GRANULARITY_${gran}`);
  if (exact) return { series: exact, granMatch: true };
  const best = [...candidates].sort((a, b) => b.points.length - a.points.length)[0];
  return { series: best, granMatch: false, reason: `held only at ${best.granularity.replace("METRIC_GRANULARITY_", "")}` };
}

function compareSeries(
  csvRows: CsvRow[],
  stored: StoredSeries,
  gran: string,
  scale: number,
  completeThrough: string | null
): SeriesReport {
  const daily = gran === "ONE_DAY" || gran === "NONE";
  const key = (ts: string) => (daily ? ts.slice(0, 10) : new Date(ts).toISOString());
  const ours = new Map<string, { value: number; partial: boolean }>();
  for (const p of stored.points)
    if (p.value != null) ours.set(key(p.ts), { value: p.value, partial: !!p.partial });
  const span = heldSpan(stored);

  const rep: SeriesReport = {
    csvSeries: "",
    verdict: "match",
    ourLabel: stored.label,
    cellsCompared: 0,
    mismatches: [],
    missingInWindow: [],
    partialSkipped: 0,
    oursOnly: 0,
    outOfSpan: 0,
  };
  const matched = new Set<string>();
  for (const r of csvRows) {
    const k = key(r.ts);
    const date = r.ts.slice(0, 10);
    const epoch = new Date(r.ts).getTime();
    const csvVal = r.value * scale;
    const held = ours.get(k);
    if (!held) {
      const inSpan = span && epoch >= span[0] && epoch <= span[1];
      const beforeComplete = completeThrough == null || date <= completeThrough;
      if (inSpan && beforeComplete) rep.missingInWindow.push({ at: k, csv: csvVal });
      else rep.outOfSpan++;
      continue;
    }
    matched.add(k);
    if (held.partial) {
      rep.partialSkipped++;
      continue;
    }
    rep.cellsCompared++;
    if (!relEq(held.value, csvVal)) rep.mismatches.push({ at: k, csv: csvVal, ours: held.value });
  }
  rep.oursOnly = [...ours.keys()].filter((k) => !matched.has(k)).length;
  rep.verdict = rep.mismatches.length
    ? "MISMATCH"
    : rep.missingInWindow.length
    ? "MISSING"
    : "match";
  return rep;
}

// ---------------------------------------------------------------- per-file

export function verifyFile(
  fileName: string,
  text: string,
  game: StoredGame
): FileReport {
  const parsed = parseCsv(text);
  if (parsed.variant === "C") {
    return { file: fileName, metric: null, verdict: "SKIP", reason: parsed.note, series: [] };
  }

  let label = parsed.label;
  let metric = LABEL_TO_METRIC[label];
  if (!metric) {
    for (const [re, m] of FILENAME_TO_METRIC) if (re.test(fileName)) metric = m;
  }
  if (!metric) {
    return {
      file: fileName,
      metric: null,
      verdict: "SKIP",
      reason: `no metric mapping for label "${label}" — extend LABEL_TO_METRIC deliberately, do not guess`,
      series: [],
    };
  }
  const stored = game.metrics[metric];
  if (!stored) {
    return {
      file: fileName,
      metric,
      verdict: "SKIP",
      reason: "metric not pulled at any granularity",
      series: [],
    };
  }

  const scale = LABEL_VALUE_SCALE[label] ?? 1;
  const wantNewUserSlice = NEW_USER_FILE.test(fileName);
  const completeThrough = stored.latestAvailableTime
    ? stored.latestAvailableTime.slice(0, 10)
    : null;

  const bySeries = new Map<string, CsvRow[]>();
  for (const r of parsed.rows) {
    const name = r.series.replace(/ \(current\)$/, "");
    if (OVERLAY.test(r.series)) continue; // chart overlays, not data series
    (bySeries.get(name) ?? bySeries.set(name, []).get(name)!).push(r);
  }

  const series: SeriesReport[] = [];
  let anyCompared = false;
  let anyGranGap = false;

  for (const [name, rows] of bySeries) {
    const found = findSeries(stored, parsed.granularity, name, wantNewUserSlice);
    if (!found.series) {
      series.push({
        csvSeries: name,
        verdict: "skip",
        reason: found.reason,
        cellsCompared: 0,
        mismatches: [],
        missingInWindow: [],
        partialSkipped: 0,
        oursOnly: 0,
        outOfSpan: 0,
      });
      continue;
    }
    if (!found.granMatch) {
      anyGranGap = true;
      series.push({
        csvSeries: name,
        verdict: "skip",
        reason: `granularity ${parsed.granularity} not held (${found.reason})`,
        ourLabel: found.series.label,
        cellsCompared: 0,
        mismatches: [],
        missingInWindow: [],
        partialSkipped: 0,
        oursOnly: 0,
        outOfSpan: 0,
      });
      continue;
    }
    const rep = compareSeries(rows, found.series, parsed.granularity, scale, completeThrough);
    rep.csvSeries = name;
    if (rep.cellsCompared > 0 || rep.missingInWindow.length > 0) anyCompared = true;
    series.push(rep);
  }

  // PlayerFeedbackVotesCount: the export splits by vote type (a breakdown we
  // do not pull); Total = Upvotes + Downvotes, verified in COVERAGE.md.
  if (metric === "PlayerFeedbackVotesCount" && !series.some((s) => s.verdict !== "skip")) {
    const sums = new Map<string, number>();
    for (const rows of bySeries.values())
      for (const r of rows) sums.set(r.ts.slice(0, 10), (sums.get(r.ts.slice(0, 10)) ?? 0) + r.value);
    const total = stored.series.find(
      (s) => Object.keys(s.breakdown ?? {}).length === 0 && s.granularity === "METRIC_GRANULARITY_ONE_DAY"
    );
    if (total) {
      const rows: CsvRow[] = [...sums].map(([d, v]) => ({ series: "Σ vote types", ts: `${d}T00:00:00.000Z`, value: v }));
      const rep = compareSeries(rows, total, "ONE_DAY", 1, completeThrough);
      rep.csvSeries = "Upvotes+Downvotes vs Total";
      if (rep.cellsCompared > 0) anyCompared = true;
      series.push(rep);
    }
  }

  const failed = series.some((s) => s.verdict === "MISMATCH" || s.verdict === "MISSING");
  const verdict: FileReport["verdict"] = failed ? "FAIL" : anyCompared ? "PASS" : "SKIP";
  const reason = failed
    ? undefined
    : anyCompared
    ? undefined
    : anyGranGap
    ? "dashboard granularity not held (re-grab needed — D5)"
    : "no comparable series (breakdown/slice not pulled or disjoint window)";
  return { file: fileName, metric, verdict, reason, series };
}

// ---------------------------------------------------------------- CLI

function dataDir(): string {
  if (process.env.RBX_DATA_DIR) return path.resolve(process.env.RBX_DATA_DIR);
  return path.resolve(import.meta.dirname, "../../data");
}

async function loadGame(universeId: string): Promise<StoredGame> {
  const file = path.join(dataDir(), "games", universeId, "series.json");
  return JSON.parse(await fs.readFile(file, "utf8")) as StoredGame;
}

function universeFrom(target: string, explicit?: string): string | null {
  if (explicit) return explicit;
  const m = target.replace(/\\/g, "/").match(/verify\/(\d+)/);
  return m ? m[1] : null;
}

export async function main(argv: string[]): Promise<number> {
  const args = argv.filter((a) => a !== "--strict");
  const strict = argv.includes("--strict");
  const gameFlag = (() => {
    const i = args.indexOf("--game");
    if (i >= 0 && args[i + 1]) {
      const v = args[i + 1];
      args.splice(i, 2);
      return v;
    }
    return undefined;
  })();
  const target = args[0];
  if (!target) {
    console.error("usage: npm run verify -- <csv-file-or-dir> [--game <universeId>] [--strict]");
    return 2;
  }
  const resolved = path.resolve(target);
  const stat = await fs.stat(resolved);
  const files = stat.isDirectory()
    ? (await fs.readdir(resolved)).filter((f) => f.endsWith(".csv")).map((f) => path.join(resolved, f))
    : [resolved];

  const universeId = universeFrom(resolved, gameFlag);
  if (!universeId) {
    console.error("cannot determine universeId — pass --game <id> or point at data/verify/<id>/");
    return 2;
  }
  const game = await loadGame(universeId);

  let pass = 0,
    fail = 0,
    skip = 0;
  const reports: FileReport[] = [];
  for (const f of files.sort()) {
    const rep = verifyFile(path.basename(f), await fs.readFile(f, "utf8"), game);
    reports.push(rep);
    if (rep.verdict === "PASS") pass++;
    else if (rep.verdict === "FAIL") fail++;
    else skip++;
  }

  for (const rep of reports) {
    const cells = rep.series.reduce((s, x) => s + x.cellsCompared, 0);
    console.log(`${rep.verdict.padEnd(5)} ${rep.file}${rep.metric ? `  [${rep.metric}]` : ""}${cells ? ` ${cells} cells` : ""}`);
    if (rep.reason) console.log(`      ${rep.reason}`);
    for (const s of rep.series) {
      if (s.verdict === "MISMATCH")
        for (const m of s.mismatches.slice(0, 5))
          console.log(`      ✗ [${s.csvSeries}] ${m.at}: csv ${m.csv} vs ours ${m.ours}`);
      if (s.verdict === "MISSING")
        for (const m of s.missingInWindow.slice(0, 5))
          console.log(`      ✗ [${s.csvSeries}] ${m.at}: csv has ${m.csv}, we hold nothing (in held window)`);
      if (s.verdict === "skip" && rep.verdict !== "SKIP" && s.reason)
        console.log(`      · [${s.csvSeries}] skipped: ${s.reason}`);
    }
  }
  console.log(`\n${pass} pass · ${fail} fail · ${skip} skip (universe ${universeId}, ${files.length} files)`);
  if (skip && !strict) console.log("skips are gaps, not proofs — see data/verify/COVERAGE.md; --strict makes them fail");
  return fail > 0 || (strict && skip > 0) ? 1 : 0;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename);
if (isMain) {
  main(process.argv.slice(2)).then((code) => {
    process.exitCode = code;
  });
}
