import sys, os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from q import show, con
import pandas as pd
pd.set_option('display.width', 250)
d = con.execute("""
SELECT date, game, value FROM pts
WHERE metric='DailyActiveUsers' AND granularity='METRIC_GRANULARITY_ONE_DAY'
  AND series='Total' AND NOT is_partial AND date>=DATE '2026-07-14' AND date<=DATE '2026-09-01'
""").df()
p = d.pivot_table(index='date', columns='game', values='value').round(0)
print("### DAU by day (Total, settled)"); print(p.to_string())
