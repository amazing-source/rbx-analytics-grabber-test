"""Phase 0 — what do we actually have across the 12-game panel?

Answers the inventory questions before any modelling:
  metric coverage (all games / some games), granularity, maturation lag,
  publish timestamps, family coverage, unreliable technical ranges.

Reads data/games/<id>/metrics/*.csv only. MUST filter the `granularity`
column — one file holds ONE_MINUTE, HALF_HOUR and ONE_DAY rows keyed by the
same date, and ignoring it lets a half-hour bucket overwrite a daily value.
"""
import csv, glob, os, json, collections, datetime, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAMES = {
    "8507699752": "Poison Treats",
    "9963622286": "Become a Brainrot",
    "9610561918": "My Knife Farm",
    "7364907416": "Plane Training",
    "10030829154": "Climb Waterslide",
    "10399712766": "+1 Banana Monkey",
    "9758414065": "Climb Up Mountain",
    "10565445771": "Verity Companion",
    "8669915245": "Don't Wake Police",
    "10638354731": "Seal A Driveway",
    "10192528661": "KameHameHa Walls",
    "7888930431": "Moon Incremental",
}
DAY = "METRIC_GRANULARITY_ONE_DAY"


def metrics_dir(u):
    return os.path.join(ROOT, "data", "games", u, "metrics")


def scan(u):
    """metric -> {granularity -> (first, last, n_dates, n_rows, n_series)}"""
    out = {}
    for f in sorted(glob.glob(os.path.join(metrics_dir(u), "*.csv"))):
        base = os.path.basename(f)
        if base.endswith(".daily.csv"):
            continue  # F13: known-wrong roll-up
        m = base[:-4]
        per = collections.defaultdict(lambda: {"dates": set(), "rows": 0, "series": set()})
        try:
            with open(f, encoding="utf-8") as fh:
                for r in csv.DictReader(fh):
                    if r.get("value") in (None, ""):
                        continue
                    g = r.get("granularity", "")
                    p = per[g]
                    p["rows"] += 1
                    if r.get("date"):
                        p["dates"].add(r["date"])
                    p["series"].add(r.get("series", ""))
        except Exception as e:
            print(f"  !! {u}/{base}: {e}", file=sys.stderr)
            continue
        out[m] = {
            g: {
                "first": min(v["dates"]) if v["dates"] else None,
                "last": max(v["dates"]) if v["dates"] else None,
                "n": len(v["dates"]),
                "rows": v["rows"],
                "series": len(v["series"]),
            }
            for g, v in per.items()
        }
    return out


data = {u: scan(u) for u in GAMES}
json.dump(data, open(os.path.join(ROOT, "analysis", "audit_raw.json"), "w"), indent=0)

# ---------------------------------------------------------------- coverage
present = {u: {m for m, g in ms.items() if DAY in g and g[DAY]["n"] > 0} for u, ms in data.items()}
universal = set.intersection(*present.values()) if present else set()
anyof = set.union(*present.values()) if present else set()
partial = anyof - universal

print("=" * 78)
print("A. METRIC COVERAGE  (ONE_DAY rows with values)")
print("=" * 78)
print(f"metrics present on ALL 12 games : {len(universal)}")
print(f"metrics present on SOME games   : {len(partial)}")
print(f"distinct metrics anywhere       : {len(anyof)}")

print("\n-- universal (the panel's backbone) --")
for m in sorted(universal):
    print(f"   {m}")

print("\n-- partial: metric -> number of games that have it --")
cnt = collections.Counter()
for u, s in present.items():
    for m in s:
        cnt[m] += 1
for m, c in sorted(cnt.items(), key=lambda kv: (-kv[1], kv[0])):
    if m in partial:
        missing = [GAMES[u] for u in GAMES if m not in present[u]]
        print(f"   {c:2d}/12  {m:42s} missing: {', '.join(missing[:5])}{' …' if len(missing) > 5 else ''}")

# ------------------------------------------------------- B. granularity
print("\n" + "=" * 78)
print("B. TIME GRANULARITY  (which metrics exist below ONE_DAY, and how far back)")
print("=" * 78)
gran_counts = collections.Counter()
subdaily = collections.defaultdict(set)
for u, ms in data.items():
    for m, gs in ms.items():
        for g, v in gs.items():
            if v["n"]:
                gran_counts[g] += 1
                if g != DAY:
                    subdaily[g].add(m)
for g, c in gran_counts.most_common():
    print(f"   {g.replace('METRIC_GRANULARITY_',''):12s} {c:5d} game-metric series")
for g in sorted(subdaily):
    if g == DAY: continue
    print(f"\n   {g.replace('METRIC_GRANULARITY_','')} metrics: {', '.join(sorted(subdaily[g])[:12])}")
    ex = [(u, data[u][m][g]) for u in GAMES for m in subdaily[g] if m in data[u] and g in data[u][m]]
    if ex:
        spans = [e[1]["n"] for e in ex]
        print(f"      per-series date counts: min {min(spans)}  median {sorted(spans)[len(spans)//2]}  max {max(spans)}")

# ------------------------------------------------- C. technical horizon
print("\n" + "=" * 78)
print("C. TECHNICAL HISTORY — where the record is short and CANNOT be backfilled")
print("=" * 78)
TECH = ["ClientCrashCount","ClientCrashRate15m","OomUnexpectedExits","ServerCrashCount",
        "ClientFpsP10","ClientMemoryUsagePercentageAvg","CpuTimeAvg","ErrorCount"]
print(f"   {'game':20s}{'DAU from':>12s}{'tech from':>12s}{'errors from':>13s}{'blind days':>12s}")
for u, n in GAMES.items():
    dau = data[u].get("DailyActiveUsers", {}).get(DAY)
    tech = [data[u][m][DAY]["first"] for m in TECH if m in data[u] and DAY in data[u][m]
            and m != "ErrorCount" and data[u][m][DAY]["first"]]
    err = data[u].get("ErrorCount", {}).get(DAY, {}).get("first")
    t = min(tech) if tech else None
    blind = ""
    if dau and dau["first"] and t:
        blind = (datetime.date.fromisoformat(t) - datetime.date.fromisoformat(dau["first"])).days
    print(f"   {n:20s}{(dau['first'] if dau else '-'):>12s}{(t or '-'):>12s}{(err or '-'):>13s}{str(blind):>12s}")

# ------------------------------------------------- D. maturation lag
print("\n" + "=" * 78)
print("D. MATURATION LAG — how many days BEHIND the DAU frontier each metric stops")
print("=" * 78)
LAGGY = ["DailyActiveUsers","ForwardD1Retention","ForwardD7Retention","ForwardD30Retention",
         "RFYD1Playtime","RFYD2To7PlayDays","RFYD8To28PlayDays","AttributionD7RetentionRatio",
         "Attribution30DRobuxPerUser","DauMauStickiness"]
lags = collections.defaultdict(list)
for u in GAMES:
    dau = data[u].get("DailyActiveUsers", {}).get(DAY, {}).get("last")
    if not dau: continue
    for m in LAGGY:
        last = data[u].get(m, {}).get(DAY, {}).get("last")
        if last:
            lags[m].append((datetime.date.fromisoformat(dau) - datetime.date.fromisoformat(last)).days)
print(f"   {'metric':34s}{'min':>5s}{'median':>8s}{'max':>5s}   interpretation")
for m in LAGGY:
    v = sorted(lags[m])
    if not v: continue
    note = {0:"frontier"}.get(v[len(v)//2], f"~{v[len(v)//2]}d behind")
    print(f"   {m:34s}{v[0]:>5d}{v[len(v)//2]:>8d}{v[-1]:>5d}   {note}")

# --------------------------------------------- E. publish timestamps
print("\n" + "=" * 78)
print("E. PUBLISH / UPDATE TIMESTAMPS")
print("=" * 78)
print(f"   {'game':20s}{'placeVersions':>14s}{'published':>11s}{'first':>12s}{'last':>12s}{'feedback':>10s}")
for u, n in GAMES.items():
    pv = os.path.join(ROOT, "data", "games", u, "place-versions.csv")
    rows = []
    if os.path.exists(pv):
        rows = list(csv.DictReader(open(pv, encoding="utf-8")))
    pub = [r for r in rows if str(r.get("is_published","")).lower() in ("true","1")]
    ds = sorted(r.get("date","") for r in pub if r.get("date"))
    fb = os.path.join(ROOT, "data", "games", u, "feedback.csv")
    nfb = sum(1 for _ in open(fb, encoding="utf-8")) - 1 if os.path.exists(fb) else 0
    print(f"   {n:20s}{len(rows):>14d}{len(pub):>11d}{(ds[0] if ds else '-'):>12s}{(ds[-1] if ds else '-'):>12s}{nfb:>10d}")

# ------------------------------------------- F. breakdown families
print("\n" + "=" * 78)
print("F. BREAKDOWN FAMILIES — which dimensions we hold, per game")
print("=" * 78)
DIMS = ["Platform","AcquisitionSource","Country","AgeGroupV2","Gender","IsNewUser",
        "FunnelName","FunnelStep","RevenueSource","ProductType","PlaceVersion","LogSource",
        "CohortDay","SessionTimeBucket","MessageHash","CrashType"]
have = collections.defaultdict(set)
for u in GAMES:
    for f in glob.glob(os.path.join(metrics_dir(u), "*.csv")):
        if f.endswith(".daily.csv"): continue
        try:
            with open(f, encoding="utf-8") as fh:
                for r in csv.DictReader(fh):
                    s = r.get("series","")
                    if not r.get("value"): continue
                    for d in DIMS:
                        if d+":" in s or d+"=" in s: have[u].add(d)
        except Exception: pass
print(f"   {'dimension':20s}" + "".join(f"{GAMES[u][:6]:>8s}" for u in GAMES))
for d in DIMS:
    print(f"   {d:20s}" + "".join(f"{('yes' if d in have[u] else '-'):>8s}" for u in GAMES))

# ------------------------------------------- G. June 2026 break
print("\n" + "=" * 78)
print("G. PRE/POST 2026-06-15 DISCOVERY CHANGE — usable history each side")
print("=" * 78)
CUT = datetime.date(2026, 6, 15)
print(f"   {'game':20s}{'DAU pre':>9s}{'DAU post':>10s}{'RFY pre':>9s}{'RFY post':>10s}")
for u, n in GAMES.items():
    def sides(m):
        f = os.path.join(metrics_dir(u), m + ".csv")
        if not os.path.exists(f): return (0,0)
        pre=post=0
        seen=set()
        for r in csv.DictReader(open(f, encoding="utf-8")):
            if r.get("granularity")!=DAY or not r.get("value") or r.get("status")=="FILLED_ZERO": continue
            d=r.get("date")
            if not d or d in seen: continue
            seen.add(d)
            if datetime.date.fromisoformat(d) < CUT: pre+=1
            else: post+=1
        return (pre,post)
    a=sides("DailyActiveUsers"); b=sides("RFYPlayThroughRate")
    print(f"   {n:20s}{a[0]:>9d}{a[1]:>10d}{b[0]:>9d}{b[1]:>10d}")
