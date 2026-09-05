"""B2 - the zero-drop and the index-vs-calendar assumption in ma()."""
import csv, os, datetime, statistics, collections
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DAY="METRIC_GRANULARITY_ONE_DAY"
GAMES = {"8507699752":"Poison Treats","9963622286":"Become a Brainrot","9610561918":"My Knife Farm",
"7364907416":"Plane Training","10030829154":"Climb Waterslide","10399712766":"+1 Banana Monkey",
"9758414065":"Climb Up Mountain","10565445771":"Verity Companion","8669915245":"Don't Wake Police",
"10638354731":"Seal A Driveway","10192528661":"KameHameHa Walls","7888930431":"Moon Incremental"}

def rows(uid):
    f=os.path.join(ROOT,"data","games",uid,"metrics","UniqueUsersWithImpressions.csv")
    out={}
    for r in csv.DictReader(open(f,encoding="utf-8")):
        if r["granularity"]!=DAY or r.get("value") in (None,""): continue
        if r["series"]!="AcquisitionSource: HomeRecommendation": continue
        out[r["date"]]=(float(r["value"]), r.get("status",""))
    return out

print("=== status of the zero days that `if s[d] > 0` throws away ===")
print(f"{'game':20s}{'zeros':>7s}{'FILLED_ZERO':>13s}{'real 0':>8s}{'longest dropped run':>21s}{'when':>13s}")
for uid,name in GAMES.items():
    R=rows(uid); ds=sorted(R)
    z=[d for d in ds if R[d][0]<=0]
    fz=sum(1 for d in z if R[d][1]=="FILLED_ZERO")
    best=(0,"")
    run=0; start=None
    for d in ds:
        if R[d][0]<=0:
            run+=1; start=start or d
            if run>best[0]: best=(run,start)
        else:
            run=0; start=None
    print(f"{name:20s}{len(z):>7d}{fz:>13d}{len(z)-fz:>8d}{best[0]:>21d}{best[1]:>13s}")

print("\n=== the 3-day 'mean' is over INDEX positions, not calendar days ===")
print("After zero-dropping, how many calendar days does a 3-point window really span?")
print(f"{'game':20s}{'median span':>12s}{'p90':>6s}{'max':>6s}{'windows >5 cal days':>21s}")
for uid,name in GAMES.items():
    R=rows(uid)
    pos=sorted(d for d in R if R[d][0]>0)
    if len(pos)<21: continue
    spans=[]
    for i in range(2,len(pos)):
        a=datetime.date.fromisoformat(pos[i-2]); b=datetime.date.fromisoformat(pos[i])
        spans.append((b-a).days+1)
    spans.sort()
    over=sum(1 for s in spans if s>5)
    print(f"{name:20s}{spans[len(spans)//2]:>12d}{spans[int(.9*len(spans))]:>6d}{spans[-1]:>6d}"
          f"{(str(over)+f' of {len(spans)}'):>21s}")

print("\n=== weekday seasonality in Home reach: can a Monday alone trip 0.70? ===")
print("detrended by a centred 7-day mean, then weekday means as % of that")
print(f"{'game':20s}" + "".join(f"{d:>7s}" for d in ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]) + f"{'max/min':>10s}{'3d-MA wkday range':>20s}")
for uid,name in GAMES.items():
    R=rows(uid)
    pos=sorted(d for d in R if R[d][0]>0)
    if len(pos)<60: continue
    v={d:R[d][0] for d in pos}
    ratios=collections.defaultdict(list)
    for i in range(3,len(pos)-3):
        w=[v[pos[j]] for j in range(i-3,i+4)]
        base=statistics.mean(w)
        if base>0:
            ratios[datetime.date.fromisoformat(pos[i]).weekday()].append(v[pos[i]]/base)
    if len(ratios)<7: continue
    means=[statistics.mean(ratios[k]) for k in range(7)]
    # what a 3-day MA of a purely seasonal series would swing
    ma3=[statistics.mean([means[(k-j)%7] for j in range(3)]) for k in range(7)]
    print(f"{name:20s}" + "".join(f"{100*m:>7.1f}" for m in means) +
          f"{max(means)/min(means):>10.3f}{min(ma3)/max(ma3):>20.3f}")
