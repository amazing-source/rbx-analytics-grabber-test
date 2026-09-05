import sys, os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from stats import *
# Change-point scan: for every candidate date, fit trend+step and record the step.
# The date with the largest significant step is the best evidence of a real break.
def scan(s, lo, hi, log=False, pre=14):
    s=s.dropna(); out=[]
    for d in pd.date_range(lo,hi):
        r=step_test(s,d,pre_days=pre,log=log)
        if r and r['n_post']>=5: out.append((d,r['step'],r['p']))
    return out
IMP=daily('UniqueUsersWithImpressions'); PLY=daily('UniqueUsersWithPlaySessions')
DAU=daily('DailyActiveUsers')
CONV=(PLY/IMP*100).where(DAU>=10000)
SETS={'D1 retention':daily('ForwardD1Retention'),
      'session length':daily('AverageSessionLengthMinutes'),
      'playtime/DAU':daily('AveragePlayTimeMinutesPerDAU'),
      'conversion (imp->play)':CONV}
SPAN={'Brainrot':('2026-04-15','2026-08-20'),'Waterslide':('2026-07-25','2026-08-25'),
      'Seal':('2026-08-14','2026-08-27'),'Verity':('2026-08-05','2026-08-26')}
print("### CHANGE-POINT SCAN — where does each series actually break?")
print("For every candidate date: fit trend + step, keep the step. Report the largest significant one.")
print("This finds the break instead of being told where to look.\n")
for g in GAMES:
    lo,hi=SPAN[g]; print(f"-- {g}")
    for name,df in SETS.items():
        if g not in df.columns: continue
        res=scan(df[g],lo,hi)
        sig=[(d,st,p) for d,st,p in res if p<0.05]
        if not res: print(f"   {name:24s} no testable dates"); continue
        if not sig: print(f"   {name:24s} no significant break anywhere in {lo}..{hi}"); continue
        d,st,p=max(sig,key=lambda t:abs(t[1]))
        frac=100*len(sig)/len(res)
        print(f"   {name:24s} biggest break {d.date()}  step {st:+.4g}  p={p:.4f}   "
              f"({len(sig)}/{len(res)} dates significant = {frac:.0f}%)")
    print()
