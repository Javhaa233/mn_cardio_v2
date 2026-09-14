const { Models, Op, Sequelize, sequelize } = require('../../config/DB');
const ObjectHelper = require('../../helper/ObjectHelper');
const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const AccessAudit = require('../../helper/AccessAudit');
const CareTeam = require('../../helper/CareTeam');
const DicoLabels = require('../../helper/DicoLabels');
const RemoteVisitFlow = require('../../helper/RemoteVisitFlow');
const MediaRef = require('../../helper/MediaRef');
const NotificationHelper = require('../../helper/NotificationHelper');
const RiskInputs = require('../../helper/RiskInputs');
const AttachmentIntake = require('../../helper/AttachmentIntake');
const Diagnostics = require('../../helper/Diagnostics');
const Confidentiality = require('../../helper/Confidentiality');
const Export = require('../../helper/Export');
const Provenance = require('../../helper/Provenance');
const PrintHelper = require('../../helper/PrintHelper');
const DoctorExamReportHelper = require('../../helper/DoctorExamReportHelper');
const Consent = require('../../helper/Consent');
const EMDServiceHelper = require('../../helper/EMDServiceHelper');
const Permissions = require('../../helper/Permissions');
const PushHelper = require('../../helper/PushHelper');

/**
 * Handlers for /api/doctor/*.
 *
 * Every one reads its doctor from req.Doctor, which requireDoctor derives from
 * the verified token. None accepts a doctor, user or organisation identifier
 * from the caller.
 *
 * That is not a stylistic choice. The legacy PatientMonitoringController takes
 * UserId and DoctorId from the request BODY, so a caller can add a patient to
 * another doctor's monitoring list, or clear one, by editing two numbers. The
 * equivalents here (addMonitoring / removeMonitoring) take both from the token
 * and ignore whatever the body says.
 *
 * Envelope is the lowercase { success, message, data } used by api/**, with a
 * stable `code` on failures. The legacy controllers/** layer uses PascalCase
 * and returns HTTP 200 on error; the two must not be mixed (CLAUDE.md §5).
 */

const ok = (res, data, extra) =>
  res.json(Object.assign({ success: true, message: '', data }, extra || {}));

const fail = (res, code, message, status) =>
  res.status(status || 400).json({ success: false, code, message, data: null });

const serverError = (res, ex, where) => {
  console.error('[api/doctor] ' + where + ':', ex);
  return res.status(500).json({
    success: false,
    code: 'SERVER_ERROR',
    message: 'Сервер дээр алдаа гарлаа',
    data: null,
  });
};

const readPaging = (req) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
  return { limit, offset };
};

const readDateRange = (req, field) => {
  const { from, to } = req.query;
  if (!from && !to) return {};
  const range = {};
  if (from) range[Op.gte] = from;
  if (to) range[Op.lte] = to;
  return { [field]: range };
};

const toInt = (v) => {
  const n = parseInt(v, 10);
  return Number.isInteger(n) && n > 0 ? n : null;
};

/**
 * The doctor's organisation plus its children, the same set
 * BaseControllerHelper scopes list queries to. Returns null for an admin, who
 * is scoped by role rather than by organisation - callers must treat null as
 * "do not filter", never as "no organisations".
 */
async function OrganizationIds(Doctor) {
  if (Doctor.IsAdmin) return null;
  const ids = [Doctor.OrganizationId];
  const children = await Models.Organization.findAll({
    where: { ParentOrganizationId: Doctor.OrganizationId },
    attributes: ['Id'],
    raw: true,
  });
  children.forEach((o) => ids.push(o.Id));
  return ids;
}

/** Patient columns a doctor list or card needs. One definition, used everywhere. */
const PATIENT_ATTRS = [
  'id_data',
  'p_registration',
  'p_lastname',
  'p_firstname',
  'p_birthday',
  'p_age',
  'p_telephone',
];

const PATIENT_INCLUDE = {
  model: Models.Patient,
  as: 'Patient',
  attributes: PATIENT_ATTRS,
  required: false,
};

/* ------------------------------------------------------------------ profile */

exports.getMe = async (req, res) => {
  try {
    const D = req.Doctor;
    let organization = null;
    if (D.OrganizationId) {
      organization = await Models.Organization.findByPk(D.OrganizationId, {
        attributes: ['Id', 'Name', 'level', 'addr_prov_city', 'addr_soum_dist'],
        raw: true,
      });
    }

    let profile = null;
    if (D.DoctorId) {
      profile = await Models.DoctorsProfile.findByPk(D.DoctorId, {
        attributes: [
          'id_data',
          'lastname',
          'firstname',
          'FullName',
          'email',
          'OrganizationId',
          'ProvCityName',
          'SoumDistName',
        ],
        raw: true,
      });
    }

    /*
     * §1.2 - what this user is permitted to do, so the app can hide a menu
     * item rather than let somebody tap it and be refused.
     *
     * AN EMPTY ARRAY MEANS "NOTHING CONFIGURED", NOT "NOTHING PERMITTED", and
     * the client must render it as show-everything. RoleToPermission is empty
     * today, so empty is what every caller gets; treating that as a denial
     * would make seeding the matrix a prerequisite for the app working at all.
     */
    const permissions = await Permissions.Of(D.UserId);

    return ok(res, {
      UserId: D.UserId,
      DoctorId: D.DoctorId,
      RoleId: D.RoleId,
      IsAdmin: D.IsAdmin,
      FullName: D.FullName,
      profile,
      organization,
      permissions,
      // So the client can tell "the feature is off" from "you have no
      // permissions", which look identical from the array alone.
      permissionMode: require('../../helper/FeatureFlags').Permissions,
    });
  } catch (ex) {
    return serverError(res, ex, 'getMe');
  }
};

/**
 * Ceiling on the patient-id list an ?icd10= search resolves before it is sent
 * back to SQL Server as an IN clause. See searchPatients for why it exists and
 * why exceeding it is reported rather than hidden.
 */
const ICD10_PATIENT_CAP = 5000;

/**
 * Ceiling on an export. Over this the request is REFUSED, not truncated: a
 * spreadsheet that silently stops looks complete, and somebody will report from
 * it. The tender's own wording for this endpoint names 10,000.
 */
const EXPORT_MAX_ROWS = 10000;

/** Autocomplete: never fewer than this many characters, never more than this many rows. */
const ICD10_MIN_CHARS = 2;
const ICD10_MAX_ROWS = 20;

/**
 * An ICD-10 filter over Visit.
 *
 * READ THIS BEFORE CHANGING IT - the obvious implementation returns nothing.
 *
 * `Visit.icd10` looks like the column to filter on and IS NOT. Measured on
 * MnCardio_test 2026-09-14 against all 450,604 rows: it is NULL on 73,535 and
 * an empty string on every single one of the rest. Nothing has ever written it.
 *
 * The code is inside `main_diagnosis`, which stores the vwICD10 DISPLAY LABEL
 * verbatim - `*I21.4 Acute subendocardial myocardial infarction`. Leading
 * asterisk, code, space, English term. So an ICD filter is a prefix match on
 * that string, and `icd10` is kept in the OR only so the filter still works if
 * the column is ever backfilled or differs on production.
 *
 * TWO FORMS, deliberately:
 *   `I21`   exact  -> `*I21 ...` only, not I21.0. A register count is taken on
 *                     an exact code and silently widening it inflates the number.
 *   `I21%`  prefix -> I21, I21.0, I21.9 and the rest of the block, which is
 *                     what a clinical search almost always means.
 *
 * `%` and `_` in the value are NOT escaped away - the prefix form is expressed
 * with one. The value is bound as a parameter, so a wildcard stays a wildcard
 * and can never become a statement.
 */
const icd10Where = (raw) => {
  const v = String(raw || '').trim();
  if (!v) return null;

  const isPrefix = v.indexOf('%') !== -1;

  return {
    [Op.or]: [
      // The label form, which is where the code actually is.
      { main_diagnosis: { [Op.like]: isPrefix ? '*' + v : '*' + v + ' %' } },
      // `*I21` with no trailing term, in case a label was stored bare.
      ...(isPrefix ? [] : [{ main_diagnosis: '*' + v }]),
      // The column the schema suggests. Empty everywhere today; harmless.
      { icd10: isPrefix ? { [Op.like]: v } : v },
    ],
  };
};

/**
 * The free-text diagnosis filter, ?diagnosis=.
 *
 * Searches the English label as well as the Mongolian, because
 * `main_diagnosis_mn` is NULL on 432,364 of 450,604 rows (96%) - it is only
 * populated on recent examinations. Filtering the Mongolian alone, as the
 * endpoint was specified, would hide almost the entire archive.
 */
const diagnosisWhere = (raw) => {
  const v = String(raw || '').trim();
  if (!v) return null;
  const like = { [Op.like]: '%' + v + '%' };
  return { [Op.or]: [{ main_diagnosis_mn: like }, { main_diagnosis: like }] };
};

/**
 * Users.Id of every doctor whose name matches, for ?doctor=.
 *
 * Resolved as its own query and applied with Op.in rather than joined, because
 * `Visit.id` is a creating USER id with no association declared to
 * DoctorsProfile - and `DoctorsProfile.id` is the Users.Id while `id_data` is
 * the profile's own key, a distinction that joins the wrong doctor silently
 * when it is got wrong (see the header of helper/CareTeam.js).
 *
 * Returns [] for a name nobody has, which correctly yields an empty list rather
 * than an unfiltered one.
 */
async function DoctorUserIdsByName(name) {
  const v = String(name || '').trim();
  if (!v) return null;

  const rows = await Models.DoctorsProfile.findAll({
    where: {
      id: { [Op.ne]: null },
      [Op.or]: [
        { lastname: { [Op.like]: '%' + v + '%' } },
        { firstname: { [Op.like]: '%' + v + '%' } },
      ],
    },
    attributes: ['id'],
    raw: true,
  });

  return rows.map((r) => r.id);
}

/* ------------------------------------------- 28 Миний үзлэгүүд (my exams) */

/**
 * ?scope=mine (default) lists the examinations this user recorded;
 * ?scope=organization lists the whole organisation's, including children.
 *
 * `Visit.id` is the creating USER, not a foreign key to DoctorsProfile - the
 * same column BaseControllerHelper calls "the creating USER" where it scopes
 * the АМ-1Б register. Filtering on it is what makes "mine" mean mine.
 */
/**
 * The WHERE clause behind /visits, shared with /visits/export.
 *
 * EXTRACTED SO THE EXPORT CANNOT SELECT A DIFFERENT SET FROM THE SCREEN IT WAS
 * LAUNCHED FROM. That is the worst kind of reporting bug - nothing errors and
 * the numbers are simply wrong - and it is what happens the moment these
 * filters are written out twice.
 *
 * Returns { where, include, scope } ready for findAndCountAll or findAll.
 */
async function BuildVisitQuery(req, D) {
  const scope = req.query.scope === 'organization' ? 'organization' : 'mine';

  const where = Object.assign({}, readDateRange(req, 'visit_date'));

  if (scope === 'mine') {
    where.id = D.UserId;
  } else {
    const orgIds = await OrganizationIds(D);
    if (orgIds) where.OrganizationId = { [Op.in]: orgIds };
  }

  /*
   * Дурын талбараар хайх (tender §1.3).
   *
   * Every filter is pushed onto ONE Op.and list rather than assigned as its own
   * key, because icd10Where, diagnosisWhere and `search` each produce an Op.or -
   * and a second `where[Op.or] = ...` would overwrite the first silently,
   * turning "I21 AND this doctor" into "this doctor" with no error. AND-ing
   * means each filter can only narrow.
   */
  const and = [];

  const icd10 = icd10Where(req.query.icd10);
  if (icd10) and.push(icd10);

  const diagnosis = diagnosisWhere(req.query.diagnosis);
  if (diagnosis) and.push(diagnosis);

  const doctorName = String(req.query.doctor || '').trim();
  if (doctorName) {
    let userIds = await DoctorUserIdsByName(doctorName);
    // Under scope=mine, `where.id` is already this user. Intersecting rather
    // than assigning means ?doctor= can only ever NARROW the result - writing
    // where.id outright would drop the "mine" restriction and hand back other
    // doctors' examinations under a scope that promises not to.
    if (scope === 'mine') userIds = userIds.filter((u) => String(u) === String(D.UserId));
    // Op.in [] is the honest answer for a name nobody has - an empty list, not
    // every examination in the organisation.
    where.id = { [Op.in]: userIds };
  }

  const search = (req.query.search || '').trim();
  const include = [PATIENT_INCLUDE];
  if (search) {
    // `search` is the one free-text box in the app, so it has to reach the
    // diagnosis columns as well as the patient's name - a doctor typing "I21"
    // into it expects examinations back.
    //
    // The patient half uses $-qualified column references and the include stays
    // required:false, because an OR that spans parent and included table cannot
    // live inside the include's own where: required:true there would AND the
    // join, and a visit matching on the diagnosis alone would vanish.
    // subQuery:false at the call site is what makes those references resolvable
    // under LIMIT.
    const like = { [Op.like]: '%' + search + '%' };
    and.push({
      [Op.or]: [
        // main_diagnosis carries both the code and the English term, so one LIKE
        // over it answers "I21" and "infarction" alike.
        { main_diagnosis: like },
        { main_diagnosis_mn: like },
        { '$Patient.p_registration$': like },
        { '$Patient.p_lastname$': like },
        { '$Patient.p_firstname$': like },
      ],
    });
  }

  if (and.length) where[Op.and] = and;

  return { where, include, scope };
}

exports.listVisits = async (req, res) => {
  try {
    const D = req.Doctor;
    const { limit, offset } = readPaging(req);
    const { where, include, scope } = await BuildVisitQuery(req, D);

    const { rows, count } = await Models.Visit.findAndCountAll({
      where,
      include,
      subQuery: false,
      attributes: [
        'id_data',
        'visit_date',
        'chief_complaint',
        'main_diagnosis',
        'main_diagnosis_mn',
        'icd10',
        'exam_type_icd',
        'cause_icd10',
        'procedure_icd9',
        'has_complication',
        'PatientId',
        'PatRegNo',
        'OrganizationId',
      ],
      order: [
        ['visit_date', 'DESC'],
        ['id_data', 'DESC'],
      ],
      limit,
      offset,
      distinct: true,
    });

    return ok(res, JSON.parse(JSON.stringify(rows)), {
      total: count,
      limit,
      offset,
      scope,
    });
  } catch (ex) {
    return serverError(res, ex, 'listVisits');
  }
};

/**
 * One examination in full.
 *
 * Scoped the same way the list is: an id belonging to another organisation
 * returns 404, not the record. Without that check this endpoint would be an
 * enumeration hole over ~450,000 examinations - which is exactly the gap
 * /Advice/GetTicket has today (READINESS.md §2.6).
 */
exports.getVisit = async (req, res) => {
  try {
    const D = req.Doctor;
    const id = toInt(req.params.id);
    if (!id) return fail(res, 'INVALID_ID', 'Буруу дугаар');

    const where = { id_data: id };
    if (!D.IsAdmin) {
      const orgIds = await OrganizationIds(D);
      where[Op.or] = [{ id: D.UserId }, { OrganizationId: { [Op.in]: orgIds } }];
    }

    const visit = await Models.Visit.findOne({ where, include: [PATIENT_INCLUDE] });
    if (!visit) return fail(res, 'NOT_FOUND', 'Үзлэг олдсонгүй', 404);

    const Row = JSON.parse(JSON.stringify(visit));

    // Audited AFTER the authorization above, so a refused read is not recorded
    // as an access that happened. Not awaited: the audit is a side record, and
    // the doctor should not wait on it to see the examination.
    AccessAudit.RecordAccess({
      LogedUser: req.LogedUser,
      PatientId: Row.PatientId || (Row.Patient ? Row.Patient.id_data : null),
      ObjectName: 'Visit',
      ObjectId: Row.id_data,
      Action: 'ViewVisit',
    });

    return ok(res, Row);
  } catch (ex) {
    return serverError(res, ex, 'getVisit');
  }
};

/* --------------------------------------- 29 Миний хяналт (my monitoring) */

/**
 * The patients this doctor personally monitors, each with their most recent
 * journal reading so the list is useful without a second call per row.
 *
 * The readings are fetched in ONE query for the whole page rather than per
 * patient - the legacy GetList does a query per row, which is what makes it
 * slow enough to matter on a phone.
 */
exports.listMonitoring = async (req, res) => {
  try {
    const D = req.Doctor;
    const { limit, offset } = readPaging(req);

    const { rows, count } = await Models.PatientMonitoringDoctor.findAndCountAll({
      where: { user_id: D.UserId, is_active: '1' },
      attributes: ['id_data', 'patient_id', 'date_creation'],
      order: [['id_data', 'DESC']],
      limit,
      offset,
      raw: true,
    });

    const patientIds = rows.map((r) => r.patient_id).filter(Boolean);

    let patients = [];
    let readings = [];
    if (patientIds.length) {
      patients = await Models.Patient.findAll({
        where: { id_data: { [Op.in]: patientIds } },
        attributes: PATIENT_ATTRS,
        raw: true,
      });

      readings = await Models.PatientMonitoring.findAll({
        where: { patient_id: { [Op.in]: patientIds } },
        attributes: [
          'id_data',
          'patient_id',
          'date',
          'blood_pressure',
          'blood_pressure2',
          'pulse',
          'weight',
          'inr',
        ],
        order: [
          ['date', 'DESC'],
          ['id_data', 'DESC'],
        ],
        raw: true,
      });
    }

    const patientById = new Map(patients.map((p) => [p.id_data, p]));
    const latestByPatient = new Map();
    for (const r of readings) {
      if (!latestByPatient.has(r.patient_id)) latestByPatient.set(r.patient_id, r);
    }

    const data = rows.map((r) => ({
      id_data: r.id_data,
      since: r.date_creation,
      patient: patientById.get(r.patient_id) || null,
      latestReading: latestByPatient.get(r.patient_id) || null,
    }));

    return ok(res, data, { total: count, limit, offset });
  } catch (ex) {
    return serverError(res, ex, 'listMonitoring');
  }
};

/**
 * Take a patient into personal monitoring.
 *
 * Mirrors PatientMonitoringController.SavePatient - reactivate an existing row
 * rather than creating a duplicate, and write both audit rows - except that the
 * doctor is the caller, taken from the token. The legacy route reads UserId and
 * DoctorId from the body, so it can be pointed at another doctor's list.
 */
exports.addMonitoring = async (req, res) => {
  try {
    const D = req.Doctor;
    const PatientId = toInt(req.body.PatientId);
    if (!PatientId) return fail(res, 'PATIENT_REQUIRED', 'Үйлчлүүлэгч сонгоно уу');

    const patient = await Models.Patient.findByPk(PatientId, {
      attributes: ['id_data'],
      raw: true,
    });
    if (!patient) return fail(res, 'NOT_FOUND', 'Үйлчлүүлэгч олдсонгүй', 404);

    const existing = await Models.PatientMonitoringDoctor.findOne({
      where: { patient_id: PatientId, user_id: D.UserId },
      attributes: ['id_data'],
      raw: true,
    });

    let Id;
    if (existing) {
      Id = existing.id_data;
      await Models.PatientMonitoringDoctor.update(
        { is_active: '1' },
        { where: { id_data: Id } }
      );
    } else {
      Id = await BaseControllerHelper.BaseCreate({
        ObjectName: 'PatientMonitoringDoctor',
        Data: { patient_id: PatientId, user_id: D.UserId, is_active: '1' },
        LogedUser: req.LogedUser,
      });
    }

    await WriteMonitoringAudit(req, PatientId, Id, '1', 'Хувийн хяналтанд авлаа');

    return ok(res, { id_data: Id, PatientId, is_active: '1' });
  } catch (ex) {
    return serverError(res, ex, 'addMonitoring');
  }
};

exports.removeMonitoring = async (req, res) => {
  try {
    const D = req.Doctor;
    const PatientId = toInt(req.params.patientId);
    if (!PatientId) return fail(res, 'INVALID_ID', 'Буруу дугаар');

    const existing = await Models.PatientMonitoringDoctor.findOne({
      where: { patient_id: PatientId, user_id: D.UserId },
      attributes: ['id_data'],
      raw: true,
    });
    if (!existing) return fail(res, 'NOT_FOUND', 'Хяналтад байхгүй байна', 404);

    await Models.PatientMonitoringDoctor.update(
      { is_active: '0' },
      { where: { id_data: existing.id_data } }
    );

    await WriteMonitoringAudit(req, PatientId, existing.id_data, '0', 'Хувийн хяналтаас хаслаа');

    return ok(res, { id_data: existing.id_data, PatientId, is_active: '0' });
  } catch (ex) {
    return serverError(res, ex, 'removeMonitoring');
  }
};

/** Both audit trails the legacy controller writes, kept identical. */
async function WriteMonitoringAudit(req, PatientId, LinkObjectId, IsStart, Notes) {
  const D = req.Doctor;
  const LogedUser = req.LogedUser;
  const Now = ObjectHelper.getDateYMDHMS();

  await BaseControllerHelper.BaseCreate({
    ObjectName: 'PatientMonitoringDoctorHistory',
    Data: {
      PatientId,
      UserId: D.UserId,
      DoctorId: D.DoctorId,
      IsStart,
      Date: Now,
    },
    LogedUser,
  });

  await BaseControllerHelper.BaseCreate({
    ObjectName: 'PatientHistory',
    Data: {
      PatientId,
      UserId: D.UserId,
      DoctorId: D.DoctorId,
      Notes,
      LinkObjectName: 'PatientMonitoringDoctor',
      LinkObjectId,
      LogDate: Now,
    },
    LogedUser,
  });
}

/**
 * A monitored patient's journal, as rows plus the chart series.
 *
 * Refuses a patient this doctor does not monitor. The doctor could reach the
 * same rows through /patients/:id, but this endpoint is the monitoring view and
 * scoping it to the monitoring list is what makes that list mean something.
 */
exports.getMonitoringJournal = async (req, res) => {
  try {
    const D = req.Doctor;
    const PatientId = toInt(req.params.patientId);
    if (!PatientId) return fail(res, 'INVALID_ID', 'Буруу дугаар');

    const monitored = await Models.PatientMonitoringDoctor.findOne({
      where: { patient_id: PatientId, user_id: D.UserId, is_active: '1' },
      attributes: ['id_data'],
      raw: true,
    });
    if (!monitored) return fail(res, 'NOT_MONITORED', 'Таны хяналтад байхгүй байна', 403);

    AccessAudit.RecordAccess({
      LogedUser: req.LogedUser,
      PatientId,
      ObjectName: 'PatientMonitoring',
      Action: 'ViewJournal',
    });

    const where = Object.assign(
      { patient_id: PatientId },
      readDateRange(req, 'date')
    );

    const rows = await Models.PatientMonitoring.findAll({
      where,
      attributes: [
        'id_data',
        'date',
        'time',
        'blood_pressure',
        'blood_pressure2',
        'pulse',
        'weight',
        'inr',
        'comment',
      ],
      order: [['date', 'ASC']],
      limit: 365,
      raw: true,
    });

    return ok(res, {
      rows,
      labels: rows.map((r) => r.date),
      series: {
        blood_pressure: rows.map((r) => r.blood_pressure),
        blood_pressure2: rows.map((r) => r.blood_pressure2),
        pulse: rows.map((r) => r.pulse),
        weight: rows.map((r) => r.weight),
      },
    });
  } catch (ex) {
    return serverError(res, ex, 'getMonitoringJournal');
  }
};

/* ------------------------- 2.3 patient questions, from the doctor's side */

const IsMonitored = (D, PatientId) =>
  Models.PatientMonitoringDoctor.findOne({
    where: { patient_id: PatientId, user_id: D.UserId, is_active: '1' },
    attributes: ['id_data'],
    raw: true,
  });

/**
 * The question thread of a patient this doctor monitors. The web answers the
 * same VisitComments rows through MonitorQuestion.jsx; this is the mobile
 * doctor's way in. Scoped like getMonitoringJournal, and shaped exactly like
 * the patient's own GET /api/patient/questions so the client reuses one model.
 */
exports.listPatientQuestions = async (req, res) => {
  try {
    const D = req.Doctor;
    const PatientId = toInt(req.params.patientId);
    if (!PatientId) return fail(res, 'INVALID_ID', 'Буруу дугаар');
    if (!(await IsMonitored(D, PatientId))) {
      return fail(res, 'NOT_MONITORED', 'Таны хяналтад байхгүй байна', 403);
    }

    const { limit, offset } = readPaging(req);
    const { rows, count } = await Models.VisitComments.findAndCountAll({
      where: { patient_id: PatientId, rec_status: { [Op.ne]: 2 } },
      attributes: ['id_data', 'comment', 'is_doctor', 'date_creation'],
      include: [
        {
          model: Models.DoctorsProfile,
          as: 'DoctorsProfile',
          attributes: ['id_data', 'firstname', 'lastname'],
          required: false,
        },
      ],
      order: [['id_data', 'DESC']],
      limit,
      offset,
      subQuery: false,
    });

    // One query for the whole page, not one per row. Identical shape to the
    // patient's own /api/patient/questions, so the two apps render a thread
    // with the same code.
    const filesByComment = await AttachmentIntake.ListFor({
      LinkedObjectName: 'VisitComments',
      Ids: rows.map((r) => r.id_data),
    });

    const data = rows.map((r) => {
      const row = r.toJSON();
      return {
        id_data: row.id_data,
        comment: row.comment,
        is_doctor: row.is_doctor,
        date_creation: row.date_creation,
        doctor_name: row.DoctorsProfile
          ? [row.DoctorsProfile.lastname, row.DoctorsProfile.firstname].filter(Boolean).join(' ')
          : null,
        files: filesByComment.get(row.id_data) || [],
      };
    });

    return ok(res, data, { total: count, limit, offset });
  } catch (ex) {
    return serverError(res, ex, 'listPatientQuestions');
  }
};

/**
 * A doctor's answer. The same columns the web writes (MonitorQuestion.jsx),
 * with the author taken from the token rather than the body.
 */
exports.replyPatientQuestion = async (req, res) => {
  try {
    const D = req.Doctor;
    const PatientId = toInt(req.params.patientId);
    if (!PatientId) return fail(res, 'INVALID_ID', 'Буруу дугаар');

    /*
     * Accepts JSON or multipart, the same way the patient's createQuestion
     * does - a doctor answering "is this rash a reaction?" needs to be able to
     * send back an image or a document, and the question thread is now the
     * place where both sides carry files.
     */
    let comment;
    let files = [];
    if (String(req.headers['content-type'] || '').indexOf('multipart/form-data') !== -1) {
      const parsed = await AttachmentIntake.Parse(req);
      comment = String(parsed.fields.comment || '').trim();
      files = parsed.files;
    } else {
      comment = String((req.body || {}).comment || '').trim();
    }

    if (!comment && !files.length) {
      return fail(res, 'COMMENT_REQUIRED', 'Хариулт эсвэл хавсралт оруулна уу');
    }

    if (!(await IsMonitored(D, PatientId))) {
      return fail(res, 'NOT_MONITORED', 'Таны хяналтад байхгүй байна', 403);
    }

    // BaseCreate so ModelHelper stamps id, id_group, user_mod, date_modif and
    // rec_status - the legacy table has no defaults for them.
    const Id = await BaseControllerHelper.BaseCreate({
      ObjectName: 'VisitComments',
      Data: { user_id: D.UserId, patient_id: PatientId, comment, is_doctor: 1 },
      LogedUser: req.LogedUser,
    });
    if (!Id) return serverError(res, new Error('BaseCreate returned no id'), 'replyPatientQuestion');

    // After the create, because a File row needs a LinkedObjectId that does not
    // exist until now. A rejection here costs an attachment, never the reply.
    let attached = { saved: [], rejected: [] };
    if (files.length) {
      attached = await AttachmentIntake.Store({
        Files: files,
        LinkedObjectName: 'VisitComments',
        LinkedObjectId: Id,
        FieldName: 'attachment',
        LogedUser: req.LogedUser,
      });
    }

    // Tell the patient. Awaited so a failure is logged against this request,
    // but NotifyPatient never throws and its result is not checked - the reply
    // is saved either way, and a silent phone must not fail a clinical write.
    await NotificationHelper.NotifyPatient({
      PatientId,
      Action: 'ReplyQuestion',
      LinkObjectName: 'VisitComments',
      LinkObjectId: Id,
      NotesMn: 'Эмч таны асуултад хариулсан байна',
      Notes: 'Doctor replied to your question',
      LogedUser: req.LogedUser,
    });

    return ok(res, {
      id_data: Id,
      files: attached.saved,
      ...(attached.rejected.length ? { rejected: attached.rejected } : {}),
    });
  } catch (ex) {
    return serverError(res, ex, 'replyPatientQuestion');
  }
};

/* ------------------------------------- 30 Миний зөвлөгөө (my advice) */

/**
 * Advice this doctor wrote. `Advice.id` is the author, the same column the web
 * feed's "mine" and "drafts" tabs filter on (AdviceController.BuildTabWhere).
 *
 * ?filter=mine (default) published and closed · drafts · all (both).
 *
 * This is deliberately the author's own tickets only, which is what
 * "Миний зөвлөгөө" means. The organisation-wide feed with its visibility rules
 * stays in /api/Advice/GetFeed - reimplementing BuildAdviceScope here would
 * fork a security boundary across two files.
 */
exports.listAdvice = async (req, res) => {
  try {
    const D = req.Doctor;
    const { limit, offset } = readPaging(req);
    const filter = req.query.filter || 'mine';

    const where = { id: D.UserId, rec_status: { [Op.ne]: '2' } };
    if (filter === 'drafts') where.adv_ticket_closed = '3';
    else if (filter !== 'all') where.adv_ticket_closed = { [Op.in]: ['n', 'y'] };

    const { rows, count } = await Models.Advice.findAndCountAll({
      where,
      attributes: [
        'id_data',
        'Body',
        'ticket_type',
        'adv_ticket_closed',
        'level',
        'date_creation',
        'adv_id_patient',
      ],
      order: [['id_data', 'DESC']],
      limit,
      offset,
      raw: true,
    });

    // Reply counts for the page in one query, so the list can show them
    // without a round trip per ticket.
    const ids = rows.map((r) => r.id_data);
    const counts = new Map();
    if (ids.length) {
      const grouped = await Models.AdviceComment.findAll({
        where: { adv_com_id_adv: { [Op.in]: ids }, rec_status: { [Op.ne]: '2' } },
        // literal('COUNT(*)'), not fn('COUNT', '*') — Sequelize renders the
        // latter as COUNT(N'*') on MSSQL, which counts a string constant.
        attributes: [
          'adv_com_id_adv',
          [Models.AdviceComment.sequelize.literal('COUNT(*)'), 'Total'],
        ],
        group: ['adv_com_id_adv'],
        raw: true,
      });
      grouped.forEach((g) => counts.set(g.adv_com_id_adv, Number(g.Total) || 0));
    }

    const data = rows.map((r) =>
      Object.assign({}, r, { commentCount: counts.get(r.id_data) || 0 })
    );

    return ok(res, data, { total: count, limit, offset, filter });
  } catch (ex) {
    return serverError(res, ex, 'listAdvice');
  }
};

/** One of the doctor's own tickets, with its replies. Author-scoped. */
exports.getAdvice = async (req, res) => {
  try {
    const D = req.Doctor;
    const id = toInt(req.params.id);
    if (!id) return fail(res, 'INVALID_ID', 'Буруу дугаар');

    const ticket = await Models.Advice.findOne({
      where: { id_data: id, id: D.UserId, rec_status: { [Op.ne]: '2' } },
      raw: true,
    });
    if (!ticket) return fail(res, 'NOT_FOUND', 'Зөвлөгөө олдсонгүй', 404);

    const comments = await Models.AdviceComment.findAll({
      where: { adv_com_id_adv: id, rec_status: { [Op.ne]: '2' } },
      attributes: ['id_data', 'adv_com_comment', 'date_creation', 'id'],
      order: [['id_data', 'ASC']],
      raw: true,
    });

    return ok(res, { ticket, comments });
  } catch (ex) {
    return serverError(res, ex, 'getAdvice');
  }
};

/* ---------------------------------------- 31 Миний тайлан (my report) */

/**
 * Counts for the doctor's own report screen over an optional date window.
 *
 * Deliberately counts rather than rows: the tender's reporting deliverable
 * (tracker rows 59-63, approved forms, XLS/TXT export, provenance marking) is a
 * separate piece of work, and the existing Excel and PDF paths already produce
 * those documents. This is the phone summary, not a replacement for them.
 */
exports.reportSummary = async (req, res) => {
  try {
    const D = req.Doctor;
    const window = readDateRange(req, 'visit_date');
    const orgIds = await OrganizationIds(D);

    const myVisitWhere = Object.assign({ id: D.UserId }, window);
    const orgVisitWhere = Object.assign({}, window);
    if (orgIds) orgVisitWhere.OrganizationId = { [Op.in]: orgIds };

    const [myVisits, orgVisits, monitored, adviceAuthored, topDiagnoses] = await Promise.all([
      Models.Visit.count({ where: myVisitWhere }),
      Models.Visit.count({ where: orgVisitWhere }),
      Models.PatientMonitoringDoctor.count({
        where: { user_id: D.UserId, is_active: '1' },
      }),
      Models.Advice.count({
        where: {
          id: D.UserId,
          rec_status: { [Op.ne]: '2' },
          adv_ticket_closed: { [Op.in]: ['n', 'y'] },
        },
      }),
      Models.Visit.findAll({
        where: Object.assign({ id: D.UserId }, window),
        attributes: [
          'main_diagnosis_mn',
          [Models.Visit.sequelize.literal('COUNT(*)'), 'Total'],
        ],
        group: ['main_diagnosis_mn'],
        order: [[Models.Visit.sequelize.literal('COUNT(*)'), 'DESC']],
        limit: 10,
        raw: true,
      }),
    ]);

    return ok(res, {
      window: { from: req.query.from || null, to: req.query.to || null },
      myVisits,
      organizationVisits: orgVisits,
      monitoredPatients: monitored,
      adviceAuthored,
      topDiagnoses: topDiagnoses
        .filter((d) => d.main_diagnosis_mn)
        .map((d) => ({ diagnosis: d.main_diagnosis_mn, total: Number(d.Total) || 0 })),
      // Provenance, required on every export by both tenders.
      source: {
        OrganizationId: D.OrganizationId,
        generatedAt: ObjectHelper.getDateYMDHMS(),
      },
    });
  } catch (ex) {
    return serverError(res, ex, 'reportSummary');
  }
};

/* ------------------------------- Асран хамгаалагчийн зөвшөөрөл (§1.2) */

/**
 * One patient's consent state, as the doctor sees it.
 *
 * The patient's own /api/patient/consents already answers this for them. This
 * exists for the case the tender actually names and which has no route at all:
 * a patient who cannot give consent themselves.
 */
exports.listPatientConsents = async (req, res) => {
  try {
    if (!(await Consent.Available())) {
      return fail(res, 'FEATURE_DISABLED', 'Зөвшөөрлийн бүртгэл бэлэн биш байна', 503);
    }

    const D = req.Doctor;
    const PatientId = toInt(req.params.id);
    if (!PatientId) return fail(res, 'INVALID_ID', 'Буруу дугаар');

    const May = await CareTeam.CanAccessPatient(D, PatientId);
    if (!May) return fail(res, 'NO_PATIENT_ACCESS', 'Энэ үйлчлүүлэгчид хандах эрхгүй байна', 403);

    const { Patient, PatRegNo } = await ResolvePatRegNo(PatientId);
    if (!Patient) return fail(res, 'NOT_FOUND', 'Үйлчлүүлэгч олдсонгүй', 404);
    if (!PatRegNo) {
      return fail(res, 'NO_REGISTRATION', 'Үйлчлүүлэгчийн регистрийн дугаар бүртгэгдээгүй', 409);
    }

    const states = await Consent.CurrentStates(PatRegNo);
    const labels = await DicoLabels.GetLabelMap('consent_purpose');

    return ok(
      res,
      states.map((s) => ({
        PurposeCode: s.PurposeCode,
        PurposeLabel: labels.get(String(s.PurposeCode)) || null,
        Granted: !!s.Granted,
        GrantedDate: s.GrantedDate,
        Channel: s.Channel,
        // NULL predates the guardian route, and those rows are self-consents by
        // construction. Reporting it as 'self' rather than null keeps the
        // client from having to know that history.
        GrantedBy: s.GrantedBy || 'self',
        GuardianName: s.GuardianName || null,
        GuardianRelation: s.GuardianRelation || null,
      }))
    );
  } catch (ex) {
    return serverError(res, ex, 'listPatientConsents');
  }
};

/**
 * Record a consent given by the patient's guardian.
 *
 * ALL THREE GUARDIAN FIELDS ARE REQUIRED. A consent given by somebody other
 * than the data subject is only meaningful if the record says who they were and
 * on what basis they were entitled to give it. Accepting a guardian consent
 * with the guardian's name missing would produce a row that proves nothing,
 * which is worse than refusing to write it - the archive could no longer tell
 * "the patient agreed" from "a person in the room agreed".
 *
 * Append-only, like every other write to this table: withdrawing later writes a
 * further row with Granted = 0 and this one is never modified.
 *
 * Channel is 'web' rather than 'mobile': whatever device the doctor is holding,
 * this was recorded by a clinician on the patient's behalf, and that is the
 * distinction the column is for.
 */
exports.createPatientConsent = async (req, res) => {
  try {
    if (!(await Consent.Available())) {
      return fail(res, 'FEATURE_DISABLED', 'Зөвшөөрлийн бүртгэл бэлэн биш байна', 503);
    }

    const D = req.Doctor;
    const PatientId = toInt(req.params.id);
    if (!PatientId) return fail(res, 'INVALID_ID', 'Буруу дугаар');

    const May = await CareTeam.CanAccessPatient(D, PatientId);
    if (!May) return fail(res, 'NO_PATIENT_ACCESS', 'Энэ үйлчлүүлэгчид хандах эрхгүй байна', 403);

    const { purposeCode, granted, guardianRegNo, guardianName, guardianRelation } = req.body || {};

    if (!purposeCode) return fail(res, 'PURPOSE_REQUIRED', 'Зорилгыг заана уу');
    if (granted === undefined || granted === null) {
      return fail(res, 'GRANTED_REQUIRED', 'Зөвшөөрсөн эсэхийг заана уу');
    }
    if (!guardianName || !String(guardianName).trim()) {
      return fail(res, 'GUARDIAN_NAME_REQUIRED', 'Асран хамгаалагчийн нэрийг заана уу');
    }
    if (!guardianRegNo || !String(guardianRegNo).trim()) {
      return fail(res, 'GUARDIAN_REGNO_REQUIRED', 'Асран хамгаалагчийн регистрийн дугаарыг заана уу');
    }
    if (!guardianRelation || !String(guardianRelation).trim()) {
      return fail(res, 'GUARDIAN_RELATION_REQUIRED', 'Төрөл садангийн холбоог заана уу');
    }

    const { Patient, PatRegNo } = await ResolvePatRegNo(PatientId);
    if (!Patient) return fail(res, 'NOT_FOUND', 'Үйлчлүүлэгч олдсонгүй', 404);
    if (!PatRegNo) {
      return fail(res, 'NO_REGISTRATION', 'Үйлчлүүлэгчийн регистрийн дугаар бүртгэгдээгүй', 409);
    }

    // The text the guardian was shown. Without an active document there is
    // nothing for them to have agreed TO, so this refuses rather than recording
    // agreement to an unknown wording.
    const doc = await Consent.ActiveDocument(String(purposeCode));
    if (!doc) return fail(res, 'CONSENT_DOC_NOT_FOUND', 'Зөвшөөрлийн текст олдсонгүй', 400);

    const Now = ObjectHelper.getDateYMDHMS();
    const created = await Models.PatientConsent.create({
      PatRegNo,
      PatientId,
      PatientUserId: null,
      ConsentDocumentId: doc.Id,
      PurposeCode: String(purposeCode),
      Granted: granted === true || granted === 'true' || granted === 1 || granted === '1',
      GrantedDate: Now,
      Channel: 'web',
      IpAddress: String(req.ip || '').slice(0, 45),
      GrantedBy: 'guardian',
      GuardianRegNo: String(guardianRegNo).trim(),
      GuardianName: String(guardianName).trim(),
      GuardianRelation: String(guardianRelation).trim(),
      CreateDate: Now,
      // Who RECORDED it. The guardian gave it; this doctor witnessed and
      // entered it, and the two must not be conflated.
      CreateUserId: D.UserId,
    });

    Consent.Invalidate(PatRegNo);

    await BaseControllerHelper.CreateUserActionHistory({
      LinkObjectName: 'PatientConsent',
      LinkObjectId: created.Id,
      Action: 'Create',
      LogedUser: req.LogedUser,
      PatientId,
      NotesMn: 'Асран хамгаалагчийн зөвшөөрөл бүртгэлээ',
      Notes: 'Recorded guardian consent',
    });

    return ok(res, {
      Id: created.Id,
      PurposeCode: String(purposeCode),
      Granted: created.Granted,
      GrantedBy: 'guardian',
      GrantedDate: Now,
    });
  } catch (ex) {
    return serverError(res, ex, 'createPatientConsent');
  }
};

/* ------------------------------------- Экспорт ба хэвлэх (tender §1.8) */

/**
 * The visit list as a file, under exactly the filters the list endpoint takes.
 *
 * WHY IT SHARES listVisits' WHERE CLAUSE RATHER THAN REBUILDING IT. An export
 * that quietly selects a different set from the screen it was launched from is
 * the worst kind of reporting bug: nothing errors, and the numbers are wrong.
 * BuildVisitQuery is the single place those filters are expressed, and both
 * callers use it.
 *
 * Over EXPORT_MAX_ROWS the request is REFUSED rather than truncated. A
 * spreadsheet that silently stops at ten thousand rows looks complete, and
 * somebody will report from it.
 */
exports.exportVisits = async (req, res) => {
  try {
    const D = req.Doctor;
    const format = String(req.query.format || 'xlsx').toLowerCase();
    if (!Export.IsFormat(format)) {
      return fail(res, 'INVALID_FORMAT', 'format нь ' + Export.FORMATS.join(', ') + ' байна');
    }

    const { where, include, scope } = await BuildVisitQuery(req, D);

    const count = await Models.Visit.count({ where, include, distinct: true, col: 'id_data' });
    if (count > EXPORT_MAX_ROWS) {
      return fail(
        res,
        'EXPORT_TOO_LARGE',
        'Экспортын мөрийн тоо хэтэрсэн: ' + count + '. Дээд хязгаар ' + EXPORT_MAX_ROWS +
          '. Огнооны шүүлтүүр нэмнэ үү.',
        400
      );
    }

    const rows = await Models.Visit.findAll({
      where,
      include,
      subQuery: false,
      attributes: [
        'id_data',
        'visit_date',
        'PatRegNo',
        'chief_complaint',
        'main_diagnosis',
        'main_diagnosis_mn',
        'OrganizationId',
      ],
      order: [
        ['visit_date', 'DESC'],
        ['id_data', 'DESC'],
      ],
      limit: EXPORT_MAX_ROWS,
    });

    const data = JSON.parse(JSON.stringify(rows));

    return await Export.Send({
      res,
      format,
      fileName: 'visits_' + scope,
      sheetName: 'Үзлэг',
      headers: [
        'Дугаар',
        'Огноо',
        'Регистр',
        'Овог',
        'Нэр',
        'Зовиур',
        'Онош (код)',
        'Онош (монгол)',
        'Байгууллага',
      ],
      rows: data.map((r) => [
        r.id_data,
        r.visit_date,
        r.PatRegNo,
        r.Patient ? r.Patient.p_lastname : '',
        r.Patient ? r.Patient.p_firstname : '',
        r.chief_complaint,
        r.main_diagnosis,
        r.main_diagnosis_mn,
        r.OrganizationId,
      ]),
      provenance: Provenance.Lines({
        LogedUser: req.LogedUser,
        Register: 'Үзлэгийн бүртгэл',
        From: req.query.from,
        To: req.query.to,
        Note: 'Хамрах хүрээ: ' + scope,
      }),
    });
  } catch (ex) {
    return serverError(res, ex, 'exportVisits');
  }
};

/**
 * The doctor summary report as a file.
 *
 * helper/DoctorExamReportHelper.BuildExport already produces headers, rows and
 * the provenance block for this report - it is what the web's own export uses.
 * Reusing it means the mobile download and the web download are the same
 * numbers, which is the entire point of not writing a second query.
 */
exports.exportReportSummary = async (req, res) => {
  try {
    const format = String(req.query.format || 'xlsx').toLowerCase();
    if (!Export.IsFormat(format)) {
      return fail(res, 'INVALID_FORMAT', 'format нь ' + Export.FORMATS.join(', ') + ' байна');
    }

    const { headers, rows, provenance } = await DoctorExamReportHelper.BuildExport({
      LogedUser: req.LogedUser,
      Filter: { StartDate: req.query.from, EndDate: req.query.to },
    });

    return await Export.Send({
      res,
      format,
      fileName: 'doctor_summary',
      sheetName: 'Тайлан',
      headers,
      rows,
      provenance,
    });
  } catch (ex) {
    return serverError(res, ex, 'exportReportSummary');
  }
};

/**
 * One examination as an A4 PDF.
 *
 * Scoped exactly as getVisit is - an id outside the caller's organisation is
 * 404, not a document - and audited, because it is a per-patient clinical read
 * that leaves the system as a file.
 *
 * Rendered through helper/PrintHelper.SendPdf, which owns the Puppeteer page
 * lifecycle, the A4 setup and the organisation footer. FooterFor supplies the
 * provenance line at the bottom of every page, which is the print equivalent of
 * the header block Export.Send writes into a spreadsheet.
 */
exports.printVisit = async (req, res) => {
  try {
    const D = req.Doctor;
    const id = toInt(req.params.id);
    if (!id) return fail(res, 'INVALID_ID', 'Буруу дугаар');

    const where = { id_data: id };
    if (!D.IsAdmin) {
      const orgIds = await OrganizationIds(D);
      if (orgIds) where.OrganizationId = { [Op.in]: orgIds };
    }

    const visit = await Models.Visit.findOne({
      where,
      include: [PATIENT_INCLUDE],
    });
    if (!visit) return fail(res, 'NOT_FOUND', 'Үзлэг олдсонгүй', 404);

    const v = JSON.parse(JSON.stringify(visit));
    const P = v.Patient || {};

    AccessAudit.RecordAccess({
      LogedUser: req.LogedUser,
      PatientId: v.PatientId,
      ObjectName: 'Visit',
      ObjectId: id,
      Action: 'PrintVisit',
    });

    const E = PrintHelper.Esc;
    const Row = (label, value) =>
      value === null || value === undefined || value === ''
        ? ''
        : '<tr><th>' + E(label) + '</th><td>' + E(value) + '</td></tr>';

    // No <table> or bare h1-h6 in the markup that the SCSS could reach - this
    // is a standalone document, but the same rule keeps it self-contained.
    const html =
      '<!doctype html><html><head><meta charset="utf-8"><style>' +
      'body{font-family:"Segoe UI",Arial,sans-serif;font-size:12px;color:#0c2233;margin:0}' +
      '.t{font-size:18px;font-weight:700;margin:0 0 2mm}' +
      '.s{font-size:11px;color:#0a6c96;margin:0 0 6mm}' +
      'table{border-collapse:collapse;width:100%;margin-bottom:5mm}' +
      'th,td{border:1px solid #c9d8e4;padding:2mm 3mm;text-align:left;vertical-align:top}' +
      'th{width:38mm;background:#eaf2f8;font-weight:600}' +
      '</style></head><body>' +
      '<p class="t">Үзлэгийн тэмдэглэл</p>' +
      '<p class="s">Дугаар: ' + E(v.id_data) + ' · Огноо: ' + E(v.visit_date || '') + '</p>' +
      '<table>' +
      Row('Овог, нэр', [P.p_lastname, P.p_firstname].filter(Boolean).join(' ')) +
      Row('Регистр', P.p_registration || v.PatRegNo) +
      Row('Төрсөн огноо', P.p_birthday) +
      Row('Нас', P.p_age) +
      Row('Утас', P.p_telephone) +
      '</table>' +
      '<table>' +
      Row('Зовиур', v.chief_complaint) +
      Row('Онош', v.main_diagnosis) +
      Row('Онош (монгол)', v.main_diagnosis_mn) +
      Row('Үзлэгийн төрөл', v.exam_type_icd) +
      Row('Шалтгаан', v.cause_icd10) +
      Row('Ажилбар', v.procedure_icd9) +
      Row('Хүндрэл', v.has_complication) +
      '</table>' +
      '</body></html>';

    return await PrintHelper.SendPdf({
      res,
      html,
      namePrefix: 'Visit',
      downloadName: 'visit_' + id + '.pdf',
      footer: await PrintHelper.FooterFor(req.LogedUser, v.OrganizationId),
    });
  } catch (ex) {
    return serverError(res, ex, 'printVisit');
  }
};

/* -------------------------------- Шинжилгээ, оношлогоо (tender §3.1) */

/**
 * One patient's investigations across all four tables, newest first.
 *
 * The mapping lives in helper/Diagnostics.js so this and the patient's own
 * /api/patient/diagnostics cannot drift. Both are audited, and both run the
 * confidentiality check - LaboratoryTest carries hiv, hbs_ag, hcv and syphilis,
 * which is precisely the data tender §1.2 has in mind.
 */
exports.listPatientDiagnostics = async (req, res) => {
  try {
    const PatientId = toInt(req.params.id);
    if (!PatientId) return fail(res, 'INVALID_ID', 'Буруу дугаар');

    const type = req.query.type ? String(req.query.type) : null;
    if (type && !Diagnostics.IsType(type)) {
      return fail(res, 'INVALID_TYPE', 'type нь ' + Diagnostics.TYPE_NAMES.join(', ') + ' байна');
    }

    const patient = await Models.Patient.findByPk(PatientId, {
      attributes: ['id_data'],
      raw: true,
    });
    if (!patient) return fail(res, 'NOT_FOUND', 'Үйлчлүүлэгч олдсонгүй', 404);

    const { limit, offset } = readPaging(req);
    const { total, rows } = await Diagnostics.List({
      PatientId,
      Type: type,
      From: req.query.from,
      To: req.query.to,
      Limit: limit,
      Offset: offset,
    });

    AccessAudit.RecordAccess({
      LogedUser: req.LogedUser,
      PatientId,
      ObjectName: 'Diagnostics',
      ObjectId: null,
      Action: 'ViewDiagnostics',
      RowCount: rows.length,
    });

    return ok(res, rows, { total, limit, offset });
  } catch (ex) {
    return serverError(res, ex, 'listPatientDiagnostics');
  }
};

/**
 * One investigation in full.
 *
 * The patient is read FROM THE RECORD, not from the request, so the audit row
 * names the right person and the confidentiality check is asked about the right
 * person - an id is not permitted to claim whose result it is.
 */
exports.getDiagnostic = async (req, res) => {
  try {
    const type = String(req.params.type || '');
    const Id = toInt(req.params.id);
    if (!Diagnostics.IsType(type)) {
      return fail(res, 'INVALID_TYPE', 'type нь ' + Diagnostics.TYPE_NAMES.join(', ') + ' байна');
    }
    if (!Id) return fail(res, 'INVALID_ID', 'Буруу дугаар');

    let detail = await Diagnostics.GetOne({ Type: type, Id });
    if (!detail) return fail(res, 'NOT_FOUND', 'Шинжилгээ олдсонгүй', 404);

    // Confidentiality runs at FEATURE_CONFIDENTIALITY's default of 'off' until
    // ЗСҮТ supply the access matrix, so this masks nothing today. Wiring it now
    // means turning it on is a flag, not a code change - and the panel that
    // will be masked is already declared in Diagnostics.LAB_PANELS.
    // MaySeePatient returns { Allowed, Level, Mode, Reason }, not a boolean.
    const Conf = await Confidentiality.MaySeePatient({
      LogedUser: req.LogedUser,
      PatientId: detail.PatientId,
    });
    if (Conf && Conf.Allowed === false) detail = Diagnostics.MaskConfidential(detail);

    AccessAudit.RecordAccess({
      LogedUser: req.LogedUser,
      PatientId: detail.PatientId,
      ObjectName: Diagnostics.TYPES[type].Model,
      ObjectId: Id,
      Action: 'ViewDiagnostic',
    });

    return ok(res, detail);
  } catch (ex) {
    return serverError(res, ex, 'getDiagnostic');
  }
};

/* ------------------------------------------------ ICD-10 (онош хайх, §1.3) */

/**
 * ICD-10 autocomplete for the diagnosis box.
 *
 * WHY IT IS A RAW QUERY. vwICD10 carries the code in `value` (18,803 rows) and
 * the English text in `label`, pre-formatted as `*CODE ENG`. The Mongolian is in
 * IcdTranslation (11,008 rows). vwICD10.findAllNew already expresses a join
 * between them, but it passes `logging` - a statement per keystroke into the PM2
 * log - and has no WHERE and no TOP, so it materialises the whole
 * classification. Neither is acceptable for a typeahead.
 *
 * WHY IT JOINS ON `code` AND NOT ON THE LABEL. findAllNew matches
 * `'*' + t.code + ' ' + t.eng = v.label`. That expression is not sargable: it
 * concatenates three columns per candidate row before it can compare, so the
 * optimiser has no index to use and the search degenerates into 18,803 × 11,008
 * string builds. Measured on MnCardio_test: searching the Mongolian that way did
 * not return in ten minutes. Joining on `t.code = v.value` - the same rows, an
 * equality on a plain column - answers in ~130 ms.
 *
 * WHY IT DEDUPES WITH GROUP BY. `IcdTranslation.code` is NOT unique: B00, J17
 * and J91 each have two rows, so a plain LEFT JOIN emits the same ICD code
 * twice - a visible duplicate in a list of twenty. GROUP BY v.value collapses
 * them and MIN() picks one translation.
 *
 * AND WHY NOT OUTER APPLY + EXISTS, which is the obvious way to write that. It
 * was measured: 43 seconds for `I21` and 9.9 seconds for a Mongolian term,
 * because both the APPLY and the EXISTS are correlated and run once per
 * candidate row of an 18,803-row view. The single join below is one pass and
 * answers in ~130 ms. The acceptance criterion for search is three seconds.
 *
 * Three columns are searched so a doctor can type any of them: the code, the
 * English term and the Mongolian term. Two characters minimum, twenty rows
 * maximum, per the mobile specification.
 *
 * `name_en` has the `*CODE ` prefix stripped here rather than in SQL - the
 * client wants a term, not the view's display string, and doing it in JS keeps
 * the statement readable.
 */
exports.searchIcd10 = async (req, res) => {
  try {
    const q = String(req.query.search || '').trim();
    if (q.length < ICD10_MIN_CHARS) {
      return fail(res, 'SEARCH_TOO_SHORT', 'Хайлтын утга 2-оос доошгүй тэмдэгт байна');
    }

    const rows = await sequelize.query(
      `SELECT TOP (${ICD10_MAX_ROWS})
              v.value    AS code,
              MIN(v.label) AS label,
              MIN(t.mon)   AS name_mn
         FROM [vwICD10] v
         LEFT JOIN [IcdTranslation] t ON t.code = v.value
        WHERE v.value LIKE :prefix
           OR v.label LIKE :anywhere
           OR t.mon   LIKE :anywhere
        GROUP BY v.value
        ORDER BY
              -- A code match first: typing "I21" wants I21 at the top, not
              -- every term that happens to contain those letters.
              CASE WHEN v.value LIKE :prefix THEN 0 ELSE 1 END,
              v.value`,
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: { prefix: q + '%', anywhere: '%' + q + '%' },
      }
    );

    const data = rows.map((r) => ({
      code: r.code,
      name_mn: r.name_mn || null,
      name_en: String(r.label || '')
        .replace(/^\*\S*\s*/, '')
        .trim(),
    }));

    return ok(res, data, { total: data.length, max: ICD10_MAX_ROWS });
  } catch (ex) {
    return serverError(res, ex, 'searchIcd10');
  }
};

/* ------------------------- 32 Үйлчлүүлэгчийн модуль харах (patient read) */

/**
 * Find a patient by registration number or name.
 *
 * Requires at least 3 characters: a one-character LIKE over the patient table
 * is a full scan that returns most of the country, which is neither useful nor
 * something to expose to a phone.
 */
exports.searchPatients = async (req, res) => {
  try {
    const { limit, offset } = readPaging(req);
    const search = (req.query.search || '').trim();
    const icd10 = icd10Where(req.query.icd10);

    // The 3-character floor exists to stop a one-character LIKE scanning the
    // whole patient table. An ICD-10 code is already a narrow filter, so when
    // one is supplied `search` becomes optional rather than required - which is
    // what makes "every patient with an I21 diagnosis" a query at all.
    if (!icd10 && search.length < 3) {
      return fail(res, 'SEARCH_TOO_SHORT', 'Хайлтын утга 3-аас доошгүй тэмдэгт байна');
    }

    const where = {};
    let icd10Capped = false;

    if (search) {
      where[Op.or] = [
        { p_registration: { [Op.like]: '%' + search + '%' } },
        { p_lastname: { [Op.like]: '%' + search + '%' } },
        { p_firstname: { [Op.like]: '%' + search + '%' } },
      ];
    }

    if (icd10) {
      /*
       * Patients who HAVE such an examination: a DISTINCT id list applied with
       * Op.in, not a JOIN - a patient with twelve I21 visits must appear once,
       * and `count` must stay a count of patients.
       *
       * Raw SQL rather than Sequelize, because `attributes: [fn('DISTINCT',…)]`
       * with a `limit` makes Sequelize emit
       *   SELECT DISTINCT(PatientId) … ORDER BY id_data OFFSET 0 ROWS FETCH NEXT …
       * and SQL Server rejects it outright: "ORDER BY items must appear in the
       * select list if SELECT DISTINCT is specified." It adds the ORDER BY for
       * us because OFFSET/FETCH requires one. TOP needs no ORDER BY, so the
       * statement is written by hand.
       *
       * Capped, because Visit holds ~450,000 rows and a broad prefix like `I%`
       * would otherwise build an IN list of tens of thousands of ids and send it
       * back as one statement. Exceeding the cap is REPORTED in the envelope
       * rather than applied silently - a truncated result that looks complete is
       * worse than one that says it is truncated.
       */
      const isPrefix = String(req.query.icd10).indexOf('%') !== -1;
      const code = String(req.query.icd10).trim();

      const ids = await sequelize.query(
        `SELECT DISTINCT TOP (${ICD10_PATIENT_CAP}) PatientId
           FROM [Visit]
          WHERE PatientId IS NOT NULL
            AND (main_diagnosis LIKE :label ${isPrefix ? '' : 'OR main_diagnosis = :bare'}
                 OR icd10 LIKE :plain)`,
        {
          type: Sequelize.QueryTypes.SELECT,
          replacements: {
            label: isPrefix ? '*' + code : '*' + code + ' %',
            bare: '*' + code,
            plain: isPrefix ? code : code,
          },
        }
      );

      icd10Capped = ids.length >= ICD10_PATIENT_CAP;
      where.id_data = { [Op.in]: ids.map((r) => r.PatientId) };
    }

    const { rows, count } = await Models.Patient.findAndCountAll({
      where,
      attributes: PATIENT_ATTRS,
      order: [['id_data', 'DESC']],
      limit,
      offset,
      raw: true,
    });

    return ok(res, rows, {
      total: count,
      limit,
      offset,
      // Only present when it is true, so a client that ignores it is not
      // reading a flag on every response.
      ...(icd10Capped ? { truncated: true, cap: ICD10_PATIENT_CAP } : {}),
    });
  } catch (ex) {
    return serverError(res, ex, 'searchPatients');
  }
};

/** A patient card: profile, recent examinations, journal series, monitoring state. */
exports.getPatient = async (req, res) => {
  try {
    const D = req.Doctor;
    const id = toInt(req.params.id);
    if (!id) return fail(res, 'INVALID_ID', 'Буруу дугаар');

    const patient = await Models.Patient.findByPk(id, {
      attributes: PATIENT_ATTRS.concat([
        'p_telephone2',
        'addr_prov_city',
        'addr_soum_dist',
        'addr_bag_khoroo',
      ]),
      raw: true,
    });
    if (!patient) return fail(res, 'NOT_FOUND', 'Үйлчлүүлэгч олдсонгүй', 404);

    // This read is nationwide and unscoped - any staff token can open any
    // patient card by id. That is pre-existing and deliberate for a national
    // consult service, but it is precisely the read the tender wants logged.
    AccessAudit.RecordAccess({
      LogedUser: req.LogedUser,
      PatientId: id,
      ObjectName: 'Patient',
      ObjectId: id,
      Action: 'ViewPatient',
    });

    const [visits, journal, monitored] = await Promise.all([
      Models.Visit.findAll({
        where: { PatientId: id },
        attributes: [
          'id_data',
          'visit_date',
          'chief_complaint',
          'main_diagnosis_mn',
          'icd10',
          'OrganizationId',
        ],
        order: [
          ['visit_date', 'DESC'],
          ['id_data', 'DESC'],
        ],
        limit: 20,
        raw: true,
      }),
      Models.PatientMonitoring.findAll({
        where: { patient_id: id },
        attributes: ['date', 'blood_pressure', 'blood_pressure2', 'pulse', 'weight'],
        order: [['date', 'ASC']],
        limit: 180,
        raw: true,
      }),
      Models.PatientMonitoringDoctor.findOne({
        where: { patient_id: id, user_id: D.UserId, is_active: '1' },
        attributes: ['id_data'],
        raw: true,
      }),
    ]);

    return ok(res, {
      patient,
      visits,
      journal: {
        labels: journal.map((r) => r.date),
        series: {
          blood_pressure: journal.map((r) => r.blood_pressure),
          blood_pressure2: journal.map((r) => r.blood_pressure2),
          pulse: journal.map((r) => r.pulse),
          weight: journal.map((r) => r.weight),
        },
      },
      isMonitoredByMe: !!monitored,
    });
  } catch (ex) {
    return serverError(res, ex, 'getPatient');
  }
};

/* ------------------------------------------------- 2.6 Цахим үзлэг (triage) */

/**
 * Same row shape the patient sees, plus the patient's own card.
 *
 * MeetingUrl only on a scheduled visit - see the note on the patient side. It
 * is a bearer credential for a clinical conversation, not a record field.
 */
const shapeDoctorEvisit = (row, statusLabels) => {
  const r = row.toJSON ? row.toJSON() : row;
  const Doctor = r.Doctor || null;
  const Patient = r.Patient || null;

  return {
    Id: r.Id,
    Comment: r.Comment,
    RequestedDate: r.RequestedDate,
    ScheduledDate: r.ScheduledDate,
    Status: r.Status,
    StatusLabel: statusLabels ? statusLabels.get(String(r.Status)) || null : null,
    DoctorId: r.DoctorId,
    DoctorName: Doctor ? [Doctor.lastname, Doctor.firstname].filter(Boolean).join(' ') : null,
    MeetingUrl: r.Status === RemoteVisitFlow.STATUS.SCHEDULED ? r.MeetingUrl || null : null,
    CreateDate: r.CreateDate,
    UpdateDate: r.UpdateDate,
    Patient: Patient
      ? {
          id_data: Patient.id_data,
          p_registration: Patient.p_registration,
          p_lastname: Patient.p_lastname,
          p_firstname: Patient.p_firstname,
          p_birthday: Patient.p_birthday,
          p_telephone: Patient.p_telephone,
        }
      : null,
  };
};

const EVISIT_DOCTOR_INCLUDE = {
  model: Models.DoctorsProfile,
  as: 'Doctor',
  attributes: ['id_data', 'lastname', 'firstname'],
  required: false,
};

/**
 * The triage queue.
 *
 * SCOPE IS THE DESIGN DECISION HERE, AND IT NEEDS A CUSTOMER ANSWER.
 * RemoteVisit has no OrganizationId, and Patient has no organisation column
 * either, so the OrganizationIds() scope used elsewhere on this surface simply
 * does not apply. That leaves two honest options, and they are very different:
 *
 *   a nationwide unassigned pool would put every patient's name and complaint
 *   text in front of every doctor in the country;
 *
 *   care-team scoping reuses a reviewed primitive (helper/CareTeam.js) and is
 *   far narrower - but it means a request from a patient with no care team and
 *   no monitoring doctor is visible to NOBODY except an admin.
 *
 * The second is chosen because it cannot leak, and the gap it leaves is visible
 * rather than silent. But "who triages a request from an unattached patient?"
 * is a real product question, raised in mobile/BLOCKERS.md rather than answered
 * here.
 */
exports.listDoctorEvisits = async (req, res) => {
  try {
    const D = req.Doctor;
    const { limit, offset } = readPaging(req);
    const scope = String(req.query.scope || 'mine');

    const where = Object.assign({}, readDateRange(req, 'RequestedDate'));

    /*
     * ?patientId= turns this from a triage QUEUE into one patient's e-visit
     * HISTORY, which is what the patient card needs.
     *
     * It exists because the app was calling the legacy /api/RemoteVisit/GetList
     * and discarding other people's rows CLIENT-SIDE - so the rows were on the
     * wire regardless of whether they were ever drawn.
     *
     * Three deliberate differences from the queue, all following from "history,
     * not queue":
     *   - scope is ignored, and not required to be 'all'. Per-patient reads on
     *     this surface are nationwide by design (see getPatient) rather than
     *     care-team scoped, and a narrower rule here than on the card the list
     *     sits inside would be inconsistent, not safer.
     *   - the default status filter is dropped. A history that hides completed
     *     visits is not a history. ?status= still narrows it.
     *   - the read is audited, because it is a per-patient clinical read.
     */
    const patientId = toInt(req.query.patientId);
    if (patientId) where.PatientId = patientId;

    const { status } = req.query;
    if (status) {
      const wanted = String(status)
        .split(',')
        .map((s) => s.trim())
        .filter((s) => RemoteVisitFlow.IsStatus(s));
      if (!wanted.length) return fail(res, 'INVALID_STATUS', 'Төлөв буруу байна');
      where.Status = { [Op.in]: wanted };
    } else if (!patientId) {
      // Default to what still needs doing. A triage queue full of completed
      // visits is not a queue.
      where.Status = { [Op.in]: RemoteVisitFlow.OPEN };
    }

    if (patientId) {
      AccessAudit.RecordAccess({
        LogedUser: req.LogedUser,
        PatientId: patientId,
        ObjectName: 'RemoteVisit',
        ObjectId: null,
        Action: 'ViewEvisits',
      });
    } else if (scope === 'mine') {
      if (!D.DoctorId) {
        return fail(res, 'DOCTOR_PROFILE_NOT_RESOLVED', 'Эмчийн мэдээлэл олдсонгүй', 403);
      }
      where.DoctorId = D.DoctorId;
    } else if (scope === 'unassigned') {
      where.DoctorId = null;
      if (!D.IsAdmin) {
        const PatientIds = await CareTeam.GetCareTeamPatientIds(D.UserId);
        // An empty care team must match nothing, not everything. Op.in with an
        // empty array is the correct empty set.
        where.PatientId = { [Op.in]: PatientIds };
      }
    } else if (scope === 'all') {
      if (!D.IsAdmin) return fail(res, 'ROLE_NOT_ALLOWED', 'Хандах эрхгүй байна', 403);
    } else {
      return fail(res, 'INVALID_SCOPE', 'scope нь mine, unassigned, all байна');
    }

    const { rows, count } = await Models.RemoteVisit.findAndCountAll({
      where,
      include: [EVISIT_DOCTOR_INCLUDE, PATIENT_INCLUDE],
      // Oldest first: triage order, not list order. Whoever has waited longest
      // is who to deal with next.
      order: [
        ['RequestedDate', 'ASC'],
        ['Id', 'ASC'],
      ],
      limit,
      offset,
    });

    const labels = await DicoLabels.GetLabelMap('remotevisit_status');
    return ok(res, rows.map((r) => shapeDoctorEvisit(r, labels)), {
      total: count,
      limit,
      offset,
      scope,
    });
  } catch (ex) {
    return serverError(res, ex, 'listDoctorEvisits');
  }
};

/**
 * Load one request and decide whether this doctor may act on it.
 *
 * Returns null for "no" rather than throwing, and every caller turns that into
 * a 404 - NOT a 403. A 403 would confirm the id exists, which makes this an
 * oracle for enumerating other patients' requests. getVisit above takes the
 * same posture for the same reason.
 */
async function LoadEvisitFor(D, Id) {
  const row = await Models.RemoteVisit.findOne({
    where: { Id },
    include: [EVISIT_DOCTOR_INCLUDE, PATIENT_INCLUDE],
  });
  if (!row) return null;

  if (D.IsAdmin) return row;
  if (D.DoctorId && String(row.DoctorId) === String(D.DoctorId)) return row;

  // Not assigned to me: allowed only if this is my patient.
  const May = await CareTeam.CanAccessPatient(D, row.PatientId);
  return May ? row : null;
}

exports.getDoctorEvisit = async (req, res) => {
  try {
    const Id = toInt(req.params.id);
    if (!Id) return fail(res, 'INVALID_ID', 'Буруу дугаар');

    const row = await LoadEvisitFor(req.Doctor, Id);
    if (!row) return fail(res, 'NOT_FOUND', 'Хүсэлт олдсонгүй', 404);

    AccessAudit.RecordAccess({
      LogedUser: req.LogedUser,
      PatientId: row.PatientId,
      ObjectName: 'RemoteVisit',
      ObjectId: Id,
      Action: 'ViewEvisit',
    });

    const labels = await DicoLabels.GetLabelMap('remotevisit_status');
    return ok(res, shapeDoctorEvisit(row, labels));
  } catch (ex) {
    return serverError(res, ex, 'getDoctorEvisit');
  }
};

/** One PatientHistory row per doctor-side transition, mirroring WriteMonitoringAudit. */
async function WriteEvisitAudit(req, PatientId, Id, NotesMn) {
  await BaseControllerHelper.BaseCreate({
    ObjectName: 'PatientHistory',
    Data: {
      PatientId,
      UserId: req.Doctor.UserId,
      DoctorId: req.Doctor.DoctorId,
      LinkObjectName: 'RemoteVisit',
      LinkObjectId: Id,
      NotesMn,
      Date: ObjectHelper.getDateYMDHMS(),
    },
    LogedUser: req.LogedUser,
  });
}

/** https only - a join link carries a clinical conversation. */
const HTTPS_ONLY = new RegExp('^https://', 'i');

/**
 * Confirm a slot, or move one.
 *
 * DoctorId comes from the token and never from the body. That is the rule the
 * whole surface rests on - no endpoint accepts an identifier for who it is
 * acting as. Reassigning a request to a DIFFERENT doctor is therefore something
 * this API structurally cannot do; that is done from the web through
 * /BaseObject, which is why RemoteVisitConfig carries the field.
 */
exports.scheduleEvisit = async (req, res) => {
  try {
    const D = req.Doctor;
    const Id = toInt(req.params.id);
    if (!Id) return fail(res, 'INVALID_ID', 'Буруу дугаар');

    // A null DoctorId on the degraded token path would silently write an
    // unassigned "assignment", so refuse rather than record a lie.
    if (!D.DoctorId) {
      return fail(res, 'DOCTOR_PROFILE_NOT_RESOLVED', 'Эмчийн мэдээлэл олдсонгүй', 403);
    }

    const { ScheduledDate, MeetingUrl } = req.body || {};
    if (!ScheduledDate) return fail(res, 'DATE_REQUIRED', 'Товлох огноог оруулна уу');

    const When = new Date(ScheduledDate);
    if (isNaN(When.getTime())) return fail(res, 'INVALID_DATE', 'Огноо буруу байна');
    if (When.getTime() < Date.now()) {
      return fail(res, 'DATE_IN_PAST', 'Өнгөрсөн огноо товлох боломжгүй');
    }

    if (MeetingUrl) {
      const U = String(MeetingUrl);
      if (U.length > 500) return fail(res, 'INVALID_URL', 'Холбоос хэт урт байна');
      if (!HTTPS_ONLY.test(U)) {
        return fail(res, 'INVALID_URL', 'Холбоос https:// байх ёстой');
      }
    }

    const row = await LoadEvisitFor(D, Id);
    if (!row) return fail(res, 'NOT_FOUND', 'Хүсэлт олдсонгүй', 404);

    if (!RemoteVisitFlow.CanTransition(row.Status, RemoteVisitFlow.STATUS.SCHEDULED)) {
      return fail(res, 'INVALID_TRANSITION', 'Энэ хүсэлтийн төлөв өөрчлөгдөх боломжгүй', 409);
    }

    // Rescheduling someone else's booked visit must be theirs or an admin's.
    // Picking up an UNASSIGNED request is open to any doctor with access -
    // that is what triage is.
    if (
      row.Status === RemoteVisitFlow.STATUS.SCHEDULED &&
      row.DoctorId &&
      String(row.DoctorId) !== String(D.DoctorId) &&
      !D.IsAdmin
    ) {
      return fail(res, 'NOT_ASSIGNED', 'Энэ үзлэг өөр эмчид хуваарилагдсан байна', 403);
    }

    const Now = ObjectHelper.getDateYMDHMS();
    await Models.RemoteVisit.update(
      {
        Status: RemoteVisitFlow.STATUS.SCHEDULED,
        ScheduledDate,
        DoctorId: D.DoctorId,
        MeetingUrl: MeetingUrl || row.MeetingUrl || null,
        UpdateDate: Now,
      },
      { where: { Id } }
    );

    await WriteEvisitAudit(req, row.PatientId, Id, 'Цахим үзлэгийн цаг товлолоо');

    // The one notification the 2.6 flow genuinely needs. Without it the patient
    // has no way to learn their slot was confirmed except by opening the app
    // and looking - which is what mobile/API.md had to tell them to do.
    await NotificationHelper.NotifyPatient({
      PatientId: row.PatientId,
      Action: 'EvisitScheduled',
      LinkObjectName: 'RemoteVisit',
      LinkObjectId: Id,
      NotesMn: 'Цахим үзлэгийн цаг товлогдлоо: ' + String(ScheduledDate),
      Notes: 'Your remote examination has been scheduled',
      LogedUser: req.LogedUser,
    });

    const labels = await DicoLabels.GetLabelMap('remotevisit_status');
    return ok(res, {
      Id,
      Status: RemoteVisitFlow.STATUS.SCHEDULED,
      StatusLabel: labels.get(RemoteVisitFlow.STATUS.SCHEDULED) || null,
      ScheduledDate,
      DoctorId: D.DoctorId,
      MeetingUrl: MeetingUrl || row.MeetingUrl || null,
      UpdateDate: Now,
    });
  } catch (ex) {
    return serverError(res, ex, 'scheduleEvisit');
  }
};

/**
 * The examination happened.
 *
 * THE DOCTOR'S NOTE DOES NOT GO INTO RemoteVisit.Comment. That column holds the
 * patient's own complaint, in their words, and overwriting it destroys the
 * record of why they asked. The clinical record of an examination belongs in
 * Visit through the legacy controller - this surface deliberately does not
 * carry clinical writes (see the charter at the top of api/doctor/index.js).
 * What is recorded here is that the visit reached its end state, plus an audit
 * row carrying the note.
 */
exports.completeEvisit = async (req, res) => {
  try {
    const D = req.Doctor;
    const Id = toInt(req.params.id);
    if (!Id) return fail(res, 'INVALID_ID', 'Буруу дугаар');

    const row = await LoadEvisitFor(D, Id);
    if (!row) return fail(res, 'NOT_FOUND', 'Хүсэлт олдсонгүй', 404);

    if (!RemoteVisitFlow.CanTransition(row.Status, RemoteVisitFlow.STATUS.COMPLETED)) {
      return fail(res, 'INVALID_TRANSITION', 'Энэ үзлэгийг дуусгах боломжгүй', 409);
    }

    if (row.DoctorId && String(row.DoctorId) !== String(D.DoctorId) && !D.IsAdmin) {
      return fail(res, 'NOT_ASSIGNED', 'Энэ үзлэг өөр эмчид хуваарилагдсан байна', 403);
    }

    const Now = ObjectHelper.getDateYMDHMS();
    const { Comment } = req.body || {};

    await Models.RemoteVisit.update(
      {
        Status: RemoteVisitFlow.STATUS.COMPLETED,
        UpdateDate: Now,
        // Assign on completion too: a request completed straight from
        // 'requested' would otherwise carry no doctor at all.
        DoctorId: row.DoctorId || D.DoctorId || null,
      },
      { where: { Id } }
    );

    await WriteEvisitAudit(
      req,
      row.PatientId,
      Id,
      Comment ? 'Цахим үзлэг хийгдлээ: ' + String(Comment).slice(0, 400) : 'Цахим үзлэг хийгдлээ'
    );

    // completed is TERMINAL, and MeetingUrl stops being served the moment it is
    // reached. So this is the only signal the patient gets that the visit is
    // over rather than that their join link broke.
    await NotificationHelper.NotifyPatient({
      PatientId: row.PatientId,
      Action: 'EvisitCompleted',
      LinkObjectName: 'RemoteVisit',
      LinkObjectId: Id,
      NotesMn: 'Цахим үзлэг дууслаа',
      Notes: 'Your remote examination has been completed',
      LogedUser: req.LogedUser,
    });

    const labels = await DicoLabels.GetLabelMap('remotevisit_status');
    return ok(res, {
      Id,
      Status: RemoteVisitFlow.STATUS.COMPLETED,
      StatusLabel: labels.get(RemoteVisitFlow.STATUS.COMPLETED) || null,
      UpdateDate: Now,
    });
  } catch (ex) {
    return serverError(res, ex, 'completeEvisit');
  }
};

exports.cancelDoctorEvisit = async (req, res) => {
  try {
    const D = req.Doctor;
    const Id = toInt(req.params.id);
    if (!Id) return fail(res, 'INVALID_ID', 'Буруу дугаар');

    const row = await LoadEvisitFor(D, Id);
    if (!row) return fail(res, 'NOT_FOUND', 'Хүсэлт олдсонгүй', 404);

    if (!RemoteVisitFlow.CanTransition(row.Status, RemoteVisitFlow.STATUS.CANCELLED)) {
      return fail(res, 'INVALID_TRANSITION', 'Энэ хүсэлтийг цуцлах боломжгүй', 409);
    }

    if (row.DoctorId && String(row.DoctorId) !== String(D.DoctorId) && !D.IsAdmin) {
      return fail(res, 'NOT_ASSIGNED', 'Энэ үзлэг өөр эмчид хуваарилагдсан байна', 403);
    }

    const Now = ObjectHelper.getDateYMDHMS();
    const { Reason } = req.body || {};

    await Models.RemoteVisit.update(
      { Status: RemoteVisitFlow.STATUS.CANCELLED, UpdateDate: Now },
      { where: { Id } }
    );

    await WriteEvisitAudit(
      req,
      row.PatientId,
      Id,
      Reason
        ? 'Цахим үзлэгийн хүсэлтийг цуцаллаа: ' + String(Reason).slice(0, 400)
        : 'Цахим үзлэгийн хүсэлтийг цуцаллаа'
    );

    // The patient did not do this - a doctor refused or withdrew their request,
    // and cancelled is terminal. Without telling them, the app simply shows a
    // request that stopped moving. The reason is included when one was given.
    await NotificationHelper.NotifyPatient({
      PatientId: row.PatientId,
      Action: 'EvisitCancelled',
      LinkObjectName: 'RemoteVisit',
      LinkObjectId: Id,
      NotesMn: Reason
        ? 'Цахим үзлэгийн хүсэлт цуцлагдлаа: ' + String(Reason).slice(0, 200)
        : 'Цахим үзлэгийн хүсэлт цуцлагдлаа',
      Notes: 'Your remote examination request was cancelled',
      LogedUser: req.LogedUser,
    });

    const labels = await DicoLabels.GetLabelMap('remotevisit_status');
    return ok(res, {
      Id,
      Status: RemoteVisitFlow.STATUS.CANCELLED,
      StatusLabel: labels.get(RemoteVisitFlow.STATUS.CANCELLED) || null,
      UpdateDate: Now,
    });
  } catch (ex) {
    return serverError(res, ex, 'cancelDoctorEvisit');
  }
};

/* ------------------------------------- 2.7 Сэргээн засах, дасгал хөдөлгөөн */

/**
 * The exercise catalogue, same shape the patient app gets.
 *
 * Served to doctors from the same query rather than a parallel one, so the two
 * apps can never disagree about what an exercise is called or which category it
 * is in - which they would, eventually, if this were a second SELECT.
 */
exports.listRehabExercises = async (req, res) => {
  try {
    const rows = await Models.RehabExercise.findAll({
      where: { IsActive: true },
      attributes: [
        'Id',
        'Code',
        'Name',
        'Description',
        'CategoryCode',
        'DurationSec',
        'OrderNo',
        'MediaRef',
      ],
      order: [
        ['OrderNo', 'ASC'],
        ['Id', 'ASC'],
      ],
      raw: true,
    });

    const labels = await DicoLabels.GetLabelMap('rehab_category');
    const data = rows.map((r) =>
      Object.assign({}, r, {
        CategoryLabel: labels.get(String(r.CategoryCode)) || null,
        // Describe, not Parse: for a file-hosted video this fills in the
        // streaming route so the client never constructs a path. A url:
        // entry keeps its own address and an asset: entry stays null.
        media: MediaRef.Describe(r.MediaRef, '/api/Media/exercise/' + r.Id),
      })
    );

    return ok(res, data, { total: data.length });
  } catch (ex) {
    return serverError(res, ex, 'listRehabExercises');
  }
};

/**
 * Resolve a patient id to the register number the rehab tables key on.
 *
 * PatRegNo is NEVER accepted from the body. It is derived here from the :id in
 * the path, which is itself gated by CareTeam.CanAccessPatient - otherwise a
 * caller could write a row against any register number they could guess, which
 * is the whole class of bug this surface exists to avoid.
 */
async function ResolvePatRegNo(PatientId) {
  const P = await Models.Patient.findByPk(PatientId, {
    attributes: ['id_data', 'p_registration'],
    raw: true,
  });
  if (!P) return { Patient: null, PatRegNo: null };
  return { Patient: P, PatRegNo: P.p_registration || null };
}

/**
 * Эрсдэл үнэлгээ for one patient — the doctor's view of GET /api/patient/risk.
 *
 * Reads through helper/RiskInputs so it CANNOT diverge from what the patient
 * sees on their own phone. Same nationwide scope as getPatient, which this sits
 * inside, and audited for the same reason: it is a per-patient clinical read,
 * and the tender's "notify on access" requirement is fed by exactly these rows.
 *
 * No score, no risk class - see the header of helper/RiskInputs.js.
 */
exports.getPatientRisk = async (req, res) => {
  try {
    const PatientId = toInt(req.params.id);
    if (!PatientId) return fail(res, 'INVALID_ID', 'Буруу дугаар');

    const { Patient, PatRegNo } = await ResolvePatRegNo(PatientId);
    if (!Patient) return fail(res, 'NOT_FOUND', 'Үйлчлүүлэгч олдсонгүй', 404);

    AccessAudit.RecordAccess({
      LogedUser: req.LogedUser,
      PatientId,
      ObjectName: 'PatientBodySize',
      ObjectId: null,
      Action: 'ViewRisk',
    });

    // A patient with no registration number has no rows to find, which is the
    // empty answer rather than an error - the same fail-soft the patient side
    // gives them.
    return ok(res, await RiskInputs.Read(PatRegNo));
  } catch (ex) {
    return serverError(res, ex, 'getPatientRisk');
  }
};

/**
 * Everything rehabilitation knows about one patient: the latest assessment,
 * what they have completed, and their vitals series.
 *
 * The mirror of getMonitoringJournal, and shaped the same way - rows plus a
 * ready-to-plot series - so the doctor app charts vitals with the same code the
 * patient app uses.
 */
exports.getPatientRehab = async (req, res) => {
  try {
    const D = req.Doctor;
    const PatientId = toInt(req.params.id);
    if (!PatientId) return fail(res, 'INVALID_ID', 'Буруу дугаар');

    const May = await CareTeam.CanAccessPatient(D, PatientId);
    if (!May) return fail(res, 'NO_PATIENT_ACCESS', 'Энэ үйлчлүүлэгчид хандах эрхгүй байна', 403);

    const { Patient, PatRegNo } = await ResolvePatRegNo(PatientId);
    if (!Patient) return fail(res, 'NOT_FOUND', 'Үйлчлүүлэгч олдсонгүй', 404);
    // p_registration is nullable, and it is the only key these tables have.
    // Answering 409 says "this patient cannot carry rehab data" rather than
    // silently returning an empty record that looks like "no exercise yet".
    if (!PatRegNo) {
      return fail(res, 'NO_REGISTRATION', 'Үйлчлүүлэгчийн регистрийн дугаар бүртгэгдээгүй', 409);
    }

    AccessAudit.RecordAccess({
      LogedUser: req.LogedUser,
      PatientId,
      ObjectName: 'RehabProgress',
      Action: 'ViewRehab',
    });

    const [assessment, progress, vitals] = await Promise.all([
      Models.RehabAssessment.findOne({
        where: { PatRegNo },
        order: [['AssessmentDate', 'DESC'], ['Id', 'DESC']],
        raw: true,
      }),
      Models.RehabProgress.findAll({
        where: Object.assign({ PatRegNo }, readDateRange(req, 'CompletedAt')),
        attributes: ['Id', 'ExerciseId', 'CompletedAt', 'DurationSec', 'Notes'],
        order: [['CompletedAt', 'DESC']],
        limit: 365,
        raw: true,
      }),
      Models.RehabVitalSign.findAll({
        where: Object.assign({ PatRegNo }, readDateRange(req, 'MeasuredAt')),
        attributes: ['Id', 'MeasuredAt', 'Phase', 'Pulse', 'BloodPressure', 'Borg', 'Notes'],
        order: [['MeasuredAt', 'ASC']],
        limit: 365,
        raw: true,
      }),
    ]);

    const [riskLabels, phaseLabels] = await Promise.all([
      DicoLabels.GetLabelMap('rehab_risk'),
      DicoLabels.GetLabelMap('rehab_phase'),
    ]);

    return ok(res, {
      assessment: assessment
        ? Object.assign({}, assessment, {
            RiskLevelLabel: riskLabels.get(String(assessment.RiskLevel)) || null,
          })
        : null,
      progress,
      vitals: {
        rows: vitals.map((v) =>
          Object.assign({}, v, { PhaseLabel: phaseLabels.get(String(v.Phase)) || null })
        ),
        labels: vitals.map((v) => v.MeasuredAt),
        series: {
          pulse: vitals.map((v) => v.Pulse),
          borg: vitals.map((v) => v.Borg),
        },
      },
    });
  } catch (ex) {
    return serverError(res, ex, 'getPatientRehab');
  }
};

exports.listPatientAssessments = async (req, res) => {
  try {
    const D = req.Doctor;
    const PatientId = toInt(req.params.id);
    if (!PatientId) return fail(res, 'INVALID_ID', 'Буруу дугаар');

    const May = await CareTeam.CanAccessPatient(D, PatientId);
    if (!May) return fail(res, 'NO_PATIENT_ACCESS', 'Энэ үйлчлүүлэгчид хандах эрхгүй байна', 403);

    const { Patient, PatRegNo } = await ResolvePatRegNo(PatientId);
    if (!Patient) return fail(res, 'NOT_FOUND', 'Үйлчлүүлэгч олдсонгүй', 404);
    if (!PatRegNo) {
      return fail(res, 'NO_REGISTRATION', 'Үйлчлүүлэгчийн регистрийн дугаар бүртгэгдээгүй', 409);
    }

    const { limit, offset } = readPaging(req);
    const { rows, count } = await Models.RehabAssessment.findAndCountAll({
      where: { PatRegNo },
      order: [['AssessmentDate', 'DESC'], ['Id', 'DESC']],
      limit,
      offset,
      raw: true,
    });

    const riskLabels = await DicoLabels.GetLabelMap('rehab_risk');
    return ok(
      res,
      rows.map((r) =>
        Object.assign({}, r, { RiskLevelLabel: riskLabels.get(String(r.RiskLevel)) || null })
      ),
      { total: count, limit, offset }
    );
  } catch (ex) {
    return serverError(res, ex, 'listPatientAssessments');
  }
};

/**
 * Record a rehabilitation assessment.
 *
 * This is the gap it closes: /api/patient/rehab/assessment could only ever
 * READ, and nothing anywhere could write the row it read, so the patient's
 * assessment screen was permanently empty.
 *
 * NOTHING IS SCORED HERE. RiskLevel is stored exactly as chosen and
 * ToleranceScore exactly as entered - the same posture /api/patient/risk takes,
 * because the methodology is a ЗСҮТ deliverable (tracker 38) and inventing one
 * would put a number in front of a clinician that nobody has approved.
 */
exports.createPatientAssessment = async (req, res) => {
  try {
    const D = req.Doctor;
    const PatientId = toInt(req.params.id);
    if (!PatientId) return fail(res, 'INVALID_ID', 'Буруу дугаар');

    // A WRITE, so it is gated - unlike the nationwide reads beside it on this
    // surface, which are deliberately open for cross-hospital consults.
    const May = await CareTeam.CanAccessPatient(D, PatientId);
    if (!May) return fail(res, 'NO_PATIENT_ACCESS', 'Энэ үйлчлүүлэгчид хандах эрхгүй байна', 403);

    const { Patient, PatRegNo } = await ResolvePatRegNo(PatientId);
    if (!Patient) return fail(res, 'NOT_FOUND', 'Үйлчлүүлэгч олдсонгүй', 404);
    if (!PatRegNo) {
      return fail(res, 'NO_REGISTRATION', 'Үйлчлүүлэгчийн регистрийн дугаар бүртгэгдээгүй', 409);
    }

    const { AssessmentDate, RiskLevel, ToleranceScore, ToleranceUnit, Notes } = req.body || {};

    // Validated against the dictionary when it has been seeded, and accepted
    // as-is when it has not - the same fail-soft rule DicoLabels follows, so
    // this endpoint works identically on a database without the dico.
    if (RiskLevel) {
      const riskLabels = await DicoLabels.GetLabelMap('rehab_risk');
      if (riskLabels.size && !riskLabels.has(String(RiskLevel))) {
        return fail(res, 'INVALID_RISK_LEVEL', 'Эрсдэлийн түвшин буруу байна');
      }
    }

    if (ToleranceScore !== undefined && ToleranceScore !== null && ToleranceScore !== '') {
      if (isNaN(Number(ToleranceScore))) {
        return fail(res, 'INVALID_SCORE', 'Оноо тоо байх ёстой');
      }
    }

    const Now = ObjectHelper.getDateYMDHMS();
    const created = await Models.RehabAssessment.create({
      PatRegNo,
      AssessmentDate: AssessmentDate || Now,
      RiskLevel: RiskLevel || null,
      ToleranceScore:
        ToleranceScore === undefined || ToleranceScore === '' ? null : Number(ToleranceScore),
      ToleranceUnit: ToleranceUnit || null,
      Notes: Notes || null,
      CreateDate: Now,
      CreateUserId: D.UserId,
    });

    await BaseControllerHelper.CreateUserActionHistory({
      LinkObjectName: 'RehabAssessment',
      LinkObjectId: created.Id,
      Action: 'Create',
      LogedUser: req.LogedUser,
      PatientId,
      NotesMn: 'Сэргээн засахын үнэлгээ бүртгэлээ',
      Notes: 'Recorded rehabilitation assessment',
    });

    // Notes on an assessment IS the doctor's advice (tender §4.1), so a patient
    // who is not told one was written has no reason to open the screen that
    // holds it. Deep-linked to RehabAssessment rather than to the rehab tab.
    await NotificationHelper.NotifyPatient({
      PatientId,
      Action: 'RehabAssessment',
      LinkObjectName: 'RehabAssessment',
      LinkObjectId: created.Id,
      NotesMn: 'Сэргээн засахын шинэ үнэлгээ бүртгэгдлээ',
      Notes: 'A new rehabilitation assessment was recorded',
      LogedUser: req.LogedUser,
    });

    return ok(res, { Id: created.Id, PatRegNo, AssessmentDate: AssessmentDate || Now });
  } catch (ex) {
    return serverError(res, ex, 'createPatientAssessment');
  }
};

/* ------------------------------------------------------------ Мэдэгдэл */

/**
 * The doctor half of the notification centre.
 *
 * A doctor could register a device for push (below) but had nowhere to read
 * what had been sent - the four patient endpoints had no counterpart here, so
 * the app had a bell with nothing behind it.
 *
 * Addressed by ToUserId, not ToDoctorId. Both columns exist and
 * AdviceController has written both since long before this surface did
 * (:298, :373, :1474), but ToUserId is the one every producer fills and the one
 * that survives a doctor without a DoctorsProfile row. Reading it also means
 * these endpoints show the same rows as the web bell rather than a subset.
 *
 * The seen value and the row shape come from helper/NotificationHelper so this
 * cannot drift from /api/patient - see the note there.
 */
const UNREAD_WHERE = () => ({
  // Unread is "not the seen value", which includes NULL. Op.ne alone would
  // exclude NULL rows in SQL Server, and NULL is what an unread row actually
  // holds - so that would return nothing at all.
  [Op.or]: [{ Seen: null }, { Seen: { [Op.ne]: NotificationHelper.SEEN } }],
});

exports.listNotifications = async (req, res) => {
  try {
    const { limit, offset } = readPaging(req);

    const where = { ToUserId: req.Doctor.UserId };
    if (String(req.query.unread) === '1') Object.assign(where, UNREAD_WHERE());

    const { rows, count } = await Models.Notification.findAndCountAll({
      where,
      attributes: NotificationHelper.ShapeAttributes,
      order: [
        ['CreateDate', 'DESC'],
        ['Id', 'DESC'],
      ],
      limit,
      offset,
      raw: true,
    });

    return ok(res, rows.map(NotificationHelper.Shape), { total: count, limit, offset });
  } catch (ex) {
    return serverError(res, ex, 'listNotifications');
  }
};

/** The badge. Its own endpoint so the app is not paging a list to count. */
exports.unreadNotificationCount = async (req, res) => {
  try {
    const unread = await Models.Notification.count({
      where: Object.assign({ ToUserId: req.Doctor.UserId }, UNREAD_WHERE()),
    });
    return ok(res, { unread });
  } catch (ex) {
    return serverError(res, ex, 'unreadNotificationCount');
  }
};

/**
 * Ownership lives in the WHERE clause, never in a check beforehand.
 *
 * An UPDATE constrained by both Id and ToUserId either matches the caller's own
 * row or matches nothing. Zero rows becomes 404, which is the same answer an id
 * that does not exist gets - so this cannot be used to discover whether another
 * doctor's notification exists.
 */
exports.markNotificationRead = async (req, res) => {
  try {
    const Id = parseInt(req.params.id, 10);
    if (!Id) return fail(res, 'INVALID_ID', 'Буруу дугаар');

    const Now = ObjectHelper.getDateYMDHMS();
    const [count] = await Models.Notification.update(
      { Seen: NotificationHelper.SEEN, SeenDate: Now },
      { where: { Id, ToUserId: req.Doctor.UserId } }
    );

    if (!count) return fail(res, 'NOT_FOUND', 'Мэдэгдэл олдсонгүй', 404);
    return ok(res, { Id, Seen: true, SeenDate: Now });
  } catch (ex) {
    return serverError(res, ex, 'markNotificationRead');
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    const Now = ObjectHelper.getDateYMDHMS();
    const [count] = await Models.Notification.update(
      { Seen: NotificationHelper.SEEN, SeenDate: Now },
      { where: Object.assign({ ToUserId: req.Doctor.UserId }, UNREAD_WHERE()) }
    );
    return ok(res, { marked: count, SeenDate: Now });
  } catch (ex) {
    return serverError(res, ex, 'markAllNotificationsRead');
  }
};

/* ------------------------------------------------- push registration (staff) */

/**
 * The doctor side of push registration.
 *
 * Identical in shape to the patient's, and identical for a reason: one client
 * team writes both apps, and a registration flow that differs between them by
 * a field name is a bug waiting to happen. The ONLY difference is the identity
 * pair - UserType 'S' with Users.Id, rather than 'P' with Patient.id_data -
 * and that comes from the token either way.
 *
 * mobile/API.md promised these before they existed. Written 2026-09-14 to make
 * the document true.
 */
exports.registerDevice = async (req, res) => {
  try {
    const { token, platform, device_id, app_version, locale } = req.body || {};
    if (!token) return fail(res, 'TOKEN_REQUIRED', 'Төхөөрөмжийн токен дутуу байна');

    const P = String(platform || '').toLowerCase();
    if (!['android', 'ios', 'web'].includes(P)) {
      return fail(res, 'INVALID_PLATFORM', 'platform нь android, ios, web байна');
    }

    const result = await PushHelper.Register({
      UserType: 'S',
      UserId: req.Doctor.UserId,
      Token: token,
      Platform: P,
      DeviceId: device_id,
      AppVersion: app_version,
      Locale: locale,
    });

    if (!result) {
      return fail(res, 'PUSH_UNAVAILABLE', 'Мэдэгдлийн үйлчилгээ бэлэн биш байна', 503);
    }
    return ok(res, { Id: result.Id, moved: result.moved });
  } catch (ex) {
    return serverError(res, ex, 'registerDevice');
  }
};

/** POST, not DELETE /:token - see the patient equivalent for why. */
exports.unregisterDevice = async (req, res) => {
  try {
    const { token } = req.body || {};
    if (!token) return fail(res, 'TOKEN_REQUIRED', 'Төхөөрөмжийн токен дутуу байна');

    const result = await PushHelper.Unregister({
      UserType: 'S',
      UserId: req.Doctor.UserId,
      Token: token,
    });
    if (!result) {
      return fail(res, 'PUSH_UNAVAILABLE', 'Мэдэгдлийн үйлчилгээ бэлэн биш байна', 503);
    }
    return ok(res, { deactivated: result.deactivated });
  } catch (ex) {
    return serverError(res, ex, 'unregisterDevice');
  }
};

exports.listDevices = async (req, res) => {
  try {
    const rows = await PushHelper.List({ UserType: 'S', UserId: req.Doctor.UserId });
    return ok(res, rows, { total: rows.length });
  } catch (ex) {
    return serverError(res, ex, 'listDevices');
  }
};

/* ---------------------------------- ЭМД кодчилол (tender §1.6) */

/**
 * Insurance-subsidised drugs for a diagnosis.
 *
 * NOT A NEW INTEGRATION. controllers/integrations/EMDServiceController.js has
 * spoken to st.health.gov.mn for years and the web uses it today; this is the
 * same helper behind the /api/doctor conventions, because the legacy endpoint
 * is POST-for-everything, answers errors with HTTP 200, and takes PatRegNo from
 * the request BODY.
 *
 * THAT LAST POINT IS THE REASON THIS EXISTS RATHER THAN THE APP CALLING
 * /api/EMDService/getTabletByDiagnosis DIRECTLY. The upstream call is made with
 * a citizen's registration number, and taking it from the body means any
 * authenticated caller can ask the national insurance service about any
 * citizen. Here the registration number is resolved from the PATIENT ID via the
 * database, after the caller's access to that patient has been checked - so the
 * request can only ever be about somebody the doctor is entitled to see.
 *
 * ?icd10= may carry several comma-separated codes, because a prescription is
 * written against a diagnosis list. Upstream answers one code per call, so they
 * are fetched in sequence and merged, each row tagged with the code it came
 * from - the same shape the web controller produces.
 *
 * A null from the helper means the upstream call failed; it logs and returns
 * null rather than throwing. That becomes 502, not 500: the fault is not here.
 */
exports.emdDrugs = async (req, res) => {
  try {
    const D = req.Doctor;

    const PatientId = toInt(req.query.patientId);
    if (!PatientId) return fail(res, 'PATIENT_REQUIRED', 'Үйлчлүүлэгчийг заана уу');

    const May = await CareTeam.CanAccessPatient(D, PatientId);
    if (!May) return fail(res, 'NO_PATIENT_ACCESS', 'Энэ үйлчлүүлэгчид хандах эрхгүй байна', 403);

    const { Patient, PatRegNo } = await ResolvePatRegNo(PatientId);
    if (!Patient) return fail(res, 'NOT_FOUND', 'Үйлчлүүлэгч олдсонгүй', 404);
    if (!PatRegNo) {
      return fail(res, 'NO_REGISTRATION', 'Үйлчлүүлэгчийн регистрийн дугаар бүртгэгдээгүй', 409);
    }

    const codes = String(req.query.icd10 || '')
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)
      .slice(0, 10);

    if (!codes.length) return fail(res, 'ICD10_REQUIRED', 'Оношийн кодыг заана уу');

    let upstreamFailed = false;
    let drugs = [];

    for (const code of codes) {
      const r = await EMDServiceHelper.getTabletByDiagnosis(code, PatRegNo);
      if (r === null) {
        upstreamFailed = true;
        continue;
      }
      if (r && r.listTabletModel) {
        const diagCode = r.diagModel ? r.diagModel.diagCode : code;
        drugs = drugs.concat(r.listTabletModel.map((t) => Object.assign({}, t, { diagCode })));
      }
    }

    if (upstreamFailed && !drugs.length) {
      return fail(res, 'EMD_UNAVAILABLE', 'ЭМД-ын үйлчилгээнд холбогдож чадсангүй', 502);
    }

    const search = String(req.query.search || '').trim().toLowerCase();
    if (search) {
      drugs = drugs.filter((t) =>
        [t.tabletName, t.internationalName, t.tabletCode]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().indexOf(search) !== -1)
      );
    }

    return ok(res, drugs, {
      total: drugs.length,
      codes,
      // Present only when something upstream failed but other codes answered,
      // so a partial list is never mistaken for a complete one.
      ...(upstreamFailed ? { partial: true } : {}),
    });
  } catch (ex) {
    return serverError(res, ex, 'emdDrugs');
  }
};

/**
 * The insurance service catalogue.
 *
 * No patient is involved - this is the national list of covered services - so
 * unlike emdDrugs it takes no patient and performs no per-patient check. It is
 * still behind the doctor gate: it is reference data for clinicians, not a
 * public catalogue.
 *
 * The upstream call returns everything; ?search= filters here rather than
 * there, because the upstream endpoint offers no search parameter.
 */
exports.emdServices = async (req, res) => {
  try {
    const list = await EMDServiceHelper.getTablet();
    if (list === null) {
      return fail(res, 'EMD_UNAVAILABLE', 'ЭМД-ын үйлчилгээнд холбогдож чадсангүй', 502);
    }

    let rows = Array.isArray(list) ? list : list && list.listTabletModel ? list.listTabletModel : [];

    const search = String(req.query.search || '').trim().toLowerCase();
    if (search) {
      rows = rows.filter((t) =>
        Object.values(t || {})
          .filter((v) => typeof v === 'string')
          .some((v) => v.toLowerCase().indexOf(search) !== -1)
      );
    }

    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
    return ok(res, rows.slice(0, limit), { total: rows.length, limit });
  } catch (ex) {
    return serverError(res, ex, 'emdServices');
  }
};
