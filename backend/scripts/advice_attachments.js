/**
 * Audits Advice / AdviceComment attachments against the bytes on disk.
 *
 * The test environment restored the production database but never copied
 * ALLFILE_DIR, so every legacy attachment renders a chip in the feed and then
 * answers 404 from /BaseObject/downloadFile - `BaseDownloadFile` fails
 * `fs.existsSync` and there is nothing in the logs, because NODE_ENV=production
 * silences console.log. This script is how you tell the two apart: a File row
 * with no file, versus a genuinely broken row.
 *
 *   node scripts/advice_attachments.js                    # summary + disk check
 *   node scripts/advice_attachments.js --list names.txt   # rsync --files-from input
 *   node scripts/advice_attachments.js --find "advice (13)"
 *
 * Read-only: it runs SELECTs and writes nothing but the optional list file.
 */
require('dotenv').config({ path: './config/Config.env' });

const fs = require('fs');
const path = require('path');
const { sequelize } = require('../config/DB');

// Same platform branch as server.js:38-43, so the audit looks where the app looks.
const AllFileDir =
  process.platform === 'win32'
    ? process.env.ALLFILE_DIR_WINDOWS
    : process.platform === 'linux'
      ? process.env.ALLFILE_DIR1
      : process.env.ALLFILE_DIR;

const ADVICE_OBJECTS = "('Advice','AdviceComment')";

const mb = (bytes) => (Number(bytes || 0) / 1048576).toFixed(1) + ' MB';

async function query(sql) {
  const [rows] = await sequelize.query(sql);
  return rows;
}

/** Present on disk as a plain file, or as an upload directory holding `file`. */
function onDisk(generatedName) {
  if (!generatedName) return false;
  const target = path.join(AllFileDir, generatedName);
  if (!fs.existsSync(target)) return false;
  try {
    return fs.statSync(target).isDirectory() ? fs.existsSync(path.join(target, 'file')) : true;
  } catch (ex) {
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const listAt = args.indexOf('--list');
  const findAt = args.indexOf('--find');

  console.log('ALLFILE_DIR: ' + AllFileDir);
  console.log('database:    ' + process.env.SQL_DB + ' @ ' + (process.env.SQL_SERVER || 'localhost'));
  console.log('');

  if (findAt > -1) {
    const term = (args[findAt + 1] || '').replace(/'/g, "''");
    const rows = await query(
      "SELECT id_data, generated_name, ext, rec_status, LinkedObjectName, LinkedObjectId, size," +
        " CONVERT(varchar(19), date_creation, 120) AS created" +
        " FROM [File] WHERE original_name LIKE N'" +
        term +
        "%' ORDER BY id_data"
    );
    for (const row of rows) {
      console.log(
        [
          'id_data=' + row.id_data,
          row.LinkedObjectName + '#' + row.LinkedObjectId,
          'name=' + row.generated_name,
          'ext=' + row.ext,
          'rec_status=' + row.rec_status,
          'size=' + row.size,
          'created=' + row.created,
          onDisk(row.generated_name) ? 'ON DISK' : 'MISSING',
        ].join('  ')
      );
    }
    if (!rows.length) console.log('no File row matches that original_name');
    console.log('');
  }

  const byObject = await query(
    "SELECT LinkedObjectName, COUNT(*) AS Rows_, SUM(CAST(size AS BIGINT)) AS Bytes" +
      " FROM [File] WHERE rec_status <> '2' AND LinkedObjectName IN " +
      ADVICE_OBJECTS +
      ' GROUP BY LinkedObjectName'
  );
  for (const row of byObject) {
    console.log(row.LinkedObjectName + ': ' + row.Rows_ + ' rows, ' + mb(row.Bytes));
  }

  const rows = await query(
    "SELECT generated_name, ext, size FROM [File] WHERE rec_status <> '2'" +
      ' AND LinkedObjectName IN ' +
      ADVICE_OBJECTS +
      ' AND generated_name IS NOT NULL ORDER BY generated_name DESC'
  );

  const unique = new Map();
  for (const row of rows) {
    if (!unique.has(row.generated_name)) unique.set(row.generated_name, row);
  }

  let present = 0;
  let missingBytes = 0;
  let noExt = 0;
  const missing = [];
  for (const [name, row] of unique) {
    if (!row.ext || !String(row.ext).trim()) noExt += 1;
    if (onDisk(name)) present += 1;
    else {
      missing.push(name);
      missingBytes += Number(row.size || 0);
    }
  }

  console.log('');
  console.log('distinct generated_name : ' + unique.size);
  console.log('present in ALLFILE_DIR  : ' + present);
  console.log('missing from ALLFILE_DIR: ' + missing.length + ' (' + mb(missingBytes) + ' to copy)');
  console.log('rows with empty ext     : ' + noExt + ' (these 404 even when the bytes exist)');

  if (listAt > -1) {
    const target = args[listAt + 1] || 'advice_files.txt';
    fs.writeFileSync(target, missing.join('\n') + (missing.length ? '\n' : ''), 'utf8');
    console.log('');
    console.log('wrote ' + missing.length + ' names to ' + target);
  }

  await sequelize.close();
}

main().catch(async (ex) => {
  console.error(ex.message);
  try {
    await sequelize.close();
  } catch (closeEx) {
    // nothing useful to add
  }
  process.exit(1);
});
