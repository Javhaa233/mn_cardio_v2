const express = require('express');
const router = express.Router();

const sequelize = require('../../config/DbConnection');
const { Models, Op } = require('../../config/DB');
const MediaRef = require('../../helper/MediaRef');
const MediaTicket = require('../../helper/MediaTicket');
const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const RehabCues = require('../../helper/RehabCues');
const RehabDose = require('../../helper/RehabDose');

/**
 * The web admin's rehabilitation content manager (mobile tender 2.7).
 *
 * WHY THIS EXISTS BESIDE /BaseObject. The generic CRUD already covers the five
 * player tables, and it stays the fallback. What it cannot do is the three
 * things the customer asked for on 2026-09-18:
 *
 *   1. ORDER. Dragging a card has to renumber a whole list in one go. Through
 *      /BaseObject that is one update per row from the browser, each a full
 *      record write, with a half-applied order if one fails mid-way.
 *   2. PHOTOS IN A LIST. A browser <img> cannot send an Authorization header, so
 *      a thumbnail needs a short-lived ticket (helper/MediaTicket.js) - the same
 *      mechanism chat uses for voice notes.
 *   3. ONE READ FOR THE PAGE. The gallery needs exercises WITH their movement
 *      count, total length and first photo. That is a join, not a list.
 *
 * WHO MAY USE IT. RoleId 1 (admin) and 6 (settings admin) - the two roles the
 * /admin/RehabContent page is routed to. Everything here is shared demonstration
 * content, not patient data: no PatRegNo is read or written anywhere in this
 * file, so there is no patient scope to apply.
 *
 * Legacy PascalCase envelope, because this is controllers/** (CLAUDE.md §5).
 */

const EDITOR_ROLES = ['1', '6'];

/** Tables this controller may renumber. Anything else is refused outright. */
const ORDERABLE = {
  RehabExercise: 'RehabExercise',
  RehabMovement: 'RehabMovement',
  RehabProgramBlock: 'RehabProgramBlock',
};

const Fail = (res, Message) => res.send({ Success: false, Message, Data: null });
const Ok = (res, Data, Message) => res.send({ Success: true, Message: Message || '', Data });

/**
 * Gate every route. Not `verifyToken` - server.js already wraps this prefix -
 * but the role check, in one place so a new route cannot forget it.
 */
router.use((req, res, next) => {
  const Role = String((req.LogedUser || {}).RoleId || '');
  if (!EDITOR_ROLES.includes(Role)) {
    return res.send({
      Success: false,
      Message: 'Сэргээн засах контент засах эрхгүй байна',
      Data: null,
    });
  }
  return next();
});

/**
 * The whole gallery in one read: exercises, their movements, and whether a
 * photo/clip is attached. Media itself is fetched per tile through GetMediaLink,
 * so this response stays small no matter how many clips exist.
 */
router.post('/GetList', async (req, res) => {
  try {
    const IncludeInactive = req.body && req.body.IncludeInactive === true;
    const Where = IncludeInactive ? {} : { IsActive: true };

    const [Exercises, Movements] = await Promise.all([
      Models.RehabExercise.findAll({
        where: Where,
        attributes: [
          'Id',
          'Code',
          'Name',
          'Description',
          'CategoryCode',
          'WarningText',
          'OrderNo',
          'IsActive',
        ],
        order: [
          ['OrderNo', 'ASC'],
          ['Id', 'ASC'],
        ],
        raw: true,
      }),
      Models.RehabMovement.findAll({
        where: Where,
        order: [
          ['ExerciseId', 'ASC'],
          ['OrderNo', 'ASC'],
          ['Id', 'ASC'],
        ],
        raw: true,
      }),
    ]);

    const ByExercise = new Map();
    for (const m of Movements) {
      if (!ByExercise.has(m.ExerciseId)) ByExercise.set(m.ExerciseId, []);
      ByExercise.get(m.ExerciseId).push({
        Id: m.Id,
        ExerciseId: m.ExerciseId,
        OrderNo: m.OrderNo,
        Name: m.Name,
        GuideText: m.GuideText,
        WorkSec: m.WorkSec,
        Reps: m.Reps,
        PrepSec: m.PrepSec,
        RestSec: m.RestSec,
        Sets: m.Sets,
        SetRestSec: m.SetRestSec,
        WarningText: m.WarningText,
        Cues: RehabCues.Parse(m.Cues),
        IsActive: m.IsActive,
        // The client never parses these; it asks GetMediaLink for a URL.
        HasVideo: !!MediaRef.Parse(m.MediaRef).kind,
        HasThumb: !!MediaRef.Parse(m.ThumbRef).kind,
      });
    }

    const Data = Exercises.map((e) => {
      const List = ByExercise.get(e.Id) || [];
      const Live = List.filter((m) => m.IsActive !== false);
      return Object.assign({}, e, {
        Movements: List,
        MovementCount: Live.length,
        MissingVideoCount: Live.filter((m) => !m.HasVideo).length,
        DurationSec: RehabDose.MovementsSec(Live),
        // Which movement's photo the gallery tile should show.
        CoverMovementId: (List.find((m) => m.HasThumb) || List[0] || {}).Id || null,
      });
    });

    // The category list rides along in Option, so the page's filter and the
    // exercise header need no second request. Labels are the dico's own.
    const Categories = await Models.OptionTypes.findAll({
      where: { dico: 'rehab_category' },
      attributes: ['label', 'value', 'pos'],
      order: [
        ['pos', 'ASC'],
        ['id_dico', 'ASC'],
      ],
      raw: true,
    });

    return res.send({
      Success: true,
      Message: '',
      Data,
      Option: { Categories: Categories.map((c) => ({ Value: c.value, Label: c.label })) },
    });
  } catch (ex) {
    console.log(ex);
    return Fail(res, 'Жагсаалтыг уншиж чадсангүй');
  }
});

/**
 * Renumber after a drag (or an up/down tap): OrderNo = position in `Ids`.
 *
 * One transaction, so a list is never left half-renumbered. Ids that do not
 * belong to the table are simply not found and change nothing.
 */
router.post('/Reorder', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { ObjectName, Ids } = req.body || {};
    const Table = ORDERABLE[String(ObjectName)];
    if (!Table) {
      await t.rollback();
      return Fail(res, 'Энэ обьектын дарааллыг өөрчлөх боломжгүй');
    }
    const List = Array.isArray(Ids) ? Ids.map((x) => parseInt(x, 10)).filter((x) => x > 0) : [];
    if (!List.length) {
      await t.rollback();
      return Fail(res, 'Дараалал хоосон байна');
    }

    for (let i = 0; i < List.length; i++) {
      await Models[Table].update({ OrderNo: i + 1 }, { where: { Id: List[i] }, transaction: t });
    }
    await t.commit();

    await BaseControllerHelper.CreateUserActionHistory({
      LinkObjectName: Table,
      LinkObjectId: List[0],
      Action: 'Update',
      LogedUser: req.LogedUser,
      NotesMn: 'Сэргээн засах контентын дарааллыг өөрчиллөө',
      Notes: 'Reordered rehabilitation content',
    });

    return Ok(res, { Count: List.length }, 'Дараалал хадгалагдлаа');
  } catch (ex) {
    await t.rollback();
    console.log(ex);
    return Fail(res, 'Дарааллыг хадгалж чадсангүй');
  }
});

/**
 * A short-lived URL a browser can put straight into <img> or <video>.
 *
 * The header-authenticated /api/Media/movement/:id route serves Flutter, which
 * can set headers; a browser element cannot, and a session token in a URL is
 * exactly what helper/SocketAuth.js warns against. So this mints a ticket scoped
 * to ONE file and ONE user, the way Chat/GetAttachmentLink does.
 */
router.post('/GetMediaLink', async (req, res) => {
  try {
    const Id = parseInt((req.body || {}).MovementId, 10);
    const Kind = String((req.body || {}).Kind || 'thumb').toLowerCase();
    if (!Id) return Fail(res, 'Хөдөлгөөн сонгогдоогүй байна');

    const M = await Models.RehabMovement.findByPk(Id, {
      attributes: ['Id', 'MediaRef', 'ThumbRef'],
      raw: true,
    });
    if (!M) return Fail(res, 'Хөдөлгөөн олдсонгүй');

    const Parsed = MediaRef.Parse(Kind === 'video' ? M.MediaRef : M.ThumbRef);
    // Not an error: "no clip yet" is the normal state for most of the catalogue.
    if (!Parsed.kind) return Ok(res, { Url: null, Kind: null });
    if (Parsed.kind === 'url') return Ok(res, { Url: Parsed.url, Kind: 'url' });
    if (Parsed.kind === 'asset') return Ok(res, { Url: null, Kind: 'asset' });

    // Mint returns { Ticket, ExpiresAt, ExpiresInSeconds } - not a bare string.
    const Minted = MediaTicket.Mint({
      generatedName: Parsed.ref,
      LogedUser: req.LogedUser,
    });
    if (!Minted || !Minted.Ticket) return Fail(res, 'Холбоос үүсгэж чадсангүй');

    return Ok(res, {
      Url: '/api/Media/t/' + Minted.Ticket,
      Kind: 'file',
      ExpiresInSec: Minted.ExpiresInSeconds,
    });
  } catch (ex) {
    console.log(ex);
    return Fail(res, 'Холбоос үүсгэж чадсангүй');
  }
});

/**
 * Point a movement at a file that has just been uploaded through
 * /BaseObject/uploadFile. The upload creates the File row and writes the bytes;
 * this writes the pointer, in the prefix scheme helper/MediaRef.js reads.
 *
 * The file must be one attached to THIS movement - otherwise a caller could aim
 * a movement at an arbitrary file id and read it back through the media route.
 */
router.post('/SetMedia', async (req, res) => {
  try {
    const Id = parseInt((req.body || {}).MovementId, 10);
    const FileId = parseInt((req.body || {}).FileId, 10);
    const Kind = String((req.body || {}).Kind || '').toLowerCase();
    if (!Id || !['video', 'thumb'].includes(Kind)) return Fail(res, 'Мэдээлэл дутуу байна');

    const M = await Models.RehabMovement.findByPk(Id, { attributes: ['Id'], raw: true });
    if (!M) return Fail(res, 'Хөдөлгөөн олдсонгүй');

    // FileId 0 / missing clears the reference - "remove this clip" - unless the
    // caller asks for the newest upload instead. The web page uses that: the
    // generic upload route's response shape is not part of any contract, so the
    // page uploads and then says "take the file you just stored for me".
    const UseLatest = (req.body || {}).UseLatest === true;
    const FieldName = Kind === 'video' ? 'Loop' : 'Thumb';
    let Value = null;
    if (!FileId && UseLatest) {
      const Latest = await Models.File.findOne({
        where: { LinkedObjectName: 'RehabMovement', LinkedObjectId: Id, FieldName },
        attributes: ['id_data', 'generated_name'],
        order: [['id_data', 'DESC']],
        raw: true,
      });
      if (!Latest) return Fail(res, 'Файл олдсонгүй');
      Value = 'file:' + Latest.generated_name;
    } else if (FileId) {
      const F = await Models.File.findOne({
        where: {
          id_data: FileId,
          LinkedObjectName: 'RehabMovement',
          LinkedObjectId: Id,
        },
        attributes: ['id_data', 'generated_name'],
        raw: true,
      });
      if (!F) return Fail(res, 'Файл энэ хөдөлгөөнд хамаарахгүй байна');
      Value = 'file:' + F.generated_name;
    }

    await Models.RehabMovement.update(
      Kind === 'video' ? { MediaRef: Value } : { ThumbRef: Value },
      { where: { Id } }
    );

    return Ok(res, { Id, Kind, Ref: Value }, 'Хадгаллаа');
  } catch (ex) {
    console.log(ex);
    return Fail(res, 'Хадгалж чадсангүй');
  }
});

/**
 * Delete a movement, and the exercise's own row count with it.
 *
 * A soft delete would leave it in the player, because the app filters on
 * IsActive - so "remove" here means IsActive = 0, which is what every other
 * catalogue screen means by it. The File rows are left alone: they are shared
 * content and may be pointed at again.
 */
router.post('/RemoveMovement', async (req, res) => {
  try {
    const Id = parseInt((req.body || {}).MovementId, 10);
    if (!Id) return Fail(res, 'Хөдөлгөөн сонгогдоогүй байна');
    const [Count] = await Models.RehabMovement.update(
      { IsActive: false },
      { where: { Id, IsActive: { [Op.ne]: false } } }
    );
    return Ok(res, { Id, Removed: Count }, 'Хасагдлаа');
  } catch (ex) {
    console.log(ex);
    return Fail(res, 'Хасаж чадсангүй');
  }
});

// ---------------------------------------------------------------------------
// Authoring writes (2026-09-24 rebuild). Before this, the page wrote through the
// generic /BaseObject/create|update, which cannot validate the cue JSON or keep
// "time OR reps" consistent. These routes are the only path the page uses now;
// /BaseObject stays the fallback for the generic grids.
// ---------------------------------------------------------------------------

/** A whole number >= min, or null. Blank, text and negatives all read as null. */
const IntOrNull = (v, min = 0) => {
  if (v === null || v === undefined || v === '') return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n >= min ? n : null;
};
const TextOrNull = (v) => {
  const s = v === null || v === undefined ? '' : String(v).trim();
  return s ? s : null;
};
const UserId = (req) => (req.LogedUser ? req.LogedUser.Id : null);

/** Next OrderNo at the end of a list. */
const NextOrder = async (Model, where, transaction) => {
  const Max = await Model.max('OrderNo', { where, transaction });
  return (parseInt(Max, 10) || 0) + 1;
};

/**
 * Create or update an exercise header. Body: { Id?, Name, Code?, CategoryCode?,
 * Description?, WarningText?, IsActive? }. A new exercise without a Code gets
 * the next free EX-nn, so "Шинэ дасгал" is one click.
 */
router.post('/SaveExercise', async (req, res) => {
  try {
    const b = req.body || {};
    const Id = IntOrNull(b.Id, 1);
    const Name = TextOrNull(b.Name);
    if (!Name) return Fail(res, 'Дасгалын нэрийг оруулна уу');

    let Code = TextOrNull(b.Code);
    if (!Code && !Id) {
      const Codes = await Models.RehabExercise.findAll({ attributes: ['Code'], raw: true });
      const Max = Codes.reduce((m, r) => {
        const hit = /^EX-(\d+)$/i.exec(String(r.Code || ''));
        return hit ? Math.max(m, parseInt(hit[1], 10)) : m;
      }, 0);
      Code = 'EX-' + String(Max + 1).padStart(2, '0');
    }
    if (Code) {
      const Clash = await Models.RehabExercise.findOne({
        where: Id ? { Code, Id: { [Op.ne]: Id } } : { Code },
        attributes: ['Id'],
        raw: true,
      });
      if (Clash) return Fail(res, 'Ийм кодтой дасгал байна: ' + Code);
    }

    const Data = {
      Name,
      CategoryCode: TextOrNull(b.CategoryCode),
      Description: TextOrNull(b.Description),
      WarningText: TextOrNull(b.WarningText),
      IsActive: b.IsActive !== false,
    };
    if (Code) Data.Code = Code;

    if (Id) {
      const [Count] = await Models.RehabExercise.update(Data, { where: { Id } });
      if (!Count) return Fail(res, 'Дасгал олдсонгүй');
      return Ok(res, { Id }, 'Хадгаллаа');
    }
    const Row = await Models.RehabExercise.create(
      Object.assign(Data, {
        OrderNo: await NextOrder(Models.RehabExercise, {}),
        CreateDate: new Date(),
        CreateUserId: UserId(req),
      })
    );
    return Ok(res, { Id: Row.Id, Code: Row.Code }, 'Дасгал нэмэгдлээ');
  } catch (ex) {
    console.log(ex);
    return Fail(res, 'Дасгалыг хадгалж чадсангүй');
  }
});

/**
 * Create or update one movement: dose, steps, warning and messages in one
 * validated write. Body: { Id?, ExerciseId, Name, GuideText?, WorkSec | Reps,
 * Sets?, SetRestSec?, PrepSec?, RestSec?, WarningText?, Cues? }.
 *
 * Time OR reps, never both: when both arrive, Reps wins and WorkSec is cleared,
 * because that is what the page's toggle means. Cues are checked against the
 * dose being saved, so shortening WorkSec below a cue is refused, not truncated.
 */
router.post('/SaveMovement', async (req, res) => {
  try {
    const b = req.body || {};
    const Id = IntOrNull(b.Id, 1);
    const ExerciseId = IntOrNull(b.ExerciseId, 1);
    const Name = TextOrNull(b.Name);
    if (!Name) return Fail(res, 'Хөдөлгөөний нэрийг оруулна уу');

    const Reps = IntOrNull(b.Reps, 1);
    const WorkSec = Reps ? null : IntOrNull(b.WorkSec, 1);
    if (!Reps && !WorkSec) return Fail(res, 'Хугацаа эсвэл давталтын тоог оруулна уу');
    if (WorkSec && WorkSec > 3600) return Fail(res, 'Хугацаа 3600 секундээс ихгүй байна');
    if (Reps && Reps > 200) return Fail(res, 'Давталт 200-аас ихгүй байна');

    const Sets = IntOrNull(b.Sets, 1) || 1;
    if (Sets > 20) return Fail(res, 'Сет 20-оос ихгүй байна');

    const Check = RehabCues.Validate(b.Cues, { WorkSec, Reps, Sets });
    if (Check.Errors.length) {
      return res.send({ Success: false, Message: Check.Errors[0], Data: { Errors: Check.Errors } });
    }

    const Data = {
      Name,
      GuideText: TextOrNull(b.GuideText),
      WorkSec,
      Reps,
      Sets: Sets > 1 ? Sets : null,
      SetRestSec: Sets > 1 ? IntOrNull(b.SetRestSec, 0) : null,
      PrepSec: Math.max(RehabDose.MIN_PREP_SEC, IntOrNull(b.PrepSec, 0) || 0),
      RestSec: IntOrNull(b.RestSec, 0) || null,
      WarningText: TextOrNull(b.WarningText),
      Cues: RehabCues.Serialize(Check.Cues),
    };

    if (Id) {
      const [Count] = await Models.RehabMovement.update(Data, { where: { Id } });
      if (!Count) return Fail(res, 'Хөдөлгөөн олдсонгүй');
      return Ok(res, { Id }, 'Хадгаллаа');
    }

    if (!ExerciseId) return Fail(res, 'Дасгал сонгогдоогүй байна');
    const Ex = await Models.RehabExercise.findByPk(ExerciseId, { attributes: ['Id'], raw: true });
    if (!Ex) return Fail(res, 'Дасгал олдсонгүй');
    const Row = await Models.RehabMovement.create(
      Object.assign(Data, {
        ExerciseId,
        OrderNo: await NextOrder(Models.RehabMovement, { ExerciseId, IsActive: true }),
        IsActive: true,
        CreateDate: new Date(),
        CreateUserId: UserId(req),
      })
    );
    return Ok(res, { Id: Row.Id }, 'Хөдөлгөөн нэмэгдлээ');
  } catch (ex) {
    console.log(ex);
    return Fail(res, 'Хөдөлгөөнийг хадгалж чадсангүй');
  }
});

/** Columns a copy carries. Media is shared on purpose: the clip is the same file. */
const MOVEMENT_COPY = [
  'Name',
  'GuideText',
  'MediaRef',
  'ThumbRef',
  'WorkSec',
  'Reps',
  'PrepSec',
  'RestSec',
  'Sets',
  'SetRestSec',
  'WarningText',
  'Cues',
  'LoopStartMs',
  'LoopEndMs',
];
const Pick = (row, keys) => keys.reduce((o, k) => Object.assign(o, { [k]: row[k] }), {});

/** Copy one movement to the end of the same exercise, named "... (хуулбар)". */
router.post('/DuplicateMovement', async (req, res) => {
  try {
    const Id = IntOrNull((req.body || {}).MovementId, 1);
    if (!Id) return Fail(res, 'Хөдөлгөөн сонгогдоогүй байна');
    const M = await Models.RehabMovement.findByPk(Id, { raw: true });
    if (!M) return Fail(res, 'Хөдөлгөөн олдсонгүй');
    const Row = await Models.RehabMovement.create(
      Object.assign(Pick(M, MOVEMENT_COPY), {
        Name: String(M.Name || '') + ' (хуулбар)',
        ExerciseId: M.ExerciseId,
        OrderNo: await NextOrder(Models.RehabMovement, {
          ExerciseId: M.ExerciseId,
          IsActive: true,
        }),
        IsActive: true,
        CreateDate: new Date(),
        CreateUserId: UserId(req),
      })
    );
    return Ok(res, { Id: Row.Id }, 'Хувиллаа');
  } catch (ex) {
    console.log(ex);
    return Fail(res, 'Хувилж чадсангүй');
  }
});

/** Copy an exercise with all its active movements, as a new inactive draft. */
router.post('/DuplicateExercise', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const Id = IntOrNull((req.body || {}).ExerciseId, 1);
    const E = Id ? await Models.RehabExercise.findByPk(Id, { raw: true, transaction: t }) : null;
    if (!E) {
      await t.rollback();
      return Fail(res, 'Дасгал олдсонгүй');
    }
    const Now = new Date();
    const Copy = await Models.RehabExercise.create(
      {
        // Code is unique in practice; the copy takes a suffixed one to edit.
        Code: String(E.Code || 'EX') + '-copy-' + Date.now().toString(36),
        Name: String(E.Name || '') + ' (хуулбар)',
        Description: E.Description,
        CategoryCode: E.CategoryCode,
        WarningText: E.WarningText,
        DurationSec: E.DurationSec,
        OrderNo: await NextOrder(Models.RehabExercise, {}, t),
        // Inactive until someone has looked at it: a copy must not appear in
        // patients' players by accident.
        IsActive: false,
        CreateDate: Now,
        CreateUserId: UserId(req),
      },
      { transaction: t }
    );
    const Movements = await Models.RehabMovement.findAll({
      where: { ExerciseId: Id, IsActive: true },
      order: [
        ['OrderNo', 'ASC'],
        ['Id', 'ASC'],
      ],
      raw: true,
      transaction: t,
    });
    for (let i = 0; i < Movements.length; i++) {
      await Models.RehabMovement.create(
        Object.assign(Pick(Movements[i], MOVEMENT_COPY), {
          ExerciseId: Copy.Id,
          OrderNo: i + 1,
          IsActive: true,
          CreateDate: Now,
          CreateUserId: UserId(req),
        }),
        { transaction: t }
      );
    }
    await t.commit();
    return Ok(res, { Id: Copy.Id, Movements: Movements.length }, 'Хувиллаа');
  } catch (ex) {
    await t.rollback();
    console.log(ex);
    return Fail(res, 'Хувилж чадсангүй');
  }
});

// ---------------------------------------------------------------------------
// Programmes and their blocks
// ---------------------------------------------------------------------------

const BLOCK_KINDS = ['video', 'timed', 'vitals', 'image'];

/**
 * DurationSteps as the page edits it: [{fromDay, toDay, min}], sorted, bands
 * not overlapping, toDay null = "and after". Returns { Steps, Error }.
 */
function CheckSteps(raw) {
  const list = RehabDose.ParseSteps(raw);
  const Steps = [];
  for (let i = 0; i < list.length; i++) {
    const fromDay = IntOrNull(list[i].fromDay, 1);
    const toDay = IntOrNull(list[i].toDay, 1);
    const min = Number(list[i].min);
    if (!fromDay) return { Error: i + 1 + '-р мөр: эхлэх өдөр 1-ээс их байна' };
    if (toDay !== null && toDay < fromDay) {
      return { Error: i + 1 + '-р мөр: дуусах өдөр эхлэхээс өмнө байна' };
    }
    if (!(min > 0) || min > 240) return { Error: i + 1 + '-р мөр: минут 1-240 хооронд байна' };
    Steps.push({ fromDay, toDay, min });
  }
  Steps.sort((a, b) => a.fromDay - b.fromDay);
  for (let i = 1; i < Steps.length; i++) {
    const prevTo = Steps[i - 1].toDay;
    if (prevTo === null || prevTo >= Steps[i].fromDay) {
      return { Error: 'Өдрийн хүрээ давхцаж байна (' + Steps[i].fromDay + '-р өдөр)' };
    }
  }
  return { Steps };
}

/** Every programme with its blocks, and the exercise each video block plays. */
router.post('/GetPrograms', async (req, res) => {
  try {
    const [Programs, Blocks, Exercises] = await Promise.all([
      Models.RehabProgram.findAll({
        order: [
          ['OrderNo', 'ASC'],
          ['Id', 'ASC'],
        ],
        raw: true,
      }),
      Models.RehabProgramBlock.findAll({
        where: { IsActive: true },
        order: [
          ['ProgramId', 'ASC'],
          ['OrderNo', 'ASC'],
          ['Id', 'ASC'],
        ],
        raw: true,
      }),
      Models.RehabExercise.findAll({ attributes: ['Id', 'Code', 'Name', 'IsActive'], raw: true }),
    ]);
    const ExById = new Map(Exercises.map((e) => [e.Id, e]));
    const ByProgram = new Map();
    for (const b of Blocks) {
      if (!ByProgram.has(b.ProgramId)) ByProgram.set(b.ProgramId, []);
      ByProgram.get(b.ProgramId).push(
        Object.assign({}, b, {
          DurationSteps: RehabDose.ParseSteps(b.DurationSteps),
          Exercise: b.ExerciseId ? ExById.get(b.ExerciseId) || null : null,
        })
      );
    }
    const Data = Programs.map((p) =>
      Object.assign({}, p, {
        DefaultIntensityPct: p.DefaultIntensityPct === null ? null : Number(p.DefaultIntensityPct),
        Blocks: ByProgram.get(p.Id) || [],
      })
    );
    return Ok(res, Data);
  } catch (ex) {
    console.log(ex);
    return Fail(res, 'Хөтөлбөрийг уншиж чадсангүй');
  }
});

/** Update a programme header (programmes themselves are created by script). */
router.post('/SaveProgram', async (req, res) => {
  try {
    const b = req.body || {};
    const Id = IntOrNull(b.Id, 1);
    const Name = TextOrNull(b.Name);
    if (!Id) return Fail(res, 'Хөтөлбөр сонгогдоогүй байна');
    if (!Name) return Fail(res, 'Хөтөлбөрийн нэрийг оруулна уу');
    const Pct =
      b.DefaultIntensityPct === '' || b.DefaultIntensityPct === null
        ? null
        : Number(b.DefaultIntensityPct);
    if (Pct !== null && !(Pct > 0 && Pct <= 100)) return Fail(res, 'Эрчим 1-100% хооронд байна');
    const [Count] = await Models.RehabProgram.update(
      {
        Name,
        Description: TextOrNull(b.Description),
        HasHrTarget: b.HasHrTarget !== false,
        DefaultIntensityPct: Pct,
        WarningTemplate: TextOrNull(b.WarningTemplate),
        IsActive: b.IsActive !== false,
      },
      { where: { Id } }
    );
    if (!Count) return Fail(res, 'Хөтөлбөр олдсонгүй');
    return Ok(res, { Id }, 'Хадгаллаа');
  } catch (ex) {
    console.log(ex);
    return Fail(res, 'Хөтөлбөрийг хадгалж чадсангүй');
  }
});

/**
 * Create or update one block. Body: { Id?, ProgramId, Title, Kind, ExerciseId?,
 * DurationSec?, DurationSteps?: [{fromDay,toDay,min}], ShowFromDay?,
 * CheckInEverySec?, GuideText? }.
 */
router.post('/SaveBlock', async (req, res) => {
  try {
    const b = req.body || {};
    const Id = IntOrNull(b.Id, 1);
    const ProgramId = IntOrNull(b.ProgramId, 1);
    const Title = TextOrNull(b.Title);
    const Kind = String(b.Kind || '');
    if (!Title) return Fail(res, 'Блокийн нэрийг оруулна уу');
    if (!BLOCK_KINDS.includes(Kind)) return Fail(res, 'Блокийн төрөл буруу байна');

    const ExerciseId = Kind === 'video' ? IntOrNull(b.ExerciseId, 1) : null;
    if (Kind === 'video') {
      if (!ExerciseId) return Fail(res, 'Видео блокт дасгал сонгоно уу');
      const Ex = await Models.RehabExercise.findByPk(ExerciseId, { attributes: ['Id'], raw: true });
      if (!Ex) return Fail(res, 'Дасгал олдсонгүй');
    }
    const Steps = CheckSteps(b.DurationSteps);
    if (Steps.Error) return Fail(res, Steps.Error);

    const Data = {
      Title,
      Kind,
      ExerciseId,
      DurationSec: IntOrNull(b.DurationSec, 1),
      DurationSteps: Steps.Steps.length ? JSON.stringify(Steps.Steps) : null,
      ShowFromDay: IntOrNull(b.ShowFromDay, 1),
      CheckInEverySec: Kind === 'timed' ? IntOrNull(b.CheckInEverySec, 30) : null,
      GuideText: TextOrNull(b.GuideText),
    };

    if (Id) {
      const [Count] = await Models.RehabProgramBlock.update(Data, { where: { Id } });
      if (!Count) return Fail(res, 'Блок олдсонгүй');
      return Ok(res, { Id }, 'Хадгаллаа');
    }
    if (!ProgramId) return Fail(res, 'Хөтөлбөр сонгогдоогүй байна');
    const P = await Models.RehabProgram.findByPk(ProgramId, { attributes: ['Id'], raw: true });
    if (!P) return Fail(res, 'Хөтөлбөр олдсонгүй');
    const Row = await Models.RehabProgramBlock.create(
      Object.assign(Data, {
        ProgramId,
        OrderNo: await NextOrder(Models.RehabProgramBlock, { ProgramId, IsActive: true }),
        IsActive: true,
        CreateDate: new Date(),
        CreateUserId: UserId(req),
      })
    );
    return Ok(res, { Id: Row.Id }, 'Блок нэмэгдлээ');
  } catch (ex) {
    console.log(ex);
    return Fail(res, 'Блокийг хадгалж чадсангүй');
  }
});

/** Take a block out of its programme (IsActive = 0, like RemoveMovement). */
router.post('/RemoveBlock', async (req, res) => {
  try {
    const Id = IntOrNull((req.body || {}).BlockId, 1);
    if (!Id) return Fail(res, 'Блок сонгогдоогүй байна');
    const [Count] = await Models.RehabProgramBlock.update({ IsActive: false }, { where: { Id } });
    return Ok(res, { Id, Removed: Count }, 'Хасагдлаа');
  } catch (ex) {
    console.log(ex);
    return Fail(res, 'Хасаж чадсангүй');
  }
});

module.exports = router;
