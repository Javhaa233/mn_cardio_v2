/**
 * Who may create an account, change a role, or write somebody else's account.
 *
 * Accounts are granted by approval only (UserRequest/Confirm, role 1). Before
 * this guard, any valid token could mint one through the generic CRUD path:
 * POST /BaseObject/create {ObjectName:'Users', RoleId:1}, or a DoctorsProfile
 * create, whose ensureUserForDoctor quietly adds a Users row with the caller's
 * RoleId. BaseCreate / BaseUpdate / BaseDelete ask this before touching the
 * table, so every route that reaches them - BaseObject, DoctorProfile/Custom* -
 * is covered by one rule instead of one check per controller.
 *
 * What a non-admin may still do is edit THEIR OWN account: the language toggle
 * (Users {Id, Language}) and the profile dialog (DoctorsProfile {id_data, ...}).
 * Fields that grant access - role, password, user name, active flag, the link
 * between profile and user - are dropped from those writes, not refused, so an
 * ordinary save that happens to carry one still goes through.
 *
 * CheckCreate / CheckUpdate throw an Error with .Message set, the shape
 * BaseController already reports.
 */

const ADMIN_ROLE = '1';

// Objects nobody but an administrator may create or delete.
const ACCOUNT_OBJECTS = ['Users', 'DoctorsProfile', 'UserRequests'];

// Dropped from a non-admin's write to their own record.
const USER_PROTECTED = [
  'RoleId',
  'Password',
  'UserName',
  'IsActive',
  'AppId',
  'UserTypeId',
  'ForgotPassToken',
  'ForgotPassExpireDate',
  'FailedLoginCount',
  'LastFailedLogin',
  'LockedUntil',
  'LockNotifiedDate',
  'CreateUserId',
];
const PROFILE_PROTECTED = [
  'RoleId',
  'Password',
  'UserName',
  'IsActive',
  'Users',
  'UserData',
  // Re-pointing the profile at another Users row would let ensureUserForDoctor
  // rewrite that user's name and email.
  'id',
  'UserId',
  // Licence codes have their own endpoint with its own rules (SetLicense).
  'LicenseCode',
  'LicenseIssuedDate',
  'LicenseExpireDate',
  'LicenseVerifiedDate',
  'LicenseVerifiedUserId',
  'LicenseSource',
];

function IsAdmin(LogedUser) {
  return !!LogedUser && String(LogedUser.RoleId) === ADMIN_ROLE;
}

function Refuse(Message) {
  const error = new Error(Message);
  error.Message = Message;
  return error;
}

function Strip(Data, Keys) {
  Keys.forEach((Key) => {
    if (Object.prototype.hasOwnProperty.call(Data, Key)) delete Data[Key];
  });
}

/** Call at the top of BaseCreate. */
function CheckCreate(ObjectName, LogedUser) {
  if (ACCOUNT_OBJECTS.includes(ObjectName) && !IsAdmin(LogedUser)) {
    throw Refuse('Хэрэглэгчийн эрх зөвхөн админ баталгаажуулж үүсгэнэ');
  }
}

/** BaseDelete reports a refusal as null, so this answers rather than throws. */
function MayDelete(ObjectName, LogedUser) {
  return !ACCOUNT_OBJECTS.includes(ObjectName) || IsAdmin(LogedUser);
}

/*
 * Reading is a separate question from writing, and only one object is closed.
 *
 * A sign-up request holds a person's registration number, email, phone and
 * licence before anyone has decided they belong in the system, and the whole
 * queue was readable by any staff token through /BaseObject. Users and
 * DoctorsProfile stay readable: lookups, pickers and grids across the app
 * depend on them, and restricting those is a different piece of work.
 */
const READ_ADMIN_ONLY = ['UserRequests'];

function MayRead(ObjectName, LogedUser) {
  return !READ_ADMIN_ONLY.includes(ObjectName) || IsAdmin(LogedUser);
}

/**
 * Call at the top of BaseUpdate. Mutates Data: a non-admin's write loses the
 * protected keys and must target their own record.
 */
function CheckUpdate(ObjectName, Data, LogedUser) {
  if (!ACCOUNT_OBJECTS.includes(ObjectName) || IsAdmin(LogedUser)) return;

  const NotYours = Refuse('Өөр хэрэглэгчийн бүртгэлийг засах эрхгүй');

  if (ObjectName === 'UserRequests') throw NotYours;

  if (ObjectName === 'Users') {
    if (!LogedUser || !Data || String(Data.Id) !== String(LogedUser.Id)) throw NotYours;
    Strip(Data, USER_PROTECTED);
    return;
  }

  if (ObjectName === 'DoctorsProfile') {
    const Own = LogedUser && LogedUser.Doctor && LogedUser.Doctor.id_data;
    if (!Own || !Data || String(Data.id_data) !== String(Own)) throw NotYours;
    Strip(Data, PROFILE_PROTECTED);
  }
}

module.exports = { IsAdmin, CheckCreate, CheckUpdate, MayDelete, MayRead };
