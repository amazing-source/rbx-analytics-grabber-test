# Universe 10399712766 — pre-update baseline, 2026-08-21

Frozen the day an update shipped, so the post-update comparison has a reference
that later grabs cannot quietly rewrite. Source bundle:
`data/raw/10399712766-2026-08-21T13-22-33-244Z.json` (committed). Grab window
2026-07-24 → 2026-08-21, 150 of 168 shapes returned data.

Game name is inferred from the producer's update notes ("Banana Monkey
Destruction"), not from any captured field — the grab carries no title.

**Do not compare anything against 2026-08-21 itself.** It is partial and the
deploy lands mid-day. Last settled day is 2026-08-20; retention settles ~2 days
behind, so the last usable D1 is 2026-08-19.

## Benchmark type — read this before quoting "below median"

`benchmarkType` on this universe is **`BENCHMARK_TYPE_TOP_EXPERIENCES`**, not
genre. `summary.md` prints the phrase "genre median" regardless; that label is
wrong here. Every comparison below is against the median of *top experiences*,
which is a far higher bar than a genre median — "below p50" is a much friendlier
statement than it reads.

## Baseline — the numbers to beat

| Metric | Baseline | Top-exp p50 | p90 | As of |
|---|---|---|---|---|
| DAU | 558,858 | — | — | 08-20 |
| MAU | 11.1M | — | — | 08-20 |
| Peak concurrent | 11,067 | — | — | 08-20 |
| Daily revenue | R$153,203 | — | — | 08-20 |
| Paying users | 4,105 | — | — | 08-20 |
| **ARPDAU** | **R$0.274** | R$0.4825 | R$1.6324 | 08-20 |
| **ARPPU** | **R$37.32** | R$58.14 | R$171.27 | 08-20 |
| Payer conversion | 0.73% | 0.84% | 2.69% | 08-20 |
| D1 retention | 14.23% | 13.81% | 20.85% | 08-19 |
| D7 retention | 1.29% | 1.48% | 3.78% | 08-13 |
| Avg session length | 15.1 min | 13.56 | 18.94 | 08-20 |
| Playtime per player | 19.9 min | — | — | 08-20 |
| Impressions (unique) | 9.2M | — | — | 08-20 |
| EndToEndCVR | 5.43% | — | — | 08-20 |
| RFYQualifiedPTR | 1.56% | — | — | 08-19 |
| RFYL7PlayDays | 1.3 | — | — | 08-19 |

**Session survival curve** (11,039,088 sessions, `TotalSessionsEndedInBucket`
at NONE — this is the substitute for a funnel, since only 3 funnel steps exist
and the `FunnelName` dimension 403'd on this grab):

| Elapsed | Still in session | Ended by then |
|---|---|---|
| 30s | 97.11% | 2.89% |
| **60s** | 92.99% | **7.01%** |
| 120s | 85.25% | 14.75% |
| **180s** | 79.47% | **20.53%** |
| 300s | 71.01% | 28.99% |
| 600s | 55.27% | 44.73% |
| 900s | 42.23% | 57.77% |
| 1800s | 16.17% | 83.83% |

Both official RFY bounce bands (<60s, 61–180s) are healthy. Median session
≈ 700s ≈ 11.7 min, against a 15.1 min mean — right-skewed, as expected.

**Performance baseline** (all `Place=83256791430098`, 08-20):
FPS avg 42 · FPS p10 30 · client memory 922 MB · memory used 22.3% ·
client CPU 15.8 ms · crash rate 15m 0.66% · crash count 3,586 ·
OOM exits 649 (1.2 per 1k DAU) · server FPS p10 59 · server crashes 0.

In absolute terms this is fine — OOM at 1.2/1k DAU compares well against
9963622286's 8–10/1k. But the *trend* over the prior week was OOM +43.9%,
crash count +25.3%, crash rate +21.8%, FPS p10 −4.3%, all on the unchanged
v1228 build. Drifting, not broken. Watch it rather than act on it.

## Diagnosis

**Shape.** A launch, four weeks old and past its spike: 27K DAU on 07-24 →
975K on 08-05 → settled 540–710K. Not a decline to explain; a curve to monetize.

**Strong, and not to be touched:** session length and D1 are both above the
top-experiences p50, sub-60s bounce is 7.0%, and both conversion proxies are
*rising* (EndToEndCVR ▲17%, RFYQualifiedPTR ▲32%). Discovery and appeal are not
the constraint. Creative work here is wasted effort.

**Gap 1 — monetization depth, not breadth.** Payer conversion is 0.73% against
a 0.84% p50, i.e. near median. ARPPU is R$37.32 against R$58.14, i.e. −36%.
People buy at roughly the normal rate; they buy *small*. That is the
undertapped-monetization case — an upside, not a fault.

**Gap 2 — D7, structurally.** D7 1.29% vs p50 1.48%. D30 was not served on this
grab, so the D7→D30 rung is unmeasured. In this genre that rung is held by a
prestige/rebirth loop; a login ladder is consumed once and does not hold it.

## OPEN — paying users halved on 2026-08-12, cause not identified

Matched-DAU, so not growth confounding:

| Date | DAU | Payers | ARPPU |
|---|---|---|---|
| 08-10 | 528,955 | **8,443** | 35.93 |
| 08-11 | 608,646 | **7,100** | 32.70 |
| **08-12** | 542,803 | **4,461** | 39.04 |
| 08-15 | 544,461 | 3,582 | 47.13 |
| 08-16 | 541,904 | 3,396 | 50.62 |
| 08-20 | 558,858 | 4,105 | 37.32 |

ARPPU is flat-to-up, so it is breadth collapsing, not whales leaving.

**Ruled out:** no deploy — `feedback.csv` `asset_version` confirms **v1228 live
continuously 08-02 → 08-20**, and every `place-versions` row after it is
`is_published=false`. No event boundary — the running event started 08-09 and
records no END. No composition change — new-user share is flat 58–72% across the
step. Not one broken product — DevProduct −48% and GamePass −51% fell together.

**The question to ask the producer: was there a launch-window offer, starter
pack or first-week discount that expired around 11–12 August?** A timed offer
ending is config, not a build, and is invisible to every log in this pipeline.
It matters because if one expired, the new VIP pass may be *replacing* revenue
that already existed rather than adding any.

## The update shipped 2026-08-21

Spin wheel in lobby, free ticket per 15 min online · D7 reward ladder with
top-bar icon and ready-dot, `unlock all` at 149R · VIP pass 1499R (all trainers,
permanent ×2 cash, chat tag, ×64 bananas) · Nuke dev product 299R with an offer
icon shown during destruction mode.

**Read:** the VIP pass aims at ARPPU, which is the real gap — correct call.
The nuke is likely the better long-run earner because it is repeatable where the
pass converts once, and placing its offer inside destruction mode puts it at the
moment of desire. The D7 ladder targets the weak rung but is a reward, not a
loop: expect a bump that decays, and do not read it as the structural fix. The
spin wheel rewards *time in session*, which is already above p50 — one
login-gated spin would touch D1→D2 instead, where the reward ladder actually
lives.

## What to measure, and when

1. `PayingUsersCVR`, `AverageRevenuePerPayingUser`, `DailyRevenue` — **always
   matched-DAU**, never raw, and never against 08-21. The pre-update reference
   is the 08-20 row above.
2. `ForwardD7Retention` from 08-28 onward — the first cohort that can have seen
   the ladder for seven days.
3. `OomUnexpectedExits` and `ClientFpsP10` by `Platform` — the new lobby model
   and VFX are the kind of thing that lands on low-end devices first.
4. Sub-daily metrics hold only ~24h, so a grab must land within a day of the
   publish or the half-hour resolution around it is gone permanently. Perf and
   crash data age out at ~30 days; this game is four weeks old, so the whole
   technical history is currently held and will not be later.
