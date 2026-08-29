// Read a Roblox MicroProfiler HTML dump and print its summary.
//
//   node tools/mp-summary.js <dump.html> [outFile.json]
//
// WHY THIS EXISTS, because the obvious approach does not work. The dump is
// base64 in an HTML comment -> "GAK" + uint32 rawSize + uint32 packedSize ->
// zlib -> ~8 MB of BINARY. That binary is decoded by a second block in the same
// file: an Emscripten/WASM viewer (`var ToolsModule=...`). The format is only
// described by that compiled WASM, so hand-parsing it means reverse-engineering
// a wasm blob and inventing numbers when you get it wrong.
//
// So this does not parse the capture. It RUNS the viewer -- headless Chrome via
// the DevTools Protocol -- patches URL.createObjectURL, clicks the viewer's own
// "Summary to JSON" link, and captures the Blob it would have downloaded. The
// decoding is done by the same WASM that Roblox ships, so the numbers are the
// viewer's own.
//
// Needs Chrome installed (path below) and Node 18+ for global fetch/WebSocket.
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const CHROME_CANDIDATES = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
];
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Click the viewer's export link and hand back the Blob it made.
const GRAB = `
(async function(){
  window.__blob = null;
  const orig = URL.createObjectURL;
  URL.createObjectURL = function(b){ window.__blob = b; return orig.call(URL, b); };
  const a = Array.from(document.querySelectorAll("a"))
    .find(e => (e.textContent||"").trim() === "Summary to JSON");
  if (!a) return "ERR: export link not found - did the viewer finish loading?";
  a.click();
  await new Promise(r => setTimeout(r, 6000));
  if (!window.__blob) return "ERR: no blob captured";
  return await window.__blob.text();
})()`;

async function summarise(file, { waitMs = 22000, port = 9335 } = {}) {
  const chromePath = CHROME_CANDIDATES.find(p => fs.existsSync(p));
  if (!chromePath) throw new Error("no Chrome/Edge found - edit CHROME_CANDIDATES");
  const profile = path.join(process.env.TEMP || ".", "mp-summary-profile");

  const proc = spawn(chromePath, [
    "--headless=new", "--disable-gpu", "--no-sandbox",
    "--allow-file-access-from-files",
    "--user-data-dir=" + profile,
    "--remote-debugging-port=" + port,
    "file:///" + path.resolve(file).replace(/\\/g, "/"),
  ], { stdio: "ignore" });

  try {
    let target = null;
    for (let i = 0; i < 40 && !target; i++) {
      await sleep(500);
      try {
        const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
        target = list.find(t => t.type === "page" && t.url.startsWith("file:"));
      } catch {}
    }
    if (!target) throw new Error("chrome never exposed a file:// page target");

    const ws = new WebSocket(target.webSocketDebuggerUrl);
    let id = 0;
    const pending = new Map();
    ws.onmessage = ev => {
      const m = JSON.parse(ev.data);
      if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    };
    await new Promise(r => (ws.onopen = r));

    // the WASM has to finish decoding before the export link does anything
    await sleep(waitMs);

    const reply = await new Promise(res => {
      const myId = ++id;
      pending.set(myId, res);
      ws.send(JSON.stringify({
        id: myId, method: "Runtime.evaluate",
        params: { expression: GRAB, returnByValue: true, awaitPromise: true, userGesture: true },
      }));
    });
    ws.close();

    const val = reply.result && reply.result.result && reply.result.result.value;
    if (typeof val !== "string" || val.startsWith("ERR:")) throw new Error(val || "no value returned");
    return JSON.parse(val);
  } finally {
    proc.kill();
  }
}

function report(j) {
  const L = [];
  L.push(`frames ${j.num_frames}  ·  jobs-heavy ${j.num_frames_jobs_heavy}  ·  rendering-heavy ${j.num_frames_rendering_heavy}  ·  gpu-heavy ${j.num_frames_gpu_heavy}`);
  L.push(`CPU  median ${j.cpu_time_median.toFixed(2)}  mean ${j.cpu_time_mean.toFixed(2)}  max ${j.cpu_time_max.toFixed(2)} ms`);
  L.push(`GPU  median ${j.gpu_time_ext_median.toFixed(3)}  mean ${j.gpu_time_ext_mean.toFixed(3)}  max ${j.gpu_time_ext_max.toFixed(3)} ms`);
  L.push("", "top CPU scopes by total time (ms):");
  for (const r of (j.cpu_top_by_total_time || []).slice(0, 15)) {
    L.push(`  ${r.total.toFixed(2).padStart(10)}  ${r.name}`);
  }
  L.push("", "top GPU scopes by total time (ms):");
  for (const r of (j.gpu_top_by_total_time || []).slice(0, 6)) {
    L.push(`  ${r.total.toFixed(2).padStart(10)}  ${r.name}`);
  }
  return L.join("\n");
}

if (require.main === module) {
  const [file, out] = process.argv.slice(2);
  if (!file) { console.error("usage: node tools/mp-summary.js <dump.html> [out.json]"); process.exit(1); }
  summarise(file)
    .then(j => {
      console.log(report(j));
      if (out) { fs.writeFileSync(out, JSON.stringify(j, null, 1)); console.log(`\nfull summary -> ${out}`); }
    })
    .catch(e => { console.error("failed:", e.message); process.exit(1); });
}

module.exports = { summarise, report };
