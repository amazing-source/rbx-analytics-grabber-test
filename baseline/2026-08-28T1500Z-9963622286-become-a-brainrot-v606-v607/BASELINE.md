# Update baseline — [WORLD 3] Become a Brainrot (`9963622286`)

**Update: v606 → v607, published 2026-08-28 between 15:00 and 15:30 UTC.**
Single place `99255447043899`. Previous live build **v605** (shipped 2026-08-26,
first errors in the 11:30 UTC bucket).

**Two publishes, one update, and the deploy log settles which build is live.**
`ErrorCount` by `PlaceVersion` at half-hour resolution
([`deploy-log.md`](deploy-log.md)) shows **v606 in the 15:00 bucket only** (29,218
errors, one bucket, then nothing) while **v607 runs 15:00 and 15:30 and is still
accruing** (52,011). v606 was superseded inside the same half hour. Everything
after 15:30 belongs to **v607**, and v606's 29,218 events must be excluded from
the T+2h read — they belong to a build nobody is running.

| | |
|---|---|
| Baseline grab | 2026-08-28 **15:25:08–15:33:31 UTC**, Open Cloud, window 2026-07-31 → 2026-08-29 |
| Requests | 198 planned · 159 sent · **148 returned data** · 6 empty 200 · 5 failed · 39 not served by Open Cloud |
| Failures | **all 5 are inferred `PlaceVersion` breakdowns** on metrics that do not support that dimension (400, `optional: true`). **0 failures on observed/proven shapes.** Nothing here is missing data about the game |
| Baseline frozen at | **2026-08-27** — the last day that closed before the publish |
| Gates at grab time | `npm test` 44/44 · `npm run audit-plan` 140 templates, 0 failures · `npm run verify` 23 pass / 2 fail / 8 skip (both fails the documented held ones) |

> **This is a T+0 baseline, not a pre-publish one.** The grab ran minutes *after*
> the publish, because that is when the update was reported. It is still a valid
> freeze: every number quoted below is from a UTC day that closed **before**
> 15:00 on 2026-08-28, so no post-update player is inside it. What it does *not*
> contain is a clean partial-day shape for 2026-08-28 itself — today is excluded
> everywhere, and today is not a baseline.

---

## Bottom line

- **Nothing is broken by this update yet, and nothing here can say it is.** The
  freeze is clean and every rung is populated: 148 metrics with data, the full
  technical rung included.
- **The one thing to know before reading any post-update number: this game is in
  a steep reach-led decline that predates v607 by two weeks.** DAU **−36.2% w/w**
  (162,717 on 08-20 → **103,843** on 08-27, and 241,553 as recently as 08-16),
  revenue **−52.2% w/w**, payers **−47.4%**, impressions **−35.5%** — while
  **D1 retention is UP** (14.50%,
  ▲9.0% w/w). Reach is falling and the product is holding. A post-update DAU
  drop will therefore happen *whatever this build does*. **Judge v607 on
  retention, session length and errors — never on DAU or CCU.**
- **Cannot be answered yet:** anything about the build itself. Errors and crashes
  first read **T+2h ≈ 17:15 UTC today**; DAU / revenue / session length on
  **2026-08-29**; D1 for the first genuinely post-update cohort on **2026-08-31**.

---

## One pre-existing anomaly, flagged before it gets blamed on this build

**`ClientCpuTimeAvg` stepped 41 → 93 on 2026-08-27** — 2.3×, on a settled day,
one day *before* this publish.

| | 08-21 | 08-22 | 08-23 | 08-24 | 08-25 | 08-26 | **08-27** |
|---|---|---|---|---|---|---|---|
| Client CPU time | 45 | 43 | 37 | 41 | 39 | 41 | **93** |

Nothing else moved with it: crash rate flat at 2.4–2.6%, FPS ▲1.3%, memory
▲1.0%, OOM exits ▼33.5%. It is a single settled day at the new level, so it is
**a flag, not a finding** — one day is a spike, two is a step. It matters here
for one reason: **it lands in the baseline the update will be measured against.**
If CPU reads ~93 tomorrow, that is this anomaly continuing, not v607.

---

## All metrics before the update

Full table — every metric with a settled headline daily series, latest settled
value, and the 7-day delta: **[`series/metric-table.md`](series/metric-table.md)**
(55 metrics). Raw settled points: **[`series/headline-daily.csv`](series/headline-daily.csv)**
(6,319 rows, `ONE_DAY` only, `FILLED_ZERO` and `partial` dropped — every row
quotable as-is). The corpus summary as it stood at grab time is
[`summary-at-grab.md`](summary-at-grab.md); the full attempt log is
[`grab-report.md`](grab-report.md).

The headline rows:

| Rung | Metric | Kind | 2026-08-27 | Δ7d |
|---|---|---|---|---|
| Discovery | Impressions (unique users) | volume | 1.55M | ▼ 35.5% |
| Discovery | End-to-End Conversion | rate | 5.83% | ▼ 1.8% |
| Discovery | RFY Play Days (L7) | rate | 1.40 | ▼ 5.2% |
| **Retention** | **Day 1 Retention** | rate | **14.50%** (08-26) | **▲ 9.0%** |
| Retention | Day 1 Retention (7-day avg) | rate | 14.71% (08-26) | ▲ 11.7% |
| Retention | Day 7 Retention | rate | 1.38% (08-20) | ▼ 27.0% |
| Retention | Stickiness (DAU/MAU) | rate | 2.17% | ▼ 13.5% |
| Monetization | ARPDAU | rate | R$ 0.34 | ▼ 25.0% |
| Monetization | ARPPU | rate | R$ 55.92 | ▼ 9.0% |
| Monetization | Payer Conversion | rate | 0.60% | ▼ 17.6% |
| Monetization | Daily Revenue | volume | R$ 34,725 | ▼ 52.2% |
| Monetization | Paying Users | volume | 621 | ▼ 47.4% |
| Engagement | Avg Session Length | rate | 10.36 min | ▼ 4.9% |
| Engagement | Playtime per Player | rate | 16.12 min | ▼ 3.4% |
| Engagement | Daily Active Users | volume | 103,843 | ▼ 36.2% |
| Engagement | Peak Concurrent | volume | 1,570 | ▼ 39.1% |
| Performance | Crash Rate (15m) | rate | 2.46% | ▲ 6.3% |
| Performance | Client CPU Time | rate | **93.04** | ▲ 94.4% |
| Performance | Avg FPS / FPS p10 | rate | 35.55 / 25.32 | ▲ 1.3% / ▲ 2.8% |
| Performance | Crash Count | volume | 3,314 | ▼ 29.8% |
| Performance | Out-of-Memory Exits | volume | 971 | ▼ 33.5% |
| Performance | Script Errors | volume | 3.24M | ▼ 84.6% |

**Two readings that are not obvious from the table.**

*The error load genuinely improved, and it is the largest healthy move in the
window.* `ErrorCount` ran 30.8M (08-16) → 21.0M (08-20) → **3.24M (08-27)**, a
**−89%** fall that holds for six straight days. Crash count and OOM exits fell
with it (−30%, −34%). Whatever shipped around 08-22 worked. **v607 must not give
this back** — it is the single most valuable thing to protect in this baseline.

*The 08-22 spike is an event, not a metric fault.* PCU 10,942 against a 2,000–3,900
band, DAU 227K, revenue R$170K, all on one day, alongside 12.82M Event RSVPs.
Exclude 08-22 from any "typical day" comparison or it will flatter the before.

---

## Daily series, last 12 settled days

| Date | DAU | PCU | Revenue R$ | Payers | Errors | Crashes | OOM | D1 |
|---|---|---|---|---|---|---|---|---|
| 08-16 | 241,553 | 3,883 | 163,888 | 2,292 | 30.79M | 8,440 | 2,761 | 11.3% |
| 08-17 | 197,324 | 2,990 | 115,002 | 1,689 | 21.72M | 6,051 | 2,000 | 12.4% |
| 08-18 | 198,586 | 3,552 | 89,580 | 1,442 | 21.28M | 5,800 | 1,919 | 13.2% |
| 08-19 | 177,088 | 2,763 | 128,721 | 1,333 | 19.64M | 5,486 | 1,808 | 13.3% |
| 08-20 | 162,717 | 2,578 | 72,607 | 1,181 | 21.02M | 4,723 | 1,460 | 13.7% |
| 08-21 | 177,898 | 2,718 | 112,017 | 1,503 | 19.14M | 5,663 | 1,793 | 15.4% |
| 08-22 *(event)* | 227,311 | 10,942 | 170,361 | 2,249 | 7.60M | 9,842 | 3,277 | 14.8% |
| 08-23 | 186,648 | 2,784 | 100,933 | 1,442 | 5.41M | 6,246 | 1,903 | 13.3% |
| 08-24 | 126,648 | 2,175 | 62,310 | 871 | 3.49M | 4,309 | 1,347 | 15.8% |
| 08-25 | 125,079 | 1,973 | 38,030 | 825 | 3.96M | 4,200 | 1,341 | 15.4% |
| 08-26 | 123,876 | 2,064 | 56,600 | 842 | 3.96M | 3,786 | 1,125 | 14.5% |
| **08-27** | **103,843** | **1,570** | **34,725** | **621** | **3.24M** | **3,314** | **971** | — |

D1 is stamped on the cohort's own day and settles ~2 days late, so its last two
points are always low and 08-27 is not yet readable. That is the lag, not a drop.

---

## Concurrents today, before and around the publish

`ccu-baseline`, matched half-hour slots 00:00–15:30 UTC against 26 complete prior
days — full output in [`ccu-baseline-2026-08-28.txt`](ccu-baseline-2026-08-28.txt):

| baseline | n | base CCU | today vs base |
|---|---|---|---|
| same weekday (Fri) | 3 | 2,349 | −47.0% |
| last 7 days | 7 | 2,106 | **−40.9%** |
| last 14 days | 14 | 2,468 | −49.5% |
| all 26 days | 26 | 2,827 | −55.9% |

Today's mean over elapsed slots is **1,246**, rank 27 of 27. **But the rank is the
misleading half:** 08-27 was 1,268 and today is 1,246 — a 1.7% difference. The
game is not falling further today; it is *flat at the bottom of its own range*
after a fortnight of decline. "Lowest ever" and "unchanged since yesterday" are
both true, and the second is the one that describes what is happening.

**The per-slot profile is uniform** — between −39% and −48% in every one of the
32 elapsed slots, with no drift across the UTC day. A deficit that costs the same
share of players in every hour is the signature of a change in the game or its
audience size, not of a calendar or discovery effect biting in particular hours.
And the public board is **up 7.5%** since 08-25 (8,101,577 CCU across 275 games,
`data/platform/ccu-2026-08-28T15-31-25Z.json`), so this is not the platform.

> A note on method, because it changed the answer. The first run of
> `ccu-baseline` swept slots 00:00–23:00 and scored the eight hours that have not
> happened yet as zero, reporting today at 848 CCU and −64.7%. Restricting to
> elapsed slots gives 1,246 and −40.9%. **Always pass `--slots` bounded by the
> current UTC time when reading a part-day.**

---

## Funnel before the update

20 instrumented steps across two funnels (`BaseUpgrades`, `PlayerProgression`),
pulled with the async-polling shape and no `FunnelName` filter — full table and
method in [`funnels-pre-update.md`](funnels-pre-update.md).

| # | Step | Users | Step-to-step | Cumulative, 7d mean |
|---|---|---|---|---|
| 1 | `OnboardingComplete` | 651,943 | 100.00% | 100.0% |
| 2 | `BaseUpgrade2` | 625,995 | 96.02% | — |
| 3 | `FirstMorph` | 613,770 | 98.05% | **94.7%** |
| 4 | `BaseUpgrade4` | 395,841 | **64.49%** | **63.9%** |
| 8 | `BaseUpgrade8` | 207,729 | **63.52%** | **78.4%** |
| 20 | `BaseUpgrade20` | 115,835 | 92.62% | **43.7%** |

**The two rate columns are different measurements — do not read them as one.**
*Step-to-step* is `FunnelUserStepCompletionRate`: the share of the previous step's
players who reached this one. *Cumulative* is `FunnelCohortCompletionRate` at
`OneDay`, measured from step 1, and it is the column the tripwires are set on.

**Two cliffs, and they are the shape of this game's progression problem.** Only
**64.5%** of players who clear step 3 reach step 4, and only **63.5%** of those who
clear step 7 reach step 8 — against 92–98% at every other gate in the ladder. The
funnel runs 651,943 → 115,835 across the twenty steps (**17.8% survive**), and
**those two gates account for 62.9% of the entire loss** — 217,929 players at step
4 and 119,276 at step 8, out of 536,108 lost in total.

This is pre-existing and is *not* something v607 caused. It is in the baseline for
two reasons: it is the highest-value fix available on this game, and if v607
touched upgrade pricing or pacing these two rates are where it will show first.

---

## Tripwires — pre-registered, before the post-update read

Marked OK / WATCH / FIX / NO DATA at each later grab. Thresholds are set against
the settled baseline above, **not** against a threshold picked afterwards.

| # | Signal | Pre-update value (08-27) | Broken if | First readable |
|---|---|---|---|---|
| 1 | `ErrorCount` / day | **3.24M** (6-day plateau 3.2–4.0M) | **> 8M for a full day after 08-29** — i.e. the −89% improvement is given back. Deploy-day spike is expected and excluded | 08-29 |
| 2 | `ErrorCount` / half hour | 60–95K in the UTC afternoon band | still > 2× the 08-27 same-slot value **24 h after** the publish | T+2h, judged 08-29 |
| 3 | New `MessageHash` on v606/v607 | n/a | **any signature with real volume** carrying a v606/v607 first-seen stamp | T+2h |
| 4 | `ClientCrashCount` | 3,314 | > 4,800 (1.45×) on a full day, DAU-normalised | 08-29 |
| 5 | `ClientCrashRate15m` | **2.46%** (band 2.3–2.9%) | **> 3.45%** (1.4× baseline) | 08-29 |
| 6 | `OomUnexpectedExits` | 971 | > 1,450 per day at flat-or-lower DAU | 08-29 |
| 7 | `ClientCpuTimeAvg` | **93** — *anomalous, see above*; pre-anomaly band 37–50 | > 110, **or** still ~93 on 08-29 (then the 08-27 step is a real regression, not a spike) | 08-29 |
| 8 | `ClientFpsP10` | 25.32 | < 22 | 08-29 |
| 9 | `AverageSessionLengthMinutes` | **10.36 min** | **< 9.3 min** for 2 settled days | 08-29 |
| 10 | `ForwardD1Retention` | **14.50%** (7-day avg 14.71%) | **< 13.0%** for 2 settled days — the metric that matters most here, since reach is falling for unrelated reasons | 08-31 |
| 11 | `AverageRevenuePerUser` (ARPDAU) | **R$ 0.34** | **any** move below R$ 0.29, or above R$ 0.42 unexplained | 08-29 |
| 12 | `PayingUsersCVR` | **0.60%** | < 0.52% for 2 settled days | 08-29 |
| 13 | `ServerCrashCount` | 3 (08-20); **empty 200 across the window** | any day > 50 | T+2h |
| 14 | Funnel `FirstMorph` | **94.7%** 7d mean | < 89.7% (−5 pp) on a settled day | 08-29 |
| 14b | Funnel `BaseUpgrade4` / `BaseUpgrade8` | **63.9%** / **78.4%** 7d mean | either < 58.9% / 73.4%. **A rise here is the success signal** if v607 touched upgrade pacing | 08-29 |
| 14c | Any other of the 20 steps | see [`funnels-pre-update.md`](funnels-pre-update.md) | daily rate falls > 5 pp below its own 7-day pre-update mean | 08-29 |
| 15 | Downvote rate | Feedback Votes 37/day (08-27) | downvote share above v605's | 08-29 (needs a dashboard export) |

**Tripwire 13 note.** `ServerCrashCount` returned **200 with zero data points**
across this whole window — at `OneDay`, by `CrashType`, and at `HalfHour`. Under
this repo's standing rule that is *the query matched nothing*, not proof of zero
server crashes. Given the 1.06M-crash incident this universe had on 2026-08-01,
treat a silent `ServerCrashCount` as unverified, not as health, and confirm on
the dashboard.

---

## Four things that will look like breakage tomorrow and are not

1. **The publish-path server-error spike.** A deploy day spikes server
   `ErrorCount` 20–50× and returns to baseline within 24 h. Only a finding if it
   is *still* elevated on 08-29.
2. **The restart dip in concurrents.** v607 cycled every server at ~15:00–15:30 UTC.
   CCU dips and partially recovers over the following hour. Compare against
   today's own pre-15:00 slope, not against yesterday's peak.
3. **Today's partial day and partial half-hour.** 2026-08-28 is in progress and
   reads low everywhere. Also drop the final `HalfHour` bucket always — PCU
   carries its last value forward into it (F19).
4. **Version adoption.** v606/v607 error counts climb for 1–3 h purely as servers
   cycle onto the build. Rate per player, not raw count.

And one specific to this game: **DAU and revenue will be down tomorrow**
regardless of v607, because they have fallen every day for a fortnight on falling
impressions. That is tripwire-exempt; retention is what tests the build.

---

## Errors — volumes only, and why there is no text

`ErrorCount` on 08-27 was **3,238,196** events across **5,384 distinct
`MessageHash` signatures** in the captured window.

**We have no message text.** The `errorReporting.dimensions/MessageHash` lookup
answers **HTTP 500** on this universe (F17), and Open Cloud serves no error text
at all. The only route to a message body is the **Creator Dashboard export**, and
none has been taken since `errors_2026-08-24_1831_v600.csv` — four builds ago.

**Action, and it needs you:** export *Errors and warnings by count* for this game
now (pre-update, filtered to v605) and again at T+2h (filtered to v606/v607).
Without the second one, tripwire 3 cannot be evaluated at all — a new signature
is only visible with its text and first-seen version. Leave them in Downloads and
I will file them to `data/exports/9963622286-become-a-brainrot/errors/`.

Signature volumes as captured: [`../../data/games/9963622286/errors.md`](../../data/games/9963622286/errors.md).

---

## Watchlist with dates

| When | What | Why |
|---|---|---|
| **Today ~17:15 UTC (T+2h)** | Error/crash grab, half-hour resolution. Dashboard error export filtered to v606/v607 | The only honest questions at T+2h: is it throwing, is it crashing |
| **2026-08-29** | Full grab after the UTC day rolls | First real read: DAU, revenue, session length, crash rate, CPU |
| **2026-08-31** | D1 for the 08-29 cohort | The first cohort that is entirely v607, settled |
| **2026-09-04** | D7 for the 08-28 cohort | Repeat-play test |

## Questions for the studio

1. **What shipped in v606/v607?** Nothing here can grade a build blind. A one-line
   changelog turns every tripwire from "something moved" into "the thing we
   changed moved".
2. **Was v606 a bad publish you immediately hotfixed with v607?** The deploy log
   says v606 ran for one half-hour bucket and stopped, which is consistent with
   that. Confirming it matters, because 29,218 error events are attributed to it
   and they should be excluded from the T+2h read either way.
3. **Did anything change on 2026-08-27** — a Studio setting, a package update, a
   Roblox engine release? That is the day client CPU time doubled.
4. **Is the 08-22 spike a Roblox experience event?** It carries 12.8M RSVPs. If it
   recurs on a schedule, the post-update window needs to avoid it.
