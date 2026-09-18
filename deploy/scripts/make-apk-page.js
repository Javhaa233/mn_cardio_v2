#!/usr/bin/env node
/*
 * Build the download page for the Android test APK.
 *
 *   node deploy/scripts/make-apk-page.js <apk-file> <version> <out-dir>
 *
 * Emits <out-dir>/index.html, carrying the version, size, sha256 and build date
 * of the APK it was pointed at. Node stdlib only — neither repo gains a
 * dependency for a page that is rebuilt a handful of times a year.
 *
 * The QR code is deploy/apk/qr.svg, generated once and committed, because it
 * encodes a URL that does not change between releases
 * (https://mncardio.itsystem.mn/apk). Regenerating it per build would mean a
 * dependency for an identical result.
 *
 * The page makes no external requests. It is served by nginx to people standing
 * in a hospital on a phone, and a blocked font CDN must not be able to make the
 * install instructions unreadable.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const [, , apkPath, version, outDir] = process.argv;
if (!apkPath || !version || !outDir) {
  console.error('usage: make-apk-page.js <apk-file> <version> <out-dir>');
  process.exit(1);
}

const bytes = fs.readFileSync(apkPath);
const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
const megabytes = (bytes.length / (1024 * 1024)).toFixed(1);
// The button must link to what is ON THE SERVER, not to the local build's name:
// the build lands as app-release.apk and is uploaded as mncardio-<version>.apk, so
// linking basename(apkPath) gave a 404 and phones reported "download failed"
// (2026-09-17). 20-publish-apk.sh always points this symlink at the newest build.
const apkName = 'mncardio-latest.apk';
const built = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';

const qr = fs.readFileSync(path.join(__dirname, '..', 'apk', 'qr.svg'), 'utf8')
  .replace(/^<\?xml[^>]*\?>\s*/, '');

// Brand tokens from frontend/src/theme/colors.js. cyanInk is the readable one:
// plain `cyan` is ~2.5:1 on white and fails WCAG AA for anything that is a word.
const html = `<!doctype html>
<html lang="mn">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>МнКардио — Android аппликейшн</title>
<style>
  :root {
    --ink: #0c2233;
    --canvas: #eaf2f8;
    --cyan-ink: #0a6c96;
    --urgent: #ee147d;
    --card: #ffffff;
    --muted: #55707f;
    --line: #d7e3ec;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 24px 16px 56px;
    background: var(--canvas);
    color: var(--ink);
    font: 16px/1.6 "Segoe UI", Roboto, system-ui, sans-serif;
  }
  .wrap { max-width: 720px; margin: 0 auto; }
  header { text-align: center; margin-bottom: 28px; }
  h1 { font-size: 28px; font-weight: 700; margin: 0 0 6px; }
  .sub { color: var(--muted); margin: 0; }
  .card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 14px;
    padding: 24px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(12, 34, 51, 0.08);
  }
  .grab { display: flex; gap: 28px; align-items: center; flex-wrap: wrap; }
  .grab .qr { flex: 0 0 168px; }
  .grab .qr svg { width: 168px; height: 168px; display: block; border-radius: 8px; }
  .grab .take { flex: 1 1 260px; min-width: 240px; }
  .btn {
    display: block;
    text-align: center;
    background: var(--cyan-ink);
    color: #fff;
    text-decoration: none;
    font-size: 17px;
    font-weight: 600;
    padding: 15px 20px;
    border-radius: 10px;
  }
  .btn:hover { background: #08587a; }
  .btn small { display: block; font-weight: 400; font-size: 13px; opacity: 0.85; margin-top: 3px; }
  dl { display: grid; grid-template-columns: max-content 1fr; gap: 8px 20px; margin: 0; }
  dt { color: var(--muted); }
  dd { margin: 0; font-variant-numeric: tabular-nums; }
  code { font-family: Consolas, "Courier New", monospace; font-size: 12.5px; word-break: break-all; }
  h2 { font-size: 18px; font-weight: 600; margin: 0 0 12px; }
  ol { margin: 0; padding-left: 22px; }
  ol li { margin-bottom: 8px; }
  .warn {
    border-left: 4px solid var(--urgent);
    background: #fff5fa;
    padding: 16px 20px;
    border-radius: 0 10px 10px 0;
  }
  .warn h2 { color: var(--urgent); }
  footer { text-align: center; color: var(--muted); font-size: 13px; margin-top: 28px; }
  @media (max-width: 520px) {
    .grab { justify-content: center; text-align: center; }
    dl { grid-template-columns: 1fr; gap: 2px 0; }
    dt { margin-top: 10px; }
  }
</style>
</head>
<body>
<div class="wrap">

  <header>
    <h1>МнКардио</h1>
    <p class="sub">Зүрх судасны үндэсний төв — Android аппликейшн, туршилтын хувилбар</p>
  </header>

  <div class="card grab">
    <div class="qr">${qr}</div>
    <div class="take">
      <a class="btn" href="${apkName}" download>
        Татаж авах
        <small>${version} · ${megabytes} MB</small>
      </a>
    </div>
  </div>

  <div class="card">
    <h2>Хувилбарын мэдээлэл</h2>
    <dl>
      <dt>Хувилбар</dt><dd>${version}</dd>
      <dt>Файл</dt><dd>${apkName}</dd>
      <dt>Хэмжээ</dt><dd>${megabytes} MB (${bytes.length.toLocaleString('en-US')} байт)</dd>
      <dt>Огноо</dt><dd>${built}</dd>
      <dt>Сервер</dt><dd>https://mncardio.itsystem.mn</dd>
      <dt>SHA-256</dt><dd><code>${sha256}</code></dd>
    </dl>
  </div>

  <div class="card">
    <h2>Суулгах заавар</h2>
    <ol>
      <li>Дээрх <strong>Татаж авах</strong> товчийг дарж <code>.apk</code> файлыг утсандаа татна.</li>
      <li>Андройд “Үл мэдэгдэх эх сурвалжаас суулгах”-ыг асуувал зөвшөөрнө:
        <br><em>Тохиргоо → Аюулгүй байдал → Үл мэдэгдэх эх сурвалж</em>
        (эсвэл <em>Тохиргоо → Апп → Тусгай хандалт → Үл мэдэгдэх апп суулгах</em>).</li>
      <li>Татсан файлаа нээж <strong>Суулгах</strong> дарна.</li>
      <li>Аппыг нээж, туршилтын бүртгэлээрээ нэвтэрнэ.</li>
    </ol>
  </div>

  <div class="card warn">
    <h2>Анхаарах зүйл</h2>
    <p>Энэ бол <strong>туршилтын хувилбар</strong>. Хөгжүүлэлтийн түлхүүрээр
    (debug key) гарын үсэг зурагдсан тул Google Play-д тавих боломжгүй бөгөөд
    Андройд суулгахын өмнө сэрэмжлүүлэг харуулна.</p>
    <p>Аппликейшн <strong>туршилтын өгөгдлийн сан</strong>
    (<code>mncardio.itsystem.mn</code>) руу холбогдоно — эмнэлгийн үйл ажиллагаанд
    хараахан ашиглах боломжгүй.</p>
    <p>Албан ёсны хувилбарын гарын үсгийн түлхүүрийг ЗСҮТ эзэмших ёстой. Түүнийг
    гаргасны дараа энэ хувилбарыг дээрээс нь шинэчлэх боломжгүй тул
    <strong>устгаад дахин суулгана</strong>.</p>
  </div>

  <footer>ITsystem · ЗСҮТ · ${built}</footer>

</div>
</body>
</html>
`;

fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'index.html');
fs.writeFileSync(outFile, html, 'utf8');

console.log('wrote ' + outFile);
console.log('  apk     ' + apkName);
console.log('  version ' + version);
console.log('  size    ' + megabytes + ' MB');
console.log('  sha256  ' + sha256);
