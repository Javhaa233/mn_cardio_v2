#!/usr/bin/env node
/*
 * Proves the test environment works end to end, before you install Flutter.
 *
 *   node mobile/client/smoke.js
 *
 * Credentials come from the environment - never from a file in this folder:
 *
 *   MNCARDIO_PATIENT_USER   MNCARDIO_PATIENT_PASSWORD
 *   MNCARDIO_DOCTOR_USER    MNCARDIO_DOCTOR_PASSWORD
 *   MNCARDIO_BASE           optional, defaults to the test server
 *
 * Node stdlib only. No npm install, nothing added to any repository's dependencies.
 * Everything it prints goes to your terminal and nowhere else - the test database is a
 * restore of production, so nothing here writes patient data to disk.
 *
 * The request shape follows tests/acceptance/lib.js, which is the known-good client for
 * this backend: Bearer token, and the `app` header the web frontend always sends.
 */

'use strict';

const https = require('https');
const http = require('http');
const { URL } = require('url');

const BASE = process.env.MNCARDIO_BASE || 'https://mncardio.itsystem.mn';

// The legacy layer answers HTTP 200 for every failure, so the status code alone never
// tells you whether a call worked. Both envelopes are normalised here, exactly as a real
// client has to do it.
function interpret(status, body) {
  if (body && typeof body === 'object') {
    if ('Success' in body) {
      return {
        ok: body.Success === true,
        why: body.Success === true ? '' : body.Message || 'unknown legacy failure',
        payload: body.Data,
      };
    }
    if ('success' in body) {
      return {
        ok: body.success === true,
        why: body.success === true ? '' : (body.code || '') + ' ' + (body.message || ''),
        payload: body.data,
      };
    }
  }
  return { ok: status >= 200 && status < 300, why: 'non-envelope response', payload: body };
}

function request(method, path, { token, body } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const payload = body === undefined ? null : JSON.stringify(body);
    const headers = { Accept: 'application/json', app: '1' };
    if (payload) {
      headers['Content-Type'] = 'application/json; charset=utf-8';
      headers['Content-Length'] = Buffer.byteLength(payload);
    }
    if (token) headers.Authorization = 'Bearer ' + token;

    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.request(
      { method, hostname: url.hostname, port: url.port || undefined, path: url.pathname + url.search, headers },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          // Always decode as UTF-8. The legacy layer sends Mongolian text with a
          // text/html content type, which trips clients that trust the header.
          const text = Buffer.concat(chunks).toString('utf8');
          let json = null;
          const trimmed = text.trim();
          if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            try { json = JSON.parse(trimmed); } catch (_) { /* leave null */ }
          }
          resolve({ status: res.statusCode, json, text });
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(30000, () => req.destroy(new Error('timed out after 30s')));
    if (payload) req.write(payload);
    req.end();
  });
}

let passed = 0;
let failed = 0;

function report(name, ok, detail) {
  if (ok) { passed++; console.log('  PASS  ' + name + (detail ? '  ' + detail : '')); }
  else { failed++; console.log('  FAIL  ' + name + (detail ? '  ' + detail : '')); }
}

async function step(name, fn) {
  try {
    const detail = await fn();
    report(name, true, detail);
    return true;
  } catch (err) {
    report(name, false, err.message);
    return false;
  }
}

function requireEnv(...names) {
  const missing = names.filter((n) => !process.env[n]);
  if (missing.length) {
    console.error('Missing environment variables: ' + missing.join(', '));
    console.error('See mobile/QUICKSTART.md section 0. Ask ITsystem for the test credentials.');
    process.exit(2);
  }
}

async function call(method, path, opts, label) {
  const res = await request(method, path, opts);
  const verdict = interpret(res.status, res.json);
  if (!verdict.ok) throw new Error('HTTP ' + res.status + ' - ' + (verdict.why || res.text.slice(0, 120)));
  return verdict.payload;
}

async function main() {
  requireEnv(
    'MNCARDIO_PATIENT_USER', 'MNCARDIO_PATIENT_PASSWORD',
    'MNCARDIO_DOCTOR_USER', 'MNCARDIO_DOCTOR_PASSWORD'
  );

  console.log('\nMnCardio smoke test  ->  ' + BASE + '\n');

  let patientToken = null;
  let doctorToken = null;

  await step('GET  /health', async () => {
    const res = await request('GET', '/health');
    if (res.status !== 200) throw new Error('HTTP ' + res.status);
    if (!res.json || res.json.status !== 'ok') throw new Error('unexpected body: ' + res.text.slice(0, 80));
    return res.json.timestamp;
  });

  await step('POST /api/PatientUser/Login', async () => {
    const data = await call('POST', '/api/PatientUser/Login', {
      body: { UserName: process.env.MNCARDIO_PATIENT_USER, Password: process.env.MNCARDIO_PATIENT_PASSWORD },
    });
    if (!data || !data.token) throw new Error('no Data.token in response');
    patientToken = data.token;
    return 'token ' + data.token.slice(0, 12) + '...';
  });

  if (patientToken) {
    await step('GET  /api/patient/me', async () => {
      const me = await call('GET', '/api/patient/me', { token: patientToken });
      // Printed to your terminal only. Real patient data - do not paste it anywhere.
      return [me.p_lastname, me.p_firstname].filter(Boolean).join(' ') || '(no name)';
    });

    await step('GET  /api/patient/journal?limit=5', async () => {
      const rows = await call('GET', '/api/patient/journal?limit=5', { token: patientToken });
      return (Array.isArray(rows) ? rows.length : 0) + ' row(s)';
    });

    await step('GET  /api/patient/rehab/exercises', async () => {
      const rows = await call('GET', '/api/patient/rehab/exercises', { token: patientToken });
      const n = Array.isArray(rows) ? rows.length : 0;
      return n + ' exercise(s)' + (n === 0 ? '  (expected - catalogue not seeded yet)' : '');
    });
  }

  await step('POST /api/User/Login', async () => {
    const data = await call('POST', '/api/User/Login', {
      body: { UserName: process.env.MNCARDIO_DOCTOR_USER, Password: process.env.MNCARDIO_DOCTOR_PASSWORD },
    });
    if (!data || !data.token) throw new Error('no Data.token in response');
    doctorToken = data.token;
    return 'token ' + data.token.slice(0, 12) + '...';
  });

  if (doctorToken) {
    await step('GET  /api/doctor/me', async () => {
      const me = await call('GET', '/api/doctor/me', { token: doctorToken });
      return (me.FullName || '(no name)') + '  RoleId=' + JSON.stringify(me.RoleId);
    });

    await step('GET  /api/doctor/visits?limit=5', async () => {
      const rows = await call('GET', '/api/doctor/visits?limit=5&scope=mine', { token: doctorToken });
      return (Array.isArray(rows) ? rows.length : 0) + ' visit(s)';
    });

    await step('POST /api/auth/refresh', async () => {
      const data = await call('POST', '/api/auth/refresh', { token: doctorToken });
      if (!data || !data.refreshToken) throw new Error('no refreshToken in response');
      return 'expiresIn ' + data.expiresIn + 's';
    });
  }

  await step('GET  /api/patient/me with a doctor token is refused', async () => {
    const res = await request('GET', '/api/patient/me', { token: doctorToken });
    if (res.status !== 403) throw new Error('expected 403, got ' + res.status);
    if (!res.json || res.json.code !== 'NOT_A_PATIENT') {
      throw new Error('expected code NOT_A_PATIENT, got ' + (res.json && res.json.code));
    }
    return '403 NOT_A_PATIENT';
  });

  console.log('\n' + passed + ' passed, ' + failed + ' failed\n');

  if (failed === 0) {
    console.log('If the names above rendered in Cyrillic, your whole pipeline is good:');
    console.log('network, TLS, auth, both response envelopes and UTF-8.\n');
  }
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('\nsmoke test could not run: ' + err.message + '\n');
  process.exit(1);
});
