---
name: checkpoint
description: Save session state so the next session — or the next device — resumes without re-deriving anything. Use when the user says they are switching devices, stopping for now, "save state", "checkpoint", "handoff", "remember where we are", or before a long risky change. Three modes — `checkpoint light` appends conclusions without running the gates (for a mid-day device switch), plain `checkpoint` runs the full gated ritual, and `checkpoint resume` rebuilds the thread from the repo and verifies the docs before trusting them.
---

# Checkpoint

The goal is not "write down what happened". It is that a session starting cold
on another machine reaches the same conclusions without redoing the work — and
that hard-won knowledge accumulates into expertise instead of scrolling away.

## Why this is not just "write a memory"

The memory directory is keyed by the project's **absolute path**
(`C--Users-bfhdh-Desktop-rbx-analytics-grabber`). Clone this repo into a
different folder, or onto a different machine, and none of it loads. The repo
is the only thing that travels.

> **Anything that would change what a fresh session does goes in the repo, in
> git. Memory is a local index that points at it — never the only copy.**

Same rule as the project's two sinks: write the durable one first, and never
let the fragile one hold the only copy.

## Route before you write

A checkpoint that dumps everything into one log is how expertise gets lost.
Each thing learned has exactly one right home.

| What you learned | Sink | Travels |
|---|---|---|
| A method that generalizes — a discrimination test, a prior, a benchmark, a failure mode | `.claude/skills/liveops-diagnosis/SKILL.md` | git |
| A fact about one game — confirmed, refuted, still open | `HANDOFF.md` investigation section + `data/games/<id>/` | git |
| Anything read out of the live place via Studio MCP | `data/games/<id>/code-reads.md`, **stamped with the `PlaceVersion` it was read at** | git |
| A question answered purely by reading — no file changed | the log entry, as a conclusion carrying its evidence pointer | git |
| A measurement of the pipeline being right or wrong | `data/verify/COVERAGE.md` + a regression test in `web/test/` | git |
| A rule that must survive contact with a fresh agent | `CLAUDE.md` | git |
| Where we stopped, what is open, the next action | `.claude/SESSION_LOG.md` (append-only) | git |
| How the user wants me to work; cross-project habits | `~/.claude/projects/<key>/memory/` | **no** |

The test for row 1 versus the log: **would this still be true on a different
game?** Yes → it is method, put it in the skill. No → log or game docs.

A finding that exists only in `SESSION_LOG.md` is a finding you will re-derive.
The log is a pointer, not a vault.

## Procedure

**Pick the mode first.** `checkpoint light` runs steps 2-5 and 7 only, skipping
the gates — use it for a mid-day device switch or when a thread closes. Plain
`checkpoint` runs everything and is the end-of-day ritual. Do not run light
twice across a device boundary without a full one in between, or documentation
drift goes unmeasured for days.

**A session with no commits still gets a full checkpoint.** A read-only day —
investigation, code reads, a diagnosis — produces no diff and will otherwise
leave almost no trace. Its conclusions and retractions *are* the deliverable.
If step 2 finds nothing, that is a signal to write **more** in the log, not less.

1. **Measure, do not recall.** Run the three gates from `web/` and record the
   actual output, including exit codes. Copying yesterday's numbers defeats the
   whole point — this step is what catches documentation drift.
2. **Diff the session.** `git log --oneline <last-checkpoint>..HEAD`,
   `git status --short`, and whether the branch is pushed.
3. **Route** every learning per the table. Write those files *first*, while you
   still remember which evidence supports which claim.
4. **Reconcile the stale.** Any claim in `CLAUDE.md`, `HANDOFF.md` or
   `COVERAGE.md` that this session disproved must be edited **in this
   checkpoint**. Stale START-HERE text is worse than no text: it loads into
   every future session and gets believed. Grep for the claims you touched.
5. **Append the log entry** using the template below. Cap it around 25 lines —
   overflow is a signal that something belonged in a routed sink.
6. **Commit.** Ask first unless the user already said to. Uncommitted work does
   not travel; name any unpushed branch explicitly in the entry.
7. **Print the resume line** — the exact next action, specific enough to paste.

## The log entry

Fixed shape, so a future read is a scan and not a study.

```markdown
## YYYY-MM-DD — <what changed, one line>

**State:** branch `x` · N ahead of main · pushed/unpushed · dirty files
**Gates:** verify A/B/C (exit N) · audit-plan N · test N/N — measured today
**Landed:** …
**Learned → routed:** <fact> → <the file it now lives in>
**Retracted:**
1. <the claim, in the words it was said> — <the observation that killed it>
2. …
**Open:** <thread> — <next action>
**Wake:** <YYYY-MM-DD> — <what only becomes answerable on or after that date>
**Next:** <single highest-value action>
```

Rules for the entry:

- Conclusions and open questions only. **Never narration** ("I read X, then ran
  Y"). Git already records what changed; the log records what it *means*.
- Every claim carries its evidence pointer — a commit, a file, or the command
  that measured it.
- An "Open" item with no next action is a wish, not a thread. Give it one or
  drop it.
- Absolute dates, never "yesterday" or "last week".
- If a number appears, name the series or command it came from.
- **Retractions are the most valuable part of the entry, so they get a numbered
  list rather than a line.** Write each in the words it was originally asserted,
  then the observation that killed it. A retraction compressed to "was wrong
  about the wheel" does not stop the next session re-deriving it; "Touched
  re-fires for an animated character" does. Write them even when — especially
  when — the belief was mine.
- **`Wake:` is for threads that are not actionable yet**, usually because data
  has not settled. An item parked there must name the date and the exact pull.
  Resume reads these before anything else.

## Resume mode

Invoked as `checkpoint resume`, or whenever a session opens cold on this repo.

1. **Read in order:** the last entry's `Wake:` line first — if today is on or
   past one of those dates, that pull is the session's opening move — then
   `CLAUDE.md` START HERE → `.claude/SESSION_LOG.md` (last two entries) →
   `HANDOFF.md`.
2. **Verify before trusting.** Run `git log --oneline -5` and the three gates.
   The docs describe the moment they were written; the gates describe now. Any
   disagreement means the doc is stale — fix it *before* doing anything else.
3. **If the memory directory is empty** (new device), rebuild it from the repo.
   Memories are derived; the repo is canonical. Never the reverse.
4. **Re-read the last entry's `Retracted:` list before proposing anything.**
   Those are the claims most likely to be re-derived, because the reasoning that
   produced them was plausible enough to publish once.
5. **Check the data's age, not just the docs'.** `data/games/<id>/` is a snapshot.
   If the open thread is about a metric, the first action is usually a fresh
   pull, because sub-daily series hold only ~24h and perf ages out at ~30 days.
6. **State the thread back in six lines or fewer** — where we are, what is open,
   the proposed next action — then wait for the user.

## What this exists to prevent

Real failures, not hypotheticals:

- On 2026-08-09, `CLAUDE.md`'s START HERE still said "neither universe has had
  a post-fix active grab" and that 9963622286's crash history was "absent from
  `data/`" — eight commits after both became false. That block loads into every
  session.
- `HANDOFF.md` documented the verify gate as "exit 0". It exits 1 (measured
  2026-08-09). A gate whose documented state is wrong cannot function as a gate.
- Method learned in one session and left in that session's prose — the QPTR
  leading indicator, the discrimination tests — is method re-derived from
  scratch later, or worse, lost and contradicted.
