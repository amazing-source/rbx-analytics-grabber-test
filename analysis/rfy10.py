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
SIG=["RFYD8To28PlayDays","RFYD8To28Playtime","RFYD8To28QualifiedPlaySessions",
     "RFYD8To28CoplayDays","RFYD8To28RobuxSpend","RFYD8To28SpendDays"]
REN={m:m.replace('RFYD8To28','D8-28 ') for m in SIG}
print("[A] D8-28 signals - partial corr(log Home reach, signal | trend + weekday FE)")
for g in ["Brainrot","Waterslide"]:
    base=reach[g].dropna(); base=base[base>0]; parts=[]
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
        dof=n-X.shape[1]-1; ts=rr*sqrt(dof/max(1e-12,1-rr**2)); p=2*(1-stats.t.cdf(abs(ts),dof))
        parts.append(f"{REN[m].strip()}={rr:+.2f}{'*' if p<.05 else ' '}")
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
print("\n[B] D8-28 symmetric lead test (Sidak over 7 lags, both directions)")
for g in ["Brainrot","Waterslide"]:
    s=reach[g].dropna(); s=s[s>0]; dR=np.log(s).diff()
    print(f"  === {g} ===")
    for m in SIG:
        sv=rfy(g,m)
        if sv is None: continue
        df=pd.concat({'dR':dR,'dS':sv.diff()},axis=1,sort=True).dropna()
        if len(df)<45: print(f"    {REN[m].strip():26s} too short ({len(df)})"); continue
        R=df.dR.values; S=df.dS.values
        k1,p1=minp(S,R); k2,p2=minp(R,S)
        v=("signal LEADS reach" if p1<.05<=p2 else "reach leads signal" if p2<.05<=p1
           else "both - feedback" if p1<.05 and p2<.05 else "neither")
        print(f"    {REN[m].strip():26s} k={k1} p={p1:.3f} | k={k2} p={p2:.3f}  {v}")
# level trajectory: where do the D8-28 signals sit now vs at the reach peak
print("\n[C] LEVELS: mean in the 28d ending at the Home-reach peak vs the last 28d")
for g in ["Brainrot","Waterslide"]:
    s=reach[g].dropna(); s=s[s>0]; pk=s.idxmax()
    print(f"  === {g}  peak {pk.date()} ===")
    for m in SIG+["RFYPlayThroughRate","RFYDuration0To60","RFYD1Playtime","RFYD2To7PlayDays"]:
        sv=rfy(g,m)
        if sv is None: continue
        a=sv[(sv.index>pk-pd.Timedelta(days=28))&(sv.index<=pk)].mean()
        b=sv.tail(28).mean()
        if not np.isfinite(a) or a==0: continue
        print(f"    {m.replace('RFY',''):32s} at peak {a:9.4f}   now {b:9.4f}   {100*(b/a-1):+7.1f}%")
