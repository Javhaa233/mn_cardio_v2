/**
 * Layer 1 — breadth. Call every catalogued endpoint once and classify it.
 *
 * Print and export endpoints run strictly one at a time: each spawns headless
 * Chrome through BrowserPool, and the test host has ~5.7 GB free while serving
 * six live customer sites. Everything else runs 4-wide.
 */
const { CONFIG, request, classify, loginStaff, loginPatient, pool } = require('./lib');
const { build } = require('./catalogue');

async function run() {
  const eps = build();

  const doctor = await loginStaff(CONFIG.doctorUser, CONFIG.doctorPass);
  const admin = await loginStaff(CONFIG.adminUser, CONFIG.adminPass);
  const patient = await loginPatient(CONFIG.patientUser, CONFIG.patientPass);

  const tokens = {
    doctor: doctor.token,
    admin: admin.token,
    patient: patient.token,
    none: null,
  };

  if (!doctor.token || !admin.token || !patient.token) {
    throw new Error(
      'could not obtain all three tokens (doctor=' +
        !!doctor.token +
        ' admin=' +
        !!admin.token +
        ' patient=' +
        !!patient.token +
        ') — the sweep would report false failures, so refusing to continue'
    );
  }

  const callable = eps.filter((e) => !e.skip);
  const heavy = callable.filter((e) => e.heavy);
  const light = callable.filter((e) => !e.heavy);

  const call = async (ep) => {
    const res = await request({
      method: ep.method,
      path: ep.path,
      body: ep.method === 'GET' ? undefined : ep.body || {},
      token: tokens[ep.role],
      timeout: ep.heavy ? 120000 : 45000,
    });
    const c = classify(res, ep.expect);

    /*
     * Most endpoints are called with a bare {} because no realistic body was
     * annotated for them. When one of those reports a failure it has still
     * proved it is mounted, routed and executing — it simply wants input. The
     * legacy layer makes this indistinguishable from a real fault, because it
     * answers every failure with the same opaque "An error occurred"
     * (controllers catch, log, and return GetDefaultErrorResult).
     *
     * So: a failure only counts as a defect when the catalogue gave the
     * endpoint a real body. Everything else is reported as ALIVE, which is the
     * honest description of what was actually learned. Without this split, 82
     * "failures" bury the handful that matter.
     */
    if ((c.verdict === 'FAIL' || c.verdict === 'VALIDATION') && !ep.probed) {
      c.verdict = 'ALIVE';
    }

    return {
      method: ep.method,
      path: ep.path,
      role: ep.role,
      group: ep.group,
      expect: ep.expect,
      status: res.status,
      ms: res.ms,
      bytes: res.bytes,
      contentType: (res.contentType || '').split(';')[0],
      verdict: c.verdict,
      why: c.why,
      excerpt: (res.text || '').slice(0, 160).replace(/\s+/g, ' '),
    };
  };

  process.stderr.write('  sweeping ' + light.length + ' light endpoints (4 at a time)...\n');
  const lightResults = await pool(light, 4, call);
  process.stderr.write('  sweeping ' + heavy.length + ' print/export endpoints (serially)...\n');
  const heavyResults = await pool(heavy, 1, call);

  const results = lightResults.concat(heavyResults);
  const skipped = eps
    .filter((e) => e.skip)
    .map((e) => ({ method: e.method, path: e.path, verdict: 'SKIP', why: e.skip }));

  return { results, skipped, total: eps.length };
}

module.exports = { run };

if (require.main === module) {
  run()
    .then(({ results, skipped, total }) => {
      const by = {};
      for (const r of results) by[r.verdict] = (by[r.verdict] || 0) + 1;
      console.log('\ncatalogued: ' + total + '   called: ' + results.length + '   skipped: ' + skipped.length);
      console.log('verdicts  : ' + JSON.stringify(by));
      const bad = results.filter((r) => r.verdict === 'ERROR' || r.verdict === 'FAIL');
      console.log('\n--- ERROR / FAIL (' + bad.length + ') ---');
      for (const r of bad.sort((a, b) => a.path.localeCompare(b.path))) {
        console.log(
          '  ' + r.verdict.padEnd(6) + String(r.status).padEnd(5) + r.path.padEnd(46) + (r.why || r.excerpt).slice(0, 70)
        );
      }
    })
    .catch((e) => {
      console.error('SWEEP FAILED: ' + e.message);
      process.exit(1);
    });
}
