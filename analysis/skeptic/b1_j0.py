"""B1 - rebuild Home reach correctly and see whether J0 moves."""
import csv, os, collections, datetime, statistics, json
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT  = os.path.join(ROOT,"analysis","panel")
DAY="METRIC_GRANULARITY_ONE_DAY"
GAMES = {"8507699752":"Poison Treats","9963622286":"Become a Brainrot","9610561918":"My Knife Farm",
"7364907416":"Plane Training","10030829154":"Climb Waterslide","10399712766":"+1 Banana Monkey",
"9758414065":"Climb Up Mountain","10565445771":"Verity Companion","8669915245":"Don't Wake Police",
"10638354731":"Seal A Driveway","10192528661":"KameHameHa Walls","7888930431":"Moon Incremental"}

def reach_current(uid):
    """exactly what pullback.home_reach() does, off by_source.csv"""
    out={}
    for r in csv.DictReader(open(os.path.join(OUT,"by_source.csv"),encoding="utf-8")):
        if r["universe"]!=uid or r["metric"]!="UniqueUsersWithImpressions": continue
        if r["source"]!="HomeRecommendation": continue
        out[r["date"]]=float(r["value"])
    return out

def reach_fixed(uid):
    """ONLY the unfiltered AcquisitionSource: HomeRecommendation breakdown"""
    out={}
    f=os.path.join(ROOT,"data","games",uid,"metrics","UniqueUsersWithImpressions.csv")
    if not os.path.exists(f): return out
    for r in csv.DictReader(open(f,encoding="utf-8")):
        if r["granularity"]!=DAY or r.get("value") in (None,""): continue
        if str(r.get("partial","")).lower() in ("true","1"): continue
        if r["series"]!="AcquisitionSource: HomeRecommendation": continue
        out[r["date"]]=float(r["value"])
    return out

def ma(seq,n=3):
    return [statistics.mean(seq[max(0,i-n+1):i+1]) if i>=n-1 else float("nan") for i in range(len(seq))]

def detect(dates,vals,thresh,hold):
    m=ma(vals); events=[]; i=0; n=len(vals)
    while i<n:
        seg=[x for x in m[i:] if x==x]
        if not seg: break
        peak=max(seg); pk=i+m[i:].index(peak); j0=None
        for k in range(pk,n-hold+1):
            if all(m[k+h]==m[k+h] and m[k+h]<thresh*peak for h in range(hold)):
                j0=k; break
        if j0 is None: break
        events.append({"peak_date":dates[pk],"peak":peak,"j0":dates[j0],
                       "drop_pct":100*(m[j0]/peak-1)})
        nxt=None
        for k in range(j0+hold,n):
            if m[k]==m[k] and m[k]>=thresh*peak: nxt=k; break
        if nxt is None: break
        i=nxt
    return events

print("=== B1a. J0 at 0.70/3: current (contaminated) vs fixed (all-Home) ===")
print(f"{'game':20s}{'current J0s':>34s}{'fixed J0s':>34s}")
moved=[]
for uid,name in GAMES.items():
    cur=reach_current(uid); fix=reach_fixed(uid)
    def run(s):
        ds=sorted(d for d in s if s[d]>0)
        if len(ds)<21: return None,ds
        return detect(ds,[s[d] for d in ds],0.70,3),ds
    ec,dc=run(cur); ef,df=run(fix)
    sc=",".join(e["j0"] for e in ec) if ec else ("n/a" if ec is None else "none")
    sf=",".join(e["j0"] for e in ef) if ef else ("n/a" if ef is None else "none")
    print(f"{name:20s}{sc:>34s}{sf:>34s}")
    if sc!=sf: moved.append(name)
print(f"\ngames whose J0 set CHANGES when the population bug is fixed: {len(moved)}/12  {moved}")

print("\n=== B1b. does the reach series switch population mid-stream? ===")
print(f"{'game':20s}{'n dates':>8s}{'first date w/ new-slice':>26s}{'ratio before/after':>20s}")
for uid,name in GAMES.items():
    f=os.path.join(ROOT,"data","games",uid,"metrics","UniqueUsersWithImpressions.csv")
    allu={};new={}
    for r in csv.DictReader(open(f,encoding="utf-8")):
        if r["granularity"]!=DAY or r.get("value") in (None,""): continue
        s=r["series"]; d=r["date"]
        if s=="AcquisitionSource: HomeRecommendation": allu[d]=float(r["value"])
        elif s.startswith("AcquisitionSource: HomeRecommendation \u00b7 "): new[d]=float(r["value"])
    ds=sorted(allu)
    firstnew=min(new) if new else None
    pre=[d for d in ds if firstnew and d<firstnew]
    print(f"{name:20s}{len(ds):>8d}{str(firstnew):>26s}"
          f"{(str(len(pre))+' pure-all days'):>20s}")

print("\n=== B1c. gaps and zero-days dropped by `if s[d] > 0` ===")
print(f"{'game':20s}{'span days':>10s}{'dates held':>11s}{'calendar gaps':>14s}{'zero days dropped':>19s}")
for uid,name in GAMES.items():
    s=reach_fixed(uid)
    if not s: continue
    ds=sorted(s)
    span=(datetime.date.fromisoformat(ds[-1])-datetime.date.fromisoformat(ds[0])).days+1
    pos=sorted(d for d in s if s[d]>0)
    zeros=len(ds)-len(pos)
    # gaps in the >0 series
    gaps=0
    for a,b in zip(pos,pos[1:]):
        gaps += (datetime.date.fromisoformat(b)-datetime.date.fromisoformat(a)).days-1
    print(f"{name:20s}{span:>10d}{len(ds):>11d}{gaps:>14d}{zeros:>19d}")
