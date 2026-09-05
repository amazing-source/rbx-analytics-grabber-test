import sys, os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from q import show, con
KEY = ('DailyActiveUsers','MonthlyActiveUsers','DauMauStickiness','AverageSessionLengthMinutes',
 'AveragePlayTimeMinutesPerDAU','TotalPlayTimeHours','Visits','UniqueUsersWithPlaySessions',
 'ForwardD1Retention','ForwardD7Retention','ForwardD30Retention','D1Retention',
 'DailyRevenue','AverageRevenuePerUser','AverageRevenuePerPayingUser','PayingUsers',
 'PayingUsersCVR','ItemMonetizationRevenue','EndToEndCVR','UniqueUsersWithImpressions',
 'ConcurrentPlayers','PeakConcurrentPlayers')
show("Key-metric coverage: ONE_DAY Total series, per game", """
SELECT metric,
  max(CASE WHEN game='Brainrot' THEN txt END) AS Brainrot,
  max(CASE WHEN game='Seal' THEN txt END) AS Seal,
  max(CASE WHEN game='Verity' THEN txt END) AS Verity,
  max(CASE WHEN game='Waterslide' THEN txt END) AS Waterslide
FROM (
  SELECT game, metric, count(*)||'d '||strftime(min(date),'%m-%d')||'..'||strftime(max(date),'%m-%d') AS txt
  FROM pts WHERE granularity='METRIC_GRANULARITY_ONE_DAY' AND series='Total'
    AND metric IN """+str(KEY)+"""
  GROUP BY game, metric)
GROUP BY metric ORDER BY metric""")
show("Missing calendar days inside each game's own DAU span", """
WITH b AS (SELECT game, min(date) lo, max(date) hi FROM pts
           WHERE metric='DailyActiveUsers' AND granularity='METRIC_GRANULARITY_ONE_DAY' AND series='Total'
           GROUP BY game),
cal AS (SELECT b.game, g.d::DATE AS d FROM b, LATERAL generate_series(b.lo::TIMESTAMP,b.hi::TIMESTAMP,INTERVAL 1 DAY) g(d)),
have AS (SELECT game,date FROM pts WHERE metric='DailyActiveUsers' AND granularity='METRIC_GRANULARITY_ONE_DAY' AND series='Total')
SELECT cal.game, count(*) AS missing_days, min(cal.d) AS first_missing, max(cal.d) AS last_missing
FROM cal LEFT JOIN have ON have.game=cal.game AND have.date=cal.d
WHERE have.date IS NULL GROUP BY cal.game ORDER BY cal.game""")
show("FILLED_ZERO share on key volume metrics (gap-fill, not measured zero)", """
SELECT metric, game, count(*) AS days,
  sum(CASE WHEN status='FILLED_ZERO' THEN 1 ELSE 0 END) AS filled_zero,
  round(100.0*sum(CASE WHEN status='FILLED_ZERO' THEN 1 ELSE 0 END)/count(*),1) AS pct
FROM pts WHERE granularity='METRIC_GRANULARITY_ONE_DAY' AND series='Total'
  AND metric IN ('DailyActiveUsers','DailyRevenue','PayingUsers','Visits','TotalPlayTimeHours')
GROUP BY metric, game HAVING filled_zero>0 ORDER BY pct DESC LIMIT 25""")
show("AcquisitionSource: competing filter variants on DAU (double-count risk)", """
SELECT game, filt, count(DISTINCT dim_value) AS n_sources, count(*) AS rows_, min(date) lo, max(date) hi
FROM pts WHERE metric='DailyActiveUsers' AND dim='AcquisitionSource'
  AND granularity='METRIC_GRANULARITY_ONE_DAY'
GROUP BY game, filt ORDER BY game, rows_ DESC""")
