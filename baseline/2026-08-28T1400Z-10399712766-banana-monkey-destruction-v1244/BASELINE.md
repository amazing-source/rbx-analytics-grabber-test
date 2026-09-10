# Update baseline — [UPD] +1 Banana Monkey Destruction (`10399712766`)

**Update: v1244, published 2026-08-28 between 14:00 and 14:30 UTC.**
Single place `83256791430098`. Previous live build **v1241** (shipped 2026-08-21,
last errors in the 14:00 UTC bucket today — the handover is clean and visible).

| | |
|---|---|
| Baseline grab | 2026-08-28 **15:33:50–15:40:56 UTC**, Open Cloud, window 2026-07-31 → 2026-08-29 |
| Requests | 183 planned · 144 sent · **135 returned data** · 4 empty 200 · 5 failed · 39 not served by Open Cloud |
| Failures | **all 5 are inferred `PlaceVersion` breakdowns** on metrics that do not support that dimension (400, `optional: true`). **0 failures on observed/proven shapes** |
| Baseline frozen at | **2026-08-27** — the last day that closed before the publish |
| Gates at grab time | `npm test` 44/44 · `npm run audit-plan` 140 templates, 0 failures · `npm run verify` 23 pass / 2 fail / 8 skip (both fails the documented held ones) |

> **This is a T+0 baseline, not a pre-publish one.** The grab ran about an hour
> after the publish. It is still a valid freeze: every number quoted is from a UTC
> day that closed **before** 14:00 on 2026-08-28. Today is excluded everywhere,
> and today is not a baseline.

---

## Bottom line

- **This build ships into a game that has just stopped falling.** DAU bottomed at
  252,338 on 08-26 and rose to **269,321** on 08-27 — the first rise in a week —
  with peak concurrents (4,326 → 4,830 → **5,051**) and revenue (R$80,052 →
  86,925 → **90,905**) both up three days running. The w/w deltas still read
  −52%, because the week they are measured against was the fall.
- **Monetization per player is improving while reach shrinks, which is the good
  version of this shape.** ARPDAU **R$0.34, ▲23.1% w/w**; payer conversion
  **0.82%, ▲12.1%**; ARPPU R$40.99, ▲9.8%. D1 retention is flat at **13.94%**.
  The game is losing audience, not quality — so **v1244 is being judged against a
  recovering baseline, and a flat post-update reading is a bad result here, not a
  neutral one.**
- **Cannot be answered yet:** anything about the build. Errors and crashes first
  read **T+2h ≈ 16:15 UTC today**; DAU / revenue / session length on
  **2026-08-29**; D1 for the first fully post-update cohort on **2026-08-31**.

---

## All metrics before the update

Full table: **[`series/metric-table.md`](series/metric-table.md)** (54 metrics,
latest settled value and 7-day delta). Raw settled points:
**[`series/headline-daily.csv`](series/headline-daily.csv)** (2,429 rows, `ONE_DAY`
only, `FILLED_ZERO` and `partial` dropped). Corpus summary at grab time:
[`summary-at-grab.md`](summary-at-grab.md). Attempt log: [`grab-report.md`](grab-report.md).

| Rung | Metric | Kind | 2026-08-27 | Δ7d |
|---|---|---|---|---|
| Discovery | Impressions (unique users) | volume | 4.95M | ▼ 46.3% |
| Discovery | End-to-End Conversion | rate | 4.86% | ▼ 10.6% |
| Discovery | RFY Play Days (L7) | rate | 1.30 | ▼ 2.8% |
| Discovery | RFY Qualified PTR | rate | 1.52% | ▼ 2.8% |
| **Retention** | **Day 1 Retention** | rate | **13.94%** (08-26) | ▼ 2.0% |
| Retention | Day 1 Retention (7-day avg) | rate | 13.70% (08-26) | ▼ 1.5% |
| Retention | Day 7 Retention | rate | 0.88% (08-20) | ▼ 32.0% |
| Retention | Stickiness (DAU/MAU) | rate | 2.16% | ▼ 57.1% |
| **Monetization** | **ARPDAU** | rate | **R$ 0.34** | **▲ 23.1%** |
| Monetization | ARPPU | rate | R$ 40.99 | ▲ 9.8% |
| Monetization | Payer Conversion | rate | **0.82%** | ▲ 12.1% |
| Monetization | Daily Revenue | volume | R$ 90,905 | ▼ 40.7% |
| Monetization | Paying Users | volume | 2,218 | ▼ 46.0% |
| Engagement | Avg Session Length | rate | 14.66 min | ▼ 2.6% |
| Engagement | Playtime per Player | rate | 19.11 min | ▼ 4.2% |
| Engagement | Daily Active Users | volume | 269,321 | ▼ 51.8% |
| Engagement | Peak Concurrent | volume | 5,051 | ▼ 54.5% |
| Performance | Crash Rate (15m) | rate | **0.68%** | ▲ 3.4% |
| Performance | Avg FPS / FPS p10 | rate | 42.92 / 31.22 | ▲ 3.2% / ▲ 3.7% |
| Performance | Client CPU Time | rate | 15.37 | ▼ 2.8% |
| Performance | Crash Count | volume | 1,856 | ▼ 48.9% |
| Performance | Out-of-Memory Exits | volume | 263 | ▼ 59.5% |
| Performance | Script Errors | volume | 2.36M | ▼ 49.0% |

**The technical rung is in good shape and is not the story here.** Crash rate
**0.68%** — for scale, Become a Brainrot sits at 2.46%, 3.6× higher. FPS is up,
OOM exits down 59.5%, errors down 49%. Nothing in the performance table needs
acting on; it needs *protecting*.

**Stickiness is the one number not to over-read.** DAU/MAU fell 57.1% because MAU
*rose* 12.3% while DAU halved — a 30-day denominator still carrying the big
early-August days against a much smaller today. It is arithmetic, not a new fault.

---

## Daily series, last 12 settled days

| Date | DAU | PCU | Revenue R$ | Payers | ARPDAU | Errors | Crashes | OOM | D1 |
|---|---|---|---|---|---|---|---|---|---|
| 08-16 | 541,904 | 9,155 | 171,917 | 3,396 | 0.317 | 4.63M | 2,993 | 586 | 12.3% |
| 08-17 | 635,770 | 11,734 | 118,391 | 3,825 | 0.186 | 5.15M | 3,400 | 743 | 13.0% |
| 08-18 | 598,087 | 10,506 | 135,558 | 3,824 | 0.227 | 4.92M | 3,636 | 723 | 13.8% |
| 08-19 | 707,978 | 12,256 | 166,855 | 5,203 | 0.236 | 6.03M | 4,302 | 925 | 14.2% |
| 08-20 | 558,858 | 11,112 | 153,208 | 4,105 | 0.274 | 4.63M | 3,635 | 649 | 15.1% |
| 08-21 | 445,411 | 13,532 | 119,548 | 3,303 | 0.268 | 3.87M | 3,383 | 597 | 14.9% |
| 08-22 | 555,779 | 10,095 | 193,420 | 4,663 | 0.348 | 5.21M | 4,317 | 645 | 13.2% |
| 08-23 | 415,214 | 7,022 | 144,901 | 3,358 | 0.349 | 3.71M | 2,591 | 476 | 11.2% |
| 08-24 | 310,132 | 5,932 | 114,658 | 2,281 | 0.370 | 2.90M | 2,017 | 382 | 13.9% |
| 08-25 | 264,510 | 4,326 | 80,052 | 1,974 | 0.303 | 2.53M | 1,854 | 334 | 13.8% |
| 08-26 | 252,338 | 4,830 | 86,925 | 2,096 | 0.344 | 2.16M | 2,062 | 299 | 13.9% |
| **08-27** | **269,321** | **5,051** | **90,905** | **2,218** | **0.338** | **2.36M** | **1,856** | **263** | — |

The turn on 08-26 → 08-27 is visible in DAU, PCU, revenue and payers together.
Four independent series moving the same way on the same day is a real inflection,
not noise — and it is the thing v1244 could either extend or kill.

---

## Concurrents today, before and around the publish

`ccu-baseline`, matched half-hour slots 00:00–15:30 UTC against 26 complete prior
days — full output in [`ccu-baseline-2026-08-28.txt`](ccu-baseline-2026-08-28.txt):

| baseline | n | base CCU | today vs base |
|---|---|---|---|
| same weekday (Fri) | 3 | 9,170 | −63.8% |
| last 7 days | 7 | 5,265 | **−37.0%** |
| last 14 days | 14 | 6,729 | −50.7% |
| all 26 days | 26 | 8,909 | −62.8% |

Today's mean over elapsed slots is **3,318**, ranking 27 of 27. **Read that with
care:** the publish landed at 14:00 UTC and cycled every server, so the last three
slots of this window contain the restart dip. The comparison to make tomorrow is
today's own pre-14:00 slope, not this rank.

**The per-slot profile does not look like an in-game break.** The deficit runs
−60% at 00:00, narrows steadily to −44% by 09:00, then widens again to −55% by
15:30. A break inside the game costs the same share of players in *every* slot; a
deficit that moves with the clock is an exposure effect. Combined with impressions
−46.3%, this reads as discovery, not defect — and the whole public board is
**up 7.5%** since 08-25 (8,101,577 CCU across 275 games, snapshot
`data/platform/ccu-2026-08-28T15-31-25Z.json`), so it is not the platform shrinking.

---

## Funnel before the update

Three instrumented steps, pulled with the async-polling shape and no `FunnelName`
filter — full table and method in [`funnels-pre-update.md`](funnels-pre-update.md).

| # | Step | Users | Step-to-step | Cumulative, 7d mean |
|---|---|---|---|---|
| 1 | `Joined` | 4,341,504 | 100.00% | 100.0% |
| 2 | `Punched` | 4,187,308 | 96.45% | **96.1%** |
| 3 | `Collected a Banana` | 4,149,996 | 99.11% | **95.2%** |

**The two rate columns are different measurements.** *Step-to-step* is
`FunnelUserStepCompletionRate` — the share of the previous step's players who
reached this one, so step 3's 99.11% means almost everyone who punches then
collects. *Cumulative* is `FunnelCohortCompletionRate` at `OneDay`, measured from
step 1, and it is the column the tripwires are set on.

This funnel is healthy and very stable — day-to-day spread is under 1 pp across
the whole week, which makes it an unusually sharp tripwire. **96.1% and 95.2% are
the numbers to check on 08-29.** The flip side: it only covers the first ~30
seconds of play. It cannot see a mid-game or economy break, so a clean funnel is
not a clean build.

---

## Tripwires — pre-registered, before the post-update read

| # | Signal | Pre-update value (08-27) | Broken if | First readable |
|---|---|---|---|---|
| 1 | `ErrorCount` / day | **2.36M** (falling: 2.16–2.53M for 3 days) | > 4.5M on a full day after 08-29. Deploy-day spike expected and excluded | 08-29 |
| 2 | `ErrorCount` / half hour | v1241 ran 3.68M over 77 buckets ≈ 48K/bucket | still > 2× the 08-27 same-slot value 24 h after the publish | T+2h, judged 08-29 |
| 3 | New `MessageHash` on v1244 | n/a | **any** signature with real volume first-seen on v1244 | T+2h |
| 4 | `ClientCrashCount` | 1,856 | > 2,700 (1.45×) on a full day at flat DAU | 08-29 |
| 5 | `ClientCrashRate15m` | **0.68%** (band 0.6–0.8%) | **> 0.95%** (1.4× baseline) | 08-29 |
| 6 | `OomUnexpectedExits` | 263 | > 400 per day at flat-or-lower DAU | 08-29 |
| 7 | `ClientFpsP10` / `ClientFpsAvg` | 31.22 / 42.92 | p10 < 27 | 08-29 |
| 8 | `ClientMemoryUsagePercentageAvg` | 22.87% | > 27% | 08-29 |
| 9 | `AverageSessionLengthMinutes` | **14.66 min** (stable 14–15 all window) | **< 13.2 min** for 2 settled days | 08-29 |
| 10 | `ForwardD1Retention` | **13.94%** (7-day avg 13.70%) | **< 12.3%** for 2 settled days | 08-31 |
| 11 | `AverageRevenuePerUser` (ARPDAU) | **R$ 0.338** — *rising* | **< R$ 0.30**, i.e. the three-day improvement is given back | 08-29 |
| 12 | `PayingUsersCVR` | **0.82%** — *rising* | < 0.72% for 2 settled days | 08-29 |
| 13 | **DAU / PCU recovery holds** | DAU 269,321 · PCU 5,051, both up 3 days | **DAU below 250,000 on 08-29** — the turn reversing is the single most expensive outcome here | 08-29 |
| 14 | Funnel `Punched` | **96.1%** 7d mean | < 91.1% (−5 pp) on a settled day | 08-29 |
| 15 | Funnel `Collected a Banana` | **95.2%** 7d mean | < 90.2% (−5 pp) on a settled day | 08-29 |
| 16 | `ServerCrashCount` | 3 (08-24) | any day > 50 | T+2h |
| 17 | Downvote rate | Feedback Votes 725/day (08-27) | downvote share above v1241's | 08-29 (needs a dashboard export) |

**Tripwire 13 is the one that matters most on this game.** Every other row asks
"did the build break something". This one asks "did the build kill a recovery that
was already underway", which is the actual risk given where the numbers sit.

---

## Four things that will look like breakage tomorrow and are not

1. **The publish-path server-error spike.** A deploy day spikes server
   `ErrorCount` 20–50× and settles within 24 h. Only a finding if still elevated
   on 08-29.
2. **The restart dip in concurrents** at 14:00–15:00 UTC today, as v1244 cycled
   every server.
3. **Today's partial day and partial half-hour.** Drop the final `HalfHour`
   bucket always — PCU duplicates its previous value into it (F19).
4. **Version adoption.** v1244's error count climbs for 1–3 h as servers cycle.
   Rate per player, not raw count.

---

## Errors — volumes only, and why there is no text

`ErrorCount` on 08-27 was **2,364,483** events. v1241 carried 21,431,046 over its
8 days; v1244 shows **90,777 across its first 4 half-hour buckets** — the adoption
ramp, not a signal yet.

**We have no message text for this game at all.** The `MessageHash` dimension
lookup 500s, Open Cloud serves no text, and the only error export ever filed for
this universe is a *feedback* export — `data/exports/10399712766-banana-monkey-destruction/`
holds `feedback/feedback_2026-08-21_1530_jul26-aug15.csv` and **no `errors/`
folder at all.**

**Action, and it needs you:** export *Errors and warnings by count* for this game
at T+2h, filtered to v1244. It is the only way tripwire 3 can be evaluated, and
this game has never had one filed. Leave it in Downloads and I will file it to
`data/exports/10399712766-banana-monkey-destruction/errors/`.

Signature volumes as captured: [`../../data/games/10399712766/errors.md`](../../data/games/10399712766/errors.md).

---

## Watchlist with dates

| When | What | Why |
|---|---|---|
| **Today ~16:15 UTC (T+2h)** | Error/crash grab at half-hour resolution; dashboard error export filtered to v1244 | The only honest questions at T+2h: is it throwing, is it crashing |
| **2026-08-29** | Full grab after the UTC day rolls | First real read — and the recovery test (tripwire 13) |
| **2026-08-31** | D1 for the 08-29 cohort | First fully-v1244 cohort, settled |
| **2026-09-04** | D7 for the 08-28 cohort | Repeat-play test |

## Questions for the studio

1. **What shipped in v1244?** Without a changelog every tripwire can only say
   "something moved", never "the thing we changed moved".
2. **Was v1244 aimed at the recovery** — a re-promotion, a content drop, an ad
   push? That changes which direction counts as success on 08-29.
3. **Is there a funnel beyond `Collected a Banana`?** Three steps cover the first
   half-minute. Instrumenting one mid-game step (first upgrade, first rebirth)
   would make the next update readable at a depth this one is not.
4. **The 12 Aug payer halving on this game is still unexplained** and predates
   this build — see `data/games/10399712766/`. If v1244 touched anything in the
   purchase path, say so, because that history makes the monetization tripwires
   harder to read.

---

## Post-update read — 2026-08-30 T+2d. The recovery resumed; one WATCH

Full Open Cloud re-grab 2026-08-30 16:07–16:14 UTC, window 08-03 → 08-31.
**132 of 144 requests returned data**; the single failure on an observed shape is
a poll HTTP 500 on `FunnelUserTotalCount`, not a fact about the game. Gates:
`npm test` 44/44 · `audit-plan` 140 templates, 0 failures · `verify` 23/2/8.

**v1244 is at 100% adoption** on 08-29 and 08-30 (2,148,528 / 1,823,618 events
against v1241 = 6 / 0). The grab report's `PlaceVersion` discovery list still
tops out at v1241 — that is a stale template value, not the live state.

### Tripwire 13 was the one that mattered, and it reads CLEAR

| date | DAU | PCU (matched slots) | ARPDAU | CVR | errors/CCU |
|---|---|---|---|---|---|
| 08-26 | 252,338 | 3,539 | 0.3445 | 0.83% | 302.0 |
| 08-27 (baseline) | 269,321 | 3,947 | 0.3375 | 0.82% | 336.9 |
| 08-28 (publish day) | **232,987** | 3,316 | **0.3648** | **0.90%** | 330.7 |
| **08-29** | **~287,700** *(projected)* | 3,740 | — | — | **270.4** |
| 08-30 (part day) | — | **4,882** | — | — | 278.3 |

**08-28's DAU of 232,987 is below the 250,000 tripwire, and it is not the
answer.** That day is 58% pre-update, and 08-29 — the first full day on v1244 —
projects to **287,732 ± 0.6%** from `UniqueUsersWithPlaySessions` (286,343 at a
ratio of 0.9950 ± 0.006). That is **above 08-27's 269,321**, i.e. a new
post-trough high, and matched-slot CCU has now risen three days running to
**4,882 — the highest since 08-23**. The recovery v1244 could have killed is
instead continuing.

### Tripwire status at T+2d

| # | Signal | Value | Status |
|---|---|---|---|
| 1 | ErrorCount / day | **2.15M** (08-29) | OK (ceiling 4.5M) |
| 2 | Errors per concurrent player | 336.9 → 330.7 → **270.4** → 278.3 | **OK** — −19.7% on the baseline |
| **3** | **New signature on v1244** | `>= 1244`: 30 → 128 → **1,308** | **WATCH — rising at 100% adoption** |
| 4 | ClientCrashCount | **1,886** (08-29) | OK (ceiling 2,700) |
| 5 | ClientCrashRate15m | **0.63%** (08-29) | OK (ceiling 0.95%), better than the 0.68% baseline |
| 6 | OomUnexpectedExits | **285** (08-29) | OK (ceiling 400) |
| 7 | ClientFpsP10 | **31.69** (08-29) | OK (floor 27) |
| 8 | Client memory % | **23.53%** (08-29) | OK (ceiling 27%) |
| 9 | Session length | **14.13** (08-28) | OK (floor 13.2) |
| 10 | ForwardD1Retention | 13.53% (08-27) | **NO DATA** until 08-31 |
| 11 | ARPDAU | **R$0.3648** (08-28), up from 0.3375 | **OK — still improving** |
| 12 | PayingUsersCVR | **0.90%** (08-28), up from 0.82% | **OK — still improving** |
| **13** | **DAU recovery holds** | **~287,700** projected for 08-29 | **CLEAR on the projection** |
| 14 | Funnel `Punched` | **96.0%** (08-29) vs 96.1% mean | OK |
| 15 | Funnel `Collected a Banana` | **95.2%** (08-29) vs 95.2% mean | OK |
| 16 | ServerCrashCount | 0 across 08-25…08-27, none since | OK (ceiling 50) |
| 17 | Downvote rate | votes 725 → 609 → **859**, net positive | **NO DATA** — needs the up/down split |

### The one thing to watch

**v1244-introduced errors are rising while adoption is flat at 100%**: 30 on the
publish day, 128 on 08-29, **1,308** on a part-day 08-30. Adoption completed on
08-29, so this is not the ramp. It is 0.07% of the day's 1.82M errors — far too
small to be a finding on volume — but the *shape* is the discriminator this
routine relies on: a deploy artefact decays, a live defect does not.

**This game still has no error export ever filed** — `data/exports/10399712766-banana-monkey-destruction/`
holds a `feedback/` folder and no `errors/` — so there is no message text and
tripwire 3 cannot be closed. **Export *Errors and warnings by count* filtered to
v1244** — one export closes it.

_Read 2026-08-30 ~17:00 UTC._
