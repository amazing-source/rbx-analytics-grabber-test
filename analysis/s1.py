import sys, os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from q import show, con
show("Rows & date range per game (ONE_DAY, Total series only)", """
SELECT game, count(*) AS n_rows, count(DISTINCT metric) AS metrics,
       min(date) AS first_day, max(date) AS last_day,
       date_diff('day', min(date), max(date))+1 AS span_days
FROM pts WHERE granularity='METRIC_GRANULARITY_ONE_DAY' AND series='Total'
GROUP BY game ORDER BY game""")
show("Granularities present", """
SELECT granularity, count(*) AS n, count(DISTINCT metric) AS metrics,
       min(date) AS lo, max(date) AS hi
FROM pts GROUP BY granularity ORDER BY n DESC""")
show("Capture recency per game", """
SELECT game, max(captured_at) AS last_capture, min(captured_at) AS first_capture
FROM pts GROUP BY game ORDER BY game""")
show("Status mix", """
SELECT status, count(*) AS n, round(100.0*count(*)/sum(count(*)) OVER (),1) AS pct
FROM pts GROUP BY status ORDER BY n DESC""")
show("Partial rows per game", """
SELECT game, sum(CASE WHEN is_partial THEN 1 ELSE 0 END) AS partial_rows, count(*) AS total
FROM pts GROUP BY game ORDER BY game""")
