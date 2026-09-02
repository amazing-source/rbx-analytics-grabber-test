import duckdb, os, glob, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(ROOT)
GAMES = {
    "9963622286":  "Brainrot",
    "10638354731": "Seal",
    "10565445771": "Verity",
    "10030829154": "Waterslide",
}

con = duckdb.connect(os.path.join(ROOT, "analytics.duckdb"))
con.execute("DROP TABLE IF EXISTS raw")
con.execute("""
CREATE TABLE raw (
  game VARCHAR, universe VARCHAR, metric VARCHAR,
  date DATE, ts TIMESTAMP, granularity VARCHAR, series VARCHAR,
  value DOUBLE, status VARCHAR, captured_at VARCHAR, partial VARCHAR
)""")

files = 0
for uid, name in GAMES.items():
    d = os.path.join(REPO, "data", "games", uid, "metrics")
    for f in sorted(glob.glob(os.path.join(d, "*.csv"))):
        base = os.path.basename(f)
        # F13: *.daily.csv roll-ups are known-wrong (they sum FILLED_ZERO rows).
        # Skip them entirely; the genuine ONE_DAY rows live in the base file.
        if base.endswith(".daily.csv"):
            continue
        metric = base[:-4]
        con.execute("""
          INSERT INTO raw
          SELECT ?, ?, ?, CAST(date AS DATE), CAST(ts AS TIMESTAMP), granularity,
                 series, TRY_CAST(value AS DOUBLE), status, captured_at, CAST(partial AS VARCHAR)
          FROM read_csv(?, header=true, all_varchar=true)
        """, [name, uid, metric, f])
        files += 1

con.execute("""
CREATE OR REPLACE VIEW pts AS
SELECT *,
  (partial IS NOT NULL AND lower(partial) IN ('true','1')) AS is_partial,
  regexp_extract(series, '^([A-Za-z0-9]+):', 1) AS dim,
  CASE WHEN series='Total' THEN NULL
       ELSE regexp_extract(split_part(series,' · ',1), '^[A-Za-z0-9]+: (.*)$', 1) END AS dim_value,
  CASE WHEN position(' · ' in series)>0
       THEN substr(series, position(' · ' in series)+3) END AS filt
FROM raw
""")
print("files loaded:", files)
print(con.execute("SELECT count(*) AS n, count(DISTINCT metric) AS nm FROM raw").fetchall())
con.close()
