# Universe 9610561918 — metric summary

- Genre: **simulation**
- Exported: 2026-09-03T21:29:53.704Z
- Metrics captured: 81
- Data fresh through: **2026-08-09**

Δ is the latest point vs ~7 points earlier on the same series. `rate` metrics are safe to compare across a growth window; `volume` metrics are not — read their trend, and check DAU growth before drawing a conclusion.

## ⚠ Incidents

Excursions in metrics where high is bad, found by comparing each point to the series median. **Δ cannot show these** — it compares two endpoints, and an incident that spiked and recovered lives between them. The publish column states an association, not a cause; whether a spike was Roblox-side is answered only by `annotations.md`, never by inference.

| Metric | When | Peak | Typical | vs typical | Nearby publish |
|---|---|---|---|---|---|
| Server Crashes | 2026-07-28 → 2026-08-02 | **30.4K** | 1 | 30393× | none within 72h (last: v3823, 3d before) |
| Server Crashes | 2026-08-30 | **32** | 1 | 32× | v3843 published 37h before |
| Crash Rate (15m) | 2026-08-22 → 2026-08-25 | **3.21%** | 0.72% | 4× | v3831 published 8h before |
| "Not Interested" Rate | 2026-03-23 | **119.8** | 31.2 | 4× | — |
| Crash Rate (15m) | 2026-09-01 → 2026-09-02 | **2.50%** | 0.72% | 3× | v3851 published 11h before |
| Crash Rate (15m) | 2026-08-27 → 2026-08-28 | **2.34%** | 0.72% | 3× | v3842 published 13h into the day |
| Crash Rate (15m) | 2026-08-30 | **2.17%** | 0.72% | 3× | v3843 published 37h before |

## Discovery

| Metric | Kind | Latest | As of | Δ | vs genre | Series | Notes |
|---|---|---|---|---|---|---|---|
| "Not Interested" Rate | rate | 51.2 | 2026-09-02 | ▲ 63.9% ⚠ | — | 1 | — |
| Attributed 30d Robux/User | rate | R$ 3.49 | 2026-08-04 | ▲ 17.3% | — | 8 | — |
| Attributed 7d Conversion | rate | 1.04% | 2026-08-27 | ▼ 27.0% ⚠ | — | 8 | — |
| Attributed 7d Playtime | rate | 31.4 min | 2026-08-27 | ▼ 4.3% ⚠ | — | 8 | — |
| Attributed 7d Robux/User | rate | R$ 0.69 | 2026-08-27 | ▼ 73.8% ⚠ | — | 8 | — |
| Attributed D1 Retention | rate | 16.7% | 2026-09-01 | ▼ 9.0% ⚠ | — | 1 | — |
| Attributed D7 Retention | rate | 0.97% | 2026-08-26 | ▼ 6.5% ⚠ | — | 8 | — |
| End-to-End Conversion | rate | 3.99% | 2026-09-01 | ▲ 1.4% | — | 6 | — |
| Event RSVPs | volume | 103.3K | 2026-09-02 | ▲ 10.4% | — | 1 | 6.2K/1k DAU, DAU ▼ 13.6% over same span |
| Feedback Votes | volume | 20 | 2026-09-02 | ▼ 52.4% ⚠ | — | 1 | 1.2/1k DAU, DAU ▼ 13.6% over same span |
| Impressions (unique users) | volume | 401.8K | 2026-09-01 | ▲ 13.6% | — | 19 | 21.3K/1k DAU, DAU ▲ 16.7% over same span |
| Joins from Notifications | volume | 2.4K | 2026-09-02 | ▲ 2.6% | — | 1 | 144.9/1k DAU, DAU ▼ 13.6% over same span |
| RFY Play Days (L7) | rate | 1.4 | 2026-09-02 | ▼ 3.5% ⚠ | above genre median | 1 | — |
| RFY Qualified PTR | rate | 0.89% | 2026-09-02 | ▼ 30.6% ⚠ | — | 1 | — |

## Retention

| Metric | Kind | Latest | As of | Δ | vs genre | Series | Notes |
|---|---|---|---|---|---|---|---|
| Day 1 Retention | rate | 16.7% | 2026-09-01 | ▼ 9.3% ⚠ | above genre median | 20 | — |
| Day 1 Retention (7-day avg) | rate | 18.0% | 2026-08-06 | ▼ 1.7% | — | 6 | — |
| Day 30 Retention | rate | 0.14% | 2026-08-03 | ▼ 36.3% ⚠ | below genre median | 1 | — |
| Day 7 Retention | rate | 0.96% | 2026-08-26 | ▼ 6.7% ⚠ | above genre median | 8 | — |
| Stickiness (DAU/MAU) | rate | 2.54% | 2026-09-02 | ▼ 2.7% ⚠ | — | 1 | — |

## Monetization

| Metric | Kind | Latest | As of | Δ | vs genre | Series | Notes |
|---|---|---|---|---|---|---|---|
| ARPDAU | rate | R$ 0.83 | 2026-09-02 | ▲ 65.2% | below genre median | 1 | — |
| ARPPU | rate | R$ 80.05 | 2026-09-02 | ▼ 2.5% ⚠ | above genre median | 1 | — |
| Daily Revenue | volume | R$ 13.7K | 2026-09-02 | ▲ 42.5% | — | 8 | R$ 822.5/1k DAU, DAU ▼ 13.6% over same span |
| Daily Revenue (7-day avg) | volume | R$ 0.00 | 2026-08-08 | ▼ 100.0% ⚠ | — | 1 | R$ 0.00/1k DAU, DAU ▼ 13.6% over same span |
| Event ARPDAU | rate | R$ 1.45 | 2026-09-02 | ▼ 5.0% ⚠ | — | 1 | — |
| Event Revenue | volume | R$ 316.8K | 2026-09-02 | ▼ 8.1% ⚠ | — | 1 | R$ 19K/1k DAU, DAU ▼ 13.6% over same span |
| Item Revenue | volume | R$ 55.7K | 2026-08-08 | ▼ 6.5% ⚠ | — | 5 | R$ 1.6K/1k DAU, DAU ▼ 13.6% over same span |
| Payer Conversion | rate | 1.03% | 2026-09-02 | ▲ 69.4% | below genre median | 8 | — |
| Paying Users | volume | 171 | 2026-09-02 | ▲ 46.2% | — | 1 | 10.3/1k DAU, DAU ▼ 13.6% over same span |
| Potential Extra Earnings | volume | 0 | 2026-08-07 | — | — | 1 | 0/1k DAU |

## Engagement

| Metric | Kind | Latest | As of | Δ | vs genre | Series | Notes |
|---|---|---|---|---|---|---|---|
| Avg Session Duration | rate | 12m 17s | 2026-09-02 | ▼ 4.0% ⚠ | — | 7 | shown: Place=125003919504672; Δ spans 27d |
| Avg Session Length | rate | 11.9 min | 2026-09-02 | ▼ 2.0% | below genre median | 10 | — |
| Daily Active Users | volume | 16.6K | 2026-09-02 | ▼ 13.6% ⚠ | — | 283 | — |
| DAU (7-day avg) | volume | 0 | 2026-08-08 | ▼ 100.0% ⚠ | — | 1 | 0/1k DAU, DAU ▼ 13.6% over same span |
| Event DAU | volume | 164.6K | 2026-09-02 | ▼ 6.8% ⚠ | — | 1 | 9.9K/1k DAU, DAU ▼ 13.6% over same span |
| Event Playtime | rate | 20.5 min | 2026-09-02 | ▲ 0.1% | — | 1 | — |
| Monthly Active Users | volume | 655.1K | 2026-09-02 | ▼ 11.2% ⚠ | — | 62 | 39.4K/1k DAU, DAU ▼ 13.6% over same span |
| Peak Concurrent | volume | 337.5 | 2026-09-02 | — | — | 10 | shown: Place=125003919504672; 20.3/1k DAU |
| Playtime per Player | rate | 17.0 min | 2026-09-02 | ▼ 2.6% ⚠ | below genre median | 1 | — |
| Playtime/Player (7-day avg) | rate | 19.6 min | 2026-08-07 | ▲ 6.0% | below genre median | 1 | — |
| Sessions Ended | volume | — | — | — | — | 61 | breakdown only (61 series) |
| Total Playtime | volume | 4.7K h | 2026-09-02 | ▼ 15.9% ⚠ | — | 1 | 283.6 h/1k DAU, DAU ▼ 13.6% over same span |
| Unique Players | volume | 18.9K | 2026-09-01 | ▲ 17.2% | — | 17 | 1K/1k DAU, DAU ▲ 16.7% over same span |
| Unique Players (7-day avg) | volume | — | — | — | — | 7 | breakdown only (7 series) |
| Visits | volume | 23.9K | 2026-09-02 | ▼ 14.2% ⚠ | — | 8 | 1.4K/1k DAU, DAU ▼ 13.6% over same span |

## Performance

| Metric | Kind | Latest | As of | Δ | vs genre | Series | Notes |
|---|---|---|---|---|---|---|---|
| Avg Client Memory | rate | 1.39 GB | 2026-09-02 | ▲ 0.9% | — | 7 | shown: Place=125003919504672; Δ spans 27d |
| Avg FPS | rate | 44 fps | 2026-09-02 | ▼ 18.0% ⚠ | — | 1 | shown: Place=125003919504672; Δ spans 27d |
| Avg Memory | rate | 1.6K MB | 2026-09-02 | ▲ 136.4% ⚠ | — | 60 | shown: Place=125003919504672; Δ spans 27d |
| Client CPU Time | rate | 10.4 | 2026-09-02 | ▼ 13.4% | — | 6 | shown: Place=125003919504672; Δ spans 27d |
| CPU Core Utilization | rate | 7.86% | 2026-09-02 | ▼ 25.5% | — | 1 | shown: Place=125003919504672; Δ spans 27d |
| Crash Count | volume | 449 | 2026-09-02 | ▼ 5.3% | — | 6 | shown: Place=125003919504672; 27/1k DAU, DAU ▼ 13.6% over same span |
| Crash Rate (15m) | rate | 2.34% | 2026-09-02 | ▲ 11.4% ⚠ | — | 7 | shown: Place=125003919504672; ⚠ not statistically significant: Platform: TV · Place=125003919504672 |
| FPS (10th pct) | rate | 31 fps | 2026-09-02 | ▼ 10.6% ⚠ | — | 7 | shown: Place=125003919504672; Δ spans 27d |
| Memory Used % | rate | 27.5% | 2026-09-02 | ▲ 15.3% ⚠ | — | 7 | shown: Place=125003919504672; Δ spans 27d |
| Out-of-Memory Exits | volume | 136 | 2026-09-02 | ▼ 7.5% | — | 6 | shown: Place=125003919504672; 8.2/1k DAU, DAU ▼ 13.6% over same span |
| Script Errors | volume | 305.1K | 2026-09-02 | ▲ 2.8% ⚠ | — | 913 | 18.3K/1k DAU, DAU ▼ 13.6% over same span |
| Server CPU Time | rate | 1 | 2026-09-02 | ▼ 10.9% | — | 6 | shown: Place=125003919504672; Δ spans 27d |
| Server Crashes | volume | 3 | 2026-09-02 | ▲ 50.0% ⚠ | — | 5 | shown: Place=125003919504672; 0.2/1k DAU, DAU ▼ 13.6% over same span |
| Server FPS (10th pct) | rate | 60 fps | 2026-09-02 | ▼ 0.5% | — | 1 | shown: Place=125003919504672; Δ spans 27d |

## Other

| Metric | Kind | Latest | As of | Δ | vs genre | Series | Notes |
|---|---|---|---|---|---|---|---|
| Attribution1 D Payer Conversion Ratio | rate | — | — | — | — | 7 | breakdown only (7 series) |
| Attribution1 D Robux Per User | volume | — | — | — | — | 7 | breakdown only (7 series) |
| Attribution30 D Payer Conversion Ratio | rate | — | — | — | — | 7 | breakdown only (7 series) |
| RFY Duration0 To60 | rate | 18.2% | 2026-09-02 | ▲ 5.2% | — | 1 | — |
| RFY Duration61 To180 | rate | 14.9% | 2026-09-02 | ▲ 4.7% | — | 1 | — |
| RFY Play Through Rate | rate | 1.34% | 2026-09-02 | ▼ 29.2% ⚠ | — | 1 | — |
| RFYD1 Coplay Days | volume | 0.1 | 2026-09-02 | ▼ 1.4% | — | 1 | 0/1k DAU, DAU ▼ 13.6% over same span |
| RFYD1 Playtime | volume | 17.4 | 2026-09-02 | ▼ 3.6% ⚠ | — | 1 | 1/1k DAU, DAU ▼ 13.6% over same span |
| RFYD1 Qualified Play Sessions | volume | 1 | 2026-09-02 | ▼ 4.1% ⚠ | — | 1 | 0.1/1k DAU, DAU ▼ 13.6% over same span |
| RFYD1 Robux Spend | volume | R$ 0.95 | 2026-09-02 | ▲ 51.0% | — | 1 | R$ 0.06/1k DAU, DAU ▼ 13.6% over same span |
| RFYD1 Spend Day | volume | 0 | 2026-09-02 | ▲ 144.8% | — | 1 | 0/1k DAU, DAU ▼ 13.6% over same span |
| RFYD2 To7 Coplay Days | volume | 0.1 | 2026-09-02 | ▼ 7.6% ⚠ | — | 1 | 0/1k DAU, DAU ▼ 13.6% over same span |
| RFYD2 To7 Play Days | volume | 0.4 | 2026-09-02 | ▼ 9.6% ⚠ | — | 1 | 0/1k DAU, DAU ▼ 13.6% over same span |
| RFYD2 To7 Playtime | volume | 9.5 | 2026-09-02 | ▼ 0.8% | — | 1 | 0.6/1k DAU, DAU ▼ 13.6% over same span |
| RFYD2 To7 Qualified Play Sessions | volume | 0.7 | 2026-09-02 | ▼ 11.2% ⚠ | — | 1 | 0/1k DAU, DAU ▼ 13.6% over same span |
| RFYD2 To7 Robux Spend | volume | R$ 0.29 | 2026-09-02 | ▲ 19.1% | — | 1 | R$ 0.02/1k DAU, DAU ▼ 13.6% over same span |
| RFYD2 To7 Spend Days | volume | 0 | 2026-09-02 | ▲ 29.9% | — | 1 | 0/1k DAU, DAU ▼ 13.6% over same span |
| RFYD8 To28 Coplay Days | volume | 0 | 2026-09-02 | ▼ 9.0% ⚠ | — | 1 | 0/1k DAU, DAU ▼ 13.6% over same span |
| RFYD8 To28 Play Days | volume | 0.1 | 2026-09-02 | ▼ 7.7% ⚠ | — | 1 | 0/1k DAU, DAU ▼ 13.6% over same span |
| RFYD8 To28 Playtime | volume | 1 | 2026-09-02 | ▼ 2.3% ⚠ | — | 1 | 0.1/1k DAU, DAU ▼ 13.6% over same span |
| RFYD8 To28 Qualified Play Sessions | volume | 0.1 | 2026-09-02 | ▼ 9.7% ⚠ | — | 1 | 0/1k DAU, DAU ▼ 13.6% over same span |
| RFYD8 To28 Robux Spend | volume | R$ 0.32 | 2026-09-02 | ▲ 1016.4% | — | 1 | R$ 0.02/1k DAU, DAU ▼ 13.6% over same span |
| RFYD8 To28 Spend Days | volume | 0 | 2026-09-02 | ▲ 104.6% | — | 1 | 0/1k DAU, DAU ▼ 13.6% over same span |

## Files

- `series.json` — every metric, every breakdown, every point. The full record.
- `metrics/<Metric>.csv` — one long-format CSV per metric (`date,ts,granularity,series,value,status,captured_at,partial`). `FILLED_ZERO` status marks zeros the API omitted; `partial` marks in-progress captures excluded from headlines.
- `metrics/<Metric>.daily.csv` — daily rollup of sub-daily metrics; `agg` says how (mean for rates, sum for volumes, max for concurrents), `samples` how many points fed the day, `partial` which days cannot be quoted whole.
- `catalog.json` — metric → response-path hash, freshness, and the series inventory.
- `data-quality.md` — settled points the gateway re-served with different values (first settled read kept) and values outside their unit's plausible range. Present only when something was found.
- `feedback.csv` / `feedback.md` — raw player reviews (up/down-votes + comments) with the `asset_version` each landed on, plus counts by category and version. Present only when feedback was captured.
