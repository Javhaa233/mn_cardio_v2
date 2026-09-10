/**
 * Sends a real test email using the credentials in config/Config.env, without
 * needing node_modules installed. Use this to confirm mail works end to end
 * after putting a Google App Password into MAIL_USER_PASS.
 *
 *   node scripts/send_test_mail.js someone@example.com
 *   node scripts/send_test_mail.js someone@example.com --insecure
 *
 * --insecure skips TLS certificate verification, needed only on a network that
 * intercepts TLS. Never use it as a permanent setting.
 */
const tls = require('tls');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const insecure = args.includes('--insecure');
const to = args.find((a) => !a.startsWith('--'));

if (!to) {
  console.error('Usage: node scripts/send_test_mail.js <recipient> [--insecure]');
  process.exit(1);
}

const envPath = path.join(__dirname, '..', 'config', 'Config.env');
const env = fs.readFileSync(envPath, 'utf8');
const read = (key) => {
  const m = env.match(new RegExp('^\\s*' + key + '\\s*=(.*)$', 'm'));
  return m ? m[1].trim() : '';
};

const user = read('MAIL_USER_NAME');
// Google shows App Passwords in four groups; the spaces are display only.
const pass = read('MAIL_USER_PASS').replace(/\s/g, '');
const host = read('MAIL_SMTP_HOST') || 'smtp.gmail.com';
const port = parseInt(read('MAIL_SMTP_PORT') || '465', 10);

if (!user || !pass) {
  console.error('MAIL_USER_NAME or MAIL_USER_PASS is missing from config/Config.env');
  process.exit(1);
}

console.log(`Server:    ${host}:${port}`);
console.log(`From:      ${user}`);
console.log(`To:        ${to}`);
console.log(`Password:  ${pass.length} characters (Google App Passwords are 16)\n`);

// RFC 2047 encoded-word, so a non-ASCII subject survives transit.
const encodeHeader = (text) =>
  /^[\x20-\x7E]*$/.test(text) ? text : '=?UTF-8?B?' + Buffer.from(text).toString('base64') + '?=';

const subject = 'MnCardio - и-мэйл тохиргооны шалгалт';
const bodyLines = [
  'Сайн байна уу.',
  '',
  'Энэ бол MnCardio системийн и-мэйл тохиргоог шалгах туршилтын захидал юм.',
  'Та энэ захидлыг хүлээн авсан бол хэрэглэгчийн эрх баталгаажуулах үед',
  'нэвтрэх мэдээлэл амжилттай илгээгдэх болно.',
  '',
  `Илгээсэн хаяг: ${user}`,
  `Огноо: ${new Date().toISOString()}`,
];

const message = [
  `From: ${user}`,
  `To: ${to}`,
  `Subject: ${encodeHeader(subject)}`,
  'MIME-Version: 1.0',
  'Content-Type: text/plain; charset=UTF-8',
  'Content-Transfer-Encoding: base64',
  '',
  Buffer.from(bodyLines.join('\r\n')).toString('base64').replace(/(.{76})/g, '$1\r\n'),
].join('\r\n');

const steps = [
  { cmd: null, expect: 220, label: 'greeting' },
  { cmd: 'EHLO mncardio.local', expect: 250, label: 'EHLO' },
  { cmd: 'AUTH LOGIN', expect: 334, label: 'AUTH LOGIN' },
  { cmd: Buffer.from(user).toString('base64'), expect: 334, label: 'username' },
  { cmd: Buffer.from(pass).toString('base64'), expect: 235, label: 'password' },
  { cmd: `MAIL FROM:<${user}>`, expect: 250, label: 'MAIL FROM' },
  { cmd: `RCPT TO:<${to}>`, expect: 250, label: 'RCPT TO' },
  { cmd: 'DATA', expect: 354, label: 'DATA' },
  // dot-stuff any line that begins with '.', then terminate with a lone dot
  { cmd: message.replace(/\r\n\./g, '\r\n..') + '\r\n.', expect: 250, label: 'message body' },
  { cmd: 'QUIT', expect: 221, label: 'QUIT' },
];

let i = 0;
let buf = '';
let failed = false;

const socket = tls.connect({ host, port, servername: host, rejectUnauthorized: !insecure });
socket.setEncoding('utf8');
socket.setTimeout(30000, () => {
  console.error(`Timed out talking to ${host}:${port} — is outbound SMTP blocked?`);
  failed = true;
  socket.destroy();
});

socket.on('data', (chunk) => {
  buf += chunk;
  if (!buf.endsWith('\r\n')) return;
  const lines = buf.trim().split('\r\n');
  const last = lines[lines.length - 1];
  if (/^\d{3}-/.test(last)) return; // multi-line reply still arriving
  buf = '';

  const code = parseInt(last.slice(0, 3), 10);
  const step = steps[i];

  if (code !== step.expect) {
    failed = true;
    console.error(`FAILED at ${step.label}: ${last}`);
    if (code === 534) {
      console.error(
        '\n2-Step Verification is on, but MAIL_USER_PASS is not an App Password.\n' +
          'Generate a 16-character one at https://myaccount.google.com/apppasswords\n' +
          'and put it in MAIL_USER_PASS in config/Config.env.'
      );
    } else if (code === 535) {
      console.error('\nCredentials rejected. See https://myaccount.google.com/apppasswords');
    }
    socket.end();
    return;
  }

  if (step.label === 'password') console.log('AUTH OK — credentials accepted.');
  if (step.label === 'message body') console.log(`SENT — ${last}`);

  i += 1;
  if (i < steps.length) socket.write(steps[i].cmd + '\r\n');
});

socket.on('error', (e) => {
  failed = true;
  console.error('Connection error:', e.message);
  if (/certificate/i.test(e.message)) {
    console.error('This network appears to intercept TLS. Re-run with --insecure.');
  }
});

socket.on('close', () => {
  if (!failed) console.log(`\nDone. Check the inbox for ${to} (and the spam folder).`);
  process.exit(failed ? 1 : 0);
});
