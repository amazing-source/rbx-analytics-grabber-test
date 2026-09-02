import sys, os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from core import *
from scipy import stats as st

def step_test(s, cut, pre_days=14, post_days=None, log=False):
    """OLS: y ~ a + b*t + c*post.  c = level step AFTER removing the ongoing trend."""
    s = s.dropna()
    cut = pd.Timestamp(cut)
    pre = s[(s.index < cut) & (s.index >= cut - pd.Timedelta(days=pre_days))]
    post = s[s.index >= cut]
    if post_days: post = post.iloc[:post_days]
    if len(pre) < 5 or len(post) < 3: return None
    y = pd.concat([pre, post]); 
    if log:
        if (y <= 0).any(): return None
        y = np.log(y)
    t = np.arange(len(y)); d = np.asarray(y.index >= cut, dtype=float)
    X = np.column_stack([np.ones(len(y)), t, d])
    beta, *_ = np.linalg.lstsq(X, y.values, rcond=None)
    resid = y.values - X @ beta
    dof = len(y) - 3
    if dof < 2: return None
    s2 = resid @ resid / dof
    cov = s2 * np.linalg.inv(X.T @ X)
    se = np.sqrt(cov[2, 2])
    tstat = beta[2] / se
    p = 2 * (1 - st.t.cdf(abs(tstat), dof))
    ci = (beta[2] - st.t.ppf(.975, dof)*se, beta[2] + st.t.ppf(.975, dof)*se)
    return dict(step=beta[2], se=se, t=tstat, p=p, ci=ci, n_pre=len(pre), n_post=len(post),
                pre_mean=pre.mean(), post_mean=post.mean(), log=log, trend_per_day=beta[1])

def report(title, s, cut, log=False, unit=''):
    r = step_test(s, cut, log=log)
    if not r: print(f"  {title:34s} insufficient data"); return
    if log:
        eff = (np.exp(r['step'])-1)*100; lo,hi = [(np.exp(v)-1)*100 for v in r['ci']]
        effs = f"{eff:+.1f}% [{lo:+.1f}%, {hi:+.1f}%]"
        trend = f"{(np.exp(r['trend_per_day'])-1)*100:+.2f}%/d"
    else:
        effs = f"{r['step']:+.4g} [{r['ci'][0]:+.4g}, {r['ci'][1]:+.4g}]{unit}"
        trend = f"{r['trend_per_day']:+.4g}/d"
    verdict = "SIGNIFICANT" if r['p']<0.05 else ("suggestive" if r['p']<0.15 else "not significant")
    print(f"  {title:34s} step {effs:34s} p={r['p']:.3f}  {verdict:15s} (pre n={r['n_pre']}, post n={r['n_post']}, underlying trend {trend})")
