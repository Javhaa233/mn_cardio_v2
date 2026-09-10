const { Models, Op } = require('../config/DB');

const BaseControllerHelper = require('./BaseControllerHelper');

/**
 * The single place the Users / PatientUsers id collision is resolved.
 *
 * helper/Auth.js:8-10 states the problem:
 *
 *     "Patients live in PatientUsers and staff in Users; both are IDENTITY
 *      columns starting at 1, so ids collide across the tables. Every cache
 *      entry and every lookup must therefore be qualified by role."
 *
 * ChatRoomTooUsers.UserId and ChatMessages.UserId are bare integers, so a
 * participant is only meaningful as the PAIR (UserType, UserId). Every chat
 * query keys on that pair, and it always comes from the verified session -
 * never from a request body. That is the same principle /api/patient/* is built
 * on, and it is why a patient cannot ask for someone else's conversation: there
 * is nowhere in the request to put the identifier.
 *
 * For UserType 'P', UserId is Patient.id_data - NOT PatientUsers.Id. See
 * scripts/add_chat_v2_columns.sql for why: under DAN there may be no
 * PatientUsers row at all (Auth.resolvePatientSession, helper/Auth.js:70-104),
 * while PatientId is populated on both authentication paths, and
 * helper/PatientScope.js already keys every legacy clinical table the same way.
 */

const STAFF = 'S';
const PATIENT = 'P';

// Roles that may participate in chat as staff. CLAUDE.md §3: 1 admin,
// 2 and 3 doctor tiers, 5 profile-only, 6 settings/admin-config.
//
// Role 5 is deliberately absent - it is a profile-only account with no clinical
// role, so it resolves to null and reaches no room. That default is flagged to
// ZSUT for confirmation; widening it is one entry in this array.
const STAFF_ROLES = ['1', '2', '3', '6'];

const PATIENT_ROLE = '4';

class ChatIdentity {
  /**
   * The caller's chat identity, derived from req.LogedUser alone.
   *
   * Returns null when the session cannot be resolved to a participant, and
   * callers MUST refuse the request in that case rather than degrade to an
   * unscoped query. This is the same fail-closed rule helper/RequirePatient.js
   * applies to a patient session with no PatientId.
   */
  Me = function (LogedUser) {
    if (!LogedUser) return null;

    const RoleId = String(LogedUser.RoleId);

    if (RoleId === PATIENT_ROLE) {
      // A patient account with no linked Patient row cannot be scoped.
      if (!LogedUser.PatientId) return null;
      return { UserType: PATIENT, UserId: parseInt(LogedUser.PatientId, 10) };
    }

    if (STAFF_ROLES.indexOf(RoleId) === -1) return null;
    if (!LogedUser.Id) return null;

    return { UserType: STAFF, UserId: parseInt(LogedUser.Id, 10) };
  };

  IsStaff = function (Participant) {
    return !!Participant && Participant.UserType === STAFF;
  };

  IsPatient = function (Participant) {
    return !!Participant && Participant.UserType === PATIENT;
  };

  IsValidType = function (UserType) {
    return UserType === STAFF || UserType === PATIENT;
  };

  /**
   * Stable map key for a participant. 'S:12' / 'P:4471'.
   */
  Key = function (Participant) {
    if (!Participant) return null;
    return Participant.UserType + ':' + Participant.UserId;
  };

  Same = function (A, B) {
    if (!A || !B) return false;
    return A.UserType === B.UserType && String(A.UserId) === String(B.UserId);
  };

  /**
   * Normalise a (UserType, UserId) pair that arrived over the wire.
   *
   * Used for the TARGET of StartChat and the member routes - never for the
   * caller, whose identity comes from Me(). Returns null on anything malformed,
   * so a missing or junk UserType is a refusal rather than a silent 'S'.
   */
  FromRequest = function (UserType, UserId) {
    const Id = parseInt(UserId, 10);
    if (!this.IsValidType(UserType)) return null;
    if (!Id || Number.isNaN(Id) || Id < 1) return null;
    return { UserType, UserId: Id };
  };

  /**
   * Resolve display information for many participants at once.
   *
   * Three queries regardless of how many participants are passed - staff,
   * patients, avatars - because the alternative is the per-row lookup that
   * makes GetChatRoomList an N+1 today (ChatController.js:113-144, one
   * findAllNew per room plus one uncached sharp resize per member).
   *
   * Returns Map<Key, {UserType, UserId, Name, RoleId, ProfileId,
   *                   OrganizationId, profession, position, ImageSrc}>.
   * A participant that no longer resolves (deleted account) is simply absent
   * from the map; callers fall back to a placeholder name rather than failing.
   */
  ResolveMany = async function (Participants) {
    const Result = new Map();
    if (!Participants || Participants.length === 0) return Result;

    const StaffIds = [];
    const PatientIds = [];
    const Seen = new Set();

    for (let i = 0; i < Participants.length; i++) {
      const P = Participants[i];
      if (!P || !this.IsValidType(P.UserType)) continue;
      const K = this.Key(P);
      if (Seen.has(K)) continue;
      Seen.add(K);
      if (P.UserType === STAFF) StaffIds.push(parseInt(P.UserId, 10));
      else PatientIds.push(parseInt(P.UserId, 10));
    }

    // --- 1. Staff -----------------------------------------------------------
    // Two queries, not a join: model/BaseModel/Users.js declares associations to
    // UserToRole, Roles, Apps and CreateUser only - there is NO Users ->
    // DoctorsProfile association anywhere in model/, so an include would throw
    // EagerLoadingError. helper/Auth.js:142 has the same problem and solves it
    // the same way, with a separate DoctorsProfile.findOne.
    //
    // The profile is optional on purpose: an admin account with no
    // DoctorsProfile row still has to resolve to a name, or they vanish from
    // their own conversations.
    const ProfileIds = [];
    if (StaffIds.length > 0) {
      const StaffRows = await Models.Users.findAll({
        attributes: ['Id', 'UserName', 'RoleId'],
        where: { Id: { [Op.in]: StaffIds } },
        raw: true,
      });

      // `UserId` is the model attribute for the DB column `id`
      // (model/Doctor/DoctorsProfile.js:11) - filter on the attribute, not the
      // column, or Sequelize builds the wrong predicate.
      const ProfileRows = await Models.DoctorsProfile.findAll({
        attributes: [
          'id_data',
          'UserId',
          'lastname',
          'firstname',
          'profession',
          'position',
          'organisation',
          'OrganizationId',
        ],
        where: { UserId: { [Op.in]: StaffIds } },
        raw: true,
      });

      const ProfileByUserId = new Map();
      for (let i = 0; i < ProfileRows.length; i++) {
        // First profile per user wins - a user should have exactly one.
        if (!ProfileByUserId.has(ProfileRows[i].UserId)) {
          ProfileByUserId.set(ProfileRows[i].UserId, ProfileRows[i]);
        }
      }

      for (let i = 0; i < StaffRows.length; i++) {
        const R = StaffRows[i];
        const D = ProfileByUserId.get(R.Id) || null;
        const Entry = {
          UserType: STAFF,
          UserId: R.Id,
          // FullName is a VIRTUAL with a getter, and `raw: true` bypasses
          // getters - so it is built here with the same formula the model uses
          // (DoctorsProfile.js:47) rather than read off the row.
          Name: D ? this.BuildStaffName(D.lastname, D.firstname, R.UserName) : R.UserName,
          RoleId: R.RoleId,
          ProfileId: D ? D.id_data : null,
          OrganizationId: D ? D.OrganizationId : null,
          profession: D ? D.profession : null,
          position: D ? D.position : null,
          OrganizationName: D ? D.organisation : null,
          ImageSrc: '',
        };
        Result.set(this.Key(Entry), Entry);
        if (Entry.ProfileId) ProfileIds.push(Entry.ProfileId);
      }
    }

    // --- 2. Patients --------------------------------------------------------
    if (PatientIds.length > 0) {
      const PatientRows = await Models.Patient.findAll({
        attributes: ['id_data', 'p_lastname', 'p_firstname', 'p_registration'],
        where: { id_data: { [Op.in]: PatientIds } },
        raw: true,
      });

      for (let i = 0; i < PatientRows.length; i++) {
        const R = PatientRows[i];
        const Entry = {
          UserType: PATIENT,
          UserId: R.id_data,
          Name: this.BuildStaffName(R.p_lastname, R.p_firstname, R.p_registration),
          RoleId: 4,
          ProfileId: null,
          OrganizationId: null,
          profession: null,
          position: null,
          OrganizationName: null,
          ImageSrc: '',
        };
        Result.set(this.Key(Entry), Entry);
      }
    }

    // --- 3. Avatars ---------------------------------------------------------
    // One File query for every doctor in the batch, then one cached-thumbnail
    // pass.
    //
    // Deliberately NOT BaseControllerHelper.GetConfigData('DoctorsProfile') the
    // way ChatController.js:112 does today: that hydrates four OptionType
    // lookups plus every Config.Model.findAll() on the config, per request, to
    // discover one field name we already know is 'Files'.
    //
    // GetFileSrcThumbnailCached, not GetFileSrcThumbnail: the uncached variant
    // runs sharp per image per request, measured at 30-40ms each in the comment
    // at BaseControllerHelper.js:898-915. The current room list calls the
    // uncached one, once per member, per room.
    if (ProfileIds.length > 0) {
      try {
        const AvatarFiles = await Models.File.findAll({
          attributes: [
            'id_data',
            'ext',
            'original_name',
            'generated_name',
            'size',
            'LinkedObjectName',
            'LinkedObjectId',
            'FieldName',
          ],
          where: {
            LinkedObjectId: { [Op.in]: ProfileIds },
            LinkedObjectName: 'DoctorsProfile',
            FieldName: 'Files',
            rec_status: '9',
          },
          raw: true,
        });

        if (AvatarFiles.length > 0) {
          const Thumbs = await BaseControllerHelper.GetFileSrcThumbnailCached(AvatarFiles, 25);
          const ByProfileId = new Map();
          for (let i = 0; i < Thumbs.length; i++) {
            const T = Thumbs[i];
            if (!T || !T.FileSrc || !T.FileInfo) continue;
            // First file per profile wins; the field is a SingleImage.
            if (!ByProfileId.has(T.FileInfo.LinkedObjectId)) {
              ByProfileId.set(T.FileInfo.LinkedObjectId, T.FileSrc);
            }
          }
          Result.forEach((Entry) => {
            if (Entry.ProfileId && ByProfileId.has(Entry.ProfileId)) {
              Entry.ImageSrc = ByProfileId.get(Entry.ProfileId);
            }
          });
        }
      } catch (ex) {
        // An avatar is decoration. A failure to read one must not cost someone
        // their message list.
        console.log('ChatIdentity.ResolveMany avatar error:', ex.message);
      }
    }

    return Result;
  };

  /**
   * "B.Bataa" - the same shape DoctorsProfile.FullName and Patient.FullName
   * produce, built here because `raw: true` bypasses VIRTUAL getters.
   */
  BuildStaffName = function (LastName, FirstName, Fallback) {
    const L = LastName ? String(LastName).trim() : '';
    const F = FirstName ? String(FirstName).trim() : '';
    const Name = (L ? L.substring(0, 1) + '.' : '') + F;
    return Name.trim() ? Name : Fallback || '';
  };

  /**
   * Convenience for a single participant. Prefer ResolveMany in any loop.
   */
  ResolveOne = async function (Participant) {
    const Map_ = await this.ResolveMany([Participant]);
    return Map_.get(this.Key(Participant)) || null;
  };
}

module.exports = new ChatIdentity();
module.exports.STAFF = STAFF;
module.exports.PATIENT = PATIENT;
