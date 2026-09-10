/**
 * Layer 3 — the real UI in headless Chrome.
 *
 * The API passing does not mean a doctor can do the work. This layer drives the
 * actual site and, on every page, asserts two things the sweep cannot see:
 *
 *   - no uncaught JavaScript error
 *   - no XHR that failed, 500'd, or came back {Success:false}
 *
 * A screen that renders but logs a TypeError is a failure here.
 *
 * Chrome comes from backend/node_modules — the copy Puppeteer downloaded for
 * PDF generation, so nothing extra is installed.
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require(path.resolve(__dirname, '..', '..', 'backend', 'node_modules', 'puppeteer'));
const { CONFIG, RUN_ID } = require('./lib');

const results = [];

function check(screen, step, pass, detail) {
  results.push({ journey: 'browser:' + screen, step, pass: !!pass, detail: String(detail || '').slice(0, 200) });
  process.stderr.write('   ' + (pass ? 'ok  ' : 'FAIL') + ' ' + screen + ' / ' + step + '\n');
  return pass;
}

async function run(outDir) {
  const shots = path.join(outDir, 'screens');
  fs.mkdirSync(shots, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1600, height: 1000 },
  });
  const page = await browser.newPage();

  let errors = [];
  let badXhr = [];
  const reset = () => {
    errors = [];
    badXhr = [];
  };

  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  page.on('console', (m) => {
    if (m.type() === 'error') {
      const t = m.text();
      // Browser-level noise that says nothing about the app.
      if (/favicon|net::ERR_|Failed to load resource/i.test(t)) return;
      errors.push(t.slice(0, 200));
    }
  });
  page.on('requestfailed', (r) => {
    if (r.url().includes('/api/')) badXhr.push(r.method() + ' ' + r.url().split('/api/')[1] + ' failed');
  });
  page.on('response', async (res) => {
    const u = res.url();
    if (!u.includes('/api/')) return;
    const label = res.request().method() + ' ' + u.split('/api/')[1].split('?')[0];
    if (res.status() >= 400) return badXhr.push(label + ' -> HTTP ' + res.status());
    try {
      const ct = res.headers()['content-type'] || '';
      if (!ct.includes('json') && !ct.includes('html')) return;
      const body = await res.text();
      if (!body.startsWith('{')) return;
      const j = JSON.parse(body);
      if (j.Success === false || j.success === false) {
        badXhr.push(label + ' -> ' + (j.Message || j.code || 'reported failure'));
      }
    } catch (e) {
      /* body already consumed or not json */
    }
  });

  const shot = async (name) => {
    try {
      await page.screenshot({ path: path.join(shots, name + '.png') });
    } catch (e) {
      /* page may have navigated */
    }
  };

  const settle = (ms) => new Promise((r) => setTimeout(r, ms));

  /** Visit a screen and assert it came up clean. */
  const visit = async (name, url, mustContain) => {
    reset();
    try {
      await page.goto(CONFIG.base + url, { waitUntil: 'networkidle2', timeout: 60000 });
    } catch (e) {
      check(name, 'loads', false, e.message);
      return false;
    }
    await settle(2500);
    await shot(name);
    const text = await page.evaluate(() => document.body.innerText || '');
    const loaded = !!text && text.length > 40;
    check(name, 'loads', loaded, loaded ? '' : 'page is blank');
    if (mustContain) {
      const has = text.includes(mustContain);
      check(name, 'shows expected content', has, has ? '' : 'did not find "' + mustContain + '"');
    }
    check(name, 'no JavaScript errors', errors.length === 0, errors.slice(0, 2).join(' | '));
    check(name, 'no failing API calls', badXhr.length === 0, badXhr.slice(0, 3).join(' | '));
    // Mongolian must render; a page full of replacement characters is an
    // encoding fault that looks fine to an API test.
    const mangled = (text.match(/�/g) || []).length;
    check(name, 'Mongolian renders', mangled === 0, mangled ? mangled + ' replacement characters' : '');
    return loaded;
  };

  /* ------------------------------------------------------------- login */

  reset();
  await page.goto(CONFIG.base + '/auth/login', { waitUntil: 'networkidle2', timeout: 60000 });
  await shot('00-login');
  await page.waitForSelector('input[type="password"]', { timeout: 20000 });
  const u = await page.$('input[type="text"]');
  await u.click({ clickCount: 3 });
  await u.type(CONFIG.adminUser, { delay: 15 });
  const p = await page.$('input[type="password"]');
  await p.click({ clickCount: 3 });
  await p.type(CONFIG.adminPass, { delay: 15 });
  await page.keyboard.press('Enter');
  await settle(9000);
  await shot('01-after-login');

  const store = await page.evaluate(() => ({
    isLogin: localStorage.getItem('IsLogin'),
    token: !!localStorage.getItem('MnCardioToken'),
  }));
  const loggedIn = store.isLogin === 'true' && store.token;
  check('login', 'admin can log in', loggedIn, loggedIn ? page.url() : 'no session in localStorage');
  check('login', 'no JavaScript errors', errors.length === 0, errors.slice(0, 2).join(' | '));
  check('login', 'no failing API calls', badXhr.length === 0, badXhr.slice(0, 3).join(' | '));

  if (!loggedIn) {
    await browser.close();
    return results;
  }

  /* ----------------------------------------------------------- screens */

  const screens = [
    ['02-home', '/admin/AdviceHome', null],
    ['03-patient-info', '/admin/PatientInfo', null],
    ['04-monitoring', '/admin/PatientMonitoringDoctor', null],
    ['05-inpatient', '/admin/InPatient', null],
    ['06-tenderform-all', '/admin/TenderFormAll', null],
    ['07-tenderform-1-1', '/admin/TenderForm1_1', null],
    ['08-tenderform-2-2', '/admin/TenderForm2_2', null],
    ['09-exam-register-am1b', '/admin/ExamRegisterAM1B', null],
    ['10-users', '/admin/Users', null],
    ['11-user-requests', '/admin/UserRequests', null],
    ['12-organization', '/admin/Organization', null],
    ['13-profile', '/admin/Profile', null],
    ['14-atrial-rhythm-new', '/admin/AtrialRhythmNew', null],
    ['15-cvd-monitoring', '/admin/CVDMonitoringList', null],
    ['16-icd-handbook', '/admin/Icd', null],
    ['17-all-tickets', '/admin/AllTickets', null],
    ['18-notifications', '/admin/AllNotifications', null],
  ];

  for (const [name, url, expect] of screens) {
    await visit(name, url, expect);
  }

  /* --------------------------------------- a real interaction: search */

  reset();
  await page.goto(CONFIG.base + '/admin/PatientInfo', { waitUntil: 'networkidle2', timeout: 60000 });
  await settle(2500);
  const searchBox = await page.$('input[type="text"]');
  if (searchBox) {
    await searchBox.click({ clickCount: 3 });
    await searchBox.type('Бат', { delay: 40 });
    await page.keyboard.press('Enter');
    await settle(5000);
    await shot('19-patient-search');
    const rows = await page.evaluate(
      () => document.querySelectorAll('table tbody tr, [role="row"]').length
    );
    check('patient-search', 'search returns rows', rows > 0, rows + ' rows');
    check('patient-search', 'no failing API calls', badXhr.length === 0, badXhr.slice(0, 3).join(' | '));
  } else {
    check('patient-search', 'search box present', false, 'no text input on the patient screen');
  }

  await browser.close();
  return results;
}

module.exports = { run };

if (require.main === module) {
  const out = path.join(__dirname, 'results', RUN_ID);
  run(out)
    .then((rs) => {
      const failed = rs.filter((r) => !r.pass);
      console.log('\n=== browser: ' + (rs.length - failed.length) + '/' + rs.length + ' passed ===');
      console.log('screenshots: ' + path.join(out, 'screens'));
      if (failed.length) {
        console.log('\n--- failures ---');
        for (const f of failed) console.log('  ' + (f.journey + ' / ' + f.step).padEnd(52) + f.detail);
      }
    })
    .catch((e) => {
      console.error('BROWSER RUN FAILED: ' + e.message);
      process.exit(1);
    });
}
