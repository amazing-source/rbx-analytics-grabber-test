# COVERAGE — the 34 dashboard CSV exports vs what the grabber holds

Phase 1 (step 3) of `CORRECTNESS_PLAN.md`. Measured 2026-08-08 by diffing every
CSV cell against `data/games/9610561918/series.json` (tolerance: relative 1e-6).
Method: throwaway script in the session scratchpad — deliberately **not** the
Phase-2 harness, which must be built fresh in `web/scripts/verify-csv.ts` and
reproduce these numbers. Per the plan: **this table supersedes the defect table
in `CORRECTNESS_PLAN.md` where they disagree.**

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

## What this means for the phases

- Phase 2 (harness): everything needed is above — three formats, label map,
  aliases, unit scales, fraction encoding, `T00:00:00Z` join, F1's relocation.
  Expected baseline: 21 green files, row 13 red on 2 cells, rows 6/12/19/23/27/31
  red-by-absence until D5 lands.
- Phase 3: F2 makes "last-write-wins" part of the point-semantics work.
- Phase 5: F3, F4, F9, plus INVENTORY.md's gap table (the dashboard shapes we
  never ask for, including everything `HALF_HOUR`).
