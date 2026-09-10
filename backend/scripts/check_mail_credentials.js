/**
 * Verifies MAIL_USER_NAME / MAIL_USER_PASS against Gmail's SMTP server without
 * sending anything and without needing node_modules installed.
 *
 *   node scripts/check_mail_credentials.js            (verifies the TLS certificate)
 *   node scripts/check_mail_credentials.js --insecure (skip cert check behind a
 *                                                      TLS-intercepting proxy)
 *
 * A '535 5.7.8 BadCredentials' reply means the password is not a valid Google
 * App Password. See https://myaccount.google.com/apppasswords
 */
const tls = require('tls');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', 'config', 'Config.env');
const env = fs.readFileSync(envPath, 'utf8');
const read = (key) => {
  const m = env.match(new RegExp('^\s*' + key + '\s*=(.*)$', 'm'));
  return m ? m[1].trim() : '';
};

const user = read('MAIL_USER_NAME');
// Google shows App Passwords in four groups; the spaces are display only.
const pass = read('MAIL_USER_PASS').replace(/\s/g, '');

if (!user || !pass) {
  console.error('MAIL_USER_NAME or MAIL_USER_PASS is missing from config/Config.env');
  process.exit(1);
}

console.log(`Account: ${user}`);
console.log(`Password length: ${pass.length} (Google App Passwords are 16)`);

const steps = [
  null,
  'EHLO mncardio.local',
  'AUTH LOGIN',
  Buffer.from(user).toString('base64'),
  Buffer.from(pass).toString('base64'),
  'QUIT',
];

let i = 0;
let buf = '';
let failed = false;

const insecure = process.argv.includes('--insecure');
const socket = tls.connect({
  host: 'smtp.gmail.com',
  port: 465,
  servername: 'smtp.gmail.com',
  rejectUnauthorized: !insecure,
});
socket.setEncoding('utf8');
socket.setTimeout(20000, () => {
  console.error('Timed out talking to smtp.gmail.com:465 — is outbound SMTP blocked?');
  failed = true;
  socket.destroy();
});

socket.on('data', (chunk) => {
  buf += chunk;
  if (!buf.endsWith('\r\n')) return;
  const lines = buf.trim().split('\r\n');
  const last = lines[lines.length - 1];
  if (/^\d{3}-/.test(last)) return; // multi-line reply still in progress
  buf = '';

  if (last.startsWith('535')) {
    failed = true;
    console.error('\nAUTH FAILED: ' + last);
    console.error('Generate a 16-character App Password at https://myaccount.google.com/apppasswords');
    console.error('and put it in MAIL_USER_PASS in config/Config.env.');
  } else if (last.startsWith('235')) {
    console.log('\nAUTH OK — credentials are valid.');
  } else if (/^[45]\d\d/.test(last)) {
    failed = true;
    console.error('\nSMTP error: ' + last);
  }

  i += 1;
  if (i < steps.length) socket.write(steps[i] + '\r\n');
});

socket.on('error', (e) => {
  failed = true;
  console.error('Connection error:', e.message);
  if (/certificate/i.test(e.message)) {
    console.error('Your network appears to intercept TLS. Re-run with --insecure to test auth anyway.');
  }
});

socket.on('close', () => process.exit(failed ? 1 : 0));
