/**
 * Run a .sql script through the app's own connection.
 *
 *   node scripts/run_sql.js --db MnCardio_test scripts/seed_dico_rehab.sql
 *   node scripts/run_sql.js --dry scripts/add_x.sql      # print batches, run nothing
 *
 * --db is REQUIRED for anything that executes. See the guard note below: it is
 * the only thing standing between a test-only script and a production database.
 *
 * WHY THIS EXISTS. The repo owns no migrations (CLAUDE.md §2): every schema
 * change is a hand-written script plus a request to whoever holds SQL access.
 * That request is usually served with sqlcmd or SSMS, neither of which is
 * necessarily installed on the machine holding the script. This runs the same
 * file through config/DbConnection, so the script and the application can never
 * disagree about which database they mean.
 *
 * GO IS NOT T-SQL. It is a batch separator that sqlcmd and SSMS understand and
 * a driver does not - send a whole file containing GO to tedious and it is a
 * syntax error. So this splits on GO at the start of a line and sends each
 * batch separately, which is exactly what sqlcmd does.
 *
 * THE SCRIPTS' OWN GUARDS DO NOT PROTECT YOU HERE, AND THAT IS THE MOST
 * IMPORTANT THING ON THIS PAGE. Every script opens with
 *
 *     DECLARE @db sysname = DB_NAME();
 *     IF @db <> 'MnCardio_test' BEGIN RAISERROR(...); SET NOEXEC ON; END
 *     GO
 *
 * Under sqlcmd that works, because sqlcmd holds ONE connection and SET NOEXEC
 * ON is connection state that survives into later batches. Sequelize pools
 * connections - config/DbConnection.js sets pool.max to 20 - so batch 2 can be
 * issued on a different connection from batch 1, one that never saw the NOEXEC.
 * The guard would then be silently inert and the script would apply to whatever
 * database it reached.
 *
 * So this refuses to run anything unless --db names the database it actually
 * connected to. The check is in JavaScript, before the first batch, and it does
 * not depend on connection affinity at all. The in-script guards stay as the
 * second line of defence for whoever runs the same file through sqlcmd.
 *
 * Batches are still sent one at a time and in order, because the later ones
 * frequently depend on objects the earlier ones create.
 *
 * PRINTS ARE NOT RETURNED. tedious surfaces PRINT as an info message, not a
 * result set, so the 'added X' / 'X already exists' lines the scripts emit are
 * captured through the connection's info handler where available. Any SELECT at
 * the end of a script - most of them finish with a verification query - comes
 * back normally and is printed as a table.
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const dry = args.includes('--dry');

const dbIdx = args.indexOf('--db');
const expectDb = dbIdx >= 0 ? args[dbIdx + 1] : null;

const file = args.filter((a, i) => !a.startsWith('--') && i !== dbIdx + 1).find(Boolean);

if (!file) {
  console.error('usage: node scripts/run_sql.js --db <database> [--dry] <file.sql>');
  process.exit(2);
}

if (!dry && !expectDb) {
  console.error(
    'refusing to run without --db.\n' +
      '\n' +
      'These scripts carry their own "IF DB_NAME() <> ... SET NOEXEC ON" guard, but that\n' +
      'guard only works under sqlcmd, which holds one connection. Sequelize pools up to 20,\n' +
      'so a later batch can land on a connection that never saw the NOEXEC and the guard\n' +
      'becomes inert. Name the database you expect and it is checked here, before anything runs.\n' +
      '\n' +
      '  node scripts/run_sql.js --db MnCardio_test ' + file
  );
  process.exit(2);
}

const full = path.resolve(file);
if (!fs.existsSync(full)) {
  console.error('no such file: ' + full);
  process.exit(2);
}

// Strip the UTF-8 BOM. It is REQUIRED in these files - sqlcmd -i misreads
// Cyrillic without it - but it is not valid SQL, and left in place it becomes a
// stray character at the start of the first batch.
let sql = fs.readFileSync(full, 'utf8');
if (sql.charCodeAt(0) === 0xfeff) sql = sql.slice(1);

// Split on a line that is only GO (with optional whitespace/comment), keeping
// the batches in order. Case-insensitive, because scripts use both.
const batches = sql
  .split(/^\s*GO\s*(?:--.*)?$/gim)
  .map((b) => b.trim())
  .filter((b) => b.length > 0);

console.log('file:    ' + full);
console.log('batches: ' + batches.length);

if (dry) {
  batches.forEach((b, i) => {
    console.log('\n--- batch ' + (i + 1) + ' ---');
    console.log(b.length > 400 ? b.slice(0, 400) + '\n  ...[truncated]' : b);
  });
  process.exit(0);
}

const sequelize = require('../config/DbConnection');

(async () => {
  let failed = 0;

  try {
    const [[who]] = await sequelize.query('SELECT DB_NAME() AS db, @@SERVERNAME AS srv');
    console.log('database: ' + who.db + '   server: ' + who.srv);

    if (String(who.db) !== String(expectDb)) {
      console.error(
        '\nREFUSING TO RUN.\n' +
          '  --db said:   ' + expectDb + '\n' +
          '  connected to: ' + who.db + ' on ' + who.srv + '\n' +
          '\nNothing was executed. config/Config.env does not point at the test database by\n' +
          'default (CLAUDE.md §4), and dotenv never overrides an already-set variable - so set\n' +
          'SQL_SERVER / SQL_DB / SQL_USER / SQL_PASSWORD / SQL_PORT / SQL_ENCRYPT in the\n' +
          'process before running this.'
      );
      process.exit(1);
    }
    console.log('');
  } catch (ex) {
    console.error('could not connect: ' + ex.message);
    process.exit(1);
  }

  for (let i = 0; i < batches.length; i++) {
    const label = 'batch ' + (i + 1) + '/' + batches.length;
    try {
      const [rows] = await sequelize.query(batches[i]);
      if (Array.isArray(rows) && rows.length && typeof rows[0] === 'object') {
        console.log(label + ': ' + rows.length + ' row(s)');
        console.table(rows.slice(0, 45));
      } else {
        console.log(label + ': ok');
      }
    } catch (ex) {
      failed++;
      console.error(label + ': FAILED - ' + ex.message);
      // Keep going. These scripts are idempotent and batch-per-object, so one
      // failing object should not hide the state of the rest - and stopping
      // would leave a half-applied script with no report of what landed.
    }
  }

  console.log('');
  console.log(failed ? failed + ' batch(es) failed' : 'all batches ok');
  process.exit(failed ? 1 : 0);
})();
