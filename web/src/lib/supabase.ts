// Server-only Supabase client. Uses the SECRET key, which bypasses RLS — so it
// must never be imported into a Client Component. Phase 1 access is entirely
// server-side (route handlers), so the publishable key isn't needed yet.

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;

if (!url || !key) {
  throw new Error("Missing SUPABASE_URL / SUPABASE_SECRET_KEY in environment");
}

export const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
