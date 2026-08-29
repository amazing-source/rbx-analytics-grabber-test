# Funnels before the update - +1 Banana Monkey Destruction (10399712766)

Pulled from Open Cloud on 2026-08-28, window 2026-08-14 to 2026-08-29 (exclusive).

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
| 1 | `Joined` | 4,341,504 | 100.00% | 0.00% |
| 2 | `Punched` | 4,187,308 | 96.45% | 3.55% |
| 3 | `Collected a Banana` | 4,149,996 | 99.11% | 0.89% |

## Daily completion rate per step - the tripwire baseline

Columns are the last 8 days. **2026-08-28 is today and still in progress** - it is
shown for continuity but is excluded from the mean, which is computed over the
7 complete days 2026-08-21 to 2026-08-27.

| Step | 08-21 | 08-22 | 08-23 | 08-24 | 08-25 | 08-26 | 08-27 | 08-28 *(part)* | 7d mean |
|---|---|---|---|---|---|---|---|---|---|
| `Joined` | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% | **100.0%** |
| `Punched` | 96.6% | 96.1% | 95.7% | 96.0% | 96.1% | 96.4% | 96.0% | 95.6% | **96.1%** |
| `Collected a Banana` | 95.7% | 95.2% | 94.7% | 95.0% | 95.2% | 95.6% | 95.2% | 94.8% | **95.2%** |

**Tripwire:** any step whose daily rate falls more than **5 pp** below its own
7-day mean above, on a settled post-update day, is a broken step - and the step
name says where in the loop it broke.

_Pulled 2026-08-28T15:45Z; mean recomputed over complete days only._
