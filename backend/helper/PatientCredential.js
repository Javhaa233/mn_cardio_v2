/**
 * Patient portal login slip - one place that issues a patient's password.
 *
 * Until ДАН/ХУР login lands, a patient signs in to the portal with their
 * register number and a password printed on the discharge or visit sheet.
 * Three print paths used to mint that password independently, each with
 * `Math.random().toString(36)` - lowercase, look-alike characters, sometimes
 * shorter than 8 - and two of them rotated it on EVERY print, so a reprint
 * silently broke the sheet the patient was already carrying.
 *
 * The rule now:
 *   - the password is 6 digits, because patients type it on a phone one
 *     character at a time;
 *   - it is issued ONCE per record (a discharge, a stay, a visit). The first
 *     print of that record issues it; reprints of the same record print the
 *     login name only. Whether a record already issued one is read from the
 *     UserActionHistory trail this helper writes, so no schema change;
 *   - only a RECENT record (last 30 days) issues automatically, so reprinting
 *     an archived discharge does not replace the password in use today;
 *   - a doctor can reissue explicitly (the patient lost the sheet). Issuing
 *     replaces the previous password - only the newest sheet works.
 *
 * Only the bcrypt hash is stored (PatientUsersConfig declares Password as
 * Type 'Password', so BaseCreate/BaseUpdate hash it). The cleartext exists in
 * the return value and on the printed sheet, nowhere else - never log it.
 *
 * TRANSITIONAL - retires with the password path when ДАН login arrives.
 */
const crypto = require('crypto');

const { Models } = require('../config/DB');
const BaseControllerHelper = require('./BaseControllerHelper');
const ObjectHelper = require('./ObjectHelper');

const ISSUE_ACTION = 'IssueCredential';
const VALID_MONTHS = 6;

function NewPassword() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, '0');
}

// The register number is the login name. Patients type it with spaces, in
// lowercase, or with a trailing space from autocomplete; none of that should
// be a failed login. Upper-casing is locale-aware because the letters are
// Cyrillic (ОЭ50051707).
function NormalizeUserName(Value) {
  if (Value === undefined || Value === null) return Value;
  return String(Value).replace(/\s+/g, '').toLocaleUpperCase('mn-MN');
}

// The slip prints the password grouped as "482 917"; accept it typed that way.
function NormalizePassword(Value) {
  if (Value === undefined || Value === null) return Value;
  return String(Value).replace(/\s+/g, '');
}

function ExpireDate(From) {
  const Base = From ? new Date(From) : new Date();
  const Start = isNaN(Base.getTime()) ? new Date() : Base;
  Start.setMonth(Start.getMonth() + VALID_MONTHS);
  return ObjectHelper.getDateYMD({ Date: Start });
}

// A record whose date (discharge, visit) is more than this far back is an
// archive reprint, not the patient leaving today.
const AUTO_ISSUE_DAYS = 30;

function IsOld(RecordDate) {
  if (!RecordDate) return false;
  const When = new Date(RecordDate);
  if (isNaN(When.getTime())) return false;
  return Date.now() - When.getTime() > AUTO_ISSUE_DAYS * 24 * 60 * 60 * 1000;
}

async function HasAccount(PatientId) {
  const Patient = await Models.Patient.findByPk(PatientId, {
    attributes: ['user_id'],
    raw: true,
  });
  if (!Patient || !Patient.user_id) return false;
  const User = await Models.PatientUsers.findByPk(Patient.user_id, {
    attributes: ['Id'],
    raw: true,
  });
  return !!User;
}

async function IssuedFor(LinkObjectName, LinkObjectId) {
  if (!LinkObjectName || !LinkObjectId) return false;
  const Row = await Models.UserActionHistory.findOne({
    where: { LinkObjectName, LinkObjectId, Action: ISSUE_ACTION },
    attributes: ['Id'],
    raw: true,
  });
  return !!Row;
}

// The login name the account actually has, which for accounts made before
// this helper can differ from the register number as typed on the patient.
async function LoginName(PatientId) {
  if (!PatientId) return null;
  const Patient = await Models.Patient.findByPk(PatientId, {
    attributes: ['p_registration', 'user_id'],
    raw: true,
  });
  if (!Patient) return null;
  if (Patient.user_id) {
    const User = await Models.PatientUsers.findByPk(Patient.user_id, {
      attributes: ['UserName'],
      raw: true,
    });
    if (User && User.UserName) return User.UserName;
  }
  return Patient.p_registration || null;
}

/**
 * Creates the patient's portal account if it is missing, otherwise replaces
 * its password. Returns { UserName, Password, ExpireDate }, or null when the
 * patient does not exist or has no register number to log in with.
 *
 * LinkObjectName/LinkObjectId name the record the sheet belongs to, which is
 * what IssuedFor later checks. Reason 'Reissue' marks a doctor's explicit
 * request rather than a first print.
 */
async function Issue({ PatientId, LogedUser, LinkObjectName, LinkObjectId, ExpireFrom, Reason }) {
  if (!PatientId || !LogedUser) return null;

  const Patient = await Models.Patient.findByPk(PatientId, {
    attributes: ['id_data', 'p_registration', 'p_firstname', 'p_lastname', 'user_id'],
    raw: true,
  });
  if (!Patient || !Patient.p_registration) return null;

  const Password = NewPassword();
  const PassExpireDate = ExpireDate(ExpireFrom);
  let UserName = null;

  const Existing = Patient.user_id
    ? await Models.PatientUsers.findByPk(Patient.user_id, {
        attributes: ['Id', 'UserName'],
        raw: true,
      })
    : null;

  if (Existing) {
    await BaseControllerHelper.BaseUpdate({
      ObjectName: 'PatientUsers',
      Data: { Id: Existing.Id, Password, PassExpireDate },
      LogedUser,
      SaveLog: true,
    });
    UserName = Existing.UserName;
  } else {
    UserName = NormalizeUserName(Patient.p_registration);
    const CreatedId = await BaseControllerHelper.BaseCreate({
      ObjectName: 'PatientUsers',
      Data: {
        UserName,
        LastName: Patient.p_lastname,
        FirstName: Patient.p_firstname,
        Password,
        PassExpireDate,
        Email: null,
        UserTypeId: 3,
        IsActive: '1',
        RoleId: '4',
        Language: 'en',
      },
      LogedUser,
      SaveLog: true,
    });
    if (!CreatedId) return null;
    await Models.Patient.update({ user_id: CreatedId }, { where: { id_data: PatientId } });
  }

  const IsReissue = Reason === 'Reissue';
  await BaseControllerHelper.CreateUserActionHistory({
    LinkObjectName: LinkObjectName || 'Patient',
    LinkObjectId: LinkObjectId || PatientId,
    Action: ISSUE_ACTION,
    LogedUser,
    PatientId,
    Notes: IsReissue
      ? 'Reissued patient portal password on request'
      : 'Issued patient portal password on the printed sheet',
    NotesMn: IsReissue
      ? 'Өвчтөний порталын нууц үгийг шинээр олгов'
      : 'Хэвлэмэл хуудсанд өвчтөний порталын нууц үг олгов',
  });

  return { UserName, Password, ExpireDate: PassExpireDate };
}

/**
 * The print paths' rule: issue on the first print of a record, print the
 * login name only on every reprint. Returns the same shape as Issue, with
 * Password null when the record already issued one.
 */
async function IssueOnce(Args) {
  const Earlier = {
    UserName: await LoginName(Args.PatientId),
    Password: null,
    ExpireDate: null,
    AlreadyIssued: true,
  };
  if (await IssuedFor(Args.LinkObjectName, Args.LinkObjectId)) return Earlier;

  // Reprinting an old record from the archive (a discharge from last year)
  // must not replace the password the patient is using today. Only a recent
  // record issues automatically - unless the patient has no account at all.
  if (IsOld(Args.ExpireFrom) && (await HasAccount(Args.PatientId))) return Earlier;

  const Result = await Issue(Args);
  return Result ? { ...Result, AlreadyIssued: false } : null;
}

module.exports = {
  NewPassword,
  NormalizeUserName,
  NormalizePassword,
  LoginName,
  IssuedFor,
  Issue,
  IssueOnce,
};
