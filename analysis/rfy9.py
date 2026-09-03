import json, numpy as np, pandas as pd, duckdb, warnings
warnings.filterwarnings('ignore')
from scipy import stats
from math import sqrt
d=json.load(open('analysis/oc_rfy_lifetime.json'))
con=duckdb.connect('analysis/analytics.duckdb', read_only=True)
def rfy(g,m):
    x=d[g].get(m)
    if not x or not x.get('points'): return None
    return pd.Series({pd.Timestamp(a):b for a,b in x['points']}).sort_index()
q="""SELECT game,date,value,status FROM pts WHERE metric='UniqueUsersWithImpressions'
     AND granularity='METRIC_GRANULARITY_ONE_DAY'
     AND series='AcquisitionSource: HomeRecommendation' AND NOT is_partial"""
r=con.execute(q).df(); r=r[r.status!='FILLED_ZERO']; r['date']=pd.to_datetime(r['date'])
reach=r.pivot_table(index='date',columns='game',values='value')
print("HOME-RECOMMENDATION impressions (the correct denominator):")
for g in reach.columns:
    s=reach[g].dropna(); s=s[s>0]
    print(f"  {g:11s} n={len(s):3d}  {s.index.min().date()}->{s.index.max().date()}  peak {s.max():,.0f} on {s.idxmax().date()}  last {s.iloc[-1]:,.0f}  ({100*(s.iloc[-1]/s.max()-1):+.1f}% vs peak)")

SIG=["RFYPlayThroughRate","RFYDuration0To60","RFYDuration61To180","RFYD1Playtime",
     "RFYD1QualifiedPlaySessions","RFYD2To7PlayDays","RFYD2To7Playtime","RFYL7PlayDays"]
REN={'RFYPlayThroughRate':'PTR','RFYDuration0To60':'bounce<60','RFYDuration61To180':'bounce61-180',
     'RFYD1Playtime':'D1playtime','RFYD1QualifiedPlaySessions':'D1qualSess',
     'RFYD2To7PlayDays':'D2-7 playdays','RFYD2To7Playtime':'D2-7 playtime','RFYL7PlayDays':'L7 playdays'}

print("\n[A] QUALITY UNDER SCALE - partial corr(log Home reach, signal | trend + weekday FE)")
print("    bounce negative = quality holds as reach scales; playtime/playdays positive = holds\n")
for g in ["Brainrot","Waterslide","Verity","Seal"]:
    if g not in reach: continue
    base=reach[g].dropna(); base=base[base>0]
    parts=[]
    for m in SIG:
        sv=rfy(g,m)
        if sv is None: parts.append(f"{REN[m]}=--"); continue
        df=pd.concat({'R':base,'S':sv},axis=1,sort=True).dropna()
        if len(df)<15: parts.append(f"{REN[m]}=--"); continue
        idx=df.index; n=len(df); t=np.arange(n,dtype=float); dow=idx.dayofweek.values
        X=np.column_stack([np.ones(n),t]+[(dow==k).astype(float) for k in range(1,7)])
        def res(v):
            b,*_=np.linalg.lstsq(X,v,rcond=None); return v-X@b
        rr=np.corrcoef(res(np.log(df.R.values)),res(df.S.values.astype(float)))[0,1]
        dof=n-X.shape[1]-1
        ts=rr*sqrt(dof/max(1e-12,1-rr**2)); p=2*(1-stats.t.cdf(abs(ts),dof))
        parts.append(f"{REN[m]}={rr:+.2f}{'*' if p<.05 else ' '}")
    print(f"  {g:11s} n={len(base):3d}  " + "  ".join(parts))

LAGS=range(1,8); NL=7
def ols_p(y,X,j):
    b,*_=np.linalg.lstsq(X,y,rcond=None); e=y-X@b; dof=len(y)-X.shape[1]
    cov=(e@e/dof)*np.linalg.pinv(X.T@X); return 2*(1-stats.t.cdf(abs(b[j]/np.sqrt(cov[j,j])),dof))
def minp(cause,effect):
    best=(None,1.0)
    for k in LAGS:
        n=len(effect); X=np.column_stack([np.ones(n-k),effect[k-1:-1],cause[:-k]]); y=effect[k:]
        if len(y)<30: continue
        p=ols_p(y,X,2)
        if p<best[1]: best=(k,p)
    k,p=best; return k,1-(1-p)**NL

print("\n[B] SYMMETRIC LEAD TEST on Home reach - both directions, same 7-lag search, Sidak-corrected\n")
for g in ["Brainrot","Waterslide"]:
    s=reach[g].dropna(); s=s[s>0]; dR=np.log(s).diff()
    print(f"=== {g} (n={len(s)}) ===")
    print(f"  {'signal':16s} {'k':>2s} {'p sig->reach':>13s}  {'k':>2s} {'p reach->sig':>13s}  verdict")
    for m in SIG:
        sv=rfy(g,m)
        if sv is None: continue
        df=pd.concat({'dR':dR,'dS':sv.diff()},axis=1,sort=True).dropna()
        if len(df)<45: print(f"  {REN[m]:16s}  too short ({len(df)})"); continue
        R=df.dR.values; S=df.dS.values
        k1,p1=minp(S,R); k2,p2=minp(R,S)
        v=("signal LEADS reach" if p1<.05<=p2 else "reach leads signal" if p2<.05<=p1
           else "both - feedback" if p1<.05 and p2<.05 else "neither")
        print(f"  {REN[m]:16s} {k1:2d} {p1:13.3f}  {k2:2d} {p2:13.3f}  {v}")
    print()
