"""Build the canonical panel: ONE daily row per game.

Aggregate (unbroken-down) metrics go in the wide daily table. Source-, device-
and step-specific series are kept SEPARATE, in long tables, exactly as briefed —
mixing them is how a breakdown slice becomes the headline (D1).

Outputs (analysis/panel/):
  daily.csv        game x date x <aggregate metrics>      one row per game-day
  by_source.csv    game x date x AcquisitionSource x metric x value
  by_platform.csv  game x date x Platform x metric x value
  funnel.csv       game x date x FunnelName x FunnelStep x metric x value
  coverage.csv     game x metric x first x last x n_days   (what is actually in daily)

Rules enforced here, all of them load-bearing:
  * granularity column MUST be filtered — one file mixes ONE_MINUTE / HALF_HOUR /
    ONE_DAY on the same date, and ignoring it lets a half-hour bucket overwrite a
    daily value (documented false "87% disagreement" on PeakConcurrentPlayers).
  * the headline is the series with an EMPTY breakdown; a bare Place filter still
    counts as total (the whole Performance tab is Place-scoped), a population
    filter (IsNewUser, AcquisitionSource) does not. Never series[0].
  * partial points are excluded from the daily table entirely.
  * FILLED_ZERO is KEPT but flagged, so a gap-fill can be excluded from rate work
    without silently vanishing from volume work.
  * *.daily.csv roll-ups are skipped (F13, known-wrong).
"""
import csv, glob, os, collections, datetime, json, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "analysis", "panel")
os.makedirs(OUT, exist_ok=True)
DAY = "METRIC_GRANULARITY_ONE_DAY"

GAMES = {
    "8507699752": "Poison Treats", "9963622286": "Become a Brainrot",
    "9610561918": "My Knife Farm", "7364907416": "Plane Training",
    "10030829154": "Climb Waterslide", "10399712766": "+1 Banana Monkey",
    "9758414065": "Climb Up Mountain", "10565445771": "Verity Companion",
    "8669915245": "Don't Wake Police", "10638354731": "Seal A Driveway",
    "10192528661": "KameHameHa Walls", "7888930431": "Moon Incremental",
}

def parse_series(s):
    """-> (breakdown_dim, breakdown_value, filters_string)

    A series name is `[<Dim>: <value>][ · <filters>]`. The trap: a series whose
    name is ONLY a filter — `IsNewUser=Returning`, `AcquisitionSource=Home…` —
    has no " · " at all, so splitting on it puts the filter in `headpart` and
    leaves `filt` empty. The earlier version then short-circuited on `not filt`
    and declared a population slice to be the headline total. Because the daily
    table is last-write-wins, that made DailyActiveUsers the IsNewUser=Returning
    slice on every game-day. Anything with `=` and no `: ` is a filter.
    """
    s = s or ""
    parts = s.split(" · ")
    head, rest = parts[0], " · ".join(parts[1:])
    if head == "Total" or not head:
        return (None, None, rest)
    m = re.match(r"^([A-Za-z0-9]+): (.*)$", head)
    if m:
        return (m.group(1), m.group(2), rest)
    # No "Dim: value" — the head is itself a filter expression.
    return (None, None, " · ".join(p for p in (head, rest) if p))

def is_headline(dim, filt):
    """Empty breakdown, and no POPULATION filter. Place-scoping is still total."""
    if dim is not None:
        return False
    if not filt:
        return True
    for token in re.findall(r"([A-Za-z0-9]+)=", filt):
        if token != "Place":
            return False
    return True

daily = collections.defaultdict(dict)      # (game, date) -> {metric: value}
flags = collections.defaultdict(set)       # (game, date) -> {metrics that were FILLED_ZERO}
by_source, by_platform, funnel = [], [], []

for uid, name in GAMES.items():
    for f in sorted(glob.glob(os.path.join(ROOT, "data", "games", uid, "metrics", "*.csv"))):
        base = os.path.basename(f)
        if base.endswith(".daily.csv"):
            continue
        metric = base[:-4]
        with open(f, encoding="utf-8") as fh:
            for r in csv.DictReader(fh):
                if r.get("granularity") != DAY:
                    continue
                v = r.get("value")
                if v in (None, ""):
                    continue
                if str(r.get("partial", "")).lower() in ("true", "1"):
                    continue
                d = r.get("date")
                if not d:
                    continue
                try:
                    val = float(v)
                except ValueError:
                    continue
                dim, dval, filt = parse_series(r.get("series", ""))
                if is_headline(dim, filt):
                    daily[(uid, d)][metric] = val
                    if r.get("status") == "FILLED_ZERO":
                        flags[(uid, d)].add(metric)
                elif dim == "AcquisitionSource":
                    # `filt` MUST travel: `AcquisitionSource: HomeRecommendation`
                    # and the same broken down under `IsNewUser=New` are different
                    # series, and without the filter column they collide on
                    # (game, date, source, metric) and silently double the rows.
                    by_source.append((uid, name, d, dval, filt, metric, val))
                elif dim == "Platform":
                    by_platform.append((uid, name, d, dval, filt, metric, val))
                elif dim in ("FunnelStep", "FunnelName"):
                    fn = re.search(r"FunnelName=([^,]+)", filt)
                    funnel.append((uid, name, d, fn.group(1) if fn else "", dval or "", metric, val))

metrics = sorted({m for v in daily.values() for m in v})
rows = sorted(daily)
with open(os.path.join(OUT, "daily.csv"), "w", newline="", encoding="utf-8") as fh:
    w = csv.writer(fh)
    w.writerow(["universe", "game", "date", "filled_zero_metrics"] + metrics)
    for (uid, d) in rows:
        rec = daily[(uid, d)]
        w.writerow([uid, GAMES[uid], d, "|".join(sorted(flags[(uid, d)]))] +
                   ["" if m not in rec else rec[m] for m in metrics])

def dump(path, header, data):
    with open(os.path.join(OUT, path), "w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh); w.writerow(header); w.writerows(data)

dump("by_source.csv", ["universe","game","date","source","filters","metric","value"], by_source)
dump("by_platform.csv", ["universe","game","date","platform","filters","metric","value"], by_platform)
dump("funnel.csv", ["universe","game","date","funnel","step","metric","value"], funnel)

cov = []
for uid in GAMES:
    per = collections.defaultdict(list)
    for (u, d), rec in daily.items():
        if u != uid: continue
        for m in rec: per[m].append(d)
    for m, ds in sorted(per.items()):
        cov.append([uid, GAMES[uid], m, min(ds), max(ds), len(set(ds))])
dump("coverage.csv", ["universe","game","metric","first","last","n_days"], cov)

print(f"daily.csv       {len(rows):5d} game-days x {len(metrics)} aggregate metrics")
print(f"by_source.csv   {len(by_source):6d} rows")
print(f"by_platform.csv {len(by_platform):6d} rows")
print(f"funnel.csv      {len(funnel):6d} rows")
print(f"coverage.csv    {len(cov):5d} game-metric rows")
spans = collections.Counter(uid for uid, _ in rows)
print("\ngame-days per game:")
for uid, n in spans.most_common():
    ds = sorted(d for u, d in rows if u == uid)
    print(f"  {GAMES[uid]:20s} {n:4d}  {ds[0]} -> {ds[-1]}")
