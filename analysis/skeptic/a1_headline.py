"""A1 - does is_headline() actually identify the unbroken-down series?"""
import csv, glob, os, collections, re, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from panel import parse_series, is_headline, GAMES, DAY

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 1. every distinct series string in the corpus, and how panel.py classifies it
cls = collections.Counter()
examples = collections.defaultdict(set)
for uid in GAMES:
    for f in glob.glob(os.path.join(ROOT,"data","games",uid,"metrics","*.csv")):
        if f.endswith(".daily.csv"): continue
        with open(f, encoding="utf-8") as fh:
            for r in csv.DictReader(fh):
                if r.get("granularity") != DAY: continue
                s = r.get("series","")
                dim, dval, filt = parse_series(s)
                h = is_headline(dim, filt)
                cls[(h, s)] += 1

print("=== SERIES STRINGS CLASSIFIED AS HEADLINE (is_headline -> True) ===")
head = sorted([ (s,n) for (h,s),n in cls.items() if h ], key=lambda x:-x[1])
for s,n in head:
    bad = ("=" in s) or (":" in s)
    print(f"{'  <-- SUSPECT' if bad else '            '} {n:7d}  {s!r}")
print(f"\ntotal distinct series treated as headline: {len(head)}")
