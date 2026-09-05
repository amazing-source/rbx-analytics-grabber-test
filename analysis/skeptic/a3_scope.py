"""A3 - how far does the last-write-wins contamination reach, per game?"""
import csv, glob, os, collections
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DAY="METRIC_GRANULARITY_ONE_DAY"
GAMES = {"8507699752":"Poison Treats","9963622286":"Become a Brainrot","9610561918":"My Knife Farm",
"7364907416":"Plane Training","10030829154":"Climb Waterslide","10399712766":"+1 Banana Monkey",
"9758414065":"Climb Up Mountain","10565445771":"Verity Companion","8669915245":"Don't Wake Police",
"10638354731":"Seal A Driveway","10192528661":"KameHameHa Walls","7888930431":"Moon Incremental"}

print("=== 1. daily.csv DailyActiveUsers: which series actually won, per game ===")
print(f"{'game':20s}{'winning series':26s}{'days':>6s}{'median won/Total':>18s}")
for uid,name in GAMES.items():
    f=os.path.join(ROOT,"data","games",uid,"metrics","DailyActiveUsers.csv")
    if not os.path.exists(f): continue
    won={}; tot={}
    for r in csv.DictReader(open(f,encoding="utf-8")):
        if r["granularity"]!=DAY or r.get("value") in (None,""): continue
        if str(r.get("partial","")).lower() in ("true","1"): continue
        s=r["series"]
        if s=="Total" or s.startswith("Place="):
            tot[r["date"]]=float(r["value"])
        if s=="Total" or (("=" in s) and (":" not in s.split(" \u00b7 ")[0])):
            won[r["date"]]=(s,float(r["value"]))
    ws=collections.Counter(v[0] for v in won.values())
    ratios=sorted(won[d][1]/tot[d] for d in won if d in tot and tot[d])
    med=ratios[len(ratios)//2] if ratios else float("nan")
    print(f"{name:20s}{ws.most_common(1)[0][0][:25]:26s}{len(won):>6d}{med:>18.3f}")

print("\n=== 2. by_source Home reach: is the IsNewUser=New slice winning? ===")
print(f"{'game':20s}{'#dates':>8s}{'dates w/ 2 rows':>17s}{'median new/all':>16s}{'winner':>12s}")
for uid,name in GAMES.items():
    f=os.path.join(ROOT,"data","games",uid,"metrics","UniqueUsersWithImpressions.csv")
    if not os.path.exists(f):
        print(f"{name:20s}{'no file':>8s}"); continue
    allu={}; new={}; order={}
    for r in csv.DictReader(open(f,encoding="utf-8")):
        if r["granularity"]!=DAY or r.get("value") in (None,""): continue
        if str(r.get("partial","")).lower() in ("true","1"): continue
        s=r["series"]; d=r["date"]
        if s=="AcquisitionSource: HomeRecommendation": allu[d]=float(r["value"])
        elif s.startswith("AcquisitionSource: HomeRecommendation \u00b7 "):
            new[d]=float(r["value"])
        if s.startswith("AcquisitionSource: HomeRecommendation"):
            order[d]=s
    both=[d for d in allu if d in new and allu[d]]
    rs=sorted(new[d]/allu[d] for d in both)
    med=rs[len(rs)//2] if rs else float("nan")
    win = "NEW-slice" if both and order.get(both[-1],"")!="AcquisitionSource: HomeRecommendation" else "all"
    print(f"{name:20s}{len(allu):>8d}{len(both):>17d}{med:>16.3f}{win:>12s}")
