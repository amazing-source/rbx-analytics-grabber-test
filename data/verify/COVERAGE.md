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
> 8 skip (exit 1)**, audit-plan **0 failures**, `npm test` **41 pass**.
> Re-measured 2026-08-23 — verify and audit-plan unchanged; `npm test` is now
> **44 pass**. The
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

  **Reproduced on a second universe 2026-08-16, and it blocked a live
  investigation.** On `9610561918` `place-versions.md` tops out at **v3747,
  dated 10 May**, while the place open in Studio reads **v3829**. So the deploy
  log is not just incomplete there, it is ~3 months and ~80 versions stale and
  still reads as a finished file. This is no longer a one-universe quirk: it is
  the default failure whenever the root place's call fails, and on that game it
  made "what shipped between 3 and 13 Aug" unanswerable while payer conversion
  halved. **Raise the priority — the two cheap fixes above are now blocking
  diagnosis, not just cosmetics.** Interim fallback that works on any universe:
  the error export's `First seen version` column dates a deploy to the hour
  (V3826 → 7 Aug, V3829 → 13 Aug), and `ANNOTATION_TYPE_EXPERIENCE_EVENT_STATE`
  in `annotations.md` dates every named event to the second.

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

## F14 — Open Cloud returns the same values as the gateway (2026-08-19)

**Claim:** the official Open Cloud Analytics Query API is value-identical to the
dashboard gateway we replay, and covers every metric in the plan.

**Measured**, universe 9963622286, `npm run compare-opencloud -- 9963622286`
and `npm run coverage-opencloud -- 9963622286` (scripts in the test repo):

| | result |
|---|---|
| Metrics served | **71/71** |
| Cells compared | 726 |
| Identical | **717** |
| Differing | 9 — all explained, none a source disagreement |

The 9: six `ClientCrashCount` cells (0.89-1.94%), two `ErrorCount` (0.05/0.08%),
one `ClientFpsAvg` (1e-4 %, float precision). `data-quality.md` lines 437-438
record the gateway re-serving ClientCrashCount 2026-08-07 as 3213 — Open
Cloud's exact value — while the corpus holds the frozen first read of 3170. The
sub-1% ones have no revision row because the materiality threshold is 1%.

**Two false alarms this measurement produced and then killed**, both ours:
1. "PeakConcurrentPlayers is 87% off" — `compare-opencloud.ts` was not filtering
   the `granularity` column, so HALF_HOUR rows overwrote ONE_DAY values for the
   same date. Fixed; PCU is 27/27 exact.
2. "ServerCrashCount returns a fractional 4.010101010101, treat as suspect" —
   both sources return the same fractional daily value. Normal, not an anomaly.

**Not measured:** only universe 9963622286, which is single-place. Waterslide is
genuinely multi-place and the Place-scoping question is untested there.

## F15 — a rate limit was being recorded as a metric that failed (2026-08-19)

Measured while building the Open Cloud grab path. Pacing POSTs at exactly the
documented budget (30/min = 2000ms apart) left no headroom, and **39 of 135
requests came back HTTP 429**. Each landed in `grab-report.md` as a failed
metric — which is indistinguishable from "this universe has no such data", the
false-finding class the grab report exists to prevent.

Two causes, both fixed:
1. **No headroom.** 2200ms is what `compare-opencloud.ts` had been using all
   along. `runQuery` now also retries a 429 with backoff and records a failure
   only if it still fails after 4 tries — a 429 is never an answer about a game.
2. **Two paths sharing one key.** The manual grab was fired while the scheduler
   was mid-pass. The budget is per KEY, so they halved each other. The
   scheduler's `running` flag only ever guarded the scheduler against itself;
   both callers now serialize through one queue in `opencloud-run.ts`.

Result on a clean run of 9963622286 (3-day window, 135 requests): **51 failures
→ 5**, zero 429s, 122 metrics returning data. All 5 remaining are
`optional=true, provenance=inferred` (PlaceVersion-breakdown shapes and
`WeeklyCohortRetention · by CohortDay`) — the class that may never be reported
as a finding about a game.

**Also measured:** three shapes the seed plan gets wrong for Open Cloud, all of
which read as "metric unavailable" if believed. The 8 funnel metrics and
`WeeklyCohortRetention` are served at `None`, not `OneDay`;
`DailyCohortRetention` is `OneDay` capped at a 10-day window. The gateway
accepts `ONE_DAY` for all of them, so the shared plan asks for it. Handled in
`toCloudQuery`; 8 failures removed.

**Regression test: G10** in `web/src/lib/__tests__/pipeline.test.ts` — pins that
an Open Cloud point and a gateway point for the same day merge into ONE series
(the `+00:00`/`Z` spelling, the `OneDay`/`METRIC_GRANULARITY_ONE_DAY` enum, and
the breakdown `displayValue`), and that a settled gateway value is not
overwritten by a later Open Cloud read.

## F16 — a phantom future row, and the end-window that causes it (2026-08-23)

Measured against Open Cloud on 10030829154, start fixed at `2026-08-20`, only
`endTime` varied. `endTime` is **exclusive at the day boundary**:

| `endTime` sent | Days returned | |
|---|---|---|
| `2026-08-23T00:00:00Z` | 08-20, 21, 22 | today silently excluded |
| `2026-08-23T23:59:59Z` | 08-20, 21, 22, 23 | |
| `2026-08-24T00:00:00Z` | 08-20, 21, 22, 23 | the correct ask |
| `2026-08-25T00:00:00Z` | 08-20, 21, 22, 23, **24** | **phantom** |

Asking past today makes **`PeakConcurrentPlayers` carry its last value forward
into a day that has not happened** — the 08-24 point came back byte-identical to
08-23. `ErrorCount`, `DailyRevenue` and `AverageSessionLengthMinutes` do not:
they stop at the last real day. The behaviour is PCU-specific.

**This is the origin of the duplicate rows in the corpus.**
`data/games/10030829154/metrics/PeakConcurrentPlayers.csv` holds a `2026-08-24`
row duplicating `2026-08-23` (same value `4491.938794538081`, same
`captured_at`, `partial=true`), and `2026-08-17` duplicating `2026-08-16` the
same way. Both arrived tagged `DATA_STATUS_INVALID`, **not** `FILLED_ZERO` — so
they came from the API, not from our gap-fill. That in turn implies the browser
**gateway treats `endTime` as INCLUSIVE where Open Cloud treats it as
exclusive**; the gateway side is inferred from the stored capture, not yet
measured directly. **Measure it before changing `alignWindow`.**

Second, independent defect found in the same file set: `DailyActiveUsers` for
**2026-08-16 and 08-17 is stored as `0`, tagged `FILLED_ZERO`**, where Roblox
serves **389,477** and **401,742**. Our gap-fill wrote zeros into days that have
real data. This corrupts any weekday baseline and would mis-fire
`scoreSeries()` — the alerting path in `src/lib/notify.ts` reads exactly these
rows.

**Not yet fixed and not yet encoded as a test.** Two tests wanted:
1. a PCU series whose last point repeats on a future date collapses to one point;
2. `FILLED_ZERO` is never written for a date the API returned data for on any
   prior grab.

Also measured the same day: **the funnel endpoint answers only some windows, and
the set changes between calls.** Of ten rolling windows requested for
`FunnelUserStepCompletionRate`, two returned data and eight returned an empty
series — and windows that answered correctly twice went quiet an hour later. An
empty funnel series is therefore never evidence about a game. Filtering funnel
metrics by `Platform` returns no series at all (query-shape limit, not a
finding about devices).

## F17 — `data/exports/` was silently untracked, and it holds the only copy of error text (2026-08-24)

`.gitignore` line 19 is `/data/*` with negations for `verify/`, `raw/` and the
`grab-report.json` files. **`data/exports/` matched the broad ignore and was
never negated**, so every Creator Dashboard download filed there — 40 files,
2.4 MB — existed on one machine only and would not survive a clone.

That matters more than the size suggests, because these are the two things the
API cannot serve:

- **Error message TEXT.** The async `errorReporting.dimensions/MessageHash`
  lookup answers **HTTP 500 on all four universes** (see each game's
  `grab-report.md`, *Failed — observed/proven shapes*). `errors.md` therefore
  carries volumes against bare hashes: on 10399712766, 511 signatures over
  133,397,839 events with `Text` null for every one. A dashboard export is the
  only route to the text.
- **Player comment TEXT.** `feedback.csv` holds it, but the exports carry
  device/platform/rating rows the grabber does not.

And they are not re-downloadable later: the dashboard's error export is capped
at ~26 rows and scoped to recent versions, so a version that ages out takes its
signatures with it.

**Fixed the same day** — `!/data/exports/` added directly after `!/data/raw/`.
Ordering matters: git evaluates in sequence, and a negation placed after the
`/data/games/*/*` block does not re-include the directory. Verify with
`git check-ignore -v data/exports/INDEX.md`, which must now exit non-zero.

`data/exports/INDEX.md` carries the layout, the naming rule and the attribution
method (version band, script path, or comment-text match against
`data/games/<id>/feedback.csv`).

**Gap that remains:** 10399712766 has no error export at all. It is also the
game with an unexplained payer collapse, so that gap is load-bearing.

## F18 — 77% of the corpus's half-hour PCU rows are fabricated zeros (2026-08-25)

The gateway truncates sub-daily windows to the final 24h. The exporter then
gap-fills every unserved slot inside the requested window as `FILLED_ZERO` —
and CLAUDE.md already warns, in the same paragraph that describes the
truncation, that **"absence outside the served span is NOT zero."** The exporter
does it anyway, so the two rules contradict each other in the files.

Measured by diffing every corpus `HALF_HOUR` `PeakConcurrentPlayers` row against
Open Cloud, which serves the same metric across the full 28-day retention
window:

| universe | genuine rows | agree with Open Cloud | `FILLED_ZERO` rows | agree |
|---|---|---|---|---|
| 10030829154 | 111 | 106 | **390 (77%)** | **0** |
| 10399712766 | 70 | 70 | **143 (66%)** | **0** |
| 9963622286 | 539 | 511 | **300 (36%)** | **0** |

Every filled row is a real, non-zero CCU value. `2026-08-14T20:00Z` on
10030829154 is stored as `0` and was **3,514**. The five/28 genuine rows that
differ are the freeze policy working as designed (first settled read kept) plus
the bucket at the capture edge — not a source disagreement.

**Consequence:** any time-of-day analysis run off `metrics/*.csv` is reading
mostly fiction, and it fails in the dangerous direction — a fabricated zero
makes the baseline *lower*, so a genuine decline reads as normal. It also
contaminates `*.daily.csv`, which is the already-known F13.

**Not yet fixed.** The narrow fix is to stop gap-filling sub-daily granularities
entirely: the served span is knowable (the gateway's own response bounds it) and
absence outside it is unknown, not zero. Until then, `npm run ccu-baseline`
reads Open Cloud directly and never touches the CSVs.

## F19 — the PCU carry-forward phantom fires at HalfHour too (2026-08-25)

F16 records `PeakConcurrentPlayers` carrying its last value forward into a day
that has not happened when `endTime` reaches past today, and documents it at
`OneDay`. It does the same at `HalfHour`: with `endTime` set to tomorrow 00:00Z
— the *correct* ask for including today — the final bucket comes back
byte-identical to the one before it.

Measured 2026-08-25 at 11:44Z, one query per universe:

| universe | 11:00 | 11:30 | 12:00 |
|---|---|---|---|
| 10030829154 | 2,872.3 | 3,036.5 | **3,036.5** |
| 10399712766 | 3,648.1 | 3,812.7 | **3,812.7** |
| 9963622286 | 1,865.1 | 1,853.8 | **1,853.8** |

Exact equality on three unrelated universes, on a metric that never repeats a
value otherwise. `ErrorCount`, `ClientCrashRate15m` and `OomUnexpectedExits` do
not do this — it stays PCU-specific.

**Always drop the last half-hour bucket.** It is not marked `partial`, carries
no distinguishing status, and duplicating the true final reading means it
survives any "is this value plausible" check.

## F20 — Open Cloud serves HalfHour across the whole 28-day window (2026-08-25)

CLAUDE.md says half-hour windows are "clamped to the final 24h". That is a
**gateway** limit, and it does not apply to Open Cloud. Measured on
10030829154, `PeakConcurrentPlayers` at `HalfHour`:

| window asked | returned |
|---|---|
| 1d | 25 pts, 08-25T00:00 .. 12:00 |
| 3d | 121 pts, 08-23 .. |
| 7d | 313 pts, 08-19 .. |
| 14d | 649 pts, 08-12 .. |
| 27d | **1,321 pts, 07-29 ..** |
| 31d | 400 — "exceeds the data retention period of 28 days" |

So the ceiling is the metric's own 28-day retention, not a sub-daily clamp, and
the error names it. This is what makes a time-of-day baseline 27 days deep
available on a first run instead of accumulating one grab at a time — and it is
why F18 is worth fixing rather than working around.

## F21 — a fresh universe silently got NO technical rung at all (2026-08-26)

Measured on `10565445771` and `10638354731`, the two games handed over on
2026-08-26. Both are universes whose dashboard had never been opened, so the
corpus held no prior grab for them.

`buildSeedTemplates()` passes `discovered.__places` into `perfSpecs()` and
`halfHourSpecs()`, and **both return `[]` when the place list is empty**:

```
function perfSpecs(places, firstSeenVersions = []) {
  if (!places.length) return [];      // default-plan.ts:219
```

`lastDiscovered()` sourced that list only from a **previous** `grab-report.json`.
No previous grab ⇒ no places ⇒ the entire Place-scoped half of the plan was
never generated. On Verity's first pass that was **71 requests with zero perf
shapes among them**: no `ClientCrashRate15m`, `ClientCrashCount`,
`ServerCrashCount`, `OomUnexpectedExits`, `ClientFpsP10`, memory, CPU,
`ServerFrameRateP10` — and no `PeakConcurrentPlayers`, which lives in
`perfSpecs()` too, so the game had no CCU series either.

**The failure mode is the one the grab report exists to prevent.** These were not
failures and not skips — the requests were never constructed, so nothing appeared
in any section of `grab-report.md`. A reader sees 60 metrics returning data and
no mention of crashes, which is indistinguishable from a game that never crashed.

The comment on that early return ("an absent request is honest") is correct **for
funnel names**, which are developer-defined values that can only be discovered.
It is wrong for places: `GET https://develop.roblox.com/v1/universes/{id}/places`
is an unauthenticated GET that needs no session cookie, and the deploy log
already relies on it. Fixed in `opencloud-run.ts` by fetching places there, with
a place list already in the corpus still winning so a transient 500 cannot drop
one. Plan size went **107 → 198 requests** on Verity; the second pass returned
the full technical rung.

**Also measured here, and it is a separate trap:** asking perf metrics from
outside their 28-day retention 400s the *whole family* rather than clamping.
Verity's window started 2026-07-25 and every one of 27 perf shapes came back
`"The requested start time (2026-07-25) exceeds the data retention period of 28
days … Data is only available from 2026-07-29 onwards."` The error names the
floor; re-asking from 07-29 dropped it to 5 failures. Chunking legalises long
windows for metrics that *have* the data — it cannot legalise a start date
before the horizon.

## F22 — funnels ARE reachable on Open Cloud; the blocker is an unpolled 202 plus a dead `FunnelName` filter (2026-08-26)

**Supersedes the first version of this entry, written earlier the same day,
which concluded funnels were unreachable and that rung 6 needed the browser.
That was wrong, and it was wrong for a reason worth recording.**

Ground truth from the Creator Dashboard Funnels page: **9 funnels** on
`10565445771` (Conversation, Onboarding, Session, FollowMe, Messages,
MessagePack, EndingOthers, Notebook, Ending) and **4** on `10638354731`
(Onboarding, Progression, MapReach 2, MapReach). Both games had just been
written up as having no readable funnels.

Two independent faults stacked, and either alone yields an empty result:

1. **Funnel queries are ASYNC.** They answer HTTP **202** with `done:false` and
   a `path`. Every ad-hoc probe written for this investigation read that as the
   final answer and reported `0 series`. The poll URL is
   `https://apis.roblox.com/analytics-query-api/{path}` — the
   `analytics-query-api/` prefix is part of it, and one probe used
   `apis.roblox.com/{path}`, which polls nothing. `opencloud-grab.ts:208`
   already had this right; the probes did not inherit it.
2. **The `FunnelName` filter is accepted and matches nothing.**
   `FunnelName In ["Onboarding"]` on a universe whose Onboarding funnel holds
   1,140,668 users returns **0 series** — identical to a deliberately fake
   name. Remove the filter and the same query returns every step.

**Filters are not broken in general.** The same metrics filter correctly by
`Platform` (Computer returned ~33% of every step, matching its DAU share) and by
`IsNewUser`. `FunnelName` is the single broken dimension.

Legality, enumerated by probing until the API named each case:

| Dimension | On funnel metrics |
|---|---|
| `FunnelStep` | the only breakdown that works |
| `FunnelName` | filter-only, and the filter returns nothing |
| `Platform`, `IsNewUser` | filter-only, and functional |
| `FunnelId`, `FunnelSessionId`, `FunnelStepName`, `FunnelType`, `Place`, `AcquisitionSource`, `CohortDay`, `PlaceVersion` | "not supported for metric ..." |

All nine funnel metrics answer at `None`; only `FunnelCohortCompletionRate` and
`FunnelCohortSessionCompletionRate` also answer at `OneDay`, and those two are
what date a break. `FunnelUserTotalCount` 400s at `OneDay`.

**The real limitation, and it is narrower than "unreachable":** with no working
`FunnelName` filter, `FunnelStep` returns the **union across all funnels keyed
by step index**. Where funnels share an index the label is whichever one won and
the count is a blend — Seal's index 1 came back `Neighbourhood` (from MapReach)
though Onboarding's step 1 is `Started`, and merged step-2 completion read
**66.65%** against the dashboard's **98.15%**. So step names, per-step volumes
and daily trends are sound; **a single funnel's completion rate is not**, unless
the game has exactly one funnel.

`dimension-values` remains a dead end: it accepts
`{metric, dimension, startTime, endTime}` and answers `200 {"values":[]}` for
everything, positive controls included. The `FunnelName` error message
recommends it; the recommendation does not work. That part of the original entry
stands.

Routed to the `liveops-diagnosis` skill as a step-by-step recipe at the top of
its funnel section, because this failure has now recurred on four games.

---

## F23 — an unfinished async query is indistinguishable from a game with no data, and it is NOT confined to funnels (2026-08-28)

**F22 diagnosed this on funnel metrics and fixed the funnel path. The fault is
wider than that entry implied, and it bit twice more today on a metric nobody
thinks of as async.**

Building the two 2026-08-28 update baselines, `ErrorCount` broken down by
`PlaceVersion` — the deploy-log query, the thing that dates a publish —
returned **0 versions**. The identical rerun, same window, same filter, minutes
later, returned **25**. Nothing about the query changed. On the same pass the
first funnel run reported **"0 steps"** for both games; the retry returned
**20 steps on `9963622286`** and **3 on `10399712766`**.

**The generalisable rule: an empty answer from this API is a measurement of the
poll, not of the game, until a retry agrees with it.** The existing standing
rule — "an invented query shape that 400s, or returns an empty 200, tells you
nothing about the game" — is now missing its most common cause. `done:false`
answers arrive with a `path` and no data; read that as final and it presents as
a clean, well-formed, entirely empty result.

**Why it is more dangerous than the funnel case.** A funnel returning nothing
prompts suspicion, because a game visibly has funnels. A *deploy log* returning
nothing looks like a game that simply has not shipped in the window — plausible,
unremarkable, and it would have been filed into `baseline/` as fact. The
half-hour deploy-log table is what dates a publish to the bucket; an empty one
silently removes the ability to say when a build went live.

**What it appears to depend on:** back-to-back load. Both empties occurred
immediately after a long paced grab or another script's queries; both cleared on
a spaced retry. `tools/oc.js` polls 40 × 1200ms ≈ 48s, which is not always
enough under that load.

**Fixed, in the tools rather than in `oc.js`** (leaving the shared helper's
timing alone, since the grabber paces its own calls):

- `tools/deploy-log.js` and `tools/funnels.js` poll **120 × 1500ms ≈ 3 min** and
  **retry an empty answer three times**, spaced 6s.
- `tools/deploy-log.js` **throws rather than writing an empty deploy log.** A
  missing file is a visible failure; an empty table is a false record. This is
  the same reasoning as `grab-report.md` existing at all.

**Verified:** `node tools/deploy-log.js 9963622286 99255447043899 <out> "..."`
reproduces the filed `baseline/2026-08-28T1500Z-…/deploy-log.md` byte-for-byte
apart from its pull timestamp.

---

## F24 — `ccu-baseline` scores slots that have not happened yet as zero, and it changed the answer by 24 points (2026-08-28)

`npm run ccu-baseline -- <id>` with no `--slots` sweeps the **whole 24 h** of the
current day. Slots later than now hold no data, are counted as zero, and are
averaged into "today". On `9963622286` at 15:23 UTC:

| invocation | slots | today's mean CCU | vs last 7 days |
|---|---|---|---|
| `-- 9963622286` | 00:00–23:00 (47) | **848** | **−64.7%** |
| `-- 9963622286 --slots 00:00-15:30` | 00:00–15:30 (32) | **1,246** | **−40.9%** |

The per-slot profile makes it obvious once printed — every slot from 16:00
onward reads **−100%** — but the summary table above it does not, and the
summary is what gets quoted. The two readings support different conclusions:
−64.7% is a collapse, −40.9% is a game sitting level with yesterday (08-27 was
1,268 on the same window).

**This is the same class of error as F16 and F19** — an artefact at the edge of
the window that is not marked `partial` and therefore survives every
plausibility check. It differs in being ours, not Roblox's.

**Interim rule, until it is fixed: always pass `--slots` bounded by the current
UTC time when reading a part-day.** Note the tool selected the elapsed range by
itself for `10399712766` in the same run, so the behaviour is inconsistent
between universes rather than uniformly wrong — do not assume either default.

**Not yet fixed and not yet encoded as a test.** The fix is to clamp the slot
list to the last elapsed boundary when the requested day is today.

---

## F25 — the newest day of `FunnelCohortCompletionRate` is unstable, by more than the tripwire width (2026-08-29)

Every update baseline sets funnel tripwires as "more than 5 pp below the step's
own pre-update mean". **The newest day in that series moves by up to 5.5 pp on
its own, days after it was first served** — so a tripwire evaluated on a fresh
day fires on the artefact, not on the build.

Measured by pulling the **same dates twice, three days apart** — the 2026-08-26
funnel dump (`baseline/funnels-2026-08-26.json`) against a 2026-08-29 pull of the
same window. Verity Companion (`10565445771`), `FunnelCohortCompletionRate` at
`OneDay`, value on 08-26 → value on 08-29:

| step | 08-20 | 08-21 | 08-22 | 08-23 | 08-24 | **08-25 (newest at first pull)** |
|---|---|---|---|---|---|---|
| `First Reply Received` | 52.4→52.6 | 51.8→52.0 | 50.7→50.9 | 49.9→50.1 | 49.2→49.8 | **55.0→49.5 (−5.5 pp)** |
| `Day 2 Reached` | 33.7→33.9 | 33.6→33.7 | 33.0→33.1 | 32.3→32.5 | 32.1→32.6 | **36.5→32.6 (−3.9 pp)** |
| `Day 3 Reached` | 24.4→24.5 | 24.2→24.3 | 23.6→23.8 | 23.0→23.2 | 23.0→23.3 | **26.5→23.2 (−3.3 pp)** |
| `Ending Completed` | 22.9→23.2 | 22.8→23.1 | 19.1→19.4 | 17.8→18.1 | 18.3→18.9 | 17.3→18.7 (+1.4 pp) |

**Every date four or more days old moved by less than ±0.6 pp. The newest day
moved by up to 5.5 pp.** So the series settles, and it settles fast — but the
newest point is worth roughly the entire width of a tripwire.

**The direction is per-game, so "the newest day reads low" is not a safe
shortcut.** Same test on Seal A Driveway (`10638354731`): every step drifted
**up** with age, +0.3 to +0.4 pp at 5 days old and **+1.0 to +1.5 pp** on the
then-newest day. Climb Waterslide (`10030829154`) shows the same low-and-rising
shape, uniformly 2–4 pp across all fifteen tutorial steps. Verity's *shallow*
steps read high and settle down while its *deep* steps read low and settle up.

**Why it is not simple right-censoring.** `Day 5 Reached` on a cohort one day old
cannot be complete, so censoring is the obvious hypothesis — but it predicts the
newest day reads low on the deep steps only, and Verity's newest day reads
**high** on the shallow ones by 3–5.5 pp. Both effects are present on the same
game on the same day. Whatever the mechanism, the empirical rule below is what
holds.

**Rules, applied to the 2026-08-28 evening batch:**

1. **Compute every pre-update mean over complete days that exclude the newest
   one.** All three baselines in that batch use 08-21…08-27 and display 08-28
   without averaging it.
2. **Never fire a funnel tripwire on a day less than two days old**; treat
   anything under four days as provisional.
3. A step that is 3 pp "down" on a one-day-old day and back to its mean three
   days later was never down.

Same class as F16, F19 and F24: an artefact at the newest edge of a window that
is **not marked `partial`** and therefore survives every plausibility check. It
differs from F24 in being Roblox's, not ours.

**Not yet encoded as a test.** The wanted regression: a
`FunnelCohortCompletionRate` series whose newest day is excluded from any
computed mean, and a check that `tools/funnels.js` never averages the last date
in its own window.

---

## F26 — the 2026-08-27 client-CPU step hit two games and missed three (2026-08-29)

`ClientCpuTimeAvg` jumped on 2026-08-27 on two universes and did not move on
three others, which rules out the obvious "Roblox shipped a client" explanation
without supplying another one. Recorded because **it landed inside the baseline
day of an update batch**, so it contaminates the reference value the next build
gets measured against.

| universe | game | 08-26 | **08-27** | 08-28 | move |
|---|---|---|---|---|---|
| `10030829154` | Climb Waterslide and Slide | 10.5 | **33.0** | 16.2 | **3.1×** |
| `9963622286` | Become a Brainrot | 41.0 | **93.0** | — | **2.3×** |
| `10638354731` | Seal A Driveway | 6.2 | 7.9 | 7.6 | 1.3× |
| `10399712766` | +1 Banana Monkey Destruction | 15.0 | 15.4 | — | 1.03× |
| `10565445771` | Verity Companion | 7.2 | 6.9 | 7.2 | 0.96× |

Nothing else moved with it on either affected game — crash rate, FPS, memory and
server CPU all flat or improving on the same day. Waterslide fell back to 16.2 on
08-28, still above its 10.5–13.0 band; Brainrot has no 08-28 point yet.

**Consequence, and it is the reason this is written down:** the Waterslide update
baseline (`2026-08-28T2030Z-…-v1715-v1716`) is frozen at **08-27**, so its client
CPU reference would have been **33.0**. Using it would make almost any
post-update reading look like a 50% improvement. That baseline uses the pre-spike
band instead and sets its tripwire at "> 20 on two consecutive settled days".

This also answers question 3 of the Brainrot baseline, which asked whether
anything changed on 08-27 on that game specifically: it was not that game alone,
but it was not portfolio-wide either. **Unexplained; two data points, not a
trend.** Re-check whether either game returns to its old band.

### F27 — a long grab window silently drops the newest day (gateway path)

**Measured 2026-09-08, twice, nine minutes apart on the same universe.**

| grab | window | newest `DailyActiveUsers` day |
|---|---|---|
| 13:34 UTC | `--start 2026-08-12 --end 2026-09-09` | **2026-09-06** |
| 13:43 UTC | `--start 2026-09-05 --end 2026-09-08` | **2026-09-07** (84,405) |

The end date is not the cause — the wide grab asked for a *later* end and still
stopped a day earlier. Open Cloud served 09-07 for the same metric at 13:31, and
its value matches the narrow grab's cell for cell, so the day exists and the
wide gateway ask is what loses it. Reproduced on all five portfolio universes:
the 28-day pass returned 09-06, a 3-day pass returned 09-07 on every one.

**Blast radius.** It is the *newest* day, so it hits exactly the read a
post-update watch depends on, and it is invisible — a missing right edge looks
like Roblox's own reporting lag rather than a grab artefact. This pass reported
"behavioural metrics stop at 09-06" for four games when DAU, session length,
playtime per DAU and stickiness were all available for 09-07; that is one of
three post-update days thrown away, and on Banana Monkey the recovered day moved
matched-weekday session length from −9.2% to **−10.8%** and turned a 2-pair
comparison into a 3-pair one.

**Workaround in use:** run a short trailing-window grab (`--start <today-3>
--end <today>`) after the long one. The corpus merges them and the newest day
lands. **Not fixed**, and not yet encoded as a test.

**Audit that catches it:** `node tools/freshness.js` prints the newest settled
`ONE_DAY` headline point for every metric per game. The frontier is per-metric —
on 2026-09-08 it was 09-07 for 46 metrics, 09-06 for 15, 09-05 for D1 and 08-30
for D7. Run it before writing any post-update table; assuming a single frontier
date for all metrics is what caused the loss above.

## F28 — Roblox's own client-perf telemetry is degenerate for 2026-09-08 on ALL five games

Measured 2026-09-09 12:0xZ, corpus **and** a live Open Cloud re-read (identical
values, so this is Roblox's store, not our pipeline).

| game | `ClientFpsP10` 09-07 -> 09-08 | `ClientMemoryUsagePercentageAvg` 09-07 -> 09-08 |
|---|---|---|
| Verity 10565445771 | 45.30 -> **9.71** | 0.2161 -> **0.0440** |
| Seal 10638354731 | 48.02 -> **10.57** | 0.1979 -> **0.0420** |
| Monkey 10399712766 | 33.20 -> **6.88** | 0.2459 -> **0.0462** |
| Waterslide 10030829154 | 33.80 -> **8.11** | 0.2326 -> **0.0565** |
| Brainrot 9963622286 | 26.93 -> **3.16** | 0.3122 -> **0.0421** |

**It is an artifact, and four independent checks say so:**
1. `SessionDurationSecondsAvg` and `ClientCrashRate15m` are flat on all five for
   the same day. Verity's `OomUnexpectedExits` *fell* 107 -> 71. A game truly at
   P10 = 9.7 FPS cannot hold session length and crash rate steady.
2. Memory falls *with* FPS. A real frame-rate collapse raises memory pressure.
3. Every `Platform` slice falls by the same ratio (Verity Computer 41.97 ->
   10.72, Console 51.89 -> 21.32) — a sampling signature, not a device one.
4. 09-09 recovers to 41.40 on Verity with no intervening publish.
   `ErrorCount` for 09-08 is absent entirely on all five.

**Why it matters:** Verity shipped v689/v690 on the morning of 09-08. Read
naively, one Roblox telemetry gap would have been reported as that build
destroying client performance — and as four other studios' builds doing the same
thing on the same day. **Never quote 09-08 client FPS or memory.** The rule that
catches this class generally: a technical regression that appears on every
unrelated universe at once is an instrument fault, not five incidents.

## F29 — per-signature error data exists only for ~the last 24h, by EITHER route

Measured 2026-09-09 on 10399712766, trying to answer "how many times has the
`CratesController:856` error fired since the v1246 publish (04 Sep 17:35 UTC)".
**It is unanswerable.** Four independent routes, all clamped to roughly one day:

| Route | Result |
|---|---|
| Dashboard export, page picker driven to **Last 7 days**, version filter applied **before** it | CSV **byte-identical** to the 1-day export |
| Same, version filter applied **after** the range | Byte-identical again |
| Same **Last 7 days** click with **no** version filter | **54,772** events, against **314,346** in the previous day's 1-day export — fewer, not more, and matching the last-24h figure from the API |
| Open Cloud `ErrorCount`, `granularity: None`, `breakdown: ["MessageHash"]`, 4.8-day window | **54,175** vs **53,111** for a 1-day window — silently clamped |
| Same query over a **historical** 24h window (09-07 14:53 → 09-08 14:53) | **EMPTY**, after three spaced retries |

So the range picker changes the page and does **not** change the export, and the
API serves per-signature error volumes only for the current ~24h. A `--range`
flag was added to `export-errors.ts` during this investigation and **removed
again**, because a control that silently does nothing is worse than no control;
the finding is documented in that script's `--help` instead.

**Consequence for the watch:** an error signature's history cannot be
reconstructed after the fact. `errors_<date>_<time>_…csv` files ARE the series —
each one is a day that cannot be re-fetched. **Export daily on any game under
watch**, or the question "was this worse last week" has no answer. The evidence
file for this finding is
`data/exports/10399712766-banana-monkey-destruction/errors/errors_2026-09-09_1310_v178-v1246_92rows_F29-7d-click-ignored.csv`.

Note the aggregate `ErrorCount` metric is unaffected — it chunks and holds ~56
days in the corpus. It is only the **per-`MessageHash`** breakdown, and the
dashboard export that carries the message text, that are limited to a day.

## F30 — the Explore tab is a computed-metric DAG with user segmentation, and its breakdown is degenerate on cohort metrics (2026-09-11)

The dashboard's **Explore** page does not use the flat
`/metrics/resource` endpoint the grabber pulls. It posts to

    POST https://apis.roblox.com/analytics-query-gateway/v1/dag/execute

a **computed-metric DAG** — query nodes feeding arithmetic nodes feeding output
nodes — and it accepts a family of **user-segmentation breakdowns we do not
currently pull at all**. None of this is in `default-plan.ts`.

### The shape, as captured (not invented)

```json
{ "graph": { "id": "computed_metric_computed_A", "name": "Computed Metric DAG",
    "nodes": [
      { "id": "query_A", "type": "NODE_TYPE_QUERY",
        "queryConfig": { "metric": "DailyActiveUsers",
          "filters":        [{ "dimension": "IsNewUser", "values": ["New"] }],
          "breakdownSpecs": [{ "dimensionBreakdown": { "dimension": "UserSegmentationEngagementLevel" } }] } },
      { "id": "output_main", "type": "NODE_TYPE_OUTPUT",
        "outputConfig": { "input": "query_A", "alias": "computed_A" } } ] },
  "context": { "resourceType": "RESOURCE_TYPE_UNIVERSE", "resourceId": "<id>",
    "granularity": "METRIC_GRANULARITY_ONE_DAY",
    "startTime": "...", "endTime": "..." } }
```

**Polling is re-POSTing the identical body.** It answers `{pending:true,
operationId}` and the `operationId` is **content-addressed** — 21 identical
requests in one capture all returned `dag-8a9c25eb60e9…`. There is no separate
poll URL; `analytics-it-service/v1/watermarks/encode` is a telemetry watermark
and polls nothing. Same async discipline as F22/F23: **an empty or pending
answer is a measurement of the poll, not of the game.**

First call in a session often 403s `XSRF token invalid`; the token comes back on
the 403's `x-csrf-token` response header and the retry succeeds.

### Vocabulary, read out of the dashboard's own JS bundle

Not guessed — extracted from the shipped chunks by `probe-dag2.ts`:

- `NODE_TYPE_`: QUERY, OUTPUT, ROLLING_WINDOW, CONSTANT, ADD, SUBTRACT,
  MULTIPLY, DIVIDE, POWER, LOG, PERCENTILE, SERIES_AVG, SERIES_MAX, SERIES_MIN,
  SERIES_SUM, ERR, POISONED, INVALID
- `WINDOW_REDUCER_`: AVG, SUM, MIN, MAX, FIRST, LAST, COUNT
- `WINDOW_AVG_MODE_`: WINDOW_SIZE, ACTUAL_COUNT
- `RANK_DIRECTION_`: TOP, BOTTOM
- `FILTER_OPERATION_`: EQUALS, NOT_EQUAL, CONTAINS, NOT_CONTAINS, GT, GTE, LT,
  LTE, MATCH
- `UserSegmentation*` dimensions (8): `AccountAge`, `AcquisitionSource`,
  `ActivationStatus`, `EngagementLevel`, `PayerStatus`,
  `PlatformActivationStatus`, `PlatformSpenderStatus`, `ReturnStatus`

So the engine does server-side arithmetic across metrics, server-side rolling
windows (the `L7Average*` metrics are this), and a server-side **top-N ranker**
(`rank: {direction, n, orderByMetric, orderFilters}`, plus
`excludeOtherSeries`), which we currently do client-side after pulling every
series.

`FILTER_OPERATION_EQUALS` is legal **here**. It is rejected on the Open Cloud
`analytics-query-api` (see the Open Cloud section of `CLAUDE.md`) — the two
surfaces do not share a filter enum, so do not carry one's rule to the other.

### The trap: the segmentation breakdown is degenerate on cohort metrics

Measured on 10638354731, `UserSegmentationEngagementLevel`, window 08-25→09-10,
newest shared day. A volume's segments must SUM to the total; a rate's must
WEIGHT-AVERAGE back to it, weighted by its own denominator:

| metric | kind | total | reconciled | ratio | |
|---|---|---|---|---|---|
| `DailyActiveUsers` | volume | 45,775 | 45,731 | 0.9990 | ok |
| `PayingUsers` | volume | 687 | 687 | 1.0000 | ok |
| `DailyRevenue` | volume | 103,370 | 103,370 | 1.0000 | ok |
| `TotalPlayTimeHours` | volume | 14,341.9 | 14,341.9 | 1.0000 | ok |
| `AverageRevenuePerUser` | rate | 2.30305 | 2.30230 | 0.9997 | ok |
| `PayingUsersCVR` | rate | 0.0153061 | 0.0152121 | 0.9939 | ok |
| `AverageSessionLengthMinutes` | rate | 15.0345 | 14.8375 | 0.9869 | ok |
| `AveragePlayTimeMinutesPerDAU` | rate | 18.7987 | 18.8168 | 1.0010 | ok |
| `AverageRevenuePerPayingUser` | rate | 150.466 | 150.466 | 1.0000 | ok |
| **`ForwardD1Retention`** | rate | 0.101059 | 0.264004 | **2.6124** | **BROKEN** |
| **`ForwardD7Retention`** | rate | 0.00822513 | 0.285454 | **34.7051** | **BROKEN** |
| **`DauMauStickiness`** | rate | 0.0134935 | 0.0147099 | **1.0901** | **BROKEN** |

A second dimension was then measured, and it **narrows the claim**.
Same metrics, same window, `UserSegmentationPayerStatus`:

| metric | total | reconciled | ratio |
|---|---|---|---|
| every volume | — | — | 1.0000–1.0010 |
| every non-cohort rate | — | — | 0.9979–1.0000 |
| `ForwardD1Retention` | 0.101059 | 0.107223 | 1.0610 |
| `ForwardD7Retention` | 0.00822513 | 0.00901582 | 1.0961 |
| `DauMauStickiness` | 0.0134935 | 0.0137876 | 1.0218 |

Under `PayerStatus` the retention segments are **not degenerate** — they are
plausible and correctly ordered (`NeverPayer` 9.8%, `ActiveLowPayer` 28.9%,
`ActiveMediumPayer` 37.2%, `ActiveHighPayer` 31.7%; D7 runs 0.76% → 10.2%).
Payers retaining ~3x better than never-payers is a real and useful reading.

So the honest split is:

- **Volumes: exact** on both dimensions. Usable.
- **Non-cohort rates** (ARPU, ARPPU, `PayingUsersCVR`, session length,
  playtime/DAU): reconcile within 1.5% on both. Usable.
- **`Forward*Retention` under `EngagementLevel`: degenerate and unusable.**
  This one is certain — it returns a literal **Medium 1, Low 0, High 0** on
  every day of the window (D7: Medium 1, High 1, Low 0.0024). The likely
  mechanism is circularity: `EngagementLevel` is "days played in the last 7",
  which is very nearly the same measurement as "did they come back", so the
  join is ill-defined.
- **`Forward*Retention` under `PayerStatus`: NOT settled either way.** It
  reconciles 6–10% high, but **the weighting in that test is approximate** — a
  retention rate’s denominator is its cohort (the users eligible to return),
  not that day’s DAU, and DAU is what was used. The residual may be the test
  rather than the data. **Do not quote a segmented retention number until it is
  reconciled against the true cohort denominator.**
- **`DauMauStickiness` is unresolved and is the dangerous one:** 9.0% out under
  `EngagementLevel`, 2.2% under `PayerStatus`, with individually plausible and
  correctly ordered segments in both. It would pass any eyeball check.

Charted without reconciliation, the `EngagementLevel` retention series reads as
"high-engagement players have 0% D1 retention" — a well-formed, entirely false
finding of exactly the kind the `totalSeries()` rule and G9 exist to prevent.

**The other six `UserSegmentation*` dimensions are UNTESTED.** Two of eight were
measured. Do not assume the remaining six behave like either one.

### Rules this sets

1. **Never publish a segmented series without reconciling it first** — sum for a
   volume, denominator-weighted average for a rate. `probe-dag3.ts` is the
   implementation; a 2% band is the bar it uses.
2. **Never reconcile a rate with a sum.** Doing so declares every healthy rate
   broken; it was done once during this investigation and produced the wrong
   call on ARPU, CVR and session length before the test was fixed.
3. `RAQI_RESERVED_DIMENSION_VALUES_UNKNOWN` is a real returned segment (small,
   and wild on rates — ARPU 36.40 against a 2.30 total). An `Inactive` segment
   is also offered and returns null. Neither is a game fact; keep both out of a
   chart and inside the reconciliation.
4. **A reconciliation is only as good as its denominator.** Weighting a
   retention rate by DAU is an approximation — the true weight is the cohort
   eligible to return. A 2–10% residual under a *correct-looking* segmentation
   may be the test, not the data; say so rather than calling it a defect.
5. **Six of the eight `UserSegmentation*` dimensions have never been measured.**
   `EngagementLevel` and `PayerStatus` behave differently from each other on the
   same metrics, so there is no basis for generalising to the other six.
   Reconcile each one before its first use.

### Still open

- The six untested dimensions above.
- Whether the arithmetic nodes (`NODE_TYPE_DIVIDE` etc.) let a *correct*
  segmented rate be computed server-side — e.g. segment-level `DailyRevenue`
  divided by segment-level `DailyActiveUsers` — which would sidestep whatever
  makes the served rate disagree. Not attempted.
- `dag/execute` is not in `default-plan.ts` and nothing grabs it on a schedule.
- Repro: `web/scripts/probe-explore.ts` (page recon + traffic),
  `probe-dag2.ts` (bundle enum extraction), `probe-dag3.ts` (the
  reconciliation; `--dim <UserSegmentation*>` selects the dimension).

## F31 — `status-config` is Roblox telling us which of its own metrics are untrustworthy, and we do not read it (2026-09-11)

    GET https://apis.roblox.com/analytics-query-gateway/v1/status-config

An unauthenticated, unparameterised GET the Explore page makes on load. It
returns `bannerConfigurations`, `chartWarningConfigurations` and
`annotationConfigurations` — the last being **a list of metrics Roblox itself
flags as affected, with a date window**. Captured 2026-09-11:

| key | window | targets |
|---|---|---|
| `GenericDataIssue` | **2026-09-08 22:00 → 09-09 03:00** | `PeakConcurrentPlayers`, `AlertIncidentCount`, all 4 `ClientFps*`, all 8 `ClientMemoryUsage*` (14 metrics) |
| `ErrorReportClean20260810` | 2026-08-10 23:00 → open | `ErrorCount` (dim `LogSource`) |
| `OOMBotTrafficExcluded20260824` | 2026-08-24 21:00 → open | `OomUnexpectedExits` |
| `QPlays202512` | 2025-12-10 → open | `RFYQualifiedPTR`, `RFYL7IntentionalCoplayDays`, `L7AverageRFYQualifiedPTR` |
| `AgeGroupUpdate20251020` / `AgeCheck20260107` | 2025-10-20 / 2026-01-07 → open | **54 metrics** each (dim `AgeGroupV2`) incl. `DailyActiveUsers`, `DailyRevenue`, `ForwardD1Retention`, `AverageRevenuePerUser`, `PayingUsersCVR`, `Visits` |
| `AgeGroupUpdate20260116` / `AgeCheck20260415` | 2026-01-16 / 2026-04-15 → open | 20 metrics each (dim `AgeGroup`) incl. every `CustomEvent*`, every `Economy*`, the realtime funnel metrics |

**Why this matters more than it looks.**

1. The `GenericDataIssue` window is **vendor confirmation of F28** — the
   2026-09-08 client-perf collapse that hit all five games. F28 reasoned to
   "instrument fault, not five incidents" from the cross-game pattern; this is
   Roblox saying so directly, and it names `PeakConcurrentPlayers` too.
2. `ErrorReportClean20260810` means **`ErrorCount` changed definition on
   2026-08-10 and the change is still open.** Any error comparison spanning that
   date is comparing two different measurements.
3. The age-group entries mark definitional changes across **54 headline
   metrics** — DAU, revenue, retention, CVR. Long-window comparisons cross them.

This is a cheap, per-request-free way to know when NOT to trust a number, and it
is currently unread. It should be fetched on every grab and written to
`data/games/<id>/data-quality.md` alongside our own revision log.

**Caveat, and it is load-bearing: the response captured here carried no
universe scope.** It appears global rather than per-game, and it was read on one
universe only. Confirm it varies (or does not) across universes before
attributing a window to a specific game.

## F32 — a corpus file is a RANGE aggregate, not a daily point, and the verify gate now fails on it (2026-09-11)

`data/verify/9610561918/Unique users with plays, Source, 2026-06-12T00-00-00.000Z.csv`
carries a header that reads like a single day:

    Date,2026-06-12T00:00:00.000Z
    Source,Series,Unique users with plays
    Home Recommendation,Unique users with plays,1809344
    Friends,Unique users with plays,443796
    Other,...,355888   Sponsored Ads,...,134292   Search,...,76832

**It is not a day.** Its five sources sum to **2,820,152**, against a headline
`UniqueUsersWithPlaySessions` of **86,589** and `DailyActiveUsers` of **86,043**
for 2026-06-12 — **32.6×** the number of people who played that day. A day's
unique users cannot exceed that day's DAU. It is the dashboard's Source panel
exported over a **range ending** 06-12, and the per-file header records only the
range's end.

**Why it surfaced today and not before.** The check used to **SKIP** with
"breakdown not pulled" — the corpus held no `AcquisitionSource` breakdown for
this metric. The 2026-09-11 grab of 9610561918 populated it, so the check began
running and now reports three cells as failures. The gate moved
**24 pass · 2 fail · 7 skip → 24 pass · 3 fail · 6 skip**, still exiting 1.

**No number regressed.** Our daily values for 06-12 are present and coherent
(Home 20,229, Friends 5,343, Search 1,410). The comparison is between two
different quantities.

**Two separate defects are stacked here, and only the first explains the FAIL:**

1. **The corpus file is a range aggregate compared against a daily point.** No
   grab can make this pass; the file would have to be re-exported per-day, or
   the verifier taught that a `<metric>, <dimension>, <single-date>.csv` with no
   range in its name is a range total.
2. **Our breakdown for that day is genuinely incomplete** — the five sources we
   hold sum to **31,173**, only **36%** of the 86,589 headline. That is a real
   coverage gap in the `AcquisitionSource` breakdown for June, worth its own
   look, but it is not what the verifier is reporting.

**Also wrong: the failure message.** It prints `we hold nothing (in held window)`
for cells we *do* hold. Whatever lookup it performs is not finding the series it
then declares absent — the label spellings differ between the CSV
(`Home Recommendation`) and our series key (`HomeRecommendation`). Fix the message
before trusting it on any other file; "we hold nothing" currently cannot be
distinguished from "we hold a different value".

**Added to `KNOWN_OPEN`** (`verify-harness.test.ts`), which is the mechanism the
repo already uses for a documented-open disagreement — the other two fails live
there. It was briefly left out on the reasoning that adding it "redefines a
gate"; that was wrong, and the cost was a red `npm test`, which is the one gate
meant to be binary. The entry silences **only the range-vs-daily comparison**;
the 36%-coverage defect above is recorded here and is not silenced by it.

Gate state after this finding: **verify 24 / 3 / 6 exit 1** (all three documented),
**audit-plan 180 / 0 exit 0**, **npm test 51 / 51 exit 0**.

## F33 — `byBreakdown()` had no filter guard and returned a population SLICE as the breakdown (2026-09-11)

`daily()` in `tools/lib.js` enforces the headline rule through `isHeadline()`: a
`Place` filter still counts as the whole, a population filter (`IsNewUser`,
`Platform`, `AgeGroup`) does not. **`byBreakdown()` enforced nothing.** It
selected on granularity and on the breakdown dimension only, so any
population-filtered series matching those two was returned as if it were the
whole population.

**Measured.** `UniqueUsersWithPlaySessions` broken down by `AcquisitionSource` at
`ONE_DAY` exists on 9963622286 in exactly one form — `filters=IsNewUser:["New"]`.
There is no unfiltered daily variant. So the unguarded helper returned the
**new-user slice** and it read as catastrophic under-coverage:

| game | sum(sources) / headline |
|---|---|
| Brainrot | **16.6% – 27.2%** |
| Monkey | 42.2% – 63.7% |
| Seal | 49.9% – 93.5% |
| Knife Farm | 19.4% – 58.5% |

Those are not coverage gaps. They are **the new-user share of the population**,
correctly served, wrongly read — the slice-as-total error that `CLAUDE.md` calls
the single most damaging this pipeline has made, reproduced in a helper written
to avoid it.

**Fixed.** `byBreakdown()` now takes the same view as `isHeadline()`: a breakdown
series qualifies only if every filter is on `Place` or on the dimension being
broken down. `{allowSlice:true}` opts back in deliberately. After the fix the
call returns `null` for that metric — correct, because no whole-population daily
variant exists — and `allowSlice` still returns the 7 new-user series.

**The diagnosis of 2026-09-11 was checked against this and is unaffected.** It
used `ForwardD1Retention` and `DailyActiveUsers` by `AcquisitionSource`; both
carry **zero** population-filtered ONE_DAY series on all five games, and the
splits are byte-identical before and after the fix.

**The standing lesson:** the rule was written down, implemented once, and then
not applied to the second reader of the same data. Any new accessor over
`series.json` must state which of headline / slice it returns.

## F34 — the dashboard's acquisition table is a CUMULATIVE NEW-USER funnel, and it carries five columns and three sources we never pull (2026-09-11)

Ren supplied a screenshot of the table this repo has been comparing against. Its
title is the whole finding: **"New Users Funnel (cumulative)"**, Become a
Brainrot, 56-day window.

| Source | Users with plays | Conversion | D7 ret. | 7D playtime/user | 30D payer conv. | 30D revenue/user |
|---|---|---|---|---|---|---|
| **Total** | 5,052,026 | 7.36% | 2.43% | 29.3 min | 0.72% | R$0.57 |
| Home Recommendation | 3,158,844 | 6.01% | 2.49% | 28.7 min | 0.63% | 0.42 |
| **Friends** | 1,029,280 | **36.39%** | 2.46% | 33.4 min | **1.06%** | 0.979 |
| Other | 672,263 | 1.74% | 2.01% | 24.2 min | 0.65% | 0.611 |
| Search | 202,026 | 2.17% | **2.86%** | **36.3 min** | 1.05% | **1.05** |
| Charts | 1,564 | 0.44% | 2.18% | 37.8 min | 0.39% | 1.62 |
| Teleport | 845 | n/a | 0.78% | 6.3 min | 0.39% | 0.0548 |
| Sponsored Ads / Portal Ads / Featured by Roblox | 0 | — | — | — | — | — |

**It confirms F32 directly.** "Cumulative" is why
`Unique users with plays, Source, 2026-06-12…csv` holds 2,820,152 against an
86,589 DAU — it is this table exported, a running total, not a day.

**It also explains F33 from the other side.** "New Users" is why
`UniqueUsersWithPlaySessions × AcquisitionSource` exists only as
`IsNewUser=New`: that series **is** the daily version of this table. It was never
incomplete.

**What we do not pull and should.** Three sources absent from our dimension
values entirely — **Teleport, Portal Ads, Featured by Roblox** — and five
per-source columns: conversion rate, D7 retention, 7-day playtime per user, 30-day
payer conversion, 30-day revenue per user.

**The number worth acting on:** `Friends` converts at **36.39%** against
HomeRecommendation's **6.01%** — six times — on 20% of new-user volume, and it
carries the best 30-day payer conversion (1.06%). `Search` is the best on D7
(2.86%), playtime (36.3 min) and revenue per user (R$1.05) but is only 4% of
volume. This is a per-source quality ranking the grabber cannot currently
produce, and it bears directly on where acquisition effort is worth spending.

---

## F35 — `FunnelCohortCompletionRate` drifts upward for weeks, and the freeze policy bakes the drift into the series shape

Measured 2026-09-14 on 10638354731, from the revision log of that day's grab
(every frozen cell re-served in one query, so the comparison is same-source).

A funnel cohort keeps accumulating completions after its day ends. The frozen
corpus keeps the **first** read, which is taken 1–4 days later depending on when
we happened to grab — so **each day in the series is frozen at a different
maturity, and the day-to-day shape is partly a record of our grab schedule.**

The drift scales with **how late in the player's life the step sits**:

| Funnel / step | when the player reaches it | median drift, first read → today |
|---|---|---|
| `FUNNEL_TYPE_ONBOARDING` / DrivewaySealed | session 1 | **+1.9%** |
| `FUNNEL_TYPE_ONBOARDING` / ReachedDriveway | session 1 | +2.7% |
| `FUNNEL_TYPE_ONBOARDING` / Complete | session 1 | +3.2% |
| `Progression` / FirstUpgrade | session 1 | +5.2% |
| `FUNNEL_TYPE_ONBOARDING` / PouredOut | session 1 | +6.1% |
| `FUNNEL_TYPE_ONBOARDING` / FirstPass | session 1 | +7.6% |
| `Progression` / FirstRebirth | days | +24.3% |
| `Progression` / SecondArea | days | +27.0% |
| `MapReach 2` / EstateDistrict | days | +27.8% |
| `Progression` / TenJobs | days | +32.2% |
| `Progression` / FirstTruck | days | +43.5% |
| `MapReach 2` / RetailPark | days | **+138.1%** |
| `MapReach 2` / Airport | days | **+193.7%** |
| `MapReach 2` / ParkingGarage | days | **+300.0%** |

**Settlement is slow — days, not hours.** Remaining rise on the Progression deep
steps, by the age the cell was first read at: 1d **+29.0%**, 2d +28.4%,
3d +27.7%, 4d **+24.3%**. A cell four days old still has a quarter of its value
to come, so "wait two days" is not enough for these.

**Consequences.**
1. **Within-session steps are safe to quote at 1–2 days.** The 2026-09-11 report's
   Onboarding claims (`Complete` +6.0pp, `FirstPass` +3.4pp, `DrivewaySealed`
   +2.3pp, `PouredOut` +1.5pp) sit in the +1.9–7.6% band and are **not**
   contaminated — checked, they stand.
2. **Multi-day steps must never be quoted off the frozen series at all**, and a
   `MapReach` step least of all. The "Airport at 0.2% completion" figure carried
   in `reports/2026-09-11/seal.md` is a floor on an instrument that drifts +194%.
3. **The fix is a single fresh pull of the whole window**, not a frozen merge:
   one query today measures every day at a known, monotonic age. The freeze
   policy is right for settled point metrics and actively wrong here.

**Unexplained, and it is not the drift.** On 2026-09-11 every Seal Progression
step reads ~5× normal (TenJobs **96.78%** vs a ~19% baseline, FirstTruck 30.24%
vs ~7.6%) and 09-12 reads ~0.6× normal — adjacent days, both first-read in the
same query. No maturity model produces that pair: 09-11 is the **older** cell and
should read modestly higher, not 8× higher than 09-12. The same
09-11-up / 09-12-down oscillation appears on **all five** universes — including
10030829154, which published nothing that day — and reproduces on Open Cloud, so
it is in Roblox's data and not in our parser. Both cells are unreadable; re-read
once they are ~7 days old. Candidate (not established): all four publishing games
shipped mid-day UTC and Seal earliest at 11:10, and the distortion is ordered the
same way — but Waterslide bumped without a publish, so the candidate does not
cover the whole effect.

**Not yet encoded as a test.**

## F36 — one bad `ClientCpuTimeCategory` poisons the `ClientCpuTimeAvg` headline

Measured 2026-09-14 on 10638354731. `ClientCpuTimeAvg`'s headline equals the sum
of its five `ClientCpuTimeCategory` series. On 2026-09-13 the headline read
**52.35 ms** against ~4 ms either side; **49.02 ms of it is the `Scripts`
category alone**, whose own 21-day range is 0.48–3.57. Animation (0.63),
Miscellaneous (1.65), Networking (0.32) and Physics (0.72) were all flat.

**It is contradicted by every metric that would have to move with it.** Same day:
`ClientFpsAvg` 52.67, `ClientFpsP10` 43.65, memory 24.27%, `OomUnexpectedExits`
16, and `ClientCrashRate15m` **fell** to 0.416% — its best in the window. 49 ms
of script time per frame cannot coexist with a 19 ms frame budget being met at
the 10th percentile.

**Seal only.** Same day, `Scripts` on the other four universes: 10399712766 2.82,
9963622286 5.15, 10565445771 1.12, 10030829154 1.50 — all flat. So it is not a
platform-wide instrument day (contrast the rule in `CLAUDE.md` about a technical
metric collapsing on every unrelated universe at once).

**Read the categories before quoting the headline.** The pre/post table in
`tools/upd-read.js` reported `CpuAvg +515%` for this publish; the entire delta is
this one cell, and reporting it would have been a fabricated performance
regression. Because the metric is a **mean**, a small number of clients with
pathological script CPU can move it while `ClientFpsP10` — a percentile, and
robust — does not. That is a live alternative to "bad cell" and the two are not
separable with what we hold: no CPU percentile is served. Worth noting only that
the same game's error export carries 2 × 2,008 events of
`CoreGui.15904.Loadstring.loadstring` (injected executor scripts) first seen
2026-09-12 11:30 — a candidate, not a finding.

Reverted 09-14 (3.92). **Not yet encoded as a test.**

## F37 — `feedback.csv` is REWRITTEN from the latest grab, so a short grab truncates the review history (2026-09-19)

Measured 2026-09-19. A 09-03 → today browser grab wrote full-window reviews; a
trailing 09-16 → today grab nine minutes later (the F27 habit) then **replaced**
`data/games/<id>/feedback.csv` with only its own window:

| universe | rows after the long grab | after the trailing grab | merged history (all raw bundles) |
|---|---|---|---|
| 10565445771 Verity | 458 | 53 | 2,587 |
| 10638354731 Seal | 67 | 5 | 391 |
| 10030829154 Waterslide | 31 | 5 | 409 |

**Cause.** `exportToFiles()` in `web/src/lib/export-files.ts` writes
`feedbackCsv(r.feedback)` / `feedbackMd(r.feedback)` from the current parse only —
metrics merge into `series.json`, feedback does not. The reviews request is
windowed (`startTime`/`endTime` on the reviews URL), so the file holds whatever the
last grab's window was. Same shape for `place-versions.csv`, which is harmless only
because that call is not windowed.

**Nothing was lost** — every review is still in `data/raw/` (committed). Recovered
with `node tools/r0919/feedback-merge.js --mirror-only`, which unions every raw
bundle plus `data/live/feedback.json` on review id and rewrites the mirror in the
exporter's own format (strictly additive against git: +1,795 rows, 0 removed).
**The exporter itself is NOT fixed yet** — the next short grab truncates again.
Fix: merge with the existing file on review id (the CSV does not carry the id, so
key on `created_utc + comment + asset_version`, or add an `id` column). **Not yet
encoded as a test.**

## F38 — error-export filenames count CSV LINES, not signatures; every export is capped at 25 (2026-09-19)

`export-errors.ts` names a file `…_<n>rows.csv` from `csv.split("\n").length - 1`. The `Message` column
carries multi-line stack traces, so `errors_2026-09-19_0916_since-v1252_7d_2277rows.csv` is **25 signatures /
29 events**, not 2,277 rows. All 18 exports of 2026-09-19 held exactly 25 signatures (Seal since-v919: 5) —
the dashboard's cap. Parse the CSV before quoting a row count; the true counts are in
`data/exports/INDEX.md` (2026-09-19 section). The `First seen at` column is written in the downloader's
local time (CEST), not UTC. **Not fixed; not encoded as a test.**
