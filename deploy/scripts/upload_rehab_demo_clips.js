/**
 * Attach the 14 demo exercise loops cut from video/0917.mp4 to the rehab player
 * on the TEST environment (mncardio.itsystem.mn / MnCardio_test).
 *
 *   node deploy/scripts/upload_rehab_demo_clips.js            # dry run: what would happen
 *   node deploy/scripts/upload_rehab_demo_clips.js --apply    # upload and link
 *
 * Prerequisites:
 *   - backend 2.3.0 deployed on the test box (UploadPolicy lets RehabMovement take video)
 *   - backend/scripts/seed_rehab_demo_movements_0917.sql applied (14 rows on EX-01)
 *   - video/loops/EX01-M01..14.mp4 + .jpg (the clips never go to GitHub: a real
 *     staff member is in them, and video/ is outside the export allowlist)
 *
 * WHY THROUGH THE UPLOAD ROUTE. /api/BaseObject/uploadFile writes the bytes into
 * ALLFILE_DIR and creates the File row, and runs the same authorization, extension
 * and content checks a real upload does. Copying files onto the box by hand would
 * skip all three and leave rows that nothing validated.
 *
 * Movement OrderNo n <-> clip EX01-M0n. Afterwards MediaRef / ThumbRef are set to
 * the scheme helper/MediaRef.js reads ('file:<generated_name>'). Re-running skips a
 * movement that already has media.
 *
 * Credentials come from test-environment.env (TEST_ADMIN_*, SQL_*) and are never printed.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const APPLY = process.argv.includes('--apply');
const BASE = process.env.MNCARDIO_BASE || 'https://mncardio.itsystem.mn';
const LOOPS = path.join(ROOT, 'video', 'loops');

const env = {};
for (const line of fs.readFileSync(path.join(ROOT, 'test-environment.env'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
Object.assign(process.env, {
  SQL_SERVER: env.SQL_HOST,
  SQL_PORT: env.SQL_PORT,
  SQL_DB: env.SQL_DB,
  SQL_USER: env.SQL_USER,
  SQL_PASSWORD: env.SQL_PASSWORD,
  SQL_ENCRYPT: 'true',
});
const sequelize = require(path.join(ROOT, 'backend', 'config', 'DbConnection'));

async function upload(token, movementId, field, file) {
  const form = new FormData();
  form.append(
    'LinkedObjectInfo',
    JSON.stringify({ LinkedObjectId: movementId, LinkedObjectName: 'RehabMovement', FieldName: field })
  );
  form.append(field + 'Info', JSON.stringify({ Name: path.basename(file) }));
  const type = file.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg';
  form.append(field, new Blob([fs.readFileSync(file)], { type }), path.basename(file));
  const r = await fetch(BASE + '/api/BaseObject/uploadFile', {
    method: 'POST',
    headers: { authorization: 'Bearer ' + token },
    body: form,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.Success === false) {
    throw new Error(`${path.basename(file)}: HTTP ${r.status} ${j.Message || ''}`);
  }
  const [[row]] = await sequelize.query(
    `SELECT TOP 1 generated_name FROM [File]
      WHERE LinkedObjectName = 'RehabMovement' AND LinkedObjectId = :id AND FieldName = :field
      ORDER BY id_data DESC`,
    { replacements: { id: movementId, field } }
  );
  if (!row) throw new Error(`${path.basename(file)}: uploaded but no File row found`);
  return 'file:' + row.generated_name;
}

(async () => {
  const [[who]] = await sequelize.query('SELECT DB_NAME() AS db');
  if (who.db !== 'MnCardio_test') throw new Error('Refusing: connected to ' + who.db);

  const [movements] = await sequelize.query(
    `SELECT m.Id, m.OrderNo, m.Name, m.MediaRef, m.ThumbRef
       FROM RehabMovement m JOIN RehabExercise e ON e.Id = m.ExerciseId
      WHERE e.Code = 'EX-01' AND m.IsActive = 1 ORDER BY m.OrderNo`
  );
  console.log(`${movements.length} movements on EX-01, ${APPLY ? 'APPLYING' : 'dry run'} against ${BASE}`);

  let token = null;
  if (APPLY) {
    const r = await fetch(BASE + '/api/User/Login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ UserName: env.TEST_ADMIN_USER, Password: env.TEST_ADMIN_PASSWORD }),
    });
    const j = await r.json();
    token = j && j.Data && j.Data.token;
    if (!token) throw new Error('Admin login failed: ' + (j && j.Message));
  }

  for (const m of movements) {
    const code = 'EX01-M' + String(m.OrderNo).padStart(2, '0');
    const mp4 = path.join(LOOPS, code + '.mp4');
    const jpg = path.join(LOOPS, code + '.jpg');
    if (!fs.existsSync(mp4)) {
      console.log(`  ${code}  no clip on disk, skipped`);
      continue;
    }
    if (m.MediaRef) {
      console.log(`  ${code}  already linked, skipped`);
      continue;
    }
    if (!APPLY) {
      console.log(`  ${code}  would upload ${path.basename(mp4)} + ${path.basename(jpg)} -> movement ${m.Id}`);
      continue;
    }
    const MediaRef = await upload(token, m.Id, 'Loop', mp4);
    const ThumbRef = fs.existsSync(jpg) ? await upload(token, m.Id, 'Thumb', jpg) : null;
    await sequelize.query(
      'UPDATE RehabMovement SET MediaRef = :MediaRef, ThumbRef = :ThumbRef WHERE Id = :Id',
      { replacements: { MediaRef, ThumbRef, Id: m.Id } }
    );
    console.log(`  ${code}  linked`);
  }
  await sequelize.close();
})().catch(async (e) => {
  console.error('FAILED:', e.message);
  try {
    await sequelize.close();
  } catch (_) {}
  process.exit(1);
});
