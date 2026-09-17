const express = require('express');
const router = express.Router();

const { Models, Op, sequelize } = require('../../config/DB');
const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const PrintHelper = require('../../helper/PrintHelper');
const TenderFormReport = require('../../reports/TenderForm');

// -----------------------------------------------------------------------------
// Tender phase 4 forms (Цахим маягт, модуль хөгжүүлэлт).
//
// One controller serves all 14 forms. The field dictionary in TenderFormField
// describes each form; answers are stored as JSON in TenderFormData.Data keyed
// by FieldCode. Nothing here is form-specific.
//
// GetConfig returns the same { Fields, NewObject, TitleObject, PK } shape that
// /BaseObject/getData returns for a ModelConfig-backed object, so the existing
// BaseCustomForm + GetConfigField + BaseRadio/BaseTextField stack renders it
// with no frontend changes.
// -----------------------------------------------------------------------------

router.post('/GetConfig', GetConfig);
router.post('/GetData', GetData);
router.post('/GetList', GetList);
router.post('/GetPrevious', GetPrevious);
router.post('/CustomSave', CustomSave);
router.post('/Confirm', Confirm);
router.post('/Delete', Delete);
router.post('/PrintHtml', PrintHtml);
router.post('/PrintReport', PrintReport);

const { IsVisible, IsEmpty } = require('../../helper/TenderFormVisibility');

const Fail = (Message) => ({ Success: false, Message: Message || 'Алдаа гарлаа', Data: null });

const LOCKED_MESSAGE = 'Баталгаажсан бүртгэлийг засах боломжгүй. Шинэ бүртгэл үүсгэнэ үү.';

const IsAdmin = (LogedUser) => String((LogedUser || {}).RoleId) === '1';

/**
 * Organizations the caller acts for. verifyToken hydrates both the user row and
 * the linked doctor profile, and existing records were stamped from
 * LogedUser.OrganizationId, so a match on either one is ownership.
 */
function CallerOrganizations(LogedUser) {
  const u = LogedUser || {};
  return [u.OrganizationId, u.Doctor && u.Doctor.OrganizationId]
    .filter((v) => v !== undefined && v !== null && v !== '')
    .map(String);
}

/**
 * The record, if this caller may change it. Every write goes through here.
 *
 * - Another organization's record is refused unless the caller is an admin
 *   (role 1). Reads stay open: the access matrix (tracker #7) is ЗСҮТ's to
 *   approve, and a returning patient's earlier record is clinically relevant.
 * - A confirmed record is refused, admin or not. Tender appendix 3.1
 *   (L8599-8605): a completed registry "is completed, saved and cannot be
 *   edited". There is no unlock. A repeat procedure is a NEW record, which is
 *   offered a copy of the previous one (GetPrevious).
 */
async function LoadWritable(Id, LogedUser, transaction) {
  const Row = await Models.TenderFormData.findOne({ where: { Id }, transaction });
  if (!Row || Row.rec_status === 2) return { Error: 'Бүртгэл олдсонгүй' };
  if (!IsAdmin(LogedUser) && Row.OrganizationId !== null && Row.OrganizationId !== undefined) {
    if (!CallerOrganizations(LogedUser).includes(String(Row.OrganizationId))) {
      return { Error: 'Өөр байгууллагын бүртгэлийг өөрчлөх эрхгүй' };
    }
  }
  if (Row.Status === 1) return { Error: LOCKED_MESSAGE, Locked: true, Row };
  return { Row };
}

/**
 * Why an answer does not fit its field's type, or null.
 *
 * Save stays partial - doctors fill these forms a section at a time - but what
 * IS sent must be the right kind of value. Otherwise the generated per-form
 * views CAST it to NULL and it silently drops out of every search and export.
 */
function TypeProblem(FieldType, Value) {
  if (IsEmpty(Value)) return null;
  if (FieldType === 'Number') {
    const n = Number(String(Value).replace(',', '.').trim());
    return Number.isFinite(n) ? null : 'тоо биш';
  }
  if (FieldType === 'Date' || FieldType === 'DateTime') {
    return Number.isNaN(Date.parse(String(Value))) ? 'огноо биш' : null;
  }
  return null;
}

/** Audit trail for the acts that change a record's standing. Never fails the request. */
async function Audit(LogedUser, Id, Action, Notes, NotesMn) {
  try {
    await BaseControllerHelper.CreateUserActionHistory({
      LinkObjectName: 'TenderFormData',
      LinkObjectId: Id,
      Action,
      Notes,
      NotesMn,
      LogedUser,
    });
  } catch (ex) {
    console.error('[TenderForm/Audit] could not record', Action, 'on', Id, '-', ex.message);
  }
}

// Cache option lists per dico for the lifetime of one request batch.
async function LoadOptions(OptionTypes) {
  const Result = {};
  const Codes = [...new Set(OptionTypes.filter(Boolean))];
  if (Codes.length === 0) return Result;

  const Rows = await Models.OptionTypes.findAll({
    where: { dico: { [Op.in]: Codes } },
    order: [['pos', 'ASC']],
    raw: true,
  });
  Rows.forEach((r) => {
    if (!Result[r.dico]) Result[r.dico] = [];
    Result[r.dico].push({ Label: r.label, Value: r.value });
  });
  return Result;
}

// Turn dictionary rows into the Fields shape the frontend already understands.
function BuildFields(Rows, Options) {
  return Rows.map((f) => {
    const Field = {
      Name: f.FieldCode,
      Label: f.LabelMn,
      Type: f.FieldType,
      Position: f.Position,
      md: f.Md || 12,
      Required: !!f.IsRequired,
      // extras the tender forms need, ignored by controls that do not use them
      SectionCode: f.SectionCode,
      SectionLabel: f.SectionLabel,
      SectionPos: f.SectionPos,
      ParentField: f.ParentField,
      ParentValue: f.ParentValue,
      Unit: f.Unit,
      HelpText: f.HelpTextMn,
      // drives which fields the list grid shows as columns
      IsSearchable: !!f.IsSearchable,
      // optional per-section print override; undefined until the column exists
      PrintLayout: f.PrintLayout || null,
    };
    // a repeating grid: its column definition lives on the dictionary row
    if (f.FieldType === 'Table') {
      try {
        Field.TableColumns = f.TableConfig ? JSON.parse(f.TableConfig) : [];
      } catch (e) {
        console.error('[TenderForm] bad TableConfig on', f.FormCode, f.FieldCode);
        Field.TableColumns = [];
      }
      Field.TableRows = f.TableRows || null;
    }
    if (f.OptionType) {
      Field.OptionType = f.OptionType;
      Field.Config = { IdField: 'Value', TextField: 'Label' };
      Field.Data = Options[f.OptionType] || [];
    }
    return Field;
  });
}

async function GetConfig(req, res) {
  try {
    const FormCode = req.body.FormCode;
    if (!FormCode) return res.send(Fail('Маягтын код шаардлагатай'));

    const Form = await Models.TenderForm.findOne({ where: { FormCode }, raw: true });
    if (!Form) return res.send(Fail('Маягт олдсонгүй: ' + FormCode));

    const Rows = await Models.TenderFormField.findAll({
      where: { FormCode, IsActive: true },
      order: [
        ['SectionPos', 'ASC'],
        ['Position', 'ASC'],
      ],
      raw: true,
    });

    const Options = await LoadOptions(Rows.map((r) => r.OptionType));
    const Fields = BuildFields(Rows, Options);

    // sections, in order, so the form can lay out GroupPanels without regrouping
    const Sections = [];
    Rows.forEach((r) => {
      if (!Sections.find((s) => s.Code === r.SectionCode)) {
        Sections.push({ Code: r.SectionCode, Label: r.SectionLabel, Pos: r.SectionPos });
      }
    });

    return res.send({
      Success: true,
      Message: '',
      Data: {
        FormCode: Form.FormCode,
        FormVersion: Form.Version,
        AllowDuplicate: !!Form.AllowDuplicate,
        Fields: [Fields], // nested once, matching ModelConfig's Fields shape
        Sections,
        NewObject: {},
        PK: 'Id',
        TitleObject: {
          Title: Form.NameMn,
          NewObjectTitle: Form.NameMn,
          EditObjectTitle: Form.NameMn,
        },
      },
    });
  } catch (ex) {
    console.error('[TenderForm/GetConfig]', ex);
    return res.send(Fail());
  }
}

// Latest instance for a patient, or a specific one by Id.
async function GetData(req, res) {
  try {
    const { FormCode, PatRegNo, Id } = req.body;
    if (!Id && (!FormCode || !PatRegNo))
      return res.send(Fail('Маягтын код ба регистрийн дугаар шаардлагатай'));

    const Where = Id ? { Id } : { FormCode, PatRegNo, rec_status: { [Op.ne]: 2 } };

    const Row = await Models.TenderFormData.findOne({
      where: Where,
      order: [
        ['FormDate', 'DESC'],
        ['Id', 'DESC'],
      ],
      raw: true,
    });

    if (!Row) return res.send({ Success: true, Message: '', Data: null });

    let Answers = {};
    try {
      Answers = JSON.parse(Row.Data || '{}');
    } catch (e) {
      console.error('[TenderForm/GetData] unparseable Data on row', Row.Id);
    }

    // flatten the answers alongside the row so GetConfigField finds them by name
    return res.send({
      Success: true,
      Message: '',
      Data: { ...Answers, ...Row, Data: undefined },
    });
  } catch (ex) {
    console.error('[TenderForm/GetData]', ex);
    return res.send(Fail());
  }
}

/**
 * The patient's previous instance of this form, returned as answers ONLY -
 * no Id, no dates, no identity. Appendix 3.1 asks that a returning patient can
 * have the previous record duplicated; dropping the identity is what makes the
 * copy save as a new instance rather than overwriting the old one.
 *
 * What belongs to the earlier EPISODE stays with it: every Date/DateTime
 * field, every field whose code names a date or a time (3.1 keeps its times
 * as text - Time1stQualifyingECG, PainBeginingTime), and the identity fields
 * the dictionary marks required (the case number and principal date of each
 * form). Copying those would file the new procedure under the old admission.
 *
 * `ExcludeId` lets the caller ignore an instance it is already editing.
 */
async function GetPrevious(req, res) {
  try {
    const { FormCode, PatRegNo, ExcludeId } = req.body;
    if (!FormCode || !PatRegNo)
      return res.send(Fail('Маягтын код ба регистрийн дугаар шаардлагатай'));

    const Where = { FormCode, PatRegNo, rec_status: { [Op.ne]: 2 } };
    if (ExcludeId) Where.Id = { [Op.ne]: ExcludeId };

    const Row = await Models.TenderFormData.findOne({
      where: Where,
      order: [
        ['FormDate', 'DESC'],
        ['Id', 'DESC'],
      ],
      raw: true,
    });
    if (!Row) return res.send({ Success: true, Message: '', Data: null });

    let Answers = {};
    try {
      Answers = JSON.parse(Row.Data || '{}');
    } catch (e) {
      console.error('[TenderForm/GetPrevious] unparseable Data on row', Row.Id);
      return res.send({ Success: true, Message: '', Data: null });
    }

    const Dictionary = await Models.TenderFormField.findAll({
      where: { FormCode },
      attributes: ['FieldCode', 'FieldType', 'IsRequired'],
      raw: true,
    });
    const EpisodeBound = new Set(
      Dictionary.filter(
        (f) =>
          f.FieldType === 'Date' ||
          f.FieldType === 'DateTime' ||
          !!f.IsRequired ||
          /Date|Time/.test(f.FieldCode)
      ).map((f) => f.FieldCode)
    );
    Object.keys(Answers).forEach((k) => {
      if (EpisodeBound.has(k) || IsEmpty(Answers[k])) delete Answers[k];
    });

    return res.send({
      Success: true,
      Message: '',
      Data: {
        Answers,
        PreviousDate: Row.FormDate,
        PreviousStatus: Row.Status,
        OrganizationName: await GetOrganizationName(Row.OrganizationId),
        FieldCount: Object.keys(Answers).length,
      },
    });
  } catch (ex) {
    console.error('[TenderForm/GetPrevious]', ex);
    return res.send(Fail());
  }
}

/**
 * Everything the A4 sheet needs, in one place.
 *
 * Reuses LoadOptions/BuildFields so the printed sheet is built from exactly the
 * dictionary the editor renders - the whole point of the generic form engine.
 *
 * `Blank` skips the record lookup entirely: an empty form is printable for a
 * patient who has none yet, which is how the paper form is used at the bedside.
 */
async function BuildPrintModel({ FormCode, Id, PatRegNo, Blank }) {
  let Row = null;
  if (!Blank) {
    const Where = Id ? { Id } : { FormCode, PatRegNo, rec_status: { [Op.ne]: 2 } };
    Row = await Models.TenderFormData.findOne({
      where: Where,
      order: [
        ['FormDate', 'DESC'],
        ['Id', 'DESC'],
      ],
      raw: true,
    });
    if (!Row && !FormCode) return null;
  }

  const Code = FormCode || (Row && Row.FormCode);
  if (!Code) return null;

  const Form = await Models.TenderForm.findOne({ where: { FormCode: Code }, raw: true });
  if (!Form) return null;

  const Rows = await Models.TenderFormField.findAll({
    where: { FormCode: Code, IsActive: true },
    order: [
      ['SectionPos', 'ASC'],
      ['Position', 'ASC'],
    ],
    raw: true,
  });

  const Options = await LoadOptions(Rows.map((r) => r.OptionType));
  const Fields = BuildFields(Rows, Options);

  const Sections = [];
  Rows.forEach((r) => {
    if (!Sections.find((s) => s.Code === r.SectionCode)) {
      Sections.push({ Code: r.SectionCode, Label: r.SectionLabel, Pos: r.SectionPos });
    }
  });

  let Answers = {};
  if (Row) {
    try {
      Answers = JSON.parse(Row.Data || '{}');
    } catch (e) {
      console.error('[TenderForm/Print] unparseable Data on row', Row.Id);
    }
  }

  const Reg = (Row && Row.PatRegNo) || PatRegNo;
  const Patient = Reg
    ? await Models.Patient.findOne({
        where: { p_registration: Reg },
        attributes: ['id_data', 'p_lastname', 'p_firstname', 'p_registration'],
        raw: true,
      })
    : null;

  return { Form, Sections, Fields, Answers, Patient, Row };
}

/** Organization name for the provenance footer. */
async function GetOrganizationName(OrganizationId) {
  if (!OrganizationId) return null;
  try {
    const Org = await Models.Organization.findByPk(OrganizationId, {
      attributes: ['Id', 'Name'],
      raw: true,
    });
    return Org ? Org.Name : null;
  } catch (ex) {
    console.error('[TenderForm/Print] failed to read organization:', ex);
    return null;
  }
}

async function BuildSheet(req) {
  const { FormCode, Id, PatRegNo } = req.body;
  const Blank = req.body.Blank === true || req.body.Blank === 'true';
  const LogedUser = req.LogedUser || {};

  const Model = await BuildPrintModel({ FormCode, Id, PatRegNo, Blank });
  if (!Model) return null;

  const OrganizationId =
    (Model.Row && Model.Row.OrganizationId) ||
    (LogedUser.Doctor && LogedUser.Doctor.OrganizationId) ||
    LogedUser.OrganizationId;

  const OrganizationName = await GetOrganizationName(OrganizationId);

  const Html = TenderFormReport(
    Model.Form,
    Model.Sections,
    Model.Fields,
    Model.Answers,
    Model.Patient,
    {
      Blank,
      Status: Model.Row ? Model.Row.Status : null,
      OrganizationName,
      // The paper masters carry no letterhead, and the acceptance criterion is
      // structural identity with them, so the logo stays off unless asked for.
      ShowLetterhead: false,
      Logo: null,
    }
  );

  return { Html, Model, Blank, OrganizationName, LogedUser };
}

/**
 * The sheet as HTML, for the on-screen preview.
 *
 * The preview and the PDF come from this same generator, so what the doctor
 * checks on screen is what comes out of the printer.
 */
async function PrintHtml(req, res) {
  try {
    const Sheet = await BuildSheet(req);
    if (!Sheet) return res.send(Fail('Маягт эсвэл бүртгэл олдсонгүй'));

    return res.send({ Success: true, Message: '', Data: { Html: Sheet.Html } });
  } catch (ex) {
    console.error('[TenderForm/PrintHtml]', ex);
    return res.send(Fail());
  }
}

/** The same sheet as an A4 PDF. */
async function PrintReport(req, res) {
  try {
    const Sheet = await BuildSheet(req);
    if (!Sheet) return res.send(Fail('Маягт эсвэл бүртгэл олдсонгүй'));

    const { Model, Blank, OrganizationName, LogedUser } = Sheet;
    const Code = Model.Form.FormCode.replace(/[^A-Za-z0-9]/g, '_');

    return await PrintHelper.SendPdf({
      res,
      html: Sheet.Html,
      namePrefix: 'TenderForm_' + Code,
      downloadName: `${Model.Form.FormCode}${Blank ? '-хоосон' : ''}.pdf`,
      footer: PrintHelper.BuildFooter({
        OrganizationName,
        PrintedBy: LogedUser.UserName || LogedUser.Name || null,
        GeneratedAt: new Date().toLocaleString('mn-MN'),
      }),
    });
  } catch (ex) {
    console.error('[TenderForm/PrintReport]', ex);
    return res.send(Fail(ex.message));
  }
}

// All instances of a form for one patient, newest first.
async function GetList(req, res) {
  try {
    const { FormCode, PatRegNo } = req.body;
    if (!FormCode) return res.send(Fail('Маягтын код шаардлагатай'));

    const Where = { FormCode, rec_status: { [Op.ne]: 2 } };
    if (PatRegNo) Where.PatRegNo = PatRegNo;

    const Rows = await Models.TenderFormData.findAll({
      where: Where,
      attributes: ['Id', 'FormCode', 'PatRegNo', 'FormDate', 'Status', 'CreateDate'],
      order: [
        ['FormDate', 'DESC'],
        ['Id', 'DESC'],
      ],
      raw: true,
    });
    return res.send({ Success: true, Message: '', Data: Rows });
  } catch (ex) {
    console.error('[TenderForm/GetList]', ex);
    return res.send(Fail());
  }
}

// Create or update one instance. Only changed fields arrive, so existing answers
// are merged rather than replaced.
async function CustomSave(req, res) {
  const t = await sequelize.transaction();
  try {
    const { FormCode, PatRegNo, Id, FormDate, PatientId, VisitId, SurgeryId } = req.body;
    const LogedUser = req.LogedUser || {};

    if (!FormCode || (!Id && !PatRegNo)) {
      await t.rollback();
      return res.send(Fail('Маягтын код ба регистрийн дугаар шаардлагатай'));
    }

    let Modified = {};
    try {
      Modified =
        typeof req.body.Data === 'string' ? JSON.parse(req.body.Data) : req.body.Data || {};
    } catch (e) {
      await t.rollback();
      return res.send(Fail('Өгөгдлийн бүтэц буруу байна'));
    }

    // only accept keys the dictionary knows about
    const Dictionary = await Models.TenderFormField.findAll({
      where: { FormCode, IsActive: true },
      attributes: ['FieldCode', 'FieldType', 'LabelMn'],
      raw: true,
      transaction: t,
    });
    const ByCode = new Map(Dictionary.map((f) => [f.FieldCode, f]));
    const Rejected = Object.keys(Modified).filter((k) => !ByCode.has(k));
    const Clean = {};
    Object.keys(Modified).forEach((k) => {
      if (ByCode.has(k)) Clean[k] = Modified[k];
    });
    if (Rejected.length) {
      console.warn('[TenderForm/CustomSave] ignored unknown fields:', Rejected.join(', '));
    }

    const Wrong = Object.keys(Clean)
      .map((k) => {
        const f = ByCode.get(k);
        const Problem = TypeProblem(f.FieldType, Clean[k]);
        return Problem ? f.LabelMn + ' (' + Problem + ')' : null;
      })
      .filter(Boolean);
    if (Wrong.length) {
      await t.rollback();
      return res.send(
        Fail(
          'Буруу утгатай талбар: ' + Wrong.slice(0, 5).join(', ') + (Wrong.length > 5 ? '…' : '')
        )
      );
    }

    // An Id is an existing record, and must be one this caller may still change.
    // (It used to fall through to creating a fresh record for an unknown Id.)
    let Row = null;
    if (Id) {
      const Writable = await LoadWritable(Id, LogedUser, t);
      if (Writable.Error) {
        await t.rollback();
        return res.send(Fail(Writable.Error));
      }
      Row = Writable.Row;
    }

    if (Row) {
      const Existing = JSON.parse(Row.Data || '{}');
      const Merged = { ...Existing, ...Clean };
      // An emptied answer is removed rather than stored as null. This is also
      // how a field hidden by a changed parent loses its stale value: the
      // editor sends null for it at save time.
      Object.keys(Merged).forEach((k) => {
        if (IsEmpty(Merged[k])) delete Merged[k];
      });
      await Row.update(
        {
          Data: JSON.stringify(Merged),
          UpdateDate: new Date(),
          UpdateUserId: LogedUser.Id || null,
          ...(FormDate ? { FormDate } : {}),
        },
        { transaction: t }
      );
    } else {
      Object.keys(Clean).forEach((k) => {
        if (IsEmpty(Clean[k])) delete Clean[k];
      });
      Row = await Models.TenderFormData.create(
        {
          FormCode,
          FormVersion: 1,
          PatRegNo,
          PatientId: PatientId || null,
          FormDate: FormDate || new Date(),
          VisitId: VisitId || null,
          SurgeryId: SurgeryId || null,
          DoctorId: LogedUser.Id || null,
          OrganizationId:
            LogedUser.OrganizationId ||
            (LogedUser.Doctor && LogedUser.Doctor.OrganizationId) ||
            null,
          Data: JSON.stringify(Clean),
          Status: 0,
          rec_status: 1,
          CreateDate: new Date(),
          CreateUserId: LogedUser.Id || null,
        },
        { transaction: t }
      );
    }

    await t.commit();
    return res.send({
      Success: true,
      Message: 'Амжилттай хадгаллаа',
      Data: { DataId: Row.Id, Id: Row.Id },
    });
  } catch (ex) {
    await t.rollback();
    console.error('[TenderForm/CustomSave]', ex);
    return res.send(Fail());
  }
}

/**
 * Complete and lock - tender appendix 3.1, "COMPLETE AND SAVE?" (L8599-8605).
 *
 * Required fields are owed HERE, not at every save: the forms are filled a
 * section at a time, but a record asserted complete must actually be complete.
 * Visibility uses the same rule as the editor and the print, so a required
 * field inside a section the answers skipped is not owed.
 */
async function Confirm(req, res) {
  try {
    const { Id } = req.body;
    if (!Id) return res.send(Fail('Бүртгэлийн дугаар шаардлагатай'));
    const LogedUser = req.LogedUser || {};

    const Writable = await LoadWritable(Id, LogedUser);
    if (Writable.Locked) {
      return res.send({ Success: true, Message: 'Аль хэдийн баталгаажсан байна', Data: { Id } });
    }
    if (Writable.Error) return res.send(Fail(Writable.Error));
    const Row = Writable.Row;

    let Answers = {};
    try {
      Answers = JSON.parse(Row.Data || '{}');
    } catch (e) {
      return res.send(Fail('Өгөгдлийн бүтэц буруу байна'));
    }

    const Dictionary = await Models.TenderFormField.findAll({
      where: { FormCode: Row.FormCode, IsActive: true },
      attributes: ['FieldCode', 'LabelMn', 'ParentField', 'ParentValue', 'IsRequired'],
      raw: true,
    });
    const ByCode = new Map(Dictionary.map((f) => [f.FieldCode, f]));
    const Missing = Dictionary.filter(
      (f) => f.IsRequired && IsVisible(f, Answers, ByCode) && IsEmpty(Answers[f.FieldCode])
    );
    if (Missing.length) {
      return res.send(
        Fail(
          'Заавал бөглөх талбар бөглөгдөөгүй байна (' +
            Missing.length +
            '): ' +
            Missing.slice(0, 5)
              .map((f) => f.LabelMn)
              .join(', ') +
            (Missing.length > 5 ? '…' : '')
        )
      );
    }

    await Row.update({ Status: 1, UpdateDate: new Date(), UpdateUserId: LogedUser.Id || null });
    await Audit(
      LogedUser,
      Id,
      'Confirm',
      'Tender form ' + Row.FormCode + ' completed and locked',
      'Маягт ' + Row.FormCode + ' дуусгаж түгжигдлээ'
    );
    return res.send({ Success: true, Message: 'Баталгаажлаа', Data: { Id } });
  } catch (ex) {
    console.error('[TenderForm/Confirm]', ex);
    return res.send(Fail());
  }
}

/**
 * Soft delete: rec_status = 2, the house convention.
 *
 * Nothing is removed. Every read already excludes rec_status 2 — the generated
 * per-form views do it in SQL, GetData does it in its where clause, and
 * TenderFormData.findAllNew does it for the unified register — so a deleted
 * record simply stops appearing. A clinical record that was entered against the
 * wrong patient has to be retractable; destroying it is a different act with
 * different rules, and is not this.
 *
 * A confirmed record is refused. Confirm is the point at which a record is
 * asserted complete and locked, so unlocking it is the decision that has to
 * come first.
 */
async function Delete(req, res) {
  try {
    const { Id } = req.body;
    if (!Id) return res.send(Fail('Бүртгэлийн дугаар шаардлагатай'));
    const LogedUser = req.LogedUser || {};

    const Existing = await Models.TenderFormData.findOne({
      where: { Id },
      attributes: ['Id', 'rec_status'],
      raw: true,
    });
    if (!Existing) return res.send(Fail('Бүртгэл олдсонгүй'));
    if (Existing.rec_status === 2) {
      return res.send({ Success: true, Message: 'Аль хэдийн устгагдсан байна', Data: { Id } });
    }

    const Writable = await LoadWritable(Id, LogedUser);
    if (Writable.Locked) return res.send(Fail('Баталгаажсан бүртгэлийг устгах боломжгүй'));
    if (Writable.Error) return res.send(Fail(Writable.Error));
    const Row = Writable.Row;

    await Row.update({ rec_status: 2, UpdateDate: new Date(), UpdateUserId: LogedUser.Id || null });
    await Audit(
      LogedUser,
      Id,
      'Delete',
      'Tender form ' + Row.FormCode + ' record retracted (rec_status 2)',
      'Маягт ' + Row.FormCode + ' бүртгэлийг устгалаа'
    );

    return res.send({ Success: true, Message: 'Устгалаа', Data: { Id } });
  } catch (ex) {
    console.error('[TenderForm/Delete]', ex);
    return res.send(Fail());
  }
}

module.exports = router;
