const express = require('express');
const router = express.Router();

const sequelize = require('../../config/DbConnection');
const { Models, Op } = require('../../config/DB');
const MediaRef = require('../../helper/MediaRef');
const MediaTicket = require('../../helper/MediaTicket');
const BaseControllerHelper = require('../../helper/BaseControllerHelper');

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
        attributes: ['Id', 'Code', 'Name', 'Description', 'CategoryCode', 'OrderNo', 'IsActive'],
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
        IsActive: m.IsActive,
        // The client never parses these; it asks GetMediaLink for a URL.
        HasVideo: !!MediaRef.Parse(m.MediaRef).kind,
        HasThumb: !!MediaRef.Parse(m.ThumbRef).kind,
      });
    }

    const Data = Exercises.map((e) => {
      const List = ByExercise.get(e.Id) || [];
      const Seconds = List.reduce(
        (sum, m) => sum + (m.WorkSec || 0) + (m.RestSec || 0) + (m.PrepSec || 0),
        0
      );
      return Object.assign({}, e, {
        Movements: List,
        MovementCount: List.length,
        DurationSec: Seconds,
        // Which movement's photo the gallery tile should show.
        CoverMovementId: (List.find((m) => m.HasThumb) || List[0] || {}).Id || null,
      });
    });

    return Ok(res, Data);
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

    const Ticket = MediaTicket.Mint({
      generatedName: Parsed.ref,
      LogedUser: req.LogedUser,
    });
    if (!Ticket) return Fail(res, 'Холбоос үүсгэж чадсангүй');

    return Ok(res, {
      Url: '/api/Media/t/' + Ticket,
      Kind: 'file',
      ExpiresInSec: MediaTicket.DEFAULT_TTL_SECONDS,
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

module.exports = router;
