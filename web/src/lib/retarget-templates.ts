// Learned templates come from a table that is NOT scoped by universe, so every
// game's captured request shapes pool together. This module re-scopes one to the
// universe it is about to run against.
//
// Kept out of store.ts on purpose: store.ts imports the Supabase client, which
// throws at module-import time when the env is unset, and this logic has to be
// testable without a database.
import type { Discovered } from "./default-plan";

type Filter = { dimension?: string; values?: string[]; operation?: string };

// `filter` is `unknown[]` to match SeedTemplate["query"], whose filters come
// from captured JSON and are only structurally known. Narrowed below.
type Query = {
  metric: string;
  granularity?: string;
  breakdown?: unknown[];
  filter?: unknown[];
  limit?: number;
};

// Dimension NAMES are stable across universes; their VALUES are not. A learned
// template captured on one game carries that game's values, and `grab_templates`
// is not scoped by universe — so these are the dimensions whose values must be
// re-targeted (or the template dropped) before replaying it elsewhere.
const UNIVERSE_SCOPED_DIMENSIONS = new Set([
  "Place", "PlaceVersion", "FirstSeenPlaceVersion",
  "FunnelName", "FunnelStep", "MessageHash", "AvatarItemId",
]);


/**
 * Re-scope a learned template to `universe`'s own dimension values, or return
 * null to drop it.
 *
 * `grab_templates` is keyed on the template alone and is NOT scoped by
 * universe, so every game's learned templates pool together. Dimension NAMES
 * are stable across universes but their VALUES are not, and a learned template
 * carries the values it was captured with. Replaying Verity's
 * `FunnelName: Conversation` against another game returns a valid 200 with zero
 * rows — indistinguishable from "this game does not use funnels", which is
 * precisely the false finding CLAUDE.md exists to prevent.
 *
 * Measured 2026-09-03 on 10192528661: 910 of 1000 learned templates carried
 * foreign values, producing 314 empty-200 funnel requests under 14 funnel names
 * belonging to other games, plus a Place filter naming Waterslide's seven
 * places (403).
 */
export function retargetLearnedQuery(
  q: Query,
  discovered: Discovered | undefined
): { query: Query; changed: boolean } | { query: null; dimension: string } {
  const filter = q?.filter as Filter[] | undefined;
  if (!Array.isArray(filter) || !filter.length) return { query: q, changed: false };

  const scopedValues = (dim: string): string[] | null => {
    if (dim === "Place") {
      const p = discovered?.__places;
      return p?.length ? p : null;
    }
    const v = (discovered as Record<string, string[]> | undefined)?.[dim];
    return v?.length ? v : null;
  };

  let changed = false;
  const out: Filter[] = [];
  for (const f of filter) {
    const dim = f?.dimension;
    if (!dim || !UNIVERSE_SCOPED_DIMENSIONS.has(dim)) {
      out.push(f);
      continue;
    }
    // NOT_CONTAINS "-1" is a sentinel that strips unresolved hashes, not a
    // per-universe value — keep it verbatim.
    if ((f.values ?? []).length && (f.values ?? []).every((v) => v === "-1")) {
      out.push(f);
      continue;
    }
    const mine = scopedValues(dim);
    if (!mine) return { query: null, dimension: dim };
    const same =
      mine.length === (f.values ?? []).length && mine.every((v, i) => v === f.values?.[i]);
    if (!same) changed = true;
    out.push({ ...f, values: mine });
  }
  return { query: { ...(q as object), filter: out } as Query, changed };
}

