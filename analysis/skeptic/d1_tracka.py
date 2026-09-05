"""D1 - attack the Track A negative + the 'DAU was rising' lead-shift claim."""
import csv, os, collections, datetime, statistics, math, random
import numpy as np
from scipy import stats
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT=os.path.join(ROOT,"analysis","panel"); DAY="METRIC_GRANULARITY_ONE_DAY"
EVENTS=[("8507699752","Poison Treats","2025-12-01"),("7364907416","Plane Training","2025-05-06"),
("7364907416","Plane Training","2025-09-22"),("8669915245","Don't Wake Police","2025-10-13"),
("9758414065","Climb Up Mountain","2026-04-07"),("7888930431","Moon Incremental","2026-04-15")]
METRICS=["ForwardD1Retention","ForwardD7Retention","AverageSessionLengthMinutes",
"AveragePlayTimeMinutesPerDAU","DauMauStickiness","EndToEndCVR","PayingUsersCVR",
"AverageRevenuePerUser","AverageRevenuePerPayingUser","DailyActiveUsers"]

daily=collections.defaultdict(dict)
for r in csv.DictReader(open(os.path.join(OUT,"daily.csv"),encoding="utf-8")):
    for k,v in r.items():
        if k in ("universe","game","date","filled_zero_metrics") or v=="": continue
        try: daily[(r["universe"],k)][r["date"]]=float(v)
        except ValueError: pass
def truth(uid,metric,series="Total"):
    f=os.path.join(ROOT,"data","games",uid,"metrics",metric+".csv"); out={}
    if not os.path.exists(f): return out
    for r in csv.DictReader(open(f,encoding="utf-8")):
        if r["granularity"]!=DAY or r.get("value") in (None,""): continue
        if str(r.get("partial","")).lower() in ("true","1"): continue
        if r["series"]!=series: continue
        out[r["date"]]=float(r["value"])
    return out
home={u:truth(u,"UniqueUsersWithImpressions","AcquisitionSource: HomeRecommendation") for u,_,_ in EVENTS}
homebad=collections.defaultdict(dict)
for r in csv.DictReader(open(os.path.join(OUT,"by_source.csv"),encoding="utf-8")):
    if r["metric"]=="UniqueUsersWithImpressions" and r["source"]=="HomeRecommendation":
        homebad[r["universe"]][r["date"]]=float(r["value"])

def win(s,j0,lo,hi):
    d0=datetime.date.fromisoformat(j0)
    return [s[(d0+datetime.timedelta(days=k)).isoformat()]
            for k in range(lo,hi+1) if (d0+datetime.timedelta(days=k)).isoformat() in s]

print("=== E. 'DAU was rising before three of six pullbacks' (z +2.2/+2.1/+3.1) ===")
print(f"{'event':34s}{'panel DAU z':>13s}{'TRUE DAU z':>12s}{'HomeReach z':>13s}{'DAU|reach z':>13s}")
for uid,name,j0 in EVENTS:
    def z(s):
        b=win(s,j0,-28,-8); l=win(s,j0,-7,-1)
        if len(b)<10 or len(l)<4: return float("nan")
        sd=statistics.pstdev(b)
        return (statistics.mean(l)-statistics.mean(b))/sd if sd else 0.0
    zp=z(daily.get((uid,"DailyActiveUsers"),{})); zt=z(truth(uid,"DailyActiveUsers"))
    zh=z(home.get(uid,{}))
    # DAU residualised on log home reach over J-28..J-1, then the same z
    s1=truth(uid,"DailyActiveUsers"); s2=home.get(uid,{})
    d0=datetime.date.fromisoformat(j0)
    ds=[(d0+datetime.timedelta(days=k)).isoformat() for k in range(-28,0)]
    ds=[d for d in ds if d in s1 and s2.get(d,0)>0]
    zr=float("nan")
    if len(ds)>=20:
        X=np.column_stack([np.ones(len(ds)),np.log([s2[d] for d in ds])])
        y=np.array([s1[d] for d in ds]); b,*_=np.linalg.lstsq(X,y,rcond=None)
        e=dict(zip(ds,y-X@b)); bb=win(e,j0,-28,-8); ll=win(e,j0,-7,-1)
        sd=statistics.pstdev(bb)
        if sd: zr=(statistics.mean(ll)-statistics.mean(bb))/sd
    print(f"{name+' '+j0:34s}{zp:>+13.1f}{zt:>+12.1f}{zh:>+13.1f}{zr:>+13.1f}")
print("(panel DAU is the IsNewUser=Returning slice; TRUE DAU is the Total row.)")

# ---------------- a better placebo
def ols_p(y,X,j):
    b,*_=np.linalg.lstsq(X,y,rcond=None); e=y-X@b; dof=len(y)-X.shape[1]
    if dof<=0: return 1.0
    cov=(e@e/dof)*np.linalg.pinv(X.T@X); se=math.sqrt(max(cov[j,j],1e-30))
    return float(2*(1-stats.t.cdf(abs(b[j]/se),dof)))
LAGS=range(1,8)
def minp(cause,effect):
    best=1.0
    for k in LAGS:
        n=len(effect)
        if n-k<20: continue
        X=np.column_stack([np.ones(n-k),effect[k-1:-1],cause[:-k]])
        best=min(best,ols_p(effect[k:],X,2))
    return 1-(1-best)**len(list(LAGS))
def run_cut(uid,cut,H):
    h=H.get(uid,{}); d0=datetime.date.fromisoformat(cut); hw={}
    for k in range(-28,29):
        d=(d0+datetime.timedelta(days=k)).isoformat()
        if h.get(d,0)>0: hw[d]=h[d]
    hd=sorted(hw)
    if len(hd)<30: return None
    dR=np.diff(np.log([hw[d] for d in hd])); out=collections.Counter(); ran=0
    for m in METRICS:
        s=daily.get((uid,m),{}); vals=[s.get(d) for d in hd]
        if any(v is None for v in vals) or len(vals)<31: continue
        ran+=1
        dS=np.diff(np.array(vals,dtype=float)); n=min(len(dR),len(dS))
        p1=minp(dS[:n],dR[:n]); p2=minp(dR[:n],dS[:n])
        out["LEADS" if p1<.05<=p2 else "follows" if p2<.05<=p1 else "both" if p1<.05 else "neither"]+=1
    return ran,out

print("\n=== C. how many of the advertised 144 tests actually run? ===")
tot=0
for uid,name,j0 in EVENTS:
    r=run_cut(uid,j0,homebad)
    print(f"  {name:20s} {j0}  metrics with a complete 57-day window: {r[0] if r else 'window too short'}/10")
    tot+=r[0] if r else 0
print(f"  -> {tot} metric-events x 2 directions = {2*tot} tests actually run, not 144.")

print("\n=== C. placebo: theirs (+/-60,90) vs mine (random cuts, matched on decline stage) ===")
import json
ev=json.load(open(os.path.join(OUT,"pullbacks.json")))
real={(u,j0) for u,_,j0 in EVENTS}
def summarise(cuts,H,label):
    L=B=0; n=0; ran=0
    for uid,c in cuts:
        r=run_cut(uid,c,H)
        if not r: continue
        n+=1; ran+=r[0]; L+=r[1]["LEADS"]; B+=r[1]["both"]
    print(f"  {label:44s} windows {n:3d}  tests {ran:4d}  LEADS/window {L/max(n,1):.2f}  both/window {B/max(n,1):.2f}")
    return L,n,ran
summarise([(u,j) for u,_,j in EVENTS],homebad,"REAL events (as published)")
theirs=[]
for uid,name,j0 in EVENTS:
    d0=datetime.date.fromisoformat(j0)
    for off in (-90,-60,60,90):
        f=(d0+datetime.timedelta(days=off)).isoformat()
        if any(abs((datetime.date.fromisoformat(f)-datetime.date.fromisoformat(r)).days)<30
               for u2,r in real if u2==uid): continue
        theirs.append((uid,f))
summarise(theirs,homebad,"PLACEBO as published (+/-60,90)")
# mine: every date in the game's span >=30d from ANY detected pullback at ANY setting
random.seed(3); mine=[]
for uid,name,j0 in EVENTS:
    bad=set()
    for k,v in (ev.get(uid,{}) or {}).items():
        if "|" not in str(k): continue
        for e in v:
            d=datetime.date.fromisoformat(e["j0"])
            for o in range(-30,31): bad.add((d+datetime.timedelta(days=o)).isoformat())
    ds=sorted(d for d in homebad[uid] if homebad[uid][d]>0)
    cand=[d for d in ds[40:-40] if d not in bad]
    mine += [(uid,c) for c in random.sample(cand,min(8,len(cand)))]
summarise(mine,homebad,"PLACEBO mine (random quiet cuts, >=30d from ANY event)")
