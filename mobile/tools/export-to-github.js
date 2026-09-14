/**
 * Build a secret-free copy of the project for the GitHub repository.
 *
 *   node mobile/tools/export-to-github.js <destination>
 *
 * <destination> is a clone of github.com/Javhaa233/mn_cardio_v2. The script
 * overwrites files in place; review `git status` there, then commit and push.
 *
 * What it guarantees:
 *   - no .env of any kind, no config/Config.env, no config/SSL, no config/Xyp
 *   - no ssh.env, no *.key / *.pem / *.ovpn / *.pfx anywhere
 *   - no node_modules, no build output, no scratch files
 *   - config/Config-Template.env is rewritten with placeholders, INCLUDING
 *     commented-out lines (a real XYP_ACCESS_TOKEN was found in one)
 *
 * It prints key names only. It never prints a credential value.
 *
 * Run `node mobile/tools/verify-no-secrets.js <destination>` afterwards.
 */
const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '..', '..');
const OUT = process.argv[2];

if (!OUT) {
  console.error('usage: node mobile/tools/export-to-github.js <destination>');
  process.exit(1);
}

const DIR_DENY = new Set([
  '.git', 'node_modules', 'build', 'dist', 'coverage',
  'tmpFile', 'outReports', 'htmlOutput', 'htmlReport',
  'outputExcel', 'reportPDF', 'ExportReports', '.vscode', '.idea',
]);

const PATH_DENY = ['backend/config/SSL', 'backend/config/Xyp'];

const FILE_DENY = [
  // Anything ending in .env, anywhere in the tree, whatever it is called. The
  // root allowlist already drops stray root files, but a credentials file such
  // as test-environment.env would survive being moved into a subdirectory.
  /\.env$/i, /^\.env\..*/i, /^Config\.env.*/i,
  /\.key$/i, /\.pem$/i, /\.pfx$/i, /\.p12$/i, /\.ovpn$/i,
  /\.keystore$/i, /\.jks$/i, /^id_rsa/i,
  /^tmp_.*\.js$/i, /^test_findAll\.js$/i, /^temp_DoctorsProfileForm\.jsx$/i,
  /^login-heartbeat\.html$/i, /^image.*\.png$/i, /_backup_.*\.xlsx$/i,
  /\.log$/i, /^~\$/,
];

// Checked BEFORE FILE_DENY. Config-Template.env ends in .env and would
// otherwise be caught by the rule above — but it is the placeholder file we
// deliberately ship, and sanitiseTemplate() silently no-ops if it is missing,
// so dropping it would go unnoticed until someone deployed from the export.
const FILE_ALLOW = [/^Config-Template\.env$/i];

// Directories at the repo root are allowlisted for the same reason the loose
// files below are. This was a real gap: root FILES were allowlisted but root
// DIRECTORIES were walked unconditionally, so a `docs/` folder of app
// screenshots - full names, national registration numbers, home addresses and
// ICD diagnoses for real patients, since the test database is a restore of
// production - was copied straight into an export bound for a repo shared with
// an outside developer. verify-no-secrets.js did not catch it: it looks for
// credentials, not for patient data. Add a directory here only after checking
// what is inside it.
const ROOT_DIR_ALLOW = new Set(['backend', 'frontend', 'mobile', 'deploy', 'tests']);

// Loose files at the repo root are allowlisted, so nothing new rides along.
const ROOT_FILE_ALLOW = new Set([
  'CLAUDE.md',
  'README.md',
  '.gitignore',
  '.gitattributes',
  'ZSUT-blocker-letter-2026-09-09.md',
  'MN cardio upgrade.docx',
  'mobile mncardio.docx',
  'МнКардио_тендерийн_ажлын_жагсаалт.xlsx',
  'МнКардио_талбарын_нэр_баталгаажуулалт.xlsx',
  'fix_report_ordering.sql',
  'rollback_original_procs.sql',
  'tailan_export_ih_uul.sql',
]);

let copied = 0;
const skipped = [];

function walk(absDir, rel) {
  for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
    const name = entry.name;
    const childRel = rel ? rel + '/' + name : name;

    if (!rel && entry.isFile() && !ROOT_FILE_ALLOW.has(name)) {
      skipped.push(childRel);
      continue;
    }
    if (!rel && entry.isDirectory() && !ROOT_DIR_ALLOW.has(name)) {
      skipped.push(childRel);
      continue;
    }
    if (entry.isDirectory() && DIR_DENY.has(name)) { skipped.push(childRel); continue; }
    if (PATH_DENY.some((p) => childRel === p || childRel.startsWith(p + '/'))) { skipped.push(childRel); continue; }
    const explicitlyAllowed = entry.isFile() && FILE_ALLOW.some((r) => r.test(name));
    if (entry.isFile() && !explicitlyAllowed && FILE_DENY.some((r) => r.test(name))) {
      skipped.push(childRel);
      continue;
    }

    const abs = path.join(absDir, name);
    if (entry.isDirectory()) walk(abs, childRel);
    else if (entry.isFile()) {
      const dest = path.join(OUT, childRel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(abs, dest);
      copied++;
    }
  }
}

/* ------- Config-Template.env: replace every value, comments included ------- */

const KEEP = new Set(['NODE_ENV', 'PORT', 'SSL', 'NODE_TLS_REJECT_UNAUTHORIZED']);
const HINT = {
  SQL_HOST: 'db.host.example', SQL_USER: 'sql_user', SQL_PASSWORD: 'CHANGE_ME',
  SQL_DB: 'MnCardio', JWT_PASS: 'CHANGE_ME_random_48_bytes_base64',
  MAIL_USER_NAME: 'mailbox@example.com', MAIL_USER_PASS: 'CHANGE_ME',
  CLIENT_APP_URL: 'https://your.host.example/',
  EMD_USERNAME: 'CHANGE_ME', EMD_PASSWORD: 'CHANGE_ME',
  XYP_USERNAME: 'CHANGE_ME', XYP_PASSWORD: 'CHANGE_ME',
  XYP_KEY: '', XYP_TOKEN: '', REGNUM: '',
};

function sanitiseTemplate() {
  const rel = 'backend/config/Config-Template.env';
  const dest = path.join(OUT, rel);
  if (!fs.existsSync(dest)) return;

  const rewritten = [];
  for (const line of fs.readFileSync(dest, 'utf8').split(/\r?\n/)) {
    // Commented-out KEY=VALUE — a secret in a comment is still a secret.
    const c = line.match(/^(\s*#\s*)([A-Z][A-Z0-9_]{2,})(\s*=\s*)(.+)$/);
    if (c) {
      const v = c[4].trim();
      rewritten.push(/^(smtp\.|[0-9]{1,5}|true|false)$/i.test(v) ? line : c[1] + c[2] + c[3] + 'CHANGE_ME');
      continue;
    }
    const m = line.match(/^(\s*)([A-Za-z0-9_]+)(\s*=\s*)(.*)$/);
    if (!m) { rewritten.push(line); continue; }
    const key = m[2];
    if (KEEP.has(key)) { rewritten.push(line); continue; }
    let v;
    if (Object.prototype.hasOwnProperty.call(HINT, key)) v = HINT[key];
    else if (/DIR/i.test(key)) v = key.includes('WINDOWS') ? 'C:/MnCardio/' : '/var/mncardio/';
    else v = 'CHANGE_ME';
    rewritten.push(m[1] + key + m[3] + v);
  }

  const header =
    '# Template only - copy to config/Config.env and fill in real values.\n' +
    '# NEVER commit a filled-in copy. config/Config.env is gitignored; keep it that way.\n' +
    '# Every value below is a placeholder.\n\n';

  fs.writeFileSync(dest, header + rewritten.join('\n'), 'utf8');
  console.log('sanitised ' + rel);
}

fs.mkdirSync(OUT, { recursive: true });
walk(SRC, '');
sanitiseTemplate();

console.log('copied files: ' + copied);
console.log('excluded paths: ' + skipped.length);
console.log('\nNext:');
console.log('  node mobile/tools/verify-no-secrets.js "' + OUT + '"');
console.log('  cd "' + OUT + '" && git status');
