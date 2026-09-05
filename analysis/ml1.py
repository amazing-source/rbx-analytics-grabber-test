import sys, os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from stats import *
from scipy import stats as st
imp=daily('UniqueUsersWithImpressions'); ply=daily('UniqueUsersWithPlaySessions')
dau=daily('DailyActiveUsers'); ptr=daily('RFYQualifiedPTR')
conv=(ply/imp).where(dau>=10000)

print("### A. Is RFY qualified PTR the same thing as our reach->play conversion?")
for g in GAMES:
    a=ptr[g].dropna(); b=conv[g].dropna(); i=a.index.intersection(b.index)
    if len(i)<12: print(f"  {g:12s} n={len(i)} too few"); continue
    r=np.corrcoef(a[i],b[i])[0,1]
    print(f"  {g:12s} n={len(i):3d}  corr={r:+.3f}  qPTR mean={a[i].mean():.4f}  conv mean={b[i].mean():.4f}  ratio={b[i].mean()/a[i].mean():.1f}x")

print("\n### B. DILUTION TEST — does play-through rate fall simply because reach rises?")
print("log-log elasticity: d log(qPTR) / d log(reach). Negative = each extra impression converts worse.")
print("If this is strongly negative, a 'sagging signal' is the ALGO'S OWN DOING, not the game degrading.\n")
print(f"{'game':12s} {'n':>4s} {'elasticity':>11s} {'p':>8s} {'R2':>6s}   reading")
ela={}
for g in GAMES:
    x=np.log(imp[g].dropna()); y=np.log(ptr[g].dropna())
    i=x.index.intersection(y.index)
    if len(i)<15: print(f"{g:12s} {len(i):4d}  insufficient"); continue
    sl,ic,r,p,se=st.linregress(x[i],y[i]); ela[g]=(sl,p,r**2,len(i))
    rd = "strong dilution" if sl<-0.4 else ("mild dilution" if sl<-0.1 else "no dilution")
    print(f"{g:12s} {len(i):4d} {sl:+11.3f} {p:8.4f} {r**2:6.2f}   {rd}")

print("\n### C. So what is the game's OWN quality? The residual: qPTR given the reach it was fed.")
print("A game that holds up as the algo scales it has a residual that does NOT fall while reach climbs.\n")
for g in GAMES:
    if g not in ela: continue
    x=np.log(imp[g].dropna()); y=np.log(ptr[g].dropna()); i=x.index.intersection(y.index)
    sl,ic,r,p,se=st.linregress(x[i],y[i])
    resid=(y[i]-(ic+sl*x[i])).rename('resid')
    rp=imp[g].dropna().reindex(i)
    pk=rp.rolling(7).mean().idxmax()
    pre=resid[resid.index<pk]; post=resid[resid.index>=pk]
    tr=slope_abs_per_day(pre) if len(pre)>=6 else np.nan
    print(f"  {g:12s} reach peak {str(pk.date())}  residual slope BEFORE peak {tr:+.5f}/d "
          f"(n={len(pre)})   mean before {pre.mean():+.3f} vs after {post.mean():+.3f} (n={len(post)})")
