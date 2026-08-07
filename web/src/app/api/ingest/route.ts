import { NextResponse } from "next/server";
import { ingestCaptures } from "@/lib/store";
import { parseCaptures, type Capture } from "@/lib/parse-captures";
import { exportToFiles, saveRawCaptures, exportGrabReport, type GrabReport } from "@/lib/export-files";

// The extension posts from https://create.roblox.com — allow cross-origin.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
  // create.roblox.com (public) -> localhost (private) needs Private Network
  // Access approval, or Chrome blocks the request with "Failed to fetch".
  "Access-Control-Allow-Private-Network": "true",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: Request) {
  let payload: { captures?: Capture[]; report?: GrabReport | null };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400, headers: CORS });
  }
  const captures = payload?.captures;
  if (!Array.isArray(captures)) {
    return NextResponse.json(
      { error: "expected { captures: [...] }" },
      { status: 400, headers: CORS }
    );
  }

  // Parse once, up front. The file mirror is written from this even if Supabase
  // is unreachable — losing a grab because a database is down is the one
  // failure mode this tool can't afford.
  const parsed = parseCaptures(captures);

  const files: { raw?: string; dataDir?: string; written?: number; report?: string; error?: string } = {};
  try {
    // The report is written first and independently: if the grab returned no
    // usable captures at all, the report is the only artifact — and the one
    // that explains why.
    if (payload.report?.universeId) {
      files.report = await exportGrabReport(payload.report);
    }
    if (captures.length) {
      files.raw = await saveRawCaptures(captures, parsed.games[0] ?? null);
      const summary = await exportToFiles(parsed);
      files.dataDir = summary.dataDir;
      files.written = summary.files;
    }
  } catch (e) {
    files.error = (e as Error).message;
  }

  try {
    const counts = await ingestCaptures(captures);
    return NextResponse.json({ ok: true, counts, files }, { headers: CORS });
  } catch (e) {
    // Files are already on disk at this point — report the DB failure, but tell
    // the caller the data itself was not lost.
    return NextResponse.json(
      {
        ok: false,
        error: (e as Error).message,
        savedToFiles: !files.error,
        files,
        counts: {
          games: parsed.games.length,
          snapshots: parsed.snapshots.length,
          metrics: new Set(parsed.snapshots.map((s) => s.metric)).size,
          benchmarks: parsed.benchmarks.length,
          templates: parsed.templates.length,
        },
      },
      { status: 200, headers: CORS }
    );
  }
}
