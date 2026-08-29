# Funnels before the update - Verity Companion [AI] (10565445771)

Pulled from Open Cloud on 2026-08-29, window 2026-08-14 to 2026-08-29 (exclusive).

**The mean column covers complete days up to and including 2026-08-27 only** - the last
day that closed before the 2026-08-28 evening publish. 08-28 is displayed for continuity
and excluded from every mean, because its final 3-5 hours are post-update.

**How, because the shape is the whole difficulty.** `granularity: "None"` for the
step metrics, `breakdown: ["FunnelStep"]`, and **no `FunnelName` filter** - that filter
is accepted and returns zero series always. These queries answer **HTTP 202**; the
result only exists after polling the returned `path`. Both faults return an empty
series, which reads exactly like a game with no funnels instrumented. This run
retried every empty answer three times before recording it as empty.

**Caveat that limits every number here:** with no working `FunnelName` filter the
steps come back **merged across all funnels, keyed by index**. Step *names* and
*volumes* are sound and the daily trend is sound; a merged completion rate is a
blend across funnels and must never be quoted as one funnel's rate.

## Steps (merged across funnels, by index)

| # | Step | Users | Step completion | Churn |
|---|---|---|---|---|
| 1 | `Submitted` | 90,433,533 | 100.00% | 0.00% |
| 2 | `Accepted` | 78,366,031 | 86.66% | 13.34% |
| 3 | `Delivered` | 62,490,227 | 79.74% | 20.26% |
| 4 | `First Reply Received` | 16,210,765 | 25.94% | 74.06% |
| 5 | `Day 2 Reached` | 9,645,972 | 59.50% | 40.50% |
| 6 | `Day 3 Reached` | 6,790,510 | 70.40% | 29.60% |
| 7 | `Day 4 Reached` | 5,219,186 | 76.86% | 23.14% |
| 8 | `Day 5 Reached` | 4,134,055 | 79.21% | 20.79% |
| 9 | `Ending Completed` | 1,892,045 | 45.77% | 54.23% |

## Daily completion rate per step - the tripwire baseline

| Step | 08-21 | 08-22 | 08-23 | 08-24 | 08-25 | 08-26 | 08-27 | 08-28 | pre-update mean |
|---|---|---|---|---|---|---|---|---|---|
| `Submitted` | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% | **100.0%** |
| `Accepted` | 86.0% | 86.3% | 86.3% | 86.1% | 85.9% | 85.8% | 86.0% | 86.4% | **86.1%** |
| `Delivered` | 69.3% | 68.9% | 68.8% | 68.6% | 68.3% | 67.7% | 67.5% | 67.3% | **68.4%** |
| `Day 4 Reached` | 67.0% | 62.7% | 60.1% | 59.7% | 59.4% | 57.3% | 55.3% | 51.0% | **60.2%** |
| `First Reply Received` | 52.0% | 50.9% | 50.1% | 49.8% | 49.5% | 48.7% | 48.4% | 53.1% | **49.9%** |
| `Day 5 Reached` | 53.3% | 48.5% | 45.7% | 45.3% | 45.0% | 43.0% | 41.1% | 36.7% | **46.0%** |
| `Day 2 Reached` | 33.7% | 33.1% | 32.5% | 32.6% | 32.6% | 32.2% | 32.2% | 36.7% | **32.7%** |
| `Ending Completed` | 23.1% | 19.4% | 18.1% | 18.9% | 18.7% | 17.5% | 16.1% | 11.9% | **18.8%** |
| `Day 3 Reached` | 24.3% | 23.8% | 23.2% | 23.3% | 23.2% | 22.8% | 22.7% | 25.6% | **23.3%** |

**Tripwire:** any step whose daily rate falls more than **5 pp** below its own
pre-update mean above, on a settled post-update day, is a broken step - and the step
name says where in the loop it broke.

_Pulled 2026-08-29T11:16:24Z._
