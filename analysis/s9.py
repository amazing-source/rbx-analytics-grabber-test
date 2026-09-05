import sys, os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from core import *
LO,HI='2026-08-19','2026-09-01'; PLO,PHI='2026-08-05','2026-08-18'
def bd(metric, dim, lo=LO, hi=HI, filt=None, gran='METRIC_GRANULARITY_ONE_DAY'):
    q="""SELECT game, date, dim_value, sum(value) AS v FROM pts
         WHERE metric=? AND dim=? AND granularity=? AND NOT is_partial
           AND date BETWEEN ? AND ? AND status<>'FILLED_ZERO'"""
    p=[metric,dim,gran,lo,hi]
    if filt: q+=" AND filt=?"; p.append(filt)
    q+=" GROUP BY 1,2,3"
    return con.execute(q,p).df()

FILT5='AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts'
print("### Acquisition source — share of DAU (%), 5-source template, both windows")
for lab,(a,b) in {'prior 08-05..08-18':(PLO,PHI),'recent 08-19..09-01':(LO,HI)}.items():
    d=bd('DailyActiveUsers','AcquisitionSource',a,b,FILT5)
    if d.empty: continue
    t=d.groupby(['game','dim_value']).v.sum().unstack(fill_value=0)
    sh=(t.div(t.sum(1),0)*100).round(1)
    print(f"\n-- {lab}"); print(sh.to_string())
print("\n### DAU by Platform — share (%) and D1 retention, recent window")
d=bd('DailyActiveUsers','Platform')
t=d.groupby(['game','dim_value']).v.sum().unstack(fill_value=0)
print((t.div(t.sum(1),0)*100).round(1).to_string())
r=bd('ForwardD1Retention','Platform')
print("\n-- ForwardD1Retention by platform (mean %)")
print((r.groupby(['game','dim_value']).v.mean().unstack()*100).round(2).to_string())
print("\n### Demographics — MAU share (%), recent window")
for dim in ['AgeGroupV2','Gender']:
    d=bd('MonthlyActiveUsers',dim)
    if d.empty: print(f"({dim}: no rows)"); continue
    t=d.groupby(['game','dim_value']).v.sum().unstack(fill_value=0)
    print(f"\n-- {dim}"); print((t.div(t.sum(1),0)*100).round(1).to_string())
print("\n### Top countries by MAU share (%), recent window")
d=bd('MonthlyActiveUsers','Country')
t=d.groupby(['game','dim_value']).v.sum().unstack(fill_value=0)
sh=(t.div(t.sum(1),0)*100)
top=sh.mean().sort_values(ascending=False).head(10).index
print(sh[top].round(1).to_string())
print("\n### DailyRevenue by RevenueSource — share (%), recent window")
d=bd('DailyRevenue','RevenueSource')
if not d.empty:
    t=d.groupby(['game','dim_value']).v.sum().unstack(fill_value=0)
    print((t.div(t.sum(1),0)*100).round(1).to_string()); print("\nabsolute R$:"); print(t.round(0).to_string())
