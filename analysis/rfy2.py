import json, numpy as np, pandas as pd, duckdb
d=json.load(open('analysis/oc_rfy_lifetime.json'))
con=duckdb.connect('analysis/analytics.duckdb', read_only=True)
pd.set_option('display.width',250)

def rfy(g,m):
    x=d[g].get(m)
    if not x or not x.get('points'): return None
    return pd.Series({pd.Timestamp(a):b for a,b in x['points']}).sort_index()

q="""SELECT game,date,value,status FROM pts WHERE metric='UniqueUsersWithImpressions'
     AND granularity='METRIC_GRANULARITY_ONE_DAY' AND series='Total' AND NOT is_partial"""
r=con.execute(q).df(); r=r[r.status!='FILLED_ZERO']; r['date']=pd.to_datetime(r['date'])
reach=r.pivot_table(index='date',columns='game',values='value')

# --- objective J0: 3d MA of reach drops below 70% of the trailing-28d max and stays <70% for 3d
def pullback_date(s, thresh=0.70, hold=3):
    s=s.dropna(); ma3=s.rolling(3).mean(); mx28=s.rolling(28,min_periods=7).max()
    ratio=ma3/mx28
    below=ratio<thresh
    for i in range(len(s)-hold):
        if below.iloc[i] and below.iloc[i:i+hold].all(): return s.index[i], ratio.iloc[i]
    return None,None

print("=== OBJECTIVE PULLBACK DATE (rule fixed before looking at RFY) ===")
J0={}
for g in reach.columns:
    dt,ra=pullback_date(reach[g])
    pk=reach[g].dropna().idxmax()
    J0[g]=dt
    print(f"  {g:11s} reach peak {pk.date()}   J0 = {dt.date() if dt is not None else '-'}  (ma3/max28={ra:.2f})" if dt is not None else f"  {g:11s} reach peak {pk.date()}   J0 = none in span")

# --- change-point scan on each RFY signal: trend + step, keep largest |t|
def scan(s, min_edge=10):
    s=s.dropna()
    if len(s)<3*min_edge: return None
    x=np.arange(len(s),dtype=float); y=s.values.astype(float)
    best=None
    for k in range(min_edge,len(s)-min_edge):
        step=(x>=k).astype(float)
        X=np.column_stack([np.ones_like(x),x,step])
        beta,res,rank,_=np.linalg.lstsq(X,y,rcond=None)
        resid=y-X@beta; dof=len(y)-3
        s2=resid@resid/dof
        cov=s2*np.linalg.pinv(X.T@X)
        t=beta[2]/np.sqrt(cov[2,2])
        if best is None or abs(t)>abs(best[2]): best=(s.index[k],beta[2],t)
    return best

SIG=["RFYPlayThroughRate","RFYQualifiedPTR","RFYDuration0To60","RFYDuration61To180",
     "RFYD1Playtime","RFYD1QualifiedPlaySessions","RFYD2To7PlayDays","RFYD2To7Playtime",
     "RFYL7PlayDays","RFYUniqueNotInterestedUsersPerMillionImpressions"]
GOODUP={"RFYPlayThroughRate":1,"RFYQualifiedPTR":1,"RFYDuration0To60":-1,"RFYDuration61To180":-1,
        "RFYD1Playtime":1,"RFYD1QualifiedPlaySessions":1,"RFYD2To7PlayDays":1,"RFYD2To7Playtime":1,
        "RFYL7PlayDays":1,"RFYUniqueNotInterestedUsersPerMillionImpressions":-1}

for g in ["Brainrot","Waterslide","Verity","Seal"]:
    j=J0[g]; print(f"\n=== {g}   J0={j.date() if j is not None else 'none'} ===")
    print(f"  {'signal':46s} {'break':>11s} {'step':>11s} {'t':>7s} {'dir':>5s} {'lead vs J0':>11s}")
    for m in SIG:
        s=rfy(g,m)
        if s is None: continue
        b=scan(s)
        if b is None: print(f"  {m:46s} {'too short':>11s}"); continue
        dt,step,t=b
        good = 'good' if step*GOODUP[m]>0 else 'BAD'
        lead = (j-dt).days if j is not None else None
        print(f"  {m:46s} {str(dt.date()):>11s} {step:11.4f} {t:7.2f} {good:>5s} {(str(lead)+'d' if lead is not None else '-'):>11s}")
