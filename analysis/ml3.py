import sys, os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from stats import *
from scipy import stats as st
imp=daily('UniqueUsersWithImpressions'); dau=daily('DailyActiveUsers')
d1=daily('ForwardD1Retention'); bounce=daily('RFYDuration0To60')
l7=daily('RFYL7PlayDays'); d27=daily('RFYD2To7PlayDays')

print("### THE HOLD TEST — when the algo scaled reach, did the game keep the players it was fed?")
print("Within each game: regress the hold signal on log(reach), split by phase.")
print("PUSH = reach 7dMA rising. PULLBACK = falling. Negative slope in PUSH = 'wins the click, loses the hold'.\n")
def phases(g):
    r=imp[g].dropna(); m=r.rolling(7).mean()
    return (m.diff()>0)
for name,series in [('D1 retention',d1),('L7 play-days',l7),('first-play bounce <60s',bounce),('D2-7 play-days',d27)]:
    print(f"-- {name}")
    for g in GAMES:
        s=series[g].dropna() if g in series.columns else pd.Series(dtype=float)
        r=imp[g].dropna(); r=r[r>0]
        i=s.index.intersection(r.index)
        if len(i)<18: print(f"   {g:12s} n={len(i)} — too short"); continue
        up=phases(g).reindex(i).fillna(False)
        out=[]
        for lab,mask in [('PUSH',up),('PULLBACK',~up)]:
            x=np.log(r[i][mask]); y=s[i][mask]
            if len(x)<8: out.append(f"{lab}: n={len(x)} short"); continue
            sl,ic,rr,p,se=st.linregress(x,y)
            star='*' if p<0.05 else ' '
            out.append(f"{lab}: n={len(x):3d} slope={sl:+.4f}{star} p={p:.3f}")
        print(f"   {g:12s} " + "   ".join(out))
    print()

print("### Same question, phrased as the studio would ask it:")
print("Did the players arriving on HIGH-reach days retain worse than those on LOW-reach days?")
print("Split each game's days at its own median reach; compare mean D1 retention.\n")
print(f"{'game':12s} {'D1 low-reach':>13s} {'D1 high-reach':>14s} {'diff':>8s} {'t-test p':>9s} {'n':>7s}")
for g in GAMES:
    s=d1[g].dropna(); r=imp[g].dropna(); i=s.index.intersection(r.index)
    if len(i)<20: print(f"{g:12s} n={len(i)} too short"); continue
    med=r[i].median(); lo=s[i][r[i]<=med]; hi=s[i][r[i]>med]
    t,p=st.ttest_ind(lo,hi,equal_var=False)
    print(f"{g:12s} {lo.mean()*100:12.2f}% {hi.mean()*100:13.2f}% {(hi.mean()-lo.mean())*100:+7.2f}pp {p:9.4f} {len(i):7d}")
