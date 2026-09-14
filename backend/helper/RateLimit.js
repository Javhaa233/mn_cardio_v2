/**
 * Fixed-window request limiting, in process memory.
 *
 * There is no rate limiting anywhere in this backend today, and
 * express.json sits at a 100mb limit, so an unauthenticated caller can put
 * arbitrary load on the box. That is recorded as a security finding
 * (CLAUDE.md §10) and matters more once a public app store listing exists.
 *
 * IN PROCESS, AND THAT IS A DELIBERATE CHOICE, NOT A SHORTCUT.
 * ecosystem.config.js pins exec_mode 'fork' with instances: 1 - already
 * required, because Socket.IO room fan-out is per-process (WebSockets/
 * ChatSocket.js) and cluster mode would silently drop chat members without a
 * Redis adapter. One process means one counter, so a Map is correct and a
 * dependency would buy nothing. IF instances IS EVER RAISED, THIS NEEDS THE
 * SAME REDIS TREATMENT AS THE SOCKET LAYER, and so does chat.
 *
 * TWO ENVELOPES, BY PREFIX. The mobile and generic surfaces speak lowercase
 * { success, message, data, code } with real status codes, so they get a real
 * 429. The 49 legacy prefixes must not: frontend/src/helper/BaseCrudHelper.jsx
 * turns any non-2xx into a silent { Success: false, Data: null } with no
 * message, so a 429 there would surface to a doctor as a blank failure with no
 * explanation. They get HTTP 200 and the PascalCase envelope carrying a real
 * Mongolian message, which AuthHelper renders verbatim.
 *
 * DEFAULTS TO COUNTING ONLY. RATE_LIMIT_ENABLED is false, so the first deploy
 * measures instead of rejecting. Read the logs, find out what normal traffic
 * looks like for a hospital shift, then turn it on. Guessing a limit and
 * enforcing it on day one is how you block a ward.
 *
 * Requires app.set('trust proxy', 1) in server.js. nginx terminates TLS and the
 * server binds 127.0.0.1, so without it req.ip is the proxy for every caller
 * and the whole internet shares one bucket.
 */

const Flags = require('./FeatureFlags');

/** key -> { Count, WindowStart } */
const Buckets = new Map();

/** Purge expired windows so the Map tracks active clients, not every client ever. */
function Sweep(Now, WindowMs) {
  if (Buckets.size < 10000) return;
  Buckets.forEach((v, k) => {
    if (Now - v.WindowStart > WindowMs) Buckets.delete(k);
  });
}

function Hit(Key, WindowMs, Max) {
  const Now = Date.now();
  Sweep(Now, WindowMs);

  let B = Buckets.get(Key);
  if (!B || Now - B.WindowStart >= WindowMs) {
    B = { Count: 0, WindowStart: Now };
  }
  B.Count += 1;
  Buckets.set(Key, B);

  const RetryAfterSec = Math.ceil((B.WindowStart + WindowMs - Now) / 1000);
  return { Over: B.Count > Max, Count: B.Count, RetryAfterSec };
}

const MOBILE_PREFIXES = ['/api/patient', '/api/doctor', '/api/auth', '/api/base', '/api/report'];

function IsLowercaseSurface(req) {
  const P = String(req.originalUrl || req.url || '').toLowerCase();
  return MOBILE_PREFIXES.some((x) => P.startsWith(x));
}

function Refuse(req, res, RetryAfterSec) {
  res.set('Retry-After', String(Math.max(1, RetryAfterSec)));

  const Message = 'Хэт олон хүсэлт илгээлээ. Түр хүлээнэ үү.';

  if (IsLowercaseSurface(req)) {
    return res.status(429).json({
      success: false,
      code: 'RATE_LIMITED',
      message: Message,
      data: null,
    });
  }

  // HTTP 200 on purpose - see the envelope note in the file header.
  return res.status(200).send({ Success: false, Message: Message, Data: null });
}

/**
 * Coarse per-IP limit across everything.
 *
 * Keyed on IP alone rather than IP plus user, because the traffic this is meant
 * to bound is mostly unauthenticated, and an authenticated flood is better
 * handled by the account controls in LoginGuard.
 */
function Global() {
  const WindowMs = 60 * 1000;

  return function GlobalLimit(req, res, next) {
    const Max = Flags.RateLimitGlobalMax;
    const { Over, Count, RetryAfterSec } = Hit('g:' + req.ip, WindowMs, Max);

    if (Over) {
      if (!Flags.RateLimitEnabled) {
        // Counting mode: say what WOULD have been refused, refuse nothing.
        if (Count === Max + 1) {
          console.error(
            `[RateLimit] would refuse ${req.ip} - ${Count} requests/min exceeds ${Max} (counting only)`
          );
        }
        return next();
      }
      return Refuse(req, res, RetryAfterSec);
    }

    return next();
  };
}

/**
 * A much tighter bucket for credential endpoints.
 *
 * Separate from the lockout in LoginGuard and complementary to it: that one
 * protects a named account from being guessed at, this one protects the box
 * from someone spraying many usernames from one address. Neither substitutes
 * for the other.
 */
function Auth() {
  return function AuthLimit(req, res, next) {
    const WindowMs = Flags.RateLimitAuthWindowMin * 60 * 1000;
    const Max = Flags.RateLimitAuthMax;
    const { Over, Count, RetryAfterSec } = Hit('a:' + req.ip, WindowMs, Max);

    if (Over) {
      if (!Flags.RateLimitEnabled) {
        if (Count === Max + 1) {
          console.error(
            `[RateLimit] would refuse auth from ${req.ip} - ${Count} attempts in ` +
              `${Flags.RateLimitAuthWindowMin}min exceeds ${Max} (counting only)`
          );
        }
        return next();
      }
      return Refuse(req, res, RetryAfterSec);
    }

    return next();
  };
}

/** The credential paths the Auth bucket guards. Matched case-insensitively. */
const AUTH_PATHS = [
  '/api/user/login',
  '/api/user/forgetpassword',
  '/api/user/resetpassword',
  '/api/patientuser/login',
  '/api/patientuser/forgotpassword',
  '/api/patientuser/resetpassword',
  '/api/userrequest/register',
  '/api/auth/refresh',
];

/**
 * Applies the Auth bucket only on the credential paths, so it can be registered
 * once, globally, instead of edited into eight route files. Express matches
 * paths case-insensitively and so does this.
 */
function AuthPaths() {
  const Limiter = Auth();

  return function AuthPathLimit(req, res, next) {
    const P = String(req.path || '').toLowerCase();
    if (!AUTH_PATHS.includes(P)) return next();
    return Limiter(req, res, next);
  };
}

module.exports = { Global, Auth, AuthPaths };
