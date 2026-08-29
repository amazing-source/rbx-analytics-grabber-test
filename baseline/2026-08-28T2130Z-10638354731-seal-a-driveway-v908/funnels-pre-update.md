# Funnels before the update - Seal A Driveway [RELEASE] (10638354731)

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
| 1 | `Neighbourhood` | 5,880,565 | 100.00% | 0.00% |
| 2 | `ReachedDriveway` | 3,859,230 | 65.63% | 34.37% |
| 3 | `PouredOut` | 2,453,926 | 63.59% | 36.41% |
| 4 | `FirstPass` | 2,277,544 | 92.81% | 7.19% |
| 5 | `DrivewaySealed` | 2,156,739 | 94.70% | 5.30% |
| 6 | `Complete` | 1,716,992 | 79.61% | 20.39% |

## Daily completion rate per step - the tripwire baseline

| Step | 08-21 | 08-22 | 08-23 | 08-24 | 08-25 | 08-26 | 08-27 | 08-28 | pre-update mean |
|---|---|---|---|---|---|---|---|---|---|
| `Neighbourhood` | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% | **100.0%** |
| `ReachedDriveway` | 70.2% | 68.3% | 67.9% | 66.7% | 66.1% | 65.8% | 64.2% | 62.0% | **67.0%** |
| `Complete` | 50.1% | 48.4% | 47.7% | 46.2% | 45.4% | 45.0% | 42.7% | 39.9% | **46.5%** |
| `PouredOut` | 45.8% | 44.2% | 43.8% | 42.7% | 42.2% | 41.4% | 40.4% | 38.7% | **42.9%** |
| `DrivewaySealed` | 40.8% | 39.3% | 38.9% | 37.8% | 37.2% | 36.5% | 35.3% | 33.4% | **38.0%** |
| `FirstPass` | 42.5% | 41.1% | 40.7% | 39.7% | 39.2% | 38.5% | 37.5% | 35.8% | **39.9%** |

**Tripwire:** any step whose daily rate falls more than **5 pp** below its own
pre-update mean above, on a settled post-update day, is a broken step - and the step
name says where in the loop it broke.

_Pulled 2026-08-29T11:16:42Z._
