import sys, os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from q import show, con
show("Age of the READ vs the day it describes (DAU Total) — freeze-policy exposure", """
SELECT game, date, round(value) AS dau, captured_at,
       round(date_diff('hour', date::TIMESTAMP, captured_at::TIMESTAMP)/24.0,1) AS read_lag_days
FROM pts
WHERE metric='DailyActiveUsers' AND granularity='METRIC_GRANULARITY_ONE_DAY'
  AND series='Total' AND date>=DATE '2026-08-24'
ORDER BY game, date""")
