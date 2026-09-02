import sys, os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from q import show, con
show("Where the FILLED_ZERO days sit on DAU (leading = pre-launch, interior = real gap)", """
SELECT game, date, value, status FROM pts
WHERE metric='DailyActiveUsers' AND granularity='METRIC_GRANULARITY_ONE_DAY' AND series='Total'
  AND game IN ('Seal','Brainrot','Verity') AND status='FILLED_ZERO'
ORDER BY game, date""")
show("First 3 non-zero DAU days per game (effective launch / window start)", """
SELECT game, date, round(value) AS dau FROM (
  SELECT *, row_number() OVER (PARTITION BY game ORDER BY date) rn FROM pts
  WHERE metric='DailyActiveUsers' AND granularity='METRIC_GRANULARITY_ONE_DAY'
    AND series='Total' AND value>0)
WHERE rn<=3 ORDER BY game, date""")
show("Sub-daily CCU coverage (ConcurrentPlayers ONE_HOUR / PCU HALF_HOUR)", """
SELECT game, metric, granularity, count(*) AS n, min(ts) AS lo, max(ts) AS hi
FROM pts WHERE metric IN ('ConcurrentPlayers','PeakConcurrentPlayers') AND series='Total'
  AND granularity IN ('METRIC_GRANULARITY_ONE_HOUR','METRIC_GRANULARITY_HALF_HOUR')
GROUP BY game, metric, granularity ORDER BY game, metric""")
show("NOT_STATISTICALLY_SIGNIFICANT rows — which series", """
SELECT game, metric, series, count(*) AS n FROM pts
WHERE status='DATA_STATUS_NOT_STATISTICALLY_SIGNIFICANT'
GROUP BY game, metric, series ORDER BY n DESC LIMIT 15""")
