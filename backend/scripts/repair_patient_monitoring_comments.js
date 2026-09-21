/**
 * Repair double-encoded text in PatientMonitoring.comment.
 *
 *   node scripts/repair_patient_monitoring_comments.js --db MnCardio_test
 *   node scripts/repair_patient_monitoring_comments.js --db MnCardio_test --apply
 *
 * --db is REQUIRED and is checked against DB_NAME() before anything happens,
 * following scripts/run_sql.js: it is the only thing standing between this and
 * the wrong database. Without --apply it prints every proposed change and
 * writes nothing.
 *
 * THIS REWRITES PATIENT-ENTERED TEXT. It is a data change, not a schema
 * change, so under CLAUDE.md §2 it is a request to whoever holds SQL access
 * and needs ЗСҮТ's agreement before it runs anywhere that matters. The dry run
 * exists so that conversation can happen over a real before/after list.
 *
 * THE DAMAGE
 * An older version of the app read UTF-8 bytes as single-byte characters and
 * stored the result in an nvarchar column, so each byte of the original became
 * its own character. "Амлодипин" is D0 90 D0 BC ... in UTF-8 and is stored as
 * the characters U+00D0 U+0090 U+00D0 U+00BC ...
 *
 * Measured on MnCardio_test, 2026-09-21: 12 of 37 non-empty comments are
 * damaged, all from 2017-2018. Rows from 2024 onward are clean, so whatever
 * caused it was fixed long ago and this is historic data only. It renders as
 * mojibake everywhere the comment appears - the journal list, the chart
 * tooltip and the .xlsx export.
 *
 * TWO DECODERS, NOT ONE - this is the part that is easy to get wrong.
 * Some rows were read as Latin-1, where byte 0x90 stays U+0090. Others were
 * read as CP1252, where 0x82 becomes U+201A and 0x9A becomes U+0161 - code
 * points well above U+00FF. A Latin-1-only reversal silently repairs 2 rows
 * and skips the other 10, which look identical to the eye. Both are handled.
 *
 * WHY NOT T-SQL. A collation-based expression was tried first
 * (CONVERT through Latin1_General_100_BIN2 and back through a UTF-8
 * collation). On this data it was a no-op on all 12 damaged rows AND would
 * have rewritten 14 undamaged ones - the precise failure you cannot afford on
 * clinical free text. The byte handling is explicit here instead.
 */
require('dotenv').config({ path: './config/Config.env' });

const DB = require('../config/DB');

const argv = process.argv.slice(2);
const APPLY = argv.includes('--apply');
const dbIndex = argv.indexOf('--db');
const WANT_DB = dbIndex >= 0 ? argv[dbIndex + 1] : null;

/**
 * CP1252's 0x80-0x9F block, inverted: character -> the byte it came from.
 * Outside this block CP1252 and Latin-1 agree, so a plain code point is right.
 */
const CP1252_HIGH = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84,
  0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88,
  0x2030: 0x89, 0x0160: 0x8a, 0x2039: 0x8b, 0x0152: 0x8c,
  0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92, 0x201c: 0x93,
  0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
  0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b,
  0x0153: 0x9c, 0x017e: 0x9e, 0x0178: 0x9f,
};

/**
 * The repaired string, or null when the row must be left alone.
 *
 * Four guards, all of which must pass. A row that fails any of them is
 * reported rather than changed - on clinical text, refusing is always the
 * cheaper mistake.
 */
function repair(value) {
  if (typeof value !== 'string' || value === '') return null;

  const bytes = [];
  for (const ch of value) {
    const c = ch.codePointAt(0);
    if (c <= 0xff) bytes.push(c);
    else if (CP1252_HIGH[c] !== undefined) bytes.push(CP1252_HIGH[c]);
    // 1. a character that is neither byte-like nor a CP1252 high char means
    //    this is real text that merely contains an accent - do not touch it.
    else return null;
  }

  const out = Buffer.from(bytes).toString('utf8');
  // 2. the bytes have to BE valid UTF-8; a replacement char means they are not.
  if (out.includes('�')) return null;
  // 3. the whole point is recovering Cyrillic. No Cyrillic, no repair.
  if (!/[Ѐ-ӿ]/.test(out)) return null;
  // 4. nothing to write.
  if (out === value) return null;

  return out;
}

async function main() {
  if (!WANT_DB) {
    console.log('ERROR: --db <database> is required.');
    console.log(
      'usage: node scripts/repair_patient_monitoring_comments.js --db MnCardio_test [--apply]'
    );
    process.exitCode = 1;
    return;
  }

  const [[info]] = [
    await DB.sequelize.query('SELECT DB_NAME() AS db', { plain: false }),
  ];
  const actual = Array.isArray(info) ? info[0].db : info.db;

  if (actual !== WANT_DB) {
    console.log(
      'ERROR: --db said ' + WANT_DB + ' but the connection is on ' + actual + '. Refusing.'
    );
    process.exitCode = 1;
    return;
  }

  console.log('database: ' + actual + '   mode: ' + (APPLY ? 'APPLY' : 'DRY RUN'));

  const [rows] = await DB.sequelize.query(
    "SELECT id_data, comment FROM PatientMonitoring " +
      "WHERE comment IS NOT NULL AND LTRIM(RTRIM(comment)) <> '' ORDER BY id_data"
  );

  const fixes = [];
  const flagged = [];
  for (const r of rows) {
    const out = repair(r.comment);
    if (out) fixes.push({ id: r.id_data, before: r.comment, after: out });
    else if (/[À-ÿ–—‘-„]/.test(r.comment)) {
      flagged.push({ id: r.id_data, text: r.comment });
    }
  }

  console.log('rows with a comment:      ' + rows.length);
  console.log('rows this would repair:   ' + fixes.length);
  console.log('suspicious, NOT repaired: ' + flagged.length);
  console.log('');

  for (const f of fixes) {
    console.log('  id_data=' + f.id);
    console.log('    before: ' + JSON.stringify(f.before));
    console.log('    after : ' + JSON.stringify(f.after));
  }
  for (const f of flagged) {
    console.log('  SKIPPED id_data=' + f.id + ': ' + JSON.stringify(f.text));
  }

  if (!APPLY) {
    console.log('');
    console.log('Dry run - nothing written. Add --apply to write these changes.');
    return;
  }

  let written = 0;
  for (const f of fixes) {
    await DB.sequelize.query(
      'UPDATE PatientMonitoring SET comment = :after WHERE id_data = :id',
      { replacements: { after: f.after, id: f.id } }
    );
    written += 1;
  }
  console.log('');
  console.log('rows written: ' + written);
}

main()
  .catch((ex) => {
    console.log('ERROR: ' + ex.message);
    process.exitCode = 1;
  })
  .finally(() => process.exit());
