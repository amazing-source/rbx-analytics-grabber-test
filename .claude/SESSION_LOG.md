# Session log

Newest entry first. Written by the `checkpoint` skill — see
`.claude/skills/checkpoint/SKILL.md` for the routing rules and entry template.

This file holds **the sequence**: where we stopped, what is open, what to do
next. `HANDOFF.md` holds the durable state, `CLAUDE.md` the standing rules, and
`.claude/skills/liveops-diagnosis/SKILL.md` the accumulated method. A finding
that lives only here is a finding that will be re-derived — route it.

Resuming? Read the newest entry, then **verify it against the gates before
trusting it**. Entries describe the moment they were written.

---

## 2026-08-09 — Session continuity: `checkpoint` skill, and the repo is not backed up

**State:** branch `grabber-correctness` · **pushed to `origin` for the first
time** (the remote previously held only `main` at `c033b18`, pre-overhaul) ·
dirty: `.claude/settings.local.json`
**Gates:** verify 23 pass · 1 fail · 9 skip (**exit 1**) · audit-plan 140
templates / 0 failures · test 30/30 — all three measured today, not copied

**Landed:**
- `.claude/skills/checkpoint/SKILL.md` — the session-continuity procedure, with
  a routing table (which kind of knowledge goes in which sink) and a resume mode.
- This log.
- `web/scripts/lead-lag.ts` + `npm run lead-lag` — cross-correlates the QPTR
  proxy against reach at ±5 days and prints the OLS appeal trend on **both**
  QPTR proxies. Built to re-measure two claims; it overturned both.
- Reconciled five stale or wrong claims (see *Disproved*).

**Learned → routed:**
- The memory directory is keyed by the project's **absolute path**, so it does
  not survive a device change or even a different clone folder. The repo is the
  only carrier; memory is a local index → `.claude/skills/checkpoint/SKILL.md`.
- `verify` exits 1 on the one known-disputed hour, so it cannot be wired into
  CI as pass/fail as written → `HANDOFF.md` §1.
- **The lead-lag direction is a discriminator, not a forecast** — appeal-leads
  = exhaustion/creative fatigue, reach-leads = platform demotion →
  `liveops-diagnosis` §3.
- **Audience exhaustion has its own signature** (reach ↓↓ with QPTR ↓ while
  retention and session *improve*) → `liveops-diagnosis` §2.
- The simulator lifecycle gap **cannot** be closed with what we hold: all three
  universes carry only 31–37 days of daily headline data. It needs 6+ month
  launch-to-present windows → `liveops-diagnosis` §4.

**Disproved:**
- `CLAUDE.md` START HERE claimed "neither universe has had a post-fix active
  grab" and that 9963622286's crash history was "absent from `data/`" — both
  false since 2026-08-08 (commit `298cdb8`). Eight commits of drift in a block
  that loads into every session. Fixed.
- `HANDOFF.md` documented the verify gate as "exit 0"; it exits 1. Fixed.
- `HANDOFF.md` §6 item 1 still listed the re-grab as open. Closed 2026-08-08.
- **"QPTR is a 3-day leading indicator" does not generalise.** It held on the
  dead game (+4d, r=0.78 on MA7 first-diff, clean sign flip at −4d), is weak on
  Knife Farm (+3d, r=0.39) and runs the *other way* on Brainrot (reach leads,
  −5d r=0.71). The original r=0.85 was measured on raw levels, where two
  declining series correlate at every lag.
- **"Become a Brainrot QPTR −0.72%/week, steeper than the dead game's final
  fortnight" is withdrawn.** Reproduces on neither proxy: −0.124 pp/wk on
  `EndToEndCVR`, +0.016 pp/wk on home-surface, versus the dead game's final
  fortnight at −0.463 / −0.488. It was queued to go to the producer. It should
  not go.

**Open:**
- Branch not merged to `main` — decide merge vs keep-as-branch.
- G5, freeze-first-write-wins is disputed policy, not a settled rule: the
  largest divergences run both ways (`ItemMonetizationRevenue` 353 → 21,835
  looks like back-fill). Next action: decide whether to keep first-read or
  prefer-latest, using the dashboard as tiebreak on 3–5 disputed points.
- G7, `MessageHash` → text returns HTTP 500 on both universes, so `errors.md`
  is volumes without text. Next action: retry the async dimensions poll; if it
  still 500s, record it as a platform limitation and stop treating it as a bug.
- The lifecycle prior is unbuildable at current window length. Next action: on
  the next active grab, request 6+ months per universe rather than 28 days.

**Next:** decide merge-to-`main` vs keep-as-branch; then the long-window grab,
which is the only open item that unlocks new analysis rather than tidying.

---

## 2026-08-08 — Correctness overhaul landed; the re-grab audited the audit

*Reconstructed from git and `data/verify/COVERAGE.md` on 2026-08-09 — this
session predates the log, so treat it as a summary of commits, not as measured
state.*

**State:** commits `6c7b1b9` → `343ae1e` on `grabber-correctness`
**Gates at the time:** verify 23/1/9 · audit-plan 0 · test 30/30

**Landed:** all 7 phases of `CORRECTNESS_PLAN.md`; both universes re-grabbed
with the fixed pipeline (closing the last verification item); the
`liveops-diagnosis` skill; `data/raw/` committed because the bundles cannot be
re-created; a rebuild from `data/raw/` now reproduces the verified state.

**Learned → routed:** the diagnostic ladder, Indigo's priors, and the QPTR
leading indicator (QPTR turns down ~3 days before impressions, r=0.85 forward
vs r=0.44 reverse) → `.claude/skills/liveops-diagnosis/SKILL.md`. Pipeline
measurements → `data/verify/COVERAGE.md` (F1–F11, G1–G7).

**Disproved — by our own fresh data (G1–G7):** the zero-fill overreached past
what the gateway served (read R$4,845 as R$0); four *inferred* half-hour shapes
were up to 65% off the dashboard and were removed; "Client frame rate" is not
`ClientFpsAvg`; the revision log fired on every row (median divergence 0.0000%)
and now logs only >1%.

**Wins, measured:** `ServerCrashCount` peak 1,060,617 on 2026-08-01 for
9963622286, previously absent entirely; funnel discovery found `BaseUpgrades`,
`PlayerProgression` and 20 steps; returned-data counts 80/120 → 127/156 and
82/119 → 155/186; annotation enumeration found
`ANNOTATION_TYPE_ENGINE_RELEASE`, the genuine "was it Roblox?" signal.
