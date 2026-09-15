const sequelize = require('../config/DbConnection');
const SchemaProbe = require('./SchemaProbe');

/**
 * File.duration_ms and File.media_state, read and written without depending on
 * them existing.
 *
 * WHY NOT JUST DECLARE THEM ON THE MODEL. That is how model/Patient.js handles
 * ConfidentialityLevel, and for most tables it is the right answer. File is the
 * exception, because a declared attribute joins the default SELECT of EVERY
 * File query in the application. On a database where
 * scripts/add_file_media_columns.sql has not been run yet - and it is a request
 * to whoever holds SQL access, not something this repo can run - that would
 * turn one pending script into a total failure of every attachment, everywhere,
 * including the ~14,800 rows that have nothing to do with chat.
 *
 * So the columns stay out of the model and move through here instead: one
 * INFORMATION_SCHEMA probe decides whether they exist, and every call is a
 * no-op when they do not. The feature degrades to "no duration shown" rather
 * than taking the file layer down with it.
 *
 * The probe is cached for the life of the process (see SchemaProbe), so running
 * the script against a live server needs a restart before durations appear.
 */

const VALID_STATES = ['pending', 'done', 'failed'];

/** Whether the columns exist. False also means "probe has not run / failed". */
async function Available() {
  await SchemaProbe.Warm();
  return (
    SchemaProbe.HasColumn('File', 'duration_ms') && SchemaProbe.HasColumn('File', 'media_state')
  );
}

/**
 * Read metadata for a set of File ids.
 *
 * Returns a Map of id_data -> { DurationMs, MediaState }. An empty Map when the
 * columns are absent, which every caller must treat as "no information" rather
 * than as an error.
 */
async function Read(FileIds) {
  const Out = new Map();

  const Ids = (Array.isArray(FileIds) ? FileIds : [FileIds])
    .map((n) => parseInt(n, 10))
    .filter((n) => !!n && !Number.isNaN(n));
  if (Ids.length === 0) return Out;

  if (!(await Available())) return Out;

  try {
    // Ids are parsed integers above, so interpolating them cannot inject; a
    // bind array would be cleaner but Sequelize's mssql dialect does not expand
    // one into an IN list.
    const [Rows] = await sequelize.query(
      'SELECT id_data, duration_ms, media_state FROM [File] WHERE id_data IN (' +
        Ids.join(',') +
        ')'
    );

    (Rows || []).forEach((r) => {
      Out.set(r.id_data, {
        DurationMs: r.duration_ms === undefined ? null : r.duration_ms,
        MediaState: r.media_state === undefined ? null : r.media_state,
      });
    });
  } catch (ex) {
    console.error('[MediaMeta] read failed: ' + ex.message);
  }

  return Out;
}

/** Read one. Returns { DurationMs, MediaState } with nulls when unknown. */
async function ReadOne(FileId) {
  const Map_ = await Read([FileId]);
  return Map_.get(parseInt(FileId, 10)) || { DurationMs: null, MediaState: null };
}

/**
 * Write metadata for one file. Silently does nothing when the columns are
 * absent - a transcode result is not worth failing an upload over.
 *
 * Returns true when something was written.
 */
async function Write(FileId, { DurationMs, MediaState }) {
  const Id = parseInt(FileId, 10);
  if (!Id || Number.isNaN(Id)) return false;

  if (MediaState !== undefined && MediaState !== null && VALID_STATES.indexOf(MediaState) === -1) {
    console.error('[MediaMeta] refusing unknown media_state ' + MediaState);
    return false;
  }

  if (!(await Available())) return false;

  const Sets = [];
  const Bind = { Id };

  if (DurationMs !== undefined) {
    const Ms = parseInt(DurationMs, 10);
    Sets.push('duration_ms = $DurationMs');
    Bind.DurationMs = !Ms || Number.isNaN(Ms) || Ms < 0 ? null : Ms;
  }
  if (MediaState !== undefined) {
    Sets.push('media_state = $MediaState');
    Bind.MediaState = MediaState;
  }
  if (Sets.length === 0) return false;

  try {
    await sequelize.query('UPDATE [File] SET ' + Sets.join(', ') + ' WHERE id_data = $Id', {
      bind: Bind,
    });
    return true;
  } catch (ex) {
    console.error('[MediaMeta] write failed for file ' + Id + ': ' + ex.message);
    return false;
  }
}

module.exports = { Available, Read, ReadOne, Write, VALID_STATES };
