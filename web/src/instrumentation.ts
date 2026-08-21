// Next.js runs this once when the server boots. It is the only place a
// long-lived timer can be started without tying it to a request.
export async function register() {
  // Edge and build passes import this too; the scheduler touches the disk and
  // the Open Cloud key, so it belongs to the Node runtime only.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.RBX_SCHEDULER === "off") {
    console.log("[scheduler] disabled by RBX_SCHEDULER=off");
    return;
  }
  const { startScheduler } = await import("@/lib/scheduler");
  startScheduler();
}
