# Acquisition table exports — ground truth for the per-source value table

Dashboard CSV exports of the **Acquisition** table (Creator Dashboard →
Analytics → Acquisition), downloaded 2026-09-03. This is the table that answers
"which traffic source sends players worth having", and it is the only place the
per-source downstream quality numbers are visible as Roblox itself renders them.

| File | Universe | Game | Columns |
|---|---|---|---|
| `10638354731-acquisition-2026-09-03.csv` | 10638354731 | Seal A Driveway | Users with plays, Conversion Rate, D7 Retention, 7D Playtime/User, 30D Payer Conversion, 30D Revenue/User |
| `10192528661-acquisition-2026-09-03.csv` | 10192528661 | KameHameHa Walls (test universe) | 1D/7D/30D Payer Conversion, 1D/7D/30D Revenue per User |

## What they verified

**Every column we already pull matched cell-exact.** Checked against
`data/games/10638354731/metrics/*.csv`, the `METRIC_GRANULARITY_NONE` rows with
an `AcquisitionSource` breakdown, captured 2026-09-02T19:21Z:

| Column | Metric | Home Recommendation | Match |
|---|---|---|---|
| Conversion Rate | `EndToEndCVR` | 0.1951128989458084 | exact |
| D7 Retention | `AttributionD7RetentionRatio` | 0.020298995077610016 | exact |
| 7D Playtime/User | `Attribution7DPlaytimePerUserInMinutes` | 32.87978744506836 | exact |

Same for Search, Friends, SponsoredAds and Others on all three metrics — 14 of
14 cells, to the last digit.

**`Attribution30D*` returning an empty 200 on Seal is correct, not a defect.**
The export shows `0` for every source on both 30-day columns: the game launched
too recently for a 30-day cohort to have matured. Our grab-report records
`status 200, points 0`, and the API omits zero rows. Reading that empty result
as "we failed to capture it" would have been the standard mistake.

## What they added

Five shapes the plan did not ask for, now in `default-plan.ts` tagged `proven`
(construction confirmed returning data on 9963622286 — not matched against a
captured dashboard request, so not `observed`):

- `Attribution1DPayerConversionRatio` — new metric, was absent entirely
- `Attribution1DRobuxPerUser` — new metric, was absent entirely
- `Attribution7DPayerConversionRatio` — existed at `ONE_DAY`, never by source
- `Attribution7DRobuxPerUser` — existed at `ONE_DAY`, never by source
- `UniqueUsersWithPlaySessions` at `NONE` by source — **the table's denominator**

The last one is the important one. Without it every rate in this table is
unweighted: Friends converts at 40.5% against Home Recommendation's 19.5% on
Seal, which reads as Friends being twice the channel — until you see Friends is
343,887 users against Home's 2,084,897. The rates were already correct and
already misleading on their own.

## Reading these files

`NONE` granularity means **one aggregate over the requested window**, so the
date column in our CSVs is the WINDOW START, not a day. Two exports taken over
different ranges are not comparable, and neither is an export against a grab
whose window differed. These two carry no window metadata of their own — that is
a limitation of the dashboard export, so treat them as a point-in-time
cross-check of relative values, which is exactly how they were used above.
