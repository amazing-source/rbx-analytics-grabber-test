# Funnels before the update - Climb Waterslide and Slide (10030829154)

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
| 1 | `Tutorial_Main_1_StartSwim` | 3,124,713 | 100.00% | 0.00% |
| 2 | `Tutorial_Main_2_WaitGetCash` | 3,044,370 | 97.43% | 2.57% |
| 3 | `Tutorial_Main_3_ClickSlide` | 2,955,330 | 97.08% | 2.92% |
| 4 | `Tutorial_Main_4_WaitSildeEnd` | 2,947,414 | 99.73% | 0.27% |
| 5 | `Tutorial_Main_5_ToRaftShop` | 2,478,526 | 84.09% | 15.91% |
| 6 | `Tutorial_Main_6_StartSwim` | 2,441,808 | 98.52% | 1.48% |
| 7 | `Tutorial_Main_7_WaitGetCash` | 2,433,425 | 99.66% | 0.34% |
| 8 | `Tutorial_Main_8_ClickSlide` | 2,357,156 | 96.87% | 3.13% |
| 9 | `Tutorial_Main_9_WaitSildeEnd` | 2,350,946 | 99.74% | 0.26% |
| 10 | `Tutorial_Main_10_BuyEgg` | 2,069,309 | 88.02% | 11.98% |
| 11 | `Tutorial_Main_11_OpenPetBag` | 1,941,527 | 93.82% | 6.18% |
| 12 | `Tutorial_Main_12_EquipPet` | 1,758,484 | 90.57% | 9.43% |
| 13 | `Tutorial_Main_13_ClosePetBag` | 1,755,067 | 99.81% | 0.19% |
| 14 | `Tutorial_Main_14_Final` | 1,754,376 | 99.96% | 0.04% |
| 15 | `Tutorial_Main_15_AddFriendTip` | 1,587,494 | 90.49% | 9.51% |

## Daily completion rate per step - the tripwire baseline

| Step | 08-21 | 08-22 | 08-23 | 08-24 | 08-25 | 08-26 | 08-27 | 08-28 | pre-update mean |
|---|---|---|---|---|---|---|---|---|---|
| `Tutorial_Main_1_StartSwim` | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% | **100.0%** |
| `Tutorial_Main_2_WaitGetCash` | 97.8% | 97.2% | 97.4% | 97.7% | 97.4% | 97.4% | 97.5% | 97.4% | **97.5%** |
| `Tutorial_Main_3_ClickSlide` | 95.2% | 94.0% | 94.1% | 94.8% | 94.0% | 94.0% | 94.5% | 93.9% | **94.4%** |
| `Tutorial_Main_4_WaitSildeEnd` | 95.0% | 93.7% | 93.8% | 94.6% | 93.8% | 93.8% | 94.3% | 93.7% | **94.1%** |
| `Tutorial_Main_5_ToRaftShop` | 80.4% | 81.5% | 81.9% | 84.0% | 82.1% | 81.8% | 83.2% | 80.0% | **82.1%** |
| `Tutorial_Main_6_StartSwim` | 79.3% | 80.0% | 80.4% | 82.4% | 80.4% | 80.1% | 81.6% | 78.2% | **80.6%** |
| `Tutorial_Main_7_WaitGetCash` | 79.1% | 79.7% | 80.1% | 82.2% | 80.1% | 79.7% | 81.3% | 77.9% | **80.3%** |
| `Tutorial_Main_8_ClickSlide` | 76.8% | 76.9% | 77.3% | 79.4% | 77.2% | 76.7% | 78.5% | 74.8% | **77.5%** |
| `Tutorial_Main_9_WaitSildeEnd` | 76.6% | 76.7% | 77.1% | 79.2% | 76.9% | 76.5% | 78.3% | 74.6% | **77.3%** |
| `Tutorial_Main_10_BuyEgg` | 68.0% | 66.3% | 66.0% | 68.7% | 66.0% | 65.5% | 67.6% | 63.3% | **66.9%** |
| `Tutorial_Main_11_OpenPetBag` | 64.0% | 61.4% | 61.3% | 64.0% | 61.1% | 60.3% | 62.6% | 57.9% | **62.1%** |
| `Tutorial_Main_12_EquipPet` | 57.8% | 54.5% | 54.9% | 57.6% | 55.1% | 54.3% | 56.4% | 51.9% | **55.8%** |
| `Tutorial_Main_13_ClosePetBag` | 57.7% | 54.3% | 54.8% | 57.4% | 55.0% | 54.2% | 56.2% | 51.8% | **55.7%** |
| `Tutorial_Main_14_Final` | 57.6% | 54.3% | 54.8% | 57.4% | 54.9% | 54.1% | 56.2% | 51.7% | **55.6%** |
| `Tutorial_Main_15_AddFriendTip` | 52.6% | 49.0% | 49.1% | 51.4% | 48.7% | 47.5% | 49.8% | 45.2% | **49.7%** |

**Tripwire:** any step whose daily rate falls more than **5 pp** below its own
pre-update mean above, on a settled post-update day, is a broken step - and the step
name says where in the loop it broke.

_Pulled 2026-08-29T11:17:02Z._
