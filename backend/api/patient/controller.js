const { Models, Op } = require('../../config/DB');
const ObjectHelper = require('../../helper/ObjectHelper');

/**
 * Handlers for /api/patient/*.
 *
 * Every one of these reads its patient from req.Patient, which the
 * requirePatient middleware derives from the verified token. None of them
 * accepts a patient identifier from the caller.
 *
 * Envelope is the lowercase { success, message, data } used by api/**, plus a
 * stable `code` on failures so the mobile client can branch on something other
 * than a translated string. Note the legacy controllers/** layer uses the
 * PascalCase envelope instead — the two must not be mixed (CLAUDE.md §5).
 */

const ok = (res, data, extra) =>
  res.json(Object.assign({ success: true, message: '', data }, extra || {}));

const fail = (res, code, message, status) =>
  res.status(status || 400).json({ success: false, code, message, data: null });

const serverError = (res, ex, where) => {
  console.error('[api/patient] ' + where + ':', ex);
  return res.status(500).json({
    success: false,
    code: 'SERVER_ERROR',
    message: 'Сервер дээр алдаа гарлаа',
    data: null,
  });
};

// Paging shared by every list endpoint, so the mobile client learns one shape.
const readPaging = (req) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
  return { limit, offset };
};

// Optional date window, applied to whichever column the resource dates by.
const readDateRange = (req, field) => {
  const { from, to } = req.query;
  if (!from && !to) return {};
  const range = {};
  if (from) range[Op.gte] = from;
  if (to) range[Op.lte] = to;
  return { [field]: range };
};

/* ---------------------------------------------------------------- profile */

exports.getMe = async (req, res) => {
  try {
    const patient = await Models.Patient.findByPk(req.Patient.PatientId, {
      attributes: [
        'id_data',
        'p_registration',
        'p_lastname',
        'p_firstname',
        'p_birthday',
        'p_age',
        'p_telephone',
        'p_telephone2',
        'p_workplace',
        'addr_prov_city',
        'addr_soum_dist',
        'addr_bag_khoroo',
      ],
      raw: true,
    });

    if (!patient) return fail(res, 'NOT_FOUND', 'Бүртгэл олдсонгүй', 404);

    return ok(res, patient);
  } catch (ex) {
    return serverError(res, ex, 'getMe');
  }
};

/* ------------------------------------------------- journal (Миний тэмдэглэл) */

exports.listJournal = async (req, res) => {
  try {
    const { limit, offset } = readPaging(req);
    const where = Object.assign({ patient_id: req.Patient.PatientId }, readDateRange(req, 'date'));

    const { rows, count } = await Models.PatientMonitoring.findAndCountAll({
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
      order: [
        ['date', 'DESC'],
        ['id_data', 'DESC'],
      ],
      limit,
      offset,
      raw: true,
    });

    return ok(res, rows, { total: count, limit, offset });
  } catch (ex) {
    return serverError(res, ex, 'listJournal');
  }
};

exports.createJournal = async (req, res) => {
  try {
    const { date, time, blood_pressure, pulse, weight, inr, comment } = req.body;

    if (!date) return fail(res, 'DATE_REQUIRED', 'Огноо оруулна уу');

    const created = await Models.PatientMonitoring.create({
      // Ownership is stamped from the session, not the body.
      patient_id: req.Patient.PatientId,
      patient_registration: req.Patient.PatRegNo,
      date,
      time: time || null,
      blood_pressure: blood_pressure || null,
      pulse: pulse || null,
      weight: weight || null,
      inr: inr || null,
      comment: comment || null,
      date_creation: ObjectHelper.getDateYMDHMS(),
      // rec_status is an INTEGER column and Sequelize validates it: 'A' throws
      // SequelizeValidationError before the INSERT ever runs. The schema's
      // values are numeric - 1 active, 2 deleted, 9 draft - and every read
      // filters `rec_status <> '2'`.
      rec_status: 1,
    });

    return ok(res, { id_data: created.id_data });
  } catch (ex) {
    return serverError(res, ex, 'createJournal');
  }
};

/**
 * The tracker's acceptance for Миний тэмдэглэл is explicit that entries must
 * render as a chart, so the series is produced server-side and the client just
 * plots it. Ordered ascending because that is chart order, not list order.
 */
exports.journalSummary = async (req, res) => {
  try {
    const where = Object.assign({ patient_id: req.Patient.PatientId }, readDateRange(req, 'date'));

    const rows = await Models.PatientMonitoring.findAll({
      where,
      attributes: ['date', 'blood_pressure', 'blood_pressure2', 'pulse', 'weight'],
      order: [['date', 'ASC']],
      limit: 365,
      raw: true,
    });

    return ok(res, {
      labels: rows.map((r) => r.date),
      series: {
        // Systolic and diastolic as a pair - a blood-pressure chart with only
        // one of them is not a blood-pressure chart.
        blood_pressure: rows.map((r) => r.blood_pressure),
        blood_pressure2: rows.map((r) => r.blood_pressure2),
        pulse: rows.map((r) => r.pulse),
        weight: rows.map((r) => r.weight),
      },
    });
  } catch (ex) {
    return serverError(res, ex, 'journalSummary');
  }
};

/* ------------------------------------------ questions (Эмчээс асуух асуулт) */

exports.listQuestions = async (req, res) => {
  try {
    const { limit, offset } = readPaging(req);

    // Scope by the patient the thread is ABOUT, not by who wrote each line.
    // Doctor replies carry patient_id + user_id and no patient_user_id, so
    // filtering on the authoring account hid every reply from the patient.
    const { rows, count } = await Models.VisitComments.findAndCountAll({
      where: { patient_id: req.Patient.PatientId },
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
    return serverError(res, ex, 'listQuestions');
  }
};

exports.createQuestion = async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment || !String(comment).trim()) {
      return fail(res, 'COMMENT_REQUIRED', 'Асуултаа бичнэ үү');
    }

    const created = await Models.VisitComments.create({
      patient_user_id: req.Patient.PatientUserId,
      patient_id: req.Patient.PatientId,
      comment,
      is_doctor: '0',
      date_creation: ObjectHelper.getDateYMDHMS(),
      // rec_status is an INTEGER column and Sequelize validates it: 'A' throws
      // SequelizeValidationError before the INSERT ever runs. The schema's
      // values are numeric - 1 active, 2 deleted, 9 draft - and every read
      // filters `rec_status <> '2'`.
      rec_status: 1,
    });

    return ok(res, { id_data: created.id_data });
  } catch (ex) {
    return serverError(res, ex, 'createQuestion');
  }
};

/* ------------------------------------------------ advice (Эмчийн зөвлөгөө) */

/**
 * Module 2.4 is "view the advice received from the doctor", and the advice text
 * itself lives in AdviceComment - the Advice row is only the ticket shell. So
 * the thread comes back with its comments attached, newest ticket first and
 * comments in the order they were written.
 *
 * The acceptance criterion also requires advice to arrive *with a notification*;
 * that half needs a patient recipient column on Notification, which does not
 * exist yet.
 */
exports.listAdvice = async (req, res) => {
  try {
    const { limit, offset } = readPaging(req);

    const { rows, count } = await Models.Advice.findAndCountAll({
      where: { adv_id_patient: req.Patient.PatientId },
      attributes: ['id_data', 'Body', 'ticket_type', 'adv_ticket_closed', 'date_creation'],
      include: [
        {
          model: Models.AdviceComment,
          as: 'AdviceComment',
          attributes: ['id_data', 'adv_com_comment', 'date_creation'],
          required: false,
        },
      ],
      order: [
        ['id_data', 'DESC'],
        [{ model: Models.AdviceComment, as: 'AdviceComment' }, 'id_data', 'ASC'],
      ],
      limit,
      offset,
      // Not raw: the include has to hydrate into a nested array.
      subQuery: false,
    });

    const data = rows.map((r) => {
      const row = r.toJSON();
      return {
        id_data: row.id_data,
        body: row.Body,
        ticket_type: row.ticket_type,
        closed: row.adv_ticket_closed,
        date: row.date_creation,
        comments: (row.AdviceComment || []).map((c) => ({
          id_data: c.id_data,
          comment: c.adv_com_comment,
          date: c.date_creation,
        })),
      };
    });

    return ok(res, data, { total: count, limit, offset });
  } catch (ex) {
    return serverError(res, ex, 'listAdvice');
  }
};

/* ------------------------------------------------- e-visits (Цахим үзлэг) */

exports.listEvisits = async (req, res) => {
  try {
    const { limit, offset } = readPaging(req);

    const { rows, count } = await Models.RemoteVisit.findAndCountAll({
      where: { PatientId: req.Patient.PatientId },
      attributes: ['Id', 'Comment', 'CreateDate'],
      order: [['Id', 'DESC']],
      limit,
      offset,
      raw: true,
    });

    return ok(res, rows, { total: count, limit, offset });
  } catch (ex) {
    return serverError(res, ex, 'listEvisits');
  }
};

exports.createEvisit = async (req, res) => {
  try {
    const { Comment } = req.body;
    if (!Comment || !String(Comment).trim()) {
      return fail(res, 'COMMENT_REQUIRED', 'Тайлбараа бичнэ үү');
    }

    const created = await Models.RemoteVisit.create({
      PatientId: req.Patient.PatientId,
      Comment,
      CreateDate: ObjectHelper.getDateYMDHMS(),
    });

    return ok(res, { Id: created.Id });
  } catch (ex) {
    return serverError(res, ex, 'createEvisit');
  }
};

/* ------------------------------------------------ risk (Эрсдэл үнэлгээ ЗСӨ) */

/**
 * The patient's own latest self-entered inputs. The scoring methodology itself
 * is tracker item #38 and is owned by ЗСҮТ — until it is approved, this returns
 * the inputs and the last stored body-size/history rows rather than inventing a
 * classification.
 */
exports.getRisk = async (req, res) => {
  try {
    const PatRegNo = req.Patient.PatRegNo;
    if (!PatRegNo) return ok(res, { bodySize: null, history: null });

    const [bodySize, history] = await Promise.all([
      Models.PatientBodySize.findOne({
        where: { PatRegNo },
        order: [['Id', 'DESC']],
        raw: true,
      }),
      Models.PatientOwnHistory.findOne({
        where: { PatRegNo },
        order: [['Id', 'DESC']],
        raw: true,
      }),
    ]);

    return ok(res, { bodySize: bodySize || null, history: history || null });
  } catch (ex) {
    return serverError(res, ex, 'getRisk');
  }
};

/* ------------------------------- rehabilitation (Сэргээн засах, module 2.7) */

/**
 * The exercise catalogue. Shared content, not patient data, so it is not
 * scoped - but it is still behind requirePatient so it is not public.
 *
 * The 39 videos themselves are blocked: filming depends on tracker #54 (ЗСҮТ
 * supply the rehabilitation doctors) and there is no video delivery path - the
 * file layer serves attachments over POST with Content-Disposition: attachment,
 * which no <video> element can use. MediaRef is carried through so the client
 * can render whatever ends up being decided.
 */
exports.listExercises = async (req, res) => {
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

    return ok(res, rows, { total: rows.length });
  } catch (ex) {
    return serverError(res, ex, 'listExercises');
  }
};

/**
 * What this patient has completed, so the catalogue can show progress.
 */
exports.listRehabProgress = async (req, res) => {
  try {
    const { limit, offset } = readPaging(req);
    const where = Object.assign(
      { PatRegNo: req.Patient.PatRegNo },
      readDateRange(req, 'CompletedAt')
    );

    const { rows, count } = await Models.RehabProgress.findAndCountAll({
      where,
      attributes: ['Id', 'ExerciseId', 'CompletedAt', 'DurationSec', 'Notes'],
      order: [['CompletedAt', 'DESC']],
      limit,
      offset,
      raw: true,
    });

    return ok(res, rows, { total: count, limit, offset });
  } catch (ex) {
    return serverError(res, ex, 'listRehabProgress');
  }
};

/**
 * Tracker #56: "Дасгал үзэх, гүйцэтгэлээ тэмдэглэх" - the patient marks their
 * own completion.
 */
exports.createRehabProgress = async (req, res) => {
  try {
    const { ExerciseId, DurationSec, Notes } = req.body;
    if (!ExerciseId) {
      return fail(res, 'EXERCISE_REQUIRED', 'Дасгал сонгоно уу');
    }

    const created = await Models.RehabProgress.create({
      PatRegNo: req.Patient.PatRegNo,
      ExerciseId,
      CompletedAt: ObjectHelper.getDateYMDHMS(),
      DurationSec: DurationSec || null,
      Notes: Notes || null,
      CreateDate: ObjectHelper.getDateYMDHMS(),
    });

    return ok(res, { Id: created.Id });
  } catch (ex) {
    return serverError(res, ex, 'createRehabProgress');
  }
};

/**
 * Tracker #51: vital signs around a session. Acceptance is a chart, so the
 * series is shaped here the same way the daily journal's is.
 */
exports.listRehabVitals = async (req, res) => {
  try {
    const where = Object.assign(
      { PatRegNo: req.Patient.PatRegNo },
      readDateRange(req, 'MeasuredAt')
    );

    const rows = await Models.RehabVitalSign.findAll({
      where,
      attributes: ['Id', 'MeasuredAt', 'Phase', 'Pulse', 'BloodPressure', 'Spo2', 'Borg'],
      order: [['MeasuredAt', 'ASC']],
      limit: 365,
      raw: true,
    });

    return ok(res, {
      rows,
      labels: rows.map((r) => r.MeasuredAt),
      series: {
        pulse: rows.map((r) => r.Pulse),
        spo2: rows.map((r) => r.Spo2),
      },
    });
  } catch (ex) {
    return serverError(res, ex, 'listRehabVitals');
  }
};

exports.createRehabVital = async (req, res) => {
  try {
    const { ExerciseId, Phase, Pulse, BloodPressure, Spo2, Borg, Notes } = req.body;

    const created = await Models.RehabVitalSign.create({
      PatRegNo: req.Patient.PatRegNo,
      ExerciseId: ExerciseId || null,
      MeasuredAt: ObjectHelper.getDateYMDHMS(),
      Phase: Phase || null,
      Pulse: Pulse || null,
      BloodPressure: BloodPressure || null,
      Spo2: Spo2 || null,
      Borg: Borg || null,
      Notes: Notes || null,
      CreateDate: ObjectHelper.getDateYMDHMS(),
    });

    return ok(res, { Id: created.Id });
  } catch (ex) {
    return serverError(res, ex, 'createRehabVital');
  }
};

/**
 * Tracker #50: the latest risk / exercise-tolerance assessment. Read-only for
 * the patient - a clinician records it, and the scoring methodology is still a
 * ЗСҮТ deliverable, so nothing is computed here.
 */
exports.getRehabAssessment = async (req, res) => {
  try {
    const row = await Models.RehabAssessment.findOne({
      where: { PatRegNo: req.Patient.PatRegNo },
      order: [['AssessmentDate', 'DESC']],
      raw: true,
    });

    return ok(res, row || null);
  } catch (ex) {
    return serverError(res, ex, 'getRehabAssessment');
  }
};
