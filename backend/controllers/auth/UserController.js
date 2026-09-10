const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const router = express.Router();

const { Models, Op } = require('../../config/DB');

const Auth = require('../../helper/Auth');
const ObjectHelper = require('../../helper/ObjectHelper');
const MailHelper = require('../../helper/MailHelper');
const BaseControllerHelper = require('../../helper/BaseControllerHelper');

// routes
router.post('/Login', (req, res, next) => {
  console.log('🔥 LOGIN ROUTE HIT - req.body:', req.body);
  console.log('🔥 Content-Type:', req.headers['content-type']);
  console.log('🔥 req.body type:', typeof req.body);
  Login(req, res, next);
});
router.post('/LogOut', Auth.verifyToken, LogOut);
router.post('/CheckLogin', Auth.verifyToken, CheckLogin);
router.post('/Save', Auth.verifyToken, Save);
router.post('/ForgetPassword', ForgetPassword);
router.route('/ResetPassword').post(ResetPassword);
router.post('/ChangePassword', Auth.verifyToken, ChangePassword);
router.post('/getUserData', Auth.verifyToken, getUserData);

async function LogOut(req, res) {
  const result = { Data: {}, Success: true, Message: 'Logout Success' };
  console.log('[UserController/LogOut] Response:', JSON.stringify(result));
  return res.send(result);
}

async function Save(req, res) {
  const Data = JSON.parse(req.body.Data);
  try {
    // Check if username already exists (for both insert and update)
    const existingUser = await Models.Users.findOne({
      where: { UserName: Data.UserName },
      raw: true,
    });

    // If we're updating an existing user, allow the same username to be kept
    if (existingUser) {
      // If this is an update operation (Id exists) and it's the same user, allow it
      if (Data.Id && existingUser.Id === Data.Id) {
        // Same user updating their info, proceed
      } else {
        // Either creating a new user with duplicate username or updating to a different user's username
        const errorResult = {
          Success: false,
          Message: 'Username already exists',
          Data: null,
        };
        console.log('[UserController/Save] ERROR Response:', JSON.stringify(errorResult));
        return res.send(errorResult);
      }
    }

    let SaveUser;
    if (Data.Id) {
      // Update existing user
      await Models.Users.update(Data, { where: { Id: Data.Id } });
      SaveUser = await Models.Users.findByPk(Data.Id);
    } else {
      // Create new user
      SaveUser = await Models.Users.create(Data);
    }

    if (SaveUser) {
      console.log('[UserController/Save] Response:', JSON.stringify(SaveUser));
      return res.send(SaveUser);
    } else {
      const errorResult = {
        Success: false,
        Message: 'Failed to save user',
        Data: null,
      };
      console.log('[UserController/Save] ERROR Response:', JSON.stringify(errorResult));
      return res.send(errorResult);
    }
  } catch (ex) {
    console.log(ex);
    const errorResult = BaseControllerHelper.GetDefaultErrorResult(ex.Message || ex.message);
    console.log('[UserController/Save] ERROR Response:', JSON.stringify(errorResult));
    return res.send(JSON.stringify(errorResult));
  }
}

function getUserData(req, res) {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    var token = bearerToken;
    Auth.getUserData(token, function (data) {
      console.log('[UserController/getUserData] Response:', JSON.stringify(data));
      return res.send(data);
    });
  } else {
    console.log('[UserController/getUserData] Response:', null);
    return res.send(null);
  }
}

async function CheckLogin(req, res) {
  console.log('[UserController/CheckLogin] Response:', true);
  return res.send(true);
}

async function Login(req, res) {
  // LOG THE ENTIRE REQUEST BODY FOR DEBUGGING
  console.log('=== LOGIN REQUEST RECEIVED ===');
  console.log('Full req.body:', JSON.stringify(req.body, null, 2));
  console.log('==============================');

  const { UserName, Password } = req.body;

  // LOG EXTRACTED VALUES
  console.log('Extracted UserName:', UserName);
  console.log('Extracted Password:', Password);

  try {
    // Use different authentication logic based on environment
    if (process.env.NODE_ENV === 'production') {
      // ORIGINAL PRODUCTION CODE - USERNAME AND PASSWORD VALIDATION
      if (!UserName || !Password) {
        return res.send({
          Success: false,
          Message: 'Login name or password is incorrect',
          Data: { token: null, LogedUser: null },
        });
      }

      // Get user
      let userDatas = await Models.Users.findAllDetail({
        where: { UserName, RoleId: { [Op.not]: 4 } },
      });

      userDatas = JSON.parse(JSON.stringify(userDatas));

      if (userDatas.length === 0) {
        return res.send({
          Success: false,
          Message: 'Login name or password is incorrect',
          Data: { token: null, LogedUser: null },
        });
      }

      const userData = userDatas[0];

      // Compare password
      const userPassword = userData.Password || '';
      const isPasswordMatch = await bcrypt.compare(Password, userPassword);

      if (!isPasswordMatch) {
        // ❌ Wrong password → DO NOT login
        return res.send({
          Success: false,
          Message: 'Login name or password is incorrect',
          Data: { token: null, LogedUser: null },
        });
      }

      // Remove password from response
      delete userData.Password;

      // Role check
      if (!userData.RoleId) {
        const errorResult = {
          Success: false,
          Message: 'Хандалтын эрхийн мэдээлэл олдсонгүй',
          Data: { token: null, LogedUser: null },
        };
        console.log('[UserController/Login] ERROR Response:', JSON.stringify(errorResult));
        return res.send(errorResult);
      }

      // Load doctor data if role != 4
      if (userData.RoleId + '' !== '4') {
        const Doctor = await Models.DoctorsProfile.findOne({
          where: { id: userData.Id },
          include: [
            {
              model: Models.Organization,
              as: 'Organization',
              include: [
                {
                  model: Models.DictProvinceCity,
                  as: 'DictProvinceCity',
                  attributes: ['id_data', 'name', 'date_creation'],
                },
                {
                  model: Models.DictSoumDistrict,
                  as: 'DictSoumDistrict',
                  attributes: ['id_data', 'name'],
                },
                {
                  model: Models.DictBagKhoroo,
                  as: 'DictBagKhoroo',
                  attributes: ['id_data', 'name'],
                },
              ],
            },
          ],
          attributes: [
            'id_data',
            'lastname',
            'firstname',
            'email',
            'skype',
            'OrganizationId',
            'addr_prov_city',
            'ProvCityName',
            'addr_soum_dist',
            'SoumDistName',
            'addr_bag_khoroo',
            'BagKhorooName',
            'FullName',
          ],
        });

        if (!Doctor) {
          const errorResult = {
            Success: false,
            Message: 'Хэрэглэгчид харъяалагдах эмчийн мэдээлэл олдсонгүй',
            Data: { token: null, LogedUser: null },
          };
          console.log('[UserController/Login] ERROR Response:', JSON.stringify(errorResult));
          return res.send(errorResult);
        }

        userData.Doctor = JSON.parse(JSON.stringify(Doctor));
      }

      // Generate JWT token
      Auth.login(userData, function (token) {
        const result = {
          Success: true,
          Message: 'Successfully logged in',
          Data: { token, LogedUser: userData },
        };
        console.log('[UserController/Login] SUCCESS Response:', JSON.stringify(result));
        return res.send(result);
      });
    } else {
      // DEVELOPMENT/TESTING CODE - TREAT UserName AS Id (NO PASSWORD VALIDATION)
      // Require UserName (which will be treated as UserId)
      if (!UserName) {
        console.log('ERROR: login name is missing or empty');
        const errorResult = {
          Success: false,
          Message: 'Login name is required',
          Data: { token: null, LogedUser: null },
        };
        console.log('[UserController/Login] ERROR Response:', JSON.stringify(errorResult));
        return res.send(errorResult);
      }

      // DEV LOGIN (NO PASSWORD VALIDATION).
      // Accepts the real UserName. A purely numeric value is also matched against
      // Users.Id, so the previous "type the Id" behaviour keeps working.
      const LoginKey = String(UserName).trim();
      const MatchById = /^\d+$/.test(LoginKey) ? [{ Id: Number(LoginKey) }] : [];
      console.log(
        'Dev login lookup:',
        LoginKey,
        MatchById.length ? '(UserName or Id)' : '(UserName)'
      );
      let userDatas = await Models.Users.findAllDetail({
        where: {
          [Op.and]: [
            { RoleId: { [Op.not]: 4 } },
            { [Op.or]: [{ UserName: LoginKey }, ...MatchById] },
          ],
        },
      });

      userDatas = JSON.parse(JSON.stringify(userDatas));

      // If the input matched both someone's UserName and someone else's Id,
      // the UserName owner wins.
      if (userDatas.length > 1) {
        userDatas.sort((a, b) => (b.UserName === LoginKey) - (a.UserName === LoginKey));
      }
      console.log('Database query result - users found:', userDatas.length);

      if (userDatas.length === 0) {
        console.log('ERROR: No user found for login key:', UserName);
        const errorResult = {
          Success: false,
          Message: 'User not found',
          Data: { token: null, LogedUser: null },
        };
        console.log('[UserController/Login] ERROR Response:', JSON.stringify(errorResult));
        return res.send(errorResult);
      }

      const userData = userDatas[0];
      console.log('User found - Id:', userData.Id, 'UserName:', userData.UserName);

      // Remove password from response
      delete userData.Password;

      // Role check
      if (!userData.RoleId) {
        const errorResult = {
          Success: false,
          Message: 'Хандалтын эрхийн мэдээлэл олдсонгүй',
          Data: { token: null, LogedUser: null },
        };
        console.log('[UserController/Login] ERROR Response:', JSON.stringify(errorResult));
        return res.send(errorResult);
      }

      // Load doctor data if role != 4
      if (userData.RoleId + '' !== '4') {
        const Doctor = await Models.DoctorsProfile.findOne({
          where: { id: userData.Id },
          include: [
            {
              model: Models.Organization,
              as: 'Organization',
              include: [
                {
                  model: Models.DictProvinceCity,
                  as: 'DictProvinceCity',
                  attributes: ['id_data', 'name', 'date_creation'],
                },
                {
                  model: Models.DictSoumDistrict,
                  as: 'DictSoumDistrict',
                  attributes: ['id_data', 'name'],
                },
                {
                  model: Models.DictBagKhoroo,
                  as: 'DictBagKhoroo',
                  attributes: ['id_data', 'name'],
                },
              ],
            },
          ],
          attributes: [
            'id_data',
            'lastname',
            'firstname',
            'email',
            'skype',
            'OrganizationId',
            'addr_prov_city',
            'ProvCityName',
            'addr_soum_dist',
            'SoumDistName',
            'addr_bag_khoroo',
            'BagKhorooName',
            'FullName',
          ],
        });

        if (!Doctor) {
          const errorResult = {
            Success: false,
            Message: 'Хэрэглэгчид харъяалагдах эмчийн мэдээлэл олдсонгүй',
            Data: { token: null, LogedUser: null },
          };
          console.log('[UserController/Login] ERROR Response:', JSON.stringify(errorResult));
          return res.send(errorResult);
        }

        userData.Doctor = JSON.parse(JSON.stringify(Doctor));
      }

      // Generate JWT token regardless of password validation (FOR TESTING PURPOSES)
      Auth.login(userData, function (token) {
        const result = {
          Success: true,
          Message: 'Successfully logged in (TEST MODE - token generated regardless of password)',
          Data: { token, LogedUser: userData },
        };
        console.log('[UserController/Login] SUCCESS Response:', JSON.stringify(result));
        return res.send(result);
      });
    }
  } catch (ex) {
    console.log(ex);
    const errorResult = BaseControllerHelper.GetDefaultErrorResult();
    console.log('[UserController/Login] EXCEPTION Response:', JSON.stringify(errorResult));
    return res.send(JSON.stringify(errorResult));
  }
}

async function ForgetPassword(req, res) {
  var result = { Data: null, Message: '', Success: true };
  const UserName = req.body.UserName;
  const user = await Models.Users.findOne({ where: { UserName } });
  var resetToken = '';
  try {
    if (user) {
      const email = user.Email;
      if (email) {
        resetToken = crypto.randomBytes(20).toString('hex');
        const ForgotPassToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        const ForgotPassExpireDate = Date.now() + 10 * 60 * 1000;
        await user.update({
          ForgotPassToken,
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
        var MailRes = await MailHelper.SendMail(MailContent);
        if (MailRes !== null) {
          result.Success = true;
          result.Message = email + 'Successfully sent to email. Please check your email';
        } else {
          const errorResult = BaseControllerHelper.GetDefaultErrorResult(
            'An error occurred while sending email'
          );
          console.error(
            '[UserController/ForgetPassword] Mail send failed:',
            MailHelper.LastError,
            JSON.stringify(errorResult)
          );
          return res.send(JSON.stringify(errorResult));
        }
      } else {
        result.Success = false;
        result.Message = "The user's email address is not registered";
      }
    } else {
      result.Success = false;
      result.Message = 'User is not registered';
    }
    console.log('[UserController/ForgetPassword] Response:', JSON.stringify(result));
    return res.send(result);
  } catch (error) {
    console.log({ error });
    const errorResult = BaseControllerHelper.GetDefaultErrorResult();
    console.log('[UserController/ForgetPassword] EXCEPTION Response:', JSON.stringify(errorResult));
    return res.send(JSON.stringify(errorResult));
  }
}

// Martsan password sergeeh
async function ResetPassword(req, res) {
  var result = { Data: null, Message: '', Success: true };
  const { UserName, Token, Password } = req.body;

  const PasswordRegex =
    /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()+=-\?;,./{}|\":<>\[\]\\\' ~_]).{8,}/;

  if (UserName && Token && Password) {
    const user = await Models.Users.findOne({ where: { UserName }, raw: true });
    if (user) {
      const hashToken = crypto.createHash('sha256').update(Token).digest('hex');
      if (user.ForgotPassToken === hashToken) {
        if (PasswordRegex.test(Password)) {
          const NewPass = await bcrypt.hash(Password, 8);
          await user.update({
            Password: NewPass,
            ForgotPassToken: null,
            ForgotPassExpireDate: null,
          });
          result.Message = 'Password changed successfully';
        } else {
          result.Success = false;
          result.Message =
            'Password does not meet the requirements !!! Must be longer than 8, contain 1 uppercase letter, 1 special character, and 1 number';
        }
      } else {
        result.Success = false;
        result.Message = 'The information sent is incorrect';
      }
    } else {
      result.Success = false;
      result.Message = 'User is not registered';
    }
    console.log('[UserController/ResetPassword] Response:', JSON.stringify(result));
    return res.send(result);
  } else {
    const errorResult = BaseControllerHelper.GetDefaultErrorResult('Information is missing');
    console.log('[UserController/ResetPassword] ERROR Response:', JSON.stringify(errorResult));
    return res.send(JSON.stringify(errorResult));
  }
}

// Password shinechleh
async function ChangePassword(req, res) {
  var result = { Data: null, Message: '', Success: true };
  const { NewPassword, Password } = req.body;

  try {
    const LogedUser = req.LogedUser;
    const PasswordRegex =
      /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()+=-\?;,./{}|\":<>\[\]\\\' ~_]).{8,}/;

    if (LogedUser && NewPassword && Password) {
      const user = await Models.Users.findOne({
        where: { Id: LogedUser.Id },
        raw: true,
      });
      if (user) {
        if (PasswordRegex.test(NewPassword)) {
          const isPasswordMatch = await bcrypt.compare(Password, user.Password);
          if (isPasswordMatch) {
            const NewPass = await bcrypt.hash(NewPassword, 8);
            // Update password by Loged User Id
            await Models.Users.update(
              {
                Password: NewPass,
                ForgotPassToken: null,
                ForgotPassExpireDate: null,
              },
              { where: { Id: LogedUser.Id } }
            );

            // return response
            result.Success = true;
            result.Message = 'Password changed successfully';
            console.log(
              '[UserController/ChangePassword] SUCCESS Response:',
              JSON.stringify(result)
            );
            return res.send(result);
          } else {
            const errorResult = BaseControllerHelper.GetDefaultErrorResult(
              'The old password is wrong'
            );
            console.log(
              '[UserController/ChangePassword] ERROR Response:',
              JSON.stringify(errorResult)
            );
            return res.send(JSON.stringify(errorResult));
          }
        } else {
          const errorResult = BaseControllerHelper.GetDefaultErrorResult(
            'Password does not meet the requirements !!! Must be longer than 8, contain 1 uppercase letter, 1 special character, and 1 number'
          );
          console.log(
            '[UserController/ChangePassword] ERROR Response:',
            JSON.stringify(errorResult)
          );
          return res.send(JSON.stringify(errorResult));
        }
      } else {
        const errorResult = BaseControllerHelper.GetDefaultErrorResult('No users found');
        console.log('[UserController/ChangePassword] ERROR Response:', JSON.stringify(errorResult));
        return res.send(JSON.stringify(errorResult));
      }
    } else {
      const errorResult = BaseControllerHelper.GetDefaultErrorResult('Information is missing');
      console.log('[UserController/ChangePassword] ERROR Response:', JSON.stringify(errorResult));
      return res.send(JSON.stringify(errorResult));
    }
  } catch (ex) {
    console.log(ex);
    const errorResult = BaseControllerHelper.GetDefaultErrorResult('Information is missing');
    console.log('[UserController/ChangePassword] EXCEPTION Response:', JSON.stringify(errorResult));
    return res.send(JSON.stringify(errorResult));
  }
}

module.exports = router;
