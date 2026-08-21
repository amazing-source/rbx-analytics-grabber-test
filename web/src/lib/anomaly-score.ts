// Score a day against what that weekday normally does for this game.
//
// Extracted from scripts/anomaly.ts so the scheduler's alerting and the
// hand-run report share ONE scorer. Two copies of a detector is how you end up
// arguing with your own tool about whether a day was really an outlier.
//
// The model, deliberately the simplest thing that works:
//
//   level(d)    = geometric mean of the 7 days BEFORE d      (local trend)
//   factor(dow) = median of observed/level for that weekday   (weekly shape)
//   expected(d) = level(d) x factor(dow(d))
//   residual(d) = ln(observed / expected)
//   z(d)        = residual / sd(residuals over history)
//
// Geometric, not arithmetic, because these series are multiplicative: a game at
// 500K DAU and one at 50K both swing ±20%, and logs put that on one scale.
// Median for the weekday factor because event days (giveaways, raids) are
// exactly the outliers that would otherwise poison the baseline they are
// supposed to be judged against. On 9963622286 the weekday shape is enormous —
// Wednesday runs −42% on PCU and −18% on revenue — so "everything is down
// today" is Wednesday, every week, and a fixed threshold fires on it forever.
//
// Only needs the 7 days before a point, so a day is scoreable the moment it
// lands rather than after a week of confirmation.

export type Scored = {
  metric: string;
  date: string;
  obs: number;
  exp: number;
  z: number;
  /** +1 when higher is better, -1 when higher is worse. */
  dir: 1 | -1;
};

export const median = (a: number[]): number => {
  if (!a.length) return NaN;
  const s = [...a].sort((x, y) => x - y);
  const i = Math.floor(s.length / 2);
  return s.length % 2 ? s[i] : (s[i - 1] + s[i]) / 2;
};

/** Minimum points before a baseline means anything. Three weeks: enough for
 *  every weekday to have been seen at least twice, which is what the median
 *  factor needs to not be a single observation wearing a disguise. */
export const MIN_POINTS = 21;
const MIN_RESIDUALS = 20;
const MIN_WEEKDAY_SAMPLES = 3;

export type ScoreResult = { scored: Scored[]; note?: string };

/** Score the tail of one daily series. `values` is date (YYYY-MM-DD) -> value;
 *  zero and negative values are the caller's to exclude, since what they mean
 *  differs per metric (a zero DAU is an outage, a zero crash count is health). */
export function scoreSeries(
  values: Map<string, number>,
  opts: { metric: string; dir: 1 | -1; tail?: number }
): ScoreResult {
  const { metric, dir, tail = 5 } = opts;
  if (values.size < MIN_POINTS) {
    return { scored: [], note: `${metric}: too few points to baseline (${values.size})` };
  }

  const dates = [...values.keys()].sort();

  // level(d) from the 7 days before d — computable at the live edge.
  const level = new Map<string, number>();
  for (let i = 7; i < dates.length; i++) {
    const prev = dates.slice(i - 7, i).map((d) => values.get(d)!).filter((v) => v > 0);
    if (prev.length < 5) continue;
    level.set(dates[i], Math.exp(prev.reduce((a, v) => a + Math.log(v), 0) / prev.length));
  }

  const dow = (d: string) => new Date(d + "T00:00:00Z").getUTCDay();

  // Weekday factor = median ratio, so giveaway spikes cannot set the baseline
  // they are then judged against.
  const ratios: number[][] = Array.from({ length: 7 }, () => []);
  for (const d of dates) {
    const l = level.get(d);
    const v = values.get(d);
    if (!l || !v) continue;
    ratios[dow(d)].push(v / l);
  }
  const factor = ratios.map((a) => (a.length >= MIN_WEEKDAY_SAMPLES ? median(a) : 1));

  // Residual spread over the whole history, in log space.
  const resid: { d: string; r: number }[] = [];
  for (const d of dates) {
    const l = level.get(d);
    const v = values.get(d);
    if (!l || !v) continue;
    const f = factor[dow(d)];
    if (!f) continue;
    resid.push({ d, r: Math.log(v / (l * f)) });
  }
  if (resid.length < MIN_RESIDUALS) return { scored: [], note: `${metric}: too few residuals` };

  const mu = resid.reduce((a, x) => a + x.r, 0) / resid.length;
  const sd = Math.sqrt(resid.reduce((a, x) => a + (x.r - mu) ** 2, 0) / resid.length);
  if (!(sd > 0)) return { scored: [], note: `${metric}: zero variance` };

  const scored: Scored[] = [];
  for (const x of resid.slice(-tail)) {
    const v = values.get(x.d)!;
    const f = factor[dow(x.d)];
    scored.push({
      metric,
      date: x.d,
      obs: v,
      exp: level.get(x.d)! * f,
      z: (x.r - mu) / sd,
      dir,
    });
  }
  return { scored };
}

/** Divide a volume series by DAU (per 100k) before scoring it.
 *
 *  Without this the detector fires on GROWTH: measured 2026-08-19 on Waterslide,
 *  OomUnexpectedExits scored z=+1.96 purely because DAU went 257k -> 402k while
 *  the OOM rate sat flat at ~155 per 100k across 19 days. A detector that cries
 *  wolf on the days a game is doing well gets switched off, and then it is worth
 *  nothing at all. */
export function perDau(
  values: Map<string, number>,
  dau: Map<string, number>
): Map<string, number> {
  const out = new Map<string, number>();
  for (const [d, v] of values) {
    const a = dau.get(d);
    if (a) out.set(d, (v / a) * 100_000);
  }
  return out;
}
