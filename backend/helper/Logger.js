/**
 * Levelled logging.
 *
 * WHAT THIS REPLACES, AND WHY.
 *
 * There was no logger at all - 810 `console.*` calls, 468 of them inside request
 * handlers - and server.js patched `console.log` in production like this:
 *
 *   if the first argument is an Error, or is a string containing "error",
 *   "exception" or "fail", send it to stderr; otherwise drop it silently.
 *
 * Classifying by substring gets it wrong in both directions.
 * `console.log('Payment failed for user X')` was promoted to stderr on the
 * strength of the word "failed", while `console.log('[Auth] token rejected')`
 * was thrown away. And because everything else was dropped, roughly 388
 * controller diagnostics simply did not exist in production - including the
 * boot banner and the route registrations, so there was no record of what a
 * running server had actually mounted.
 *
 * On any host NOT labelled exactly `production` the opposite applied: nothing
 * was dropped, and 42 call sites JSON.stringify whole response payloads -
 * patient records among them - into the log.
 *
 * NO DEPENDENCY, DELIBERATELY. winston or pino would each add a tree to a
 * codebase that owes a formal security audit, and helper/RateLimit.js already
 * set the precedent of writing the small thing in-house. This is ~60 lines.
 *
 * LEVELS. error < warn < info < debug. LOG_LEVEL sets the threshold; the
 * default is `info` in production and `debug` everywhere else, which keeps
 * today's behaviour for developers and gives production a boot record it never
 * had.
 *
 * The `console.*` call sites are NOT rewritten - there are 810 of them.
 * server.js routes them through here instead: console.log -> debug (so the
 * payload dumps stay out of production logs, exactly as before), console.warn ->
 * warn, console.error -> error. Files that deliberately used console.error to
 * survive the old patch - SchemaProbe, FeatureFlags, RateLimit - keep working
 * unchanged.
 *
 * TIMESTAMPS. PM2 adds its own when `time: true` (ecosystem.config.js), so one
 * is only printed when running outside PM2. Otherwise every line would carry two.
 */

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

const DefaultLevel = () => (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

const Configured = String(process.env.LOG_LEVEL || '').toLowerCase();
const Threshold = LEVELS[Configured] !== undefined ? LEVELS[Configured] : LEVELS[DefaultLevel()];

// PM2 sets pm_id on every managed process.
const UnderPm2 = process.env.pm_id !== undefined;

const Native = {
  error: console.error.bind(console),
  warn: console.warn.bind(console),
  info: console.log.bind(console),
  debug: console.log.bind(console),
};

function emit(level, args) {
  if (LEVELS[level] > Threshold) return;
  const prefix = UnderPm2
    ? '[' + level.toUpperCase() + ']'
    : new Date().toISOString() + ' [' + level.toUpperCase() + ']';
  // error and warn go to stderr so PM2 separates them into api-error.log
  const sink = level === 'error' || level === 'warn' ? Native.error : Native.info;
  sink(prefix, ...args);
}

const Logger = {
  error: (...args) => emit('error', args),
  warn: (...args) => emit('warn', args),
  info: (...args) => emit('info', args),
  debug: (...args) => emit('debug', args),

  /** The active threshold, for the boot banner. */
  Level: () => Object.keys(LEVELS).find((k) => LEVELS[k] === Threshold),

  /**
   * Point console.* at this logger. Called once, from server.js, before
   * anything else requires a controller.
   */
  CaptureConsole() {
    console.log = (...args) => emit('debug', args);
    console.info = (...args) => emit('info', args);
    console.warn = (...args) => emit('warn', args);
    console.error = (...args) => emit('error', args);
  },
};

module.exports = Logger;
