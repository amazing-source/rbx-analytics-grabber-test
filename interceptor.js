// Runs in the PAGE context (MAIN world) so it can see the dashboard's own
// fetch/XHR calls. It makes no new requests, reads no cookies, and touches no
// credentials. It observes responses the page already loads — and now also the
// REQUEST body, since the analytics API is POST-based (the requested metric /
// date / game live in the request payload, not the URL).

(() => {
  const TAG = "__RBX_GRAB__";

  // "analytics" = only metric calls (recommended).  "all" = every roblox JSON call.
  const CAPTURE_MODE = "analytics";

  const ANALYTICS_RE = /analytics|insights|metric|retention|engagement|monetization|economy|funnel|kpi/i;

  const post = (payload) => {
    try { window.postMessage({ [TAG]: true, ...payload }, "*"); } catch (_) {}
  };

  const looksJson = (ct, text) => {
    if (ct && ct.includes("application/json")) return true;
    if (!text) return false;
    const c = text.trim()[0];
    return c === "{" || c === "[";
  };

  const wanted = (url) => {
    if (!/roblox\.com/.test(url)) return false;
    return CAPTURE_MODE === "all" ? true : ANALYTICS_RE.test(url);
  };

  const asText = (b) => {
    try {
      if (b == null) return null;
      if (typeof b === "string") return b;
      if (b instanceof URLSearchParams) return b.toString();
      return JSON.stringify(b);
    } catch { return null; }
  };

  // ---- patch fetch ----
  const origFetch = window.fetch;
  window.fetch = async function (...args) {
    // The dashboard sends its analytics POSTs as fetch(new Request(url, {body})),
    // so the metric name lives in args[0].body, not args[1].body. Clone the
    // Request BEFORE origFetch runs — fetch locks the body stream once it sends.
    let reqBodyPromise = Promise.resolve(null);
    try {
      if (typeof Request !== "undefined" && args[0] instanceof Request) {
        reqBodyPromise = args[0].clone().text().catch(() => null);
      } else if (args[1] && args[1].body != null) {
        reqBodyPromise = Promise.resolve(asText(args[1].body));
      }
    } catch (_) {}

    const res = await origFetch.apply(this, args);
    try {
      const url = (args[0] && args[0].url) || String(args[0]);
      if (wanted(url)) {
        const opts = args[1] || {};
        const method = opts.method || (args[0] && args[0].method) || "GET";
        const ct = res.headers.get("content-type") || "";
        Promise.all([reqBodyPromise, res.clone().text()]).then(([reqBody, text]) => {
          if (looksJson(ct, text)) {
            let body; try { body = JSON.parse(text); } catch { body = text; }
            post({ via: "fetch", url, method, reqBody, ts: Date.now(), body });
          }
        }).catch(() => {});
      }
    } catch (_) {}
    return res;
  };

  // ---- patch XHR ----
  const origOpen = XMLHttpRequest.prototype.open;
  const origSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url) {
    this.__rbx = { method, url };
    return origOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function (bodyArg) {
    if (this.__rbx) this.__rbx.reqBody = asText(bodyArg);
    this.addEventListener("readystatechange", () => {
      if (this.readyState !== 4 || !this.__rbx || !wanted(this.__rbx.url)) return;
      try {
        const ct = this.getResponseHeader("content-type") || "";
        const pack = (body) => post({
          via: "xhr", url: this.__rbx.url, method: this.__rbx.method,
          reqBody: this.__rbx.reqBody, ts: Date.now(), body
        });
        if (this.responseType === "json") { pack(this.response); return; }
        const text = (this.responseType === "" || this.responseType === "text") ? this.responseText : "";
        if (looksJson(ct, text)) {
          let body; try { body = JSON.parse(text); } catch { body = text; }
          pack(body);
        }
      } catch (_) {}
    });
    return origSend.apply(this, arguments);
  };

  // ---- ACTIVE GRABBER (replay) ----------------------------------------------
  // The collector (ISOLATED world) sends a "grab plan" of requests; we replay
  // them HERE, in the page context, so the browser attaches the same auth the
  // dashboard uses. We never read or store the cookie \u2014 fetch carries it.
  // CSRF: Roblox returns an x-csrf-token header on a 403 challenge; capture it
  // and retry. Async: the metrics gateway may answer done:false first, so poll.
  const EXEC = "__RBX_EXEC__";
  const EXEC_RESULT = "__RBX_EXEC_RESULT__";
  let csrfToken = null;

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const isResolved = (body) => {
    if (!body || typeof body !== "object") return true;
    if (body.operation) {
      if (body.operation.done === false) {
        return !!(
          body.operation.queryResult || body.operation.metricMetadataResult
        );
      }
      return true;
    }
    return true; // benchmark { result: {...} } is synchronous
  };

  async function rawFetch(url, method, bodyStr) {
    const headers = {};
    // A GET with a content-type header and a body is malformed and some Roblox
    // endpoints reject it outright.
    if (bodyStr != null) headers["content-type"] = "application/json";
    if (csrfToken) headers["x-csrf-token"] = csrfToken;
    let res = await origFetch(url, {
      method,
      headers,
      body: bodyStr,
      credentials: "include",
    });
    // CSRF challenge: grab the token from the response header and retry once.
    if (res.status === 403) {
      const t = res.headers.get("x-csrf-token");
      if (t && t !== csrfToken) {
        csrfToken = t;
        res = await origFetch(url, {
          method,
          headers: { ...headers, "x-csrf-token": csrfToken },
          body: bodyStr,
          credentials: "include",
        });
      }
    }
    const text = await res.text().catch(() => "");
    let body;
    try { body = JSON.parse(text); } catch { body = text; }
    return { status: res.status, body };
  }

  // The gateway answers 202 (accepted, still computing) as well as 200 with
  // done:false. Treating 202 as a failure silently dropped whole metrics, so
  // poll on any 2xx and back off — slow queries just need longer than fast ones.
  const isPending = (status) => status >= 200 && status < 300;

  async function execOne(request) {
    const bodyStr = request.body === undefined ? null : JSON.stringify(request.body);
    let last = await rawFetch(request.url, request.method, bodyStr);
    for (let i = 0; i < 10 && isPending(last.status) && !isResolved(last.body); i++) {
      await sleep(Math.min(1000 + i * 500, 4000));
      last = await rawFetch(request.url, request.method, bodyStr);
    }
    return { status: last.status, reqBody: bodyStr, body: last.body };
  }

  window.addEventListener("message", async (event) => {
    if (event.source !== window) return;
    const d = event.data;
    if (!d || !d[EXEC] || !d.request) return;
    try {
      const out = await execOne(d.request);
      window.postMessage(
        {
          [EXEC_RESULT]: true,
          id: d.id,
          ok: isPending(out.status) && isResolved(out.body),
          status: out.status,
          url: d.request.url,
          method: d.request.method,
          kind: d.request.kind,
          metric: d.request.metric,
          reqBody: out.reqBody,
          body: out.body,
        },
        "*"
      );
    } catch (e) {
      window.postMessage(
        { [EXEC_RESULT]: true, id: d.id, ok: false, status: 0, error: String(e && e.message || e) },
        "*"
      );
    }
  });

  console.log("%c[RBX Grab] interceptor active \u00b7 mode=" + CAPTURE_MODE, "color:#9b87f5;font-weight:bold");
})();