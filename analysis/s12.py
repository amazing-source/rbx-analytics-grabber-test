import sys, os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from stats import *
RATES = {'ForwardD1Retention':'', 'AverageSessionLengthMinutes':' min',
         'AveragePlayTimeMinutesPerDAU':' min','AverageRevenuePerUser':' R$',
         'AverageRevenuePerPayingUser':' R$','PayingUsersCVR':'','EndToEndCVR':''}
CASES = [("Waterslide","2026-08-28","v1715/1716 published 2026-08-28 20:49Z"),
         ("Verity","2026-08-28","v678/679 published 2026-08-28 19:24Z"),
         ("Seal","2026-08-28","v908 published 2026-08-28 21:36Z"),
         ("Brainrot","2026-08-28","v606/607 published 2026-08-28 15:14Z")]
print("="*118)
print("PRE/POST UPDATE TESTS — trend-adjusted level step (y ~ intercept + time + post_dummy)")
print("A plain before/after mean comparison would credit the update with the decline already in progress; the")
print("time term absorbs that, so 'step' is the JUMP AT THE DEPLOY over and above the existing slope.")
print("="*118)
for g, cut, lab in CASES:
    print(f"\n## {g} — {lab}")
    for m,u in RATES.items():
        df = daily(m)
        if g not in df.columns: continue
        report(m, df[g], cut, log=False, unit=u)
    print("  -- volumes (log scale, so step reads as %) --")
    for m in ['DailyActiveUsers','DailyRevenue','PayingUsers']:
        df = daily(m)
        if g in df.columns: report(m, df[g], cut, log=True)
