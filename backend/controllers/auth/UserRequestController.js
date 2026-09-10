const express = require('express');
const router = express.Router();

const Sequelize = require('sequelize');
const { Models, Op } = require('../../config/DB');

const Auths = require('../../helper/Auth');
const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const MailHelper = require('../../helper/MailHelper');

const EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

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
      // ignore declined requests (IsActive = 2), they no longer hold the email
      { IsActive: { [Op.not]: '2' } },
    ],
  };
  if (IgnoreRequestId) {
    RequestWhere[Op.and].push({ Id: { [Op.not]: IgnoreRequestId } });
  }

  const ExistingRequest = await Models.UserRequests.findOne({ where: RequestWhere, raw: true });
  if (ExistingRequest) return 'A registration request with this email already exists';

  return null;
}

// routes
router.post('/CheckUserName', CheckUserName);
router.post('/GetProvinceData', GetProvinceData);
router.post('/Register', Register);
router.post('/Confirm', Auths.verifyToken, Confirm);
router.post('/Decline', Auths.verifyToken, Decline);

async function CheckUserName(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [], Option: {} };
    const { UserName, Email } = req.body;
    if (UserName) {
      const UsersData = await Models.Users.findOne({ where: { UserName } });
      const UserRequestData = await Models.UserRequests.findOne({
        where: { UserName },
        raw: true,
      });
      if (UsersData || UserRequestData) {
        return res.send(
          JSON.stringify(
            BaseControllerHelper.GetDefaultErrorResult('Usernames should not be duplicated')
          )
        );
      }
    }
    if (Email) {
      if (!EMAIL_REGEX.test(String(Email).trim())) {
        return res.send(
          JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('The email address is invalid'))
        );
      }
      const DuplicateEmail = await FindDuplicateEmail(Email);
      if (DuplicateEmail) {
        return res.send(
          JSON.stringify(BaseControllerHelper.GetDefaultErrorResult(DuplicateEmail))
        );
      }
    }
    return res.send(result);
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function GetProvinceData(req, res) {
  try {
    var result = { Success: true, Data: [], Option: {} };
    const { ObjectName, Option } = req.body;

    const where = {};
    if (Option && Option.Field) {
      var Field = Option.Field;
      if (Option.Type === 'NotEquals') where[Op.not] = { [Field]: Option.Value };
      if (Option.Type === 'Equals') where[Field] = Option.Value;
    }

    const Model = Models[ObjectName];
    if (Model) {
      const Data = await Model.findAll({
        where: where,
        attributes: ['id_data', 'name'],
      });
      result.Data = Data;
      return res.send(JSON.stringify(result));
    } else {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Model not found'))
      );
    }
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function Register(req, res) {
  try {
    var result = { Data: null, Message: '', Success: true };
    const Data = JSON.parse(req.body.Data);
    if (Data && Object.keys(Data).length > 0) {
      const UserName = Data.UserName;
      const UsersData = await Models.Users.findOne({
        where: { UserName },
      });
      const UserRequestData = await Models.UserRequests.findOne({
        where: { UserName, IsActive: { [Op.not]: 2 } },
        raw: true,
      });
      if (!UsersData && !UserRequestData) {
        // email duplicate / format check before the request is stored
        const Email = Data.Email ? String(Data.Email).trim() : '';
        if (Email && !EMAIL_REGEX.test(Email)) {
          return res.send(
            JSON.stringify(
              BaseControllerHelper.GetDefaultErrorResult('The email address is invalid')
            )
          );
        }
        const DuplicateEmail = await FindDuplicateEmail(Email);
        if (DuplicateEmail) {
          return res.send(
            JSON.stringify(BaseControllerHelper.GetDefaultErrorResult(DuplicateEmail))
          );
        }
        const Result = await BaseControllerHelper.BaseCreate({
          ObjectName: 'UserRequests',
          Data: { ...Data, IsActive: 0, AppId: 1 },
          LogedUser: {},
          SaveLog: true,
        });
        result.Data = { DataId: Result };
        return res.send(result);
      } else {
        return res.send(
          JSON.stringify(
            BaseControllerHelper.GetDefaultErrorResult('Usernames should not be duplicated')
          )
        );
      }
    } else {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Information is missing'))
      );
    }
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function Confirm(req, res) {
  try {
    var result = {
      Success: true,
      Data: {},
      Message: 'Successfully created a user login',
    };
    const DataId = req.body.Id;
    const LogedUser = req.LogedUser;
    if (LogedUser && DataId) {
      const role = LogedUser.RoleId;
      if (parseInt(role) === 1) {
        const UserRequestData = await Models.UserRequests.findByPk(DataId);
        if (UserRequestData) {
          let doctorId = null;
          const UsersData = await Models.Users.findOne({
            where: { UserName: UserRequestData.UserName },
            raw: true,
          });
          if (!UsersData) {
            // Reject before any row is written: once the user and profile exist
            // the confirmation cannot be rolled back.
            const DuplicateEmail = await FindDuplicateEmail(UserRequestData.Email, {
              IgnoreRequestId: DataId,
            });
            if (DuplicateEmail) {
              return res.send(
                JSON.stringify(BaseControllerHelper.GetDefaultErrorResult(DuplicateEmail))
              );
            }
            //   Password Random String Create
            const RandomPassword = Math.random().toString(36).substr(2, 8);
            const UsersInsertData = {
              UserName: UserRequestData.UserName,
              LastName: UserRequestData.LastName,
              FirstName: UserRequestData.FirstName,
              Password: RandomPassword,
              Email: UserRequestData.Email,
              CreateUserId: LogedUser.Id,
              RoleId: 2,
              Language: 'mn',
            };
            const UsersInsertResult = await BaseControllerHelper.BaseCreate({
              ObjectName: 'Users',
              Data: UsersInsertData,
              LogedUser,
              SaveLog: true,
            });
            if (UsersInsertResult) {
              const DoctorsProfileInsertData = {
                id: UsersInsertResult,
                professional_degrees: UserRequestData.Profession,
                addr_prov_city: UserRequestData.addr_prov_city,
                addr_soum_dist: UserRequestData.addr_soum_dist,
                addr_bag_khoroo: UserRequestData.addr_bag_khoroo,
                telephone: UserRequestData.Telephone,
                email: UserRequestData.Email,
                firstname: UserRequestData.FirstName,
                lastname: UserRequestData.LastName,
                OrganizationId: '-1',
              };
              doctorId = await BaseControllerHelper.BaseCreate({
                ObjectName: 'DoctorsProfile',
                Data: DoctorsProfileInsertData,
                LogedUser,
                SaveLog: true,
              });
            }
            const ConfirmResult = await Models.UserRequests.update(
              { IsActive: 1, ConfirmUserId: parseInt(LogedUser.Id) },
              { where: { Id: DataId } }
            );
            //   Email send. A request without an email address is still a valid
            //   account, it just cannot be notified, so never fail on that.
            const email = UserRequestData.Email ? String(UserRequestData.Email).trim() : '';
            let MailSent = false;
            let MailSkipReason = '';
            if (email && EMAIL_REGEX.test(email)) {
              const link = process.env.CLIENT_APP_URL + 'auth/login';
              const EmailTemplate = {
                to: email,
                subject: 'MnCardio хэрэглэгчийн эрх үүсгэсэн.',
                html: `Сайн байна уу<br />Та манай системд дараах хэрэглэгчийн нэр, нууц үгээр нэвтэрнэ үү.<br />
          <br /><a target="_blank" href="${link}">${link}</a><br /><br />Хэрэглэгчийн нэр: ${UserRequestData.UserName}<br />Нууц үг: ${RandomPassword}<br /><br />MnCardio системийг ашиглаж байгаа танд баярлалаа.`,
              };
              const EmailRes = await MailHelper.SendMail(EmailTemplate);
              MailSent = EmailRes !== null;
              if (!MailSent) {
                MailSkipReason = 'и-мэйл илгээхэд алдаа гарсан';
                console.error(
                  '[UserRequestController/Confirm] Mail send failed:',
                  MailHelper.LastError
                );
              }
            } else {
              MailSkipReason = email ? 'и-мэйл хаяг буруу' : 'и-мэйл хаяг бүртгэгдээгүй';
            }

            // Users & DoctorsProfile create result. The user, profile and
            // confirmation are committed by now, so this always reports success.
            // When no mail went out, hand the credentials to the administrator
            // instead of discarding them — otherwise the account is unusable.
            result.Message = MailSent
              ? `Хэрэглэгч амжилттай үүслээ. Нэвтрэх мэдээллийг ${email} хаяг руу илгээлээ.`
              : `Хэрэглэгч амжилттай үүслээ. Гэвч ${MailSkipReason} тул нэвтрэх мэдээллийг доорх байдлаар өөрөө дамжуулна уу. Хэрэглэгчийн нэр: ${UserRequestData.UserName}, Нууц үг: ${RandomPassword}`;
            result.Data = {
              DataId: ConfirmResult,
              UsersId: UsersInsertResult,
              DoctorsProfileId: doctorId,
              MailSent,
              UserName: UserRequestData.UserName,
            };
            if (!MailSent) result.Data.Password = RandomPassword;
            return res.send(result);
          } else {
            return res.send(
              JSON.stringify(
                BaseControllerHelper.GetDefaultErrorResult('The user name is a duplicate')
              )
            );
          }
        } else {
          return res.send(
            JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('No data found'))
          );
        }
      } else {
        return res.send(
          JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Not admin user'))
        );
      }
    } else {
      return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
    }
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function Decline(req, res) {
  try {
    var result = {
      Success: true,
      Data: {},
      Message: 'Refusal to establish consumer rights',
    };
    var DataId = req.body.Id;
    const LogedUser = req.LogedUser;
    if (LogedUser && DataId) {
      await Models.UserRequests.update(
        { IsActive: 2, DeclineUserId: parseInt(LogedUser.Id) },
        { where: { Id: DataId } }
      );
      result.Data = { DataId };
      return res.send(result);
    } else {
      return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
    }
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

module.exports = router;
