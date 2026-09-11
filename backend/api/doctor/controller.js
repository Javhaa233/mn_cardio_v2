const { Models, Op } = require('../../config/DB');
const ObjectHelper = require('../../helper/ObjectHelper');
const BaseControllerHelper = require('../../helper/BaseControllerHelper');

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

    return ok(res, JSON.parse(JSON.stringify(visit)));
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
