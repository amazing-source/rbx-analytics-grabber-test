import sys, os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from core import *
dau = daily('DailyActiveUsers')
VALID = dau >= 10000     # mask: only days with a real audience count for rate peaks
VOL = ['DailyActiveUsers','Visits','DailyRevenue','PayingUsers','TotalPlayTimeHours','UniqueUsersWithImpressions']
RATE= ['ForwardD1Retention','ForwardD7Retention','DauMauStickiness','AverageSessionLengthMinutes',
       'AveragePlayTimeMinutesPerDAU','AverageRevenuePerUser','AverageRevenuePerPayingUser',
       'PayingUsersCVR','EndToEndCVR']
rows=[]
for m in VOL+RATE:
    df = daily(m)
    if df.empty: continue
    v = df.reindex(columns=GAMES)
    mask = VALID.reindex(index=v.index, columns=v.columns).fillna(False)
    vq = v.where(mask)                     # quality-masked (>=10k DAU days)
    for g in GAMES:
        s_all = v[g].dropna(); s_q = vq[g].dropna()
        if s_q.empty: continue
        last7 = s_q.iloc[-7:]; prev7 = s_q.iloc[-14:-7]
        rows.append(dict(metric=m, kind='volume' if m in VOL else 'rate', game=g,
            mean14=s_q.iloc[-14:].mean(),
            total14=s_q.iloc[-14:].sum() if m in VOL else np.nan,
            trend14=(slope_pct_per_day(s_q.iloc[-14:]) if m in VOL else slope_abs_per_day(s_q.iloc[-14:])),
            trend7 =(slope_pct_per_day(last7)          if m in VOL else slope_abs_per_day(last7)),
            wow=(last7.mean()/prev7.mean()-1)*100 if len(prev7)>=5 and prev7.mean() else np.nan,
            peak=s_q.max(), peak_date=str(s_q.idxmax().date()),
            latest=s_q.iloc[-1], vs_peak=(s_q.iloc[-1]/s_q.max()-1)*100))
r = pd.DataFrame(rows); r.to_csv(os.path.join(ROOT,'summary_metrics.csv'), index=False)
def fmt(v):
    if pd.isna(v): return '—'
    return f"{v:,.4g}"
for m in VOL+RATE:
    sub=r[r.metric==m]
    if sub.empty: continue
    print(f"\n### {m}  [{sub.kind.iloc[0]}]  — peaks/means over days with DAU>=10k")
    d=sub[['game','mean14','total14','trend14','trend7','wow','peak','peak_date','latest','vs_peak']]
    d.columns=['game','mean 14d','total 14d','trend14','trend7','WoW %','peak','peak on','latest','vs peak %']
    print(d.to_string(index=False, float_format=fmt))
