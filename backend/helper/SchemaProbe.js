/**
 * What the database actually has, read once.
 *
 * This repo owns no migrations: schema changes are hand-written scripts under
 * backend/scripts and a request to whoever holds SQL access (CLAUDE.md §2). So
 * the code and the schema move at different times, and by design the code can
 * be ahead. config/DB.js loads every model without touching the database, so a
 * model for a table that does not exist yet loads happily and only fails when
 * something queries it - which is exactly why the rehabilitation endpoints
 * returned 500 rather than 404 before their script was run.
 *
 * Asking this helper first turns that failure into a decision. A feature whose
 * table is missing can fall back, or stay dark, instead of throwing at whoever
 * happened to call it.
 *
 * Precedent for the approach: helper/DoctorExamReportHelper.js does the same
 * one-shot INFORMATION_SCHEMA read for the same reason - production, test and
 * the restored copy are not identical, so a report must skip what is absent
 * rather than fall over.
 *
 * Read ONCE per process, deliberately. A DDL script run against a live server
 * will not be noticed until restart. That is the right trade: re-reading per
 * call would put a metadata query in front of ordinary requests, and running
 * DDL against a live server is already a deploy-shaped event.
 */

const sequelize = require('../config/DbConnection');
const Logger = require('./Logger');

let Columns = null; // Set of 'table.column', both lowercased
let Tables = null; // Set of 'table', lowercased
let Failed = false;

const Key = (t, c) => String(t).toLowerCase() + '.' + String(c).toLowerCase();

/**
 * Populate the cache. Safe to call more than once; the second call is a no-op.
 *
 * Never throws. If the probe itself fails - no connection yet, no permission on
 * INFORMATION_SCHEMA - every Has* call answers false, which puts each feature
 * into its "table missing" branch. For a security control that branch must be
 * the safe one, so read the callers with that in mind rather than assuming the
 * probe always succeeds.
 */
async function Warm() {
  if (Columns) return true;

  try {
    const [Rows] = await sequelize.query(
      "SELECT TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dbo'"
    );

    Columns = new Set();
    Tables = new Set();
    Rows.forEach((r) => {
      Columns.add(Key(r.TABLE_NAME, r.COLUMN_NAME));
      Tables.add(String(r.TABLE_NAME).toLowerCase());
    });
    Failed = false;
    return true;
  } catch (ex) {
    // console.error, not console.log: server.js silences console.log in
    // production and a dark feature set is exactly what you want to see there.
    Logger.warn('[SchemaProbe] could not read INFORMATION_SCHEMA: ' + ex.message);
    Columns = null;
    Tables = null;
    Failed = true;
    return false;
  }
}

/** False when the probe has not run or could not run. */
function HasTable(name) {
  if (!Tables) return false;
  return Tables.has(String(name).toLowerCase());
}

/** False when the probe has not run or could not run. */
function HasColumn(table, column) {
  if (!Columns) return false;
  return Columns.has(Key(table, column));
}

/** Whether the probe ran at all, so a caller can tell "absent" from "unknown". */
function IsReady() {
  return Columns !== null;
}

/**
 * One boot line naming which pending-DDL features are live and which are dark.
 * Cheaper to read than to deduce from an endpoint's behaviour later.
 *
 * Each entry is a feature the mobile tender needs and the table its script
 * creates. Extend this as scripts are added, not as tables are.
 */
const PENDING = [
  {
    Feature: 'rehabilitation (2.7)',
    Table: 'RehabExercise',
    Script: 'add_rehabilitation_tables.sql',
  },
  {
    Feature: 'e-visit booking (2.6)',
    Table: 'RemoteVisit',
    Column: 'Status',
    Script: 'add_remotevisit_booking_columns.sql',
  },
  {
    Feature: 'patient notifications',
    Table: 'Notification',
    Column: 'ToPatientId',
    Script: 'add_notification_patient_recipient.sql',
  },
  { Feature: 'push devices', Table: 'PushDevice', Script: 'add_push_device_tokens.sql' },
  { Feature: 'reminders', Table: 'PatientReminder', Script: 'add_patient_reminders.sql' },
  {
    Feature: 'login lockout persistence',
    Table: 'LoginAttempt',
    Script: 'add_login_attempt_tracking.sql',
  },
  {
    Feature: 'access audit forensics',
    Table: 'UserActionHistory',
    Column: 'IpAddress',
    Script: 'add_access_audit.sql',
  },
  { Feature: 'token revocation', Table: 'UserSession', Script: 'add_token_revocation.sql' },
  {
    Feature: 'doctor licence',
    Table: 'DoctorsProfile',
    Column: 'LicenseCode',
    Script: 'add_doctor_licence_code.sql',
  },
  { Feature: 'consent capture', Table: 'PatientConsent', Script: 'add_consent_tables.sql' },
  {
    Feature: 'confidentiality',
    Table: 'Patient',
    Column: 'ConfidentialityLevel',
    Script: 'add_confidentiality_flag.sql',
  },
  {
    Feature: 'chat media duration (47)',
    Table: 'File',
    Column: 'duration_ms',
    Script: 'add_file_media_columns.sql',
  },
];

function LogPending() {
  if (!IsReady()) {
    Logger.warn('[SchemaProbe] not ready - every optional feature will read as dark');
    return;
  }

  const Dark = PENDING.filter((p) =>
    p.Column ? !HasColumn(p.Table, p.Column) : !HasTable(p.Table)
  );

  if (!Dark.length) {
    Logger.info('[SchemaProbe] all pending-DDL features have their schema');
    return;
  }

  // warn, not error: a feature whose DDL has not been applied on this box is an
  // expected state (PRODUCTION-CHECKLIST.md lists which scripts are pending
  // where), not a failure. Logging it as ERROR made every healthy boot look
  // broken in api-error.log.
  Logger.warn(
    '[SchemaProbe] dark, schema not present: ' +
      Dark.map((p) => p.Feature + ' (' + p.Script + ')').join(', ')
  );
}

module.exports = { Warm, HasTable, HasColumn, IsReady, LogPending, Failed: () => Failed };
