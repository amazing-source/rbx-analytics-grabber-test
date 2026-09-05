import duckdb, os, numpy as np, pandas as pd
ROOT = os.path.dirname(os.path.abspath(__file__))
con = duckdb.connect(os.path.join(ROOT,"analytics.duckdb"), read_only=True)
GAMES = ["Brainrot","Seal","Verity","Waterslide"]
pd.set_option('display.width',250); pd.set_option('display.max_columns',40)

def daily(metric, series='Total', gran='METRIC_GRANULARITY_ONE_DAY', drop_filled=True):
    q = """SELECT game, date, value, status FROM pts
           WHERE metric=? AND granularity=? AND series=? AND NOT is_partial"""
    d = con.execute(q, [metric, gran, series]).df()
    if drop_filled:
        d = d[d.status != 'FILLED_ZERO']
    d['date'] = pd.to_datetime(d['date'])
    return d.pivot_table(index='date', columns='game', values='value')

def slope_pct_per_day(s):
    """log-linear slope -> %/day. For volumes."""
    s = s.dropna(); s = s[s > 0]
    if len(s) < 5: return np.nan
    x = np.arange(len(s)); y = np.log(s.values)
    b = np.polyfit(x, y, 1)[0]
    return (np.exp(b) - 1) * 100

def slope_abs_per_day(s):
    s = s.dropna()
    if len(s) < 5: return np.nan
    return np.polyfit(np.arange(len(s)), s.values, 1)[0]

def ma7(df): return df.rolling(7, min_periods=5).mean()

def wow(df):
    """last 7 settled days vs prior 7, % change"""
    out = {}
    for g in df.columns:
        s = df[g].dropna()
        if len(s) < 14: out[g] = np.nan; continue
        a = s.iloc[-7:].mean(); b = s.iloc[-14:-7].mean()
        out[g] = (a/b - 1)*100 if b else np.nan
    return pd.Series(out)
