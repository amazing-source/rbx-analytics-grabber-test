import json, numpy as np, pandas as pd, duckdb
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

def ols(y,X):
    b,*_=np.linalg.lstsq(X,y,rcond=None); e=y-X@b; dof=len(y)-X.shape[1]
    cov=(e@e/dof)*np.linalg.pinv(X.T@X); se=np.sqrt(np.diag(cov))
    t=b/se; p=2*(1-stats.t.cdf(np.abs(t),dof)); return b,t,p

print("GRANGER-STYLE lead test on daily log-differences")
print("  H1: d.signal(t-k) predicts d.log reach(t), controlling for d.log reach(t-1)")
print("  H2 (reverse): d.log reach(t-1) predicts d.signal(t)\n")
for g in ["Brainrot","Waterslide"]:
    s_reach=reach[g].dropna(); s_reach=s_reach[s_reach>0]
    dR=np.log(s_reach).diff()
    print(f"=== {g}  (reach n={len(s_reach)}) ===")
    print(f"  {'signal':16s} {'best lag':>8s} {'p(sig->reach)':>14s} {'p(reach->sig)':>14s}  verdict")
    for m in SIG:
        sv=rfy(g,m)
        if sv is None: continue
        dS=sv.diff()
        df=pd.concat({'dR':dR,'dS':dS},axis=1).dropna()
        if len(df)<40: print(f"  {REN[m]:16s} {'short':>8s}"); continue
        best=None
        for k in range(1,8):
            X=np.column_stack([np.ones(len(df)-k), df.dR.values[k-1:-1], df.dS.values[:-k]])
            y=df.dR.values[k:]
            if len(y)<30: continue
            b,t,p=ols(y,X)
            if best is None or p[2]<best[1]: best=(k,p[2])
        k,pf=best
        # reverse
        Xr=np.column_stack([np.ones(len(df)-1), df.dS.values[:-1], df.dR.values[:-1]])
        yr=df.dS.values[1:]
        br,tr,pr=ols(yr,Xr); pb=pr[2]
        if pf<0.05 and pb>=0.05: v="signal LEADS reach"
        elif pb<0.05 and pf>=0.05: v="reach leads signal"
        elif pf<0.05 and pb<0.05: v="both - feedback loop"
        else: v="neither"
        print(f"  {REN[m]:16s} {k:8d} {pf:14.3f} {pb:14.3f}  {v}")
    print()
