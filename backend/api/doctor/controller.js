const { Models, Op } = require('../../config/DB');
const ObjectHelper = require('../../helper/ObjectHelper');
const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const AccessAudit = require('../../helper/AccessAudit');
const CareTeam = require('../../helper/CareTeam');
const DicoLabels = require('../../helper/DicoLabels');
const RemoteVisitFlow = require('../../helper/RemoteVisitFlow');
const MediaRef = require('../../helper/MediaRef');

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

    return ok(res, {
      UserId: D.UserId,
      DoctorId: D.DoctorId,
      RoleId: D.RoleId,
      IsAdmin: D.IsAdmin,
      FullName: D.FullName,
      profile,
      organization,
    });
  } catch (ex) {
    return serverError(res, ex, 'getMe');
  }
};

/* ------------------------------------------- 28 Миний үзлэгүүд (my exams) */

/**
 * ?scope=mine (default) lists the examinations this user recorded;
 * ?scope=organization lists the whole organisation's, including children.
 *
 * `Visit.id` is the creating USER, not a foreign key to DoctorsProfile - the
 * same column BaseControllerHelper calls "the creating USER" where it scopes
 * the АМ-1Б register. Filtering on it is what makes "mine" mean mine.
 */
exports.listVisits = async (req, res) => {
  try {
    const D = req.Doctor;
    const { limit, offset } = readPaging(req);
    const scope = req.query.scope === 'organization' ? 'organization' : 'mine';

    const where = Object.assign({}, readDateRange(req, 'visit_date'));

    if (scope === 'mine') {
      where.id = D.UserId;
    } else {
      const orgIds = await OrganizationIds(D);
      if (orgIds) where.OrganizationId = { [Op.in]: orgIds };
    }

    const search = (req.query.search || '').trim();
    const include = [PATIENT_INCLUDE];
    if (search) {
      include[0] = Object.assign({}, PATIENT_INCLUDE, {
        required: true,
        where: {
          [Op.or]: [
            { p_registration: { [Op.like]: '%' + search + '%' } },
            { p_lastname: { [Op.like]: '%' + search + '%' } },
            { p_firstname: { [Op.like]: '%' + search + '%' } },
          ],
        },
      });
    }

    const { rows, count } = await Models.Visit.findAndCountAll({
      where,
      include,
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

    const comment = String(req.body.comment || '').trim();
    if (!comment) return fail(res, 'COMMENT_REQUIRED', 'Хариултаа бичнэ үү');

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

    return ok(res, { id_data: Id });
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
    if (search.length < 3) {
      return fail(res, 'SEARCH_TOO_SHORT', 'Хайлтын утга 3-аас доошгүй тэмдэгт байна');
    }

    const { rows, count } = await Models.Patient.findAndCountAll({
      where: {
        [Op.or]: [
          { p_registration: { [Op.like]: '%' + search + '%' } },
          { p_lastname: { [Op.like]: '%' + search + '%' } },
          { p_firstname: { [Op.like]: '%' + search + '%' } },
        ],
      },
      attributes: PATIENT_ATTRS,
      order: [['id_data', 'DESC']],
      limit,
      offset,
      raw: true,
    });

    return ok(res, rows, { total: count, limit, offset });
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

    const { status } = req.query;
    if (status) {
      const wanted = String(status)
        .split(',')
        .map((s) => s.trim())
        .filter((s) => RemoteVisitFlow.IsStatus(s));
      if (!wanted.length) return fail(res, 'INVALID_STATUS', 'Төлөв буруу байна');
      where.Status = { [Op.in]: wanted };
    } else {
      // Default to what still needs doing. A triage queue full of completed
      // visits is not a queue.
      where.Status = { [Op.in]: RemoteVisitFlow.OPEN };
    }

    if (scope === 'mine') {
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
        media: MediaRef.Parse(r.MediaRef),
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

    return ok(res, { Id: created.Id, PatRegNo, AssessmentDate: AssessmentDate || Now });
  } catch (ex) {
    return serverError(res, ex, 'createPatientAssessment');
  }
};
