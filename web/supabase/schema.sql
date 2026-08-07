-- Indigo LiveOps — Phase 1 schema.
-- Paste into Supabase SQL Editor (or run via the CLI). Mirrors the output of
-- src/lib/parse-captures.ts. Ingest runs with the service_role key and writes
-- here; RLS-per-producer is added in Phase 4 with auth.

-- One owned game / universe.
create table if not exists games (
  id          text primary key,            -- Roblox universeId
  name        text,
  genre       text,                         -- from benchmark metadata
  created_at  timestamptz not null default now()
);

-- Current metric name -> response path hash. Rebuilt on every ingest.
create table if not exists metric_catalog (
  game_id     text not null references games(id) on delete cascade,
  metric      text not null,
  hash        text not null,
  updated_at  timestamptz not null default now(),
  primary key (game_id, metric)
);

-- One row per (game, metric, ts, granularity, series). series_key folds the
-- breakdown + request filters so distinct series never overwrite each other.
-- Upsert on the PK => last-write-wins on re-capture.
create table if not exists metric_snapshots (
  game_id        text not null references games(id) on delete cascade,
  metric         text not null,
  ts             timestamptz not null,
  date           date not null,
  granularity    text not null,
  series_key     text not null,
  breakdown      jsonb not null default '{}'::jsonb,
  filters        jsonb not null default '[]'::jsonb,
  value          double precision,
  string_values  jsonb not null default '[]'::jsonb,
  status         text,                       -- e.g. DATA_STATUS_INVALID (flag, not error)
  ingested_at    timestamptz not null default now(),
  primary key (game_id, metric, granularity, series_key, ts)
);
create index if not exists metric_snapshots_lookup
  on metric_snapshots (game_id, metric, date);

-- Genre benchmark percentiles (p50/p90) for above/below verdicts.
create table if not exists benchmarks (
  game_id     text not null references games(id) on delete cascade,
  metric      text not null,
  percentile  text not null,                -- "50" | "90"
  genre       text,
  ts          timestamptz not null,
  date        date not null,
  value       double precision,
  primary key (game_id, metric, percentile, ts)
);

-- Metric freshness — the comparison engine refuses/flags un-matured cohorts.
create table if not exists metric_freshness (
  metric                text primary key,
  latest_available_time timestamptz not null,
  updated_at            timestamptz not null default now()
);

-- Universe-independent request templates harvested from captures. The active
-- grabber replays these against any owned universeId — see /api/grab-plan.
create table if not exists grab_templates (
  key           text primary key,
  kind          text not null,                -- "metric" | "benchmark"
  metric        text not null,
  resource_type text not null default 'RESOURCE_TYPE_UNIVERSE',
  query         jsonb not null,               -- query body minus startTime/endTime
  updated_at    timestamptz not null default now()
);

-- Manual update tags (Phase 1 annotations on the charts).
create table if not exists updates (
  id          uuid primary key default gen_random_uuid(),
  game_id     text not null references games(id) on delete cascade,
  title       text not null,
  occurred_at timestamptz not null,
  notes       text,
  created_at  timestamptz not null default now()
);
create index if not exists updates_game on updates (game_id, occurred_at);
