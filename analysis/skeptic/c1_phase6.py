"""C1 - attack Phase 6: a stronger null, and the August fortnight's reference set."""
import csv, os, collections, datetime, itertools, json, random
import numpy as np
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT=os.path.join(ROOT,"analysis","panel"); DAY="METRIC_GRANULARITY_ONE_DAY"
GAMES={"8507699752":"Poison Treats","9963622286":"Become a Brainrot","9610561918":"My Knife Farm",
"7364907416":"Plane Training","10030829154":"Climb Waterslide","10399712766":"+1 Banana Monkey",
"9758414065":"Climb Up Mountain","10565445771":"Verity Companion","8669915245":"Don't Wake Police",
"10638354731":"Seal A Driveway","10192528661":"KameHameHa Walls","7888930431":"Moon Incremental"}

def reach(uid, fixed):
    out={}
    if fixed:
        f=os.path.join(ROOT,"data","games",uid,"metrics","UniqueUsersWithImpressions.csv")
        for r in csv.DictReader(open(f,encoding="utf-8")):
            if r["granularity"]!=DAY or r.get("value") in (None,""): continue
            if r["series"]!="AcquisitionSource: HomeRecommendation": continue
            if float(r["value"])>0: out[r["date"]]=float(r["value"])
    else:
        for r in csv.DictReader(open(os.path.join(OUT,"by_source.csv"),encoding="utf-8")):
            if r["universe"]!=uid or r["metric"]!="UniqueUsersWithImpressions": continue
            if r["source"]!="HomeRecommendation": continue
            if float(r["value"])>0: out[r["date"]]=float(r["value"])
    return out

def residuals(s):
    ds=sorted(s)
    if len(ds)<40: return {}
    y=np.log([s[d] for d in ds]); t=np.arange(len(ds),dtype=float)
    dow=np.array([datetime.date.fromisoformat(d).weekday() for d in ds])
    X=np.column_stack([np.ones(len(ds)),t]+[(dow==k).astype(float) for k in range(1,7)])
    b,*_=np.linalg.lstsq(X,y,rcond=None)
    return dict(zip(ds,y-X@b))

def align(res, anchors):
    out={}
    for u,pk in anchors.items():
        if u not in res: continue
        out[u]={ (datetime.date.fromisoformat(d)-pk).days:v
                 for d,v in res[u].items()
                 if -60<=(datetime.date.fromisoformat(d)-pk).days<=60 }
    return out

def meanr(al):
    rs=[]
    for a,b in itertools.combinations(sorted(al),2):
        c=sorted(set(al[a])&set(al[b]))
        if len(c)<45: continue
        x=np.array([al[a][k] for k in c]); y=np.array([al[b][k] for k in c])
        if x.std()==0 or y.std()==0: continue
        rs.append(float(np.corrcoef(x,y)[0,1]))
    return (float(np.mean(rs)) if rs else float("nan")), len(rs)

for tag,fixed in (("as committed (contaminated reach)",False),("with the population bug fixed",True)):
    res={u:residuals(reach(u,fixed)) for u in GAMES}
    res={u:v for u,v in res.items() if v}
    ev=json.load(open(os.path.join(OUT,"pullbacks.json")))
    anchors={}
    for u in res:
        e=(ev.get(u,{}) or {}).get("0.7|3") or []
        if e: anchors[u]=datetime.date.fromisoformat(e[0]["peak_date"])
    obs,npair=meanr(align(res,anchors))
    print(f"\n### {tag}: {len(res)} games, lifecycle mean r = {obs:+.3f} over {npair} pairs")

    # NULL 1 (theirs): permute which game's PEAK each game is aligned to
    random.seed(7); keys=sorted(anchors); n1=[]
    for _ in range(400):
        perm=keys[:]; random.shuffle(perm)
        a={u:anchors[d] for u,d in zip(keys,perm) if d!=u}
        m,_=meanr(align(res,a))
        if m==m: n1.append(m)
    # NULL 2 (mine): anchor each game on a RANDOM date inside its own span,
    # >=60d from either edge, so window length and autocorrelation are preserved
    random.seed(11); n2=[]
    spans={u:sorted(res[u]) for u in anchors}
    for _ in range(400):
        a={}
        for u in keys:
            ds=spans[u]
            lo,hi=60,len(ds)-61
            if hi<=lo:  a[u]=datetime.date.fromisoformat(ds[len(ds)//2])
            else:       a[u]=datetime.date.fromisoformat(ds[random.randint(lo,hi)])
        m,_=meanr(align(res,a))
        if m==m: n2.append(m)
    for nm,n in (("peak-shuffle (theirs)",n1),("random-anchor (mine)",n2)):
        p=sum(1 for m in n if m>=obs)/len(n)
        print(f"   {nm:24s} mean {np.mean(n):+.3f}  p95 {np.percentile(n,95):+.3f}  p = {p:.3f}")

# ---------------- August fortnight
print("\n\n### the 2026-08-12..08-24 fortnight")
res={u:residuals(reach(u,False)) for u in GAMES}; res={u:v for u,v in res.items() if v}
bydate=collections.defaultdict(list)
for u,s in res.items():
    sd=np.std(list(s.values())) or 1.0
    for d,v in s.items(): bydate[d].append(v/sd)
full=sorted((d,float(np.mean(v))) for d,v in bydate.items() if len(v)>=9)
ms=np.array([m for _,m in full]); dates=[d for d,_ in full]
aug=[m for d,m in full if "2026-08-12"<=d<="2026-08-24"]
augm=float(np.mean(aug))
print(f"reference set: {len(full)} days, {dates[0]} -> {dates[-1]}")
print(f"published test: z = (fortnight mean - daily mean)/DAILY sd = "
      f"({augm:+.3f} - {ms.mean():+.3f})/{ms.std():.3f} = {(augm-ms.mean())/ms.std():+.2f}")
# correct reference: the distribution of 13-day BLOCK means in the same set
blocks=[float(ms[i:i+13].mean()) for i in range(len(ms)-12)]
b=np.array(blocks)
print(f"correct reference: {len(blocks)} overlapping 13-day block means, "
      f"mean {b.mean():+.3f} sd {b.std():.3f}")
print(f"   -> the fortnight's rank among them: {sorted(blocks).index(min(blocks,key=lambda x:abs(x-augm)))+1} of {len(blocks)} (1 = worst)")
print(f"   -> empirical p (blocks this bad or worse) = {sum(1 for x in blocks if x<=augm)/len(blocks):.3f}")
print(f"   -> z against BLOCK sd = {(augm-b.mean())/b.std():+.2f}")
print(f"\nworst five 13-day blocks in the reference set:")
for i in np.argsort(b)[:5]:
    print(f"   {dates[i]} .. {dates[i+12]}   {b[i]:+.3f}")
