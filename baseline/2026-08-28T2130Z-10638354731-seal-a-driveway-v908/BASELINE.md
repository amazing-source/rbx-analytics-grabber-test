# Update baseline — Seal A Driveway [RELEASE 🛢️] (`10638354731`)

**Update: v901 → v908, published 2026-08-28 between 21:00 and 21:30 UTC.**
Single place `120014184236770`. Previous live build **v901** (shipped 2026-08-18,
live for ten days — the longest-lived build this game has had).

Unlike the other two updates in this batch, this is a **single clean publish**:
`ErrorCount` by `PlaceVersion` at half-hour resolution
([`deploy-log.md`](deploy-log.md)) shows **v908 first in the 21:30 bucket**
(279,125 events) and no intermediate version. **Adoption was complete by the
following morning** — measured, not assumed: across the 08:30–11:00 buckets on
08-29 the version split is **100.0% v908**, with a single stray v901 event in the
10:30 bucket. Every 08-29 number is a clean read on the new build.

| | |
|---|---|
| Baseline grab | 2026-08-29 **11:01:05–11:07:51 UTC**, Open Cloud, window 2026-08-01 → 2026-08-30 |
| Requests | 128 requested · **101 returned data** · 22 empty 200 · 5 failed · 39 not served by Open Cloud |
| Failures | **all 5 are inferred `PlaceVersion` breakdowns** on metrics that do not support that dimension (400, `optional: true`). **0 failures on observed/proven shapes.** Nothing here is missing data about the game |
| Baseline frozen at | **2026-08-27** — the last day that closed before the publish |
| Gates at grab time | `npm test` **44/44** · `npm run audit-plan` **140 templates, 0 failures** · `npm run verify` **23 pass / 2 fail / 8 skip, exit 1** (both fails the documented `KNOWN_OPEN` pair) |

> **This is a T+13h baseline, not a pre-publish one.** The publish was reported
> late, so the grab ran the morning after. It is still a valid freeze: every
> number quoted as "before" comes from a UTC day that closed **before** 21:00 on
> 2026-08-28, so no post-update player is inside it.
>
> **2026-08-28 is 89% pre-update** (publish at 21:00 of a 24-hour day). It is
> shown for continuity and is **never** used as a post-update measurement. The
> first UTC day that genuinely tests v908 is **2026-08-29**, still in progress —
> so the real read is **tomorrow**.

---

## Bottom line

- **Nothing is broken by v908 on the evidence available at T+13h.** Errors per
  concurrent player are **+1.8%** against the mean of the two pre-update days —
  inside noise. Crash rate actually fell (0.48% → 0.44%). Concurrents on 08-28
  set an all-time high (8,968) and 08-29 is running second-highest.
- **Read every post-update number against a game in a violent scale-up, not a
  decline.** DAU **+364% w/w** (76,807 on 08-20 → **356,255** on 08-27); revenue
  **+225%**; impressions **+525%**. Every *rate* on this game is falling purely
  from dilution — ARPDAU −30%, payer conversion −27%, session length −22% — and
  **they will keep falling tomorrow whatever v908 does.** That is the single
  biggest trap in this report.
- **The one thing to act on: `DevProduct` revenue is 5.3% of this game's income,
  and the 28.08 spec is almost entirely dev products.** If that spec is what
  shipped, tripwire 1 measures whether it worked, and it is the highest-value
  number on the game. See the next section.
- **Cannot be answered yet:** DAU, revenue, session length and payer conversion
  for 2026-08-29 (read on 08-30); D1 for the first fully-post-update cohort
  (**2026-08-31**); D7 (**2026-09-05**).

---

## What shipped is not confirmed, and the spec is a monetization update

The **28.08 spec** handed over for this game lists five items, and four of them
are dev products:

| Spec item | Product type | Metric that tests it |
|---|---|---|
| Skip rebirth button — **79 R$** | dev product | `DevProduct` revenue, rebirth funnel steps |
| Instant Coat offer on the main screen | dev product (existing product, new placement) | `DevProduct` revenue, `PayingUsersCVR` |
| D7 rework — Unlock All **119 R$**, new D3/D7 rewards | dev product + retention | `DevProduct` revenue, `ForwardD7Retention` |
| Cash packs — **19 / 29 / 129 / 399 / 699 R$** | dev product | `DevProduct` revenue, `PayingUsersCVR`, `ARPPU` |
| Cash redirect when short of cash | funnel | `PayingUsersCVR`, funnel steps |

**This has not been confirmed as v908's content** — the user's note says the spec
is upcoming work, and the store description carries no changelog. But the spec is
the only hypothesis available, it is testable, and it is cheap to pre-register
against. Every tripwire below is set so that it reads correctly whether or not
the spec shipped.

**Why the split matters so much here.** Revenue by `RevenueSource` on 08-27:

| source | R$ | share |
|---|---|---|
| `GamePass` | **651,525** | **94.5%** |
| `DevProduct` | 36,416 | 5.3% |
| `PrivateServer` | 1,338 | 0.2% |
| `CommissionAvatar` | 30 | 0.0% |

The handover baseline called this out as the structural risk: **revenue is a
one-time toll, not a loop.** A 19 R$ cash pack is a far lower entry price than a
gamepass, so if the spec shipped the expected signature is **payer conversion up
and ARPPU down at the same time** — that combination is success, not a warning.
ARPPU falling *without* conversion rising is the failure case. Tripwires 1–4 are
written to separate those two.

---

## All metrics before the update

Full table — every metric with a settled headline daily series, latest settled
value and 7-day delta: **[`series/metric-table.md`](series/metric-table.md)**
(46 metrics). Raw settled points: **[`series/headline-daily.csv`](series/headline-daily.csv)**
(813 rows, `ONE_DAY` only, `FILLED_ZERO` and `partial` dropped). Corpus summary
at grab time: [`summary-at-grab.md`](summary-at-grab.md). Every attempt,
including the 39 skips: [`grab-report.md`](grab-report.md).

The headline rows:

| Rung | Metric | Kind | 2026-08-27 | Δ7d |
|---|---|---|---|---|
| Discovery | Impressions (unique users) | volume | 3.14M | ▲ 525.5% |
| Discovery | End-to-End Conversion | rate | 10.49% | ▼ 25.8% |
| Discovery | RFY Play Days (L7) | rate | 1.35 | — |
| Discovery | Feedback Votes | volume | +146 | ▲ 102.8% |
| Retention | Day 1 Retention | rate | **14.11%** (08-26) | ▼ 4.0% |
| Retention | Day 1 Retention (7-day avg) | rate | 13.83% (08-26) | ▲ 36.8% |
| Retention | Day 7 Retention | rate | 2.12% (08-20) | ▲ 878.0% |
| Retention | Stickiness (DAU/MAU) | rate | 22.47% | ▼ 45.9% |
| **Monetization** | **ARPDAU** | rate | **R$ 1.9260** | ▼ 30.1% |
| Monetization | ARPPU | rate | R$ 177.02 | ▼ 4.6% |
| **Monetization** | **Payer Conversion** | rate | **1.09%** | ▼ 26.8% |
| Monetization | Daily Revenue | volume | R$ 689,309 | ▲ 224.6% |
| Monetization | Paying Users | volume | 3,894 | ▲ 240.4% |
| Engagement | Avg Session Length | rate | 15.63 min | ▼ 22.0% |
| Engagement | Playtime per Player | rate | 20.80 min | ▼ 17.8% |
| Engagement | Daily Active Users | volume | 356,255 | ▲ 363.8% |
| Engagement | Peak Concurrent | volume | 6,417 | ▲ 136.9% |
| Performance | Crash Rate (15m) | rate | **0.48%** | ▼ 8.7% |
| Performance | Avg FPS / FPS p10 | rate | 62.05 / 45.32 | ▼ 4.7% / ▼ 7.2% |
| Performance | Client CPU Time | rate | 7.90 | ▲ 76.2% |
| Performance | Crash Count | volume | 1,842 | ▲ 343.9% |
| Performance | Out-of-Memory Exits | volume | 135 | ▲ 285.7% |
| Performance | Script Errors | volume | 12.56M | ▲ 190.9% |

**Three readings that are not obvious from the table.**

*Every volume metric on the Performance rung is up 200–350% and none of it is a
regression.* Crash count, OOM exits and script errors all track DAU, which is up
364%. The only rate on that rung — **crash rate, 0.48%, down 8.7%** — is the one
that says what actually happened, and it says the game got slightly more stable
while quadrupling. **Rank by rate, never by count, on this game in particular.**

*Every monetization rate is falling and that is dilution, not decay.* ARPDAU ran
R$3.57 (08-21) → R$1.93; conversion 1.89% → 1.09%. Reach widened 525% in a week
and the new arrivals convert worse than the early adopters, which is the normal
shape of a title being scaled by the algorithm. **ARPDAU at R$1.93 is still ~5×
the rest of Indigo's portfolio.**

*D1 is holding through the scale-up, and that is the genuinely good news.* 14.11%
on 08-26 against a 7-day average of 13.83% — up 36.8% w/w — while DAU quadrupled.
Retention normally collapses under that kind of dilution. It did not.

---

## Daily series, last 11 settled days

Behavioural metrics lag ~2 days, so 08-28 is legitimately absent for DAU,
revenue, payers, session length and D1 — that is the lag, not a gap.

| date | DAU | PCU | Revenue | Payers | ARPDAU | ARPPU | CVR | Session | D1 | Errors | Crashes | Crash rate | OOM |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 08-18 | 20,450 | 635 | 39,061 | 250 | 1.9144 | 156 | 1.23% | 19 | 14.17% | 0.72M | 120 | 0.52% | 4 |
| 08-19 | 43,703 | 1,422 | 91,850 | 511 | 2.1013 | 180 | 1.17% | 19 | 14.71% | 1.50M | 227 | 0.50% | 14 |
| 08-20 | 76,807 | 2,709 | 212,337 | 1,144 | 2.7572 | 186 | 1.49% | 20 | 15.67% | 4.32M | 415 | 0.52% | 35 |
| 08-21 | 78,749 | 2,035 | 281,399 | 1,492 | **3.5674** | 189 | **1.89%** | 22 | 14.41% | 3.14M | 487 | 0.56% | 41 |
| 08-22 | 208,988 | 4,770 | 715,407 | 3,538 | 3.4095 | 202 | 1.69% | 19 | 14.19% | 8.64M | 1,346 | 0.61% | 89 |
| 08-23 | 208,144 | 4,574 | 719,329 | 3,778 | 3.4427 | 190 | 1.81% | 20 | 12.51% | 9.81M | 1,224 | 0.53% | 110 |
| 08-24 | 224,440 | 4,957 | 587,937 | 3,083 | 2.6477 | 191 | 1.39% | 18 | 12.40% | 11.32M | 1,277 | 0.54% | 101 |
| 08-25 | 243,487 | 5,284 | 557,116 | 3,051 | 2.2877 | 183 | 1.25% | 17 | 13.52% | 11.78M | 1,383 | 0.53% | 109 |
| 08-26 | 365,424 | 8,675 | 771,894 | 4,434 | 2.1033 | 174 | 1.21% | 16 | 14.11% | 14.46M | 1,996 | 0.51% | 170 |
| **08-27** | **356,255** | **6,417** | **689,309** | **3,894** | **1.9260** | **177** | **1.09%** | **15.63** | — | **12.56M** | **1,842** | **0.48%** | **135** |
| 08-28 † | — | **8,968** | — | — | — | — | — | — | — | 17.80M | 2,486 | **0.44%** | 234 |

† 89% pre-update. Shown for continuity, never as a post-update reading. PCU 8,968
is an all-time high and it was set **before** the 21:00 publish.

---

## Concurrents across the publish

`ccu-baseline`, matched half-hour slots **00:00–11:00 UTC** against 16 complete
prior days — full output in [`ccu-baseline-2026-08-29.txt`](ccu-baseline-2026-08-29.txt).
Today's mean over elapsed slots: **5,122**, rank **2 of 17**.

| baseline | n | base CCU | today vs base |
|---|---|---|---|
| same weekday (Sat) | 2 | 1,430 | +258.2% |
| last 7 days | 7 | 3,850 | **+33.0%** |
| last 14 days | 14 | 2,166 | +136.5% |
| all 16 days | 16 | 1,900 | +169.6% |

On the same elapsed-slot basis: **08-27 → 4,621 · 08-28 → 5,299 · 08-29 →
5,122**. Today is the second-highest day this game has had, 3.3% below
yesterday's record. **Every one of the 23 elapsed slots is up 82–249% on the
14-day median** — a uniformly positive profile, which is the signature of a game
whose audience is still growing rather than one recovering in particular hours.

**The 3.3% dip from 08-28 to 08-29 is not a post-update signal.** It is well
inside this series' day-to-day variance during the scale-up (08-24 → 08-25 moved
+1.4%, 08-25 → 08-26 +32%), and 08-28's record was itself set before the publish.
The public board is **up 2.8% since yesterday** (8,324,909 CCU across 283 games),
so there is no platform effect in either direction.

---

## Errors across the publish, normalised

Raw error counts across a publish are meaningless here above all — this game's
population quadrupled in a week. The table divides half-hour `ErrorCount` by
half-hour `PeakConcurrentPlayers` over **matched elapsed slots 00:00–11:00 UTC**,
final bucket dropped (F19).

| day | errors (00:00–11:00) | mean CCU | **errors / CCU** | vs 08-27 |
|---|---|---|---|---|
| 2026-08-27 (pre) | 5,375,559 | 4,621 | **1,163.3** | — |
| 2026-08-28 (pre — publish was 21:00) | 7,025,942 | 5,299 | **1,325.9** | +14.0% |
| **2026-08-29 (first post-update morning)** | 6,492,601 | 5,122 | **1,267.5** | +9.0% |

**Against the mean of the two pre-update days (1,244.6) the post-update morning
is +1.8%** — inside noise, and *below* the pre-update day that immediately
preceded it. **v908 has no error-rate signature at 13 hours.**

Note the shape: the error rate rose **+14% on 08-28, a day that was 89%
pre-update** — so that rise is not the deploy. It belongs to v901 and to the
scale-up. Reading 08-29's +9.0% against 08-27 alone would have attributed a
pre-existing move to this build.

The publish itself barely registered: the 21:30–23:30 buckets ran +33%, +67%,
+26%, +19%, +93% on the same slots the day before, and the settled 22:00–23:30
window went 202.2 → 243.7 errors/CCU (+21%) — a modest publish-path bump that was
gone by morning.

**One row to watch: `OomUnexpectedExits` 135 → 234 on 08-28** (+73% raw, ~+24%
after normalising by the +40% PCU). 08-28 is a pre-update day so this is not
v908, but it is the fastest-moving performance row on the game and it is climbing
through the scale-up. Tripwire 8.

---

## Funnel before the update

Four funnels (`Onboarding`, `Progression`, `MapReach 2`, `MapReach`), pulled with
the async polling shape and no `FunnelName` filter — table and method in
[`funnels-pre-update.md`](funnels-pre-update.md).

| # | Step | Users | Step-to-step (merged) | Daily rate, pre-update mean |
|---|---|---|---|---|
| 1 | `Neighbourhood` | 5,880,565 | 100.00% | 100.0% |
| 2 | `ReachedDriveway` | 3,859,230 | 65.63% | **67.0%** |
| 3 | `PouredOut` | 2,453,926 | 63.59% | **42.9%** |
| 4 | `FirstPass` | 2,277,544 | 92.81% | **39.9%** |
| 5 | `DrivewaySealed` | 2,156,739 | 94.70% | **38.0%** |
| 6 | `Complete` | 1,716,992 | 79.61% | **46.5%** |

**Never quote the merged rate as the Onboarding funnel's.** With no working
`FunnelName` filter the steps come back as the union across all four funnels by
index, and `MapReach`'s much larger step 1 dilutes everything below it. The
dashboard's own Onboarding funnel runs **98.15% at `ReachedDriveway` and 77.30%
end to end** — versus 65.63% merged for the same named step. Names, volumes and
**daily trends** are sound; the level is not (F22).

**Every step has drifted down 5–7 pp over the pre-update week** — `ReachedDriveway`
70.2% → 64.2%, `Complete` 50.1% → 42.7%. That is consistent with dilution as
reach widened 525%, not with a break, and it means **the tripwire threshold of
−5 pp is roughly one week of ordinary dilution on this game.** Fire it only if a
step falls faster than its own recent slope, or if one step moves while its
neighbours do not.

**Newest-day bias, measured.** Pulling the same dates twice, three days apart
(08-26 pull vs today's), every Seal step drifts **up** with age: 08-21 moved
+0.3 to +0.4 pp, and the then-newest day 08-25 moved **+1.0 to +1.5 pp**. So the
newest day reads about **1 pp low** and the 08-28 column in
[`funnels-pre-update.md`](funnels-pre-update.md) is understated by roughly that
much. Do not fire a funnel tripwire on a day less than two days old.

---

## Tripwires — pre-registered, before the post-update read

Marked OK / WATCH / FIX / NO DATA at each later grab. Thresholds are set against
the settled baseline above, **not** picked afterwards.

| # | Signal | Pre-update value (08-27) | Broken if | First readable |
|---|---|---|---|---|
| **1** | **`DailyRevenue` by `RevenueSource` = `DevProduct`, share of total** | **R$36,416 = 5.3%** | **This is the success metric, not a break test.** If the cash-pack / skip-rebirth spec shipped, share should rise above 8%. **Flat at ~5% two days running means the new products are not selling** | 08-30 |
| **2** | `PayingUsersCVR` | **1.09%** (falling on dilution, −27% w/w) | **< 0.95%** for 2 settled days. **A rise above 1.25% is the success signal** — a 19 R$ pack is a far cheaper entry than a gamepass | 08-30 |
| **3** | `AverageRevenuePerPayingUser` | **R$ 177.02** | Falling ARPPU is **expected and fine** if conversion rises with it. **ARPPU < R$150 while CVR stays ≤1.09% is the failure case** — cheap packs cannibalising gamepasses without recruiting new payers | 08-30 |
| 4 | `AverageRevenuePerUser` (ARPDAU) | **R$ 1.9260** | **< R$ 1.50** for 2 settled days, at flat-or-rising DAU. Some further decline is dilution and is exempt | 08-30 |
| 5 | `ErrorCount` per concurrent player | **1,163.3** (00:00–11:00 matched slots) | **> 1,550 (1.33×)** sustained over a full elapsed-slot window | now — reads **1,267.5, OK** |
| 6 | New `MessageHash` on v908 | n/a — **no export since v884** | **any signature with real volume** carrying a v908 first-seen stamp | needs a dashboard export |
| 7 | `ClientCrashRate15m` | **0.48%** (band 0.44–0.56%) | **> 0.67%** (1.4× baseline) | 08-30 |
| **8** | **`OomUnexpectedExits` per 1,000 PCU** | **135 / 6,417 = 21.0** | **> 31** (1.5×). Already at 26.1 on 08-28 pre-update — **this is the fastest-moving row on the game** | 08-30 |
| 9 | `ClientCrashCount` per 1,000 PCU | 1,842 / 6,417 = 287 | > 400 | 08-30 |
| 10 | `ClientFpsP10` | 45.32 | < 40 | 08-30 |
| 11 | `AverageSessionLengthMinutes` | **15.63 min** | **< 14.0 min** for 2 settled days. A *rise* would be the D7-rework success signal | 08-30 |
| 12 | `ForwardD1Retention` | **14.11%** (7-day avg 13.83%) | **< 12.4%** for 2 settled days | **08-31** |
| 13 | `ForwardD7Retention` | **2.12%** (08-20) | < 1.7%. **The D3/D7 reward rework is tested here and nowhere else** | **2026-09-05** |
| 14 | Funnel `ReachedDriveway` / `Complete` | **67.0% / 46.5%** pre-update means | either > 5 pp below its own mean on a day **≥2 days old**, *and* falling faster than its recent dilution slope | 08-31 |
| 15 | Any other of the 6 steps | see [`funnels-pre-update.md`](funnels-pre-update.md) | daily rate > 5 pp below its own pre-update mean on a day ≥2 days old | 08-31 |
| 16 | Feedback votes | **+146 on 08-27** | net votes turning negative | 08-30 |

---

## Four things that will look like breakage tomorrow and are not

1. **The publish-path error spike.** Already observed and already decayed — the
   settled 22:00–23:30 window ran +21% and was back to baseline by morning. It is
   only a finding if it is *still* elevated on 08-30.
2. **The restart dip in concurrents.** v908 cycled every server at ~21:00–21:30
   UTC. Compare against that day's own pre-21:00 slope.
3. **Today's partial day and partial half-hour.** 2026-08-29 is in progress and
   reads low everywhere. Drop the final `HalfHour` bucket always (F19), and pass
   `--slots` bounded by the current UTC hour to `ccu-baseline` (F24).
4. **Every performance *volume* row rising.** Crash count, OOM exits and script
   errors all track DAU, which is up 364% w/w. Normalise before reading any of
   them — the rate rows say the opposite of the count rows on this game.

And one specific to this game: **ARPDAU, payer conversion and session length will
be down again tomorrow regardless of v908**, because reach is still widening and
each new cohort converts worse than the last. Those three are exempt from a
straight "it fell" reading — what matters is whether they fall *faster* than the
dilution slope, and whether `DevProduct` share moves.

---

## Errors — volumes only, and why there is no text

`ErrorCount` on 08-27 was **12,562,464** events; 08-28 was 17,802,720, of which
**8,589,646 are stamped v908**.

**We have no message text.** The `errorReporting.dimensions/MessageHash` lookup
answers HTTP 500 (F17) and Open Cloud serves no error text. The only route to a
message body is a **Creator Dashboard export**, and the newest one for this game
is `errors_2026-08-26_1721_v345-v884.csv` — which predates **v901**, the build
that had been live since 08-18.

The handover pass found this game's largest signature was a dead
`ContextActionService` binding at **10.5M events, 85% of its error volume**.
Whether that is still the top signature under v908 is exactly what a fresh export
would answer, and it would also tell you whether the 12.5M/day baseline is one
harmless bug or many real ones.

**Action, and it needs you:** export *Errors and warnings by count* filtered to
**v908**, and a second filtered to **v901** as the comparison. Leave them in
Downloads and I will file them to
`data/exports/10638354731-seal-a-driveway/errors/`.

---

## Watchlist with dates

| When | What | Why |
|---|---|---|
| **2026-08-30** | Full grab after the UTC day rolls | First real read: DAU, revenue, **`DevProduct` share**, conversion, ARPPU, crash rate |
| **2026-08-30** | Dashboard error export, v908 vs v901 | The only way to evaluate tripwire 6, and to re-check the 10.5M `ContextActionService` signature |
| **2026-08-31** | D1 for the 08-29 cohort; funnel steps at 2 days of age | First cohort entirely on v908 |
| **2026-09-05** | **D7 for the 08-29 cohort** | The only test of the D3/D7 reward rework |

## Questions for the studio

1. **What is actually in v908 — did the 28.08 spec ship, in whole or in part?**
   Four of its five items are dev products, and `DevProduct` is 5.3% of revenue.
   A one-line changelog turns tripwire 1 from "a number moved" into "the thing we
   changed moved".
2. **Were the cash packs priced as specified (19 / 29 / 129 / 399 / 699 R$)?**
   The expected signature — conversion up, ARPPU down — depends on the entry
   price actually being 19 R$.
3. **Is the desktop-specific crash from the handover baseline still open?** Crash
   rate is flat overall at 0.48%, but the handover found it concentrated on
   desktop and up 4× during the scale-up.
4. **Is anything scheduled that would explain OOM exits climbing faster than
   players?** 135 → 234 in a day, against PCU +40%.

---

## Post-update read — 2026-08-29 T+17h. Tripwire 6 CLEAR; a pre-existing core-loop defect found

A dashboard error export was filed at 14:07 local, covering v888 → v901:
`data/exports/10638354731-seal-a-driveway/errors/errors_2026-08-29_1407_v888-v901.csv`.

**It does not reach v908**, so it cannot evaluate tripwire 6 directly. The API
answers that question instead. `ErrorCount` filtered to
`FirstSeenPlaceVersion >= 908` — "errors this deploy introduced":

| date | all errors | introduced by v908 | share |
|---|---|---|---|
| 2026-08-27 | 12,562,464 | 0 | 0.0% |
| 2026-08-28 | 17,802,720 | **25** | 0.0% |
| **2026-08-29** | 7,179,160 | **539** | **0.0%** |

**539 events out of 7.18 million is 0.0075%.** v908 introduced essentially
nothing, and no v908 signature was large enough to enter the export's top 25.
**Tripwire 6 is CLEAR** — the cleanest post-update error result of the three
games in this batch. It is rising slowly and is worth one more look tomorrow, but
at this volume it is not a finding.

### The finding is pre-existing, and it is the core mechanic

| | |
|---|---|
| Signature | `[DrivewaySealer] Sealing is disabled: this place cannot use the Editable Image/Mesh APIs.`<br>`Fix: File > Game Settings > Security > turn on "Allow Mesh & Image APIs", then republish.` |
| Severity | Warning |
| First seen | **2026-08-18 21:22 UTC**, version **v901** |
| Volume in export | **132**, plus a paired `EditableImage is not accessible. Go to the Security Tab in Experience Settings to enable this API.` at **176** |

**Sealing the driveway is what this game is.** The store description sells "real
coverage — every stroke counts and missed patches show", and that coverage is
painted with the Editable Image API. When this fires, the sealer is **disabled**
and the player is in a game whose core verb does nothing.

**The message names its own fix**, which makes checking it nearly free: *File >
Game Settings > Security > "Allow Mesh & Image APIs"*, then republish.

**Two honest caveats, and they matter.**

1. **This cannot be failing for everyone.** The game earned R$689,309 on 08-27
   and DAU is up 364% w/w — a globally dead core loop would show up as a
   collapse, not a scale-up. So this is a minority path: a subset of servers, a
   race against capability initialisation, or a specific place/session type.
2. **Export counts are relative, not absolute.** 132 events ranks and dates the
   signature; it does not count affected players. The two instruments are not
   comparable — the API counted 12.5M errors on the same day the export tallies
   3,943 across all 25 signatures.

**What to do with it anyway.** Severity is set by mechanism, not by count: if
even 0.1% of sessions land on this path, that is ~356 players a day on 08-27's
DAU whose game does not work. Verifying a Game Settings toggle costs one minute
and the error text says exactly which one. **Confirm the setting, then re-check
whether the signature is still produced after the next publish.**

A related pair sits underneath it: `EditableImage:WritePixelsBuffer expects
position size to be within EditableImage bounds` (110 events, v890) is a bounds
bug in the same painting code, and it is a genuine coding defect rather than a
settings one.

### Second finding — the camera breaks every render step for whoever hits it

| | |
|---|---|
| Signature | `StarterPlayer.PlayerModule.CameraModule.ZoomController:88: invalid argument #3 to 'clamp' (max must be greater than or equal to min)` |
| First seen | **2026-08-27 17:08 UTC**, version **v901** — the day *before* this update |
| Volume | **163**, plus an identical 163 wrapped in `RunService:fireRenderStepEarlyFunctions unexpected error while invoking callback:` |

Two signatures at exactly the same count are the same fault seen from inside and
outside the render-step handler. `clamp(x, min, max)` with `max < min` means the
zoom limits are inverted — most often `CameraMinZoomDistance` set above
`CameraMaxZoomDistance`, or a per-vehicle override applied in the wrong order.
Because it throws from `fireRenderStepEarlyFunctions` it fires **every frame**
for an affected player, so the camera stops responding to zoom.

**It is pre-existing** — first seen 08-27, before the publish — so it belongs in
the baseline, not to v908. It is on the watchlist because the truck/rig code is
the obvious place for a zoom override, and this game's whole loop is driving.

### Everything else in the export is noise or self-healing

- `Maximum event re-entrancy depth exceeded … CoreGui.RobloxGui.Modules.Settings`
  (518) — that is **Roblox's own settings menu**, not our code.
- `Failed to load sound:` TlsVerificationFail (303), HTTP 502 (225), error code 14
  (187), **`Authentication required to access Asset`** (159). The last one is the
  only one worth a look — it means a sound asset is not public.
- `[TruckServer] a rig was N studs into the ground -- lifted out` (~1,100 across
  many rows, v888–v892) — the server detecting and **fixing** the problem itself.
  Informational.
- `Script timeout: exhausted allowed execution time` (135, v888) — worth watching
  if it returns on v908.

### Tripwire status at T+17h

| # | Signal | Status |
|---|---|---|
| 5 | `ErrorCount` per concurrent player | **OK** — 1,267.5 vs 1,163.3 baseline, +1.8% on the two-day pre mean |
| **6** | **New `MessageHash` on v908** | **CLEAR** — 539 events, 0.0075% of the day |
| 1–4, 7–11, 16 | monetization / performance | **NO DATA** until 08-30 |
| 12, 14, 15 | D1 and funnel steps | **NO DATA** until 08-31 |
| 13 | D7 | **NO DATA** until 09-05 |

_Read 2026-08-29 ~14:20 UTC._

---

## Post-update read — 2026-08-30 T+2d. Tripwire 5 FIRED; v908 is not the cause

Full Open Cloud re-grab 2026-08-30 16:27–16:33 UTC, window 08-03 → 08-31.
**107 of 128 requests returned data, 0 failures on observed/proven shapes.**
Gates: `npm test` 44/44 · `audit-plan` 140 templates, 0 failures · `verify`
23/2/8 (the held pair).

**v908 is at 100% adoption** on 08-29 and 08-30 (15,140,926 / 11,532,104 events
against v901 = 69 / 3).

### The scale-up peaked on 08-28 and is unwinding

| date | DAU | PCU | impressions | errors/CCU | votes |
|---|---|---|---|---|---|
| 08-27 (baseline) | 356,255 | 6,417 | — | 1,165.4 | +146 |
| 08-28 (publish day) | **533,776** | **8,968** | 4.89M | 1,325.9 | +76 |
| **08-29** | **~419,000** *(projected)* | 6,823 | **4.01M** (−18.0%) | 1,316.0 | +27 |
| 08-30 (part day) | — | — | — | **1,786.5** | — |

DAU for 08-29 is projected from `UniqueUsersWithPlaySessions` (418,800) at a
ratio of 0.9966 ± 0.010 — **±1.0%**. Impressions −18% and sessions −22.7% say
the pullback is **reach**, the same mechanism as the rise.

### Tripwire status at T+2d

| # | Signal | Value | Status |
|---|---|---|---|
| **1** | **DevProduct share of revenue** | 5.3% → **8.7%** (R$36,416 → **R$62,617**, +72%, while GamePass was flat +0.3%) | **SUCCESS THRESHOLD MET — but see the caveat** |
| 2 | PayingUsersCVR | **0.79%** (08-28) vs 0.95% floor | **WATCH** — one day, 87% pre-update, and dilution-exempt |
| 3 | ARPPU | **R$168.35** (08-28) vs R$150 floor | OK |
| 4 | ARPDAU | **R$1.3348** (08-28) vs R$1.50 floor | **WATCH** — one day, at +50% DAU in that day alone |
| **5** | **Errors per concurrent player** | 1,165 → 1,326 → 1,316 → **1,786.5** (08-30) vs **1,550 ceiling** | **FIRED** |
| 6 | New signature on v908 | `>= 908`: 25 → 1,007 → 416 | **CLEAR** — 0.003% of the day, and falling |
| 7 | ClientCrashRate15m | **0.45%** (08-29) | OK (ceiling 0.67%) |
| 8 | OOM per 1,000 PCU | 21.0 → 26.1 → **27.7** | **WATCH** — ceiling 31, still the fastest-moving row |
| 9 | Crash count per 1,000 PCU | **298** (08-29) | OK (ceiling 400) |
| 10 | ClientFpsP10 | **46.63** (08-29) | OK (floor 40) |
| 11 | Session length | **13.90** (08-28) vs 14.0 floor | **WATCH** — one day, 87% pre-update |
| 12 | ForwardD1Retention | 12.71% (08-27) | **NO DATA** until 08-31 |
| 13 | ForwardD7Retention | — | **NO DATA** until 09-05 |
| 14 | Funnel `ReachedDriveway` / `Complete` | **−4.1 pp / −5.5 pp** on 08-28 | **WATCH** — uniform dilution, not a step break |
| 15 | Other steps >5 pp down | none | OK |
| 16 | Feedback votes | +146 → +76 → **+27** | OK, but decaying |

### Tripwire 5 fired, and the cause is not the new build

Three facts separate them. **v908-introduced errors are 416 events on 08-30** —
0.003% of the day, and *down* from 1,007. The rise is in pre-existing
signatures. **It is bursty, not a step**: on matched half-hour slots against
08-27, 03:30 ran 3.32×, 07:00 3.06× and 11:00 3.02×, while 07:30–10:00 ran
*below* 08-27 (0.86–0.97×). A regression in a shipped build costs the same share
of every bucket. **And CCU fell while errors rose** — 4,804 mean CCU on 08-30
against 5,129 on 08-29 — so the ratio moved on both terms.

**This needs a `MessageHash`-level read, which the API cannot serve** (the async
dimension lookup 500s on this universe). **Export *Errors and warnings by count*
filtered to v908 for 08-30** — that is the only route to which signature is
bursting.

### The DevProduct caveat, and it is load-bearing

**08-28 is 87% pre-update** — v908 published at 21:00 UTC. A DevProduct share
that doubles on that day **cannot be attributed to v908**. Either the cash-pack
products were enabled on an earlier build, or the mix shifted with the audience.
Per-DAU the split is unambiguous — GamePass revenue per DAU fell 33% while
DevProduct rose 15% — so something real changed in the mix, but not on this
build's evidence. **08-29 is the first clean day and its revenue lands 08-31.**

_Read 2026-08-30 ~17:00 UTC._

---

## Post-update read — 2026-08-31 T+3d. The update worked; tripwire 5 cleared itself

Full Open Cloud re-grab 2026-08-31 13:05–13:14 UTC, window 08-04 → 09-01.
**203 requests, 135 returned data, 5 failed.** Gates on the day: `npm test`
44/44 · `npm run audit-plan` **175 templates**, 0 failures · `npm run verify`
23 pass / 2 fail / 8 skip (the held pair).

**2026-08-29 is the first clean day and its revenue landed this morning** — the
DevProduct attribution that was explicitly unresolvable at T+2d is now settled.

### The monetization update, on the clean day

| measure | 08-27 | 08-28 (87% pre) | **08-29** | 08-30 |
|---|---|---|---|---|
| DevProduct revenue | R$36,416 | R$62,617 | **R$205,595** | R$202,296 |
| DevProduct share | 5.3% | 8.7% | **25.4%** | 24.6% |
| GamePass revenue | R$651,525 | R$653,749 | R$602,926 | R$617,720 |
| **Total revenue** | R$689,309 | R$718,003 | **R$810,220** | **R$822,060** |
| PayingUsersCVR | 1.09% | 0.79% | 1.16% | **1.29%** |
| Paying users | 3,894 | 4,265 | 4,820 | **5,315** |
| ARPPU | R$177.02 | R$168.35 | R$168.10 | R$154.67 |
| ARPDAU | R$1.9260 | R$1.3348 | R$1.9450 | **R$1.9957** |

**+465% DevProduct revenue, +17.5% total, +36% payers, at slightly lower DAU.**
GamePass gave back 5% — real but modest cannibalisation. The pre-registered
failure case (ARPPU < R$150 *while* CVR ≤ 1.09%) did not occur: cheap packs
**recruited** payers rather than discounting existing ones.

### Tripwire status at T+3d

| # | Signal | Value | Status |
|---|---|---|---|
| **1** | **DevProduct share** | 5.3% → **25.4%** / 24.6% | **SUCCESS** (bar 8%) — attribution now confirmed on a clean day |
| **2** | **PayingUsersCVR** | **1.16%** (08-29), **1.29%** (08-30) | **SUCCESS** (floor 0.95%, success mark 1.25%) |
| 3 | ARPPU | R$168.10 → **R$154.67** | OK — failure case needed CVR ≤1.09% too; conversion rose |
| 4 | ARPDAU | **R$1.9450** / **R$1.9957** | OK (floor 1.50) — above the 08-27 baseline |
| **5** | **Errors per concurrent player** | 1,786.5 (08-30) → **1,222.8** (08-31) | **CLEARED** — was FIRED; ceiling 1,550 |
| 6 | New signature on v908 | 25 → 1,007 → **563** | OK — decaying, a deploy artefact |
| 7 | ClientCrashRate15m | **0.42%** (08-30) | OK (ceiling 0.67%) — best in window |
| 8 | OOM per 1,000 PCU | 27.7 → **21.7** | **OK** — was WATCH; back to the 21.0 baseline |
| 9 | Crash count per 1,000 PCU | **265** (08-30) | OK (ceiling 400) |
| 10 | ClientFpsP10 | **47.70** (08-30) | OK (floor 40) — best in window |
| 11 | Session length | **15.01** (08-29), 14.78 (08-30) | **OK** — was WATCH (floor 14.0) |
| **12** | **ForwardD1Retention** | 11.19% (08-28), **11.68%** (08-29) | **FIRED** — below the 12.4% floor two days; qualified below |
| 13 | ForwardD7Retention | — | **NO DATA** until 2026-09-05 |
| 14 | Funnel `ReachedDriveway` / `Complete` | 60.8% / 37.5% (08-31) | **OK** — below mean but *decelerating*; second clause not met |
| 15 | Other steps >5 pp down | all move together | OK |
| 16 | Feedback votes | +146 → +76 → **+27** | OK, still positive, decaying |

**Tripwire 5 was a one-day burst.** The T+2d call ("bursty, not a step, and
v908 is not the cause") is confirmed: it returned to +4.9% over baseline on its
own with no intervention. The requested v908-filtered export for 08-30 is now a
post-mortem, not urgent.

**Tripwire 14 is saved by its second clause**, which is why the clause was
written:

| step | slope 08-20 → 08-28 | slope 08-28 → 08-31 | verdict |
|---|---|---|---|
| `ReachedDriveway` | −0.98 pp/day | **−0.73 pp/day** | decelerating |
| `Complete` | −1.20 pp/day | −1.27 pp/day | unchanged within noise |

Every step declines together and has since 08-20, eight days before the publish
— dilution from the scale-up, not a step break. The newest two days are also
biased ~1–4 pp low on this game and settle up, and the pre-update mean is
itself the mean of a falling series.

**Tripwire 12 fired as written; three things qualify it.** 08-28 is 87%
pre-update; the turn is on **08-26** (14.11% → 12.71% → 11.19%), two days
before the publish; and 08-29 is already recovering off the trough. By source
(08-27 → 08-29): Home 13.20 → 12.07, Friends 9.24 → 8.59, Others 11.40 → 10.80,
Search flat. A fall on 3 of 4 sources rules out traffic mix — **the game is
holding fewer of everyone — but it began before v908.**

### The finding: appeal eroding at the first session

First pull of the 20 RFY ranking signals:

| signal | 08-24 | 08-26 | 08-27 | 08-28 | 08-29 | move |
|---|---|---|---|---|---|---|
| `RFYPlayThroughRate` | 2.93% | 2.83% | 2.77% | 2.31% | **2.02%** | **−31%** |
| `RFYDuration0To60` | 11.87% | 13.60% | 13.40% | 14.51% | **14.58%** | **+23%** |
| `RFYDuration61To180` | 21.04% | 22.55% | 23.02% | 24.89% | **25.03%** | **+19%** |
| `RFYD1Playtime` | 17.00 | 15.40 | 15.10 | 13.66 | **14.35** | **−16%** |
| `RFYD2To7PlayDays` | 0.349 | 0.394 | 0.369 | 0.333 | 0.341 | flat |
| `RFYL7PlayDays` | 1.324 | 1.376 | 1.354 | 1.322 | 1.329 | flat |

**Nearly 40% of RFY first plays now end inside three minutes** (14.58% + 25.03%),
up from 32.9% a week earlier. Return play is flat — **the exact inverse of
Verity**, and it needs the opposite fix.

**Dilution tested and rejected as the whole story:** a reach doubling
mechanically lowers play-through, but when impressions fell 18% on 08-29, PTR
fell a further 12.5% instead of recovering. Six days, one game, no baseline —
a watch item, not yet a trend.

### What to act on

1. **The first three minutes, not the funnel.** The funnel steps dilute
   uniformly and name no defect; the bounce signals say players leave before the
   core verb.
2. **Ship nothing else before 09-05 if it can wait** — a new `PlaceVersion`
   between now and then sits between the D3/D7 rework and the only day it can
   be read on.
3. `[DrivewaySealer] Sealing is disabled` still names its own fix (Game Settings
   → Security → allow Mesh & Image APIs). Low volume, core verb, free.

Report: https://claude.ai/code/artifact/0eacd493-3d0c-47d5-a1ca-34a24061f650

_Read 2026-08-31 ~13:30 UTC._

### Update — 2026-08-31 ~17:00 UTC. The first-session cause is named, not pending

The T+3d report said the fix waited on the written feedback export. It does not.
The v908 defect report
(https://claude.ai/code/artifact/bd164212-5432-42f8-99f6-334d1ba346d0) traced
**10 faults to source, 9 confirmed**, and three sit on the first session:

- `DrivewayClient:179` — **no desktop quality preset.** Touch gets a coarser
  grid and ~4x less per-frame work; desktop has no rung below maximum. Measured:
  `Script_DrivewayClient` is **72-85% of the whole foreground thread** and the
  engine classified **100% of frames CPU-bound**, GPU never past 2.3 ms.
- `SurfaceGrid:1596` — **the blade sweep is exempt from the frame budget.**
  0.9 ms on a bare slab, **12 ms flooded**, and **2.8x** when swept diagonally.
  Reproduces on a stock blade at level one.
- `DrivewaySurface:56` — sealing disabled by a place setting; the warning names
  its own fix. Minority path, core verb, one checkbox, needs a republish.

**Two further issues, observed in play and NOT in that report:**

1. **The mobile tutorial UI is too large.** It obscures what it points at, on
   the majority platform, at the exact step the funnel loses players.
2. **The tutorial takes about three minutes to reach the core verb.** This and
   `RFYDuration0To60` + `RFYDuration61To180` = **39.6%** are the same event
   described from opposite sides. This is the finding the data was pointing at.

**Two figures corrected in the report.** Total revenue 08-27 to 08-30 is
**+19.3%** (689,309 to 822,060) on **16% MORE** DAU (356,255 to 411,920), not
fewer — the earlier "+17.5% on fewer daily players" mixed the 08-29 total with
the 08-28 DAU. **ARPDAU +3.6% (1.9260 to 1.9957) is the growth-proof number.**
And errors per CCU on 08-30 is **1,786**; 1,223 is the 08-31 clearing value.

Report republished at the same URL, with every Roblox series name restored and
the tripwire scoring taken out (producer asked for metric names, not glosses):
https://claude.ai/code/artifact/0eacd493-3d0c-47d5-a1ca-34a24061f650
