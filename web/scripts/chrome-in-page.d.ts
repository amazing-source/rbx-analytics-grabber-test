// `chrome.*` inside a page.evaluate() body runs in the BROWSER, not in Node, so
// tsc has no ambient declaration for it. Declaring the one call we make is
// lighter than pulling @types/chrome into a Node-only script folder — and it
// keeps the surface honest: if a script starts using more of the extension API,
// that shows up here as a deliberate addition.
declare const chrome: {
  runtime: { sendMessage(message: unknown): Promise<unknown> };
};
