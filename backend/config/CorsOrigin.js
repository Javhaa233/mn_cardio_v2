/**
 * The one allowed-origin list, shared by the Express CORS middleware and the
 * Socket.IO servers.
 *
 * It lives here rather than in server.js because WebSockets/*.js need it and
 * requiring server.js from a socket module would close a cycle
 * (server.js -> controllers -> ChatSocket -> server.js).
 *
 * Socket.IO v4 does NOT inherit Express's cors() - it has its own request
 * handler, so a socket server created without a `cors` option sends no
 * Access-Control-Allow-Origin and the browser blocks the cross-origin polling
 * handshake. That is why this is exported at all.
 */

// Matches server.js:9 exactly - NOT `=== 'development'`. NODE_ENV is unset in
// several environments, and tightening this would silently break CORS there.
// Read lazily so it reflects Config.env, which server.js loads at require time.
const IsDevelopment = () => process.env.NODE_ENV !== 'production';

const AllowedOrigins = () =>
  [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'https://localhost:3000',
    'https://localhost:3001',
    'https://127.0.0.1:3000',
    'http://smr.telemedicine.mn',
    'https://smr.telemedicine.mn',
    process.env.CLIENT_APP_URL,
  ].filter(Boolean);

/**
 * Compare origins without tripping over a trailing slash.
 *
 * A browser sends `Origin: https://host` with no path and no trailing slash,
 * but CLIENT_APP_URL is written WITH one because the password-reset flow builds
 * links by concatenation (`CLIENT_APP_URL + 'auth/ResetPassword?...'`), which
 * breaks without it. A plain equality check therefore rejects the very origin
 * the deployment configured, and the failure surfaces as HTTP 500
 * "Not allowed by CORS" on login — which looks like bad credentials rather than
 * a configuration mismatch. Cost an afternoon on mncardio.itsystem.mn.
 */
const Normalize = (value) => String(value || '').trim().replace(/\/+$/, '').toLowerCase();

const originCallback = function (origin, callback) {
  // No origin: same-origin, a mobile app, or a tool like Postman.
  if (!origin) return callback(null, true);

  if (IsDevelopment()) return callback(null, true);

  const Wanted = Normalize(origin);
  if (AllowedOrigins().some((allowed) => Normalize(allowed) === Wanted)) {
    return callback(null, true);
  }

  console.log('CORS rejected origin: ' + origin);
  return callback(new Error('Not allowed by CORS'));
};

module.exports = { originCallback, AllowedOrigins };
