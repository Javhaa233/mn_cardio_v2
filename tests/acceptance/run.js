/**
 * Run all three layers and write the report.
 *
 *   node tests/acceptance/run.js
 *   ACCEPTANCE_BASE=http://localhost:5001 node tests/acceptance/run.js
 *
 * Output lands in tests/acceptance/results/<runid>/.
 */
const fs = require('fs');
const path = require('path');
const { RUN_ID, CONFIG, TAG } = require('./lib');

const OUT = path.join(__dirname, 'results', RUN_ID);

function bar(label, n, total) {
  const w = Math.round((n / Math.max(total, 1)) * 30);
  return label.padEnd(12) + '█'.repeat(w).padEnd(30) + ' ' + n;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const started = new Date();
  console.log('MnCardio acceptance run ' + RUN_ID);
  console.log('target: ' + CONFIG.base + '\n');

  console.log('Layer 1 — endpoint sweep');
  const sweep = await require('./sweep').run();

  console.log('\nLayer 2 — write journeys');
  const journeys = await require('./journeys').run();

  console.log('\nLayer 3 — browser');
  let browser = [];
  try {
    browser = await require('./browser').run(OUT);
  } catch (e) {
    console.error('  browser layer failed to run: ' + e.message);
    browser = [{ journey: 'browser', step: 'run', pass: false, detail: e.message }];
  }

  const raw = { runId: RUN_ID, base: CONFIG.base, started, finished: new Date(), sweep, journeys: journeys.results, browser };
  fs.writeFileSync(path.join(OUT, 'raw.json'), JSON.stringify(raw, null, 2), 'utf8');

  /* ------------------------------------------------------------- report */

  const v = {};
  for (const r of sweep.results) v[r.verdict] = (v[r.verdict] || 0) + 1;
  const jAll = journeys.results.concat(browser);
  const jFail = jAll.filter((r) => !r.pass);

  const L = [];
  L.push('# MnCardio acceptance run — ' + RUN_ID);
  L.push('');
  L.push('Target: `' + CONFIG.base + '`  ');
  L.push('Started: ' + started.toISOString() + '  ');
  L.push('Records created by this run are tagged `' + TAG + '` and left in place.');
  L.push('');
  L.push('## Verdict');
  L.push('');
  L.push('| Layer | Result |');
  L.push('|---|---|');
  L.push('| Endpoint sweep | ' + (v.OK || 0) + ' OK · ' + (v.ALIVE || 0) + ' alive · ' + (v.FAIL || 0) + ' failing · ' + (v.ERROR || 0) + ' erroring, of ' + sweep.results.length + ' called (' + sweep.skipped.length + ' skipped) |');
  L.push('| Write journeys | ' + journeys.results.filter((r) => r.pass).length + '/' + journeys.results.length + ' passed |');
  L.push('| Browser | ' + browser.filter((r) => r.pass).length + '/' + browser.length + ' passed |');
  L.push('');
  L.push('`alive` means the endpoint is mounted and executing but was called with an empty');
  L.push('body and asked for input. `OK` means it did the thing. The legacy layer answers');
  L.push('every failure with HTTP 200 and the same opaque "An error occurred", so verdicts');
  L.push('come from the response body, never the status code.');
  L.push('');

  if (jFail.length) {
    L.push('## Failures');
    L.push('');
    L.push('| Journey | Step | Detail |');
    L.push('|---|---|---|');
    for (const f of jFail) L.push('| ' + f.journey + ' | ' + f.step + ' | ' + f.detail.replace(/\|/g, '\\|') + ' |');
    L.push('');
  }

  const bad = sweep.results.filter((r) => r.verdict === 'FAIL' || r.verdict === 'ERROR');
  if (bad.length) {
    L.push('## Endpoints reporting failure with a realistic request');
    L.push('');
    L.push('| Verdict | Endpoint | Detail |');
    L.push('|---|---|---|');
    for (const r of bad.sort((a, b) => a.path.localeCompare(b.path)))
      L.push('| ' + r.verdict + ' | `' + r.method + ' ' + r.path + '` | ' + String(r.why || r.excerpt).replace(/\|/g, '\\|').slice(0, 90) + ' |');
    L.push('');
  }

  L.push('## Not called, and why');
  L.push('');
  L.push('| Endpoint | Reason |');
  L.push('|---|---|');
  for (const s of sweep.skipped.sort((a, b) => a.path.localeCompare(b.path)))
    L.push('| `' + s.path + '` | ' + s.why + ' |');
  L.push('');

  L.push('## Full sweep');
  L.push('');
  L.push('| Verdict | Endpoint | Role | ms | Detail |');
  L.push('|---|---|---|---|---|');
  for (const r of sweep.results.sort((a, b) => a.path.localeCompare(b.path)))
    L.push('| ' + r.verdict + ' | `' + r.method + ' ' + r.path + '` | ' + r.role + ' | ' + r.ms + ' | ' + String(r.why || '').replace(/\|/g, '\\|').slice(0, 70) + ' |');
  L.push('');

  fs.writeFileSync(path.join(OUT, 'report.md'), L.join('\n'), 'utf8');

  console.log('\n' + '='.repeat(50));
  console.log(bar('OK', v.OK || 0, sweep.results.length));
  console.log(bar('alive', v.ALIVE || 0, sweep.results.length));
  console.log(bar('failing', v.FAIL || 0, sweep.results.length));
  console.log(bar('erroring', v.ERROR || 0, sweep.results.length));
  console.log('journeys: ' + journeys.results.filter((r) => r.pass).length + '/' + journeys.results.length +
              '   browser: ' + browser.filter((r) => r.pass).length + '/' + browser.length);
  console.log('\nreport: ' + path.join(OUT, 'report.md'));
  process.exitCode = jFail.length ? 1 : 0;
}

main().catch((e) => {
  console.error('RUN FAILED: ' + e.message);
  process.exit(1);
});
