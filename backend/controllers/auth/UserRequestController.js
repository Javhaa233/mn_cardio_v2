const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');
const Sequelize = require('sequelize');
const { Models, Op, sequelize } = require('../../config/DB');

const Auths = require('../../helper/Auth');
const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const MailHelper = require('../../helper/MailHelper');
const { EMAIL_REGEX, CheckContact } = require('../../helper/ContactValidation');
const { PasswordRegex, RequirementMessageMn } = require('../../helper/PasswordPolicy');
const AccountWriteGuard = require('../../helper/AccountWriteGuard');
const RegistrationRequest = require('../../helper/RegistrationRequest');
const PasswordResetLink = require('../../helper/PasswordResetLink');

/**
 * Doctor self-registration ("Бүртгүүлэх").
 *
 *   Register   (public)  a doctor applies and chooses their own password. Only a
 *                        UserRequests row is written - there is no account yet,
 *                        so nothing can log in on an unapproved request.
 *   Confirm    (role 1)  creates Users + DoctorsProfile from the request, reusing
 *                        the applicant's password hash unchanged.
 *   Decline    (role 1)  closes the request with a reason the applicant is shown.
 *
 * Doctors only. Citizens sign in through ХУР / ДАН, not here.
 */

const { STATUS } = RegistrationRequest;
const DOCTOR_ROLES = [2, 3];
const DICT_MODELS = {
  DictProvinceCity: ['name'],
  DictSoumDistrict: ['id_province'],
  DictBagKhoroo: ['id_soum'],
};
// Регистрийн дугаар: two Cyrillic letters and eight digits.
const REGISTRATION_REGEX = /^[А-ЯЁӨҮ]{2}\d{8}$/i;

function Fail(res, Message) {
  return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult(Message)));
}

function Clean(Value) {
  if (Value === undefined || Value === null) return null;
  const Text = String(Value).trim();
  return Text === '' ? null : Text;
}

function EscapeHtml(Value) {
  return String(Value || '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );
}

// Case-insensitive match on Email, so the check does not depend on the
// database collation.
function EmailWhere(Email) {
  return Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('Email')), Email.toLowerCase());
}

// Returns an error message if the email is already taken, otherwise null.
// A blank email is not considered a duplicate — it is simply not registered.
async function FindDuplicateEmail(Email, { IgnoreRequestId } = {}) {
  const Trimmed = Email ? String(Email).trim() : '';
  if (!Trimmed) return null;

  const ExistingUser = await Models.Users.findOne({ where: EmailWhere(Trimmed), raw: true });
  if (ExistingUser) return 'The email address is already registered';

  const RequestWhere = {
    [Op.and]: [
      EmailWhere(Trimmed),
      // ignore declined requests, they no longer hold the email
      { IsActive: { [Op.not]: STATUS.Declined } },
    ],
  };
  if (IgnoreRequestId) {
    RequestWhere[Op.and].push({ Id: { [Op.not]: IgnoreRequestId } });
  }

  const ExistingRequest = await Models.UserRequests.findOne({ where: RequestWhere, raw: true });
  if (ExistingRequest) return 'A registration request with this email already exists';

  return null;
}

// A user name is taken by an account, or by a request that is not declined.
async function IsUserNameTaken(UserName) {
  const UserCount = await Models.Users.count({ where: { UserName } });
  if (UserCount > 0) return true;
  const RequestCount = await Models.UserRequests.count({
    where: { UserName, IsActive: { [Op.not]: STATUS.Declined } },
  });
  return RequestCount > 0;
}

// An organization a doctor can belong to: exists, and not merged away.
async function FindOrganization(Id) {
  const OrgId = parseInt(Id, 10);
  if (!OrgId) return null;
  return Models.Organization.findOne({
    where: { Id: OrgId, IsActive: true, MergedIntoId: null },
    attributes: ['Id', 'Name'],
    raw: true,
  });
}

// Mail is best-effort everywhere here: the request or decision is already
// saved, and a broken SMTP host must not undo it or turn it into an error.
async function Notify(To, Subject, Body) {
  const Email = To ? String(To).trim() : '';
  if (!Email || !EMAIL_REGEX.test(Email)) return false;
  const Sent = await MailHelper.SendMail({
    to: Email,
    subject: Subject,
    html: `Сайн байна уу<br /><br />${Body}<br /><br />MnCardio системийг ашиглаж байгаа танд баярлалаа.`,
  });
  if (Sent === null) {
    console.error('[UserRequestController] Mail send failed:', MailHelper.LastError);
    return false;
  }
  return true;
}

function LoginLink() {
  const Link = (process.env.CLIENT_APP_URL || '') + 'auth/login';
  return `<a target="_blank" href="${Link}">${Link}</a>`;
}

// routes
router.post('/CheckUserName', CheckUserName);
router.post('/GetProvinceData', GetProvinceData);
router.post('/GetOrganizations', GetOrganizations);
router.post('/Register', Register);
router.post('/Review', Auths.verifyToken, Review);
router.post('/Confirm', Auths.verifyToken, Confirm);
router.post('/Decline', Auths.verifyToken, Decline);
router.post('/ConfirmMany', Auths.verifyToken, ConfirmMany);
router.post('/DeclineMany', Auths.verifyToken, DeclineMany);
router.post('/DeleteMany', Auths.verifyToken, DeleteMany);
router.post('/PendingCount', Auths.verifyToken, PendingCount);

async function CheckUserName(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [], Option: {} };
    const { UserName, Email } = req.body;
    if (UserName) {
      if (await IsUserNameTaken(String(UserName).trim())) {
        return Fail(res, 'Usernames should not be duplicated');
      }
    }
    if (Email) {
      if (!EMAIL_REGEX.test(String(Email).trim())) {
        return Fail(res, 'The email address is invalid');
      }
      const DuplicateEmail = await FindDuplicateEmail(Email);
      if (DuplicateEmail) return Fail(res, DuplicateEmail);
    }
    return res.send(result);
  } catch (ex) {
    console.log(ex);
    return Fail(res);
  }
}

// Public, so it reads only the three address dictionaries, filtered only on
// the column the cascade needs. It used to read any model on any column.
async function GetProvinceData(req, res) {
  try {
    var result = { Success: true, Data: [], Option: {} };
    const { ObjectName, Option } = req.body;
    const AllowedFields = DICT_MODELS[ObjectName];
    if (!AllowedFields) return Fail(res, 'Model not found');

    const where = {};
    if (Option && Option.Field) {
      if (!AllowedFields.includes(Option.Field)) return Fail(res, 'Model not found');
      if (Option.Type === 'NotEquals') where[Op.not] = { [Option.Field]: Option.Value };
      if (Option.Type === 'Equals') where[Option.Field] = Option.Value;
    }

    result.Data = await Models[ObjectName].findAll({
      where,
      attributes: ['id_data', 'name'],
      order: [['name', 'ASC']],
      raw: true,
    });
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return Fail(res);
  }
}

// Public organization picker for the sign-up form: names, plus the hospital's
// own address so choosing one can fill the address section. Nothing here is
// sensitive - it is where the hospital is. All 680 carry a province, 679 a
// soum, only 188 a bag/khoroo, so the client fills what exists.
async function GetOrganizations(req, res) {
  try {
    const where = { IsActive: true, MergedIntoId: null };
    const Province = parseInt(req.body.ProvinceId, 10);
    if (Province) where.addr_prov_city = Province;
    const Data = await Models.Organization.findAll({
      where,
      attributes: ['Id', 'Name', 'addr_prov_city', 'addr_soum_dist', 'addr_bag_khoroo'],
      order: [['Name', 'ASC']],
      raw: true,
    });
    return res.send(JSON.stringify({ Success: true, Message: '', Data }));
  } catch (ex) {
    console.log(ex);
    return Fail(res);
  }
}

async function Register(req, res) {
  let RequestId = null;
  try {
    const Body = req.body.Data ? JSON.parse(req.body.Data) : null;
    if (!Body || typeof Body !== 'object') return Fail(res, 'Information is missing');

    // Built field by field. The whole body used to go to BaseCreate, which
    // UPSERTS on a sent Id - so anyone could rewrite anybody's request, or
    // reset a declined one to pending.
    const Row = {
      UserName: Clean(Body.UserName),
      LastName: Clean(Body.LastName),
      FirstName: Clean(Body.FirstName),
      Registration: Clean(Body.Registration),
      License: Clean(Body.License),
      Profession: Clean(Body.Profession),
      Email: Clean(Body.Email),
      Telephone: Clean(Body.Telephone),
      OrganizationId: parseInt(Body.OrganizationId, 10) || null,
      addr_prov_city: parseInt(Body.addr_prov_city, 10) || null,
      addr_soum_dist: parseInt(Body.addr_soum_dist, 10) || null,
      addr_bag_khoroo: parseInt(Body.addr_bag_khoroo, 10) || null,
    };
    const Password = typeof Body.Password === 'string' ? Body.Password : '';

    if (!Row.UserName || /\s/.test(Row.UserName) || Row.UserName.length < 4) {
      return Fail(res, 'The username must be at least 4 characters long');
    }
    if (!Row.LastName || !Row.FirstName) return Fail(res, 'Овог, нэрээ оруулна уу');
    if (!Row.Registration || !REGISTRATION_REGEX.test(Row.Registration)) {
      return Fail(res, 'Регистрийн дугаар буруу байна');
    }
    Row.Registration = Row.Registration.toUpperCase();
    // The licence code is OPTIONAL. Not one of the ~3,300 doctors already in the
    // system has one (the column is days old), the login gate that would demand
    // it is off by default, and where codes come from is still a customer
    // question - so requiring it here would hold applicants to a standard no
    // existing doctor meets. An administrator can add it when approving.
    if (Row.License && Row.License.length > 50) {
      return Fail(res, 'Зөвшөөрлийн дугаар хэт урт байна');
    }

    // Email and phone are required on every new request - accounts created
    // without them could not reset a password or be contacted.
    const ContactError = CheckContact(Row, {
      EmailKey: 'Email',
      PhoneKey: 'Telephone',
      Required: true,
    });
    if (ContactError) return Fail(res, ContactError);

    if (!PasswordRegex.test(Password)) return Fail(res, RequirementMessageMn);

    const Organization = await FindOrganization(Row.OrganizationId);
    if (!Organization) return Fail(res, 'Ажилладаг байгууллагаа сонгоно уу');
    Row.OrgName = Organization.Name;

    if (await IsUserNameTaken(Row.UserName)) return Fail(res, 'Usernames should not be duplicated');
    const DuplicateEmail = await FindDuplicateEmail(Row.Email);
    if (DuplicateEmail) return Fail(res, DuplicateEmail);

    // Only when one was given: a blank code is not a duplicate, and matching on
    // NULL would collide with every doctor who has none.
    if (Row.License) {
      const LicenceTaken =
        (await Models.DoctorsProfile.count({ where: { LicenseCode: Row.License } })) > 0 ||
        (await Models.UserRequests.count({
          where: { License: Row.License, IsActive: STATUS.Pending },
        })) > 0;
      if (LicenceTaken) {
        return Fail(res, 'Энэ зөвшөөрлийн дугаараар бүртгэл эсвэл хүсэлт аль хэдийн байна');
      }
    }

    const Created = await Models.UserRequests.create({
      ...Row,
      IsActive: STATUS.Pending,
      AppId: 1,
      CreateDate: new Date(),
    });
    RequestId = Created.Id;
    await RegistrationRequest.SetPasswordHash(RequestId, await bcrypt.hash(Password, 8));

    await Notify(
      Row.Email,
      'MnCardio - бүртгэлийн хүсэлт хүлээн авлаа',
      `Таны <b>${EscapeHtml(Row.UserName)}</b> нэртэй бүртгэлийн хүсэлтийг хүлээн авлаа.<br />
       Админ хянаж баталгаажуулсны дараа энэ хаяг руу мэдэгдэнэ.`
    );

    return res.send({
      Success: true,
      Data: { DataId: RequestId },
      Message:
        'Бүртгэлийн хүсэлт илгээгдлээ. Админ хянаж баталгаажуулсны дараа и-мэйлээр мэдэгдэнэ.',
    });
  } catch (ex) {
    console.log(ex);
    // A request with no password hash could never be approved as intended.
    if (RequestId) {
      await Models.UserRequests.destroy({ where: { Id: RequestId } }).catch(() => {});
    }
    return Fail(res);
  }
}

/**
 * What an administrator should know BEFORE approving one request.
 *
 *   HasPassword  false for a request filed before applicants chose their own
 *                password. Approving one creates the account with no password
 *                and emails a set-password link - the admin used to learn that
 *                only from the result message, after the fact.
 *   Duplicates   accounts that already exist for this person, matched on
 *                registration number or email. Without this the same doctor can
 *                be given a second account, and nothing downstream notices.
 *
 * The password HASH itself is never returned - only whether one exists.
 */
async function Review(req, res) {
  try {
    if (!AccountWriteGuard.IsAdmin(req.LogedUser)) return Fail(res, 'Not admin user');

    const Id = parseInt(req.body.Id, 10);
    const Request = Id ? await Models.UserRequests.findByPk(Id, { raw: true }) : null;
    if (!Request) return Fail(res, 'No data found');

    const Registration = Request.Registration
      ? String(Request.Registration).trim().toUpperCase()
      : '';
    const Email = Request.Email ? String(Request.Email).trim().toLowerCase() : '';

    // personal_number is uppercased on write (helper/ModelHelper), so an
    // equality match is safe. The email side checks both the account address
    // and the profile copy, which are not always the same.
    let Duplicates = [];
    if (Registration || Email) {
      const [Rows] = await sequelize.query(
        `SELECT TOP 10
                d.id_data        AS DoctorId,
                d.id             AS UserId,
                d.lastname       AS LastName,
                d.firstname      AS FirstName,
                d.personal_number AS Registration,
                u.UserName       AS UserName,
                o.Name           AS OrganizationName,
                CASE WHEN :Registration <> '' AND UPPER(LTRIM(RTRIM(d.personal_number))) = :Registration
                     THEN 'Registration' ELSE 'Email' END AS MatchField
           FROM DoctorsProfile d
           LEFT JOIN Users u ON u.Id = d.id
           LEFT JOIN Organization o ON o.Id = d.OrganizationId
          WHERE ISNULL(d.rec_status, 0) <> 2
            AND ( (:Registration <> '' AND UPPER(LTRIM(RTRIM(d.personal_number))) = :Registration)
               OR (:Email <> '' AND LOWER(LTRIM(RTRIM(u.Email))) = :Email)
               OR (:Email <> '' AND LOWER(LTRIM(RTRIM(d.email))) = :Email) )
          ORDER BY d.id_data DESC`,
        { replacements: { Registration, Email } }
      );
      Duplicates = Rows || [];
    }

    const PasswordHash = await RegistrationRequest.GetPasswordHash(Id);
    return res.send({
      Success: true,
      Message: '',
      Data: { HasPassword: !!PasswordHash, Duplicates },
    });
  } catch (ex) {
    console.log(ex);
    return Fail(res);
  }
}

/**
 * Approve ONE pending request: create the account, settle the row. No mail.
 *
 * Req/res-free so Confirm and ConfirmMany share exactly one copy of the rules.
 * It never throws for an expected outcome - each one comes back as an Outcome
 * the caller reports, with the same message Confirm has always shown.
 *
 * The row's own status is the mutex. Approval is half a dozen statements and
 * cannot be a single conditional UPDATE the way DeclineMany is, so the request
 * is CLAIMED first with `WHERE IsActive = 0`: a second administrator acting on
 * the same row loses the claim and is told it is already decided instead of
 * minting a duplicate account. A failure afterwards destroys the Users row and
 * THEN releases the claim - the other order would let a concurrent approve race
 * its duplicate-name check against a row that is about to vanish.
 */
async function ApproveRequest({ Request, RoleId, Organization, LicenseCode, LogedUser }) {
  const Id = parseInt(Request.Id, 10);
  const Pending = parseInt(STATUS.Pending, 10);
  const Approved = parseInt(STATUS.Approved, 10);
  const Result = (Outcome, Extra) => Object.assign({ Outcome, Id, Request }, Extra || {});

  const [Claimed] = await sequelize.query(
    `UPDATE [UserRequests]
        SET [IsActive] = :Approved, [ConfirmUserId] = :UserId, [DecisionDate] = :Now
      OUTPUT INSERTED.[Id]
      WHERE [Id] = :Id AND [IsActive] = :Pending`,
    {
      replacements: {
        Approved,
        Pending,
        UserId: parseInt(LogedUser.Id, 10),
        Now: new Date(),
        Id,
      },
    }
  );
  if (!Claimed || Claimed.length === 0) {
    return Result('skipped-already-decided', {
      Message: 'Энэ хүсэлтийг аль хэдийн шийдвэрлэсэн байна',
    });
  }

  // Put the request back the way it was found. Every failure path calls it.
  const Release = async () => {
    try {
      await sequelize.query(
        `UPDATE [UserRequests]
            SET [IsActive] = :Pending, [ConfirmUserId] = NULL, [DecisionDate] = NULL
          WHERE [Id] = :Id AND [IsActive] = :Approved`,
        { replacements: { Pending, Approved, Id } }
      );
    } catch (ex) {
      console.error('[UserRequestController/ApproveRequest] claim release failed:', ex.message);
    }
  };

  let NewUser = null;
  try {
    const UserNameCount = await Models.Users.count({ where: { UserName: Request.UserName } });
    if (UserNameCount > 0) {
      await Release();
      return Result('failed-duplicate-username', { Message: 'The user name is a duplicate' });
    }
    // Still ignores this request: the claim above has already moved it off
    // Pending, so without that it would now find itself.
    const DuplicateEmail = await FindDuplicateEmail(Request.Email, { IgnoreRequestId: Id });
    if (DuplicateEmail) {
      await Release();
      return Result('failed-duplicate-email', { Message: DuplicateEmail });
    }

    const PasswordHash = await RegistrationRequest.GetPasswordHash(Id);

    // Written directly, not through BaseCreate: SaveRoot would hash the
    // already-hashed password again. The id comes from the created instance,
    // not a SELECT TOP 1 that a concurrent insert could win.
    NewUser = await Models.Users.create({
      UserName: Request.UserName,
      LastName: Request.LastName,
      FirstName: Request.FirstName,
      Email: Request.Email,
      Password: PasswordHash || null,
      RoleId,
      IsActive: '1',
      AppId: Request.AppId || 1,
      Language: 'mn',
      CreateDate: new Date(),
      CreateUserId: LogedUser.Id,
    });

    let DoctorId = null;
    try {
      DoctorId = await BaseControllerHelper.BaseCreate({
        ObjectName: 'DoctorsProfile',
        Data: {
          id: NewUser.Id,
          lastname: Request.LastName,
          firstname: Request.FirstName,
          email: Request.Email,
          telephone: Request.Telephone,
          personal_number: Request.Registration,
          profession: Request.Profession,
          addr_prov_city: Request.addr_prov_city,
          addr_soum_dist: Request.addr_soum_dist,
          addr_bag_khoroo: Request.addr_bag_khoroo,
          OrganizationId: Organization.Id,
          AppId: Request.AppId || 1,
          // Only stamp the licence columns when there is a code: "verified by
          // this administrator on this date" must not be recorded against none.
          ...(LicenseCode
            ? {
                LicenseCode,
                LicenseSource: 'registration',
                LicenseVerifiedDate: new Date(),
                LicenseVerifiedUserId: LogedUser.Id,
              }
            : {}),
        },
        LogedUser,
        SaveLog: true,
      });
    } catch (ex) {
      console.error('[UserRequestController/ApproveRequest] profile create failed:', ex);
    }

    if (!DoctorId) {
      // Without a profile the account cannot log in, and leaving the Users row
      // would block every retry as a duplicate user name. Undo it; the request
      // stays pending.
      await Models.Users.destroy({ where: { Id: NewUser.Id } });
      await Release();
      return Result('failed-profile', {
        Message: 'Эмчийн мэдээлэл үүсгэж чадсангүй. Хүсэлт хүлээгдэж буй хэвээр байна.',
      });
    }

    // The claim already wrote the status, the decider and the date. What is
    // left is what the administrator may have corrected on the way in.
    await Models.UserRequests.update(
      {
        OrganizationId: Organization.Id,
        OrgName: Organization.Name,
        License: LicenseCode,
      },
      { where: { Id } }
    );

    return Result('approved', {
      UserId: NewUser.Id,
      DoctorId,
      HasPassword: !!PasswordHash,
    });
  } catch (ex) {
    console.log(ex);
    if (NewUser) {
      try {
        await Models.Users.destroy({ where: { Id: NewUser.Id } });
      } catch (DestroyEx) {
        console.error('[UserRequestController/ApproveRequest] rollback failed:', DestroyEx.message);
      }
    }
    await Release();
    return Result('failed-error', { Message: ex.Message || null });
  }
}

/**
 * Tell the applicant their account exists.
 *
 * Best-effort like every other mail here - the account is already created and a
 * broken SMTP host must not undo it. Returns what Confirm reports: whether the
 * mail went, and the sentence that says so.
 */
async function SendApprovalMail({ UserId, UserName, Email, HasPassword }) {
  if (HasPassword) {
    const MailSent = await Notify(
      Email,
      'MnCardio - бүртгэл баталгаажлаа',
      `Таны бүртгэлийн хүсэлтийг баталгаажууллаа.<br />
       Бүртгүүлэхдээ сонгосон нэр (<b>${EscapeHtml(UserName)}</b>), нууц үгээрээ нэвтэрнэ үү:<br />${LoginLink()}`
    );
    return {
      MailSent,
      Message: MailSent
        ? `Хэрэглэгч үүслээ. ${Email} хаяг руу мэдэгдэл илгээлээ.`
        : 'Хэрэглэгч үүслээ. И-мэйл илгээгдээгүй тул эмчид баталгаажсаныг мэдэгдэнэ үү - өөрийн сонгосон нууц үгээр нэвтэрнэ.',
    };
  }

  // Filed before applicants chose a password: the account has none, and this
  // link is how its owner sets one.
  const Link = await PasswordResetLink.Issue({
    UserId,
    UserName,
    ValidMinutes: 72 * 60,
  });
  const MailSent = await Notify(
    Email,
    'MnCardio - бүртгэл баталгаажлаа',
    `Таны бүртгэлийн хүсэлтийг баталгаажууллаа.<br />
     Доорх холбоосоор нууц үгээ үүсгэнэ үү (72 цагийн хүчинтэй):<br />
     <a target="_blank" href="${Link}">${Link}</a><br />Хэрэглэгчийн нэр: <b>${EscapeHtml(UserName)}</b>`
  );
  return {
    MailSent,
    Message: MailSent
      ? `Хэрэглэгч үүслээ. Нууц үг үүсгэх холбоосыг ${Email} хаяг руу илгээлээ.`
      : 'Хэрэглэгч үүслээ, гэвч и-мэйл илгээгдээгүй. Эмч "Нууц үг сэргээх" хэсгээс нууц үгээ үүсгэнэ.',
  };
}

async function Confirm(req, res) {
  try {
    const LogedUser = req.LogedUser;
    if (!AccountWriteGuard.IsAdmin(LogedUser)) return Fail(res, 'Not admin user');

    const Id = parseInt(req.body.Id, 10);
    const Request = Id ? await Models.UserRequests.findByPk(Id, { raw: true }) : null;
    if (!Request) return Fail(res, 'No data found');
    // The claim inside ApproveRequest is the real authority; this is here to
    // give the friendly message before any work is attempted.
    if (String(Request.IsActive) !== STATUS.Pending) {
      return Fail(res, 'Энэ хүсэлтийг аль хэдийн шийдвэрлэсэн байна');
    }

    // The administrator may correct organization, role and licence on approval.
    const RoleId = req.body.RoleId ? parseInt(req.body.RoleId, 10) : 2;
    if (!DOCTOR_ROLES.includes(RoleId)) return Fail(res, 'Эрхийн төрөл буруу байна');

    const Organization = await FindOrganization(req.body.OrganizationId || Request.OrganizationId);
    if (!Organization) return Fail(res, 'Байгууллагыг сонгоно уу');

    // Optional here too - see the note in Register. The administrator may fill
    // it in while approving, but nothing is blocked when they cannot.
    const LicenseCode = Clean(req.body.License !== undefined ? req.body.License : Request.License);

    const Approval = await ApproveRequest({
      Request,
      RoleId,
      Organization,
      LicenseCode,
      LogedUser,
    });
    if (Approval.Outcome !== 'approved') return Fail(res, Approval.Message || null);

    const { MailSent, Message } = await SendApprovalMail({
      UserId: Approval.UserId,
      UserName: Request.UserName,
      Email: Request.Email,
      HasPassword: Approval.HasPassword,
    });

    return res.send({
      Success: true,
      Message,
      Data: {
        DataId: Id,
        UsersId: Approval.UserId,
        DoctorsProfileId: Approval.DoctorId,
        MailSent,
      },
    });
  } catch (ex) {
    console.log(ex);
    return Fail(res, ex.Message || null);
  }
}

/**
 * Approve many pending requests at once, with one role for the batch.
 *
 * Each request is approved into the organization THE APPLICANT gave on their
 * own form. There is no per-row picker in a batch, and filing a doctor under
 * the wrong hospital is worse than not filing them at all - so a request whose
 * organization is missing, inactive or merged away is skipped and named in the
 * reply, for the administrator to open one at a time.
 *
 * Unlike DeclineMany this cannot be one statement: every row creates an account
 * and a profile, and the reply has to say which rows got one. So the cap is
 * lower - 25 rows, not 100 - and the loop is sequential on purpose. Two
 * requests in one batch can share an email address, and only a sequential pass
 * lets the second one see the account the first just created.
 */
const CONFIRM_MANY_CAP = 25;

async function ConfirmMany(req, res) {
  try {
    const LogedUser = req.LogedUser;
    if (!AccountWriteGuard.IsAdmin(LogedUser)) return Fail(res, 'Not admin user');

    // Checked once, before the loop: a bad role must not be discovered on row
    // one of twenty-five, after the first account already exists.
    const RoleId = req.body.RoleId ? parseInt(req.body.RoleId, 10) : 2;
    if (!DOCTOR_ROLES.includes(RoleId)) return Fail(res, 'Эрхийн төрөл буруу байна');

    const Ids = Array.isArray(req.body.Ids)
      ? [...new Set(req.body.Ids.map((i) => parseInt(i, 10)).filter(Boolean))]
      : [];
    if (Ids.length === 0) return Fail(res, 'Хүсэлт сонгогдоогүй байна');
    if (Ids.length > CONFIRM_MANY_CAP) {
      return Fail(res, `Нэг удаад ${CONFIRM_MANY_CAP} хүртэл хүсэлтийг баталгаажуулна`);
    }

    // One read for the batch. The snapshot is advisory only - the claim inside
    // ApproveRequest decides, so a row decided between here and there is
    // reported as already decided rather than approved twice.
    const Rows = await Models.UserRequests.findAll({ where: { Id: Ids }, raw: true });
    const ById = new Map(Rows.map((Row) => [parseInt(Row.Id, 10), Row]));
    // A batch is usually one or two hospitals; do not ask for each one twice.
    const Organizations = new Map();

    const Results = [];
    const Mails = [];

    for (const Id of Ids) {
      const Request = ById.get(Id);
      const UserName = Request ? Request.UserName : '';
      const Name = Request
        ? [Request.LastName, Request.FirstName].filter(Boolean).join(' ') || UserName
        : '';
      const Record = (Outcome, Extra) =>
        Results.push(Object.assign({ Id, UserName, Name, Outcome }, Extra || {}));

      if (!Request) {
        Record('skipped-not-found', { Message: 'Хүсэлт олдсонгүй' });
        continue;
      }
      if (String(Request.IsActive) !== STATUS.Pending) {
        Record('skipped-already-decided', { Message: 'Өмнө нь шийдвэрлэсэн байна' });
        continue;
      }

      const OrgId = parseInt(Request.OrganizationId, 10) || 0;
      if (!Organizations.has(OrgId)) {
        Organizations.set(OrgId, OrgId ? await FindOrganization(OrgId) : null);
      }
      const Organization = Organizations.get(OrgId);
      if (!Organization) {
        Record('skipped-no-org', { Message: 'Байгууллага тодорхойгүй байна' });
        continue;
      }

      let Approval;
      try {
        // The licence stays exactly as the applicant wrote it. A batch has no
        // licence field, and passing null here would erase every one of them.
        Approval = await ApproveRequest({
          Request,
          RoleId,
          Organization,
          LicenseCode: Clean(Request.License),
          LogedUser,
        });
      } catch (ex) {
        // One bad row must not end the batch.
        console.error('[UserRequestController/ConfirmMany] row failed:', ex);
        Record('failed-error', { Message: ex.Message || null });
        continue;
      }

      if (Approval.Outcome === 'approved') {
        Record('approved', {
          UsersId: Approval.UserId,
          DoctorsProfileId: Approval.DoctorId,
        });
        Mails.push({
          UserId: Approval.UserId,
          UserName: Request.UserName,
          Email: Request.Email,
          HasPassword: Approval.HasPassword,
        });
      } else {
        Record(Approval.Outcome, { Message: Approval.Message });
      }
    }

    const ApprovedIds = Results.filter((R) => R.Outcome === 'approved').map((R) => R.Id);
    const SkippedIds = Results.filter((R) => R.Outcome.indexOf('skipped-') === 0).map((R) => R.Id);
    const FailedIds = Results.filter((R) => R.Outcome.indexOf('failed-') === 0).map((R) => R.Id);

    // Mail AFTER the answer, exactly as DeclineMany does: the accounts exist,
    // and a slow SMTP host must not hold the request open. MailHelper builds a
    // fresh transport per message, so they go out spaced rather than at once.
    const Recipients = Mails.filter(
      (Mail) => Mail.Email && EMAIL_REGEX.test(String(Mail.Email).trim())
    );
    setImmediate(async () => {
      for (const Mail of Recipients) {
        try {
          await SendApprovalMail(Mail);
        } catch (ex) {
          console.error('[UserRequestController/ConfirmMany] mail failed:', ex.message);
        }
        await new Promise((Resolve) => setTimeout(Resolve, MAIL_GAP_MS));
      }
    });

    return res.send({
      Success: true,
      Message:
        `${ApprovedIds.length} хүсэлтийг баталгаажууллаа.` +
        (SkippedIds.length ? ` ${SkippedIds.length} хүсэлтийг алгаслаа.` : '') +
        (FailedIds.length ? ` ${FailedIds.length} хүсэлт амжилтгүй боллоо.` : '') +
        (Recipients.length < ApprovedIds.length
          ? ` ${ApprovedIds.length - Recipients.length} хүсэлтэд и-мэйл хаяг байхгүй.`
          : ''),
      Data: {
        Requested: Ids.length,
        Approved: ApprovedIds.length,
        ApprovedIds,
        Skipped: SkippedIds.length,
        SkippedIds,
        Failed: FailedIds.length,
        FailedIds,
        MailQueued: Recipients.length,
        Results,
      },
    });
  } catch (ex) {
    console.log(ex);
    return Fail(res);
  }
}

async function Decline(req, res) {
  try {
    const LogedUser = req.LogedUser;
    if (!AccountWriteGuard.IsAdmin(LogedUser)) return Fail(res, 'Not admin user');

    const Id = parseInt(req.body.Id, 10);
    const Reason = Clean(req.body.Reason);
    if (!Reason) return Fail(res, 'Татгалзсан шалтгаанаа бичнэ үү');
    if (Reason.length > 500) return Fail(res, 'Шалтгаан 500 тэмдэгтээс хэтрэхгүй');

    const Request = Id ? await Models.UserRequests.findByPk(Id, { raw: true }) : null;
    if (!Request) return Fail(res, 'No data found');
    if (String(Request.IsActive) !== STATUS.Pending) {
      return Fail(res, 'Энэ хүсэлтийг аль хэдийн шийдвэрлэсэн байна');
    }

    await Models.UserRequests.update(
      {
        IsActive: STATUS.Declined,
        DeclineUserId: parseInt(LogedUser.Id, 10),
        DecisionDate: new Date(),
        DeclineReason: Reason,
      },
      { where: { Id } }
    );

    await Notify(
      Request.Email,
      'MnCardio - бүртгэлийн хүсэлт',
      `Таны <b>${EscapeHtml(Request.UserName)}</b> нэртэй бүртгэлийн хүсэлтийг татгалзлаа.<br />
       Шалтгаан: ${EscapeHtml(Reason)}`
    );

    return res.send({
      Success: true,
      Data: { DataId: Id },
      Message: 'Refusal to establish consumer rights',
    });
  } catch (ex) {
    console.log(ex);
    return Fail(res);
  }
}

/**
 * Decline many pending requests at once, with one shared reason.
 *
 * The queue holds over a thousand requests going back years, none of which
 * could be cleared except one dialog at a time. Declining is the cheap bulk
 * case - one statement. Bulk approving is ConfirmMany, row by row.
 *
 * Capped per call so one click can never try to send a thousand emails in one
 * request. The status is written first, in a single UPDATE that only touches
 * rows still pending, and the mails go out afterwards - a slow SMTP host must
 * never hold the write or leave the queue half-decided.
 */
// One visible grid page is the most MUI will show at once, so one page is one
// call and the admin can never aim a single click at the whole backlog.
const DECLINE_MANY_CAP = 100;

// Between messages. MailHelper builds a fresh transport per email, so sending
// a hundred without a gap opens a hundred connections and invites a throttle.
const MAIL_GAP_MS = 250;

async function DeclineMany(req, res) {
  try {
    const LogedUser = req.LogedUser;
    if (!AccountWriteGuard.IsAdmin(LogedUser)) return Fail(res, 'Not admin user');

    const Reason = Clean(req.body.Reason);
    if (!Reason) return Fail(res, 'Татгалзсан шалтгаанаа бичнэ үү');
    if (Reason.length > 500) return Fail(res, 'Шалтгаан 500 тэмдэгтээс хэтрэхгүй');

    const Ids = Array.isArray(req.body.Ids)
      ? [...new Set(req.body.Ids.map((i) => parseInt(i, 10)).filter(Boolean))]
      : [];
    if (Ids.length === 0) return Fail(res, 'Хүсэлт сонгогдоогүй байна');
    if (Ids.length > DECLINE_MANY_CAP) {
      return Fail(res, `Нэг удаад ${DECLINE_MANY_CAP} хүртэл хүсэлтийг татгалзана`);
    }

    /*
     * One conditional UPDATE, and OUTPUT tells us exactly which rows it changed.
     *
     * Reading the pending rows first and updating them afterwards leaves a
     * window: an administrator in another tab can approve one in between, and
     * that freshly created account would then be retro-declined. `AND IsActive
     * = 0` in the statement itself closes the window, and OUTPUT INSERTED
     * returns the addresses for the mail without a second read.
     *
     * IsActive is a TINYINT in the table even though the model calls it STRING
     * (see scripts/add_userrequest_approval_columns.sql), so the pending value
     * is bound as a number to keep the predicate sargable.
     */
    const [Changed] = await sequelize.query(
      `UPDATE [UserRequests]
          SET [IsActive] = :Declined,
              [DeclineUserId] = :UserId,
              [DecisionDate] = :Now,
              [DeclineReason] = :Reason
        OUTPUT INSERTED.[Id], INSERTED.[Email], INSERTED.[UserName]
        WHERE [Id] IN (:Ids) AND [IsActive] = :Pending`,
      {
        replacements: {
          Declined: parseInt(STATUS.Declined, 10),
          Pending: parseInt(STATUS.Pending, 10),
          UserId: parseInt(LogedUser.Id, 10),
          Now: new Date(),
          Reason,
          Ids,
        },
      }
    );

    const Declined = Changed || [];
    const DeclinedIds = Declined.map((Row) => Row.Id);
    const SkippedIds = Ids.filter((Id) => !DeclinedIds.includes(Id));

    // Mail AFTER the answer: the decision is committed, and a slow SMTP host
    // must not hold the request open or make the admin think it failed.
    const Recipients = Declined.filter(
      (Row) => Row.Email && EMAIL_REGEX.test(String(Row.Email).trim())
    );
    setImmediate(async () => {
      for (const Row of Recipients) {
        try {
          await Notify(
            Row.Email,
            'MnCardio - бүртгэлийн хүсэлт',
            `Таны <b>${EscapeHtml(Row.UserName)}</b> нэртэй бүртгэлийн хүсэлтийг татгалзлаа.<br />
             Шалтгаан: ${EscapeHtml(Reason)}`
          );
        } catch (ex) {
          console.error('[UserRequestController/DeclineMany] mail failed:', ex.message);
        }
        await new Promise((Resolve) => setTimeout(Resolve, MAIL_GAP_MS));
      }
    });

    return res.send({
      Success: true,
      Message:
        `${DeclinedIds.length} хүсэлтийг татгалзлаа.` +
        (SkippedIds.length
          ? ` ${SkippedIds.length} хүсэлтийг өмнө нь шийдвэрлэсэн тул алгаслаа.`
          : '') +
        (Recipients.length < DeclinedIds.length
          ? ` ${DeclinedIds.length - Recipients.length} хүсэлтэд и-мэйл хаяг байхгүй.`
          : ''),
      Data: {
        Requested: Ids.length,
        Declined: DeclinedIds.length,
        DeclinedIds,
        Skipped: SkippedIds.length,
        SkippedIds,
        MailQueued: Recipients.length,
      },
    });
  } catch (ex) {
    console.log(ex);
    return Fail(res);
  }
}

/**
 * Delete decided requests permanently.
 *
 * A PENDING request is never deleted here. It has to be approved or declined
 * first, so nobody's application disappears without them being told - decline
 * already exists for that, and it emails them. What this clears is the decided
 * backlog: rows going back years, each still holding a registration number, a
 * telephone number and a bcrypt password hash.
 *
 * The deletion is real - there is no soft-delete column on this table - and it
 * takes two things with it that nothing else records: who approved an account
 * and when, and the reason a declined applicant is shown when they try to log
 * in (RegistrationRequest.LoginStatusMessage). Both are said plainly in the
 * dialog before the administrator confirms.
 *
 * Nothing in the database points AT UserRequests.Id, so nothing is orphaned.
 */
const DELETE_MANY_CAP = 100;

async function DeleteMany(req, res) {
  try {
    const LogedUser = req.LogedUser;
    if (!AccountWriteGuard.IsAdmin(LogedUser)) return Fail(res, 'Not admin user');

    const Ids = Array.isArray(req.body.Ids)
      ? [...new Set(req.body.Ids.map((i) => parseInt(i, 10)).filter(Boolean))]
      : [];
    if (Ids.length === 0) return Fail(res, 'Хүсэлт сонгогдоогүй байна');
    if (Ids.length > DELETE_MANY_CAP) {
      return Fail(res, `Нэг удаад ${DELETE_MANY_CAP} хүртэл хүсэлтийг устгана`);
    }

    /*
     * `IsActive IS NULL OR IsActive <> 0`, not simply `<> 0`.
     *
     * `<>` is UNKNOWN against NULL, and the legacy backlog holds rows with no
     * status at all (scripts/add_userrequest_approval_columns.sql). Confirm
     * already treats those as decided, so without the IS NULL arm they would be
     * undeletable forever with nothing on screen explaining why.
     *
     * The status is filtered in the statement itself, not read first: a request
     * decided in another tab a moment ago must be deletable, and one just
     * filed must not be, whatever the grid was showing. OUTPUT DELETED returns
     * the names for the audit rows without a second read.
     */
    const [Removed] = await sequelize.query(
      `DELETE FROM [UserRequests]
        OUTPUT DELETED.[Id], DELETED.[UserName], DELETED.[IsActive]
        WHERE [Id] IN (:Ids) AND ([IsActive] IS NULL OR [IsActive] <> :Pending)`,
      { replacements: { Pending: parseInt(STATUS.Pending, 10), Ids } }
    );

    const Deleted = Removed || [];
    const DeletedIds = Deleted.map((Row) => Row.Id);
    const SkippedIds = Ids.filter((Id) => !DeletedIds.includes(Id));

    // The rows are gone, so this is the only surviving evidence that they ever
    // existed. Written inline, not deferred like mail: an audit trail a restart
    // can lose is not an audit trail. One row each, so LinkObjectId can carry
    // the id that just disappeared - BaseDelete writes null there because it
    // never knows which rows it removed.
    for (const Row of Deleted) {
      const Status = Row.IsActive === null || Row.IsActive === undefined ? '-' : Row.IsActive;
      try {
        await BaseControllerHelper.CreateUserActionHistory({
          LinkObjectName: 'UserRequests',
          LinkObjectId: Row.Id,
          Action: 'Delete',
          Notes: `Delete registration request: ${Row.UserName} (status ${Status})`,
          NotesMn: `Бүртгэлийн хүсэлт устгалаа: ${Row.UserName} (төлөв ${Status})`,
          LogedUser,
        });
      } catch (ex) {
        console.error('[UserRequestController/DeleteMany] audit write failed:', ex.message);
      }
    }

    return res.send({
      Success: true,
      Message:
        `${DeletedIds.length} хүсэлтийг устгалаа.` +
        (SkippedIds.length
          ? ` ${SkippedIds.length} хүсэлтийг устгасангүй - хүлээгдэж буй хүсэлтийг эхлээд шийдвэрлэнэ.`
          : ''),
      Data: {
        Requested: Ids.length,
        Deleted: DeletedIds.length,
        DeletedIds,
        Skipped: SkippedIds.length,
        SkippedIds,
      },
    });
  } catch (ex) {
    console.log(ex);
    return Fail(res);
  }
}

/**
 * How many requests are waiting. Admin only.
 *
 * The web sidebar badge that read this was removed; the route stays for any
 * client that wants the number without loading the list.
 */
async function PendingCount(req, res) {
  try {
    if (!AccountWriteGuard.IsAdmin(req.LogedUser)) return Fail(res, 'Not admin user');
    const Pending = await Models.UserRequests.count({ where: { IsActive: STATUS.Pending } });
    return res.send({ Success: true, Message: '', Data: { Pending } });
  } catch (ex) {
    console.log(ex);
    return Fail(res);
  }
}

module.exports = router;
