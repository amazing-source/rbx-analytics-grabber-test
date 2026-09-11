# Universe 10399712766 — metric summary

- Genre: **simulation**
- Exported: 2026-09-11T16:13:38.614Z
- Metrics captured: 94
- Data fresh through: **2026-08-21**

Δ is the latest point vs ~7 points earlier on the same series. `rate` metrics are safe to compare across a growth window; `volume` metrics are not — read their trend, and check DAU growth before drawing a conclusion.

## ⚠ Incidents

Excursions in metrics where high is bad, found by comparing each point to the series median. **Δ cannot show these** — it compares two endpoints, and an incident that spiked and recovered lives between them. The publish column states an association, not a cause; whether a spike was Roblox-side is answered only by `annotations.md`, never by inference.

| Metric | When | Peak | Typical | vs typical | Nearby publish |
|---|---|---|---|---|---|
| Server Crashes | 2026-07-29 → 2026-08-02 | **1.1M** | 1 | 1074491× | none within 72h (last: v1223, 4d before) |
| Script Errors | 2026-08-01 → 2026-08-20 | **6.2M** | 761K | 8× | v1224 published 2h into the day |
| Script Errors | 2026-08-22 | **5.2M** | 761K | 7× | v1242 published 6h before |

## Discovery

| Metric | Kind | Latest | As of | Δ | vs genre | Series | Notes |
|---|---|---|---|---|---|---|---|
| "Not Interested" Rate | rate | 66.3 | 2026-09-10 | ▼ 48.9% | — | 1 | — |
| Attributed 30d Robux/User | rate | R$ 0.65 | 2026-08-04 | ▼ 50.2% ⚠ | — | 8 | — |
| Attributed 7d Conversion | rate | 1.74% | 2026-09-03 | ▲ 60.5% | — | 8 | — |
| Attributed 7d Playtime | rate | 22.0 min | 2026-09-03 | ▼ 11.9% ⚠ | — | 8 | — |
| Attributed 7d Robux/User | rate | R$ 0.72 | 2026-09-03 | ▲ 56.0% | — | 8 | — |
| Attributed D1 Retention | rate | 10.0% | 2026-09-08 | ▼ 24.1% ⚠ | — | 1 | — |
| Attributed D7 Retention | rate | 0.61% | 2026-09-02 | ▼ 20.4% ⚠ | — | 8 | — |
| End-to-End Conversion | rate | 3.08% | 2026-09-10 | ▼ 22.0% ⚠ | — | 6 | — |
| Event RSVPs | volume | 471.6K | 2026-09-09 | ▲ 0.8% | — | 1 | 11.8K/1k DAU, DAU ▼ 73.0% over same span |
| Feedback Votes | volume | 68 | 2026-09-10 | ▼ 80.7% ⚠ | — | 1 | 2.1/1k DAU, DAU ▼ 73.5% over same span |
| Impressions (unique users) | volume | 872.1K | 2026-09-10 | ▼ 67.9% ⚠ | — | 19 | 26.5K/1k DAU, DAU ▼ 73.5% over same span |
| Joins from Notifications | volume | 3.5K | 2026-09-09 | ▲ 1.8% | — | 1 | 87.1/1k DAU, DAU ▼ 73.0% over same span |
| RFY Play Days (L7) | rate | 1.3 | 2026-09-10 | ▼ 1.4% | below genre median | 1 | — |
| RFY Qualified PTR | rate | 1.17% | 2026-09-10 | ▼ 5.1% ⚠ | — | 1 | — |

## Retention

| Metric | Kind | Latest | As of | Δ | vs genre | Series | Notes |
|---|---|---|---|---|---|---|---|
| Cohort Retention | rate | — | — | — | — | 9 | breakdown only (9 series) |
| Day 1 Retention | rate | 10.5% | 2026-09-09 | ▼ 10.1% ⚠ | below genre median | 20 | — |
| Day 1 Retention (7-day avg) | rate | 13.3% | 2026-08-28 | ▼ 4.2% ⚠ | — | 10 | — |
| Day 30 Retention | rate | 0.24% | 2026-08-03 | ▼ 65.3% ⚠ | below genre median | 1 | — |
| Day 7 Retention | rate | 0.47% | 2026-09-03 | ▼ 37.2% ⚠ | below genre median | 8 | — |
| Stickiness (DAU/MAU) | rate | 0.45% | 2026-09-10 | ▼ 62.1% ⚠ | — | 1 | — |

## Monetization

| Metric | Kind | Latest | As of | Δ | vs genre | Series | Notes |
|---|---|---|---|---|---|---|---|
| ARPDAU | rate | R$ 0.47 | 2026-09-09 | ▼ 41.1% ⚠ | above genre median | 1 | — |
| ARPPU | rate | R$ 54.38 | 2026-09-09 | ▼ 2.4% ⚠ | above genre median | 1 | — |
| Daily Revenue | volume | R$ 18.9K | 2026-09-09 | ▼ 84.2% ⚠ | — | 8 | R$ 470.3/1k DAU, DAU ▼ 73.0% over same span |
| Daily Revenue (7-day avg) | volume | R$ 110.1K | 2026-08-29 | ▼ 27.2% ⚠ | — | 1 | R$ 379.2/1k DAU, DAU ▼ 47.7% over same span |
| Event ARPDAU | rate | R$ 0.73 | 2026-09-09 | ▲ 10.9% | — | 1 | — |
| Event Revenue | volume | R$ 212.3K | 2026-09-09 | ▼ 31.3% ⚠ | — | 1 | R$ 5.3K/1k DAU, DAU ▼ 73.0% over same span |
| Item Revenue | volume | R$ 22.1K | 2026-09-10 | ▼ 77.1% ⚠ | — | 5 | R$ 671/1k DAU, DAU ▼ 73.5% over same span |
| Payer Conversion | rate | 0.87% | 2026-09-09 | ▼ 39.6% ⚠ | above genre median | 8 | — |
| Paying Users | volume | 347 | 2026-09-09 | ▼ 83.8% ⚠ | — | 1 | 8.6/1k DAU, DAU ▼ 73.0% over same span |
| Potential Extra Earnings | volume | 35.5 | 2026-09-06 | ▼ 95.4% ⚠ | — | 1 | 0.4/1k DAU, DAU ▼ 84.7% over same span; Δ spans 24d |

## Engagement

| Metric | Kind | Latest | As of | Δ | vs genre | Series | Notes |
|---|---|---|---|---|---|---|---|
| Avg Session Duration | rate | 13m 45s | 2026-08-29 | ▼ 3.2% ⚠ | — | 8 | — |
| Avg Session Length | rate | 11.9 min | 2026-09-10 | ▼ 11.8% ⚠ | below genre median | 10 | — |
| Concurrent Players | volume | 4.6K | 2026-08-29 | ▼ 54.4% ⚠ | — | 1 | 15.9/1k DAU, DAU ▼ 47.7% over same span |
| Daily Active Users | volume | 32.9K | 2026-09-10 | ▼ 73.5% ⚠ | — | 323 | — |
| DAU (7-day avg) | volume | 290.7K | 2026-08-29 | ▼ 49.7% ⚠ | — | 1 | 1K/1k DAU, DAU ▼ 47.7% over same span |
| Event DAU | volume | 334.8K | 2026-09-09 | ▼ 33.7% ⚠ | — | 1 | 8.3K/1k DAU, DAU ▼ 73.0% over same span |
| Event Playtime | rate | 18.5 min | 2026-09-09 | ▼ 5.2% ⚠ | — | 1 | — |
| Monthly Active Users | volume | 7.3M | 2026-09-10 | ▼ 30.2% ⚠ | — | 297 | 220.8K/1k DAU, DAU ▼ 73.5% over same span |
| Peak Concurrent | volume | 4.8K | 2026-08-29 | ▼ 54.1% ⚠ | — | 9 | 16.5/1k DAU, DAU ▼ 47.7% over same span |
| Playtime per Player | rate | 15.7 min | 2026-09-10 | ▼ 9.3% ⚠ | below genre median | 1 | — |
| Playtime/Player (7-day avg) | rate | 18.8 min | 2026-08-29 | ▼ 0.1% | above genre median | 1 | — |
| Sessions Ended | volume | — | — | — | — | 61 | breakdown only (61 series) |
| Total Playtime | volume | 8.6K h | 2026-09-10 | ▼ 76.0% ⚠ | — | 1 | 262.2 h/1k DAU, DAU ▼ 73.5% over same span |
| Unique Players | volume | 33.1K | 2026-09-10 | ▼ 73.4% ⚠ | — | 17 | 1K/1k DAU, DAU ▼ 73.5% over same span |
| Unique Players (7-day avg) | volume | — | — | — | — | 8 | breakdown only (8 series) |
| Visits | volume | 43.3K | 2026-09-10 | ▼ 72.8% ⚠ | — | 8 | 1.3K/1k DAU, DAU ▼ 73.5% over same span |

## Funnel

| Metric | Kind | Latest | As of | Δ | vs genre | Series | Notes |
|---|---|---|---|---|---|---|---|
| Funnel Completion | rate | — | — | — | — | 4 | breakdown only (4 series) |
| Funnel Completion (daily) | rate | — | — | — | — | 10 | breakdown only (10 series) |
| Funnel Completion (event) | rate | — | — | — | — | 1 | breakdown only (1 series) |
| Funnel Completion, sessions (daily) | rate | — | — | — | — | 10 | breakdown only (10 series) |
| Funnel Step Churn | rate | — | — | — | — | 10 | breakdown only (10 series) |
| Funnel Step Completion | rate | — | — | — | — | 13 | breakdown only (13 series) |
| Funnel Step Count | volume | — | — | — | — | 8 | breakdown only (8 series) |
| Funnel Users | volume | — | — | — | — | 11 | breakdown only (11 series) |
| Step Churn (event) | rate | — | — | — | — | 7 | breakdown only (7 series) |
| Step Completion (event) | rate | — | — | — | — | 7 | breakdown only (7 series) |

## Performance

| Metric | Kind | Latest | As of | Δ | vs genre | Series | Notes |
|---|---|---|---|---|---|---|---|
| Avg Client Memory | rate | 1.09 GB | 2026-09-10 | ▼ 3.0% | — | 7 | shown: Place=83256791430098 |
| Avg FPS | rate | 43 fps | 2026-08-29 | ▲ 3.4% | — | 2 | — |
| Avg Memory | rate | 324.2 MB | 2026-08-29 | ▲ 1.3% | — | 16 | — |
| Client CPU Time | rate | 11.5 | 2026-09-10 | ▼ 12.2% | — | 6 | shown: Place=83256791430098 |
| CPU Core Utilization | rate | 22.7% | 2026-09-10 | ▲ 20.4% ⚠ | — | 1 | shown: Place=83256791430098 |
| Crash Count | volume | 257 | 2026-09-10 | ▼ 67.6% | — | 6 | shown: Place=83256791430098; 7.8/1k DAU, DAU ▼ 73.5% over same span |
| Crash Rate (15m) | rate | 0.63% | 2026-08-29 | ▼ 19.2% | — | 8 | ⚠ not statistically significant: Platform: TV · Place=83256791430098 |
| FPS (10th pct) | rate | 34 fps | 2026-09-10 | ▼ 3.3% ⚠ | — | 7 | shown: Place=83256791430098 |
| Memory Used % | rate | 23.0% | 2026-09-10 | ▼ 2.5% | — | 7 | shown: Place=83256791430098 |
| Out-of-Memory Exits | volume | 35 | 2026-09-10 | ▼ 64.6% | — | 5 | shown: Place=83256791430098; 1.1/1k DAU, DAU ▼ 73.5% over same span |
| Script Errors | volume | 260.6K | 2026-09-10 | ▼ 83.3% | — | 1951 | 7.9K/1k DAU, DAU ▼ 77.8% over same span |
| Server CPU Time | rate | 0.9 | 2026-09-10 | ▲ 37.7% ⚠ | — | 6 | shown: Place=83256791430098 |
| Server Crashes | volume | 1 | 2026-09-03 | — | — | 5 | shown: Place=83256791430098; 0/1k DAU |
| Server FPS (10th pct) | rate | 59 fps | 2026-09-10 | ▲ 0.6% | — | 1 | shown: Place=83256791430098 |

## Other

| Metric | Kind | Latest | As of | Δ | vs genre | Series | Notes |
|---|---|---|---|---|---|---|---|
| Attribution1 D Payer Conversion Ratio | rate | — | — | — | — | 7 | breakdown only (7 series) |
| Attribution1 D Robux Per User | volume | — | — | — | — | 7 | breakdown only (7 series) |
| Attribution30 D Payer Conversion Ratio | rate | — | — | — | — | 7 | breakdown only (7 series) |
| D1 Retention | rate | 13.7% | 2026-08-29 | ▼ 8.0% ⚠ | — | 1 | — |
| RFY Duration0 To60 | rate | 13.7% | 2026-09-10 | ▲ 25.6% | — | 1 | — |
| RFY Duration61 To180 | rate | 18.3% | 2026-09-10 | ▲ 13.9% | — | 1 | — |
| RFY Play Through Rate | rate | 1.72% | 2026-09-10 | ▲ 2.0% | — | 1 | — |
| RFYD1 Coplay Days | volume | 0.1 | 2026-09-10 | ▲ 3.1% | — | 1 | 0/1k DAU, DAU ▼ 73.5% over same span |
| RFYD1 Playtime | volume | 13 | 2026-09-10 | ▼ 10.9% ⚠ | — | 1 | 0.4/1k DAU, DAU ▼ 73.5% over same span |
| RFYD1 Qualified Play Sessions | volume | 0.9 | 2026-09-10 | ▼ 5.4% ⚠ | — | 1 | 0/1k DAU, DAU ▼ 73.5% over same span |
| RFYD1 Robux Spend | volume | R$ 0.90 | 2026-09-10 | ▲ 48.8% | — | 1 | R$ 0.03/1k DAU, DAU ▼ 73.5% over same span |
| RFYD1 Spend Day | volume | 0 | 2026-09-10 | ▼ 27.0% ⚠ | — | 1 | 0/1k DAU, DAU ▼ 73.5% over same span |
| RFYD2 To7 Coplay Days | volume | 0 | 2026-09-10 | ▼ 1.8% | — | 1 | 0/1k DAU, DAU ▼ 73.5% over same span |
| RFYD2 To7 Play Days | volume | 0.3 | 2026-09-10 | ▼ 8.8% ⚠ | — | 1 | 0/1k DAU, DAU ▼ 73.5% over same span |
| RFYD2 To7 Playtime | volume | 4.6 | 2026-09-10 | ▼ 11.9% ⚠ | — | 1 | 0.1/1k DAU, DAU ▼ 73.5% over same span |
| RFYD2 To7 Qualified Play Sessions | volume | 0.3 | 2026-09-10 | ▼ 8.0% ⚠ | — | 1 | 0/1k DAU, DAU ▼ 73.5% over same span |
| RFYD2 To7 Robux Spend | volume | R$ 0.28 | 2026-09-10 | ▲ 9.5% | — | 1 | R$ 0.01/1k DAU, DAU ▼ 73.5% over same span |
| RFYD2 To7 Spend Days | volume | 0 | 2026-09-10 | ▲ 17.3% | — | 1 | 0/1k DAU, DAU ▼ 73.5% over same span |
| RFYD8 To28 Coplay Days | volume | 0 | 2026-09-10 | ▼ 36.8% ⚠ | — | 1 | 0/1k DAU, DAU ▼ 73.5% over same span |
| RFYD8 To28 Play Days | volume | 0.2 | 2026-09-10 | ▼ 22.1% ⚠ | — | 1 | 0/1k DAU, DAU ▼ 73.5% over same span |
| RFYD8 To28 Playtime | volume | 1.9 | 2026-09-10 | ▼ 25.5% ⚠ | — | 1 | 0.1/1k DAU, DAU ▼ 73.5% over same span |
| RFYD8 To28 Qualified Play Sessions | volume | 0.1 | 2026-09-10 | ▼ 22.3% ⚠ | — | 1 | 0/1k DAU, DAU ▼ 73.5% over same span |
| RFYD8 To28 Robux Spend | volume | R$ 0.10 | 2026-09-10 | ▲ 11.1% | — | 1 | R$ 0.00/1k DAU, DAU ▼ 73.5% over same span |
| RFYD8 To28 Spend Days | volume | 0 | 2026-09-10 | ▼ 41.1% ⚠ | — | 1 | 0/1k DAU, DAU ▼ 73.5% over same span |

## Files

- `series.json` — every metric, every breakdown, every point. The full record.
- `metrics/<Metric>.csv` — one long-format CSV per metric (`date,ts,granularity,series,value,status,captured_at,partial`). `FILLED_ZERO` status marks zeros the API omitted; `partial` marks in-progress captures excluded from headlines.
- `metrics/<Metric>.daily.csv` — daily rollup of sub-daily metrics; `agg` says how (mean for rates, sum for volumes, max for concurrents), `samples` how many points fed the day, `partial` which days cannot be quoted whole.
- `catalog.json` — metric → response-path hash, freshness, and the series inventory.
- `data-quality.md` — settled points the gateway re-served with different values (first settled read kept) and values outside their unit's plausible range. Present only when something was found.
- `feedback.csv` / `feedback.md` — raw player reviews (up/down-votes + comments) with the `asset_version` each landed on, plus counts by category and version. Present only when feedback was captured.
