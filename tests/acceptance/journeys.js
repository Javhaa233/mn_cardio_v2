/**
 * Layer 2 — depth. The write paths a clinician actually uses.
 *
 * Every journey is create → read back → assert the data landed. An endpoint
 * that returns {Success:true} but stores nothing passes a sweep and fails a
 * user, so nothing here trusts the response alone.
 *
 * Records created are tagged with TAG (ZZTEST-<runid>) and deliberately left in
 * place as evidence; the report lists them and how to remove them.
 */
const crypto = require('crypto');
const { CONFIG, request, loginStaff, loginPatient, TAG, RUN_ID } = require('./lib');

const results = [];
let ctx = {};

function check(journey, step, pass, detail) {
  results.push({ journey, step, pass: !!pass, detail: String(detail || '').slice(0, 180) });
  process.stderr.write('   ' + (pass ? 'ok  ' : 'FAIL') + ' ' + journey + ' / ' + step + '\n');
  return pass;
}

const ok = (r) => r.json && (r.json.Success === true || r.json.success === true);
const msg = (r) => (r.json && (r.json.Message || r.json.message)) || 'HTTP ' + r.status;

/* ------------------------------------------------------ multipart builder */

function multipart(fields, files) {
  const boundary = '----acc' + crypto.randomBytes(12).toString('hex');
  const parts = [];
  for (const [name, value] of Object.entries(fields)) {
    parts.push(
      Buffer.from(
        '--' + boundary + '\r\nContent-Disposition: form-data; name="' + name + '"\r\n\r\n' + value + '\r\n'
      )
    );
  }
  for (const f of files) {
    parts.push(
      Buffer.from(
        '--' + boundary + '\r\nContent-Disposition: form-data; name="' + f.field + '"; filename="' +
          f.filename + '"\r\nContent-Type: ' + (f.type || 'application/octet-stream') + '\r\n\r\n'
      ),
      f.data,
      Buffer.from('\r\n')
    );
  }
  parts.push(Buffer.from('--' + boundary + '--\r\n'));
  return { body: Buffer.concat(parts), contentType: 'multipart/form-data; boundary=' + boundary };
}

/* ------------------------------------------------------------- journeys */

async function journeyAuth() {
  const J = 'auth';
  const d = await loginStaff(CONFIG.doctorUser, CONFIG.doctorPass);
  check(J, 'doctor login', !!d.token, msg(d.res));
  const a = await loginStaff(CONFIG.adminUser, CONFIG.adminPass);
  check(J, 'admin login', !!a.token, msg(a.res));
  const p = await loginPatient(CONFIG.patientUser, CONFIG.patientPass);
  check(J, 'patient login', !!p.token, msg(p.res));

  const bad = await loginStaff(CONFIG.doctorUser, 'definitely-not-the-password');
  check(J, 'wrong password is refused', !bad.token, msg(bad.res));

  // Token refresh, both ways in.
  const r1 = await request({ method: 'POST', path: '/api/auth/refresh', token: d.token, body: {} });
  const newRefresh = r1.json && r1.json.data && r1.json.data.refreshToken;
  check(J, 'refresh via bearer', ok(r1) && !!newRefresh, msg(r1));
  if (newRefresh) {
    const r2 = await request({ method: 'POST', path: '/api/auth/refresh', body: { refreshToken: newRefresh } });
    check(J, 'refresh via refreshToken', ok(r2) && !!(r2.json.data && r2.json.data.token), msg(r2));
  }
  const sess = await request({ path: '/api/auth/session', token: d.token });
  check(J, 'session reports identity', ok(sess) && sess.json.data.UserName === CONFIG.doctorUser, msg(sess));

  ctx.doctor = d.token;
  ctx.admin = a.token;
  ctx.patient = p.token;
  ctx.doctorUserId = d.user && d.user.Id;
}

async function journeyCreateUser() {
  const J = 'create-user';
  const stamp = RUN_ID;

  // Path A — POST /api/User/Save. Suspected to store the password unhashed.
  const nameA = 'zztest_a_' + stamp;
  const passA = 'TestPass123!';
  const a = await request({
    method: 'POST',
    path: '/api/User/Save',
    token: ctx.admin,
    body: { Data: JSON.stringify({ UserName: nameA, Password: passA, RoleId: 2, LastName: TAG, FirstName: 'A', Email: nameA + '@example.com' }) },
  });
  const createdA = a.status === 200 && !!(a.json && (a.json.Id || a.json.id || a.json.UserName));
  check(J, 'User/Save creates a user', createdA, msg(a).slice(0, 80));
  if (createdA) {
    const stored = a.json.Password || '';
    // bcrypt hashes start $2a$/$2b$ and are 60 chars.
    const hashed = /^\$2[aby]\$/.test(stored) && stored.length === 60;
    check(
      J,
      'User/Save HASHES the password',
      hashed,
      hashed ? 'bcrypt' : 'stored as ' + (stored === passA ? 'PLAINTEXT — the password we sent, verbatim' : 'non-bcrypt value len ' + stored.length)
    );
    ctx.userA = { name: nameA, id: a.json.Id };
  }

  // Path B — DoctorsProfile via the generic CRUD, which routes through
  // ensureUserForDoctor and is documented to hash.
  const nameB = 'zztest_b_' + stamp;
  const b = await request({
    method: 'POST',
    path: '/api/BaseObject/create',
    token: ctx.admin,
    body: {
      ObjectName: 'DoctorsProfile',
      Data: JSON.stringify({ UserName: nameB, Password: 'TestPass123!', lastname: TAG, firstname: 'B', email: nameB + '@example.com', RoleId: 2, OrganizationId: 5 }),
    },
  });
  check(J, 'BaseObject/create DoctorsProfile', ok(b), msg(b));
  const docId = b.json && b.json.Data && b.json.Data.DataId;
  ctx.userB = { name: nameB, doctorsProfileId: docId };

  // Read it back — the only proof it persisted.
  if (docId) {
    const read = await request({
      method: 'POST',
      path: '/api/BaseObject/getDetail',
      token: ctx.admin,
      body: { ObjectName: 'DoctorsProfile', SearchField: [{ Field: 'id_data', Value: docId, Op: 'Equals' }] },
    });
    const found = ok(read) && read.json.Data && String(read.json.Data.lastname || '') === TAG;
    check(J, 'created doctor reads back', found, found ? 'id_data ' + docId : msg(read));
  }

  // And can the new account actually log in? That is what "created" must mean.
  const login = await loginStaff(nameB, 'TestPass123!');
  check(J, 'new account can log in', !!login.token, login.token ? '' : msg(login.res));
}

async function journeyPassword() {
  const J = 'password';
  // Complexity rule on the staff endpoint.
  const weak = await request({
    method: 'POST',
    path: '/api/User/ChangePassword',
    token: ctx.doctor,
    body: { Password: CONFIG.doctorPass, NewPassword: 'abc' },
  });
  check(J, 'staff: weak password refused', !ok(weak), msg(weak));

  const wrongOld = await request({
    method: 'POST',
    path: '/api/User/ChangePassword',
    token: ctx.doctor,
    body: { Password: 'not-the-old-password', NewPassword: 'Str0ng!Pass1' },
  });
  check(J, 'staff: wrong old password refused', !ok(wrongOld), msg(wrongOld));

  // Real change, then log in with it, then change back.
  const next = 'Zz' + RUN_ID + '!a';
  const chg = await request({
    method: 'POST',
    path: '/api/User/ChangePassword',
    token: ctx.doctor,
    body: { Password: CONFIG.doctorPass, NewPassword: next },
  });
  check(J, 'staff: password changes', ok(chg), msg(chg));
  if (ok(chg)) {
    const relog = await loginStaff(CONFIG.doctorUser, next);
    check(J, 'staff: new password works', !!relog.token, relog.token ? '' : msg(relog.res));
    const back = await request({
      method: 'POST',
      path: '/api/User/ChangePassword',
      token: relog.token || ctx.doctor,
      body: { Password: next, NewPassword: CONFIG.doctorPass },
    });
    // If the restore fails the account is left on a password nobody has written
    // down. Say so loudly rather than burying it in a pass/fail column. Note the
    // recorded password must itself satisfy the complexity rule, or the restore
    // can never succeed — which is exactly how this bit us the first time.
    check(
      J,
      'staff: password restored',
      ok(back),
      ok(back) ? '' : 'ACCOUNT LEFT ON A TEMPORARY PASSWORD: ' + msg(back)
    );
  }

  // The patient endpoint is suspected to enforce no complexity at all.
  const pweak = await request({
    method: 'POST',
    path: '/api/PatientUser/ChangePassword',
    token: ctx.patient,
    body: { Password: CONFIG.patientPass, NewPassword: 'abc' },
  });
  const accepted = ok(pweak);
  check(J, 'patient: weak password REFUSED', !accepted, accepted ? 'ACCEPTED "abc" — no complexity rule on the patient path' : msg(pweak));
  if (accepted) {
    // Put it back immediately; a 3-character password must not be left live.
    const restore = await request({
      method: 'POST',
      path: '/api/PatientUser/ChangePassword',
      token: ctx.patient,
      body: { Password: 'abc', NewPassword: CONFIG.patientPass },
    });
    check(J, 'patient: password restored after weak-password probe', ok(restore), msg(restore));
  }
}

async function journeyVisit() {
  const J = 'new-visit';
  const PatientId = 1124;

  const form = await request({ method: 'POST', path: '/api/Visit/GetCustomFormData', token: ctx.doctor, body: { PatientId } });
  check(J, 'examination form config loads', ok(form), msg(form));

  const save = await request({
    method: 'POST',
    path: '/api/Visit/CustomSave',
    token: ctx.doctor,
    body: {
      PatientId,
      Id: null,
      Data: JSON.stringify({ visit_date: new Date().toISOString().slice(0, 10), PatientId, chief_complaint: TAG + ' acceptance test', Notes: TAG }),
    },
  });
  const visitId = save.json && save.json.Data && (save.json.Data.DataId || save.json.Data.Id);
  check(J, 'examination saves', ok(save) && !!visitId, ok(save) ? 'id ' + visitId : msg(save));
  ctx.visitId = visitId;

  if (visitId) {
    const list = await request({
      method: 'POST',
      path: '/api/Visit/GetVisitsByPatient',
      token: ctx.doctor,
      body: { ObjectName: 'Visit', PageSize: 20, PageNumber: 0, SearchField: [{ Field: 'PatientId', Value: PatientId, Op: 'Equals' }] },
    });
    const found = ok(list) && (list.json.Data || []).some((v) => String(v.id_data) === String(visitId));
    check(J, 'examination appears in the patient list', found, found ? '' : msg(list));

    // Saving again with the same Id must UPDATE, not create a second row —
    // the duplicate-on-edit bug tracker row №97 was raised for.
    const again = await request({
      method: 'POST',
      path: '/api/Visit/CustomSave',
      token: ctx.doctor,
      body: { PatientId, Id: visitId, Data: JSON.stringify({ visit_date: new Date().toISOString().slice(0, 10), PatientId, chief_complaint: TAG + ' edited' }) },
    });
    const sameId = again.json && again.json.Data && String(again.json.Data.DataId || again.json.Data.Id) === String(visitId);
    check(J, 're-save updates rather than duplicating', ok(again) && sameId, ok(again) ? 'returned id ' + (again.json.Data.DataId || again.json.Data.Id) : msg(again));

    const pdf = await request({ method: 'POST', path: '/api/Visit/PrintReport', token: ctx.doctor, body: { Id: visitId, Language: 'mn' }, timeout: 120000 });
    const isPdf = pdf.status === 200 && pdf.bytes > 1000 && !String(pdf.contentType).includes('json') && !String(pdf.text).startsWith('{');
    check(J, 'examination prints a PDF', isPdf, isPdf ? pdf.contentType + ' ' + pdf.bytes + 'b' : (pdf.text || '').slice(0, 100));
  }
}

async function journeyTenderForm() {
  const J = 'tender-form';
  const FormCode = '1.1';
  const PatRegNo = 'ZZ' + RUN_ID.slice(-8);

  const cfg = await request({ method: 'POST', path: '/api/TenderForm/GetConfig', token: ctx.doctor, body: { FormCode } });
  check(J, 'form config loads', ok(cfg), msg(cfg));
  const fields = cfg.json && cfg.json.Data && cfg.json.Data.Fields;
  const flat = Array.isArray(fields) ? fields.flat() : [];
  check(J, 'form has fields', flat.length > 0, flat.length + ' fields');

  // Use real field codes from the config, since unknown keys are dropped.
  const answers = {};
  for (const f of flat.filter((x) => x && x.Name && /Text|Number|Date/i.test(x.Type || '')).slice(0, 3)) {
    answers[f.Name] = f.Type === 'Number' ? 7 : f.Type === 'Date' ? new Date().toISOString().slice(0, 10) : TAG;
  }

  const save = await request({
    method: 'POST',
    path: '/api/TenderForm/CustomSave',
    token: ctx.doctor,
    body: { FormCode, PatRegNo, Id: null, FormDate: new Date().toISOString().slice(0, 10), Data: JSON.stringify(answers) },
  });
  const formId = save.json && save.json.Data && (save.json.Data.DataId || save.json.Data.Id);
  check(J, 'form instance saves', ok(save) && !!formId, ok(save) ? 'id ' + formId : msg(save));
  ctx.tenderFormId = formId;

  if (formId) {
    const read = await request({ method: 'POST', path: '/api/TenderForm/GetData', token: ctx.doctor, body: { Id: formId } });
    const keys = Object.keys(answers);
    const persisted = ok(read) && keys.length > 0 && keys.every((k) => String(read.json.Data[k] ?? '') === String(answers[k]));
    check(J, 'answers persist and read back', persisted, persisted ? keys.join(',') : msg(read));

    const list = await request({ method: 'POST', path: '/api/TenderForm/GetList', token: ctx.doctor, body: { FormCode, PatRegNo } });
    check(J, 'form appears in its list', ok(list) && (list.json.Data || []).length > 0, msg(list));

    const html = await request({ method: 'POST', path: '/api/TenderForm/PrintHtml', token: ctx.doctor, body: { FormCode, Id: formId } });
    check(J, 'form renders print HTML', ok(html) && !!(html.json.Data && html.json.Data.Html), msg(html));

    const pdf = await request({ method: 'POST', path: '/api/TenderForm/PrintReport', token: ctx.doctor, body: { FormCode, Id: formId }, timeout: 120000 });
    const isPdf = pdf.status === 200 && pdf.bytes > 1000 && !String(pdf.text).startsWith('{');
    check(J, 'form prints a PDF', isPdf, isPdf ? pdf.contentType + ' ' + pdf.bytes + 'b' : (pdf.text || '').slice(0, 90));

    const conf = await request({ method: 'POST', path: '/api/TenderForm/Confirm', token: ctx.doctor, body: { Id: formId } });
    check(J, 'form confirms (locks)', ok(conf), msg(conf));

    // A confirmed record must not be deletable.
    const del = await request({ method: 'POST', path: '/api/TenderForm/Delete', token: ctx.doctor, body: { Id: formId } });
    check(J, 'confirmed form REFUSES deletion', !ok(del), ok(del) ? 'DELETED a confirmed record' : msg(del));
  }
}

async function journeyFiles() {
  const J = 'files';
  const content = Buffer.from('MnCardio acceptance test ' + TAG + '\n' + 'x'.repeat(400));
  const linked = { LinkedObjectName: 'DoctorsProfile', LinkedObjectId: ctx.userB && ctx.userB.doctorsProfileId ? ctx.userB.doctorsProfileId : 2079, FieldName: 'Files' };

  const mp = multipart(
    { LinkedObjectInfo: JSON.stringify(linked), File0Info: JSON.stringify({ Name: TAG + '.txt' }) },
    [{ field: 'File0', filename: TAG + '.txt', data: content, type: 'text/plain' }]
  );
  const up = await request({
    method: 'POST',
    path: '/api/BaseObject/uploadFile',
    token: ctx.doctor,
    raw: mp.body,
    headers: { 'content-type': mp.contentType },
    timeout: 90000,
  });
  check(J, 'file uploads', ok(up), msg(up));

  // Find it back through the record it was attached to.
  const detail = await request({
    method: 'POST',
    path: '/api/BaseObject/getDetailInfo',
    token: ctx.doctor,
    body: { ObjectName: 'DoctorsProfile', SearchField: [{ Field: 'id_data', Value: linked.LinkedObjectId, Op: 'Equals' }] },
  });
  // Each entry is a wrapper: { Type, FileInfo: {...} }. downloadFile wants the
  // INNER object — passing the wrapper sends an empty FileInfo and the server
  // answers "File not found", which looks exactly like a broken download.
  let fileInfo = null;
  const files = detail.json && detail.json.Data && detail.json.Data.Files;
  if (Array.isArray(files) && files.length) {
    const entries = files.map((f) => (f && f.FileInfo ? f.FileInfo : f));
    fileInfo = entries.find((f) => String(f.original_name || '').includes(TAG)) || entries[entries.length - 1];
  }
  check(J, 'uploaded file is attached to the record', !!(fileInfo && fileInfo.generated_name), fileInfo ? String(fileInfo.original_name) : 'not found on the record');

  if (fileInfo) {
    ctx.fileId = fileInfo.id_data;
    const dl = await request({ method: 'POST', path: '/api/BaseObject/downloadFile', token: ctx.doctor, body: { FileInfo: fileInfo }, timeout: 60000 });
    const same = dl.status === 200 && dl.buffer && dl.buffer.equals(content);
    check(J, 'download returns the same bytes', same, same ? dl.bytes + 'b identical' : 'got ' + dl.bytes + 'b, ' + dl.contentType);

    // Ownership: can a different account fetch it just by knowing the name?
    const other = await request({ method: 'POST', path: '/api/BaseObject/downloadFile', token: ctx.patient, body: { FileInfo: fileInfo }, timeout: 60000 });
    const leaked = other.status === 200 && other.bytes === content.length;
    check(J, 'another account CANNOT download it', !leaked, leaked ? 'a patient token downloaded a doctor-attached file' : 'refused (' + other.status + ')');
  }

  // Extension allowlist.
  const bad = multipart(
    { LinkedObjectInfo: JSON.stringify(linked), File0Info: JSON.stringify({ Name: TAG + '.exe' }) },
    [{ field: 'File0', filename: TAG + '.exe', data: Buffer.from('MZ'), type: 'application/octet-stream' }]
  );
  const badUp = await request({ method: 'POST', path: '/api/BaseObject/uploadFile', token: ctx.doctor, raw: bad.body, headers: { 'content-type': bad.contentType }, timeout: 60000 });

  // The allowlist does block the file — verified separately: nothing lands on
  // the record. What is wrong is the RESPONSE. It says "Successfully saved",
  // so a user is told their attachment was stored when it was silently
  // discarded. Both halves are asserted, because they are different defects.
  const after = await request({
    method: 'POST',
    path: '/api/BaseObject/getDetailInfo',
    token: ctx.doctor,
    body: { ObjectName: 'DoctorsProfile', SearchField: [{ Field: 'id_data', Value: linked.LinkedObjectId, Op: 'Equals' }] },
  });
  const names = ((((after.json || {}).Data || {}).Files) || []).map((f) =>
    String((((f && f.FileInfo) || f) || {}).original_name || '')
  );
  check(J, '.exe does not land on the record', !names.some((n) => n.toLowerCase().includes('exe')), names.join(',') || 'no files');
  check(
    J,
    'rejected upload does NOT report success',
    !ok(badUp),
    ok(badUp) ? 'reported "Successfully saved" for a file it discarded' : msg(badUp)
  );
}

async function journeyGenericCrud() {
  const J = 'generic-crud';
  const cfg = await request({ method: 'POST', path: '/api/BaseObject/getData', token: ctx.doctor, body: { ObjectName: 'Visit' } });
  check(J, 'field config loads', ok(cfg) && !!(cfg.json.Data && cfg.json.Data.Fields), msg(cfg));

  const list = await request({ method: 'POST', path: '/api/BaseObject/', token: ctx.doctor, body: { ObjectName: 'Organization', PageSize: 5, PageNumber: 0 } });
  check(J, 'paged list works', ok(list) && (list.json.Data || []).length > 0, 'total ' + (list.json && list.json.Option && list.json.Option.Total));

  const xls = await request({ method: 'POST', path: '/api/BaseObject/ExportExcel', token: ctx.doctor, body: { ObjectName: 'Organization', PageSize: 5, PageNumber: 0 }, timeout: 120000 });
  const isXlsx = xls.status === 200 && String(xls.contentType).includes('spreadsheet') && xls.bytes > 1000;
  check(J, 'Excel export returns a workbook', isXlsx, isXlsx ? xls.bytes + 'b' : (xls.text || '').slice(0, 80));

  // destroy with a filter that matches nothing: it must not claim success.
  const del = await request({ method: 'POST', path: '/api/BaseObject/destroy', token: ctx.admin, body: { ObjectName: 'Visit', DeleteOption: { id_data: -999999 } } });
  const claimed = ok(del);
  check(J, 'destroy on a non-existent row does NOT claim success', !claimed, claimed ? 'reported success for a row that does not exist' : msg(del));
}

async function journeyUnauthenticatedSurfaces() {
  const J = 'security';
  // /api/base/* is mounted with no auth at all.
  const base = await request({ path: '/api/base/OptionTypes?limit=1' });
  check(J, '/api/base requires authentication', base.status === 401 || base.status === 403, 'HTTP ' + base.status + ' without a token');

  const rep = await request({ path: '/api/report/getCVDMonitoringSuom?Limit=1' });
  check(J, '/api/report requires authentication', rep.status === 401 || rep.status === 403, 'HTTP ' + rep.status + ' without a token');

  // The public Test router.
  const t = await request({ path: '/api/Test/print' });
  check(J, '/api/Test is not publicly reachable', t.status === 401 || t.status === 403 || t.status === 404, 'HTTP ' + t.status + ' without a token');

  // A patient token must not reach staff data.
  const cross = await request({ method: 'POST', path: '/api/Visit/GetVisitsByPatient', token: ctx.patient, body: { ObjectName: 'Visit', PageSize: 1, PageNumber: 0 } });
  check(J, 'patient token cannot read the visit register', !ok(cross), msg(cross));

  const docAsPatient = await request({ path: '/api/patient/me', token: ctx.doctor });
  check(J, 'doctor token cannot use the patient surface', !ok(docAsPatient), 'HTTP ' + docAsPatient.status);
}

async function run() {
  ctx = {};
  results.length = 0;
  await journeyAuth();
  await journeyCreateUser();
  await journeyPassword();
  await journeyVisit();
  await journeyTenderForm();
  await journeyFiles();
  await journeyGenericCrud();
  await journeyUnauthenticatedSurfaces();
  return { results, ctx };
}

module.exports = { run };

if (require.main === module) {
  run()
    .then(({ results: rs }) => {
      const failed = rs.filter((r) => !r.pass);
      console.log('\n=== journeys: ' + (rs.length - failed.length) + '/' + rs.length + ' passed ===');
      if (failed.length) {
        console.log('\n--- failures ---');
        for (const f of failed) console.log('  ' + (f.journey + ' / ' + f.step).padEnd(58) + f.detail);
      }
    })
    .catch((e) => {
      console.error('JOURNEYS FAILED: ' + e.message + '\n' + e.stack);
      process.exit(1);
    });
}
