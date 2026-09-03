import sys, os, json; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from stats import *
oc=json.load(open(os.path.join(ROOT,'oc_rfy_lifetime.json')))
def s_(g,m):
    v=oc[g].get(m) or {}
    if not v.get('points'): return pd.Series(dtype=float)
    d=pd.DataFrame(v['points'],columns=['d','v']); d['d']=pd.to_datetime(d['d'])
    return d.set_index('d')['v'].sort_index()
imp=daily('UniqueUsersWithImpressions'); d1=daily('ForwardD1Retention')

print("### BRAINROT — bounce and D1 playtime around the 31 July break (7-day means)")
b=s_('Brainrot','RFYDuration0To60'); p=s_('Brainrot','RFYD1Playtime')
q=s_('Brainrot','RFYQualifiedPTR'); r=imp['Brainrot']
t=pd.DataFrame({'bounce<60s':b,'D1 playtime':p,'qPTR':q,'reach':r,'D1 ret':d1['Brainrot']}).sort_index()
w=t.rolling(7).mean()
for lab,lo,hi in [('3 weeks before',' 2026-07-09','2026-07-29'),('the break','2026-07-30','2026-08-05'),
                  ('2 weeks after','2026-08-06','2026-08-19')]:
    seg=w.loc[lo:hi].mean()
    print(f"  {lab:16s} bounce {seg['bounce<60s']:.4f}  D1playtime {seg['D1 playtime']:6.2f}  "
          f"qPTR {seg['qPTR']:.5f}  D1ret {seg['D1 ret']:.4f}  reach {seg['reach']:,.0f}")

print("\n### Change-point scan on the NEWLY AVAILABLE signals (Brainrot, 20 May - 20 Aug)")
for name,ser in [('first-play bounce <60s',b),('D1 playtime',p),('D2-7 play-days',s_('Brainrot','RFYD2To7PlayDays')),
                 ('qualified PTR',q)]:
    res=[]
    for dte in pd.date_range('2026-05-20','2026-08-20'):
        rr=step_test(ser,dte,pre_days=14)
        if rr and rr['n_post']>=5: res.append((dte,rr['step'],rr['p']))
    sig=[x for x in res if x[2]<0.05]
    if not sig: print(f"  {name:24s} no significant break"); continue
    dte,st,pv=max(sig,key=lambda x:abs(x[1]))
    print(f"  {name:24s} biggest break {dte.date()}  step {st:+.5g}  p={pv:.4f}  ({len(sig)}/{len(res)} dates fire)")

print("\n### THE ORDERING QUESTION — does bounce move BEFORE reach? (Brainrot + Waterslide, now testable)")
for g in ['Brainrot','Waterslide']:
    bb=s_(g,'RFYDuration0To60'); rr=imp[g].dropna(); rr=rr[rr>0]
    i=bb.index.intersection(rr.index)
    db=bb[i].diff(); dr=np.log(rr[i]).diff()
    best=None; row=[]
    for lag in range(-10,11):
        a=db.shift(-lag); m=a.notna()&dr.notna()
        if m.sum()<25: continue
        c=np.corrcoef(a[m],dr[m])[0,1]; row.append((lag,c))
        if best is None or abs(c)>abs(best[1]): best=(lag,c)
    lead="BOUNCE leads reach" if best[0]<0 else ("REACH leads bounce" if best[0]>0 else "same day")
    print(f"  {g:11s} n={len(i):3d}  peak |r| at lag {best[0]:+d} (r={best[1]:+.2f}) -> {lead}")
    print(f"              lags -4..+4: " + " ".join(f"{c:+.2f}" for l,c in row if -4<=l<=4))
