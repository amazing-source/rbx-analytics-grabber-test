import sys, os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from stats import *
from scipy import stats as st
dau=daily('DailyActiveUsers'); imp=daily('UniqueUsersWithImpressions')

def granger(y, x, lags=1):
    """Does x at t-1 predict y at t, given y at t-1?  Returns t-stat and p on x's lag."""
    d=pd.concat([np.log(y).diff().rename('dy'), np.log(x).diff().rename('dx')],axis=1).dropna()
    if len(d)<15: return None
    Y=d['dy'].iloc[lags:].values
    cols=[np.ones(len(Y))]
    for L in range(1,lags+1):
        cols.append(d['dy'].shift(L).iloc[lags:].values)
        cols.append(d['dx'].shift(L).iloc[lags:].values)
    X=np.column_stack(cols)
    b,*_=np.linalg.lstsq(X,Y,rcond=None); r=Y-X@b; dof=len(Y)-X.shape[1]
    if dof<3: return None
    cov=(r@r/dof)*np.linalg.inv(X.T@X); se=np.sqrt(np.diag(cov))
    t=b[2]/se[2]; p=2*(1-st.t.cdf(abs(t),dof))
    return dict(beta=b[2],t=t,p=p,n=len(Y))

print("### Can the data tell reach->DAU apart from DAU->reach?")
print("Granger-style: does yesterday's change in one predict today's change in the other,")
print("controlling for the series' own lag? Daily log-differences, each game's last 40 days.\n")
print(f"{'game':12s} {'reach(t-1) -> DAU(t)':>28s} {'DAU(t-1) -> reach(t)':>28s}")
for g in GAMES:
    d=dau[g].dropna().iloc[-40:]; i=imp[g].dropna().reindex(d.index)
    a=granger(d,i); b=granger(i,d)
    f=lambda r: "insufficient" if not r else f"b={r['beta']:+.3f} p={r['p']:.3f} {'SIG' if r['p']<0.05 else '   '} n={r['n']}"
    print(f"{g:12s} {f(a):>28s} {f(b):>28s}")
print("\n### How much of DAU's daily variance is reach vs conversion? (variance decomposition of the identity)")
print("log DAU = log reach + log conversion, so var(dlogDAU) = var(dlogReach) + var(dlogConv) + 2cov")
ply=daily('UniqueUsersWithPlaySessions'); conv=(ply/imp).where(dau>=10000)
print(f"{'game':12s} {'var share reach':>16s} {'var share conv':>16s} {'2*cov share':>13s}")
for g in GAMES:
    d=np.log(dau[g].dropna().iloc[-40:]).diff().dropna()
    r=np.log(imp[g].dropna()).diff().reindex(d.index)
    c=np.log(conv[g].dropna()).diff().reindex(d.index)
    m=d.notna()&r.notna()&c.notna()
    if m.sum()<12: print(f"{g:12s} insufficient"); continue
    V=d[m].var(); vr=r[m].var(); vc=c[m].var(); cv=2*np.cov(r[m],c[m])[0,1]
    print(f"{g:12s} {vr/V*100:15.1f}% {vc/V*100:15.1f}% {cv/V*100:12.1f}%")
