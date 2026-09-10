---
name: code-diagnosis
description: Work on a game's codebase — find and fix a bug of any kind, investigate why something behaves wrong, audit or health-check a project, or diagnose a runtime problem such as frame time, hitching or memory growth. Use when asked to fix or explain broken behaviour, to look over a codebase, to check whether something is working, to profile or optimise, or when a previous fix "did nothing". Covers the evidence rules that separate a hypothesis from a finding, the bug classes that hide from a source read, health-check passes, and the verification loop that stops a plausible fix shipping unmeasured.
---

# Code diagnosis

Code work fails in a characteristic way: a plausible cause is read out of the
source, a fix is written for it, the fix changes nothing, and the diagnosis is
abandoned as wrong when it was merely incomplete. This file is the method that
keeps that from happening twice.

> This file answers **why does the code do that, and what actually fixes it**.
> For metrics questions — DAU, retention, revenue — use `liveops-diagnosis`.
> Code work on a game's scripts is a separate thread from analytics and belongs
> in `DEV_LOG.md`; do not let one leak into the other.

## The standing rule

**A runtime observation is evidence. A source read is a hypothesis.** Both are
necessary and they are not interchangeable. Read the code to know what *could*
be happening; observe the running system to know what *is*. Never report a
source read as a finding, and never fix a line that nothing has implicated.

The corollary is the one that costs time: **absence is not evidence.** An empty
result, a query that matched nothing, a log with no errors in it, a metric with
no data — none of these say the feature is unused or the code is sound. They say
you did not observe anything, which is also what a broken observation looks
like. Confirm the instrument works before believing a negative.

## Reading the running system

**Confirm what you are attached to.** Check the mode and the available roles
before interpreting anything. A tool's target label describes what you asked
for, not always what you got; in a single-process session one side's capture can
contain the whole process. Look for signals that could only come from one side —
render or input timers in a "server" capture, for instance — and re-read the
scope before attributing.

**Know which numbers survive an incomplete observation.** Captures report event
limits and partial coverage; exports have window edges; logs get dropped. Totals
and coarse timings usually survive; fine-grained percentages usually do not.
Quote the robust figure, hedge the fragile one, and say which is which.

**The top entry is usually a container.** Sampling attributes to the frame it
can name, so the largest row is often an event handler, a scheduler entry or a
module boundary rather than a leaf. Walk down to something you could actually
edit before naming a cause.

**Locals are not reachable — expose state instead of inferring it.** When the
value you need lives in a closure, write the few numbers you need to a readable
surface. When several instances write it, **record the maximum rather than the
last**, so a quiet instance cannot overwrite the interesting one. Mark it
temporary and strip it when done.

**Never evaluate or require a module over a tool bridge to inspect it** — that
can hang. Read source as text; parse it if you need to check it.

## Bug classes a source read will not find

**The guard that does not guard.** Any cap, quota, throttle, limit or validation
deserves three questions, and most fail at least one:

1. **Can it subdivide its unit of work?** A bound that can only take a whole
   unit or skip it does nothing when the workload arrives as **one large unit**.
   Look at how work is partitioned first: if the partitioner merges adjacent
   work, the pathological case is exactly the one that arrives as a single unit.
   Watch for an "always do at least one" clause — necessary to guarantee
   progress, and also the hole the whole workload walks through.
2. **What is its scope?** A limit of *N* **per object** is not a limit per
   frame, per request or per player. Find where it is spent and count how many
   times per cycle that happens. This is the commonest reason a correct-looking
   bound does not hold.
3. **Does it reduce work, or relocate it?** A rate limiter spreads cost without
   lowering it and saturates silently at its own ceiling. Only a cap **with a
   carry** — serve what fits, leave the rest flagged — actually lowers per-cycle
   work. Code with one of each will behave in opposite directions under load,
   and that contrast is a measurement you can take.

**Two authorities for one fact.** When the same truth is stored twice — client
and server, a live table and a saved record, a cache and its source — the bug is
usually that one was updated and the other was not. Look for the write paths and
check they are the same path. Symptom: state that is correct until something
routine happens, then silently isn't.

**Order and timing.** Deferred signals, init order, and "it arrives a moment
later" are a large share of real bugs and are invisible in a source read. If a
handler reads a flag another system sets, ask what happens when they arrive in
the other order — then check, rather than reason, because the platform decides.
A value read immediately after firing an event may predate the handler.

**Silent failure paths.** A swallowed error, a fallback that masks, a `pcall`
whose result is ignored, a default that stands in for a missing value. These
convert a loud bug into a quiet wrong answer. Grep for the swallow, not the
throw.

**Stale reasoning.** Where a comment and the live value disagree, **the value
wins and the comment is a finding** — stale arithmetic next to real arithmetic
is how the next person gets it wrong too. The same applies to a constant
duplicated across modules that must move together: check they actually did.

**Resource growth.** Cost or memory that only ever rises across a session.
Distinguish *allocated but idle* from *leaked*: a pool that stays allocated is
fine, a set that only grows is not. Two samples far apart is suggestive, not
proof — say which you have.

**Performance specifically.** Cost obeys an identity:

    cost  =  work units  ×  work per unit

If the per-unit step is already at its stability or correctness limit, **you
cannot schedule your way to a cheaper system** — handing a starved consumer a
bigger batch just makes it do proportionally more. Scheduling decides *who
waits*; it does not change what the work costs. When a bound is honoured and it
is still too slow, the levers are: fewer units, cheaper units, or accept a lower
rate. Say which one you are proposing.

Two traps that recur:

- **A self-pricing budget can trap itself.** If per-unit cost is measured over
  the batch just run and there is fixed per-call overhead, a *small* batch
  prices as expensive → the budget shrinks → the batch shrinks further. It
  settles tiny while leaving the real budget unspent. Signature: **low
  throughput and low resource use at the same time.**
- **Per-unit cost is not constant.** Coarsening units concentrates real work
  into each one, so cost per unit rises and halving the unit count buys much
  less than half. Never size a change off unit count alone.

## Failure modes of the investigator

These are about you, not the code, and they are the expensive ones.

**Bounds that multiply defeat isolated testing.** If two bounds compose — a
per-object cap times an object count — fixing either alone measures as **zero**.
That is indistinguishable from a wrong diagnosis, and it is how a correct
hypothesis gets thrown away. Decide whether two fixes are independent *before*
choosing a test order; isolate for attribution only when they are.

**"We tried that and nothing happened" is weak evidence.** When a previous
attempt targeted the right mechanism but only part of it, a null result is
expected. Read what was actually implemented and test it against the three
questions above before dismissing the hypothesis. Prior fixes in the tree are
data about the problem, not proof of its absence — including your own.

**Predict before you read.** State what each outcome would mean *before* taking
the measurement. A reading that cannot come out against you is not a test, and
writing the prediction down is what stops a confirming glance at ambiguous data.

**Use the negative control.** The strongest confirmation available is the symptom
*going away* when the suspected cause goes away. If cost or breakage tracks a
quantity, removing the quantity must remove it — and if it doesn't, the
diagnosis is wrong however well the numbers fit. Look for a natural one: work
completing, a mode ending, a state settling.

**Read the existing reasoning before proposing a lever.** A mature codebase
often documents why the obvious fix is unavailable, and the note is usually next
to the constant. **Grep the constant's own comment before proposing to change
it.** Discovering afterwards that it was considered and rejected for a good
reason costs credibility that is expensive to regain.

**Config is a confound before your change is.** When "it behaves differently
over here" is the report, diff the live settings of both copies first. Detail,
quality and platform presets frequently set *behavioural* parameters, not just
cosmetic ones. A user's description of a difference is usually right that one
exists and unreliable about which knob — take the observation seriously and
locate the knob yourself.

## Health-check pass

When asked to look over a codebase rather than chase one bug, work outward from
what is observable and rank by mechanism:

1. **What is actually failing at runtime.** Read the logs and error signatures
   from a real session first. This outranks every static impression.
2. **Guards that do not hold.** Run the three questions over every cap, limit
   and validation on a path that matters.
3. **Duplicated facts and constants.** Two authorities for one truth; a constant
   that must move with another and didn't; a comment contradicting its value.
4. **Silent failures.** Swallowed errors, ignored results, masking fallbacks.
5. **Growth.** Anything monotonic across a session.
6. **Dead and disabled code that is still referenced.** Especially a disabled
   script another module still expects.

**Rank by mechanism, never by count.** The loudest signature in a log is
routinely the cheapest one. A warning firing ten thousand times that costs
nothing ranks below a purchase prompt that never fires. What counts is
functional, revenue, progression or data-loss impact — a lost save, a dead
sink, a prompt that never appears, a session ending in a crash.

**Check that a cosmetic-looking defect is really only cosmetic** before dropping
it. One typo can kill a visual effect *and* a purchase path; the visual half is
the half you notice.

**A finding needs a mechanism, not a smell.** "This looks fragile" is not
reportable. Either show the input that produces the wrong output, or label it
explicitly as unverified and rank it below everything that is.

## Editing rules

Non-negotiable, and they override any convenience:

- **Live places are read-only.** Edits go in a test copy, and you ask before
  each one, every time — a blanket "go ahead" earlier in a session does not
  carry to a different file or a new kind of change.
- **A test copy's contents are not the source you read.** It may already carry
  prior attempts, including your own. Re-read the target region in the copy
  before applying a diff written against somewhere else, or you will stack a fix
  on a fix.
- **Verify an edit parses without running it.** A parse-only probe catches
  syntax errors and per-chunk limits (register or local ceilings, where the
  language has them) before a playtest does.
- **Comment the mechanism and the trade, not the change.** The next reader needs
  to know why the bound exists and what it cost, with the measurement in it. A
  diff that reads on its own is the deliverable.
- **Bounding cost usually buys a trade.** Name it before the user finds it, and
  be precise about *where* it lands — check whether it hits the thing they are
  looking at, not only the background.

## What to hand over

Work is finished when someone else can act on it without redoing it:

- The **observation**, before and after, from the same instrument, normalised
  for window length.
- The **mechanism**, down to a line, with the source quoted.
- **Why earlier attempts failed**, if there were any — the most useful paragraph
  in the document and the one most often left out.
- The **trade** the fix makes, stated plainly.
- **What is untested.** Shared machinery reached by other modes was changed too
  and almost certainly not exercised. List those paths explicitly rather than
  implying coverage you do not have.
