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

const originCallback = function (origin, callback) {
  // No origin: same-origin, a mobile app, or a tool like Postman.
  if (!origin) return callback(null, true);

  if (IsDevelopment() || AllowedOrigins().includes(origin)) {
    return callback(null, true);
  }
  return callback(new Error('Not allowed by CORS'));
};

module.exports = { originCallback, AllowedOrigins };
