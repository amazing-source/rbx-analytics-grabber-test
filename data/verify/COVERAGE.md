# COVERAGE — the 34 dashboard CSV exports vs what the grabber holds

Phase 1 (step 3) of `CORRECTNESS_PLAN.md`. Measured 2026-08-08 by diffing every
CSV cell against `data/games/9610561918/series.json` (tolerance: relative 1e-6).
Method: throwaway script in the session scratchpad — deliberately **not** the
Phase-2 harness, which must be built fresh in `web/scripts/verify-csv.ts` and
reproduce these numbers. Per the plan: **this table supersedes the defect table
in `CORRECTNESS_PLAN.md` where they disagree.**

## Re-grab audit — 2026-08-08, both universes (verification item 6)

Knife Farm (`9610561918`) and Become a Brainrot (`9963622286`) were both
re-grabbed with the fixed pipeline. **The last open verification item is now
closed**, and the fresh data audited the audit — it confirmed some of what is
below and disproved other parts. Findings are numbered G1–G7.

Wins, measured:

- Become a Brainrot's outage is captured: `ServerCrashCount` peak **1,060,617
  on 2026-08-01**, previously absent entirely. Curve: 28 → 331 → 375 → 670,907
  → 1,060,617 → 18,674 → 6.
- Funnel discovery works (F4 fixed): `BaseUpgrades`, `PlayerProgression` and 20
  funnel steps discovered; 15 funnel requests emitted where zero were before.
- Returned-data counts: 80/120 → **127/156** (Knife Farm), 82/119 → **155/186**.
- Annotation enumeration found **`ANNOTATION_TYPE_ENGINE_RELEASE` (type 10)** —
  the genuine "was it Roblox?" signal, which F11 correctly said we never had.

| # | Finding | Action |
|---|---|---|
| G1 | **My zero-fill overreached.** The gateway truncates long sub-daily windows (a 768-hour ask returned 240 hours) and I filled the rest with zeros — including 12 hours the dashboard shows as real revenue (R$4,845 read as R$0). Absence *outside the served span* is "never served", not zero. | Fixed: sub-daily fill is now bounded by the first and last point actually served. Daily is unchanged — its trailing zeros are real. |
| G2 | **Four half-hour shapes I inferred return wrong numbers.** Verified cell-by-cell: `ClientCrashRate15m` up to 65% off, `ClientFpsAvg` ~52% off (30.7 vs 46.7 fps), `SessionDurationSecondsAvg` 2.4%, `OomUnexpectedExits` integer counts disagree. The *observed* shapes (`ErrorCount`, `ServerCrashCount`) match exactly, and inferred `PeakConcurrentPlayers` also matches 33/33 — so "inferred" predicts unreliability, not certainty of error. | The four are no longer requested and were purged from stored data. Daily versions unaffected. |
| G3 | **"Client frame rate" → `ClientFpsAvg` is disproven.** CLAUDE.md asserted this mapping; row 6 flagged it as unconfirmed. It is wrong. | Mapping removed from the harness; the file now SKIPs loudly rather than comparing two different things. |
| G4 | **The revision log became the thing D3 warned about.** It fired 500 times (its cap). Measured over 587 re-reads: median divergence **0.0000%**, p90 **0.78%** — Roblox continuously recomputes averaged metrics. A flag on every row carries no information. | Only material (>1%) divergence is logged: 500 → 87 and 87 → 55, all genuine movement. |
| G5 | **Freeze-first-write-wins is now an open question, not a settled rule.** F2 justified it with 3,092 → 747 (dashboard confirmed 3,092). But the largest divergences run the *other* way — `ItemMonetizationRevenue` 353 → 21,835 — which looks like back-fill, and our kept value is sometimes the low one. | Policy unchanged, but documented as disputed in `data-quality.md`. Do not build a conclusion on a revised hour. |
| G6 | **Annotation provenance was mis-tagged.** I marked all 24 enumerated types `observed`; only 2 were ever seen in a dashboard capture. Types 18–24 return 400 and were filling the failure table with my own guesses. | Narrowed to the 16 valid types with real names recorded; only types 7 and 16 are `observed`. |
| G7 | **`MessageHash` → text still fails** (HTTP 500 on both universes), so `errors.md` remains hashes-only. `FunnelStep` discovery 403s on Knife Farm. Neither is a query-shape problem. | Recorded; the volumes are still usable and heavily concentrated. **CLOSED 2026-08-10 as won't-fix** — the producer's judgement is that Roblox error volumes are near-meaningless (a signature firing 75M times is one benign call per player per session). Stop treating absent error text as a limit on a diagnosis. |
| G9 | **We dropped the human name on every dimension value.** `breakdownValue[]` ships `displayValue` next to `value` — `FunnelStep` "4" is `Rebirth1` — and `breakdownToMap` kept only `value`. Effect: a 20-step funnel exported as anonymous integers, and the single largest leak in Become a Brainrot ("61.4% never reach step 4") could not be read as "61.4% never reach their first rebirth". The names were in `data/raw/` the entire time; this was never an API limit. Measured 2026-08-10 on the 08-10 grab of 9963622286. | Fixed: `breakdownLabels` carries dimension → display name into `Snapshot`, `series.json`, every CSV and every label, and is **refreshed on merge** so series stored before the fix pick names up on the next ingest. The raw `value` stays the series identity — a display name in the key would silently fork every merged series. Roblox sometimes sends `displayValue: ""` (PlayerProgression step 2); falling back to the integer is correct, and a later grab carrying the name fills it in (verified: re-ingesting the 08-09 bundle produced `FirstUpgrade`). 5 regression tests, fixture `funnel-step-displayvalue-0810.json`. |

| G10 | **We believed no funnel metric could be dated to a day, and it cost a wrong finding.** The `ONE_DAY · by FunnelStep` shape 400s for `FunnelUserChurnRate` and `FunnelUserStepCompletionRate`, and that was generalised to "funnels give levels, not trends". Measured 2026-08-10: **`FunnelCohortCompletionRate` and `FunnelCohortSessionCompletionRate` ARE served at `ONE_DAY` per named step, with full history** (94 days on 9963622286, from 2026-05-08). Effect of the wrong belief: `Rebirth1` churn was compared as two `NONE` window aggregates (0.6144 full-life vs 0.6137 post-break), read as "an unchanged structural gate", and written into `HANDOFF.md` and two memories. The daily series underneath ran **24-33% (May-Jun) → 44-48% (Jul) → 34-37% (post-break)** — it nearly doubled and partly reverted. A second trap in the same family: on `NONE` rows the date column is the **window start**, not a day, so moving the window changes the number with no day changing (`FunnelUserOverallCompletionRate` for PlayerProgression reads 26.73% from an 11 Jul window and 23.09% from a 7 Aug one). | Corrected in `liveops-diagnosis` §0 and §1, `HANDOFF.md` §5, and both memories. **No code change needed — the data was always there and already in `series.json`.** Rule added: before calling anything structural, plot it daily; if no daily series exists, say "level unknown over time" rather than inferring stability from two aggregates agreeing. |

Gates after this audit: **verify 23 pass · 1 fail · 9 skip**, audit-plan **0
failures**, `npm test` **30 pass**. The single remaining failure is one disputed
realtime-revenue hour (G5), tracked explicitly in the test's `KNOWN_OPEN` set so
a *new* disagreement still breaks the build.

> **Those gate numbers are the 2026-08-08 reading and are kept as history — do
> not quote them as current.** Measured 2026-08-10: **verify 23 pass · 2 fail ·
> 8 skip (exit 1)**, audit-plan **0 failures**, `npm test` **41 pass**. The
> second verify failure is NOT a regression: it is `ErrorCount` half-hour, where
> 144 of 147 cells match and the 3 that differ are all the 08:00 bucket sitting
> at the export window's own edge — the dashboard CSV holds a partial bucket and
> our later read holds the settled one. Both failures are in the test's
> `KNOWN_OPEN`, which is why `npm test` is green while `verify` exits 1.

## Status after the fixes (same day, Phases 2–7)

This file records the measurement **as taken, before any fix** — the table
below is the baseline, and it stays that way so the fixes remain falsifiable.
What changed since:

| Finding | Now |
|---|---|
| Row 13 (2 mismatched cells) | **Fixed** — settled points are frozen; the divergent re-read is in `data-quality.md` |
| Rows 20/22 (omitted zero rows) | **Fixed** — count/robux volumes gap-filled as `FILLED_ZERO` |
| F1 misfiled CSV | **Moved** to `data/verify/9963622286/` — it is that game's only crash ground truth |
| F8 corpus not committed | **Fixed** — `.gitignore` now un-ignores `data/verify/` |
| F9 rescue bundle outside the repo | **Copied** into `data/raw/`; the crash series is reproducible |
| F3, F4, F11, D5, D7 | **Code fixed**, but only a live re-grab can exercise them |
| Rows 6/12/19/23/27/31 (half-hour) | Still SKIP — the templates exist now; they need that re-grab |

Current harness result: **22 pass · 0 fail · 11 skip**, `npm run verify` exits
0. (21 → 22 pass because a lone midnight timestamp is now correctly treated as
a daily point instead of being skipped.)

## Verdict summary

| Class | Files | Meaning |
|---|---|---|
| **Verified, matches** | **21** | every comparable cell equal, incl. breakdown series |
| **Verified, mismatches** | 2 | #13 (2 cells, real defect — see F2) · #21 (file belongs to the other game — F1) |
| **Pulled, unverifiable at the dashboard's granularity** | 6 | the six half-hour exports (D5): five held daily-only, `Client frame rate` not held at all |
| **Not pulled / no comparable series** | 5 | #1, #10 (window artifact), #15, #28, #33 |

19 distinct metrics have at least one series verified cell-for-cell against the
dashboard. Where the pipeline holds the same query the dashboard makes, the
values are **exactly right** — every mismatch traced to provenance (wrong file,
wrong capture instant), never to parsing.

## The 34 files

"Pulled" = the metric+series is in `series.json` for 9610561918 today.
Row numbers are alphabetical file order.

| # | CSV (abbreviated) | Metric (measured) | Pulled | Dashboard gran | Ours | Values |
|---|---|---|---|---|---|---|
| 1 | 30D revenue per user, Source (pivot @ Jun 12) | Attribution30DRobuxPerUser by AcquisitionSource | Total only | NONE (pivot) | ONE_DAY Total | unverifiable — breakdown not pulled, date outside our window |
| 2 | Average playtime | AveragePlayTimeMinutesPerDAU | ✓ | ONE_DAY | same | **27/27 match** |
| 3 | ARPDAU | AverageRevenuePerUser | ✓ | ONE_DAY | same | **27/27 match** |
| 4 | ARPPU | AverageRevenuePerPayingUser | ✓ | ONE_DAY | same | **27/27 match** |
| 5 | Average session time | AverageSessionLengthMinutes | ✓ | ONE_DAY | same | **27/27 match** |
| 6 | Client frame rate | ClientFpsAvg | **✗ not pulled at any granularity** | HALF_HOUR | — | unverifiable (D5; not in plan, not in any capture) |
| 7 | Daily Robux spent | DailyRevenue | ✓ | ONE_DAY | same | **27/27 match** |
| 8 | Daily active users | DailyActiveUsers | ✓ | ONE_DAY | same | **27/27 match** |
| 9 | Day 1 retention | ForwardD1Retention | ✓ | ONE_DAY | same | **29/29 match** (26 CSV days predate our window) |
| 10 | Day 30 retention (Jun 12→Jul 7) | ForwardD30Retention | 200-empty | ONE_DAY | — | CSV window ends where ours starts. **The metric has data** — our empty 200 is a window artifact: D30 only exists for ≥30-day-old cohorts and our 28-day window contains none. HANDOFF's "possibly genuine" is answered: not genuine. |
| 11 | Day 7 retention | ForwardD7Retention | ✓ | ONE_DAY | same | **23/23 match** |
| 12 | Errors and warnings | ErrorCount (+LogSource) | daily only | HALF_HOUR | ONE_DAY `where Place` | unverifiable at half-hour (D5) |
| 13 | Hourly Robux spent (Realtime) | ItemMonetizationRevenue (+ProductType) | ✓ | ONE_HOUR | same | **56/58 match** + sources 51–58 each; **2 cells wrong in our store** — see F2 |
| 14 | Monthly active users by day | MonthlyActiveUsers | ✓ | ONE_DAY | same | **27/27 match** |
| 15 | New user first session retention | none known | ✗ | — (survival curve) | — | **format variant C** — `Experience ID` preamble + `Seconds Since Start` axis; outside both documented variants (F5) |
| 16 | Not interested rate per million impressions | RFYUniqueNotInterestedUsersPerMillionImpressions | ✓ | ONE_DAY | same | **30/30 match** |
| 17 | Payer conversion rate | PayingUsersCVR | ✓ | ONE_DAY | same | **27/27 match** |
| 18 | Paying users | PayingUsers | ✓ | ONE_DAY | same | **27/27 match** |
| 19 | Peak concurrent players | PeakConcurrentPlayers (+Platform) | daily only | HALF_HOUR | ONE_DAY `where Place` (+stray ONE_MINUTE slices) | unverifiable at half-hour (D5). CSV real peak **728.72** @ Aug 7 08:00 — the number `summary.md` renders as **0.5** (D1) |
| 20 | Robux sources | DailyRevenue by RevenueSource | ✓ | ONE_DAY | same | **Total + all 4 sources 27/27 each** (CommissionAvatar 4/4 present days; 22 zero-days API-omitted — D2) |
| 21 | Server crashes (Jul 30→Aug 7) | ServerCrashCount | — | ONE_DAY | — | **misfiled: this is universe 9963622286's outage export** (375 → 670,907 → 1,060,617), not 9610561918 data — see F1 |
| 22 | Server crashes (Aug 2→Aug 8) | ServerCrashCount (+CrashType) | ✓ | ONE_DAY | ONE_DAY `where Place` | **all overlap cells match** (Total 614, 5; Runtime 599; OOM 15, 5). 5 zero-days after our last point are API-omitted rows (D2) |
| 23 | Session time by place | SessionDurationSecondsAvg (+Platform) | daily only | HALF_HOUR | ONE_DAY `where Place` | unverifiable at half-hour (D5). **Unit trap: CSV is minutes, the metric is seconds** (F6) |
| 24 | Sessions | **Visits** (resolved by value) | ✓ | ONE_DAY | same | **27/27 match** |
| 25 | Stickiness (DAU-MAU) | DauMauStickiness | ✓ | ONE_DAY | same | **30/30 match** |
| 26 | Total playtime | TotalPlayTimeHours | ✓ | ONE_DAY | same | **27/27 match** |
| 27 | Unexpected out of memory exits | OomUnexpectedExits (+Platform) | daily only | HALF_HOUR | ONE_DAY `where Place` | unverifiable at half-hour (D5) |
| 28 | Unique users with plays, Source (pivot @ Jun 12) | UniqueUsersWithPlaySessions by AcquisitionSource | Total only | NONE (pivot) | ONE_DAY | unverifiable — breakdown not pulled, date outside window |
| 29 | User ratings | PlayerFeedbackVotesCount by VoteType | Total only | ONE_DAY | ONE_DAY Total | **Total verified via Upvotes+Downvotes sum, 5/5 days.** VoteType breakdown observed in dashboard captures, not pulled |
| 30 | Universe- Average session time | AverageSessionLengthMinutes **`IsNewUser=New`** | ✓ | ONE_DAY | same | **27/27 match** |
| 31 | Universe- Client crash rate | ClientCrashRate15m (+Platform) | daily only | HALF_HOUR | ONE_DAY `where Place` | unverifiable at half-hour (D5). Encoding confirmed: fractions on both sides |
| 32 | Universe- Daily active users | DailyActiveUsers **`IsNewUser=New`** | ✓ | ONE_DAY | same | **27/27 match** |
| 33 | Universe- Unique users with impressions | UniqueUsersWithImpressions, new-user slice | ✗ (we hold unfiltered Total + by-source only) | ONE_DAY | — | unverifiable — this filtered variant isn't pulled. **Total impressions therefore has no ground truth in this corpus** |
| 34 | Universe- Unique users with plays | UniqueUsersWithPlaySessions **`IsNewUser=New`** | ✓ | ONE_DAY | same | **30/30 match** |

## The label → metric map (measured, for the Phase-2 harness)

Chart label (CSV column 3 / filename) → API metric. Entries marked `by value`
were resolved by cell-matching, not assumption.

| CSV label | Metric | Note |
|---|---|---|
| 30D revenue per user | Attribution30DRobuxPerUser | |
| Average playtime | AveragePlayTimeMinutesPerDAU | |
| Average revenue per DAU (ARPDAU) | AverageRevenuePerUser | |
| Average revenue per paying user (ARPPU) | AverageRevenuePerPayingUser | |
| Average session time | AverageSessionLengthMinutes | |
| Client crash rate | ClientCrashRate15m | fraction encoding both sides |
| Client frame rate | ClientFpsAvg | per CLAUDE.md; no capture to confirm yet |
| Daily active users | DailyActiveUsers | |
| Day 1/7/30 retention | ForwardD{1,7,30}Retention | fraction encoding both sides |
| Errors and warnings | ErrorCount | |
| Monthly active users | MonthlyActiveUsers | |
| Not interested rate per million impressions | RFYUniqueNotInterestedUsersPerMillionImpressions | |
| Payer conversion rate | PayingUsersCVR | |
| Paying users | PayingUsers | |
| Peak concurrent players | PeakConcurrentPlayers | |
| Playtime | TotalPlayTimeHours | |
| Revenue | DailyRevenue | both "Daily Robux spent" and "Robux sources" files |
| Robux Spent (Realtime) | ItemMonetizationRevenue | **by value** (56 cells) |
| Server crashes | ServerCrashCount | |
| Session time | SessionDurationSecondsAvg | **CSV minutes vs metric seconds — ×60** |
| Sessions | **Visits** | **by value** (27 cells) |
| Stickiness (DAU/MAU) | DauMauStickiness | header uses `/`, filename `-` |
| Unexpected out of memory exits | OomUnexpectedExits | |
| Unique users with impressions | UniqueUsersWithImpressions | |
| Unique users with plays | UniqueUsersWithPlaySessions | |
| (empty label; "User ratings" file) | PlayerFeedbackVotesCount | series = VoteType values; Total = Upvotes+Downvotes |

Display-name → API breakdown-value aliases (needed to join series):

| Dashboard shows | API value |
|---|---|
| Platform crashes | Runtime (CrashType) |
| Out of memory | OutOfMemory (CrashType) |
| Developer Products | DevProduct |
| Passes | GamePass |
| Third-party avatar item commissions | CommissionAvatar |
| Private Servers | PrivateServer |
| Unknown | RAQI_RESERVED_DIMENSION_VALUES_UNKNOWN |
| Home Recommendation / Sponsored Ads / Search Ads | HomeRecommendation / SponsoredAds / SearchAds |
| Total (current) / Total (previous) | Total / previous-period overlay (not a series) |
| Benchmark (Top N experience) | chart overlay, not a breakdown series |

Other measured semantics: `ONE_DAY` points are stamped `T00:00:00Z` (all of
them — `data/README.md`'s claim of 08:00:00Z is wrong); percent metrics are
fractions in **both** the API and the CSV exports; CSVs export explicit `0`
rows where the API omits the day entirely (D2, proven in rows 20/22).

## Findings (F-numbers; supersede/extend the plan's defect table)

- **F1 — one corpus file is the other game's.** Row 21 (`Server crashes,
  2026-07-30 → 08-07`) is 9963622286's 1.06M-crash outage export — values match
  that game's documented outage curve and contradict 9610561918's verified
  series on every overlapping day. The corpus is 33 files for 9610561918 + 1
  for 9963622286. Do not "fix" a mismatch against it; it is also the only
  ServerCrashCount ground truth we hold for 9963622286 — keep it, relabel it.
- **F2 — NEW DEFECT: a re-grab replaced correct values with wrong ones.** For
  `ItemMonetizationRevenue @ ONE_HOUR`, the 17:41 grab returned Aug-7 00:00 =
  3092 (the dashboard CSV agrees); the 17:48 re-grab returned **747** for the
  same 17-hour-old point, and last-write-wins kept 747. Same pattern in the
  same hour's ProductType slices (2406→490, 686→257) and in the then-in-progress
  hour 17:00. The gateway can transiently serve stale/partial values for old
  points; nothing guards merge-time. This is a new defect class the plan's
  Phase 3 (point semantics) must cover — last-write-wins is not safe for
  sub-daily data.
- **F3 — grab-report misclassifies successes as failures.** `placeVersions`
  (both games) and `reviews` (9610561918) recorded `ok:false, points:0` at
  `status:200` while their data was captured and exported. See
  `INVENTORY.md` caveat 1.
- **F4 — funnel discovery returns nothing on a game with two funnels**, so no
  active grab pulls funnels at all; the replayer re-POSTs async operations
  instead of polling the operation `path`. See `INVENTORY.md` caveat 3 —
  extends D8 beyond MessageHash.
- **F5 — a third CSV format exists** (row 15: preamble + `Seconds Since Start`
  axis). The Phase-2 parser needs to at least recognize and skip it cleanly.
- **F6 — unit mismatch CSV-vs-API:** "Session time" exports minutes;
  `SessionDurationSecondsAvg` is seconds. The harness needs a per-label unit
  scale, or row 23 will report 60× mismatches forever.
- **F7 — the `Universe-` acquisition exports are the `IsNewUser=New` slice**
  (rows 30/32/34 proven cell-for-cell; row 33 is the same slice for a metric
  where we don't pull it). Filename prefix alone does not say this — the
  harness must match series by value or carry this mapping.
- **F8 — this corpus is not actually committed.** `/data/` is gitignored
  wholesale; `git ls-files data` is empty, so the "committed" ground truth—and
  this file—exist only on this machine. Un-ignoring `data/verify/` is a
  one-line change wherever it lands in Phase 2.
- **F9 — the most important raw bundle is outside the repo.** The Aug-8
  perf-tab capture (source of the 30,393-crash series and every observed perf
  shape) exists only at
  `C:\Users\bfhdh\Downloads\rbx-analytics-grabber\data\raw\9610561918-2026-08-08T07-49-47-260Z.json`
  (the extension's Downloads fallback — the web app wasn't running). Copy it
  into `data/raw/` before anything regenerates `series.json` from raw bundles,
  or the crash incident becomes unreproducible.
- **F10 — D9's two cited unit bugs are already fixed pointwise** in
  `metric-info.ts` (`ClientMemoryUsageAvg` → bytes formatter,
  `ServerFrameRateP10` → fps). The systematic plausibility validation D9 asks
  for still does not exist.
- **F11 — D7 restated:** nothing in the codebase requests annotations at all
  (no `annotationType` anywhere in code); the type-16 and type-7 requests in
  the captures are the dashboard's own, and every observed response is empty.
  The parser also has no handler for annotation responses, so even captured
  ones are dropped. D7's fix is "add annotation requests + parsing", not
  "change a hardcoded 16".

- **F12 — the deploy log silently drops a place when its `saved-versions` call
  fails, and the file gives no sign.** Measured 2026-08-14 on universe
  `10030829154`: the root place `139617346573330` is absent from
  `place-versions.csv` (0 rows) because `placeVersions` returned **500**, which
  `grab-report.md` files under *inferred shapes / probably not valid here* since
  the template is `optional: true`. Result: `place-versions.md` reads "373
  versions across 24 days", tops out at a sub-place's `v437`, and looks
  complete — while the root place was at `v1698`. **Every date-the-deploy test
  in the diagnosis skill runs off this file.** Two fixes, both cheap: mark a
  place with zero returned versions explicitly in `place-versions.md`, and
  cross-check the place list against the `Place` filter values the metric
  templates already carry (they had all six). Workaround until then:
  reconstruct from `feedback.csv`'s `asset_version` column — it dated all six
  root publishes to the correct hour.

- **F13 — the `*.daily.csv` roll-up aggregates `FILLED_ZERO` rows, and printed
  the update day as zero.** Measured 2026-08-15 on universe `9963622286`.
  `PeakConcurrentPlayers.daily.csv` and `ErrorCount.daily.csv` both read **0 for
  2026-08-14**, the day `v586`/`v587` shipped, while the genuine `ONE_DAY`
  series in the same CSV reads **PCU 3,139.57** and **11,197,283 client
  errors**. Cause: half-hour windows are clamped to the final 24h (a documented
  gateway behaviour), the exporter gap-fills the unserved span with
  `FILLED_ZERO`, and the daily roll-up then sums/maxes those filled zeros into a
  daily value. Confirmed by status counts: 144 of 2026-08-14's `ErrorCount`
  half-hour rows are `FILLED_ZERO` against 6 real, and 48 of 48 `PCU` rows are
  `FILLED_ZERO`. **Anyone reading the daily file concludes the game had zero
  players and zero errors on launch day.** Two sibling artifacts from the same
  roll-up: `SessionDurationSecondsAvg` reports **3,949 s for 2026-08-16**, a day
  that has not happened, and PCU / `ClientCrashRate15m` duplicate 08-15's value
  onto 08-16. **Fix: never roll a daily value off half-hour rows outside the
  served span — prefer the real `ONE_DAY` series when one exists, and emit `—`
  rather than `0` when it does not.** Until fixed, read `ONE_DAY` rows directly
  and treat every `*.daily.csv` as suspect. Not yet encoded as a test.

## What this means for the phases

- Phase 2 (harness): everything needed is above — three formats, label map,
  aliases, unit scales, fraction encoding, `T00:00:00Z` join, F1's relocation.
  Expected baseline: 21 green files, row 13 red on 2 cells, rows 6/12/19/23/27/31
  red-by-absence until D5 lands.
- Phase 3: F2 makes "last-write-wins" part of the point-semantics work.
- Phase 5: F3, F4, F9, plus INVENTORY.md's gap table (the dashboard shapes we
  never ask for, including everything `HALF_HOUR`).
