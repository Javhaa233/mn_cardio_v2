/**
 * Prove an export contains no real credential, before pushing it.
 *
 *   node mobile/tools/verify-no-secrets.js <directory>
 *
 * Reads the REAL secret values from the local untracked config files, then
 * searches every file in <directory> for each one. Exits non-zero on a hit.
 *
 * Prints key names and file paths only — never a value. Run it every time
 * before committing an export; the checks it performs are exactly the ones
 * that caught a live JWT_PASS and a token hidden in a comment.
 */
const fs = require('fs');
const path = require('path');

const TARGET = process.argv[2];
if (!TARGET) {
  console.error('usage: node mobile/tools/verify-no-secrets.js <directory>');
  process.exit(2);
}

const ROOT = path.resolve(__dirname, '..', '..');
const SOURCES = [
  path.join(ROOT, 'ssh.env'),
  path.join(ROOT, 'backend', '.env'),
  path.join(ROOT, 'backend', '.env.development'),
  path.join(ROOT, 'backend', '.env.production'),
  path.join(ROOT, 'backend', 'config', 'Config.env'),
];

// Values that are public or too generic to be evidence of a leak.
// SQL_DB is the database name and appears legitimately in USE [...] statements;
// CLIENT_APP_URL is the public site address; SSH_USER appears in documented
// default paths. None of these is a credential.
const NOT_SECRET = new Set(['SQL_DB', 'CLIENT_APP_URL', 'SSH_USER', 'REGNUM', 'NODE_ENV', 'PORT', 'SSL']);
const IGNORE_VALUE = /^(|true|false|0|1|development|production|localhost|5001|3000|1433)$/i;

const secrets = new Map(); // value -> Set("file:KEY")
for (const src of SOURCES) {
  if (!fs.existsSync(src)) continue;
  const base = path.basename(src);
  for (const line of fs.readFileSync(src, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    if (NOT_SECRET.has(key)) continue;
    const val = m[2].trim().replace(/^["']|["']$/g, '');
    if (IGNORE_VALUE.test(val) || val.length < 6) continue;
    if (!secrets.has(val)) secrets.set(val, new Set());
    secrets.get(val).add(base + ':' + key);
  }
}

const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.isDirectory() && (e.name === '.git' || e.name === 'node_modules')) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.isFile()) files.push(p);
  }
})(TARGET);

// Structural check: no secret-bearing file should exist at all.
const BANNED = /(^|[\\/])(\.env($|\.)|Config\.env|ssh\.env)|\.(key|pem|pfx|p12|ovpn|jks|keystore)$/i;
const bannedFiles = files.filter((f) => BANNED.test(f.replace(TARGET, '')));

// Content check: does any real value appear anywhere?
const found = new Map();
for (const f of files) {
  let text;
  try {
    if (fs.statSync(f).size > 8 * 1024 * 1024) continue;
    text = fs.readFileSync(f, 'latin1');
  } catch { continue; }
  for (const [val, keys] of secrets) {
    if (text.includes(val)) {
      for (const k of keys) {
        if (!found.has(k)) found.set(k, new Set());
        found.get(k).add(f.replace(TARGET, ''));
      }
    }
  }
}

// Private key material, regardless of filename.
const keyBlocks = files.filter((f) => {
  try {
    if (fs.statSync(f).size > 8 * 1024 * 1024) return false;
    return /BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY/.test(fs.readFileSync(f, 'latin1'));
  } catch { return false; }
});

console.log('files scanned:            ' + files.length);
console.log('secret values searched:   ' + secrets.size);

let bad = false;
if (bannedFiles.length) {
  bad = true;
  console.log('\nFAIL — secret-bearing files present:');
  bannedFiles.forEach((f) => console.log('  ' + f.replace(TARGET, '')));
}
if (keyBlocks.length) {
  bad = true;
  console.log('\nFAIL — PRIVATE KEY block found in:');
  keyBlocks.forEach((f) => console.log('  ' + f.replace(TARGET, '')));
}
if (found.size) {
  bad = true;
  console.log('\nFAIL — real credential values found:');
  for (const [k, fset] of found) console.log('  ' + k + '  ->  ' + [...fset].slice(0, 5).join(', '));
}

if (bad) {
  console.log('\nDo not push. Fix the above first.');
  process.exit(1);
}
console.log('\nPASS — no credential file, no key material, no real value. Safe to push.');
