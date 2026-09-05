import sys, os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from core import *
LO, HI = '2026-08-19', '2026-09-01'   # common window, all four at scale
VOL = ['DailyActiveUsers','Visits','DailyRevenue','PayingUsers','TotalPlayTimeHours','UniqueUsersWithImpressions']
RATE= ['ForwardD1Retention','ForwardD7Retention','DauMauStickiness','AverageSessionLengthMinutes',
       'AveragePlayTimeMinutesPerDAU','AverageRevenuePerUser','AverageRevenuePerPayingUser',
       'PayingUsersCVR','EndToEndCVR']
rows=[]
for m in VOL+RATE:
    df = daily(m)
    w = df.loc[LO:HI] if not df.empty else df
    for g in GAMES:
        if g not in df.columns: continue
        s = w[g].dropna()
        full = df[g].dropna()
        if s.empty: continue
        rows.append(dict(metric=m, kind='volume' if m in VOL else 'rate', game=g,
            n_days=len(s),
            total=s.sum() if m in VOL else np.nan,
            avg=s.mean(),
            trend=(slope_pct_per_day(s) if m in VOL else slope_abs_per_day(s)),
            wow=wow(df)[g],
            peak=full.max(), peak_date=str(full.idxmax().date()),
            latest=full.iloc[-1], vs_peak=(full.iloc[-1]/full.max()-1)*100))
r = pd.DataFrame(rows)
for m in VOL+RATE:
    sub = r[r.metric==m]
    if sub.empty: continue
    print(f"\n### {m}  ({sub.kind.iloc[0]})   window {LO}..{HI}")
    disp = sub[['game','n_days','total','avg','trend','wow','peak','peak_date','latest','vs_peak']].copy()
    disp.columns = ['game','n','total','mean','trend/day','WoW %','peak','peak on','latest','vs peak %']
    print(disp.to_string(index=False, float_format=lambda v: f"{v:,.4g}"))
r.to_csv(os.path.join(ROOT,'summary_metrics.csv'), index=False)
