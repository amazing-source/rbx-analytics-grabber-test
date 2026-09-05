# data/ — the file mirror

Every ingest writes here as well as to Supabase. Nothing in this folder needs
the web app or a database to read.

## Layout

    data/
      raw/<universeId>-<timestamp>.json   raw capture bundles from the extension
      verify/           ground-truth dashboard CSV exports + coverage docs (committed)
      games/<universeId>/
        summary.md        headline table per category — start here
        series.json       full structured record (all metrics, breakdowns, points)
        catalog.json      metric inventory: hash, freshness, series counts
        data-quality.md   settled-point revisions + implausible values, when any
        metrics/*.csv     one long-format CSV per metric
        metrics/*.daily.csv  daily rollup of the sub-daily metrics
        place-versions.md deploy log (version -> publish time), when captured
        feedback.csv      raw player reviews w/ asset_version, when captured
        feedback.md       feedback counts by category and version

## Reading the numbers

- **All timestamps are UTC.** Daily points are stamped at 00:00:00Z (measured
  across every stored point); sub-daily points at their interval boundary.
  The `date` column is the UTC date and is what you should join on.
- **`status: DATA_STATUS_INVALID` carries no information.** It is ~99.5% of
  all raw points — the protobuf zero-value ("unset"), not "estimated". The
  status that matters is `DATA_STATUS_NOT_STATISTICALLY_SIGNIFICANT`: Roblox
  itself does not trust that series (tiny sample). summary.md surfaces those
  and they are excluded from incident detection.
- **`status: FILLED_ZERO` is a synthesized zero.** The API omits zero rows,
  so for count/robux volume metrics an absent granule inside the requested
  window is a zero — confirmed against the dashboard's own CSV exports, which
  print those zeros explicitly. Rates are NEVER filled: a missing retention
  day is unknown, not 0%.
- **`captured_at` / `partial` columns.** `captured_at` is when the grab that
  carried the point ran. `partial: true` means the point's interval had not
  fully elapsed at capture — the value is an in-progress undercount and is
  excluded from headlines, Δ and incidents. Once a point was captured settled
  it is FROZEN: a later grab re-serving a different value is logged to
  `data-quality.md` instead of applied (the gateway has been observed
  re-serving a settled hour at a quarter of its dashboard-confirmed value).
- **rate vs volume.** Rate metrics (retention %, conversion, ARPPU, ARPDAU,
  average session length, crash rate, FPS) are comparable before/after an update
  even while the game grows. Volume metrics (DAU, revenue, paying users,
  sessions) are not — a +40% revenue delta means nothing without the DAU delta
  next to it.
- **Empty breakdown = the "Total" series** — a Place filter still counts as
  Total (the Performance tab only exists Place-scoped), a population filter
  (IsNewUser, AcquisitionSource) does not. A metric with only broken-down
  series (funnels, always per-step) has NO Total row, and summary.md says
  "breakdown only" rather than quoting a slice.
- **Sub-daily metrics** (Performance tab, peak CCU, item revenue) also get a
  `.daily.csv` rollup so they line up with the daily metrics. `agg` records
  the aggregation used, `samples` how many points fed the day, and
  `partial` marks days that cannot be quoted as a whole.
- **Freshness matters.** `catalog.json` carries `latestAvailableTime` per
  metric. Don't read a D7 retention number for a cohort younger than 7 days.

## Regenerating

    cd web && npm run ingest:file -- ../data/raw/<file>.json

turns a raw capture bundle into this layout with no database involved.
