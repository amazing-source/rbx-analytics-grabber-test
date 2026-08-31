import csv, os
ROOT = "C:/Users/bfhdh/Downloads/rbx-analytics-grabber-test/data/games"
GAMES = {
 "10638354731": ("Seal A Driveway",       "2026-08-29T03:51"),
 "10565445771": ("Verity Companion",      "2026-08-28T19:53"),
 "10030829154": ("Waterslide",            "2026-08-28T21:02"),
 "9963622286":  ("Become a Brainrot",     "2026-08-28T15:21"),
}
def load(uid, metric, gran="METRIC_GRANULARITY_ONE_DAY", series="Total", keep_partial=False):
    """date -> (value, status, partial). Filters granularity (mandatory per CLAUDE.md)."""
    p = os.path.join(ROOT, uid, "metrics", metric + ".csv")
    if not os.path.exists(p): return {}
    out = {}
    with open(p, newline="", encoding="utf8") as f:
        for r in csv.DictReader(f):
            if r.get("granularity") != gran: continue
            if series is not None and r.get("series") != series: continue
            part = (r.get("partial") or "").strip().lower() in ("1","true","yes")
            if part and not keep_partial: continue
            try: v = float(r["value"])
            except (ValueError, KeyError, TypeError): continue
            out[r["date"]] = (v, r.get("status",""), part)
    return out
def vals(uid, metric, **kw):
    return {d:v[0] for d,v in load(uid, metric, **kw).items()}
def series_names(uid, metric, gran="METRIC_GRANULARITY_ONE_DAY"):
    p = os.path.join(ROOT, uid, "metrics", metric + ".csv")
    if not os.path.exists(p): return []
    s=set()
    with open(p, newline="", encoding="utf8") as f:
        for r in csv.DictReader(f):
            if r.get("granularity")==gran: s.add(r.get("series",""))
    return sorted(s)
def grans(uid, metric):
    p = os.path.join(ROOT, uid, "metrics", metric + ".csv")
    if not os.path.exists(p): return []
    s=set()
    with open(p, newline="", encoding="utf8") as f:
        for r in csv.DictReader(f): s.add(r.get("granularity",""))
    return sorted(s)

def headline(uid, metric, gran="METRIC_GRANULARITY_ONE_DAY"):
    """The unbroken-down series: 'Total', else a bare Place= filter (Place is
    the whole, per CLAUDE.md). Never series[0]."""
    names = series_names(uid, metric, gran)
    if "Total" in names: return "Total"
    bare = [s for s in names if s.startswith("Place=") and "·" not in s and ":" not in s]
    if bare: return sorted(bare, key=len)[-1]
    return None
