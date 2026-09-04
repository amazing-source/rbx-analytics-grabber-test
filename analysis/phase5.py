"""Phase 5 — funnels: where do new players actually stop?

Discipline, set before looking (and after being corrected on it once):
  * A step's LEVEL is not a finding. 40% completion means nothing without a
    baseline it moved from. Funnels LOCALISE a churn detected elsewhere; they
    do not lead a diagnosis.
  * So every step is reported as a CHANGE against its own earlier baseline, and
    a step is only interesting if it moved more than its own day-to-day noise.
  * Steps are ordered by completion rate descending, which reconstructs the
    sequence without hardcoding names that differ per game.

`FunnelCohortCompletionRate` is the share of the entering cohort reaching that
step, so the biggest DROP between consecutive steps is where players are lost.
"""
import csv, os, collections, statistics

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "analysis", "panel")
METRIC = "FunnelCohortCompletionRate"

rows = collections.defaultdict(lambda: collections.defaultdict(dict))  # game -> step -> date -> v
funnel_of = {}
for r in csv.DictReader(open(os.path.join(OUT, "funnel.csv"), encoding="utf-8")):
    if r["metric"] != METRIC or not r["step"]:
        continue
    # a compound funnel name is the filter list, not one funnel — skip those
    if "/" in (r["funnel"] or ""):
        continue
    key = (r["game"], r["funnel"], r["step"])
    rows[(r["game"], r["funnel"])][r["step"]][r["date"]] = float(r["value"])

print("PHASE 5 — funnel steps that MOVED, not steps that are low\n")
for (game, fname), steps in sorted(rows.items()):
    alldates = sorted({d for s in steps.values() for d in s})
    if len(alldates) < 14 or len(steps) < 3:
        continue
    split = len(alldates) // 2
    base_w, late_w = alldates[:split], alldates[split:]
    out = []
    for step, series in steps.items():
        b = [series[d] for d in base_w if d in series]
        a = [series[d] for d in late_w if d in series]
        if len(b) < 5 or len(a) < 5:
            continue
        mb, ma = statistics.mean(b), statistics.mean(a)
        sd = statistics.pstdev(b) or 1e-9
        out.append((mb, ma, (ma - mb) / sd, step))
    if len(out) < 3:
        continue
    out.sort(reverse=True)          # completion desc == funnel order
    print(f"=== {game} — funnel '{fname}' — {len(alldates)} days "
          f"({alldates[0]} -> {alldates[-1]}) ===")
    print(f"   baseline {base_w[0]}..{base_w[-1]}   vs   later {late_w[0]}..{late_w[-1]}")
    print(f"   {'step':34s}{'base':>9s}{'later':>9s}{'z':>8s}{'drop from prev':>16s}")
    prev = None
    for mb, ma, z, step in out:
        drop = "" if prev is None else f"{100*(mb-prev)/prev:+.1f}%"
        flag = "  <-- MOVED" if abs(z) > 2 else ""
        print(f"   {step[:33]:34s}{mb:>9.4f}{ma:>9.4f}{z:>+8.1f}{drop:>16s}{flag}")
        prev = mb
    # biggest structural loss between consecutive steps, on the baseline
    worst, wi = 0.0, None
    for i in range(1, len(out)):
        d = (out[i][0] - out[i-1][0]) / (out[i-1][0] or 1e-9)
        if d < worst:
            worst, wi = d, i
    if wi is not None:
        print(f"   >> biggest single drop: {out[wi-1][3][:30]} -> {out[wi][3][:30]}"
              f"  ({100*worst:+.1f}% of the cohort)")
    print()
