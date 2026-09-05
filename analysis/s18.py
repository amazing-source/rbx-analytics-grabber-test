import sys, os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from stats import *
sl=daily('AverageSessionLengthMinutes'); pt=daily('AveragePlayTimeMinutesPerDAU')
d1=daily('ForwardD1Retention')
print("### Verity signature check: strong hook, short sessions (a gate, not a churn problem)")
print(f"{'game':12s} {'D1 ret':>8s} {'vs p50':>8s} {'session min':>12s} {'vs p50':>8s} {'playtime/DAU':>13s} {'vs p50':>8s}")
bm=pd.read_csv(os.path.join(ROOT,'benchmarks.csv'))
def p50(g,m):
    r=bm[(bm['game']==g)&(bm['metric']==m)]
    return r['p50'].iloc[0] if len(r) else np.nan
for g in GAMES:
    a=d1[g].dropna().iloc[-14:].mean(); b=sl[g].dropna().iloc[-14:].mean(); c=pt[g].dropna().iloc[-14:].mean()
    print(f"{g:12s} {a*100:7.2f}% {(a/p50(g,'ForwardD1Retention')-1)*100:+7.0f}% {b:12.1f} "
          f"{(b/p50(g,'AverageSessionLengthMinutes')-1)*100:+7.0f}% {c:13.1f} {(c/p50(g,'AveragePlayTimeMinutesPerDAU')-1)*100:+7.0f}%")
print("\n### Sessions per DAU  (= playtime per DAU / session length) — how often they come back within a day")
for g in GAMES:
    b=sl[g].dropna().iloc[-14:].mean(); c=pt[g].dropna().iloc[-14:].mean()
    print(f"  {g:12s} {c/b:.2f} sessions/DAU/day")
print("\n### DailyCohortRetention by cohort day (mean of last 14 settled days, %)")
d=con.execute("""SELECT game, dim_value, avg(value)*100 v FROM pts
 WHERE metric='DailyCohortRetention' AND dim='CohortDay' AND NOT is_partial
 AND date>=DATE '2026-08-19' GROUP BY 1,2""").df()
if not d.empty:
    t=d.pivot_table(index='game',columns='dim_value',values='v').reindex(GAMES)
    cols=sorted(t.columns,key=lambda c:int(''.join(ch for ch in str(c) if ch.isdigit()) or 0))
    print(t[cols].round(2).to_string())
