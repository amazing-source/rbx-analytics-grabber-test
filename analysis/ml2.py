import sys, os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from stats import *
from scipy import stats as st
def clean(s): 
    s=s.dropna(); return s[s>0]
imp=daily('UniqueUsersWithImpressions')
SIG={'RFYQualifiedPTR':'qualified PTR','RFYL7PlayDays':'L7 play-days',
     'RFYUniqueNotInterestedUsersPerMillionImpressions':'"not interested" rate'}
print("### ORDERING TEST — does a signal move BEFORE reach moves, or after?")
print("Cross-correlation of daily log-changes at lags -7..+7.")
print("lag<0 = the SIGNAL leads reach (supports 'signal sagged, then algo pulled back').")
print("lag>0 = REACH leads the signal (supports 'algo scaled it, and that moved the signal').\n")
for metric,nice in SIG.items():
    df=daily(metric)
    print(f"-- {nice}")
    for g in GAMES:
        r=clean(imp[g]); s=clean(df[g])
        i=r.index.intersection(s.index)
        if len(i)<25: print(f"   {g:12s} n={len(i)} — too short to test"); continue
        dr=np.log(r[i]).diff(); ds=np.log(s[i]).diff()
        best=None; row=[]
        for lag in range(-7,8):
            a=ds.shift(-lag); m=a.notna()&dr.notna()
            if m.sum()<15: continue
            c=np.corrcoef(a[m],dr[m])[0,1]
            row.append((lag,c))
            if best is None or abs(c)>abs(best[1]): best=(lag,c)
        z=[f"{c:+.2f}" for l,c in row if l in (-3,-2,-1,0,1,2,3)]
        lead = "SIGNAL leads" if best[0]<0 else ("REACH leads" if best[0]>0 else "same day")
        print(f"   {g:12s} n={len(i):3d}  lags-3..+3: {' '.join(z)}   peak |r| at lag {best[0]:+d} ({best[1]:+.2f}) -> {lead}")
    print()
print("### Elasticity, with zeros excluded (fixes the Seal NaN)")
ptr=daily('RFYQualifiedPTR')
for g in GAMES:
    x=np.log(clean(imp[g])); y=np.log(clean(ptr[g])); i=x.index.intersection(y.index)
    if len(i)<15: print(f"  {g:12s} n={len(i)} too short"); continue
    sl,ic,r,p,se=st.linregress(x[i],y[i])
    print(f"  {g:12s} n={len(i):3d}  elasticity {sl:+.3f} (p={p:.4f}, R2={r**2:.2f})")
