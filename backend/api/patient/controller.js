const { Models, Op } = require('../../config/DB');
const ObjectHelper = require('../../helper/ObjectHelper');
const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const DicoLabels = require('../../helper/DicoLabels');
const RemoteVisitFlow = require('../../helper/RemoteVisitFlow');
const MediaRef = require('../../helper/MediaRef');
const PushHelper = require('../../helper/PushHelper');

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
    const { date, time, blood_pressure, blood_pressure2, pulse, weight, inr, comment } = req.body;

    if (!date) return fail(res, 'DATE_REQUIRED', 'Огноо оруулна уу');

    // BaseCreate, not Model.create: the legacy table requires id, id_group,
    // user_mod, date_modif and rec_status (int, 9 = live) with no defaults, and
    // ModelHelper is what stamps them. A bare create failed on every save.
    // PatientScope also stamps patient_id from the session, not the body.
    const Id = await BaseControllerHelper.BaseCreate({
      ObjectName: 'PatientMonitoring',
      Data: {
        patient_id: req.Patient.PatientId,
        patient_registration: req.Patient.PatRegNo,
        date,
        time: time || null,
        // Systolic and diastolic are a pair. listJournal returns both and
        // journalSummary plots both, so a create that accepted only the
        // systolic value left the patient unable to record their own
        // diastolic pressure at all.
        blood_pressure: blood_pressure || null,
        blood_pressure2: blood_pressure2 || null,
        pulse: pulse || null,
        weight: weight || null,
        inr: inr || null,
        comment: comment || null,
      },
      LogedUser: req.LogedUser,
    });
    if (!Id) return serverError(res, new Error('BaseCreate returned no id'), 'createJournal');

    return ok(res, { id_data: Id });
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

    // Same reason as createJournal: ModelHelper stamps the legacy bookkeeping.
    const Id = await BaseControllerHelper.BaseCreate({
      ObjectName: 'VisitComments',
      Data: {
        patient_user_id: req.Patient.PatientUserId,
        patient_id: req.Patient.PatientId,
        comment,
        is_doctor: 0,
      },
      LogedUser: req.LogedUser,
    });
    if (!Id) return serverError(res, new Error('BaseCreate returned no id'), 'createQuestion');

    return ok(res, { id_data: Id });
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

/**
 * Shape one RemoteVisit row for either surface.
 *
 * MeetingUrl is returned ONLY on a scheduled visit. A join link is a bearer
 * credential for a clinical conversation - anyone holding it can walk into the
 * consultation - so it is not handed out while a request is still pending, and
 * not left reachable after the visit is over or cancelled.
 */
const shapeEvisit = (row, statusLabels) => {
  const r = row.toJSON ? row.toJSON() : row;
  const Doctor = r.Doctor || null;

  return {
    Id: r.Id,
    Comment: r.Comment,
    RequestedDate: r.RequestedDate,
    ScheduledDate: r.ScheduledDate,
    Status: r.Status,
    // null when the dico has not been seeded - the client falls back to the
    // code rather than showing nothing. See helper/DicoLabels.js.
    StatusLabel: statusLabels ? statusLabels.get(String(r.Status)) || null : null,
    DoctorId: r.DoctorId,
    DoctorName: Doctor ? [Doctor.lastname, Doctor.firstname].filter(Boolean).join(' ') : null,
    MeetingUrl: r.Status === RemoteVisitFlow.STATUS.SCHEDULED ? r.MeetingUrl || null : null,
    CreateDate: r.CreateDate,
    UpdateDate: r.UpdateDate,
  };
};

const DOCTOR_INCLUDE = {
  model: Models.DoctorsProfile,
  as: 'Doctor',
  attributes: ['id_data', 'lastname', 'firstname'],
  required: false,
};

exports.listEvisits = async (req, res) => {
  try {
    const { limit, offset } = readPaging(req);

    const where = Object.assign(
      { PatientId: req.Patient.PatientId },
      // Window on RequestedDate, which the DDL backfilled from CreateDate for
      // every pre-existing row, so the filter is safe on historical data.
      readDateRange(req, 'RequestedDate')
    );

    const { status } = req.query;
    if (status) {
      const wanted = String(status)
        .split(',')
        .map((s) => s.trim())
        .filter((s) => RemoteVisitFlow.IsStatus(s));
      if (!wanted.length) return fail(res, 'INVALID_STATUS', 'Төлөв буруу байна');
      where.Status = { [Op.in]: wanted };
    }

    // No raw:true - the Doctor include needs the association hydrated, so this
    // maps toJSON the way listQuestions does.
    const { rows, count } = await Models.RemoteVisit.findAndCountAll({
      where,
      include: [DOCTOR_INCLUDE],
      order: [['Id', 'DESC']],
      limit,
      offset,
    });

    const labels = await DicoLabels.GetLabelMap('remotevisit_status');
    return ok(res, rows.map((r) => shapeEvisit(r, labels)), { total: count, limit, offset });
  } catch (ex) {
    return serverError(res, ex, 'listEvisits');
  }
};

exports.getEvisit = async (req, res) => {
  try {
    const Id = parseInt(req.params.id, 10);
    if (!Id) return fail(res, 'INVALID_ID', 'Буруу дугаар');

    // PatientId is in the WHERE, not a check after the fact: a row that is not
    // this patient's is simply not found, which never reveals that it exists.
    const row = await Models.RemoteVisit.findOne({
      where: { Id, PatientId: req.Patient.PatientId },
      include: [DOCTOR_INCLUDE],
    });
    if (!row) return fail(res, 'NOT_FOUND', 'Хүсэлт олдсонгүй', 404);

    const labels = await DicoLabels.GetLabelMap('remotevisit_status');
    return ok(res, shapeEvisit(row, labels));
  } catch (ex) {
    return serverError(res, ex, 'getEvisit');
  }
};

/** Max open (requested or scheduled) requests one patient may hold at once. */
const MAX_OPEN_EVISITS = 3;

exports.createEvisit = async (req, res) => {
  try {
    const { Comment, RequestedDate } = req.body;
    if (!Comment || !String(Comment).trim()) {
      return fail(res, 'COMMENT_REQUIRED', 'Тайлбараа бичнэ үү');
    }

    // RequestedDate is OPTIONAL, deliberately. The Dart client already shipped
    // sending { Comment } alone (mobile/client/dart/patient_api.dart), and
    // making it required here would break an app already in the field.
    let When = null;
    if (RequestedDate) {
      const D = new Date(RequestedDate);
      if (isNaN(D.getTime())) return fail(res, 'INVALID_DATE', 'Огноо буруу байна');
      if (D.getTime() < Date.now()) {
        return fail(res, 'DATE_IN_PAST', 'Өнгөрсөн огноо сонгох боломжгүй');
      }
      When = RequestedDate;
    }

    // A per-patient cap on OPEN requests. There is no rate limiting on
    // authenticated writes, and each of these creates work for a clinician, so
    // this is the cheap version of that control. It counts open requests rather
    // than total, so a patient with a long history is never locked out.
    const OpenCount = await Models.RemoteVisit.count({
      where: {
        PatientId: req.Patient.PatientId,
        Status: { [Op.in]: RemoteVisitFlow.OPEN },
      },
    });
    if (OpenCount >= MAX_OPEN_EVISITS) {
      return fail(
        res,
        'TOO_MANY_OPEN_REQUESTS',
        'Хариу хүлээж буй хүсэлт хэт олон байна. Өмнөх хүсэлтээ хүлээнэ үү.',
        409
      );
    }

    const Now = ObjectHelper.getDateYMDHMS();
    const created = await Models.RemoteVisit.create({
      PatientId: req.Patient.PatientId,
      Comment,
      // Defaulting RequestedDate to now keeps the column populated for every
      // row, so the list's date window and the triage ordering never have to
      // special-case a null.
      RequestedDate: When || Now,
      Status: RemoteVisitFlow.STATUS.REQUESTED,
      CreateDate: Now,
      UpdateDate: Now,
    });

    const labels = await DicoLabels.GetLabelMap('remotevisit_status');
    return ok(res, {
      Id: created.Id,
      Status: RemoteVisitFlow.STATUS.REQUESTED,
      StatusLabel: labels.get(RemoteVisitFlow.STATUS.REQUESTED) || null,
      RequestedDate: When || Now,
    });
  } catch (ex) {
    return serverError(res, ex, 'createEvisit');
  }
};

/**
 * A named transition, not a generic PATCH.
 *
 * A PATCH that took { Status } would have to validate the move anyway, and it
 * would invite a client to set 'completed' on its own examination. Making the
 * legal move the URL means the only thing a patient can do is withdraw.
 *
 * No PatientHistory audit row is written here, on purpose. ModelHelper stamps
 * `id` from LogedUser.Id, and for a patient token that is a PatientUsers.Id,
 * not a Users.Id - writing it into a column that means "staff user" would mix
 * two id namespaces in an audit table. The cancellation is recorded on the row
 * itself, by Status and UpdateDate.
 */
exports.cancelEvisit = async (req, res) => {
  try {
    const Id = parseInt(req.params.id, 10);
    if (!Id) return fail(res, 'INVALID_ID', 'Буруу дугаар');

    const row = await Models.RemoteVisit.findOne({
      where: { Id, PatientId: req.Patient.PatientId },
    });
    if (!row) return fail(res, 'NOT_FOUND', 'Хүсэлт олдсонгүй', 404);

    if (!RemoteVisitFlow.CanTransition(row.Status, RemoteVisitFlow.STATUS.CANCELLED)) {
      return fail(
        res,
        'INVALID_TRANSITION',
        'Энэ хүсэлтийг цуцлах боломжгүй байна',
        409
      );
    }

    const Now = ObjectHelper.getDateYMDHMS();
    const { Reason } = req.body || {};

    await Models.RemoteVisit.update(
      {
        Status: RemoteVisitFlow.STATUS.CANCELLED,
        UpdateDate: Now,
        // Appended rather than replacing: Comment holds the patient's original
        // complaint and overwriting it would destroy the reason they asked.
        Comment: Reason
          ? String(row.Comment || '') + '\n[Цуцалсан] ' + String(Reason).slice(0, 500)
          : row.Comment,
      },
      { where: { Id, PatientId: req.Patient.PatientId } }
    );

    const labels = await DicoLabels.GetLabelMap('remotevisit_status');
    return ok(res, {
      Id,
      Status: RemoteVisitFlow.STATUS.CANCELLED,
      StatusLabel: labels.get(RemoteVisitFlow.STATUS.CANCELLED) || null,
      UpdateDate: Now,
    });
  } catch (ex) {
    return serverError(res, ex, 'cancelEvisit');
  }
};

/**
 * The option lists the app renders dropdowns from.
 *
 * This exists so the drafted, unapproved Mongolian wording lives in exactly one
 * place - the dictionary - instead of being hardcoded in the client. When ЗСҮТ
 * approve different labels it is a row edit, not an app release.
 *
 * Allowlisted, not arbitrary. The legacy /api/base/OptionTypes route would also
 * serve these, but it dumps every dictionary in the system and until today it
 * carried no authentication at all. Do not point the app at it.
 */
const PATIENT_ALLOWED_DICOS = [
  'remotevisit_status',
  'rehab_category',
  'rehab_risk',
  'rehab_phase',
];

exports.listOptions = async (req, res) => {
  try {
    const dico = String(req.params.dico || '');
    if (!PATIENT_ALLOWED_DICOS.includes(dico)) {
      return fail(res, 'DICO_NOT_ALLOWED', 'Ийм жагсаалт байхгүй', 404);
    }

    // An empty array is a valid answer: it means the dictionary has not been
    // seeded on this database yet. The client should show "not configured"
    // rather than treat it as a failure.
    const options = await DicoLabels.GetOptions(dico);
    return ok(res, options, { dico, total: options.length });
  } catch (ex) {
    return serverError(res, ex, 'listOptions');
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

    const labels = await DicoLabels.GetLabelMap('rehab_category');

    // MediaRef stays on the row verbatim for compatibility, with a parsed
    // `media` object beside it.
    //
    // CONTRACT FOR THE CLIENT: never parse MediaRef. Branch on media.kind, and
    // treat media.url === null as "no video yet" rather than as an error. Today
    // every row is null - the catalogue is 39 placeholders and filming has not
    // started - so that is the state to build against, and it is also what a
    // file-hosted video will report until the streaming route exists.
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

/* ------------------------------------------------ Мэдэгдэл (tracker row 48) */

/**
 * SEEN IS '1' OR NULL. Measured on MnCardio_test 2026-09-14 - those are the
 * only two values in the column. Nothing in this repo writes it; the nightly
 * EXEC spUpdateNotification does, and its body lives in the database rather
 * than here. The web bell reads the same column, so this must not invent a
 * third value like 'y' or 'true'.
 */
const SEEN = '1';

const shapeNotification = (r) => ({
  Id: r.Id,
  Notes: r.Notes,
  NotesMn: r.NotesMn,
  Action: r.Action,
  LinkObjectName: r.LinkObjectName,
  LinkObjectId: r.LinkObjectId,
  Url: r.Url,
  Seen: r.Seen === SEEN,
  SeenDate: r.SeenDate,
  CreateDate: r.CreateDate,
});

exports.listNotifications = async (req, res) => {
  try {
    const { limit, offset } = readPaging(req);

    const where = { ToPatientId: req.Patient.PatientId };
    if (String(req.query.unread) === '1') {
      // Unread is "not the seen value", which includes NULL. Op.ne alone would
      // exclude NULL rows in SQL Server, and NULL is what an unread row
      // actually holds - so that would return nothing at all.
      where[Op.or] = [{ Seen: null }, { Seen: { [Op.ne]: SEEN } }];
    }

    const { rows, count } = await Models.Notification.findAndCountAll({
      where,
      attributes: [
        'Id',
        'Notes',
        'NotesMn',
        'Action',
        'LinkObjectName',
        'LinkObjectId',
        'Url',
        'Seen',
        'SeenDate',
        'CreateDate',
      ],
      order: [['CreateDate', 'DESC'], ['Id', 'DESC']],
      limit,
      offset,
      raw: true,
    });

    return ok(res, rows.map(shapeNotification), { total: count, limit, offset });
  } catch (ex) {
    return serverError(res, ex, 'listNotifications');
  }
};

/** The badge. Its own endpoint so the app is not paging a list to count. */
exports.unreadNotificationCount = async (req, res) => {
  try {
    const unread = await Models.Notification.count({
      where: {
        ToPatientId: req.Patient.PatientId,
        [Op.or]: [{ Seen: null }, { Seen: { [Op.ne]: SEEN } }],
      },
    });
    return ok(res, { unread });
  } catch (ex) {
    return serverError(res, ex, 'unreadNotificationCount');
  }
};

/**
 * Ownership lives in the WHERE clause, never in a check beforehand.
 *
 * An UPDATE constrained by both Id and ToPatientId either matches the caller's
 * own row or matches nothing. Zero rows becomes 404, which is the same answer
 * an id that does not exist gets - so this cannot be used to discover whether
 * somebody else's notification exists.
 */
exports.markNotificationRead = async (req, res) => {
  try {
    const Id = parseInt(req.params.id, 10);
    if (!Id) return fail(res, 'INVALID_ID', 'Буруу дугаар');

    const Now = ObjectHelper.getDateYMDHMS();
    const [count] = await Models.Notification.update(
      { Seen: SEEN, SeenDate: Now },
      { where: { Id, ToPatientId: req.Patient.PatientId } }
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
      { Seen: SEEN, SeenDate: Now },
      {
        where: {
          ToPatientId: req.Patient.PatientId,
          [Op.or]: [{ Seen: null }, { Seen: { [Op.ne]: SEEN } }],
        },
      }
    );
    return ok(res, { marked: count, SeenDate: Now });
  } catch (ex) {
    return serverError(res, ex, 'markAllNotificationsRead');
  }
};

/* ------------------------------------------------------ push registration */

/**
 * Register this device for push.
 *
 * The identity is the token's, not the body's: UserType 'P' and the PatientId
 * from the session. A caller cannot register a token against somebody else.
 *
 * Works today with no FCM or APNs credentials - the log driver reports success,
 * so the client's registration flow is testable now. See helper/PushHelper.js.
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
      UserType: 'P',
      UserId: req.Patient.PatientId,
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

/**
 * POST .../unregister rather than DELETE /devices/:token.
 *
 * An FCM token is around 163 characters and contains ':' and '-'. Putting one
 * in a path segment is fragile through nginx and the router, and it lands in
 * access logs. Keep it in the body. Do not "tidy" this into a DELETE.
 */
exports.unregisterDevice = async (req, res) => {
  try {
    const { token } = req.body || {};
    if (!token) return fail(res, 'TOKEN_REQUIRED', 'Төхөөрөмжийн токен дутуу байна');

    const result = await PushHelper.Unregister({
      UserType: 'P',
      UserId: req.Patient.PatientId,
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

/** The caller's own devices. Never returns the token itself. */
exports.listDevices = async (req, res) => {
  try {
    const rows = await PushHelper.List({ UserType: 'P', UserId: req.Patient.PatientId });
    return ok(res, rows, { total: rows.length });
  } catch (ex) {
    return serverError(res, ex, 'listDevices');
  }
};
