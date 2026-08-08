# RBX Analytics Grabber

Internal tool for Indigo: pull every Creator Dashboard metric for an owned Roblox game in one
shot, tag updates, and compare metrics before/after. It reads only data you're already
authorized to see, never touches auth cookies, and makes no request the dashboard doesn't
already make itself.

Two parts: a thin MV3 Chrome extension (this folder) and a Next.js + Supabase web app
(`web/`). Every grab lands in **two** places — Supabase, and the plain-file mirror in
[`data/`](data/) that needs no server to read.

## Setup

**1. Start the web app** (the extension talks to it on `localhost:3000`):

```
cd web
npm install
npm run dev
```

> If a grab reports *"web app not reachable"*, this is what isn't running. The extension
> still saves the raw bundle to `data/raw/` either way — see [Offline](#offline) below.

**2. Load the extension** (Chrome / Edge / Brave):

1. Go to `chrome://extensions`
2. Turn on **Developer mode** (top right)
3. **Load unpacked** → select this folder
4. Open a game's Analytics dashboard on `https://create.roblox.com/...`

An "RBX Grab" panel appears bottom-right.

## Pulling a game

Put the **universeId** in the panel (it's pre-filled from the URL), optionally set a date
range, and hit **Pull all metrics**. The extension asks the web app for a grab plan, replays
those requests in your logged-in session, saves the raw bundle to `data/raw/`, and posts it
to the web app for ingest.

The plan is built into the web app (`web/src/lib/default-plan.ts`), so this works on a game
whose dashboard you've never opened. It covers retention, monetization, engagement, funnels
and performance. Anything the dashboard requests that we didn't anticipate is learned
automatically on passive capture and merged into later plans.

Passive capture still works too: click through the dashboard tabs and the panel counts what
it sees, then **Send captured**.

## Where the data goes

- **`data/`** — the file mirror. `data/games/<universeId>/summary.md` is the human/agent
  entry point; alongside it are `series.json`, per-metric CSVs, and a daily rollup of the
  hourly metrics. See [`data/README.md`](data/README.md) for the semantics (UTC alignment,
  estimated points, rate vs volume).
- **Supabase** — what the web app charts. Schema in `web/supabase/schema.sql`.

## Offline

A grab that reached Roblox is never lost, even with the web app or Supabase down: the raw
bundle is written to `data/raw/` first. To turn one into the readable export without any
server:

```
cd web
npm run ingest:file -- ../data/raw/<file>.json
```

## Checking the numbers are right

Three commands, all offline. Keep them green — they are what make the output trustworthy
rather than merely confident. See [`CORRECTNESS_PLAN.md`](CORRECTNESS_PLAN.md) and
[`data/verify/COVERAGE.md`](data/verify/COVERAGE.md).

```
cd web
npm run verify -- ../data/verify/9610561918/   # diff every stored cell against Roblox's own CSV exports
npm run audit-plan                             # every query shape is observed/proven, never a guess
npm test                                       # regression fixtures for every known defect
```

## Layout

- `interceptor.js` — MAIN world. Sees the page's own fetch/XHR (including request bodies,
  where the metric name lives) and replays plan requests in the page's session.
- `collector.js` — ISOLATED world. Holds captures, draws the panel, saves to disk, forwards
  to the web app.
- `background.js` — service worker. The only place allowed to call localhost and
  `chrome.downloads`.
- `web/` — Next.js app: ingest, storage, charts, update tagging.

## Rules

- Own games only.
- No auth cookie is ever read, stored, or transmitted.
- The Anthropic key (Phase 3) lives server-side only.
