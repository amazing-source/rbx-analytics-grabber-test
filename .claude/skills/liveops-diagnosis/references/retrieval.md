# Retrieval cookbook — the builder half of liveops-diagnosis

> **This is the mechanical half.** The *when* and *why* — the diagnostic ladder,
> the discrimination tests, the failure modes — live in `SKILL.md`. This file is
> the *how*: the exact query shapes that pull each metric out of Open Cloud
> without lying to you. Split out 2026-09-11 so the judgement in SKILL.md is not
> interleaved with query mechanics (the same orchestrator/builder split every
> serious analytics agent converges on). Cross-referenced from SKILL.md §1.

**Sections**
- [Pulling funnels](#pulling-funnels--read-this-before-saying-a-game-has-none-2026-08-26) — the async-polled, no-`FunnelName`-filter recipe; legal dimensions; denominators
- [Pulling CCU](#pulling-ccu--which-series-and-the-half-hour-accumulation-rule) — which series at which granularity, and why half-hour history accumulates
- [Funnel endpoint — failure modes and quotas](#funnel-endpoint--failure-modes-and-quotas) — the shifting empty-window bug, the one broken filter, the hard caps

## Pulling funnels — read this before saying a game has none (2026-08-26)

**This has now gone wrong on four separate games, always the same way, always
ending in "no funnels instrumented" about a game with a full Funnels page.**
The recipe below is measured against dashboard ground truth on `10638354731`
(4 funnels) and `10565445771` (9 funnels). Follow it exactly.

```
POST https://apis.roblox.com/analytics-query-api/v1/universes/{id}/metrics
x-api-key: <key>
{ "metric": "FunnelUserTotalCount",     // or any of the nine below
  "granularity": "None",                 // "OneDay" for the two Cohort metrics
  "startTime": ..., "endTime": ...,
  "breakdown": ["FunnelStep"],           // the ONLY legal breakdown
  "limit": 500 }
```

**The two things that make funnels look absent when they are not:**

1. **Funnel queries answer ASYNC — HTTP 202 / `done:false` + `path`. You must
   poll.** Poll `https://apis.roblox.com/analytics-query-api/{path}` (the
   `analytics-query-api/` prefix is part of it; `apis.roblox.com/{path}` alone
   404s into nothing). A probe that does not poll reads the 202 as an empty
   answer and reports zero series. **This is the single most common cause of a
   false "no funnels" finding.** `opencloud-grab.ts:208` has the correct loop —
   copy it, don't re-write it.
2. **NEVER send a `FunnelName` filter.** It is accepted and returns **0 series
   always — even for a name you can read off the dashboard tab.** Measured:
   `FunnelName In ["Onboarding"]` on a universe whose Onboarding funnel has
   1,140,668 users returned nothing, and so did a deliberately fake name. The
   filter is non-functional. Drop it and the same query returns every step.
   *Filters are not broken in general* — `Platform In ["Computer"]` and
   `IsNewUser In ["New"]` both filter correctly on the same metrics (Computer
   came back at ~33% of each step, matching its DAU share). `FunnelName` alone
   is the broken one.

**What is and is not legal**, enumerated by probing until the API named each:

| Dimension | On funnel metrics |
|---|---|
| `FunnelStep` | **the only breakdown that works** |
| `FunnelName` | filter-only, and the filter returns nothing — unusable |
| `Platform`, `IsNewUser` | filter-only, and they work |
| `FunnelId`, `FunnelSessionId`, `FunnelStepName`, `FunnelType`, `Place`, `AcquisitionSource`, `CohortDay`, `PlaceVersion` | *"not supported for metric …"* |

All nine funnel metrics answer at `granularity: "None"`:
`FunnelUserTotalCount`, `FunnelStepTotalCount`, `FunnelUserChurnRate`,
`FunnelUserStepCompletionRate`, `FunnelUserOverallCompletionRate`,
`FunnelCohortCompletionRate`, `FunnelCohortSessionCompletionRate`,
`FunnelStepChurnRate`, `FunnelStepCompletionRate`. Only
`FunnelCohortCompletionRate` and `FunnelCohortSessionCompletionRate` also answer
at `OneDay` — those two date a break. `FunnelUserTotalCount` 400s at `OneDay`
("Granularity OneDay is not supported").

**Two of these are rates with DIFFERENT denominators — never put them in one
column.** Measured 2026-08-28 on both `9963622286` and `10399712766`, and it is
easy to publish a table that silently mixes them:

- `FunnelUserStepCompletionRate` is **step-to-step**: the share of the *previous
  step's* players who reached this one. Verified arithmetically — Brainrot step 5
  users / step 4 users = 354,585 / 395,841 = **89.58%**, exactly the reported
  rate for step 5.
- `FunnelCohortCompletionRate` is **cumulative from step 1**, and it is the one
  served at `OneDay`, so it is the one any tripwire or dated break is set on.

On Banana Monkey the same step reads **99.11%** step-to-step and **95.2%**
cumulative. Both are correct; a reader shown them side by side without labels
concludes the instrument is broken. Label the denominator every time.

**THE CAVEAT THAT MATTERS MOST — steps are merged across every funnel by index.**
`FunnelStep` is an integer position with the name in `displayValue`, and with no
working `FunnelName` filter you get **the union over all funnels**, summed. Where
two funnels share an index, one label wins and the counts are a blend. Measured
on Seal A Driveway: index 1 came back `Neighbourhood` (from MapReach) while the
Onboarding funnel's own step 1 is `Started`, and the merged step-2 completion
read **66.65%** against the dashboard's Onboarding figure of **98.15%**.

So, without qualification:
- **Reliable from Open Cloud:** step names, per-step user volumes, and the daily
  trend per step. Shape and movement are sound.
- **NOT reliable:** any single funnel's completion rate. Never quote a merged
  rate as one funnel's. A game with one funnel is exempt; check the count first.
- **Funnel NAMES and per-funnel separation come from the dashboard Funnels page**
  (the tabs across the top) or the browser path's gateway `v1/dimensions` call.
  Read the tabs and write them into the report — they cost one screenshot and
  they tell you what the studio thought was worth instrumenting.

**`dimension-values` is a dead end — do not spend time on it.**
`POST /analytics-query-api/v1/universes/{id}/dimension-values` exists, accepts
`{metric, dimension, startTime, endTime}`, answers `200 {"values":[]}` for
**everything** including positive controls (`DailyActiveUsers`/`Platform` on a
universe whose Platform breakdowns we hold). The `FunnelName` error message
recommends it; the recommendation does not work.

**Funnel step values carry names — use them.** `FunnelStep` comes back as an
integer with a `displayValue` beside it (`4` → `Rebirth1`). "61% never reach
step 4" is a curiosity; "61% never reach their first rebirth" is a diagnosis.
If a label looks like a bare integer, the name is in `data/raw/` — see G9 in
`COVERAGE.md`.

**Funnels CAN be dated to a day — use `FunnelCohortCompletionRate`.** Corrected
2026-08-10. It is true that `FunnelUserChurnRate` / `FunnelUserStepCompletionRate`
`ONE_DAY · by FunnelStep` 400s, so those give **levels, not trends**. But
`FunnelCohortCompletionRate` and `FunnelCohortSessionCompletionRate` *are*
served at `ONE_DAY` per named step, and they carry the full history (94 days on
9963622286). That is the series that dates a funnel break. This file previously
said no funnel could be dated to a day, which would have made the 7 Aug deploy
effect on Become a Brainrot unmeasurable.

**Two traps on the NONE-granularity funnel series.** The date column is the
**window start**, not a day — a row stamped `2026-08-07` on a 7→10 Aug grab is
the aggregate over all four days. And moving the window changes the number with
no day changing: PlayerProgression `FunnelUserOverallCompletionRate` read 26.73%
from an 11 Jul window and 23.09% from a 7 Aug one. A producer comparing two
screenshots taken with different ranges will report a drop that did not happen.

**No funnels instrumented? Prove it with the recipe above first** — run
`breakdown:["FunnelStep"]`, polled, with no `FunnelName` filter, before you
believe it. Measured 2026-08-26 across the whole portfolio: Knife Farm really
does return **0 steps**, but Waterslide returns 15, Become a Brainrot 20, Banana
Monkey 3, Verity 9 funnels' worth and Seal 4. Only Knife Farm is genuinely
uninstrumented. **Then** use `TotalSessionsEndedInBucket`. Broken down by
`SessionTimeBucket` it gives the session-length distribution, which is the
closest substitute for "where do they quit" — and the <60s and 61–180s bands
are themselves official RFY bounce signals. *Knife Farm: median session ~10 min,
bounce under 60s only 7.6% → 8.7%, i.e. within-session engagement was never the
problem.* A stable bucket profile alongside collapsing D7 is strong evidence the
break is between sessions, not inside them.

## Pulling CCU — which series, and the half-hour accumulation rule

**Which CCU series to use, and this matters:**

| series | granularity | use for | trap |
|---|---|---|---|
| `PeakConcurrentPlayers` | `ONE_DAY` | nothing, alone | **F15** — it is a SUM of per-platform peaks and overstates. Never quote it for a day in progress |
| `ConcurrentPlayers` | `ONE_HOUR` | trends, diurnal shape | the clean series; ~1,000 points per game |
| `PeakConcurrentPlayers` | `HALF_HOUR` | incidents, intraday | see the accumulation rule below |
| dashboard CSV export | any | ground truth | cell-exact against our data; the only route to *today* |

**The half-hour "gimmick", resolved 2026-09-04.** Each individual GRAB returns
only about the last 24 hours at `HALF_HOUR` — the gateway clamps it regardless of
the window asked for. But the stored series MERGES across grabs, so half-hour
history accumulates with grab frequency. Measured: Brainrot holds **28 days** of
half-hour CCU (1,374 points, 2026-08-07 → 09-04) because it has been grabbed
often; Seal holds **5 days** because it was added recently. So it is not "only
the 1d window" — it is 1 day per grab, compounding. **Another reason to grab
daily.**

## Funnel endpoint — failure modes and quotas

**Two failure modes of the funnel endpoint itself, both measured 2026-08-23:**
it answers only *some* windows — of ten rolling windows requested, two returned
data and eight returned an empty series — and the set that works **changes
between calls**, so a window that answered twice can go quiet an hour later.
An empty funnel series is therefore never evidence about the game. Re-query
before concluding anything, and record the window that worked alongside the
number.

**Corrected 2026-08-26 — "filtering funnel metrics by `Platform` returns no
series at all" was wrong**, and it sent three later investigations down the
wrong path. `Platform In ["Computer"]` returns every step and genuinely narrows
the values (~33% of each, matching desktop's DAU share); `IsNewUser` filters
correctly too. The dimension that returns nothing is **`FunnelName`**, and only
that one. The original observation was almost certainly an unpolled 202 (see the
recipe at the top of §1) being read as an empty series.

**Quotas that silently cap what exists:** 10 funnels per experience, 100 steps
per funnel, 3 custom fields per event, and **8,000 unique custom-field value
combinations before the rest is bucketed as "Other"**. A funnel with a huge
"Other" segment has hit that ceiling — an instrumentation fact, not player
behaviour. Events stay visible **90 days** from last receipt, and the logging
budget is **120 + (20 x CCU) requests/minute**: a game that outgrows its event
budget starts dropping events, which looks exactly like a metric decline.
