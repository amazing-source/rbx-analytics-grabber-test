import sys, os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from core import *
print("### DailyRevenue: Total vs sum(RevenueSource) vs sum(BalanceType), per day")
d=con.execute("""
SELECT game, date,
  sum(CASE WHEN series='Total' THEN value END) AS total,
  sum(CASE WHEN dim='RevenueSource' THEN value END) AS by_source,
  sum(CASE WHEN dim='BalanceType' THEN value END) AS by_balance
FROM pts WHERE metric='DailyRevenue' AND granularity='METRIC_GRANULARITY_ONE_DAY'
  AND NOT is_partial AND status<>'FILLED_ZERO' AND date>=DATE '2026-08-19'
GROUP BY 1,2 ORDER BY 1,2""").df()
d['src/tot']=(d.by_source/d.total).round(3); d['bal/tot']=(d.by_balance/d.total).round(3)
for g in GAMES:
    s=d[d.game==g]
    if s.empty: continue
    print(f"\n-- {g}")
    print(s[['date','total','by_source','src/tot','by_balance','bal/tot']].to_string(index=False,float_format=lambda v:f"{v:,.6g}"))
print("\n### BalanceType split (share %), recent window")
b=con.execute("""SELECT game, dim_value, sum(value) v FROM pts
 WHERE metric='DailyRevenue' AND dim='BalanceType' AND granularity='METRIC_GRANULARITY_ONE_DAY'
 AND NOT is_partial AND status<>'FILLED_ZERO' AND date>=DATE '2026-08-19' GROUP BY 1,2""").df()
t=b.pivot_table(index='game',columns='dim_value',values='v',fill_value=0)
print((t.div(t.sum(1),0)*100).round(1).to_string())
