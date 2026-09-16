const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');
const Sequelize = require('sequelize');
const { Models, Op } = require('../../config/DB');

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
router.post('/Confirm', Auths.verifyToken, Confirm);
router.post('/Decline', Auths.verifyToken, Decline);

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
    const ContactError = CheckContact(Row, { EmailKey: 'Email', PhoneKey: 'Telephone', Required: true });
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

async function Confirm(req, res) {
  try {
    const LogedUser = req.LogedUser;
    if (!AccountWriteGuard.IsAdmin(LogedUser)) return Fail(res, 'Not admin user');

    const Id = parseInt(req.body.Id, 10);
    const Request = Id ? await Models.UserRequests.findByPk(Id, { raw: true }) : null;
    if (!Request) return Fail(res, 'No data found');
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

    const UserNameCount = await Models.Users.count({ where: { UserName: Request.UserName } });
    if (UserNameCount > 0) return Fail(res, 'The user name is a duplicate');
    const DuplicateEmail = await FindDuplicateEmail(Request.Email, { IgnoreRequestId: Id });
    if (DuplicateEmail) return Fail(res, DuplicateEmail);

    const PasswordHash = await RegistrationRequest.GetPasswordHash(Id);

    // Written directly, not through BaseCreate: SaveRoot would hash the
    // already-hashed password again. The id comes from the created instance,
    // not a SELECT TOP 1 that a concurrent insert could win.
    const NewUser = await Models.Users.create({
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
      console.error('[UserRequestController/Confirm] profile create failed:', ex);
    }

    if (!DoctorId) {
      // Without a profile the account cannot log in, and leaving the Users row
      // would block every retry as a duplicate user name. Undo it; the request
      // stays pending.
      await Models.Users.destroy({ where: { Id: NewUser.Id } });
      return Fail(res, 'Эмчийн мэдээлэл үүсгэж чадсангүй. Хүсэлт хүлээгдэж буй хэвээр байна.');
    }

    await Models.UserRequests.update(
      {
        IsActive: STATUS.Approved,
        ConfirmUserId: parseInt(LogedUser.Id, 10),
        DecisionDate: new Date(),
        OrganizationId: Organization.Id,
        OrgName: Organization.Name,
        License: LicenseCode,
      },
      { where: { Id } }
    );

    let MailSent;
    let Message;
    if (PasswordHash) {
      MailSent = await Notify(
        Request.Email,
        'MnCardio - бүртгэл баталгаажлаа',
        `Таны бүртгэлийн хүсэлтийг баталгаажууллаа.<br />
         Бүртгүүлэхдээ сонгосон нэр (<b>${EscapeHtml(Request.UserName)}</b>), нууц үгээрээ нэвтэрнэ үү:<br />${LoginLink()}`
      );
      Message = MailSent
        ? `Хэрэглэгч үүслээ. ${Request.Email} хаяг руу мэдэгдэл илгээлээ.`
        : 'Хэрэглэгч үүслээ. И-мэйл илгээгдээгүй тул эмчид баталгаажсаныг мэдэгдэнэ үү - өөрийн сонгосон нууц үгээр нэвтэрнэ.';
    } else {
      // Filed before applicants chose a password: the account has none, and
      // this link is how its owner sets one.
      const Link = await PasswordResetLink.Issue({
        UserId: NewUser.Id,
        UserName: Request.UserName,
        ValidMinutes: 72 * 60,
      });
      MailSent = await Notify(
        Request.Email,
        'MnCardio - бүртгэл баталгаажлаа',
        `Таны бүртгэлийн хүсэлтийг баталгаажууллаа.<br />
         Доорх холбоосоор нууц үгээ үүсгэнэ үү (72 цагийн хүчинтэй):<br />
         <a target="_blank" href="${Link}">${Link}</a><br />Хэрэглэгчийн нэр: <b>${EscapeHtml(Request.UserName)}</b>`
      );
      Message = MailSent
        ? `Хэрэглэгч үүслээ. Нууц үг үүсгэх холбоосыг ${Request.Email} хаяг руу илгээлээ.`
        : 'Хэрэглэгч үүслээ, гэвч и-мэйл илгээгдээгүй. Эмч "Нууц үг сэргээх" хэсгээс нууц үгээ үүсгэнэ.';
    }

    return res.send({
      Success: true,
      Message,
      Data: { DataId: Id, UsersId: NewUser.Id, DoctorsProfileId: DoctorId, MailSent },
    });
  } catch (ex) {
    console.log(ex);
    return Fail(res, ex.Message || null);
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

module.exports = router;
