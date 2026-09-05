import sys, os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from stats import *
print("PLACEBO TEST — same step model at FAKE cut dates where no deploy happened.")
print("If placebo cuts are 'significant' too, the model is fitting curvature, not the update.\n")
CUTS = ['2026-08-24','2026-08-25','2026-08-26','2026-08-27','2026-08-28*','2026-08-29','2026-08-30']
for m in ['AverageRevenuePerPayingUser','AveragePlayTimeMinutesPerDAU','DailyActiveUsers']:
    log = (m=='DailyActiveUsers')
    df = daily(m)
    print(f"\n### {m}  (* = the real 2026-08-28 deploy)")
    hdr = "  game        " + "".join(f"{c:>16s}" for c in CUTS); print(hdr)
    for g in GAMES:
        if g not in df.columns: continue
        cells=[]
        for c in CUTS:
            r = step_test(df[g], c.rstrip('*'), log=log)
            if not r: cells.append("      —"); continue
            star = "*" if r['p']<0.05 else " "
            eff = (np.exp(r['step'])-1)*100 if log else r['step']
            cells.append(f"{eff:>+10.3g}{star}p{r['p']:.2f}")
        print(f"  {g:12s}" + "".join(f"{c:>16s}" for c in cells))
print("\n( * marks p<0.05 )")
