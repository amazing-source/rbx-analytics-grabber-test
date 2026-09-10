// Build a clean analysis panel from the corpus CSVs, in DuckDB.
//
//   node tools/panel-duck.js [outDir]
//
// WHY THIS EXISTS: every report before this one picked its numbers by hand out of
// series.json, which made the provenance of a figure a matter of trust. This puts
// one SQL view between the corpus and every chart, so the same filters apply to
// every metric on every game, and the SQL is the audit trail.
//
// The four filters below are not optional and each one has cost us a wrong number:
//   1. granularity = ONE_DAY   — one CSV holds ONE_MINUTE, HALF_HOUR and ONE_DAY
//                                rows keyed by the same date. Ignoring this lets a
//                                half-hour bucket overwrite the daily value.
//   2. headline series only    — 'Total' (empty breakdown) or a bare 'Place=<id>'
//                                filter, which still counts as the whole game. An
//                                'AcquisitionSource: Search' row is a SLICE, and
//                                quoting a slice as the total is the single most
//                                damaging error this pipeline has made.
//   3. status <> 'FILLED_ZERO' — a synthesised zero standing in for a row the API
//                                omitted. It is not a reading.
//   4. partial is not true     — an interval that had not finished when captured.
//
// Output: <outDir>/panel.parquet plus one JSON per game for the charts.
const duckdb = require("../web/node_modules/duckdb");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.resolve(process.argv[2] || path.join(ROOT, "analysis", "panel-duck"));
fs.mkdirSync(OUT, { recursive: true });

const GAMES = [
  ["9963622286", "Become a Brainrot"],
  ["10030829154", "Climb Waterslide and Slide"],
  ["10399712766", "+1 Banana Monkey Destruction"],
  ["10565445771", "Verity Companion [AI]"],
  ["10638354731", "Seal A Driveway"],
];

const db = new duckdb.Database(":memory:");
const con = db.connect();
const run = (sql) => new Promise((res, rej) => con.all(sql, (e, r) => (e ? rej(e) : res(r))));

(async () => {
  // One glob per game so the universe id can be attached without parsing paths in SQL.
  const parts = GAMES.map(([id]) => {
    const glob = path.join(ROOT, "data", "games", id, "metrics", "*.csv").replace(/\\/g, "/");
    return `
      SELECT '${id}' AS universe,
             parse_filename(filename, true) AS metric,   -- basename, extension stripped
                                                         -- (a '[^/]+' regex matches the whole
                                                         --  path on Windows, where the
                                                         --  separator is a backslash)
             CAST(date AS DATE) AS d,
             series, CAST(value AS DOUBLE) AS value, status, partial
      FROM read_csv('${glob}',
                    header = true, filename = true, union_by_name = true,
                    all_varchar = true, ignore_errors = true)
      WHERE granularity = 'METRIC_GRANULARITY_ONE_DAY'`;
  }).join("\n      UNION ALL\n");

  await run(`CREATE TABLE raw AS ${parts};`);

  // The headline series, and nothing else. '*.daily.csv' roll-ups are excluded
  // outright — they sum FILLED_ZERO rows and print 0 for real days (F13).
  await run(`
    CREATE TABLE panel AS
    SELECT universe, metric, d AS date, value
    FROM raw
    WHERE metric NOT LIKE '%.daily'
      AND (series = 'Total' OR regexp_matches(series, '^Place=[0-9]+$'))
      AND (status IS NULL OR status <> 'FILLED_ZERO')
      AND (partial IS NULL OR lower(partial) NOT IN ('true','1'))
      AND value IS NOT NULL;
  `);

  const [{ n }] = await run(`SELECT count(*) AS n FROM panel;`);
  const [{ m }] = await run(`SELECT count(DISTINCT metric) AS m FROM panel;`);
  const span = await run(`SELECT strftime(min(date),'%Y-%m-%d') AS lo, strftime(max(date),'%Y-%m-%d') AS hi FROM panel;`);
  console.log(`panel: ${Number(n).toLocaleString()} rows · ${m} metrics · ${span[0].lo} -> ${span[0].hi}`);

  // Coverage per game, so a thin metric is visible rather than silently absent.
  const cov = await run(`
    SELECT universe, count(DISTINCT metric) AS metrics, count(*) AS rows,
           min(date) AS first_day, max(date) AS last_day
    FROM panel GROUP BY universe ORDER BY universe;`);
  console.table(cov.map((r) => ({ ...r, rows: Number(r.rows), metrics: Number(r.metrics) })));

  await run(`COPY panel TO '${path.join(OUT, "panel.parquet").replace(/\\/g, "/")}' (FORMAT PARQUET);`);

  // Per-game wide JSON for the charts: one row per date, one column per metric.
  const WANT = [
    "DailyActiveUsers", "PeakConcurrentPlayers", "UniqueUsersWithImpressions",
    "UniqueUsersWithPlaySessions", "EndToEndCVR", "DailyRevenue", "PayingUsers",
    "PayingUsersCVR", "AverageRevenuePerUser", "AverageRevenuePerPayingUser",
    "AverageSessionLengthMinutes", "AveragePlayTimeMinutesPerDAU",
    "ForwardD1Retention", "ForwardD7Retention", "DauMauStickiness",
    "RFYPlayThroughRate", "RFYDuration0To60", "RFYDuration61To180",
    "RFYD1Playtime", "RFYD2To7PlayDays", "RFYL7PlayDays",
    "ClientCrashRate15m", "ClientFpsP10", "OomUnexpectedExits", "ErrorCount",
  ];
  const list = WANT.map((w) => `'${w}'`).join(",");
  const out = {};
  for (const [id, name] of GAMES) {
    // Format the date in SQL. A DuckDB DATE arrives as a JS Date, and
    // String(date).slice(0,10) yields "Fri Apr 03" — which then sorts
    // alphabetically and silently truncates the series.
    const rows = await run(`
      SELECT strftime(date, '%Y-%m-%d') AS day, metric, value FROM panel
      WHERE universe = '${id}' AND metric IN (${list})
      ORDER BY date;`);
    const wide = {};
    for (const r of rows) (wide[r.day] ??= { date: r.day })[r.metric] = r.value;
    const series = Object.values(wide).sort((a, b) => (a.date < b.date ? -1 : 1));
    out[id] = { universe: id, name, days: series.length, series };
    fs.writeFileSync(path.join(OUT, `${id}.json`), JSON.stringify(out[id]));
    console.log(`  ${name.padEnd(30)} ${String(series.length).padStart(4)} days  ${series[0]?.date} -> ${series.at(-1)?.date}`);
  }
  fs.writeFileSync(path.join(OUT, "all.json"), JSON.stringify(out));
  console.log(`\nwrote ${OUT}`);
  con.close();
})().catch((e) => { console.error(e); process.exit(1); });
