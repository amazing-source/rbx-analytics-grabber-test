"""A2 - measure the damage: which daily.csv cells were written by a population slice?"""
import csv, glob, os, collections, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DAY = "METRIC_GRANULARITY_ONE_DAY"
GAMES = {
    "8507699752": "Poison Treats", "9963622286": "Become a Brainrot",
    "9610561918": "My Knife Farm", "7364907416": "Plane Training",
    "10030829154": "Climb Waterslide", "10399712766": "+1 Banana Monkey",
    "9758414065": "Climb Up Mountain", "10565445771": "Verity Companion",
    "8669915245": "Don't Wake Police", "10638354731": "Seal A Driveway",
    "10192528661": "KameHameHa Walls", "7888930431": "Moon Incremental",
}
POP = ("IsNewUser=", "AcquisitionSource=")
import re
def parse_series(s):
    s = s or ""
    filt = s.split(" \u00b7 ", 1)[1] if " \u00b7 " in s else ""
    headpart = s.split(" \u00b7 ", 1)[0]
    if headpart == "Total" or not headpart:
        return (None, None, filt)
    m = re.match(r"^([A-Za-z0-9]+): (.*)$", headpart)
    return (m.group(1), m.group(2), filt) if m else (None, None, filt)
def is_headline(dim, filt):
    if dim is not None: return False
    if not filt: return True
    for token in re.findall(r"([A-Za-z0-9]+)=", filt):
        if token != "Place": return False
    return True

# replicate panel.py exactly, but also track the TRUE Total and who wrote last
last_writer = {}   # (uid,metric,date) -> series string that won
val_won     = {}
val_total   = {}
for uid in GAMES:
    for f in sorted(glob.glob(os.path.join(ROOT,"data","games",uid,"metrics","*.csv"))):
        if f.endswith(".daily.csv"): continue
        metric = os.path.basename(f)[:-4]
        with open(f, encoding="utf-8") as fh:
            for r in csv.DictReader(fh):
                if r.get("granularity") != DAY: continue
                v = r.get("value")
                if v in (None,""): continue
                if str(r.get("partial","")).lower() in ("true","1"): continue
                d = r.get("date")
                if not d: continue
                try: val = float(v)
                except ValueError: continue
                s = r.get("series","")
                dim, dval, filt = parse_series(s)
                if not is_headline(dim, filt): continue
                k = (uid, metric, d)
                last_writer[k] = s
                val_won[k] = val
                if s == "Total" or s.startswith("Place="):
                    val_total.setdefault(k, val)

conta = {k:v for k,v in last_writer.items() if any(p in v for p in POP)}
print(f"daily.csv aggregate cells written           : {len(last_writer):,}")
print(f"cells whose WINNING row is a population slice: {len(conta):,}  ({100*len(conta)/len(last_writer):.2f}%)")
print()
per_m = collections.Counter((k[1], last_writer[k].split('=')[0]) for k in conta)
print("contaminated cells by metric / offending filter dim:")
for (m,dimn),n in per_m.most_common(40):
    print(f"  {n:6d}  {m:38s} <- {dimn}=")
print()
per_g = collections.Counter(GAMES[k[0]] for k in conta)
print("by game:", dict(per_g))

# magnitude: where a real Total exists too, how wrong is the number?
print("\n--- cells where a genuine Total ALSO exists but lost the race ---")
bad = [(k, val_won[k], val_total[k]) for k in conta if k in val_total]
print(f"{len(bad):,} such cells")
byM = collections.defaultdict(list)
for k,w,t in bad:
    if t: byM[k[1]].append(w/t)
for m, ratios in sorted(byM.items(), key=lambda kv:-len(kv[1]))[:20]:
    ratios.sort()
    print(f"  {m:38s} n={len(ratios):5d}  written/true  median {ratios[len(ratios)//2]:.3f}  min {ratios[0]:.3f}  max {ratios[-1]:.3f}")
