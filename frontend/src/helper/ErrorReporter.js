/**
 * Client-side error capture.
 *
 * THE GAP THIS FILLS.
 *
 * There was no client error reporting of any kind: no Sentry or equivalent, no
 * window.onerror handler, no unhandledrejection handler. And the one boundary
 * that did catch things - PageTabs/TabErrorBoundary - logged only when
 * NODE_ENV === "development":
 *
 *   componentDidCatch(error) {
 *     process.env.NODE_ENV === "development" && console.log(error);
 *   }
 *
 * So in production a doctor's tab crashed, they saw the Mongolian error panel,
 * and the error itself was discarded. Nobody could find out that it had
 * happened, let alone what it was. For a system under a warranty that owes
 * monthly reports, "we cannot tell you how often this fails" is the problem.
 *
 * WHAT THIS DOES, AND WHAT IT DELIBERATELY DOES NOT.
 *
 * It always writes the error to the browser console, in every environment, so a
 * support call can start with "open the console and read me the last line". It
 * keeps the most recent entries in memory so the sequence leading to a crash is
 * visible rather than just the final throw, reachable from the console as
 * `window.__mnCardioErrors`.
 *
 * It does NOT send anything to a server by default. A sink endpoint needs three
 * decisions first, and guessing any of them would be worse than the gap:
 *
 *   - authentication, since an open POST is a spam vector (the backend's rate
 *     limiter is count-only today);
 *   - what a stack trace and a URL may contain, because these screens carry
 *     patient identifiers in the path;
 *   - retention, which is a customer question under the same rules as the rest
 *     of the record.
 *
 * When those are settled, set Report.Sink to a function and every captured
 * error will be handed to it. Nothing else has to change.
 */

const MAX_KEPT = 50;

const Recent = [];

function remember(entry) {
  Recent.push(entry);
  if (Recent.length > MAX_KEPT) Recent.shift();
  if (typeof window !== "undefined") window.__mnCardioErrors = Recent;
}

const Report = {
  /** Set this to ship errors somewhere. Left null on purpose - see the note above. */
  Sink: null,

  /**
   * @param {Error|any} error
   * @param {object} context  where it came from: { source, component, info }
   */
  Capture(error, context = {}) {
    const entry = {
      at: new Date().toISOString(),
      message: (error && error.message) || String(error),
      stack: (error && error.stack) || null,
      url: typeof window !== "undefined" ? window.location.href : null,
      ...context,
    };

    remember(entry);

    // Unconditional, unlike the old development-only log.
    console.error(
      "[mnCardio] " + (context.source || "error") + ":",
      error,
      context,
    );

    if (typeof Report.Sink === "function") {
      try {
        Report.Sink(entry);
      } catch (ex) {
        // A failing reporter must never become the thing that breaks the page.
        console.error("[mnCardio] error sink failed:", ex);
      }
    }
  },

  /** The recent entries, newest last. */
  Recent: () => Recent.slice(),

  /**
   * Catch what never reached a React boundary: errors thrown outside render,
   * and rejected promises nobody handled. Called once, from src/index.jsx.
   */
  Install() {
    if (typeof window === "undefined" || window.__mnCardioErrorsInstalled)
      return;
    window.__mnCardioErrorsInstalled = true;

    window.addEventListener("error", (e) => {
      Report.Capture(e.error || e.message, { source: "window.onerror" });
    });

    window.addEventListener("unhandledrejection", (e) => {
      Report.Capture(e.reason, { source: "unhandledrejection" });
    });
  },
};

export default Report;
