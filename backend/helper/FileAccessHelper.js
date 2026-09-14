/**
 * Who may read, or attach, a file.
 *
 * MOVED OUT OF controllers/system/BaseController.js UNCHANGED on 2026-09-14.
 * Both functions were module-private there, which was fine while /BaseObject
 * was the only thing serving files. It is not any more: controllers/system/
 * MediaController.js streams rehabilitation video with byte ranges, and it has
 * to answer the SAME question about the SAME file.
 *
 * Reimplementing that question in the second place is how two copies of an
 * authorization rule drift until one of them is wrong. helper/AdviceScopeHelper.js
 * exists for exactly this reason - its own header records that the Advice rules
 * had to come out of a controller before anything else could reuse them - and
 * helper/CareTeam.js was extracted from ChatController on the same argument.
 *
 * The logic is byte-for-byte what it was. The only addition is the
 * RehabExercise branch in MayAttachTo, and that is called out where it sits.
 */

const { Models } = require('../config/DB');

const BaseControllerHelper = require('./BaseControllerHelper');
const ChatIdentity = require('./ChatIdentity');
const ChatHelper = require('./ChatHelper');
const AdviceScopeHelper = require('./AdviceScopeHelper');
const PatientScope = require('./PatientScope');
const Flags = require('./FeatureFlags');

/**
 * Objects whose files belong to everybody rather than to one patient.
 *
 * Keep this list very short and justify every entry. Anything here skips the
 * ownership check, so the test for membership is "would it be wrong for two
 * different patients to see the same file?" - for a demonstration video the
 * answer is no; for anything clinical it is yes.
 */
const SHARED_CONTENT = ['RehabExercise'];

/**
 * May this user attach to / replace the files of this object?
 *
 * The endpoint is generic and shared by 8 models, so this deliberately gates
 * only what it can check with certainty and leaves everything else at the
 * previous behaviour. Widening it is a separate, per-model decision - silently
 * denying an existing clinical file flow would be worse than the hole it closes.
 */
async function MayAttachTo({ LinkedObjectName, LinkedObjectId, LogedUser, Mode }) {
  // ABOVE the admin short-circuit on purpose: an administrator is not a chat
  // participant, and must not be able to plant a file on someone else's
  // conversation. This is also the specific closure of the `return true`
  // fallthrough at the bottom of this function for chat - without it,
  // LinkedObjectName 'ChatMessages' would have been permitted with no check at
  // all.
  if (LinkedObjectName === 'ChatMessages') {
    const Message = await Models.ChatMessages.findByPk(LinkedObjectId, {
      attributes: ['Id', 'ChatRoomId', 'UserId', 'UserType', 'Status'],
      raw: true,
    });
    if (!Message) return false;

    const Me = ChatIdentity.Me(LogedUser);
    if (!Me) return false;

    // Author only.
    if (!ChatIdentity.Same(Me, { UserType: Message.UserType, UserId: Message.UserId })) {
      return false;
    }
    // Files may only be bolted onto a message that is still pending delivery -
    // never onto one recipients have already seen.
    if (Message.Status !== 'P') return false;

    // ...and you must still be in the room.
    return !!(await ChatHelper.IsMember(Me, Message.ChatRoomId));
  }

  /*
   * The rehabilitation exercise catalogue is SHARED CONTENT, not somebody's
   * record - one video of a physiotherapist demonstrating an exercise, shown to
   * every patient in the programme. It is the only object here where a read is
   * deliberately not ownership-scoped.
   *
   * Writing is the opposite: seeding the catalogue is an administrator's job,
   * so attaching is admin-only. That asymmetry is the whole reason this branch
   * sits ABOVE the admin short-circuit below rather than relying on it.
   */
  if (LinkedObjectName === 'RehabExercise') {
    if (Mode === 'read') return true;
    return String(LogedUser.RoleId) === '1';
  }

  if (String(LogedUser.RoleId) === '1') return true;

  if (LinkedObjectName === 'Advice') {
    const Advice = await Models.Advice.findOne({
      where: { id_data: LinkedObjectId },
      attributes: ['id_data', 'id'],
      raw: true,
    });
    // Unknown id: refuse rather than let it create orphan File rows.
    if (!Advice) return false;
    return String(Advice.id) === String(LogedUser.Id);
  }

  if (LinkedObjectName === 'AdviceComment') {
    const Comment = await Models.AdviceComment.findOne({
      where: { id_data: LinkedObjectId },
      attributes: ['id_data', 'id'],
      raw: true,
    });
    if (!Comment) return false;
    return String(Comment.id) === String(LogedUser.Id);
  }

  // THE PERMISSIVE DEFAULT, and the last real gap in this file.
  //
  // Everything not named above is allowed for staff. Patients are still covered
  // downstream - MayDownload applies PatientScope separately - so the exposure
  // is staff-to-staff across the clinical models this endpoint serves.
  //
  // It is NOT closed yet, on purpose. This endpoint is shared by eight models,
  // those models are not enumerated anywhere in the code, and they do not share
  // an ownership column, so there is no generic check to apply. Guessing an
  // allowlist here would silently deny an existing clinical attachment flow,
  // which this function's own header correctly calls the worse outcome.
  //
  // So: measure first. FILE_ATTACH_STRICT defaults to 'warn', which logs every
  // object name that reaches this line and denies nothing. After a period of
  // real traffic the log names the objects actually in use, the allowlist can
  // be written from evidence rather than guesswork, and 'enforce' becomes safe.
  if (Flags.FileAttachStrict !== 'off') {
    // console.error so it survives the production console.log override.
    console.error(
      '[MayAttachTo] permissive default hit - object=' +
        String(LinkedObjectName) +
        ' id=' +
        String(LinkedObjectId) +
        ' user=' +
        String(LogedUser.Id) +
        ' role=' +
        String(LogedUser.RoleId) +
        (Flags.FileAttachStrict === 'enforce' ? ' -> DENIED' : ' -> allowed (warn mode)')
    );
  }

  if (Flags.FileAttachStrict === 'enforce') return false;

  return true;
}

/**
 * Whether LogedUser may read the file the client is asking for.
 *
 * downloadFile used to pass the client-supplied FileInfo straight to
 * BaseDownloadFile, which only resolves a path on disk. Nothing tied the
 * handle back to a record, so any authenticated session could name any
 * generated_name and fetch it - proven by a patient token downloading a file
 * attached to a doctor's record.
 *
 * So: resolve the handle to its File row first, then authorize the record it
 * hangs off. Returns the stored row (never the client's copy) or null.
 */
async function MayDownload({ FileInfo, LogedUser }) {
  if (!FileInfo || !FileInfo.generated_name) return null;

  const Stored = await Models.File.findOne({
    where: { generated_name: FileInfo.generated_name },
    attributes: [
      'id_data',
      'LinkedObjectName',
      'LinkedObjectId',
      'FieldName',
      'ext',
      'generated_name',
      'original_name',
      'rec_status',
    ],
    raw: true,
  });

  // No row, or soft-deleted: the handle is not a live attachment.
  if (!Stored || String(Stored.rec_status) === '2') return null;

  const LinkedObjectName = Stored.LinkedObjectName;
  const LinkedObjectId = Stored.LinkedObjectId;
  if (!LinkedObjectName || !LinkedObjectId) return null;

  /*
   * Асуумж attachments follow the rule for READING the ticket, not the rule
   * for attaching to it. MayAttachTo is author-or-admin, which is right for a
   * write and wrong for a read: the feed is a consult board where doctors open
   * each other's tickets to look at the films on them, so the attach rule would
   * have 403'd every colleague. AdviceScopeHelper owns that rule, patients
   * included, so it returns here rather than falling through to the generic
   * patient check below.
   */
  if (LinkedObjectName === 'Advice' || LinkedObjectName === 'AdviceComment') {
    const MayRead = await AdviceScopeHelper.MayReadAdviceAttachment({
      LinkedObjectName,
      LinkedObjectId,
      LogedUser,
    });
    return MayRead ? Stored : null;
  }

  // Same rule that governs attaching a file to this record.
  const Allowed = await MayAttachTo({ LinkedObjectName, LinkedObjectId, LogedUser, Mode: 'read' });
  if (!Allowed) return null;

  // MayAttachTo ends in `return true` for object types it does not name, which
  // is the right default for staff but not for patients - it is what let a
  // patient token through to a doctor's attachment. Patients get the explicit
  // scope check as well.
  if (PatientScope.IsPatient(LogedUser)) {
    /*
     * SHARED CONTENT IS THE EXCEPTION, and it has to be named here or the
     * feature does not work.
     *
     * The check below demands a PatientScope entry, and refuses when there is
     * none - correct for a clinical record, which must belong to somebody. The
     * rehabilitation catalogue belongs to nobody: it is one demonstration video
     * shown to every patient in the programme, so it has no ownership column
     * and never will. Without this line MayAttachTo would say yes and then this
     * would say no, and every patient would be refused the exact file the
     * module exists to deliver.
     */
    if (SHARED_CONTENT.includes(LinkedObjectName)) return Stored;

    const scope = PatientScope.SCOPE_BY_OBJECT[LinkedObjectName];
    if (!scope) return null;

    const Owner = LogedUser[scope.From];
    if (Owner === undefined || Owner === null || Owner === '') return null;

    const ModelConfig = await BaseControllerHelper.GetConfigData(LinkedObjectName);
    if (!ModelConfig || !ModelConfig.Model) return null;

    const Row = await ModelConfig.Model.findOne({
      where: { [ModelConfig.PK]: LinkedObjectId },
      attributes: [ModelConfig.PK, scope.Field],
      raw: true,
    });
    if (!Row || String(Row[scope.Field]) !== String(Owner)) return null;
  }

  return Stored;
}
module.exports = { MayAttachTo, MayDownload };
