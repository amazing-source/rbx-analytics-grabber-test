import json, numpy as np, pandas as pd, duckdb
d=json.load(open('analysis/oc_rfy_lifetime.json'))
con=duckdb.connect('analysis/analytics.duckdb', read_only=True)
def rfy(g,m):
    x=d[g].get(m)
    if not x or not x.get('points'): return None
    return pd.Series({pd.Timestamp(a):b for a,b in x['points']}).sort_index()
q="""SELECT game,date,value,status FROM pts WHERE metric='UniqueUsersWithImpressions'
     AND granularity='METRIC_GRANULARITY_ONE_DAY' AND series='Total' AND NOT is_partial"""
r=con.execute(q).df(); r=r[r.status!='FILLED_ZERO']; r['date']=pd.to_datetime(r['date'])
reach=r.pivot_table(index='date',columns='game',values='value')
SIG=["RFYPlayThroughRate","RFYDuration0To60","RFYDuration61To180","RFYD1Playtime",
     "RFYD1QualifiedPlaySessions","RFYD2To7PlayDays","RFYD2To7Playtime"]
REN={'RFYPlayThroughRate':'PTR','RFYDuration0To60':'bounce<60','RFYDuration61To180':'bounce61-180',
     'RFYD1Playtime':'D1play','RFYD1QualifiedPlaySessions':'D1qSess','RFYD2To7PlayDays':'D2-7days',
     'RFYD2To7Playtime':'D2-7play'}
print("Q: is 'reach quintile' just time-since-launch?   corr(log reach, day index)")
for g in ["Brainrot","Waterslide","Verity","Seal"]:
    s=reach[g].dropna(); s=s[s>0]
    print(f"  {g:11s} r = {np.corrcoef(np.arange(len(s)), np.log(s))[0,1]:+.2f}   ({len(s)} days)")

print("\nPARTIAL corr(log reach, signal | linear time trend)  — raw r in brackets")
for g in ["Brainrot","Waterslide","Verity","Seal"]:
    df=pd.DataFrame({'reach':reach[g]})
    for m in SIG:
        s=rfy(g,m)
        if s is not None: df[m]=s
    df=df.dropna(subset=['reach']); df=df[df.reach>0]
    df['t']=np.arange(len(df),dtype=float)
    lr=np.log(df.reach.values)
    def resid(y,t):
        X=np.column_stack([np.ones_like(t),t]); b,*_=np.linalg.lstsq(X,y,rcond=None); return y-X@b
    row=[]
    for m in SIG:
        if m not in df: row.append((REN[m],'-','-')); continue
        sub=df[[m,'t']].dropna()
        if len(sub)<12: row.append((REN[m],'-','-')); continue
        y=sub[m].values.astype(float); t=sub['t'].values
        x=np.log(df.loc[sub.index,'reach'].values)
        raw=np.corrcoef(x,y)[0,1]
        pr=np.corrcoef(resid(x,t),resid(y,t))[0,1]
        row.append((REN[m],f"{pr:+.2f}",f"[{raw:+.2f}]"))
    print(f"  {g:11s} n={len(df):3d} " + "  ".join(f"{a}={b}{c}" for a,b,c in row))
