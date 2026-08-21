import { NextResponse } from "next/server";
import { schedulerStatus, startScheduler } from "@/lib/scheduler";

// What the unattended half is doing. Worth a route rather than a log line: the
// failure mode of every scheduler in this project so far has been running
// silently and reaching nobody, and "is it on?" needs an answer you can get
// without reading a terminal you may have closed.
export async function GET() {
  // Self-heal, because "enabled" and "ticking" are different things and only
  // one of them was observable. The timer is started once from
  // instrumentation.register() at boot — but in dev, editing anything
  // scheduler.ts imports (opencloud-run, opencloud-grab) makes HMR hand out a
  // fresh module instance whose `timer` is null, and register() does not run
  // again. Measured 2026-08-21: status kept reporting `enabled: true` with two
  // games `due` for fifteen minutes while no tick existed — precisely the
  // "running silently and reaching nobody" this route was added to catch,
  // wearing a green light.
  //
  // startScheduler() is idempotent (`if (timer) return`), so calling it here is
  // free when the timer is alive and repairs it when it is not.
  startScheduler();
  return NextResponse.json(await schedulerStatus());
}
