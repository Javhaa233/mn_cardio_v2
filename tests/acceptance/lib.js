/**
 * Shared plumbing for the acceptance harness.
 *
 * The one idea worth understanding here is `classify()`. This backend answers
 * failures on the legacy layer with **HTTP 200** and a `{Success:false}` body
 * (CLAUDE.md §5). A harness that keys on the status code therefore reports a
 * broken system as green, which is the single easiest way for a test suite to
 * lie. Every response goes through classify(), which reads the body.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const ROOT = path.resolve(__dirname, '..', '..');

function readEnv(file) {
  const m = new Map();
  if (!fs.existsSync(file)) return m;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const x = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
    if (x) m.set(x[1], x[2].trim());
  }
  return m;
}

const ENV = readEnv(path.join(ROOT, 'test-environment.env'));

const CONFIG = {
  base: process.env.ACCEPTANCE_BASE || 'https://mncardio.itsystem.mn',
  doctorUser: ENV.get('TEST_DOCTOR_USER'),
  doctorPass: ENV.get('TEST_DOCTOR_PASSWORD'),
  patientUser: ENV.get('TEST_PATIENT_USER'),
  patientPass: ENV.get('TEST_PATIENT_PASSWORD'),
  /*
   * Admin account (RoleId 1) — several endpoints are admin-only.
   *
   * Read from test-environment.env or the environment. NEVER hardcode a
   * password here as a convenience default: this file is committed, and the
   * secret checker correctly refuses to publish an export that contains one.
   */
  adminUser: process.env.ACCEPTANCE_ADMIN_USER || ENV.get('TEST_ADMIN_USER'),
  adminPass: process.env.ACCEPTANCE_ADMIN_PASS || ENV.get('TEST_ADMIN_PASSWORD'),
};

/** One HTTP call. Never throws; a transport error becomes a result object. */
function request(opts) {
  const url = new URL((opts.path.startsWith('http') ? '' : CONFIG.base) + opts.path);
  const mod = url.protocol === 'https:' ? https : http;
  const started = Date.now();

  let body = null;
  const headers = Object.assign({ accept: 'application/json' }, opts.headers || {});
  if (opts.raw) {
    body = opts.raw;
  } else if (opts.body !== undefined) {
    body = JSON.stringify(opts.body);
    headers['content-type'] = 'application/json';
  }
  if (body) headers['content-length'] = Buffer.byteLength(body);
  if (opts.token) headers.authorization = 'Bearer ' + opts.token;
  // The frontend sends this on every call; some handlers read it.
  if (!headers.app) headers.app = '1';

  return new Promise((resolve) => {
    const req = mod.request(
      {
        protocol: url.protocol,
        host: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: opts.method || 'GET',
        headers,
        timeout: opts.timeout || 60000,
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const buf = Buffer.concat(chunks);
          const ct = String(res.headers['content-type'] || '');
          let json = null;
          // Parse regardless of content-type. The legacy layer sends its JSON
          // envelope through res.send(JSON.stringify(...)), which Express
          // labels `text/html` — so keying on the content-type would make the
          // harness read a perfectly good {Success:false} as an opaque blob and
          // mis-report it. Only bother when the body actually starts like JSON.
          const head = buf.slice(0, 1).toString('utf8');
          if (ct.includes('json') || head === '{' || head === '[') {
            try {
              json = JSON.parse(buf.toString('utf8'));
            } catch (e) {
              /* leave null */
            }
          }
          resolve({
            status: res.statusCode,
            contentType: ct,
            bytes: buf.length,
            json,
            text: ct.includes('json') || ct.includes('text') || ct.includes('html')
              ? buf.toString('utf8')
              : '<binary>',
            buffer: buf,
            ms: Date.now() - started,
          });
        });
      }
    );
    req.on('error', (e) =>
      resolve({ status: 0, error: e.code || e.message, ms: Date.now() - started, text: '', bytes: 0 })
    );
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, error: 'TIMEOUT', ms: Date.now() - started, text: '', bytes: 0 });
    });
    if (body) req.write(body);
    req.end();
  });
}

/**
 * Verdict for one response.
 *
 *   OK          worked
 *   AUTH        auth gate refused us - correct behaviour when unauthenticated
 *   VALIDATION  refused for a missing/invalid field - the endpoint is alive
 *   FAIL        answered, but reported failure
 *   ERROR       500, transport error, or timeout
 */
function classify(res, expect) {
  if (!res.status) return { verdict: 'ERROR', why: res.error || 'no response' };
  if (res.status >= 500) return { verdict: 'ERROR', why: 'HTTP ' + res.status };

  const j = res.json;

  // Lowercase envelope (api/**) uses real status codes.
  if (j && typeof j.success === 'boolean') {
    if (j.success) return { verdict: 'OK', why: '' };
    const code = j.code || '';
    if (res.status === 401 || code === 'TOKEN_INVALID' || code === 'NOT_AUTHENTICATED')
      return { verdict: 'AUTH', why: code };
    if (res.status === 403) return { verdict: 'AUTH', why: code };
    if (res.status === 400 || res.status === 404) return { verdict: 'VALIDATION', why: code };
    return { verdict: 'FAIL', why: code || j.message || '' };
  }

  // Legacy PascalCase envelope: HTTP 200 always, truth is in the body.
  if (j && typeof j.Success === 'boolean') {
    if (j.Success) return { verdict: 'OK', why: '' };
    const msg = String(j.Message || '');
    if (j.AuthError === true || /not logged into the system|Хандах эрхгүй/i.test(msg))
      return { verdict: 'AUTH', why: msg.slice(0, 60) };
    // Refused for a missing input rather than broken. The sweep deliberately
    // calls most endpoints with an empty body, so this is the expected answer
    // and must not be counted as a defect — otherwise the real failures drown.
    if (/is required|Information is missing|not found|олдсонгүй|оруулна уу|шаардлагатай/i.test(msg))
      return { verdict: 'VALIDATION', why: msg.slice(0, 80) };
    return { verdict: 'FAIL', why: msg.slice(0, 80) };
  }

  if (res.status === 401 || res.status === 403) return { verdict: 'AUTH', why: 'HTTP ' + res.status };
  if (res.status === 404) return { verdict: 'VALIDATION', why: 'HTTP 404' };

  // Binary: a PDF/xlsx/download is judged by content type and size.
  if (expect === 'binary') {
    if (res.status === 200 && res.bytes > 512 && !res.contentType.includes('json'))
      return { verdict: 'OK', why: res.contentType.split(';')[0] + ' ' + res.bytes + 'b' };
    return { verdict: 'FAIL', why: 'expected binary, got ' + res.contentType + ' ' + res.bytes + 'b' };
  }

  if (res.status === 200) return { verdict: 'OK', why: '' };
  return { verdict: 'FAIL', why: 'HTTP ' + res.status };
}

async function loginStaff(user, pass) {
  const r = await request({
    method: 'POST',
    path: '/api/User/Login',
    body: { UserName: user, Password: pass },
  });
  const token = r.json && r.json.Data && r.json.Data.token;
  return { token, user: r.json && r.json.Data && r.json.Data.LogedUser, res: r };
}

async function loginPatient(user, pass) {
  const r = await request({
    method: 'POST',
    path: '/api/PatientUser/Login',
    body: { UserName: user, Password: pass },
  });
  const token = r.json && r.json.Data && r.json.Data.token;
  return { token, user: r.json && r.json.Data && r.json.Data.LogedUser, res: r };
}

/** Run tasks with a concurrency cap. Print/export endpoints must use limit 1. */
async function pool(items, limit, fn) {
  const out = [];
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  });
  await Promise.all(workers);
  return out;
}

const RUN_ID = process.env.ACCEPTANCE_RUN_ID || new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
const TAG = 'ZZTEST-' + RUN_ID;

module.exports = { CONFIG, request, classify, loginStaff, loginPatient, pool, readEnv, ROOT, RUN_ID, TAG };
