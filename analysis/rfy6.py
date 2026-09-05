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
REN={'RFYPlayThroughRate':'PTR','RFYDuration0To60':'b<60','RFYDuration61To180':'b61-180',
     'RFYD1Playtime':'D1play','RFYD1QualifiedPlaySessions':'D1qSess','RFYD2To7PlayDays':'D2-7d',
     'RFYD2To7Playtime':'D2-7play'}

def design(t, dow, n):
    cols=[np.ones(n), t]
    for k in range(1,7): cols.append((dow==k).astype(float))
    return np.column_stack(cols)

print("Partial corr(log reach, signal | linear trend + weekday FE), with two-sided p")
print("negative on b<60 / b61-180 = bounce falls as reach rises = quality HOLDS\n")
from math import sqrt
try:
    from scipy import stats; HAVE=True
except Exception: HAVE=False
for g in ["Brainrot","Waterslide","Verity","Seal"]:
    df=pd.DataFrame({'reach':reach[g]})
    for m in SIG:
        s=rfy(g,m)
        if s is not None: df[m]=s
    df=df.dropna(subset=['reach']); df=df[df.reach>0]
    parts=[]
    for m in SIG:
        if m not in df: parts.append(f"{REN[m]}=--"); continue
        sub=df[[m]].dropna()
        if len(sub)<15: parts.append(f"{REN[m]}=--"); continue
        idx=sub.index
        t=np.arange(len(df),dtype=float)[df.index.isin(idx)]
        dow=idx.dayofweek.values
        n=len(idx)
        X=design(t,dow,n)
        y=sub[m].values.astype(float)
        x=np.log(df.loc[idx,'reach'].values)
        def res(v):
            b,*_=np.linalg.lstsq(X,v,rcond=None); return v-X@b
        rx,ry=res(x),res(y)
        rr=np.corrcoef(rx,ry)[0,1]
        dof=n-X.shape[1]-1
        tstat=rr*sqrt(dof/max(1e-12,1-rr**2))
        p=2*(1-stats.t.cdf(abs(tstat),dof)) if HAVE else float('nan')
        star='*' if p<0.05 else ' '
        parts.append(f"{REN[m]}={rr:+.2f}{star}")
    print(f"  {g:11s} n={len(df):3d}  " + "  ".join(parts))
print("\n* = p<0.05")
