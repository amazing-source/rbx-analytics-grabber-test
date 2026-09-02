import sys, os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from stats import *
LO,HI='2026-08-19','2026-09-01'
dau=daily('DailyActiveUsers'); rev=daily('DailyRevenue')
d1=daily('ForwardD1Retention'); d7=daily('ForwardD7Retention')
arpdau=daily('AverageRevenuePerUser'); cvr=daily('PayingUsersCVR')
pt=daily('AveragePlayTimeMinutesPerDAU'); imp=daily('UniqueUsersWithImpressions')
rows=[]
for g in GAMES:
    d=dau[g].dropna(); r=rev[g].dropna()
    l7=lambda s: s.dropna().iloc[-7:].mean()
    p7=lambda s: s.dropna().iloc[-14:-7].mean()
    rows.append(dict(game=g,
      dau_l7=l7(dau[g]), dau_wow=(l7(dau[g])/p7(dau[g])-1)*100,
      dau_vs_peak=(d.iloc[-1]/d.max()-1)*100, days_since_peak=(d.index[-1]-d.idxmax()).days,
      rev_l7=l7(rev[g]), rev_wow=(l7(rev[g])/p7(rev[g])-1)*100,
      arpdau=l7(arpdau[g]), cvr=l7(cvr[g])*100, d1=l7(d1[g])*100, d7=l7(d7[g])*100,
      playtime=l7(pt[g]),
      reach_l7=l7(imp[g]), reach_wow=(l7(imp[g])/p7(imp[g])-1)*100,
      decay=slope_pct_per_day(d.iloc[-14:])))
r=pd.DataFrame(rows).set_index('game')
print("### Cross-game scorecard — last 7 settled days (26 Aug – 1 Sep), WoW vs the 7 before\n")
print(r.round(2).to_string())
print("\n### Rank on each KPI (1 = best)")
HIGHER=['dau_l7','rev_l7','arpdau','cvr','d1','d7','playtime','reach_l7','dau_wow','rev_wow','reach_wow','dau_vs_peak','decay']
rk=pd.DataFrame({c:r[c].rank(ascending=False).astype(int) for c in HIGHER})
print(rk.to_string())
print("\n### Composite (mean rank over: DAU WoW, revenue WoW, reach WoW, 14d decay, D1, D7, ARPDAU, CVR)")
comp=rk[['dau_wow','rev_wow','reach_wow','decay','d1','d7','arpdau','cvr']].mean(axis=1).sort_values()
print(comp.round(2).to_string())
r.to_csv(os.path.join(ROOT,'scorecard.csv'))
