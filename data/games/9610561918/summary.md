# Universe 9610561918 — metric summary

- Genre: **simulation**
- Exported: 2026-09-11T16:30:43.996Z
- Metrics captured: 81
- Data fresh through: **2026-08-09**

Δ is the latest point vs ~7 points earlier on the same series. `rate` metrics are safe to compare across a growth window; `volume` metrics are not — read their trend, and check DAU growth before drawing a conclusion.

## ⚠ Incidents

Excursions in metrics where high is bad, found by comparing each point to the series median. **Δ cannot show these** — it compares two endpoints, and an incident that spiked and recovered lives between them. The publish column states an association, not a cause; whether a spike was Roblox-side is answered only by `annotations.md`, never by inference.

| Metric | When | Peak | Typical | vs typical | Nearby publish |
|---|---|---|---|---|---|
| Server Crashes | 2026-07-28 → 2026-08-02 | **30.4K** | 2 | 15197× | none within 72h (last: v3823, 3d before) |
| Server Crashes | 2026-08-30 | **32** | 2 | 16× | v3843 published 37h before |
| Script Errors | 2026-07-08 | **3M** | 408K | 7× | none within 72h (last: v3810, 4d before) |
| Crash Rate (15m) | 2026-08-22 → 2026-08-25 | **3.21%** | 0.75% | 4× | v3831 published 8h before |
| Crash Rate (15m) | 2026-09-04 → 2026-09-10 | **3.02%** | 0.75% | 4× | v3854 published 21h into the day |
| "Not Interested" Rate | 2026-03-23 | **119.8** | 31.4 | 4× | — |
| Crash Rate (15m) | 2026-09-01 → 2026-09-02 | **2.50%** | 0.75% | 3× | v3851 published 11h before |
| Crash Rate (15m) | 2026-08-27 | **2.34%** | 0.75% | 3× | v3842 published 13h into the day |

## Discovery

| Metric | Kind | Latest | As of | Δ | vs genre | Series | Notes |
|---|---|---|---|---|---|---|---|
| "Not Interested" Rate | rate | 51.8 | 2026-09-10 | ▲ 64.8% ⚠ | — | 1 | — |
| Attributed 30d Robux/User | rate | R$ 1.85 | 2026-08-11 | ▼ 47.1% ⚠ | — | 8 | — |
| Attributed 7d Conversion | rate | 1.40% | 2026-09-03 | ▲ 34.4% | — | 8 | — |
| Attributed 7d Playtime | rate | 27.0 min | 2026-09-03 | ▼ 14.1% ⚠ | — | 8 | — |
| Attributed 7d Robux/User | rate | R$ 1.07 | 2026-09-03 | ▲ 56.6% | — | 8 | — |
| Attributed D1 Retention | rate | 15.6% | 2026-09-08 | ▼ 6.3% ⚠ | — | 1 | — |
| Attributed D7 Retention | rate | 0.99% | 2026-09-02 | ▲ 2.2% | — | 8 | — |
| End-to-End Conversion | rate | 3.14% | 2026-09-10 | ▲ 4.0% | — | 6 | — |
| Event RSVPs | volume | 110.6K | 2026-09-09 | ▲ 7.1% | — | 1 | 14.5K/1k DAU, DAU ▼ 54.2% over same span |
| Feedback Votes | volume | 7 | 2026-09-10 | ▼ 65.0% ⚠ | — | 1 | 0.9/1k DAU, DAU ▼ 44.9% over same span |
| Impressions (unique users) | volume | 202K | 2026-09-10 | ▼ 49.7% ⚠ | — | 19 | 25.1K/1k DAU, DAU ▼ 44.9% over same span |
| Joins from Notifications | volume | 2.5K | 2026-09-09 | ▲ 3.6% | — | 1 | 328/1k DAU, DAU ▼ 54.2% over same span |
| RFY Play Days (L7) | rate | 1.4 | 2026-09-10 | ▲ 3.5% | above similar games median | 1 | — |
| RFY Qualified PTR | rate | 0.82% | 2026-09-10 | ▲ 34.8% | — | 1 | — |

## Retention

| Metric | Kind | Latest | As of | Δ | vs genre | Series | Notes |
|---|---|---|---|---|---|---|---|
| Day 1 Retention | rate | 14.0% | 2026-09-09 | ▼ 29.4% ⚠ | below similar games median | 20 | — |
| Day 1 Retention (7-day avg) | rate | 18.0% | 2026-08-06 | ▼ 1.7% | — | 6 | — |
| Day 30 Retention | rate | 0.12% | 2026-08-11 | ▼ 8.3% ⚠ | below similar games median | 1 | — |
| Day 7 Retention | rate | 0.85% | 2026-09-03 | ▲ 5.1% | below similar games median | 8 | — |
| Stickiness (DAU/MAU) | rate | 1.66% | 2026-09-10 | ▼ 28.1% ⚠ | — | 1 | — |

## Monetization

| Metric | Kind | Latest | As of | Δ | vs genre | Series | Notes |
|---|---|---|---|---|---|---|---|
| ARPDAU | rate | R$ 0.55 | 2026-09-09 | ▼ 34.0% ⚠ | below similar games median | 1 | — |
| ARPPU | rate | R$ 86.79 | 2026-09-09 | ▲ 8.4% | above similar games median | 1 | — |
| Daily Revenue | volume | R$ 4.2K | 2026-09-09 | ▼ 69.6% ⚠ | — | 8 | R$ 547/1k DAU, DAU ▼ 54.2% over same span |
| Daily Revenue (7-day avg) | volume | R$ 0.00 | 2026-08-08 | ▼ 100.0% ⚠ | — | 1 | R$ 0.00/1k DAU, DAU ▼ 13.6% over same span |
| Event ARPDAU | rate | R$ 1.39 | 2026-09-09 | ▼ 4.1% ⚠ | — | 1 | — |
| Event Revenue | volume | R$ 292K | 2026-09-09 | ▼ 7.8% ⚠ | — | 1 | R$ 38.3K/1k DAU, DAU ▼ 54.2% over same span |
| Item Revenue | volume | R$ 7.1K | 2026-09-10 | ▼ 36.2% ⚠ | — | 5 | R$ 877.5/1k DAU, DAU ▼ 44.9% over same span |
| Payer Conversion | rate | 0.63% | 2026-09-09 | ▼ 39.1% ⚠ | below similar games median | 8 | — |
| Paying Users | volume | 48 | 2026-09-09 | ▼ 71.9% ⚠ | — | 1 | 6.3/1k DAU, DAU ▼ 54.2% over same span |
| Potential Extra Earnings | volume | 0 | 2026-08-15 | — | — | 1 | 0/1k DAU |

## Engagement

| Metric | Kind | Latest | As of | Δ | vs genre | Series | Notes |
|---|---|---|---|---|---|---|---|
| Avg Session Duration | rate | 11m 12s | 2026-09-10 | ▲ 0.1% | — | 7 | shown: Place=125003919504672 |
| Avg Session Length | rate | 10.9 min | 2026-09-10 | ▼ 6.9% ⚠ | below similar games median | 10 | — |
| Daily Active Users | volume | 8.1K | 2026-09-10 | ▼ 44.9% ⚠ | — | 321 | — |
| DAU (7-day avg) | volume | 0 | 2026-08-08 | ▼ 100.0% ⚠ | — | 1 | 0/1k DAU, DAU ▼ 13.6% over same span |
| Event DAU | volume | 152.5K | 2026-09-09 | ▼ 7.3% ⚠ | — | 1 | 20K/1k DAU, DAU ▼ 54.2% over same span |
| Event Playtime | rate | 20.2 min | 2026-09-09 | ▼ 1.4% | — | 1 | — |
| Monthly Active Users | volume | 485.8K | 2026-09-10 | ▼ 23.5% ⚠ | — | 295 | 60.3K/1k DAU, DAU ▼ 44.9% over same span |
| Peak Concurrent | volume | 142.2 | 2026-09-10 | ▼ 45.0% ⚠ | — | 10 | shown: Place=125003919504672; 17.7/1k DAU, DAU ▼ 44.9% over same span |
| Playtime per Player | rate | 14.9 min | 2026-09-10 | ▼ 10.6% ⚠ | below similar games median | 1 | — |
| Playtime/Player (7-day avg) | rate | 19.6 min | 2026-08-07 | ▲ 6.0% | below similar games median | 1 | — |
| Sessions Ended | volume | — | — | — | — | 61 | breakdown only (61 series) |
| Total Playtime | volume | 2K h | 2026-09-10 | ▼ 50.8% ⚠ | — | 1 | 248.2 h/1k DAU, DAU ▼ 44.9% over same span |
| Unique Players | volume | 8K | 2026-09-10 | ▼ 45.1% ⚠ | — | 17 | 987.5/1k DAU, DAU ▼ 44.9% over same span |
| Unique Players (7-day avg) | volume | — | — | — | — | 7 | breakdown only (7 series) |
| Visits | volume | 11K | 2026-09-10 | ▼ 47.1% ⚠ | — | 8 | 1.4K/1k DAU, DAU ▼ 44.9% over same span |

## Performance

| Metric | Kind | Latest | As of | Δ | vs genre | Series | Notes |
|---|---|---|---|---|---|---|---|
| Avg Client Memory | rate | 1.45 GB | 2026-09-10 | ▲ 2.6% ⚠ | — | 7 | shown: Place=125003919504672 |
| Avg FPS | rate | 42 fps | 2026-09-10 | ▼ 0.7% | — | 1 | shown: Place=125003919504672 |
| Avg Memory | rate | 1.4K MB | 2026-09-10 | ▼ 40.2% | — | 60 | shown: Place=125003919504672 |
| Client CPU Time | rate | 9.9 | 2026-09-10 | ▼ 0.5% | — | 6 | shown: Place=125003919504672 |
| CPU Core Utilization | rate | 14.3% | 2026-09-10 | ▲ 45.2% ⚠ | — | 1 | shown: Place=125003919504672 |
| Crash Count | volume | 252 | 2026-09-10 | ▼ 33.9% | — | 6 | shown: Place=125003919504672; 31.3/1k DAU, DAU ▼ 44.9% over same span |
| Crash Rate (15m) | rate | 2.77% | 2026-09-10 | ▲ 23.8% ⚠ | — | 7 | shown: Place=125003919504672; ⚠ not statistically significant: Platform: TV · Place=125003919504672 |
| FPS (10th pct) | rate | 35 fps | 2026-09-10 | ▲ 8.3% | — | 7 | shown: Place=125003919504672 |
| Memory Used % | rate | 27.0% | 2026-09-10 | ▲ 2.7% ⚠ | — | 7 | shown: Place=125003919504672 |
| Out-of-Memory Exits | volume | 83 | 2026-09-10 | ▼ 27.2% | — | 6 | shown: Place=125003919504672; 10.3/1k DAU, DAU ▼ 44.9% over same span |
| Script Errors | volume | 536K | 2026-09-10 | ▲ 75.6% ⚠ | — | 1291 | 66.6K/1k DAU, DAU ▼ 51.6% over same span |
| Server CPU Time | rate | 1.1 | 2026-09-10 | ▲ 6.2% ⚠ | — | 6 | shown: Place=125003919504672 |
| Server Crashes | volume | 2 | 2026-09-10 | ▼ 77.8% | — | 5 | shown: Place=125003919504672; 0.2/1k DAU, DAU ▼ 44.9% over same span |
| Server FPS (10th pct) | rate | 60 fps | 2026-09-10 | ▲ 0.1% | — | 1 | shown: Place=125003919504672 |

## Other

| Metric | Kind | Latest | As of | Δ | vs genre | Series | Notes |
|---|---|---|---|---|---|---|---|
| Attribution1 D Payer Conversion Ratio | rate | — | — | — | — | 7 | breakdown only (7 series) |
| Attribution1 D Robux Per User | volume | — | — | — | — | 7 | breakdown only (7 series) |
| Attribution30 D Payer Conversion Ratio | rate | — | — | — | — | 7 | breakdown only (7 series) |
| RFY Duration0 To60 | rate | 17.6% | 2026-09-10 | ▼ 0.7% | — | 1 | — |
| RFY Duration61 To180 | rate | 13.7% | 2026-09-10 | ▼ 10.2% ⚠ | — | 1 | — |
| RFY Play Through Rate | rate | 1.20% | 2026-09-10 | ▲ 31.5% | — | 1 | — |
| RFYD1 Coplay Days | volume | 0.1 | 2026-09-10 | ▼ 0.8% | — | 1 | 0/1k DAU, DAU ▼ 44.9% over same span |
| RFYD1 Playtime | volume | 18.2 | 2026-09-10 | ▲ 5.3% | — | 1 | 2.3/1k DAU, DAU ▼ 44.9% over same span |
| RFYD1 Qualified Play Sessions | volume | 1.1 | 2026-09-10 | ▲ 1.4% | — | 1 | 0.1/1k DAU, DAU ▼ 44.9% over same span |
| RFYD1 Robux Spend | volume | R$ 1.01 | 2026-09-10 | ▼ 35.8% ⚠ | — | 1 | R$ 0.12/1k DAU, DAU ▼ 44.9% over same span |
| RFYD1 Spend Day | volume | 0 | 2026-09-10 | ▼ 11.8% ⚠ | — | 1 | 0/1k DAU, DAU ▼ 44.9% over same span |
| RFYD2 To7 Coplay Days | volume | 0.1 | 2026-09-10 | ▲ 16.6% | — | 1 | 0/1k DAU, DAU ▼ 44.9% over same span |
| RFYD2 To7 Play Days | volume | 0.4 | 2026-09-10 | ▲ 11.0% | — | 1 | 0.1/1k DAU, DAU ▼ 44.9% over same span |
| RFYD2 To7 Playtime | volume | 8.6 | 2026-09-10 | ▲ 5.6% | — | 1 | 1.1/1k DAU, DAU ▼ 44.9% over same span |
| RFYD2 To7 Qualified Play Sessions | volume | 0.6 | 2026-09-10 | ▲ 7.5% | — | 1 | 0.1/1k DAU, DAU ▼ 44.9% over same span |
| RFYD2 To7 Robux Spend | volume | R$ 0.09 | 2026-09-10 | ▼ 56.8% ⚠ | — | 1 | R$ 0.01/1k DAU, DAU ▼ 44.9% over same span |
| RFYD2 To7 Spend Days | volume | 0 | 2026-09-10 | ▼ 6.4% ⚠ | — | 1 | 0/1k DAU, DAU ▼ 44.9% over same span |
| RFYD8 To28 Coplay Days | volume | 0 | 2026-09-10 | ▲ 17.0% | — | 1 | 0/1k DAU, DAU ▼ 44.9% over same span |
| RFYD8 To28 Play Days | volume | 0.1 | 2026-09-10 | ▼ 0.4% | — | 1 | 0/1k DAU, DAU ▼ 44.9% over same span |
| RFYD8 To28 Playtime | volume | 1.2 | 2026-09-10 | ▲ 14.3% | — | 1 | 0.2/1k DAU, DAU ▼ 44.9% over same span |
| RFYD8 To28 Qualified Play Sessions | volume | 0.1 | 2026-09-10 | ▲ 8.4% | — | 1 | 0/1k DAU, DAU ▼ 44.9% over same span |
| RFYD8 To28 Robux Spend | volume | R$ 0.05 | 2026-09-10 | ▼ 64.9% ⚠ | — | 1 | R$ 0.01/1k DAU, DAU ▼ 44.9% over same span |
| RFYD8 To28 Spend Days | volume | 0 | 2026-09-10 | ▼ 30.9% ⚠ | — | 1 | 0/1k DAU, DAU ▼ 44.9% over same span |

## Files

- `series.json` — every metric, every breakdown, every point. The full record.
- `metrics/<Metric>.csv` — one long-format CSV per metric (`date,ts,granularity,series,value,status,captured_at,partial`). `FILLED_ZERO` status marks zeros the API omitted; `partial` marks in-progress captures excluded from headlines.
- `metrics/<Metric>.daily.csv` — daily rollup of sub-daily metrics; `agg` says how (mean for rates, sum for volumes, max for concurrents), `samples` how many points fed the day, `partial` which days cannot be quoted whole.
- `catalog.json` — metric → response-path hash, freshness, and the series inventory.
- `data-quality.md` — settled points the gateway re-served with different values (first settled read kept) and values outside their unit's plausible range. Present only when something was found.
- `feedback.csv` / `feedback.md` — raw player reviews (up/down-votes + comments) with the `asset_version` each landed on, plus counts by category and version. Present only when feedback was captured.
