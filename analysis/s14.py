import sys, os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from stats import *
imp = daily('UniqueUsersWithImpressions'); ply = daily('UniqueUsersWithPlaySessions')
dau = daily('DailyActiveUsers'); ptr = daily('RFYPlayThroughRate'); qptr = daily('RFYQualifiedPTR')
cvr = (ply/imp)*100
print("### Funnel decomposition: DAU = REACH (impressions) x CONVERSION (impression->play)")
print("Peak-to-latest change decomposed. If reach falls and conversion holds, the algorithm pulled")
print("distribution. If conversion falls, the product//storefront stopped converting the same reach.\n")
rows=[]
for g in GAMES:
    d = dau[g].dropna()
    peak_d = d.idxmax()
    win = lambda s: (s.dropna().loc[:].reindex([peak_d]).iloc[0] if peak_d in s.index else np.nan)
    last = lambda s: s.dropna().iloc[-1]
    def ch(s):
        s=s.dropna()
        if peak_d not in s.index: return np.nan
        return (s.iloc[-1]/s.loc[peak_d]-1)*100
    rows.append(dict(game=g, peak_day=str(peak_d.date()),
        dau_chg=ch(dau[g]), reach_chg=ch(imp[g]), conv_chg=ch(cvr[g]),
        conv_at_peak=cvr[g].dropna().loc[peak_d] if peak_d in cvr[g].dropna().index else np.nan,
        conv_now=last(cvr[g]),
        ptr_at_peak=(ptr[g].dropna().loc[peak_d] if g in ptr.columns and peak_d in ptr[g].dropna().index else np.nan),
        ptr_now=(last(ptr[g]) if g in ptr.columns else np.nan)))
r=pd.DataFrame(rows)
r.columns=['game','DAU peak on','DAU %','reach %','conv %','conv@peak %','conv now %','RFY PTR@peak','RFY PTR now']
print(r.to_string(index=False,float_format=lambda v:f"{v:,.3f}"))
print("\n### Sanity: does reach x conversion reproduce the DAU move?")
for g in GAMES:
    a=r[r.game==g].iloc[0]
    recon=((1+a['reach %']/100)*(1+a['conv %']/100)-1)*100
    print(f"  {g:12s} observed DAU {a['DAU %']:+7.1f}%   reach x conv reconstructs {recon:+7.1f}%")
print("\n### Correlation of daily log-DAU with log-reach and with conversion (last 28d)")
for g in GAMES:
    d=np.log(dau[g].dropna().iloc[-28:]); i=np.log(imp[g].dropna()).reindex(d.index); c=cvr[g].reindex(d.index)
    m=d.notna()&i.notna()&c.notna()
    if m.sum()<10: continue
    print(f"  {g:12s} corr(logDAU, logReach)={np.corrcoef(d[m],i[m])[0,1]:+.3f}   corr(logDAU, conv)={np.corrcoef(d[m],c[m])[0,1]:+.3f}   n={m.sum()}")
