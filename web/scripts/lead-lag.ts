/**
 * lead-lag — does appeal move before reach, or after?
 *
 *   npm run lead-lag                  # every game in data/games/
 *   npm run lead-lag -- 9758414065    # one universe
 *
 * Cross-correlates the QPTR proxy (`EndToEndCVR`) against reach
 * (`UniqueUsersWithImpressions`) at lags -5..+5 days. A **positive** peak lag
 * means CVR[t] predicts impressions[t+k] — appeal moved first. A **negative**
 * peak means the platform moved first and conversion followed.
 *
 * This is a discriminator, not a proof. Read `## 3. Discrimination` in
 * .claude/skills/liveops-diagnosis/SKILL.md before quoting a lag to anyone —
 * it records what this measured across the portfolio, and why the direction is
 * NOT universal.
 *
 * Three transforms are printed on purpose:
 *   levels          two trending series correlate at every lag; near-useless
 *                   alone, shown so an inflated r is visible as inflated
 *   MA7 levels      7-day centered mean kills the weekday cycle (Roblox
 *                   audiences rise Fri-Sun), but the trend still dominates
 *   MA7 first-diff  the one to read — trend removed, so it answers
 *                   "when one turns, does the other follow?"
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const GAMES_DIR = join(import.meta.dirname, '..', '..', 'data', 'games');
const APPEAL = 'EndToEndCVR';
const REACH = 'UniqueUsersWithImpressions';
const MAX_LAG = 5;
const MIN_PAIRS = 12; // below this a peak is noise, not a reading

type Series = Map<string, number>;

/** One series from a metric CSV — settled, real readings only.
 *  `series` defaults to the headline (empty breakdown, exported as "Total"). */
function load(game: string, metric: string, series = 'Total'): Series | null {
  const file = join(GAMES_DIR, game, 'metrics', `${metric}.csv`);
  if (!existsSync(file)) return null;
  const lines = readFileSync(file, 'utf8').trim().split(/\r?\n/);
  const head = lines[0].split(',');
  const col = (n: string) => head.indexOf(n);
  const [iDate, iGran, iSeries, iValue, iStatus, iPartial] = ['date', 'granularity', 'series', 'value', 'status', 'partial'].map(col);
  const out: Series = new Map();
  for (const line of lines.slice(1)) {
    const c = line.split(',');
    if (series === 'Total' ? c[iSeries] !== 'Total' : !c[iSeries].startsWith(series)) continue;
    if (c[iGran] !== 'METRIC_GRANULARITY_ONE_DAY') continue;
    if ((c[iPartial] ?? '').toLowerCase() === 'true') continue;        // interval had not elapsed
    if (c[iStatus] === 'FILLED_ZERO') continue;                        // synthesized, not a reading
    const v = Number(c[iValue]);
    if (Number.isFinite(v)) out.set(c[iDate], v);
  }
  return out.size ? out : null;
}

/** OLS trend, returned in percentage points per week and as % of the mean level. */
function trend(rows: [string, number][]) {
  const n = rows.length;
  const t0 = Date.parse(rows[0][0]);
  const xs = rows.map(([d]) => (Date.parse(d) - t0) / 86_400_000);
  const ys = rows.map(([, v]) => v);
  const mx = mean(xs), my = mean(ys);
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) { num += (xs[i] - mx) * (ys[i] - my); den += (xs[i] - mx) ** 2; }
  const perWeek = (num / den) * 7;
  return { perWeek, rel: (perWeek / my) * 100, mean: my, n };
}

const HOME = 'AcquisitionSource: HomeRecommendation';

/** Is click-appeal rising or falling? Printed on BOTH proxies, because a
 *  QPTR claim that only holds on one of them is a claim about the proxy. */
function appealTrend(game: string) {
  const out: string[] = [];
  const cvr = load(game, APPEAL);
  if (cvr) {
    const t = trend([...cvr.entries()].sort().map(([d, v]) => [d, v * 100] as [string, number]));
    out.push(`    ${APPEAL.padEnd(15)} mean ${t.mean.toFixed(2)}%  trend ${t.perWeek >= 0 ? '+' : ''}${t.perWeek.toFixed(3)} pp/wk (${t.rel >= 0 ? '+' : ''}${t.rel.toFixed(1)}%/wk)`);
  }
  const dau = load(game, 'DailyActiveUsers', HOME);
  const imp = load(game, REACH, HOME);
  if (dau && imp) {
    const rows = [...dau.keys()].filter((d) => (imp.get(d) ?? 0) > 0).sort()
      .map((d) => [d, ((dau.get(d) as number) / (imp.get(d) as number)) * 100] as [string, number]);
    if (rows.length >= 10) {
      const t = trend(rows);
      out.push(`    ${'home-surface'.padEnd(15)} mean ${t.mean.toFixed(2)}%  trend ${t.perWeek >= 0 ? '+' : ''}${t.perWeek.toFixed(3)} pp/wk (${t.rel >= 0 ? '+' : ''}${t.rel.toFixed(1)}%/wk)`);
    }
  }
  return out;
}

const mean = (a: number[]) => a.reduce((s, x) => s + x, 0) / a.length;

function pearson(a: number[], b: number[]): number {
  const ma = mean(a), mb = mean(b);
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i] - ma, y = b[i] - mb;
    num += x * y; da += x * x; db += y * y;
  }
  return num / Math.sqrt(da * db);
}

type Maybe = (number | null)[];

function ma7(v: number[]): Maybe {
  return v.map((_, i) => (i < 3 || i > v.length - 4 ? null : mean(v.slice(i - 3, i + 4))));
}

function firstDiff(v: Maybe): Maybe {
  return v.map((x, i) => (i === 0 || x === null || v[i - 1] === null ? null : x - (v[i - 1] as number)));
}

/** x[t] vs y[t+lag]; positive lag = x leads. */
function xcorr(x: Maybe, y: Maybe, lag: number) {
  const A: number[] = [], B: number[] = [];
  for (let t = 0; t < x.length; t++) {
    const u = t + lag;
    if (u < 0 || u >= y.length || x[t] === null || y[u] === null) continue;
    A.push(x[t] as number); B.push(y[u] as number);
  }
  return A.length < 10 ? { r: NaN, n: A.length } : { r: pearson(A, B), n: A.length };
}

function report(game: string) {
  const appeal = load(game, APPEAL);
  const reach = load(game, REACH);
  if (!appeal || !reach) {
    console.log(`\n=== ${game}   SKIP — ${!appeal ? APPEAL : REACH} not held (missing metric is not a zero)`);
    return;
  }
  const dates = [...appeal.keys()].filter((d) => reach.has(d)).sort();
  if (dates.length < 20) {
    console.log(`\n=== ${game}   SKIP — only ${dates.length} overlapping days; needs ~20+`);
    return;
  }
  const A = dates.map((d) => appeal.get(d) as number);
  const R = dates.map((d) => reach.get(d) as number);

  console.log(`\n=== ${game}   n=${dates.length}   ${dates[0]} -> ${dates.at(-1)}`);
  console.log(`    ${APPEAL} ${(A[0] * 100).toFixed(2)}% -> ${(A.at(-1) as number * 100).toFixed(2)}%` +
              `   ${REACH} ${R[0].toLocaleString('en-US')} -> ${(R.at(-1) as number).toLocaleString('en-US')}`);
  for (const line of appealTrend(game)) console.log(line);

  const transforms: [string, Maybe, Maybe][] = [
    ['levels', A, R],
    ['MA7 levels', ma7(A), ma7(R)],
    ['MA7 first-diff', firstDiff(ma7(A)), firstDiff(ma7(R))],
  ];

  for (const [label, x, y] of transforms) {
    const cells: string[] = [];
    let best = { r: -2, lag: 0, n: 0 };
    for (let k = -MAX_LAG; k <= MAX_LAG; k++) {
      const { r, n } = xcorr(x, y, k);
      cells.push(`${k > 0 ? '+' : ''}${k}:${Number.isNaN(r) ? ' n/a' : r.toFixed(2)}`);
      if (!Number.isNaN(r) && n >= MIN_PAIRS && r > best.r) best = { r, lag: k, n };
    }
    const dir = best.lag > 0 ? 'appeal leads' : best.lag < 0 ? 'reach leads' : 'same day';
    console.log(`    ${label.padEnd(15)} ${cells.join(' ')}`);
    console.log(`    ${''.padEnd(15)} peak r=${best.r.toFixed(2)} @ ${best.lag > 0 ? '+' : ''}${best.lag}d — ${dir} (n=${best.n})`);
  }
}

const args = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const games = args.length ? args : readdirSync(GAMES_DIR).filter((d) => /^\d+$/.test(d));
if (!games.length) {
  console.error(`no games in ${GAMES_DIR} — rebuild with: npm run ingest:file -- ../data/raw/<file>.json`);
  process.exit(1);
}
for (const g of games) report(g);
console.log(`\nRead the MA7 first-diff row. A peak found by scanning 11 lags on ~25 points`);
console.log(`is hypothesis-generating, not a result — corroborate it before it leaves the repo.`);
