// Rebuild each game's player-review history from EVERY raw grab bundle plus the
// live review log, de-duplicated on review id. Needed because feedback.csv is
// rewritten from the latest grab alone (export-files.ts), so a short trailing grab
// truncates it to that grab's window — measured 2026-09-19: Seal 67 → 5 rows,
// Verity 458 → 53, Waterslide 31 → 5 after a 09-16 → today grab.
//
//   node tools/r0919/feedback-merge.js                 → reports/2026-09-19/data/feedback-<universe>.json
//   node tools/r0919/feedback-merge.js --repair-mirror → ALSO rewrites data/games/<id>/feedback.{csv,md}
//                                                         with the full merged history, in the exporter's format
//   (--mirror-only skips the JSON write, for use while something is reading the JSON)
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "../..");
const RAW = path.join(ROOT, "data/raw");
const OUT = path.join(ROOT, "reports/2026-09-19/data");
const IDS = ["9963622286", "10030829154", "10399712766", "10565445771", "10638354731"];
const iso = v => (v == null || v === "") ? "" : new Date(v).toISOString();
const REVIEWS = /player-generated-reviews-service\/v1\/channels\/[^/]+\/assets\/(\d+)\/reviews/;

function merge(id) {
  const byId = new Map(); let bundles = 0;
  for (const f of fs.readdirSync(RAW).filter(f => f.startsWith(id + "-") && f.endsWith(".json"))) {
    let j; try { j = JSON.parse(fs.readFileSync(path.join(RAW, f), "utf8")); } catch { continue; }
    const caps = Array.isArray(j) ? j : (j.captures || []); bundles++;
    for (const c of caps) {
      const m = (c.url || "").match(REVIEWS); if (!m) continue;
      let body = c.body; if (typeof body === "string") { try { body = JSON.parse(body); } catch { continue; } }
      for (const rv of (body && body.reviews) || []) {
        if (!rv || !rv.id) continue; const t = iso(rv.created_utc ?? rv.createdUtc);
        byId.set(String(rv.id), { id: String(rv.id), t, d: t.slice(0, 10), v: rv.asset_version ?? null,
          place: String(rv.asset_id ?? m[1]), options: Array.isArray(rv.category_option_ids) ? rv.category_option_ids.map(String) : [],
          cat: String(rv.category_type ?? ""), comment: String(rv.comment ?? ""),
          os: (rv.metadata && rv.metadata.operating_system_type) || null, device: (rv.metadata && rv.metadata.device_type) || null, src: "grab" });
      }
    }
  }
  const live = JSON.parse(fs.readFileSync(path.join(ROOT, "data/live/feedback.json"), "utf8"));
  let fromLive = 0;
  for (const r of live) if (String(r.universeId) === id && r.id && !byId.has(String(r.id))) {
    fromLive++; byId.set(String(r.id), { id: String(r.id), t: r.createdUtc, d: (r.createdUtc || "").slice(0, 10), v: r.assetVersion ?? null,
      place: "", options: [], cat: r.category || "", comment: r.comment || "", os: r.os || null, device: r.device || null, src: "live" });
  }
  return { rows: [...byId.values()].sort((a, b) => a.t < b.t ? -1 : 1), bundles, fromLive };
}

// same format as export-files.ts feedbackCsv / feedbackMd
const csvEscape = v => /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
function writeMirror(id, rowsAsc) {
  const rows = rowsAsc.slice().sort((a, b) => b.t.localeCompare(a.t));
  const csv = ["created_utc,date,place_id,asset_version,category,options,os,device,comment"];
  for (const r of rows) csv.push([r.t, r.d, r.place || "", r.v ?? "", csvEscape(r.cat), csvEscape((r.options || []).join("|")),
    r.os ?? "", r.device ?? "", csvEscape(r.comment)].join(","));
  const byCat = new Map(), byVer = new Map();
  for (const r of rows) { byCat.set(r.cat || "?", (byCat.get(r.cat || "?") || 0) + 1);
    const v = r.v != null ? `v${r.v}` : "unknown"; byVer.set(v, (byVer.get(v) || 0) + 1); }
  const dates = rows.map(r => r.d).filter(Boolean).sort();
  const md = ["# Player feedback", "", `- Entries: **${rows.length}**${dates.length ? ` (${dates[0]} → ${dates[dates.length - 1]})` : ""}`,
    "- Full text with the version each landed on: `feedback.csv` (`asset_version` column).", "", "## By category", "",
    "| Category | Count |", "|---|---|", ...[...byCat.entries()].sort((a, b) => b[1] - a[1]).map(([c, n]) => `| ${c} | ${n} |`), "",
    "## By place version", "", "Cross-reference `place-versions.md` — a category clustering on one version dates it to that deploy.", "",
    "| Version | Feedback count |", "|---|---|",
    ...[...byVer.entries()].sort((a, b) => (Number(b[0].replace("v", "")) || -1) - (Number(a[0].replace("v", "")) || -1)).map(([v, n]) => `| ${v} | ${n} |`), ""];
  const dir = path.join(ROOT, "data/games", id);
  fs.writeFileSync(path.join(dir, "feedback.csv"), csv.join("\n") + "\n", "utf8");
  fs.writeFileSync(path.join(dir, "feedback.md"), md.join("\n"), "utf8");
  console.log(`  repaired data/games/${id}/feedback.csv: ${rows.length} rows`);
}

for (const id of IDS) {
  const { rows, bundles, fromLive } = merge(id);
  if (!process.argv.includes("--mirror-only")) {
    const byVersion = {}, byDay = {};
    for (const r of rows) {
      const down = /down/i.test(r.cat), up = /up/i.test(r.cat);
      const a = byVersion[r.v ?? "?"] ||= { up: 0, down: 0, n: 0, first: r.d, last: r.d }; a.n++; if (down) a.down++; else if (up) a.up++;
      if (r.d < a.first) a.first = r.d; if (r.d > a.last) a.last = r.d;
      const b = byDay[r.d] ||= { up: 0, down: 0, n: 0 }; b.n++; if (down) b.down++; else if (up) b.up++;
    }
    fs.writeFileSync(path.join(OUT, `feedback-${id}.json`), JSON.stringify({ universe: id, bundles, fromLive, n: rows.length,
      span: rows.length ? [rows[0].d, rows.at(-1).d] : null, byVersion, byDay, rows }, null, 1));
  }
  console.log(`${id}: ${rows.length} reviews from ${bundles} bundles (+${fromLive} live-only), ${rows.length ? rows[0].d + " → " + rows.at(-1).d : "none"}, since 09-04: ${rows.filter(r => r.d >= "2026-09-04").length}`);
  if (process.argv.includes("--repair-mirror") || process.argv.includes("--mirror-only")) writeMirror(id, rows);
}
