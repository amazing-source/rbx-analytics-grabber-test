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

def pullback_date(s, thresh=0.70, hold=3):
    """First day AT OR AFTER the all-time peak where ma3 < thresh*peak and stays for `hold` days."""
    s=s.dropna(); pk=s.idxmax(); pv=s.max()
    ma3=s.rolling(3).mean()
    seg=ma3[ma3.index>=pk]
    below=seg<thresh*pv
    for i in range(len(seg)-hold+1):
        if below.iloc[i:i+hold].all(): return pk, seg.index[i]
    return pk, None

print("=== J0: first sustained (3d) drop below 70% of the all-time reach peak ===")
J0={}; PK={}
for g in reach.columns:
    pk,j=pullback_date(reach[g]); J0[g]=j; PK[g]=pk
    s=reach[g].dropna()
    print(f"  {g:11s} peak {pk.date()} = {s.max():12,.0f}   J0 = {j.date() if j is not None else '-'}   last = {s.iloc[-1]:,.0f}")

def scan(s, min_edge=10, tcrit=3.0):
    s=s.dropna()
    if len(s)<3*min_edge: return None
    x=np.arange(len(s),dtype=float); y=s.values.astype(float)
    best=None; fired=0; cand=0
    for k in range(min_edge,len(s)-min_edge):
        step=(x>=k).astype(float)
        X=np.column_stack([np.ones_like(x),x,step])
        beta,*_=np.linalg.lstsq(X,y,rcond=None)
        resid=y-X@beta; dof=len(y)-3
        cov=(resid@resid/dof)*np.linalg.pinv(X.T@X)
        t=beta[2]/np.sqrt(cov[2,2]); cand+=1
        if abs(t)>tcrit: fired+=1
        if best is None or abs(t)>abs(best[2]): best=(s.index[k],beta[2],t)
    return best+(fired/cand, s)

SIG=["RFYPlayThroughRate","RFYQualifiedPTR","RFYDuration0To60","RFYDuration61To180",
     "RFYD1Playtime","RFYD1QualifiedPlaySessions","RFYD2To7PlayDays","RFYD2To7Playtime",
     "RFYL7PlayDays","RFYUniqueNotInterestedUsersPerMillionImpressions"]
GOODUP={"RFYPlayThroughRate":1,"RFYQualifiedPTR":1,"RFYDuration0To60":-1,"RFYDuration61To180":-1,
        "RFYD1Playtime":1,"RFYD1QualifiedPlaySessions":1,"RFYD2To7PlayDays":1,"RFYD2To7Playtime":1,
        "RFYL7PlayDays":1,"RFYUniqueNotInterestedUsersPerMillionImpressions":-1}

for g in ["Brainrot","Waterslide"]:
    pk=PK[g]; print(f"\n=== {g}   reach peak {pk.date()}   J0 {J0[g].date()} ===")
    print(f"  {'signal':44s} {'break':>11s} {'lead vs peak':>13s} {'step':>10s} {'%of base':>9s} {'t':>7s} {'smear':>6s} {'dir':>5s}")
    for m in SIG:
        s=rfy(g,m)
        if s is None: continue
        b=scan(s)
        if b is None: continue
        dt,step,t,smear,ss=b
        base=ss[ss.index<dt].tail(28).mean()
        pct=100*step/base if base else float('nan')
        lead=(pk-dt).days
        good='good' if step*GOODUP[m]>0 else 'BAD'
        print(f"  {m:44s} {str(dt.date()):>11s} {lead:12d}d {step:10.4f} {pct:8.1f}% {t:7.2f} {smear:5.0%} {good:>5s}")
