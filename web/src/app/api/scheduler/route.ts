import { NextResponse } from "next/server";
import { schedulerStatus } from "@/lib/scheduler";

// What the unattended half is doing. Worth a route rather than a log line: the
// failure mode of every scheduler in this project so far has been running
// silently and reaching nobody, and "is it on?" needs an answer you can get
// without reading a terminal you may have closed.
export async function GET() {
  return NextResponse.json(await schedulerStatus());
}
