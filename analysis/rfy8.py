import json, numpy as np, pandas as pd, duckdb, warnings
warnings.filterwarnings('ignore')
from scipy import stats
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
     "RFYD1QualifiedPlaySessions","RFYD2To7PlayDays","RFYD2To7Playtime","RFYL7PlayDays"]
REN={'RFYPlayThroughRate':'PTR','RFYDuration0To60':'bounce<60','RFYDuration61To180':'bounce61-180',
     'RFYD1Playtime':'D1playtime','RFYD1QualifiedPlaySessions':'D1qualSess',
     'RFYD2To7PlayDays':'D2-7 playdays','RFYD2To7Playtime':'D2-7 playtime','RFYL7PlayDays':'L7 playdays'}
LAGS=range(1,8); NL=len(list(LAGS))
def ols_p(y,X,j):
    b,*_=np.linalg.lstsq(X,y,rcond=None); e=y-X@b; dof=len(y)-X.shape[1]
    cov=(e@e/dof)*np.linalg.pinv(X.T@X)
    t=b[j]/np.sqrt(cov[j,j]); return 2*(1-stats.t.cdf(abs(t),dof))
def minp(cause, effect, lags=LAGS):
    """min p over lags of cause(t-k) -> effect(t), controlling effect(t-1). Sidak-corrected."""
    best=(None,1.0)
    for k in lags:
        n=len(effect)
        X=np.column_stack([np.ones(n-k), effect[k-1:-1], cause[:-k]])
        y=effect[k:]
        if len(y)<30: continue
        p=ols_p(y,X,2)
        if p<best[1]: best=(k,p)
    k,p=best
    return k, 1-(1-p)**NL   # Sidak over the NL lags searched
print("SYMMETRIC lead test - both directions get the same 7-lag search, Sidak-corrected")
print("(daily log-diff of reach; first-diff of signal)\n")
for g in ["Brainrot","Waterslide"]:
    s=reach[g].dropna(); s=s[s>0]; dR=np.log(s).diff()
    print(f"=== {g} ===")
    print(f"  {'signal':16s} {'k':>2s} {'p adj sig->reach':>17s}  {'k':>2s} {'p adj reach->sig':>17s}  verdict")
    for m in SIG:
        sv=rfy(g,m)
        if sv is None: continue
        df=pd.concat({'dR':dR,'dS':sv.diff()},axis=1,sort=True).dropna()
        if len(df)<45: print(f"  {REN[m]:16s}  too short ({len(df)})"); continue
        R=df.dR.values; S=df.dS.values
        k1,p1=minp(S,R); k2,p2=minp(R,S)
        v=("signal LEADS reach" if p1<.05<=p2 else "reach leads signal" if p2<.05<=p1
           else "both - feedback loop" if p1<.05 and p2<.05 else "neither")
        print(f"  {REN[m]:16s} {k1:2d} {p1:17.3f}  {k2:2d} {p2:17.3f}  {v}")
    print()
print("n tests = 8 signals x 2 games x 2 directions = 32; read a single p=0.04 accordingly.")
