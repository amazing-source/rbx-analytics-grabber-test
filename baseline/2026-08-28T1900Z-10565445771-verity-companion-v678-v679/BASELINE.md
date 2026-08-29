# Update baseline — Verity Companion [AI] (`10565445771`)

**Update: v678 → v679, published 2026-08-28 between 19:00 and 19:30 UTC.**
Single place `74542317333958`. Previous live build **v664** (shipped 2026-08-17,
still the dominant version through 08-27).

**Two publishes half an hour apart, and the deploy log settles which build is
live.** `ErrorCount` by `PlaceVersion` at half-hour resolution
([`deploy-log.md`](deploy-log.md)) shows **v678 first in the 19:00 bucket**
(2,151 → 17,232 at 19:30 → 6 → 9, then nothing) while **v679 appears at 19:30**
and is still accruing at the 10:30 bucket on 08-29 (31 buckets, 972,347 events).
v678 was superseded inside one half hour. Everything after 20:00 belongs to
**v679**, and v678's 19,400 events must be excluded from any post-update read —
they belong to a build nobody is running.

| | |
|---|---|
| Baseline grab | 2026-08-29 **10:50:57–10:56:52 UTC**, Open Cloud, window 2026-08-01 → 2026-08-30 |
| Requests | 128 requested · **107 returned data** · 16 empty 200 · 5 failed · 39 not served by Open Cloud |
| Failures | **all 5 are inferred `PlaceVersion` breakdowns** on metrics that do not support that dimension (400, `optional: true`). **0 failures on observed/proven shapes.** Nothing here is missing data about the game |
| Baseline frozen at | **2026-08-27** — the last day that closed before the publish |
| Gates at grab time | `npm test` **44/44** · `npm run audit-plan` **140 templates, 0 failures** · `npm run verify` **23 pass / 2 fail / 8 skip, exit 1** (both fails the documented `KNOWN_OPEN` pair) |

> **This is a T+15h baseline, not a pre-publish one.** The publish was reported
> late, so the grab ran the morning after. It is still a valid freeze: every
> number quoted as "before" comes from a UTC day that closed **before** 19:00 on
> 2026-08-28, so no post-update player is inside it. What it does *not* contain
> is a clean pre-publish partial-day shape.
>
> **2026-08-28 is 81% pre-update** (publish at 19:00 of a 24-hour day). It is
> shown throughout for continuity and is **never** used as a post-update
> measurement. The first UTC day that genuinely tests v679 is **2026-08-29**,
> which is still in progress — so the real read is **tomorrow**.

---

> **UPDATED 2026-08-29 ~14:20 UTC — tripwire 7 has FIRED.** A dashboard error
> export arrived after this baseline was written and it names a **live functional
> defect in the feature v679 shipped**. See
> **[Post-update read — T+18h](#post-update-read--2026-08-29-t18h-tripwire-7-fired)**
> at the end. The pre-update numbers below are unchanged and remain the reference.

## Bottom line

- **The Mystery Library event shipped in v679 and it is broken. Root cause
  confirmed from source 2026-08-29 — the event runs ONCE per server, then never
  again.** `MysticLibraryService:144: attempt to call missing method
  'FireAllClients' of table` throws inside `EndEvent()`, which runs on the single
  unprotected `task.spawn(function() while true do … end end)` scheduler thread in
  `init()`. The error unwinds out of the loop and **kills the thread**, so no
  further event is ever scheduled in that server. Fix is one word:
  `:FireAllClients(` → `:Fire(`. Full mechanism and the hardening patch are in the
  post-update section.
- **Nothing else is broken by v679.** Errors per concurrent player are flat
  across the publish (168.3 → 167.7, **−0.4%**), and concurrents have turned up
  for the first time since 08-23.
- **Read every post-update number against a game already in steep reach-led
  decline.** DAU **−62.5% w/w** (1,074,422 on 08-20 → **403,311** on 08-27, off a
  peak of 1,281,398 on 08-23) on impressions **−44.4%**. A DAU or revenue fall
  tomorrow happens *whatever this build does*. **Judge v679 on retention, the
  ending funnel, ARPDAU and errors — never on DAU.**
- **The one thing to act on: confirm what v679 actually contains, because the
  most likely content is a direct threat to 38% of this game's revenue.** See
  the next section. If the Mystery Library event or a raised message cap shipped,
  `DevProduct` revenue per DAU is the number that tells you what it cost, and it
  is pre-registered as tripwire 1.
- **Cannot be answered yet:** DAU, revenue, session length and payer conversion
  for the first post-update day (**2026-08-29**, read on 08-30); D1 for the first
  fully-post-update cohort (**2026-08-31**); D7 (**2026-09-05**).

---

## What shipped is not confirmed, and it changes which tripwire matters

Two sources disagree about v679's content and **neither is a changelog**:

1. **The 28.08 spec** handed over for this game lists a *Mystery Library Event*
   (hourly, 10 minutes, grants **10–20 free messages**) and *alternative endings*
   (2.1 "Shut Verity down", 2.2 best-friends — marked DELAYED).
2. **The live store description**, read from `develop.roblox.com` at 10:50 UTC
   today, says: *"UPDATE 1: Increased messages cap to 40 · New ending!"*

"New ending" appears in both. "Messages cap to 40" appears only in the store, and
the Mystery Library appears only in the spec. So v679 is plausibly a **partial
delivery** of the spec plus a cap change — but that is an inference, not a
measurement, and this report does not treat it as fact.

**Why it matters more than usual here.** This game sells messages. `DevProduct`
revenue — the MessagePack line — was **R$72,702 on 08-27, 38.4% of daily
revenue**. Both the free-message event and a raised message cap give away the
thing being sold. That is a coherent, testable revenue risk, and it is the
reason tripwire 1 is a monetization tripwire rather than a crash one.

It cuts the other way too: more messages per player is exactly how you would
*fix* a D2 hold of 35%. **Both effects are real and they oppose each other**, so
the honest pre-registration is a two-sided one — see tripwires 1 and 2.

---

## All metrics before the update

Full table — every metric with a settled headline daily series, latest settled
value and 7-day delta: **[`series/metric-table.md`](series/metric-table.md)**
(48 metrics). Raw settled points: **[`series/headline-daily.csv`](series/headline-daily.csv)**
(1,214 rows, `ONE_DAY` only, `FILLED_ZERO` and `partial` dropped — every row
quotable as-is). Corpus summary at grab time: [`summary-at-grab.md`](summary-at-grab.md).
Every attempt, including the 39 skips: [`grab-report.md`](grab-report.md).

The headline rows:

| Rung | Metric | Kind | 2026-08-27 | Δ7d |
|---|---|---|---|---|
| Discovery | Impressions (unique users) | volume | 5.72M | ▼ 44.4% |
| Discovery | End-to-End Conversion | rate | 6.21% | ▼ 36.7% |
| Discovery | RFY Play Days (L7) | rate | 1.36 | ▼ 12.2% |
| Discovery | Feedback Votes | volume | **−45** (net down) | ▼ 79.9% |
| **Retention** | **Day 1 Retention** | rate | **12.55%** (08-26) | **▼ 25.4%** |
| Retention | Day 1 Retention (7-day avg) | rate | 15.14% (08-26) | ▼ 23.3% |
| Retention | Day 7 Retention | rate | 1.10% (08-20) | ▼ 71.5% |
| Retention | Stickiness (DAU/MAU) | rate | 5.02% | ▼ 82.1% |
| **Monetization** | **ARPDAU** | rate | **R$ 0.4684** | ▼ 5.8% — **rising 3 days** |
| Monetization | ARPPU | rate | R$ 62.93 | ▲ 3.7% |
| Monetization | Payer Conversion | rate | 0.74% | ▼ 9.2% |
| Monetization | Daily Revenue | volume | R$ 189,161 | ▼ 64.6% |
| Monetization | Paying Users | volume | 3,006 | ▼ 65.9% |
| Engagement | Avg Session Length | rate | 8.02 min | ▼ 7.9% |
| Engagement | Playtime per Player | rate | 11.47 min | ▼ 17.5% |
| Engagement | Daily Active Users | volume | 403,311 | ▼ 62.5% |
| Engagement | Peak Concurrent | volume | 4,387 | ▼ 78.3% |
| Performance | Crash Rate (15m) | rate | 0.28% | ▲ 8.2% |
| Performance | Avg FPS / FPS p10 | rate | 52.53 / 43.95 | ▼ 2.2% / ▼ 2.5% |
| Performance | Client CPU Time | rate | 6.86 | ▲ 1.2% |
| Performance | Crash Count | volume | 1,591 | ▼ 64.0% |
| Performance | Out-of-Memory Exits | volume | 132 | ▼ 63.4% |
| Performance | Script Errors | volume | 1.18M | ▼ 68.5% |

**Two readings that are not obvious from the table.**

*Monetization per player has been recovering for three straight days while reach
collapses.* ARPDAU bottomed at **R$0.3889 on 08-25** and ran 0.4402 → **0.4684**;
ARPPU 57 → 61 → 63; payer conversion 0.68% → 0.72% → 0.74%. The audience is
shrinking to its higher-intent core, exactly as the handover baseline predicted.
**This is the most valuable thing in the pre-update state and the thing a
free-messages update is most likely to give back.**

*The technical rung is quiet and getting quieter.* Crash rate 0.28%, FPS 52.5,
script errors down 68.5% w/w. There is no pre-existing technical problem here for
v679 to be blamed for or hidden behind.

---

## Daily series, last 11 settled days

Behavioural metrics lag ~2 days, so 08-28 is legitimately absent for DAU,
revenue, payers, session length and D1 — that is the lag, not a gap.

| date | DAU | PCU | Revenue | Payers | ARPDAU | ARPPU | CVR | Session | D1 | Errors | Crashes | Crash rate | OOM |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 08-18 | 1,012,491 | 14,412 | 577,672 | 8,901 | 0.5705 | 65 | 0.88% | 9.14 | 17.37% | 4.75M | 4,426 | 0.26% | 345 |
| 08-19 | 811,716 | 10,483 | 437,384 | 6,737 | 0.5388 | 65 | 0.83% | 8.80 | 16.83% | 5.57M | 3,419 | 0.26% | 269 |
| 08-20 | 1,074,422 | 20,213 | 534,431 | 8,807 | 0.4974 | 61 | 0.82% | 8.71 | 19.13% | 3.74M | 4,418 | 0.26% | 361 |
| 08-21 | 1,118,833 | 14,476 | 609,239 | 9,641 | 0.5445 | 63 | 0.86% | 8.73 | 17.53% | 4.35M | 5,144 | 0.28% | 344 |
| 08-22 | 1,150,857 | 14,576 | 565,175 | 8,783 | 0.4911 | 64 | 0.76% | 8.53 | 15.83% | 4.72M | 5,608 | 0.32% | 359 |
| **08-23** | **1,281,398** | 14,540 | 596,703 | 9,803 | 0.4657 | 61 | 0.77% | 8.41 | 12.23% | 4.58M | 4,784 | 0.25% | 400 |
| 08-24 | 845,920 | 9,519 | 342,125 | 5,742 | 0.4044 | 60 | 0.68% | 8.28 | 14.23% | 3.11M | 3,196 | 0.25% | 318 |
| 08-25 | 681,316 | 7,166 | 264,932 | 4,645 | **0.3889** | 57 | 0.68% | 8.17 | 14.47% | 1.95M | 2,696 | 0.27% | 221 |
| 08-26 | 492,355 | 5,208 | 217,008 | 3,554 | 0.4402 | 61 | 0.72% | 8.06 | 12.55% | 1.57M | 2,147 | 0.30% | 157 |
| **08-27** | **403,311** | **4,387** | **189,161** | **3,006** | **0.4684** | **63** | **0.74%** | **8.02** | — | **1.18M** | **1,591** | **0.28%** | **132** |
| 08-28 † | — | 4,879 | — | — | — | — | — | — | — | 1.56M | 1,954 | 0.31% | 126 |

† 81% pre-update. Shown for continuity, never as a post-update reading.

---

## Concurrents across the publish — the first genuinely readable signal

`ccu-baseline`, matched half-hour slots **00:00–11:00 UTC** against 24 complete
prior days — full output in [`ccu-baseline-2026-08-29.txt`](ccu-baseline-2026-08-29.txt).
Today's mean over elapsed slots: **4,454**, rank **9 of 25**.

| baseline | n | base CCU | today vs base |
|---|---|---|---|
| same weekday (Sat) | 3 | 4,202 | **+6.0%** |
| last 7 days | 7 | 5,836 | −23.7% |
| last 14 days | 14 | 6,020 | −26.0% |
| all 24 days | 24 | 3,651 | +22.0% |

**The sequence is what matters, not the comparison to a two-week-old level.** On
the same elapsed-slot basis: **08-27 → 2,830 · 08-28 → 3,276 · 08-29 → 4,454**.
That is **+57% off the 08-27 trough** and the first two consecutive up-days since
the 08-23 peak turned. The 14-day baseline still reads −26% because it averages
in peak days this game will not see again.

**Do not read this as "v679 worked" yet.** Today is a Saturday and the up-turn
began on 08-28 *before* the 19:00 publish. What can be said is narrower and still
useful: **the decline stopped before the update and has not resumed after it.**
The per-slot profile is consistent with that — negative early (−46% at 00:00),
crossing to positive through the UTC morning (+17% at 04:00), then settling
−20% to −30%. That is not the uniform per-slot deficit a break inside the game
produces.

The public board is **up 2.8% since yesterday** (8,324,909 CCU across 283 games,
`data/platform/ccu-2026-08-29T11-17-54Z.json`), so nothing here is a platform
effect in either direction.

---

## Errors across the publish, normalised — the other readable signal

Raw error counts across a publish are meaningless: the population changes. The
table below divides half-hour `ErrorCount` by half-hour `PeakConcurrentPlayers`
over **matched elapsed slots 00:00–11:00 UTC**, final bucket dropped (F19).

| day | errors (00:00–11:00) | mean CCU | **errors / CCU** | vs 08-27 |
|---|---|---|---|---|
| 2026-08-27 (pre) | 476,284 | 2,830 | **168.3** | — |
| 2026-08-28 (pre — publish was 19:00) | 557,451 | 3,276 | **170.2** | +1.1% |
| **2026-08-29 (first post-update morning)** | 746,884 | 4,454 | **167.7** | **−0.4%** |

**Flat to three significant figures across two pre-update days and one
post-update one.** Against the mean of the two pre-update days the post-update
morning is **−0.9%**. v679 has no error-rate signature at 15 hours.

The publish itself did spike, and then decayed exactly as the routine predicts:
in the 19:00 and 19:30 buckets errors ran **+162%** and **+353%** on the same
slots the day before; by the settled 22:00–23:30 window the excess was +35%
(16.6 → 22.5 errors/CCU), and it was gone entirely by the following morning.

**One thing to watch, not yet a finding:** the **08:30 and 09:00 buckets on
08-29** carried 193,526 and 117,321 events against 13,538 and 17,256 in the same
slots on 08-27 — **10× and 6×**, for two buckets, then straight back to normal
(09:30 = +40%). This universe throws isolated half-hour spikes routinely (08-27
alone had five, peaking at 91,094), but none of those reached 193K. Two buckets
is a spike, not a step. Re-check tomorrow; if it recurs at the same time of day
it is a scheduled job, and if it recurs at all it is tripwire 6.

---

## Funnel before the update

Nine funnels (`Conversation`, `Onboarding`, `Session`, `FollowMe`, `Messages`,
`MessagePack`, `EndingOthers`, `Notebook`, `Ending`), pulled with the async
polling shape and no `FunnelName` filter — table and method in
[`funnels-pre-update.md`](funnels-pre-update.md).

| # | Step | Users | Step-to-step | Daily rate, pre-update mean |
|---|---|---|---|---|
| 1 | `Submitted` | 90,433,533 | 100.00% | 100.0% |
| 2 | `Accepted` | 78,366,031 | 86.66% | 86.1% |
| 3 | `Delivered` | 62,490,227 | 79.74% | 68.4% |
| 4 | **`First Reply Received`** | 16,210,765 | **25.94%** | 49.9% |
| 5 | `Day 2 Reached` | 9,645,972 | 59.50% | 32.7% |
| 6 | `Day 3 Reached` | 6,790,510 | 70.40% | 23.3% |
| 7 | `Day 4 Reached` | 5,219,186 | 76.86% | 60.2% |
| 8 | `Day 5 Reached` | 4,134,055 | 79.21% | 46.0% |
| 9 | **`Ending Completed`** | 1,892,045 | 45.77% | **18.8%** |

The two rate columns are different measurements. *Step-to-step* is
`FunnelUserStepCompletionRate` over the whole window. *Daily rate* is
`FunnelCohortCompletionRate` at `OneDay`, averaged over complete pre-update days
(08-21…08-27), and it is the column the tripwires are set on. Merged rates are a
blend across all nine funnels by index and **must never be quoted as one
funnel's** (F22).

**The deep steps are in genuine free-fall, and it predates v679.** Over
08-21 → 08-27: `Day 4 Reached` **67.0% → 55.3%**, `Day 5 Reached` **53.3% →
41.1%**, `Ending Completed` **23.1% → 16.1%**. That is the D2-hold problem from
the handover baseline, still compounding. It is in this baseline so it does not
get attributed to the update — and because **`Ending Completed` is the success
metric if a new ending shipped.** At 16.1% and falling ~1.2 pp/day, a build that
merely flattens it has done something.

### A measurement trap this pass found, and it changes how the tripwire is read

**The newest day of `FunnelCohortCompletionRate` is unstable and must be excluded
from any baseline mean.** Measured by pulling the same dates twice, three days
apart (the 08-26 pull vs today's):

| step | 08-20 | 08-21 | 08-22 | 08-23 | 08-24 | **08-25 (newest at first pull)** |
|---|---|---|---|---|---|---|
| `First Reply Received` | 52.4→52.6 | 51.8→52.0 | 50.7→50.9 | 49.9→50.1 | 49.2→49.8 | **55.0→49.5 (−5.5 pp)** |
| `Day 2 Reached` | 33.7→33.9 | 33.6→33.7 | 33.0→33.1 | 32.3→32.5 | 32.1→32.6 | **36.5→32.6 (−3.9 pp)** |
| `Day 3 Reached` | 24.4→24.5 | 24.2→24.3 | 23.6→23.8 | 23.0→23.2 | 23.0→23.3 | **26.5→23.2 (−3.3 pp)** |

Every date four or more days old moved by **less than +0.6 pp**. The newest day
moved by **up to −5.5 pp**. So the newest day reads **high** on the shallow steps
and settles down. Today's 08-28 column shows the identical signature
(`First Reply Received` 53.1% against a 49.9% mean) and is **not** a genuine
improvement.

**Consequence for tomorrow: do not fire a funnel tripwire on a day less than two
days old, and treat anything under four days as provisional.** A one-day-old
value is worth ±5 pp, which is the entire width of the tripwire.

---

## Tripwires — pre-registered, before the post-update read

Marked OK / WATCH / FIX / NO DATA at each later grab. Thresholds are set against
the settled baseline above, **not** picked afterwards.

| # | Signal | Pre-update value (08-27) | Broken if | First readable |
|---|---|---|---|---|
| **1** | **`DailyRevenue` by `RevenueSource` = `DevProduct`, per DAU** | **R$72,702 / 403,311 = R$0.180** | **< R$0.144 (−20%) for 2 settled days.** This is the free-messages cannibalisation test and the highest-value row in the table | 08-30 |
| **2** | `AverageSessionLengthMinutes` | **8.02 min** | **< 7.2 min** for 2 settled days. **A rise above 8.8 is the success signal** if free messages or a raised cap shipped | 08-30 |
| 3 | `AverageRevenuePerUser` (ARPDAU) | **R$ 0.4684**, rising 3 days | **< R$ 0.42** — the three-day recovery given back | 08-30 |
| 4 | `PayingUsersCVR` | **0.74%** | < 0.66% for 2 settled days | 08-30 |
| 5 | `ErrorCount` per concurrent player | **168.3** (00:00–11:00 matched slots) | **> 210 (1.25×)** sustained over a full elapsed-slot window | now — reads **167.7, OK** |
| 6 | Half-hour error spikes | routine isolated spikes to ~91K | the 08-29 08:30/09:00 pattern (193K/117K) **recurring** on 08-30 | 08-30 |
| 7 | New `MessageHash` on v678/v679 | n/a — **no export since v615** | **any signature with real volume** carrying a v679 first-seen stamp | needs a dashboard export |
| 8 | `ClientCrashRate15m` | **0.28%** (band 0.25–0.32%) | **> 0.39%** (1.4× baseline) | 08-30 |
| 9 | `ClientCrashCount` | 1,591 | > 2,300 at flat-or-lower DAU | 08-30 |
| 10 | `OomUnexpectedExits` | 132 | > 200 per day at flat-or-lower DAU | 08-30 |
| 11 | `ClientFpsP10` | 43.95 | < 39 | 08-30 |
| 12 | `ForwardD1Retention` | **12.55%** (7-day avg 15.14%) | **< 11.3%** for 2 settled days | **08-31** |
| 13 | Funnel `Ending Completed` | **18.8%** pre-update mean, 16.1% on 08-27 | < 13.8% on a day **≥2 days old**. **A rise above 20% is the success signal** for a new ending | 08-31 |
| 14 | Funnel `Delivered` | **68.4%** pre-update mean | < 63.4% — this is the conversation mechanic itself | 08-31 |
| 15 | Any other of the 9 steps | see [`funnels-pre-update.md`](funnels-pre-update.md) | daily rate > 5 pp below its own pre-update mean, on a day ≥2 days old | 08-31 |
| 16 | Feedback votes | **−45 on 08-27** (already net negative) | more negative than −45 on a day with flat-or-lower DAU | 08-30; needs an export for the up/down split |

**Tripwire 16 note.** Net feedback votes were **already negative before this
update** (−45 on 08-27, from +224 on 08-20). That is a pre-existing signal about
v664, not about v679, and it is the one baseline row that was deteriorating on
its own. It needs the dashboard's up/down split to be read properly.

---

## Four things that will look like breakage tomorrow and are not

1. **The publish-path error spike.** Already observed and already decayed —
   +162%/+353% in the 19:00/19:30 buckets, back to baseline by the next morning.
   It is only a finding if it is *still* elevated on 08-30.
2. **The restart dip in concurrents.** v679 cycled every server at ~19:30 UTC.
   Compare against that day's own pre-19:00 slope, not against a prior peak.
3. **Today's partial day and partial half-hour.** 2026-08-29 is in progress and
   reads low everywhere. Drop the final `HalfHour` bucket always (F19), and pass
   `--slots` bounded by the current UTC hour to `ccu-baseline` (F24).
4. **Version adoption.** v679 error counts climbed for ~2 h purely as servers
   cycled onto the build.

And one specific to this game: **DAU, revenue and paying users will be down
tomorrow regardless of v679**, because they have fallen every day since 08-23 on
impressions down 44% w/w. Those three rows are tripwire-exempt. Retention,
session length, ARPDAU and the ending funnel are what test the build.

---

## Errors — volumes only, and why there is no text

`ErrorCount` on 08-27 was **1,179,708** events; 08-28 was 1,557,188, of which
**972,347 are stamped v679** and 19,400 v678.

**We have no message text.** The `errorReporting.dimensions/MessageHash` lookup
answers HTTP 500 (F17) and Open Cloud serves no error text at all. The only route
to a message body is a **Creator Dashboard export**, and the newest one for this
game is `errors_2026-08-26_1722_v446-v615.csv` — which predates even **v664**,
the build that had been live since 08-17.

**Action, and it needs you:** export *Errors and warnings by count* filtered to
**v679**, and a second filtered to **v664** as the comparison. Without both,
tripwire 7 cannot be evaluated at all — a new signature is only visible with its
text and first-seen version. Leave them in Downloads and I will file them to
`data/exports/10565445771-verity-companion/errors/`.

---

## Watchlist with dates

| When | What | Why |
|---|---|---|
| **2026-08-30** | Full grab after the UTC day rolls | First real read of v679: DAU, revenue, session length, ARPDAU, crash rate |
| **2026-08-30** | Dashboard error export, v679 vs v664 | The only way to evaluate tripwire 7 |
| **2026-08-31** | D1 for the 08-29 cohort; funnel steps for 08-29 at 2 days of age | First cohort entirely on v679 |
| **2026-09-02** | Funnel steps for 08-29 at 4 days of age | The age at which a funnel day is settled to ±0.6 pp |
| **2026-09-05** | D7 for the 08-29 cohort | Repeat-play test |

## Questions for the studio

1. **What is actually in v679?** The store description says "messages cap to 40"
   and "New ending"; the 28.08 spec describes a Mystery Library event and two
   alternative endings. A one-line changelog turns every tripwire from "something
   moved" into "the thing we changed moved".
2. **Was v678 a bad publish immediately hotfixed by v679?** The deploy log shows
   v678 running for two half-hour buckets and stopping, which is consistent.
   Confirming it matters because 19,400 events are attributed to it.
3. **Did the message cap change, and from what to what?** `DevProduct` revenue is
   38.4% of this game's income and message packs are the product. The size of the
   cap change is the size of the risk.
4. **Is there a scheduled job around 08:30 UTC?** Two half-hour buckets on 08-29
   carried 10× the normal error volume and nothing else moved.

---

## Post-update read — 2026-08-29 T+18h. Tripwire 7 FIRED

Two dashboard error exports were filed at 14:08 local, covering v664 → v679:
`data/exports/10565445771-verity-companion/errors/errors_2026-08-29_1408_v664-v679_{5990ev,3788ev}.csv`.
They are the same top-25 table over two different count windows (wider first);
**export counts rank and date signatures, they do not count affected players.**

### The finding

| | |
|---|---|
| Signature | `ServerStorage.serverModules.Services.MysticLibraryService:144: attempt to call missing method 'FireAllClients' of table` |
| Severity | Error |
| First seen | **2026-08-28 20:10 UTC** — 40 minutes after v679 published at 19:30 |
| First-seen version | **v679** |
| Volume in export | **1,894 + 316** in the wider window, **942 + 94** in the narrower — the largest signature in both, by 2.4× |

It appears as **two distinct signatures with identical text and identical
first-seen**, which means two different call paths reach the same broken line.

**It is still firing, and it is growing.** `ErrorCount` filtered to
`FirstSeenPlaceVersion >= 678` — "errors this deploy introduced", the documented
filter shape — measured today:

| date | all errors (this place) | introduced by v678/v679 | share |
|---|---|---|---|
| 2026-08-26 | 1,573,553 | 0 | 0.0% |
| 2026-08-27 | 1,179,708 | 0 | 0.0% |
| 2026-08-28 | 1,557,188 | **2,069** | 0.1% |
| **2026-08-29** | 1,010,254 | **4,018** | **0.4%** |

**2,069 → 4,018 across the publish day into the first full day.** That is the
opposite of the publish-path decay pattern, and it is the discriminator: a deploy
artefact falls, a live defect does not. Compare Waterslide's v1715/v1716 in the
same test — 9,826 → **174**, a defect that was hotfixed away.

### Root cause — CONFIRMED from source, 2026-08-29

Read from the dev place (`129389345124983`, universe `10762125234`, v132) over the
Studio MCP, read-only. **This supersedes the inference in the next subsection,
which was wrong about which broadcast fails.**

**The failing line is the event-END broadcast, not the start announcement.**

```lua
-- MysticLibraryService.EndEvent(), lines 135-148
self.active = false
if self.library then self.library:Destroy(); self.library = nil end
table.clear(self.playerStates)

Packets.MysticLibrary:FireAllClients({   -- line 144 — THROWS
    action = "ended",
})

print("[MysticLibrary] Event ended")     -- never reached
```

`Packets.MysticLibrary` is `Packet("MysticLibrary", Packet.Any)`
(`ReplicatedStorage.Shared.Config.Packets:169`), and the `Packet` library
(`ReplicatedStorage.Packages.Packet`, 387 lines) exposes exactly five methods:
`Response`, `Fire`, `FireClient`, `Serialize`, `Deserialize`. **There is no
`FireAllClients`** — the `remoteEvent:FireAllClients` at lines 235/237 is the
library's own flush loop acting on the raw RemoteEvent, not the wrapper.

**Fix:** `:FireAllClients(` → `:Fire(`. On the server `Packet:Fire` takes the
no-response branch (lines 99-104), writes to the shared cursor, and that cursor is
flushed to everyone by `remoteEvent:FireAllClients` at line 235. `StartEvent` is
unaffected because it uses `FireClient` per player in a loop (lines 119-125),
which is why the *first* event of a server's life works normally.

**Why one bad line disables the feature for the server's whole life.** `init()`
runs the only scheduler in a single unprotected thread, and there is **no `pcall`
anywhere in the module**:

```lua
-- MysticLibraryService.init(), lines 244-270
task.spawn(function()
    while true do
        ...
        self:StartEvent()
        task.wait(Config.DurationSeconds)
        self:EndEvent()      -- throws at 144 -> thread dies -> loop never repeats
    end
end)
```

Both branches of the loop reach `EndEvent` within at most one hour plus the event
duration. So **every server permanently loses the feature after its first
event**, and the servers that still work are simply the ones that have not
completed a cycle yet. That is exactly the studio's own report — *"new event
doesn't spawn in some servers"* — and it means the failure rate grows with server
age, not randomly.

**Second, smaller effect:** clients never receive `action = "ended"`, so the
library UI and countdown stay on screen after the library has been destroyed
server-side. `SubmitAnswer` then returns `"Event is not active"` (lines 156-157).

**Hardening worth shipping with the fix** — a single feature error should not be
able to kill a scheduler permanently:

```lua
while true do
    local ok, err = pcall(function()
        ... -- existing cycle body
    end)
    if not ok then warn("[MysticLibrary] cycle failed:", err) end
    task.wait(1)
end
```

### Superseded: the inference made before the source was read

`attempt to call missing method 'FireAllClients' **of table**` is precise about
two things: the call is `something:FireAllClients(...)`, and `something` is a
plain **Lua table**, not a `RemoteEvent`. If it were a `BindableEvent` or any
other Instance the engine would say *"FireAllClients is not a valid member of…"*.
So line 144 is holding a table where it expects a remote. The three shapes that
produce this exactly:

1. A remotes **registry table** called directly — `Remotes:FireAllClients(...)`
   instead of `Remotes.LibraryAppeared:FireAllClients(...)`.
2. A `require()` that returns a **module table** wrapping the remote, so the
   remote is one field deeper than the call assumes.
3. A remote **created lazily** and the fallback being `{}` rather than a real
   `RemoteEvent`, so the failure only shows in production.

**Why it matters more than 4,018 events suggests.** Per the 28.08 spec the
Mystery Library announces itself to everyone — *"The Library has appeared! Answer
a question to earn free messages."* — and a global announcement is exactly a
`FireAllClients`. If that broadcast is the throwing call, **the event spawns
server-side on its hourly timer and no player is ever told**, so the headline
feature of this update is invisible in production while the server believes it is
running. Ranked by mechanism rather than event count, this is the finding.

**What is not yet established.** Which of the two call paths is the announcement
and which is something else; whether the chest reward at the end of the event
also routes through line 144; and whether any player has successfully claimed the
10–20 free messages. Those need the source at `ServerStorage.serverModules.
Services.MysticLibraryService`, or a play test during an event window.

### The other v678/v679 signatures — all publish-path, all expected

`Player:IsInGroup failed` (DnsResolve 788, Timedout 528, NetFail 198,
SslConnectFail 194, ConnectFail 137) and `Players:GetNameFromUserIdAsync() failed:
HTTP 429` (566) are all first seen **19:30–19:54 on 08-28** — inside the publish
window. Every server restarting at once re-issues these calls simultaneously,
which is the textbook restart storm. **Not findings about the build.** The one
worth a note is the 429: it is a rate limit we are inflicting on ourselves, and
it would be worth caching `GetNameFromUserIdAsync` results if it recurs on a
normal day.

### Two pre-existing signatures worth raising separately

Neither is v679's fault; both are about the core loop.

- **`SpeechToText : request failed HTTP 401 (Unauthorized)`** — v664, first seen
  2026-08-27 23:44 UTC, 37 events. A **401 is a credential failure**, not load. If
  speech-to-text is a paid feature or an input path, it is dead for whoever hits
  it, and it started the day before this update.
- **`DeepInfra slots all busy (2 in flight, 3 queued); using authored fallbacks`**
  — v664, 99 + 26 events. The AI backend is saturating at **two concurrent
  requests** and players are silently served canned lines instead of generated
  ones. That is the core loop degrading, and it is the same failure family as the
  handover baseline's largest signature (*Generated dialogue was rejected by
  filtering*, 512,734 events). **Concurrency 2 is the number to question.**

### Tripwire status at T+18h

| # | Signal | Status |
|---|---|---|
| 5 | `ErrorCount` per concurrent player | **OK** — 167.7 vs 168.3 baseline |
| **7** | **New `MessageHash` on v678/v679** | **FIRED** — `MysticLibraryService:144`, rising 2,069 → 4,018 |
| 1, 2, 3, 4, 8–11, 16 | monetization / performance / session | **NO DATA** until 08-30 |
| 12–15 | D1 and funnel steps | **NO DATA** until 08-31 |

_Read 2026-08-29 ~14:20 UTC._

---

## The AI path — read from source 2026-08-29, and it renames three signatures

Read read-only from the dev place (`129389345124983`, v135). Recorded here
because three of this game's largest error signatures are the AI path degrading,
and **they have three different causes that need three different fixes.**

| | |
|---|---|
| Provider | **DeepInfra** |
| Model | **`google/gemma-4-E4B-it`** |
| Endpoint | `https://api.deepinfra.com/v1/openai/chat/completions` — OpenAI-shaped |
| Auth | `HttpService:GetSecret("deepinfra")`, applied as `Secret:AddPrefix("Bearer ")` |
| Budget | `max_tokens = 64`, 24 s wall-clock per reply, 2 attempts |
| Source | `ServerStorage.serverModules.Services.RequestServiceServer.MessageRequest` |

### The three signatures, separated

**1. `DeepInfra slots all busy (2 in flight, N queued); using authored fallbacks`**
&mdash; 804 events in the 2026-08-29 export.

This is **self-imposed**, not the provider. `GameConfig.DeepInfraMaxInFlight = 2`
is a Lua counter, and it is **per server instance**, not global. A server holding
two requests makes the third player wait `DeepInfraQueueWaitSeconds` (3 s) and
then serves them an authored line. Raising the constant is a one-line change; it
trades reply latency for provider spend.

**2. `DeepInfra still rate limiting after 4 attempts; using authored fallbacks`**
&mdash; 3,543 events.

This one *is* the provider: HTTP 429 at the **account** level. The client already
backs off (`{0.5, 1.2, 2.5}` s with 0.4 jitter, honouring `Retry-After`) and trips
a circuit breaker after 12 consecutive 429s. Not fixable in code &mdash; it needs a
higher DeepInfra tier or a second key.

**3. `Generated dialogue was rejected by filtering` &mdash; 661,694 events, 97% of all
server errors, and it is NOT DeepInfra at all.**

The model returned a reply and **Roblox's own text filter refused it**. The
handover baseline flagged this at 512,734 and called it the core loop failing; it
is now larger. It is the single biggest error source on the game and the only one
of the three that no amount of AI-provider budget will fix. It needs prompt work
&mdash; the generated line has to survive Roblox filtering &mdash; or a different model.

**Do not lump these three together in a report.** One is a config constant, one is
a billing tier, one is a prompt-engineering problem.

### Cost controls already in place

Two caches, which matters when reading token spend:

- **Provider-side**: `prompt_cache_key` is keyed by stage + persona, so the system
  prompt &mdash; the bulk of the token cost &mdash; is reused across every player at the
  same stage.
- **Server-side**: a local reply cache, 1024 buckets x 4 variants, but **only for
  messages under 24 characters**. Repeated small talk never reaches the API.

`Shared.Utilities.TokenUsage` logs prompt / cached / completion / total per reply,
so real cost per message is measurable rather than estimated.

### Why this matters beyond Verity

The secret is **scoped per experience**, so a second AI game does not inherit it &mdash;
but it *would* share the account rate limit if given the same key. Signature 2
above is already firing on one game. Two games on one key compete for the same
quota, and the symptom is players getting canned lines instead of generated ones.

Full write-up, including the reskin scope, is in the separate
`verity-reskin` repo (`TRANSFER-GUIDE.md` §6).
