# Universe 10638354731 — metric summary

- Genre: **simulation**
- Exported: 2026-09-19T09:10:16.456Z
- Metrics captured: 94
- Data fresh through: **2026-08-30**

Δ is the latest point vs ~7 points earlier on the same series. `rate` metrics are safe to compare across a growth window; `volume` metrics are not — read their trend, and check DAU growth before drawing a conclusion.

## ⚠ Incidents

Excursions in metrics where high is bad, found by comparing each point to the series median. **Δ cannot show these** — it compares two endpoints, and an incident that spiked and recovered lives between them. The publish column states an association, not a cause; whether a spike was Roblox-side is answered only by `annotations.md`, never by inference.

| Metric | When | Peak | Typical | vs typical | Nearby publish |
|---|---|---|---|---|---|
| Script Errors | 2026-08-22 → 2026-08-31 | **17.8M** | 1.3M | 14× | v903 published 19h before |
| Client CPU Time | 2026-09-13 | **52.3** | 4.6 | 11× | v916 published 29h before |
| Out-of-Memory Exits | 2026-08-26 → 2026-08-30 | **244** | 22 | 11× | v907 published 12h into the day |
| Crash Count | 2026-08-26 → 2026-08-30 | **2.6K** | 277 | 9× | v907 published 12h into the day |

## Discovery

| Metric | Kind | Latest | As of | Δ | vs genre | Series | Notes |
|---|---|---|---|---|---|---|---|
| "Not Interested" Rate | rate | 56.3 | 2026-09-17 | ▲ 56.6% ⚠ | — | 1 | — |
| Attributed 30d Robux/User | rate | R$ 0.00 | 2026-08-04 | — | — | 5 | — |
| Attributed 7d Conversion | rate | 2.02% | 2026-09-07 | ▲ 39.6% | — | 7 | — |
| Attributed 7d Playtime | rate | 23.1 min | 2026-09-07 | ▲ 2.4% | — | 7 | — |
| Attributed 7d Robux/User | rate | R$ 2.78 | 2026-09-07 | ▲ 12.6% | — | 7 | — |
| Attributed D1 Retention | rate | 10.1% | 2026-09-12 | ▼ 8.7% ⚠ | — | 1 | — |
| Attributed D7 Retention | rate | 1.37% | 2026-09-06 | ▼ 5.1% ⚠ | — | 7 | — |
| End-to-End Conversion | rate | 3.14% | 2026-09-17 | ▼ 22.2% ⚠ | — | 5 | — |
| Event RSVPs | volume | 4.8K | 2026-09-17 | ▲ 78.1% | — | 1 | 161/1k DAU, DAU ▼ 34.3% over same span |
| Feedback Votes | volume | 187 | 2026-09-18 | ▼ 8.8% ⚠ | — | 1 | — |
| Impressions (unique users) | volume | 755.5K | 2026-09-17 | ▼ 15.7% ⚠ | — | 19 | 25.1K/1k DAU, DAU ▼ 34.3% over same span |
| Joins from Notifications | volume | 147 | 2026-09-17 | ▲ 65.2% | — | 1 | 4.9/1k DAU, DAU ▼ 34.3% over same span |
| RFY Play Days (L7) | rate | 1.2 | 2026-09-17 | ▼ 3.1% ⚠ | below similar games median | 1 | — |
| RFY Qualified PTR | rate | 0.76% | 2026-09-17 | ▼ 30.1% ⚠ | — | 1 | — |

## Retention

| Metric | Kind | Latest | As of | Δ | vs genre | Series | Notes |
|---|---|---|---|---|---|---|---|
| Cohort Retention | rate | — | — | — | — | 8 | breakdown only (8 series) |
| Day 1 Retention | rate | 10.4% | 2026-09-16 | ▲ 2.6% | below similar games median | 16 | — |
| Day 1 Retention (7-day avg) | rate | 12.9% | 2026-08-28 | ▲ 2.4% | — | 9 | — |
| Day 30 Retention | rate | 0.00% | 2026-07-30 | — | below similar games median | 1 | — |
| Day 7 Retention | rate | 0.53% | 2026-09-10 | ▼ 35.9% ⚠ | below similar games median | 6 | — |
| Stickiness (DAU/MAU) | rate | 0.86% | 2026-09-17 | ▼ 36.5% ⚠ | — | 1 | — |

## Monetization

| Metric | Kind | Latest | As of | Δ | vs genre | Series | Notes |
|---|---|---|---|---|---|---|---|
| ARPDAU | rate | R$ 2.44 | 2026-09-17 | ▲ 12.6% | above similar games median | 1 | — |
| ARPPU | rate | R$ 137.8 | 2026-09-17 | ▼ 11.3% ⚠ | above similar games median | 1 | — |
| Daily Revenue | volume | R$ 74.1K | 2026-09-17 | ▼ 25.0% ⚠ | — | 8 | R$ 2.5K/1k DAU, DAU ▼ 34.3% over same span |
| Daily Revenue (7-day avg) | volume | R$ 693.4K | 2026-08-29 | ▲ 249.9% | — | 1 | R$ 1.7K/1k DAU, DAU ▲ 99.7% over same span |
| Event ARPDAU | rate | R$ 2.32 | 2026-09-17 | ▲ 4.5% | — | 1 | — |
| Event Revenue | volume | R$ 303.4K | 2026-09-17 | ▼ 18.4% ⚠ | — | 1 | R$ 10.1K/1k DAU, DAU ▼ 34.3% over same span |
| Item Revenue | volume | R$ 98.1K | 2026-09-18 | ▲ 9.3% | — | 5 | — |
| Payer Conversion | rate | 1.77% | 2026-09-17 | ▲ 27.0% | above similar games median | 7 | — |
| Paying Users | volume | 538 | 2026-09-17 | ▼ 15.4% ⚠ | — | 1 | 17.9/1k DAU, DAU ▼ 34.3% over same span |
| Potential Extra Earnings | volume | 0 | 2026-09-16 | — | — | 1 | 0/1k DAU |

## Engagement

| Metric | Kind | Latest | As of | Δ | vs genre | Series | Notes |
|---|---|---|---|---|---|---|---|
| Avg Session Duration | rate | 16m 10s | 2026-09-01 | ▼ 6.7% ⚠ | — | 7 | — |
| Avg Session Length | rate | 14.9 min | 2026-09-17 | ▼ 0.6% | above similar games median | 8 | — |
| Concurrent Players | volume | 3.3K | 2026-09-01 | ▼ 35.0% ⚠ | — | 1 | 21.1/1k DAU, DAU ▼ 36.5% over same span |
| Daily Active Users | volume | 30.1K | 2026-09-17 | ▼ 34.3% ⚠ | — | 319 | — |
| DAU (7-day avg) | volume | 335.5K | 2026-08-29 | ▲ 401.5% | top 10% of similar games | 1 | 804.1/1k DAU, DAU ▲ 99.7% over same span |
| Event DAU | volume | 149.1K | 2026-09-17 | ▼ 20.1% ⚠ | — | 1 | 5K/1k DAU, DAU ▼ 34.3% over same span |
| Event Playtime | rate | 18.9 min | 2026-09-17 | ▼ 1.5% | — | 1 | — |
| Monthly Active Users | volume | 3.5M | 2026-09-17 | ▲ 3.3% | top 10% of similar games | 296 | 116.6K/1k DAU, DAU ▼ 34.3% over same span |
| Peak Concurrent | volume | 3.2K | 2026-09-01 | ▼ 38.8% ⚠ | — | 8 | 21/1k DAU, DAU ▼ 36.5% over same span |
| Playtime per Player | rate | 18.9 min | 2026-09-17 | ▲ 0.5% | below similar games median | 1 | — |
| Playtime/Player (7-day avg) | rate | 21.5 min | 2026-08-29 | ▼ 6.8% ⚠ | above similar games median | 1 | — |
| Sessions Ended | volume | — | — | — | — | 61 | breakdown only (61 series) |
| Total Playtime | volume | 9.5K h | 2026-09-17 | ▼ 34.0% ⚠ | — | 1 | 315 h/1k DAU, DAU ▼ 34.3% over same span |
| Unique Players | volume | 30.3K | 2026-09-17 | ▼ 33.4% ⚠ | — | 16 | 1K/1k DAU, DAU ▼ 34.3% over same span |
| Unique Players (7-day avg) | volume | — | — | — | — | 6 | breakdown only (6 series) |
| Visits | volume | 38K | 2026-09-17 | ▼ 33.6% ⚠ | — | 6 | 1.3K/1k DAU, DAU ▼ 34.3% over same span |

## Funnel

| Metric | Kind | Latest | As of | Δ | vs genre | Series | Notes |
|---|---|---|---|---|---|---|---|
| Funnel Completion | rate | — | — | — | — | 17 | breakdown only (17 series) |
| Funnel Completion (daily) | rate | — | — | — | — | 39 | breakdown only (39 series) |
| Funnel Completion (event) | rate | — | — | — | — | 6 | breakdown only (6 series) |
| Funnel Completion, sessions (daily) | rate | — | — | — | — | 39 | breakdown only (39 series) |
| Funnel Step Churn | rate | — | — | — | — | 44 | breakdown only (44 series) |
| Funnel Step Completion | rate | — | — | — | — | 74 | breakdown only (74 series) |
| Funnel Step Count | volume | — | — | — | — | 36 | breakdown only (36 series) |
| Funnel Users | volume | — | — | — | — | 50 | breakdown only (50 series) |
| Step Churn (event) | rate | — | — | — | — | 33 | breakdown only (33 series) |
| Step Completion (event) | rate | — | — | — | — | 33 | breakdown only (33 series) |

## Performance

| Metric | Kind | Latest | As of | Δ | vs genre | Series | Notes |
|---|---|---|---|---|---|---|---|
| Avg Client Memory | rate | 1.12 GB | 2026-09-18 | ▼ 0.0% | — | 6 | shown: Place=120014184236770 |
| Avg FPS | rate | 65 fps | 2026-09-01 | ▼ 0.5% | — | 2 | — |
| Avg Memory | rate | 604.6 MB | 2026-09-01 | ▲ 52.9% ⚠ | — | 16 | — |
| Client CPU Time | rate | 3.7 | 2026-09-18 | ▼ 15.5% | — | 6 | shown: Place=120014184236770 |
| CPU Core Utilization | rate | 8.36% | 2026-09-18 | ▲ 2.3% ⚠ | — | 1 | shown: Place=120014184236770 |
| Crash Count | volume | 174 | 2026-09-18 | ▼ 37.9% | — | 5 | shown: Place=120014184236770 |
| Crash Rate (15m) | rate | 0.52% | 2026-09-01 | ▼ 5.5% | — | 7 | — |
| FPS (10th pct) | rate | 45 fps | 2026-09-18 | ▲ 2.9% | — | 6 | shown: Place=120014184236770 |
| Memory Used % | rate | 23.3% | 2026-09-18 | ▼ 2.4% | — | 6 | shown: Place=120014184236770 |
| Out-of-Memory Exits | volume | 9 | 2026-09-18 | ▼ 30.8% | — | 4 | shown: Place=120014184236770 |
| Script Errors | volume | 1.2M | 2026-09-18 | ▼ 0.5% | — | 941 | — |
| Server CPU Time | rate | 0.9 | 2026-09-18 | ▲ 15.1% ⚠ | — | 6 | shown: Place=120014184236770 |
| Server Crashes | volume | 0 | 2026-08-28 | — | — | 2 | shown: Place=120014184236770; 0/1k DAU |
| Server FPS (10th pct) | rate | 60 fps | 2026-09-18 | ▲ 0.0% | — | 1 | shown: Place=120014184236770 |

## Other

| Metric | Kind | Latest | As of | Δ | vs genre | Series | Notes |
|---|---|---|---|---|---|---|---|
| Attribution1 D Payer Conversion Ratio | rate | — | — | — | — | 6 | breakdown only (6 series) |
| Attribution1 D Robux Per User | volume | — | — | — | — | 6 | breakdown only (6 series) |
| Attribution30 D Payer Conversion Ratio | rate | — | — | — | — | 4 | breakdown only (4 series) |
| D1 Retention | rate | 9.95% | 2026-09-01 | ▼ 19.7% ⚠ | — | 1 | — |
| RFY Duration0 To60 | rate | 13.4% | 2026-09-17 | ▲ 13.5% | — | 1 | — |
| RFY Duration61 To180 | rate | 19.7% | 2026-09-17 | ▲ 3.7% | — | 1 | — |
| RFY Play Through Rate | rate | 1.14% | 2026-09-17 | ▼ 27.8% ⚠ | — | 1 | — |
| RFYD1 Coplay Days | volume | 0 | 2026-09-18 | ▼ 100.0% ⚠ | — | 1 | — |
| RFYD1 Playtime | volume | 0 | 2026-09-18 | ▼ 100.0% ⚠ | — | 1 | — |
| RFYD1 Qualified Play Sessions | volume | 0 | 2026-09-18 | ▼ 100.0% ⚠ | — | 1 | — |
| RFYD1 Robux Spend | volume | R$ 0.00 | 2026-09-18 | ▼ 100.0% ⚠ | — | 1 | — |
| RFYD1 Spend Day | volume | 0 | 2026-09-18 | ▼ 100.0% ⚠ | — | 1 | — |
| RFYD2 To7 Coplay Days | volume | 0 | 2026-09-18 | ▼ 100.0% ⚠ | — | 1 | — |
| RFYD2 To7 Play Days | volume | 0 | 2026-09-18 | ▼ 100.0% ⚠ | — | 1 | — |
| RFYD2 To7 Playtime | volume | 0 | 2026-09-18 | ▼ 100.0% ⚠ | — | 1 | — |
| RFYD2 To7 Qualified Play Sessions | volume | 0 | 2026-09-18 | ▼ 100.0% ⚠ | — | 1 | — |
| RFYD2 To7 Robux Spend | volume | R$ 0.00 | 2026-09-18 | ▼ 100.0% ⚠ | — | 1 | — |
| RFYD2 To7 Spend Days | volume | 0 | 2026-09-18 | ▼ 100.0% ⚠ | — | 1 | — |
| RFYD8 To28 Coplay Days | volume | 0 | 2026-09-18 | — | — | 1 | — |
| RFYD8 To28 Play Days | volume | 0 | 2026-09-18 | — | — | 1 | — |
| RFYD8 To28 Playtime | volume | 0 | 2026-09-18 | — | — | 1 | — |
| RFYD8 To28 Qualified Play Sessions | volume | 0 | 2026-09-18 | — | — | 1 | — |
| RFYD8 To28 Robux Spend | volume | R$ 0.00 | 2026-09-18 | — | — | 1 | — |
| RFYD8 To28 Spend Days | volume | 0 | 2026-09-18 | — | — | 1 | — |

## Files

- `series.json` — every metric, every breakdown, every point. The full record.
- `metrics/<Metric>.csv` — one long-format CSV per metric (`date,ts,granularity,series,value,status,captured_at,partial`). `FILLED_ZERO` status marks zeros the API omitted; `partial` marks in-progress captures excluded from headlines.
- `metrics/<Metric>.daily.csv` — daily rollup of sub-daily metrics; `agg` says how (mean for rates, sum for volumes, max for concurrents), `samples` how many points fed the day, `partial` which days cannot be quoted whole.
- `catalog.json` — metric → response-path hash, freshness, and the series inventory.
- `data-quality.md` — settled points the gateway re-served with different values (first settled read kept) and values outside their unit's plausible range. Present only when something was found.
- `feedback.csv` / `feedback.md` — raw player reviews (up/down-votes + comments) with the `asset_version` each landed on, plus counts by category and version. Present only when feedback was captured.
