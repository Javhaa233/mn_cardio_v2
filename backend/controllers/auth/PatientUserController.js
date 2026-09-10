const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const { Models } = require('../../config/DB');

const Auths = require('../../helper/Auth');
const ObjectHelper = require('../../helper/ObjectHelper');
const MailHelper = require('../../helper/MailHelper');
const BaseControllerHelper = require('../../helper/BaseControllerHelper');

// routes
router.post('/Login', Login);
router.post('/LogOut', Auths.verifyToken, LogOut);
router.post('/CheckLogin', Auths.verifyToken, CheckLogin);
router.post('/Save', Auths.verifyToken, Save);
router.post('/ForgotPassword', ForgotPassword);
router.route('/ResetPassword').post(ResetPassword);
router.post('/ChangePassword', Auths.verifyToken, ChangePassword);

async function LogOut(req, res) {
  return res.send({ Data: {}, Success: true, Message: 'Logout Success' });
}

async function Save(req, res) {
  const Data = JSON.parse(req.body.Data);
  Data.Password = await bcrypt.hash(Data.Password, 8);
  const SaveUser = await Models.PatientUsers.create(Data);
  return res.send(SaveUser);
}

function getPatientUserData(req, res) {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    var token = bearerToken;
    Auths.getpatientUserData(token, function (data) {
      return res.send(data);
    });
  } else {
    return res.send(null);
  }
}

async function CheckLogin(req, res) {
  return res.send(true);
}

async function Login(req, res) {
  try {
    const { UserName, Password } = req.body;
    //const AppId = req.headers["app"];
    const patientUserDatas = await Models.PatientUsers.findAllDetail({
      where: { UserName, RoleId: 4 },
    });
    if (patientUserDatas.length === 1) {
      let patientUserData = JSON.parse(JSON.stringify(patientUserDatas[0]));

      if (patientUserData) {
        const isPasswordMatch = await bcrypt.compare(Password, patientUserData.Password);
        if (!isPasswordMatch) {
          return res.send({
            Success: false,
            Message: 'Login name or password is incorrect',
            Data: { token: null, LogedUser: null },
          });
        }
        delete patientUserData.Password;
        if (patientUserData.RoleId + '' === '4') {
          const Patient = await Models.Patient.findOne({
            where: { user_id: patientUserData.Id },
            attributes: ['id_data', 'p_lastname', 'p_firstname', 'p_registration'],
            raw: true,
          });
          patientUserData = Object.assign(patientUserData, { Patient });

          Auths.login(patientUserData, function (token) {
            return res.send({
              Success: true,
              Message: 'Successfully logged in',
              Data: { token: token, LogedUser: patientUserData },
            });
          });
        }
      }
    } else {
      return res.send({
        Success: false,
        Message: 'Нэвтрэх нэр эсвэл нууц үг буруу байна',
        Data: { token: null, LogedUser: null },
      });
    }
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// TRANSITIONAL - patients will move to DAN (national digital identity) with no
// password at all; see the plan's "Authentication: DAN + HUR" decision of
// 2026-09-08. Kept working so the current flow is not broken, but do not
// invest further here: this whole path retires when DAN lands.
async function ForgotPassword(req, res) {
  try {
    var result = { Data: null, Message: '', Success: true };
    const { UserName } = req.body;
    const user = await Models.PatientUsers.findOne({ where: { UserName } });
    var resetToken = '';
    if (user) {
      const email = user.Email;
      if (email) {
        resetToken = crypto.randomBytes(20).toString('hex');
        const ForgotPassToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        const ForgotPassExpireDate = Date.now() + 10 * 60 * 1000;
        await user.update({
          ForgotPassToken: ForgotPassToken,
          ForgotPassExpireDate: ObjectHelper.getDateYMDHMS({
            Date: new Date(ForgotPassExpireDate),
          }),
        });

        const link =
          process.env.CLIENT_APP_URL +
          'auth/ResetPassword?UserName=' +
          UserName +
          '&Token=' +
          resetToken;

        const MailContent = {
          to: email,
          subject: 'MnCardio - Нууц үг шинэчлэх',
          html: `Сайн байна уу<br />Системд нэвтрэх нууц үгээ доорх холбоос дээр дарж орон шинэчилнэ үү.<br />
      <br /><a target="_blanks" href="${link}">${link}</a><br /><br />MnCardio системийг ашиглаж байгаа танд баярлалаа.`,
        };
        const MailRes = await MailHelper.SendMail(MailContent);
        if (MailRes !== null) {
          result.Message = email + ' Е мэйл рүү амжилттай илгээлээ. Tа емэйлээ шалгана уу';
        } else {
          return res.send(
            JSON.stringify(
              BaseControllerHelper.GetDefaultErrorResult('Е мэйл илгээхэд алдаа гарлаа')
            )
          );
        }
      } else {
        result.Message = 'Хэрэглэгчийн емэйл хаяг бүртгэлгүй байна';
      }
    } else {
      result.Message = UserName + ' нэвтрэх нэртэй хэрэглэгч бүртгэлгүй байна';
    }

    return res.send(result);
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function ResetPassword(req, res) {
  try {
    var result = { Data: null, Message: '', Success: true };
    const { UserName, Token, Password } = req.body;
    if (UserName && Token && Password) {
      const user = await Models.PatientUsers.findOne({ where: { UserName } });
      if (user) {
        const hashToken = crypto.createHash('sha256').update(Token).digest('hex');
        if (user.ForgotPassToken === hashToken) {
          const NewPass = await bcrypt.hash(Password, 8);
          await user.update({
            Password: NewPass,
            ForgotPassToken: null,
            ForgotPassExpireDate: null,
          });
          result.Message = 'Password changed successfully';
        } else {
          result.Success = false;
          result.Message = 'The information sent is incorrect';
        }
      } else {
        result.Success = false;
        result.Message = 'No users found';
      }
      return res.send(result);
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

async function ChangePassword(req, res) {
  try {
    var result = { Data: null, Message: '', Success: true };
    const LogedUser = req.LogedUser;
    const { NewPassword, Password } = req.body;
    if (LogedUser && NewPassword && Password) {
      const user = await Models.PatientUsers.findOne({ where: { Id: LogedUser.Id } });
      if (user) {
        const isPasswordMatch = await bcrypt.compare(Password, user.Password);
        if (isPasswordMatch) {
          const NewPass = await bcrypt.hash(NewPassword, 8);
          await user.update({
            Password: NewPass,
            ForgotPassToken: null,
            ForgotPassExpireDate: null,
          });
          result.Message = 'Password changed successfully';
          return res.send(result);
        } else {
          return res.send(
            JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('The old password is wrong'))
          );
        }
      } else {
        return res.send(
          JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('No users found'))
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

function checkLogin(req, res) {
  let errorObject = { Success: false, Message: '', AuthError: true };
  if (req.token) {
    errorObject = {
      Success: true,
      Message: '',
      AuthError: false,
    };
  }
  return res.send(errorObject);
}

module.exports = router;
