import duckdb, os, sys
ROOT = os.path.dirname(os.path.abspath(__file__))
con = duckdb.connect(os.path.join(ROOT, "analytics.duckdb"), read_only=True)
def show(title, sql, params=None):
    print("\n### " + title)
    r = con.execute(sql, params or []).df()
    if r.empty: print("(no rows)"); return r
    print(r.to_string(index=False, max_rows=200))
    return r
