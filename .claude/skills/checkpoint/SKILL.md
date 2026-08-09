---
name: checkpoint
description: Save session state so the next session — or the next device — resumes without re-deriving anything. Use when the user says they are switching devices, stopping for now, "save state", "checkpoint", "handoff", "remember where we are", or before a long risky change. Handles the resume side too — `checkpoint resume` rebuilds the thread from the repo and verifies the docs before trusting them.
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
| A measurement of the pipeline being right or wrong | `data/verify/COVERAGE.md` + a regression test in `web/test/` | git |
| A rule that must survive contact with a fresh agent | `CLAUDE.md` | git |
| Where we stopped, what is open, the next action | `.claude/SESSION_LOG.md` (append-only) | git |
| How the user wants me to work; cross-project habits | `~/.claude/projects/<key>/memory/` | **no** |

The test for row 1 versus the log: **would this still be true on a different
game?** Yes → it is method, put it in the skill. No → log or game docs.

A finding that exists only in `SESSION_LOG.md` is a finding you will re-derive.
The log is a pointer, not a vault.

## Procedure

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
**Disproved:** <what we believed> — <what killed it>
**Open:** <thread> — <next action>
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
- Disproved beliefs are the most valuable line in the entry. Write them even
  when — especially when — the belief was mine.

## Resume mode

Invoked as `checkpoint resume`, or whenever a session opens cold on this repo.

1. **Read in order:** `CLAUDE.md` START HERE → `.claude/SESSION_LOG.md` (last
   two entries) → `HANDOFF.md`.
2. **Verify before trusting.** Run `git log --oneline -5` and the three gates.
   The docs describe the moment they were written; the gates describe now. Any
   disagreement means the doc is stale — fix it *before* doing anything else.
3. **If the memory directory is empty** (new device), rebuild it from the repo.
   Memories are derived; the repo is canonical. Never the reverse.
4. **State the thread back in six lines or fewer** — where we are, what is open,
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
