import sys, os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from core import *
print("### Dimensions available (ONE_DAY), by metric")
d=con.execute("""
SELECT dim, count(DISTINCT metric) AS metrics, count(DISTINCT dim_value) AS values_,
       string_agg(DISTINCT metric, ', ' ORDER BY metric) AS example_metrics
FROM pts WHERE dim IS NOT NULL AND series<>'Total' AND granularity='METRIC_GRANULARITY_ONE_DAY'
GROUP BY dim ORDER BY metrics DESC""").df()
for _,r in d.iterrows():
    print(f"\n{r['dim']:24s} metrics={r['metrics']:3d} values={r['values_']:4d}")
    print("   " + r['example_metrics'][:400])
