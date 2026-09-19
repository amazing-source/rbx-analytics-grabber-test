// Inline-SVG chart helpers for the 2026-09-19 pages. One scale places marks, ticks
// and labels; every colour is a theme token; every mark carries a hover tip.
const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const DAY = 86400000;
const tms = d => Date.parse(d.length === 10 ? d + "T00:00:00Z" : (d.length === 16 ? d + ":00Z" : d));

function niceTicks(lo, hi, n = 4) {
  if (lo === hi) { hi = lo + (Math.abs(lo) || 1); }
  const span = hi - lo, step0 = span / n, mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const step = [1, 2, 2.5, 5, 10].map(k => k * mag).find(s => span / s <= n + 0.5) || 10 * mag;
  const a = Math.floor(lo / step) * step, b = Math.ceil(hi / step) * step, t = [];
  for (let v = a; v <= b + step * 1e-9; v += step) t.push(+v.toFixed(10));
  return t;
}

// series: [{name, color:"var(--s1)", pts:[[dateOrTs, y]], dash?, width?}]
// markers: [{t, label}] vertical publish lines; bands: [{a, b, label}] shaded windows
function lineChart({ series, markers = [], bands = [], yFmt = v => String(v), xFrom, xTo, hourly = false,
  height = 230, yZero = false, ariaLabel = "chart", tipFmt, title }) {
  const W = 760, H = height, ml = 58, mr = 16, mt = 26, mb = 28;
  const all = series.flatMap(s => s.pts.filter(p => p[1] != null && Number.isFinite(p[1])));
  if (!all.length) return `<p class="nodata">No settled points in this window.</p>`;
  const x0 = tms(xFrom), x1 = tms(xTo) + (hourly ? 0 : 0);
  let lo = Math.min(...all.map(p => p[1])), hi = Math.max(...all.map(p => p[1]));
  if (yZero) lo = Math.min(0, lo);
  const pad = (hi - lo) * 0.08 || Math.abs(hi) * 0.1 || 1; if (!yZero) lo -= pad; hi += pad;
  const ticks = niceTicks(lo, hi, 4); const y0 = ticks[0], y1 = ticks[ticks.length - 1];
  const X = t => ml + (tms(t) - x0) / (x1 - x0) * (W - ml - mr);
  const Y = v => mt + (1 - (v - y0) / (y1 - y0)) * (H - mt - mb);
  let g = "";
  for (const b of bands) {
    const a = Math.max(ml, X(b.a)), e = Math.min(W - mr, X(b.b) + (hourly ? 0 : (W - ml - mr) * DAY / (x1 - x0)));
    g += `<rect x="${a.toFixed(1)}" y="${mt}" width="${Math.max(0, e - a).toFixed(1)}" height="${H - mt - mb}" fill="var(--band)"/>`;
    g += `<text x="${(a + 4).toFixed(1)}" y="${mt + 11}" class="cband">${esc(b.label)}</text>`;
  }
  for (const t of ticks) g += `<line x1="${ml}" x2="${W - mr}" y1="${Y(t).toFixed(1)}" y2="${Y(t).toFixed(1)}" class="cgrid"/>` +
    `<text x="${ml - 6}" y="${(Y(t) + 3.5).toFixed(1)}" class="cy">${esc(yFmt(t))}</text>`;
  // x ticks: one per day for daily ranges ≤ 24d (label every other), one per day at 00:00 for hourly
  const nd = Math.round((x1 - x0) / DAY); const every = nd > 24 ? 4 : nd > 12 ? 2 : 1;
  for (let i = 0; i <= nd; i++) {
    const t = new Date(x0 + i * DAY).toISOString().slice(0, 10); if (i % every) continue;
    const x = X(t); if (x > W - mr + 0.5) continue;
    g += `<line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${H - mb}" y2="${H - mb + 4}" class="caxis"/>` +
      `<text x="${x.toFixed(1)}" y="${H - mb + 16}" class="cx">${t.slice(5)}</text>`;
  }
  g += `<line x1="${ml}" x2="${W - mr}" y1="${H - mb}" y2="${H - mb}" class="caxis"/>`;
  const mk = []; for (const m of [...markers].sort((a, b) => tms(a.t) - tms(b.t))) { const last = mk[mk.length - 1]; if (last && tms(m.t) - tms(last.t) < 3 * 3600000) last.label += "/" + m.label.replace(/^v/, ""); else mk.push({ ...m }); }
  mk.forEach((m, i) => {
    const x = X(m.t); if (x < ml || x > W - mr) return;
    g += `<line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${mt - 6}" y2="${H - mb}" class="cmark"/>` +
      `<text x="${(x + 3).toFixed(1)}" y="${mt - 10 + (i % 2) * 0}" class="cmlab" ${x > W - 120 ? `text-anchor="end" dx="-6"` : ""}>${esc(m.label)}</text>`;
  });
  for (const s of series) {
    const pts = s.pts.filter(p => p[1] != null && Number.isFinite(p[1])).sort((a, b) => tms(a[0]) - tms(b[0]));
    let d = "", prev = null;
    for (const p of pts) {                               // break the line across gaps
      const gap = prev && (tms(p[0]) - tms(prev[0])) > (hourly ? 3 * 3600000 : 1.5 * DAY);
      d += `${!prev || gap ? "M" : "L"}${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`; prev = p;
    }
    g += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.width || 2}" ${s.dash ? `stroke-dasharray="${s.dash}"` : ""} stroke-linejoin="round" stroke-linecap="round"/>`;
    if (!hourly || pts.length < 80) for (const p of pts) g += `<circle cx="${X(p[0]).toFixed(1)}" cy="${Y(p[1]).toFixed(1)}" r="${hourly ? 1.6 : 2.6}" fill="${s.color}" stroke="var(--surface)" stroke-width="1"/>`;
    for (const p of pts) g += `<circle class="hit" cx="${X(p[0]).toFixed(1)}" cy="${Y(p[1]).toFixed(1)}" r="${hourly ? 4 : 8}" fill="transparent" data-tip="${esc((tipFmt ? tipFmt(s, p) : `${s.name} · ${p[0].replace("T", " ")} · ${yFmt(p[1])}`))}"/>`;
  }
  const legend = series.length > 1 ? `<div class="legend">${series.map(s => `<span><i style="background:${s.color}${s.dash ? ";opacity:.55" : ""}"></i>${esc(s.name)}</span>`).join("")}</div>` : "";
  return `${title ? `<p class="ctitle">${esc(title)}</p>` : ""}${legend}<div class="chartbox"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(ariaLabel)}">${g}</svg></div>`;
}

// before/after dumbbell per row: rows [{label, a, b, sub}] values in 0..1 (rates)
function dumbbell({ rows, fmt = v => (v * 100).toFixed(1) + "%", ariaLabel = "before and after" }) {
  const W = 760, rowH = 24, ml = 250, mr = 90, mt = 22, H = mt + rows.length * rowH + 20;
  const vals = rows.flatMap(r => [r.a, r.b]).filter(v => v != null);
  if (!vals.length) return "";
  const lo = 0, hi = Math.max(1, ...vals);
  const X = v => ml + (v - lo) / (hi - lo) * (W - ml - mr);
  let g = "";
  for (const t of [0, 0.25, 0.5, 0.75, 1]) if (t <= hi) g += `<line x1="${X(t)}" x2="${X(t)}" y1="${mt - 4}" y2="${H - 16}" class="cgrid"/><text x="${X(t)}" y="${mt - 8}" class="cx">${Math.round(t * 100)}%</text>`;
  rows.forEach((r, i) => {
    const y = mt + i * rowH + rowH / 2;
    g += `<text x="${ml - 8}" y="${y + 4}" class="crow">${esc(r.label.length > 38 ? r.label.slice(0, 37) + "…" : r.label)}</text>`;
    if (r.a != null && r.b != null) g += `<line x1="${X(r.a)}" x2="${X(r.b)}" y1="${y}" y2="${y}" stroke="var(--ink-3)" stroke-width="2"/>`;
    if (r.a != null) g += `<circle cx="${X(r.a)}" cy="${y}" r="5" fill="var(--before)" stroke="var(--surface)" stroke-width="2" data-tip="${esc(`${r.label} · before · ${fmt(r.a)}`)}"/>`;
    if (r.b != null) g += `<circle cx="${X(r.b)}" cy="${y}" r="5" fill="var(--s1)" stroke="var(--surface)" stroke-width="2" data-tip="${esc(`${r.label} · after · ${fmt(r.b)}`)}"/>`;
    g += `<text x="${W - mr + 8}" y="${y + 4}" class="cval">${esc(r.sub || "")}</text>`;
  });
  return `<div class="legend"><span><i style="background:var(--before)"></i>before</span><span><i style="background:var(--s1)"></i>after</span></div>` +
    `<div class="chartbox"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(ariaLabel)}">${g}</svg></div>`;
}

// diverging bars of relative change: rows [{label, d (fraction), lower (bool), note}]
function deltaBars({ rows, ariaLabel = "relative change" }) {
  const W = 760, rowH = 21, ml = 230, mr = 74, mt = 18, H = mt + rows.length * rowH + 12;
  const m = Math.min(1.5, Math.max(0.1, ...rows.map(r => Math.abs(r.d || 0))));
  const X = v => ml + (v + m) / (2 * m) * (W - ml - mr);
  let g = `<line x1="${X(0)}" x2="${X(0)}" y1="${mt - 6}" y2="${H - 8}" class="caxis"/>`;
  for (const t of [-m, -m / 2, m / 2, m]) g += `<text x="${X(t)}" y="${mt - 6}" class="cx">${(t > 0 ? "+" : "") + Math.round(t * 100)}%</text>`;
  rows.forEach((r, i) => {
    const y = mt + i * rowH; if (r.d == null) return;
    const v = Math.max(-m, Math.min(m, r.d)); const good = r.lower ? r.d < 0 : r.d > 0;
    const a = Math.min(X(0), X(v)), w = Math.abs(X(v) - X(0));
    g += `<text x="${ml - 8}" y="${y + rowH / 2 + 4}" class="crow">${esc(r.label)}</text>`;
    g += `<rect x="${a.toFixed(1)}" y="${y + 4}" width="${Math.max(1, w).toFixed(1)}" height="${rowH - 8}" rx="2" fill="${good ? "var(--pos)" : "var(--neg)"}" opacity=".85" data-tip="${esc(`${r.label} · ${(r.d * 100).toFixed(1)}%${r.note ? " · " + r.note : ""}`)}"/>`;
    g += `<text x="${W - 6}" y="${y + rowH / 2 + 4}" class="cval" text-anchor="end">${(r.d > 0 ? "+" : "") + (r.d * 100).toFixed(1)}%</text>`;
  });
  return `<div class="chartbox"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(ariaLabel)}">${g}</svg></div>`;
}

function spark(vals, color = "var(--s1)") {
  const v = vals.filter(x => x != null && Number.isFinite(x)); if (v.length < 2) return "";
  const W = 120, H = 30, lo = Math.min(...v), hi = Math.max(...v);
  const pts = vals.map((x, i) => x == null ? null : [i / (vals.length - 1) * W, H - 3 - (hi === lo ? 0.5 : (x - lo) / (hi - lo)) * (H - 6)]);
  let d = "", pen = false; for (const p of pts) { if (!p) { pen = false; continue; } d += (pen ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1); pen = true; }
  const last = pts.filter(Boolean).at(-1);
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" aria-hidden="true"><path d="${d}" fill="none" stroke="${color}" stroke-width="1.6"/><circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="2.4" fill="${color}"/></svg>`;
}

module.exports = { esc, lineChart, dumbbell, deltaBars, spark, tms };
