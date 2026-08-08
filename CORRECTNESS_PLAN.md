# Correctness plan — making the grabber trustworthy

Status: **not started.** Written 2026-08-08 after an audit of the two universes
in `data/games/`. Read this together with `CLAUDE.md`.

## Why this exists

The tool produces numbers that look authoritative and are sometimes wrong. That
is worse than producing nothing, because a producer acts on them: kills a feature
that was fine, ships a fix for a problem that didn't exist, or never learns about
an outage.

Not hypothetical — both failures below are in the data as shipped:

- **A 30,393-crash incident on universe 9610561918 was invisible.**
  `ServerCrashCount` has no `Total` series, so `summary.md` printed `series[0]`
  — the `OutOfMemory` slice, peak 15 — and reported "Server Crashes: 5". The real
  series (`Place=…`, peak 30,393 on 2026-07-31) was captured and stored, but
  never surfaced. The incident detector read the same wrong series and stayed
  silent. The assistant then told the user the game had no crash incident.
- **Universe 9963622286's 1.06M-crash outage is absent entirely.** The
  Place-filter bug (see CLAUDE.md) meant 36 requests 400'd, and `ErrorCount` —
  the one performance metric that did survive — sat at 1.0× its median right
  through the outage. Nothing in the pipeline could have caught it.

Both share one shape: **the tool inferred something, the inference was wrong, and
the wrong result was indistinguishable from a real finding.**

The goal is not "no bugs". It is that every number the tool prints is either
traceable to a verified request or explicitly labelled unverified.

## Scope boundary — read before doing anything

**In scope: the grabber.** What we pull from Roblox, whether it is accurate, and
the files it writes to `data/`.

**Out of scope: the architecture.** The web app, the Node/localhost setup and
Supabase all stay exactly as they are. Do not delete, port or restructure them —
that was considered on 2026-08-08 and explicitly dropped. The setup cost is
acceptable and the web app may yet be used.

**Anti-drift rule.** This project has one job: pull Roblox analytics correctly
and read them well. If a task does not make the pulled data more complete or
more provably accurate, it is not part of this plan. Do not add features, do not
redesign the storage layer, do not start the AI-diagnosis phase. When something
interesting but off-topic turns up, write it down and keep going.

**Orientation note:** `web/src/lib/` is the grabber's brain, not web-app code.
`default-plan.ts` defines what we pull, `parse-captures.ts` and
`export-files.ts` produce every file in `data/`, `metric-info.ts` holds units and
rate/volume classification. It is standalone — nothing in it imports from
`src/app`.

## Defects (each verified against captured data — do not re-litigate, fix)

| # | Defect | Evidence |
|---|---|---|
| D1 | **Headline shows an arbitrary breakdown slice** when no `Total` series exists. `headline()` and `detectIncidents()` in `web/src/lib/export-files.ts` both do `find(s=>s.label==="Total") ?? series[0]`. | 16 metrics on 9610561918, 13 on 9963622286. Hid the 30,393-crash incident. Prints funnel step 20 as "funnel completion". Prints `PeakConcurrentPlayers` = **0.5** when the real value is ~728. |
| D2 | **The API omits zero rows.** Absent day ≠ 0, but for counts it means 0. Baselines/medians are computed over non-zero days only. | `ServerCrashCount` returned 10 days of a 27-day window. Understates incident ratios; silently makes "Δ vs ~7 points earlier" span non-adjacent dates. |
| D3 | **`DATA_STATUS_INVALID` misinterpreted.** It is 99.5% of *raw API* points — almost certainly the protobuf zero-value ("unset"), not "estimated". | We print "latest point is an estimate" on 56/56 rows (zero information) and ignore `DATA_STATUS_NOT_STATISTICALLY_SIGNIFICANT`, which fires on exactly one series — crash rate on **TV**, a genuinely unreliable sample. Backwards. |
| D4 | **Partial trailing day quoted as "Latest"** for metrics with no `latestAvailableTime`. | 19 metrics unguarded; 11 land on a ~7-hour day. `ClientCrashCount` = 61 vs ~400 baseline printed as "▼85.6%" — pure artifact. |
| D5 | **Sub-daily granularity never requested.** Dashboard CSV exports prove `ErrorCount`, `ClientFpsAvg`, `ClientCrashRate15m`, `PeakConcurrentPlayers`, `OomUnexpectedExits` and `SessionDurationSecondsAvg` are all served at **30-minute** granularity (`METRIC_GRANULARITY_HALF_HOUR`). The plan asks only for `ONE_DAY`. | `data/verify/9610561918/*08-07T08-00*.csv` — rows at 08:00, 08:30, 09:00… This is the "spikes at certain hours" resolution, and we have never pulled it. |
| D6 | **Invented query shapes produce findings.** The Place-filter class is fixed, but nothing prevents recurrence. | 37 perf requests 400'd and read as "this universe has no performance data". `ErrorMessage` was a guessed dimension name; the real one is `MessageHash`. |
| D7 | **`annotationType` hardcoded to 16**, which returns `{"annotations":[]}`. The "Roblox updates" filter visible in the dashboard's error/crash tab is a different type we never request. | Both captures. This is the authoritative "was it us or Roblox" signal and we do not have it. |
| D8 | **Async operations never polled.** The dimensions endpoint returns `{"done":false}` plus an operation `path`; we record the capture and move on. | `MessageHash`→text unresolvable, so errors are hashes not messages. Pending operations may be miscounted as "returned data" in the grab report. |
| D9 | **No unit validation.** Three bugs found by eye alone. | `ClientMemoryUsageAvg` is bytes rendered "1.3B MB"; `ServerFrameRateP10` is fps rendered "5988.2%". Nothing systematic would have caught either. |
| D10 | **Volume deltas printed without DAU context**, contrary to CLAUDE.md's own rate-vs-volume rule. | Every volume row in `summary.md`. |
| D11 | `genre` is `null` for both universes, degrading benchmark verdicts. | `series.json`, both games. |

## Ground truth: `data/verify/`

34 Creator Dashboard CSV exports for universe **9610561918** are committed under
`data/verify/9610561918/`. **Formats and units are game-independent** — only
values change per game — so this corpus validates the parser and unit handling
for every universe. Per-value verification is only possible for a game whose
CSVs you hold.

Two format variants, both must parse:

**A. Standard time series** — the common case. First column is the breakdown
dimension and its name *varies* (`Breakdown`, `Platform`, `Revenue Source`,
`Crash Type`, `Type`, `Source`):

```
Platform,Date,Client frame rate
Total,2026-08-07T08:00:00.000Z,30.67953179747429
Total,2026-08-07T08:30:00.000Z,30.094767538159672
```

**B. Pivoted single-date** — used by `NONE`-granularity charts:

```
Date,2026-06-12T00:00:00.000Z
Source,Series,30D revenue per user
Sponsored Ads,30D revenue per user,15.041058540344238
```

Note the filename carries the metric label and date range, and sometimes the
universe (`Universe-9610561918- …`). The **label→metric-name** map (e.g. "Day 1
retention" → `ForwardD1Retention`, "Errors and warnings" → `ErrorCount`, "Client
frame rate" → `ClientFpsAvg`) must be built explicitly; do not guess it.

`Report_*.csv` in Downloads are player-feedback exports, a different shape, not
part of this corpus.

## Phases

Orient, cut scope, then build verification **before** any fix — so every later
change is provable rather than asserted.

### Phase 1 — Orient (read-only, do this first)

Do not write code in this phase. Build an accurate picture of what exists, or
you will fix the wrong thing.

1. **Read the whole project once.** `README.md`, `CAHIER_DES_CHARGES.md`,
   `CLAUDE.md`, `STATUS_AND_ROADMAP.md`, `HANDOFF.md`, this file. Then
   `interceptor.js` → `collector.js` → `web/src/lib/*` → `data/` in that order,
   which is the actual direction data flows: browser → extension → pipeline →
   files.
2. **Inventory what the grabber pulls today.** From `default-plan.ts` plus a
   real `grab-report.json`, produce a table: metric · granularity · breakdown ·
   filter · returned data / empty / failed. `data/games/9610561918/grab-report.md`
   is a worked example.
3. **Cross-check that inventory against `data/verify/`.** For each of the 34
   CSVs, answer three questions and record the answer:
   - Do we pull this metric at all?
   - At the same granularity the dashboard uses? (Several are half-hour — D5.)
   - Do our stored values match, date by date?
   Produce `data/verify/COVERAGE.md`: **pulled / not pulled**, **verified /
   unverified**, **matches / mismatches**. This table is the real defect
   inventory and it supersedes any assumption in this document.
4. **Only then** start Phase 2. If Phase 1 contradicts a defect listed above,
   trust Phase 1 — it is measured, the table above was an audit.

### Phase 2 — Verification harness

New `web/scripts/verify-csv.ts`, wired as `npm run verify -- <csv|dir>`.

- Parse both format variants above; build the label→metric map explicitly.
- Diff every (date, series) cell against stored `series.json`. Report value
  mismatches, points in the CSV but missing from ours (**this is how D2 gets
  caught**), and points we hold that the CSV lacks.
- Exit non-zero on mismatch so it can gate the other phases.
- Run it against the whole corpus before changing anything, and record the
  baseline failures — that list is the real defect inventory.

### Phase 3 — Series identity and point semantics (D1, D2, D4)

Core rule: **a metric's headline series is the one with an empty `breakdown`.**
Filters (`Place=…`) do not disqualify it; breakdown dimensions do.

- `export-files.ts`: replace the `?? series[0]` fallback in `headline()` and
  `detectIncidents()` with a shared `totalSeries()` helper. If no unbroken-down
  series exists, do **not** invent a headline — print `—` with the note
  `breakdown only (N series)`. Never present a slice as the whole.
- Sparse-zero fill for `kind: "volume"` count metrics across the requested window
  (from `grab-report.json`'s `startTime`/`endTime`). **Never gap-fill rates** — a
  missing retention day is unknown, not 0%.
- Trailing-partial guard: `completeThrough` per metric =
  `min(latestAvailableTime, last fully-elapsed UTC day)`. Exclude later points
  from headline, Δ and incidents; keep them in `series.json`/CSVs, flagged.

### Phase 4 — Status semantics and units (D3, D9)

- Invert status handling: treat `DATA_STATUS_INVALID` as ordinary (drop the
  blanket "estimate" note); surface `DATA_STATUS_NOT_STATISTICALLY_SIGNIFICANT`
  loudly and exclude those series from incident detection.
- Per-unit plausibility ranges in `metric-info.ts` (`fps` 0–240, `percent` 0–1.5,
  `bytes` ≥ 1e6, `mb` < 1e5). Validate on ingest; write violations to
  `data/games/<id>/data-quality.md` rather than failing the ingest.
- **Correct CLAUDE.md's "Data semantics gotchas" section** — its current claim
  about `DATA_STATUS_INVALID` is wrong and would reproduce the bug.

### Phase 5 — Capture completeness (D5, D6, D7, D8, D11)

- **Half-hour granularity**: add `METRIC_GRANULARITY_HALF_HOUR` templates for the
  six metrics proven above, with the mandatory `Place` filter. Window must be
  short (the dashboard uses ~1 day); chunk if a longer history is wanted. Extend
  the existing hourly→daily rollup in `export-files.ts` to cover half-hour.
- **Annotation types**: enumerate `annotationType` instead of hardcoding 16;
  keep the types that return rows and record which carried Roblox-update entries.
  Export to `annotations.md`.
- **Async polling** in `collector.js`: when a response is `{"done":false}`,
  re-request the operation `path` until done (bounded retries + timeout).
  Unblocks `MessageHash`→text. Anything still pending is reported `pending`,
  never as returned data.
- **Query-shape provenance** in `default-plan.ts`: tag every seed template
  `observed` (matched against a real capture in `data/raw/`) or `inferred`. Add
  `web/scripts/audit-plan.ts` to diff the seed against the observed corpus. In
  `grab-report.md`, separate "failed (observed shape)" — a real problem — from
  "failed (inferred shape)" — probably not valid here. **An inferred shape's
  empty result may never be reported as a finding about the game.**
- Capture `genre` from benchmark response metadata.

### Phase 6 — Analysis quality (D10)

- Volume rows gain a DAU-normalised companion (per-1k-DAU) and the DAU delta over
  the same window.
- Incidents cross-reference `place-versions.md` and the new annotations: a spike
  starting after a publish is attributable; one with no publish nearby is not.
  **State the association, not a cause.**
- **Do not label anything a "platform incident" by inference.** Both universes
  spiked on 2026-07-31→08-01, but that is Fri–Sat and fits a weekly-update
  pattern as readily as a Roblox-side event. The annotation feed (D7) is the
  authoritative answer; until it is captured, report the correlation and stop.

### Phase 7 — Regression fixtures

- Freeze current captures as fixtures under `web/src/lib/__fixtures__/`.
- Encode today's bugs as assertions so they cannot return: crash incident
  visible; no headline is a breakdown slice; no partial day in a Δ; sparse counts
  gap-filled; verify corpus passes.
- Wire into `npm test`.

## Verification

1. `data/verify/COVERAGE.md` exists and classifies all 34 CSVs as pulled/not
   pulled, verified/unverified, matching/mismatching (Phase 1).
2. `npm run verify -- data/verify/9610561918/` exits 0 across all 34 files.
3. `9610561918/summary.md` shows a **Server Crashes** incident peaking 30,393 on
   2026-07-31, and `PeakConcurrentPlayers` ≈ 728, not 0.5.
4. No row reads "latest point is an estimate"; the TV crash-rate series is marked
   not-significant.
5. `npm run audit-plan` reports zero `inferred` shapes among non-optional
   templates.
6. Re-grab both universes: zero failures for observed shapes, and 9963622286's
   crash history appears with its 1.06M peak.
7. `npm test` green.

## Standing rules for whoever picks this up

- **Verify before asserting.** Every claim about a game must trace to a specific
  series in `series.json` or a CSV in `data/verify/`. The 30,393-crash miss
  happened because a conclusion was stated without checking which series was
  being read.
- **A 400 or an empty result on a shape we invented says nothing about the game.**
  Only the dashboard's own request shape is evidence.
- **Do not jump to conclusions.** Prefer capturing the authoritative signal
  (annotations, dimensions) over inferring one from correlation.
- **Stay on the grabber.** The scope boundary near the top of this file is not
  advisory. The failure mode to avoid is drifting into interesting adjacent work
  — new features, storage redesign, the AI-diagnosis phase — while the numbers
  are still wrong. If something off-topic turns up, note it and continue.
- **Phase 1 beats this document.** The defect table was an audit; the coverage
  table is a measurement. Where they disagree, the measurement wins.
