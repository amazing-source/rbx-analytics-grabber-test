# Funnels before the update - Become a Brainrot (9963622286)

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
| 1 | `OnboardingComplete` | 651,943 | 100.00% | 0.00% |
| 2 | `BaseUpgrade2` | 625,995 | 96.02% | 3.98% |
| 3 | `FirstMorph` | 613,770 | 98.05% | 1.95% |
| 4 | `BaseUpgrade4` | 395,841 | 64.49% | 35.51% |
| 5 | `BaseUpgrade5` | 354,585 | 89.58% | 10.42% |
| 6 | `BaseUpgrade6` | 339,228 | 95.67% | 4.33% |
| 7 | `BaseUpgrade7` | 327,005 | 96.40% | 3.60% |
| 8 | `BaseUpgrade8` | 207,729 | 63.52% | 36.48% |
| 9 | `BaseUpgrade9` | 202,987 | 97.72% | 2.28% |
| 10 | `BaseUpgrade10` | 196,822 | 96.96% | 3.04% |
| 11 | `BaseUpgrade11` | 189,367 | 96.21% | 3.79% |
| 12 | `BaseUpgrade12` | 182,519 | 96.38% | 3.62% |
| 13 | `BaseUpgrade13` | 176,070 | 96.47% | 3.53% |
| 14 | `BaseUpgrade14` | 167,655 | 95.22% | 4.78% |
| 15 | `BaseUpgrade15` | 160,763 | 95.89% | 4.11% |
| 16 | `BaseUpgrade16` | 152,384 | 94.79% | 5.21% |
| 17 | `BaseUpgrade17` | 144,143 | 94.59% | 5.41% |
| 18 | `BaseUpgrade18` | 134,645 | 93.41% | 6.59% |
| 19 | `BaseUpgrade19` | 125,068 | 92.89% | 7.11% |
| 20 | `BaseUpgrade20` | 115,835 | 92.62% | 7.38% |

## Daily completion rate per step - the tripwire baseline

Columns are the last 8 days. **2026-08-28 is today and still in progress** - it is
shown for continuity but is excluded from the mean, which is computed over the
7 complete days 2026-08-21 to 2026-08-27.

| Step | 08-21 | 08-22 | 08-23 | 08-24 | 08-25 | 08-26 | 08-27 | 08-28 *(part)* | 7d mean |
|---|---|---|---|---|---|---|---|---|---|
| `OnboardingComplete` | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% | **100.0%** |
| `BaseUpgrade2` | 96.0% | 96.7% | 96.5% | 96.5% | 96.3% | 96.3% | 96.2% | 95.8% | **96.3%** |
| `FirstMorph` | 94.1% | 95.2% | 94.9% | 94.7% | 94.6% | 94.8% | 94.7% | 94.0% | **94.7%** |
| `BaseUpgrade8` | 75.3% | 79.9% | 79.3% | 79.3% | 78.7% | 78.1% | 78.1% | 75.5% | **78.4%** |
| `BaseUpgrade9` | 73.7% | 78.4% | 77.6% | 77.7% | 77.2% | 76.5% | 76.2% | 73.6% | **76.8%** |
| `BaseUpgrade10` | 71.6% | 76.4% | 75.6% | 75.9% | 75.1% | 74.5% | 74.2% | 71.1% | **74.8%** |
| `BaseUpgrade11` | 68.8% | 74.0% | 73.0% | 73.7% | 72.6% | 71.6% | 71.3% | 68.2% | **72.1%** |
| `BaseUpgrade12` | 66.5% | 71.6% | 70.6% | 71.3% | 70.3% | 69.0% | 68.8% | 65.5% | **69.7%** |
| `BaseUpgrade13` | 64.3% | 69.5% | 68.4% | 69.0% | 68.0% | 66.8% | 66.5% | 62.9% | **67.5%** |
| `BaseUpgrade4` | 60.0% | 65.5% | 65.0% | 65.7% | 64.4% | 63.9% | 62.6% | 60.7% | **63.9%** |
| `BaseUpgrade14` | 61.4% | 66.5% | 65.3% | 66.3% | 64.9% | 63.4% | 63.5% | 59.5% | **64.5%** |
| `BaseUpgrade15` | 59.0% | 64.0% | 62.5% | 63.7% | 62.3% | 60.7% | 60.4% | 56.2% | **61.8%** |
| `BaseUpgrade16` | 56.1% | 60.9% | 59.2% | 60.4% | 59.0% | 57.3% | 57.0% | 52.6% | **58.6%** |
| `BaseUpgrade5` | 53.7% | 60.0% | 59.3% | 60.4% | 58.7% | 57.9% | 57.0% | 55.0% | **58.1%** |
| `BaseUpgrade6` | 51.4% | 57.8% | 57.1% | 58.0% | 56.5% | 55.7% | 54.7% | 52.6% | **55.9%** |
| `BaseUpgrade17` | 53.4% | 57.7% | 55.9% | 56.8% | 55.5% | 53.7% | 53.2% | 49.0% | **55.2%** |
| `BaseUpgrade7` | 49.7% | 56.0% | 55.4% | 56.3% | 54.7% | 53.9% | 52.8% | 50.7% | **54.1%** |
| `BaseUpgrade18` | 50.0% | 54.0% | 51.7% | 53.0% | 52.0% | 49.6% | 49.2% | 44.3% | **51.4%** |
| `BaseUpgrade19` | 46.7% | 50.2% | 47.8% | 49.0% | 48.0% | 45.6% | 45.2% | 40.2% | **47.5%** |
| `BaseUpgrade20` | 43.5% | 46.2% | 44.2% | 45.3% | 43.8% | 41.8% | 41.0% | 35.9% | **43.7%** |

**Tripwire:** any step whose daily rate falls more than **5 pp** below its own
7-day mean above, on a settled post-update day, is a broken step - and the step
name says where in the loop it broke.

_Pulled 2026-08-28T15:45Z; mean recomputed over complete days only._
