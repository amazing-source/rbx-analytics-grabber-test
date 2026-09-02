import sys, os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from core import *
print("### CCU from ConcurrentPlayers @ ONE_HOUR (never PCU@ONE_DAY — F15)")
d=con.execute("""
SELECT game, CAST(ts AS DATE) AS day, max(value) AS peak_ccu, avg(value) AS mean_ccu, count(*) AS hrs
FROM pts WHERE metric='ConcurrentPlayers' AND granularity='METRIC_GRANULARITY_ONE_HOUR'
  AND series='Total' AND NOT is_partial GROUP BY 1,2 HAVING hrs>=20 ORDER BY 1,2""").df()
p=d.pivot_table(index='day',columns='game',values='peak_ccu')
print("\n-- daily PEAK CCU (hours>=20 only)")
print(p.tail(21).round(0).to_string())
print("\n-- summary")
for g in GAMES:
    if g not in p.columns: continue
    s=p[g].dropna()
    if len(s)<8: print(f"{g:12s} only {len(s)} full days"); continue
    print(f"{g:12s} peak {s.max():>10,.0f} on {s.idxmax().date()} | last {s.iloc[-1]:>9,.0f} "
          f"| vs peak {(s.iloc[-1]/s.max()-1)*100:>7.1f}% | 7d trend {slope_pct_per_day(s.iloc[-7:]):>6.2f}%/d "
          f"| WoW {(s.iloc[-7:].mean()/s.iloc[-14:-7].mean()-1)*100:>7.1f}%")
p.to_csv(os.path.join(ROOT,'ccu_daily_peak.csv'))
