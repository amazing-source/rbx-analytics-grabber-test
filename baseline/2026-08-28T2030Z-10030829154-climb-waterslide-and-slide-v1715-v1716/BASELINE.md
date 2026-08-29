# Update baseline — Climb Waterslide and Slide (`10030829154`)

**Update: v1715 → v1716, published 2026-08-28 between 20:30 and 21:00 UTC.**
Root place `139617346573330`. Previous live build **v1711** (shipped 2026-08-24).

**Two publishes half an hour apart, and the deploy log settles which build is
live.** `ErrorCount` by `PlaceVersion` at half-hour resolution
([`deploy-log.md`](deploy-log.md)) shows **v1715 first in the 20:30 bucket**
(24,112 → 11,823 at 21:00 → 10 at 21:30, then nothing) while **v1716 appears at
21:00** and is still accruing at the 11:00 bucket on 08-29 (965,571 events).
v1715 was superseded inside one half hour. Everything after 21:30 belongs to
**v1716**, and v1715's 35,945 events must be excluded from any post-update read.
**Adoption was complete by the following morning** — measured: across the
08:30–11:00 buckets on 08-29 the version split is **100.0% v1716**.

| | |
|---|---|
| Baseline grab | 2026-08-29 **11:07:51–11:14:31 UTC**, Open Cloud, window 2026-08-01 → 2026-08-30 |
| Requests | 129 requested · **118 returned data** · 6 empty 200 · 5 failed · 39 not served by Open Cloud |
| Failures | **all 5 are inferred `PlaceVersion` breakdowns** on metrics that do not support that dimension (400, `optional: true`). **0 failures on observed/proven shapes** |
| Baseline frozen at | **2026-08-27** — the last day that closed before the publish |
| Gates at grab time | `npm test` **44/44** · `npm run audit-plan` **140 templates, 0 failures** · `npm run verify` **23 pass / 2 fail / 8 skip, exit 1** (both fails the documented `KNOWN_OPEN` pair) |

> **This is a T+14h baseline, not a pre-publish one.** The publish was reported
> late, so the grab ran the morning after. Every number quoted as "before" comes
> from a UTC day that closed **before** 20:30 on 2026-08-28.
>
> **2026-08-28 is 85% pre-update.** It is shown for continuity and is **never**
> used as a post-update measurement. The first UTC day that genuinely tests v1716
> is **2026-08-29**, still in progress — so the real read is **tomorrow**.

**One coverage gap, specific to this universe.** It is the only multi-place game
of the three. `develop.roblox.com` lists **seven** places; the grab discovered
**six** — `128451475320872` (*Omatsuri*) was not among them, so no per-place
error or performance shape was constructed for it. Everything below is the root
place plus five sub-places. This is the F12 family of trap (a per-place log that
reads complete while missing a place); it does not affect the root-place figures
that carry this report, but a defect confined to Omatsuri would be invisible here.

---

## Bottom line

- **Nothing is broken by v1716 on the evidence available at T+14h, and the error
  read is the cleanest of the three games in this batch.** Errors per concurrent
  player are **−4.7%** against the mean of the two pre-update days, and the
  settled post-publish window (22:00–23:30) is **107.5 vs 107.4** the night
  before — flat to one decimal.
- **This game is in a deep decline that started on 08-23, five days before the
  publish.** DAU **−66.1% w/w** (491,464 on 08-20 → **166,737** on 08-27, off
  543,135 on 08-18); revenue **−77.1%**; paying users **−80.0%**. CCU today ranks
  **24 of 27 days**. **All of that predates v1716 and none of it is evidence
  about this build.**
- **Two things to act on.** (1) **The 08-27 client-CPU spike sits inside the
  baseline** — 10.5 → **33.0** → 16.2, a 3.1× one-day jump on the very day the
  freeze is taken. Do not use 33.0 as the pre-update reference; use the 10.5–13.0
  band. (2) **Ask whether v1716 fixed any of the six defects** confirmed present
  in v1708 on 08-23 — `Tutorial_Main_5_ToRaftShop` is the pre-registered test and
  it is still at 82.1%.
- **Cannot be answered yet:** DAU, revenue, session length and conversion for
  2026-08-29 (read on 08-30); D1 for the first fully-post-update cohort
  (**2026-08-31**); D7 (**2026-09-05**).
- **No update spec exists for this game yet** — the other two in this batch have
  one. So there is no hypothesis about v1716's content to test against, and the
  tripwires below are the generic set plus the six known defects.

---

## The 08-27 client-CPU spike — flagged before it gets blamed on this build

**`ClientCpuTimeAvg` went 10.5 → 33.0 on 2026-08-27**, a 3.1× jump on a settled
day, one day *before* the publish, then fell back to 16.2 on 08-28.

| | 08-21 | 08-22 | 08-23 | 08-24 | 08-25 | 08-26 | **08-27** | 08-28 |
|---|---|---|---|---|---|---|---|---|
| Client CPU time | 11.4 | 12.5 | 13.0 | 11.8 | 10.5 | 10.5 | **33.0** | 16.2 |

Nothing else moved with it: crash rate 0.35% (▼7.3%), FPS p10 36.17 (▲8.7%),
memory ▼11.5%, server CPU 1.76 (▼5.6%).

**It is not unique to this game, and it is not portfolio-wide either.** On the
same day, `9963622286` Become a Brainrot went **41.0 → 93.0** (2.3×) — recorded
independently in that game's own baseline. But `10565445771` Verity (7.2 → 6.9),
`10638354731` Seal (6.2 → 7.9) and `10399712766` Banana Monkey (15.0 → 15.4) did
**not** move. Two of four games with 08-27 data doubled or tripled; two did not.
That rules out a clean "Roblox client release" explanation while leaving a real
shared cause unidentified.

**What it means for this report:** the baseline value for client CPU is
**contaminated**, and 33.0 must not be the number v1716 is measured against. The
tripwire is set on the pre-spike band instead.

---

## All metrics before the update

Full table — every metric with a settled headline daily series, latest settled
value and 7-day delta: **[`series/metric-table.md`](series/metric-table.md)**
(55 metrics). Raw settled points: **[`series/headline-daily.csv`](series/headline-daily.csv)**
(5,025 rows, `ONE_DAY` only, `FILLED_ZERO` and `partial` dropped). Corpus summary
at grab time: [`summary-at-grab.md`](summary-at-grab.md); error signatures by
volume: [`errors-at-grab.md`](errors-at-grab.md); every attempt including the 39
skips: [`grab-report.md`](grab-report.md).

The headline rows:

| Rung | Metric | Kind | 2026-08-27 | Δ7d |
|---|---|---|---|---|
| Discovery | Impressions (unique users) | volume | 3.57M | ▼ 59.2% |
| Discovery | End-to-End Conversion | rate | 4.20% | ▼ 18.2% |
| Discovery | RFY Play Days (L7) | rate | 1.29 | ▲ 0.1% |
| Discovery | Event RSVPs | volume | 1.11M | ▲ 22.8% |
| Discovery | Feedback Votes | volume | +370 | ▼ 76.4% |
| **Retention** | **Day 1 Retention** | rate | **13.70%** (08-26) | **▲ 1.9%** |
| Retention | Day 1 Retention (7-day avg) | rate | 13.44% (08-26) | ▼ 5.7% |
| Retention | Day 7 Retention | rate | 0.74% (08-20) | ▼ 21.9% |
| Retention | Stickiness (DAU/MAU) | rate | 2.14% | ▼ 62.4% |
| Monetization | ARPDAU | rate | R$ 0.4462 | ▼ 32.5% |
| Monetization | ARPPU | rate | R$ 18.36 | ▲ 14.5% |
| Monetization | Payer Conversion | rate | 2.43% | ▼ 41.0% |
| Monetization | Daily Revenue | volume | R$ 74,398 | ▼ 77.1% |
| Monetization | Paying Users | volume | 4,053 | ▼ 80.0% |
| Engagement | Avg Session Length | rate | 14.64 min | ▼ 8.6% |
| Engagement | Playtime per Player | rate | 20.66 min | ▼ 8.2% |
| Engagement | Daily Active Users | volume | 166,737 | ▼ 66.1% |
| Engagement | Peak Concurrent | volume | 3,467 | ▼ 66.0% |
| Performance | Crash Rate (15m) | rate | 0.35% | ▼ 7.3% |
| Performance | Avg FPS / FPS p10 | rate | 45.31 / 36.17 | ▲ 4.8% / ▲ 8.7% |
| Performance | Client CPU Time | rate | **33.03** — *anomalous, see above* | ▲ 168.1% |
| Performance | Crash Count | volume | 1,036 | ▼ 68.1% |
| Performance | Out-of-Memory Exits | volume | 278 | ▼ 70.5% |
| Performance | Script Errors | volume | 2.98M | ▲ 18.8% |

**Three readings that are not obvious from the table.**

*Retention is the one rung holding up, and it says the decline is a reach
problem.* D1 is **13.70% and up 1.9% w/w** while DAU fell 66%. The existing
players are behaving normally; the game is simply being shown to fewer people
(impressions −59.2%). This is the same conclusion the 08-23 diagnosis reached and
it has not changed.

*ARPPU rising while conversion collapses is the shape of a shrinking audience,
not a monetization change.* ARPPU R$16 → R$18.36 (▲14.5%) while payer conversion
went 4.12% → 2.43% (▼41.0%). Casual players left first; the ones who remain spend
more each. Nothing shipped to cause that.

*`ErrorCount` is the only volume metric that rose while everything else fell* —
+18.8% w/w against DAU −66%. Per player that is a ~3.5× increase over the week,
and it happened entirely **before** this publish. It is the pre-existing
technical load the six defects below describe.

---

## Daily series, last 11 settled days

Behavioural metrics lag ~2 days, so 08-28 is legitimately absent for DAU,
revenue, payers, session length and D1 — that is the lag, not a gap.

| date | DAU | PCU | Revenue | Payers | ARPDAU | ARPPU | CVR | Session | D1 | Errors | Crashes | Crash rate | OOM |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **08-18** | **543,135** | 11,086 | 283,311 | 17,989 | 0.5216 | 16 | 3.31% | 15 | 14.47% | 2.31M | 3,128 | 0.37% | 827 |
| 08-19 | 526,042 | 10,911 | 289,637 | 18,354 | 0.5506 | 16 | 3.49% | 15 | 13.44% | 2.43M | 3,244 | 0.37% | 941 |
| 08-20 | 491,464 | 10,202 | 324,796 | 20,265 | 0.6609 | 16 | **4.12%** | 16 | 14.10% | 2.51M | 3,158 | 0.37% | 805 |
| 08-21 | 452,401 | 9,669 | 300,005 | 17,418 | 0.6631 | 17 | 3.85% | 16 | 15.00% | 5.23M | 3,433 | 0.41% | 898 |
| 08-22 | 408,910 | 7,557 | 265,247 | 14,475 | 0.6487 | 18 | 3.54% | 14 | 12.31% | 2.89M | 3,169 | 0.40% | 667 |
| **08-23** | 240,924 | 5,331 | 161,432 | 7,516 | 0.6701 | 21 | 3.12% | 15 | 11.88% | 1.56M | 1,878 | 0.35% | 558 |
| 08-24 | 205,591 | 4,320 | 114,318 | 6,194 | 0.5560 | 18 | 3.01% | 15 | 13.96% | 1.35M | — | — | — |
| 08-25 | 168,117 | 3,196 | 93,994 | 4,499 | 0.5591 | 21 | 2.68% | 15 | 13.11% | 3.01M | 1,205 | 0.36% | 301 |
| 08-26 | 145,059 | 2,960 | 74,381 | 3,955 | 0.5087 | 19 | 2.71% | 14 | 13.70% | 2.73M | 1,099 | 0.40% | 249 |
| **08-27** | **166,737** | **3,467** | **74,398** | **4,053** | **0.4462** | **18.36** | **2.43%** | **14.64** | — | **2.98M** | **1,036** | **0.35%** | **278** |
| 08-28 † | — | 2,617 | — | — | — | — | — | — | — | 2.57M | 864 | 0.33% | 218 |

† 85% pre-update. Shown for continuity, never as a post-update reading. The
08-23 row is where the decline turns — it is 5 days before this publish.

---

## Concurrents across the publish

`ccu-baseline`, matched half-hour slots **00:00–11:00 UTC** against 26 complete
prior days — full output in [`ccu-baseline-2026-08-29.txt`](ccu-baseline-2026-08-29.txt).
Today's mean over elapsed slots: **2,238**, rank **24 of 27**.

| baseline | n | base CCU | today vs base |
|---|---|---|---|
| same weekday (Sat) | 3 | 4,982 | −55.1% |
| last 7 days | 7 | 2,992 | **−25.2%** |
| last 14 days | 14 | 4,497 | −50.2% |
| all 26 days | 26 | 4,416 | −49.3% |

On the same elapsed-slot basis: **08-27 → 2,534 · 08-28 → 1,692 · 08-29 →
2,238**. Today is **up 32% on the pre-publish day** and down 12% on 08-27. The
series has been oscillating between 1,627 and 2,534 for six days; today is inside
that band, not below it.

**The per-slot profile is uniform** — between −45% and −59% in every one of the
23 elapsed slots against the 14-day median, with no drift across the UTC day. A
deficit that costs the same share of players in every hour is a change in the
game or in its audience size, not a calendar or discovery effect biting in
particular hours. Combined with impressions −59% and D1 *up*, the reading is a
reach contraction that began on 08-23.

**And it is not the platform.** The public board is **up 2.8% since yesterday and
10.4% since 08-25** (8,324,909 CCU across 283 games,
`data/platform/ccu-2026-08-29T11-17-54Z.json`), with `Steal An Egg` now at
**20.7%** of the entire board — up from 12.2% on 08-25. The board grew while this
game halved.

---

## Errors across the publish, normalised — the cleanest read of the three

The table divides half-hour `ErrorCount` by half-hour `PeakConcurrentPlayers`
over **matched elapsed slots 00:00–11:00 UTC**, both filtered to the root place,
final bucket dropped (F19).

| day | errors (00:00–11:00) | mean CCU | **errors / CCU** | vs 08-27 |
|---|---|---|---|---|
| 2026-08-27 (pre) | 962,022 | 1,665 | **578.0** | — |
| 2026-08-28 (pre — publish was 20:30) | 660,597 | 934 | **707.3** | +22.4% |
| **2026-08-29 (first post-update morning)** | 808,077 | 1,319 | **612.8** | +6.0% |

**Against the mean of the two pre-update days (642.7) the post-update morning is
−4.7%.** And note which day is worst: **08-28, a day that was 85% pre-update.**
Reading 08-29's +6.0% against 08-27 alone would have attributed a pre-existing
move to v1716.

The settled post-publish window is flatter still: **22:00–23:30 ran 107.4
errors/CCU on 08-27 and 107.5 on 08-28** — identical. The publish itself produced
one raised bucket at 20:30 (+93% on the same slot) that was back inside the
normal band within two hours.

**These CCU figures are root-place only** and are therefore lower than
`ccu-baseline`'s (which sums all places) — 1,665 vs 2,534 on 08-27. That is
correct here: root-place errors must be divided by root-place players. Do not mix
the two denominators.

**One caveat that matters more on this game than on the other two: the most
expensive known defect emits no error at all.** Defect 1 below is an infinite
loop that writes no log line. `ErrorCount` being flat is evidence about crashes
and exceptions; it is not evidence that the tutorial works.

---

## Funnel before the update

One 15-step tutorial funnel — table and method in
[`funnels-pre-update.md`](funnels-pre-update.md).

| # | Step | Users | Step-to-step | Daily rate, pre-update mean |
|---|---|---|---|---|
| 1 | `Tutorial_Main_1_StartSwim` | 3,124,713 | 100.00% | 100.0% |
| 2 | `Tutorial_Main_2_WaitGetCash` | 3,044,370 | 97.43% | 97.5% |
| 3 | `Tutorial_Main_3_ClickSlide` | 2,955,330 | 97.08% | 94.4% |
| 4 | `Tutorial_Main_4_WaitSildeEnd` | 2,947,414 | 99.73% | 94.1% |
| **5** | **`Tutorial_Main_5_ToRaftShop`** | 2,478,526 | **84.09%** | **82.1%** |
| 6 | `Tutorial_Main_6_StartSwim` | 2,441,808 | 98.52% | 80.6% |
| 7 | `Tutorial_Main_7_WaitGetCash` | 2,433,425 | 99.66% | 80.3% |
| 8 | `Tutorial_Main_8_ClickSlide` | 2,357,156 | 96.87% | 77.5% |
| 9 | `Tutorial_Main_9_WaitSildeEnd` | 2,350,946 | 99.74% | 77.3% |
| **10** | **`Tutorial_Main_10_BuyEgg`** | 2,069,309 | **88.02%** | **66.9%** |
| 11 | `Tutorial_Main_11_OpenPetBag` | 1,941,527 | 93.82% | 62.1% |
| **12** | **`Tutorial_Main_12_EquipPet`** | 1,758,484 | **90.57%** | **55.8%** |
| 13 | `Tutorial_Main_13_ClosePetBag` | 1,755,067 | 99.81% | 55.7% |
| 14 | `Tutorial_Main_14_Final` | 1,754,376 | 99.96% | 55.6% |
| 15 | `Tutorial_Main_15_AddFriendTip` | 1,587,494 | 90.49% | 49.7% |

**Step 5 is still the worst gate in the funnel and it is still chronic.** At
**84.09%** step-to-step against 97–100% at every neighbouring gate, it costs
~468,000 players across this window. The 08-23 diagnosis measured it at 0.824
pre-publish / 0.866 post and called it chronic rather than a regression; the
pre-update mean of **82.1%** confirms that has not changed in six days. **Defect
3 — `isOwnedRaft(2, …)` at `GoShop_Raft:570`, which only accepts Purple Raft Id 2
— is the named cause, and this step is the pre-registered test of whether v1716
fixed it.**

Three other real gates: step 10 `BuyEgg` (88.02%), step 12 `EquipPet` (90.57%)
and step 15 `AddFriendTip` (90.49%). End-to-end the tutorial runs 3,124,713 →
1,587,494, **50.8% surviving**.

**Newest-day bias.** As on the other two games in this batch, the newest day
reads low: the 08-28 column sits 2–4 pp under each step's own pre-update mean
across all fifteen steps uniformly, which is the artefact, not a break. Do not
fire a funnel tripwire on a day less than two days old.

---

## The six defects confirmed in v1708 — did v1716 fix any of them?

Read from the live root place over the Studio MCP on 2026-08-23 (full detail in
`HANDOFF.md` §5, report artifact `f8cad0f1-da1f-4577-a57d-066a2a4115cb`). All six
were **present and unfixed** at 18:05 UTC on 08-23, under v1708. Two builds have
shipped since — v1711 and now v1715/v1716 — and **none of them has been checked.**

| # | Defect | Where | Visible in metrics? |
|---|---|---|---|
| 1 | Infinite scroll loop, `CanvasPosition` float equality never holds | `GoShop_Raft` 601–609 | **No — emits no error, ever.** Only a code read or a play test finds it |
| 2 | Empty raft list, throws at 488 before the tile loop | `GoShop_Raft` 102 | Yes — error signature, 77 hits in ~5 h on v1708 |
| 3 | `isOwnedRaft(2, …)` — only Purple Raft satisfies tutorial step 5 | `GoShop_Raft` 570 | **Yes — `Tutorial_Main_5_ToRaftShop`, 82.1% pre-update** |
| 4 | Silent data loss, `serviceInit` never set, unbounded wait | `PlayerService` 53 | Partly — `SavePlayerData` 502s |
| 5 | `FindFirstChild(nil)` before its own fallback | `Convert` 274 | Yes — error signature |
| 6 | Raft grid 132% of frame width, 4th column unreachable | `UIGridLayout` | No — layout only |

**Root cause under most of it:** 81 unguarded `shared["PlayerData"].Get()` call
sites across 42 scripts, against 16 guarded. One stub in the client bootstrap
fixes the class; 81 patches are not needed.

**This is the highest-value question in this report** and it is a code question,
not a metrics one. Tripwire 12 tests defect 3 from the numbers; the rest need a
re-read of the live place at v1716.

---

## Tripwires — pre-registered, before the post-update read

| # | Signal | Pre-update value (08-27) | Broken if | First readable |
|---|---|---|---|---|
| 1 | `ErrorCount` per concurrent player, root place | **578.0** (00:00–11:00 matched slots) | **> 800 (1.38×)** sustained over a full elapsed-slot window | now — reads **612.8, OK** |
| 2 | `ErrorCount` / day | 2.98M | > 4.5M on a full day at flat-or-lower DAU. Deploy-day spike excluded | 08-30 |
| 3 | New `MessageHash` on v1715/v1716 | n/a — newest export is **v1711** | **any signature with real volume** carrying a v1716 first-seen stamp | needs a dashboard export |
| 4 | `ClientCrashRate15m` | **0.35%** (band 0.33–0.41%) | **> 0.49%** (1.4× baseline) | 08-30 |
| 5 | `ClientCrashCount` per 1,000 PCU | 1,036 / 3,467 = 299 | > 420 | 08-30 |
| 6 | `OomUnexpectedExits` per 1,000 PCU | 278 / 3,467 = 80.2 | > 120 | 08-30 |
| **7** | **`ClientCpuTimeAvg`** | **use 10.5–13.0**, *not* the anomalous 33.0 on 08-27 | **> 20 on two consecutive settled days** — then the 08-27 spike is a real step and not a one-day event | 08-30 |
| 8 | `ClientFpsP10` | 36.17 | < 32 | 08-30 |
| 9 | `AverageSessionLengthMinutes` | **14.64 min** | < 13.2 min for 2 settled days | 08-30 |
| 10 | `AverageRevenuePerUser` (ARPDAU) | **R$ 0.4462** | < R$ 0.38 for 2 settled days | 08-30 |
| 11 | `PayingUsersCVR` | **2.43%** | < 2.15% for 2 settled days | 08-30 |
| **12** | **Funnel `Tutorial_Main_5_ToRaftShop`** | **82.1%** pre-update mean | < 77.1% on a day **≥2 days old**. **A rise above 90% means defect 3 was fixed** — that is the success signal and the reason this row exists | 08-31 |
| 13 | Funnel `Tutorial_Main_15_AddFriendTip` (end to end) | **49.7%** pre-update mean | < 44.7% on a day ≥2 days old | 08-31 |
| 14 | Any other of the 15 steps | see [`funnels-pre-update.md`](funnels-pre-update.md) | daily rate > 5 pp below its own pre-update mean, on a day ≥2 days old | 08-31 |
| 15 | `ForwardD1Retention` | **13.70%** (7-day avg 13.44%) | **< 12.3%** for 2 settled days. This is the rung that has held through the decline — losing it is the one thing that would make this an update problem | **08-31** |
| 16 | Feedback votes | +370 on 08-27 | net votes turning negative | 08-30 |

---

## Four things that will look like breakage tomorrow and are not

1. **The publish-path error spike.** Already observed and already decayed — one
   raised bucket at 20:30 (+93%), normal within two hours, and the settled
   22:00–23:30 window identical to the night before.
2. **The restart dip in concurrents.** v1716 cycled every server at ~20:30–21:00
   UTC. Compare against that day's own pre-20:30 slope.
3. **Today's partial day and partial half-hour.** 2026-08-29 is in progress and
   reads low everywhere. Drop the final `HalfHour` bucket always (F19), and pass
   `--slots` bounded by the current UTC hour to `ccu-baseline` (F24).
4. **The `*.daily.csv` roll-up.** On this universe it sums `FILLED_ZERO` rows and
   prints zeros on real days (F13). Read the `ONE_DAY` rows of the main CSV, and
   filter every read on the `granularity` column.

And one specific to this game: **DAU, revenue, paying users and CCU will be down
again tomorrow regardless of v1716.** The decline began 08-23 on impressions
−59% w/w while D1 held. Those rows are tripwire-exempt; retention, the tutorial
funnel, errors per player and crash rate are what test the build.

---

## Errors — volumes, text, and what is missing

`ErrorCount` on 08-27 was **2,980,493** events; 08-28 was 2,566,335, of which
**965,571 are stamped v1716** and 35,945 v1715. Signature volumes as captured:
[`errors-at-grab.md`](errors-at-grab.md).

This game has the **best** error-text coverage of the three — ten dashboard
exports are filed under `data/exports/10030829154-climb-waterslide-and-slide/` —
but the newest, `errors_2026-08-25_1732_v1711_147rows.csv`, is one build old.

**Action, and it needs you:** export *Errors and warnings by count* filtered to
**v1716**. The v1711 export is already filed as the comparison, so this is a
single export rather than two. Without it, tripwire 3 cannot be evaluated, and
neither can "did defect 2 or defect 5 stop firing".

---

## Watchlist with dates

| When | What | Why |
|---|---|---|
| **2026-08-30** | Full grab after the UTC day rolls | First real read: DAU, revenue, session length, crash rate, **client CPU** |
| **2026-08-30** | Dashboard error export filtered to v1716 | Tripwire 3; also tells you whether defects 2 and 5 still fire |
| **2026-08-30** | **Re-read the live root place at v1716 over Studio MCP** | The only way to answer the six-defect question. Defect 1 is invisible to every metric in this report |
| **2026-08-31** | Funnel step 5 for 08-29 at 2 days of age; D1 for the 08-29 cohort | Tripwires 12 and 15 |
| **2026-09-02** | Funnel steps for 08-29 at 4 days of age | The age at which a funnel day is settled |
| **2026-09-05** | D7 for the 08-29 cohort | Repeat-play test |

## Questions for the studio

1. **What is in v1715/v1716?** There is no spec for this game and no changelog. A
   one-line summary turns every tripwire from "something moved" into "the thing
   we changed moved".
2. **Was v1715 a bad publish immediately hotfixed by v1716?** The deploy log shows
   v1715 running for two half-hour buckets and stopping, which is consistent.
3. **Did any of the six defects get fixed in v1711 or v1716?** They were all
   confirmed present in v1708 on 08-23 and nobody has checked since. Defect 3 is
   worth ~468,000 players in the window above.
4. **Is `128451475320872` (Omatsuri) a live place?** The grab discovered six of
   the seven places this universe holds, so nothing was pulled for it.
5. **What is the Roblox experience event driving 1.11M RSVPs?** Event DAU is
   262.6K against a total DAU of 166.7K, so the event window and the metric window
   do not line up — worth knowing before it distorts a post-update comparison.

---

## Post-update read — 2026-08-29 T+18h. Tripwire 3: fired on v1715, already fixed by v1716

A dashboard error export was filed at 14:10 local, covering v1711 → v1716:
`data/exports/10030829154-climb-waterslide-and-slide/errors/errors_2026-08-29_1410_v1711-v1716.csv`.

### v1715 shipped broken and was hotfixed inside 30 minutes

| count | severity | first-seen version | first seen (UTC) | message |
|---|---|---|---|---|
| **9,129** | Error | **v1715** | 2026-08-28 **20:50** | `MuFa is not a valid member of Folder ReplicatedStorage.Model` |
| 382 | Warning | v1715 | 2026-08-28 20:50 | `Egg model not found: Egg1` |
| 126 | Warning | v1715 | 2026-08-28 20:50 | `Egg model not found: Egg2` |
| 112 | Warning | v1715 | 2026-08-28 20:50 | `Egg model not found: Egg3` |
| 41 | Warning | v1715 | 2026-08-28 20:50 | `Egg model not found: Egg8` |

All five appear at **20:50**, 20 minutes after v1715 published at 20:30, and
together they are **92% of the whole export's volume**. They are a missing-asset
family: a model `MuFa` and four Egg models are referenced but absent from
`ReplicatedStorage.Model`. Egg models feed `Tutorial_Main_10_BuyEgg`,
`_11_OpenPetBag` and `_12_EquipPet` — steps 10–12 of the tutorial — so had this
stayed live it would have broken the pet rung and a third of the tutorial.

**It did not stay live.** `ErrorCount` filtered to `FirstSeenPlaceVersion >= 1715`
— "errors this deploy introduced" — settles it:

| date | all errors (root place) | introduced by v1715/v1716 | share |
|---|---|---|---|
| 2026-08-27 | 1,986,251 | 0 | 0.0% |
| 2026-08-28 | 1,645,625 | **9,826** | 0.6% |
| **2026-08-29** | 938,679 | **174** | **0.0%** |

**9,826 → 174 is a 98.2% collapse across the day boundary.** That is the
signature of a defect removed by the next publish, and it explains why v1715
lived for only two half-hour buckets: **v1716 was a hotfix and it worked.**
Compare Verity's v679 in the identical test — 2,069 → 4,018, i.e. rising. The
same measurement separates "shipped broken then fixed" from "shipped broken and
still broken".

**So tripwire 3 fired on v1715 and is CLEAR on v1716.** Nothing needs doing —
but the studio should be told the hotfix landed cleanly, because that is the
thing worth repeating.

### The six known defects — two are visible in this export and still present

| defect | evidence in this export |
|---|---|
| 2 — `GoShop_Raft:102` empty raft list | `Players.<Player>.PlayerScripts.UI.GoShop_Raft:102: attempt to index nil with 'Get'` — 5 events, first seen v1715 20:51. **Still firing** |
| 4 — `PlayerService` silent data loss | `[SaveLoadDataMgr] SavePlayerData attempt 1/3 failed … err=502` — 5 events on v1716; `SavePlayerData failed: … CopyTableScript:5: invalid argument #1 to 'pairs'` — 2 events on v1711. **Still firing** |
| — | `Players.<Player>.PlayerScripts.UI.Teleport:12: attempt to index nil with 'Get'` — 6 events on v1716. **A third call site in the same `shared["PlayerData"]` race**, not previously listed |

The counts are small because **export counts are relative, not absolute** — they
rank and date signatures, they do not count affected players. What they establish
is that the `index nil with 'Get'` family survived both v1711 and v1716, so the
81-call-site root cause is untouched. Defects 1 and 6 emit nothing and cannot
appear here at all.

### A coverage gap that just became real: Omatsuri woke up

The baseline noted that the grab discovered six of this universe's seven places.
The seventh, `128451475320872` (*Omatsuri*), was dormant. It is not any more:

| place | 08-27 | 08-28 | 08-29 |
|---|---|---|---|
| ROOT `139617346573330` | 1,986,251 | 1,645,625 | 938,679 |
| Forest `109025676702094` | 449,033 | 393,610 | 234,566 |
| Ice `111157217779261` | 224,047 | 209,192 | 119,026 |
| Soccer Stadium `100407536317236` | 125,002 | 118,750 | 65,544 |
| Desert `87388097381958` | 118,644 | 114,704 | 61,589 |
| Hawaii `94401613935841` | 75,773 | 78,282 | 34,701 |
| **Omatsuri `128451475320872`** | **0** | **6,172** | **44,288** |

Every other place is falling with DAU. **Omatsuri went from nothing to 44,288
errors in two days and is the only place rising.** It is also the one place with
no per-place shape in the grab plan, so nothing else about it is being measured.
Whether that is a new world going live with v1716 or a dormant place taking
traffic, it needs a place-scoped grab before it is quoted either way.

*(Side note on method: the per-place sum for 08-27 is 2,978,750 against the
corpus headline of 2,980,493 — a 0.06% difference from the freeze policy. The
corpus headline for this universe is the all-places total, which confirms the
`ErrorCount` figures used earlier in this report are correctly scoped.)*

### Tripwire status at T+18h

| # | Signal | Status |
|---|---|---|
| 1 | `ErrorCount` per concurrent player | **OK** — 612.8 vs 578.0 baseline, −4.7% on the two-day pre mean |
| **3** | **New `MessageHash` on v1715/v1716** | **FIRED on v1715, CLEAR on v1716** — 9,826 → 174 |
| 2, 4–11, 16 | daily error / performance / monetization | **NO DATA** until 08-30 |
| 12–15 | tutorial funnel and D1 | **NO DATA** until 08-31 |

_Read 2026-08-29 ~14:20 UTC._
