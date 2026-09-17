const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const router = express.Router();

const { Models, Op } = require('../../config/DB');

const Auth = require('../../helper/Auth');
const ObjectHelper = require('../../helper/ObjectHelper');
const MailHelper = require('../../helper/MailHelper');
const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const { PasswordRegex, IsBcryptHash } = require('../../helper/PasswordPolicy');
const { CheckContact } = require('../../helper/ContactValidation');
const Flags = require('../../helper/FeatureFlags');
const LoginGuard = require('../../helper/LoginGuard');
const SessionStore = require('../../helper/SessionStore');
const LicenceGate = require('../../helper/LicenceGate');
const AccountWriteGuard = require('../../helper/AccountWriteGuard');
const RegistrationRequest = require('../../helper/RegistrationRequest');
const PasswordResetLink = require('../../helper/PasswordResetLink');

// routes
router.post('/Login', Login);
router.post('/LogOut', Auth.verifyToken, LogOut);
router.post('/CheckLogin', Auth.verifyToken, CheckLogin);
router.post('/Save', Auth.verifyToken, Save);
router.post('/ForgetPassword', ForgetPassword);
router.route('/ResetPassword').post(ResetPassword);
router.post('/ChangePassword', Auth.verifyToken, ChangePassword);
router.post('/getUserData', Auth.verifyToken, getUserData);
router.post('/GetMyContact', Auth.verifyToken, GetMyContact);
router.post('/UpdateMyContact', Auth.verifyToken, UpdateMyContact);

//#region Own contact details (post-login prompt)

// Staff only. Patients (role 4) live in PatientUsers and get their details from ХУР/ДАН.
function IsStaff(LogedUser) {
  return !!(LogedUser && LogedUser.Id && String(LogedUser.RoleId) !== '4');
}

// `Users.Email` is what password reset mails, so "missing" is judged on it.
// The profile copy is only a prefill for the prompt.
async function LoadOwnContact(UserId) {
  const User = await Models.Users.findOne({
    where: { Id: UserId },
    attributes: ['Id', 'Email'],
    raw: true,
  });
  const Doctor = await Models.DoctorsProfile.findOne({
    where: { UserId },
    attributes: ['id_data', 'email', 'telephone'],
    raw: true,
  });
  const UserEmail = User && User.Email ? String(User.Email).trim() : '';
  const Phone = Doctor && Doctor.telephone ? String(Doctor.telephone).trim() : '';
  return {
    DoctorId: Doctor ? Doctor.id_data : null,
    Email: UserEmail || (Doctor && Doctor.email ? String(Doctor.email).trim() : ''),
    Phone,
    Missing: { Email: !UserEmail, Phone: !Phone },
  };
}

async function GetMyContact(req, res) {
  try {
    const LogedUser = req.LogedUser;
    if (!IsStaff(LogedUser)) {
      return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Access denied')));
    }
    const Contact = await LoadOwnContact(LogedUser.Id);
    delete Contact.DoctorId;
    return res.send(JSON.stringify({ Success: true, Message: '', Data: Contact }));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// Writes ONLY the caller's own account - the target is req.LogedUser, never the body.
async function UpdateMyContact(req, res) {
  try {
    const LogedUser = req.LogedUser;
    if (!IsStaff(LogedUser)) {
      return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Access denied')));
    }

    const Data = { Email: req.body.Email, Phone: req.body.Phone };
    const ContactError = CheckContact(Data, {
      EmailKey: 'Email',
      PhoneKey: 'Phone',
      Required: true,
    });
    if (ContactError) {
      return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult(ContactError)));
    }

    const Current = await LoadOwnContact(LogedUser.Id);
    if (!Current.DoctorId) {
      return res.send(
        JSON.stringify(
          BaseControllerHelper.GetDefaultErrorResult(
            'Хэрэглэгчид харъяалагдах эмчийн мэдээлэл олдсонгүй'
          )
        )
      );
    }

    // updateNew carries the case-insensitive duplicate-email check.
    await Models.Users.updateNew({ Email: Data.Email }, LogedUser.Id, 'Id');
    await Models.DoctorsProfile.update(
      {
        email: Data.Email,
        telephone: Data.Phone,
        date_modif: new Date(),
        user_mod: String(LogedUser.Id),
      },
      { where: { UserId: LogedUser.Id } }
    );
    Auth.clearUserCache(LogedUser.RoleId, LogedUser.Id);

    await BaseControllerHelper.CreateUserActionHistory({
      LinkObjectName: 'DoctorsProfile',
      LinkObjectId: Current.DoctorId,
      NotesMn: 'Холбоо барих мэдээллээ шинэчиллээ',
      Notes: 'Updated own contact details',
      Action: 'Update',
      LogedUser,
    });

    return res.send(
      JSON.stringify({
        Success: true,
        Message: 'Successfully saved',
        Data: { Email: Data.Email, Phone: Data.Phone },
      })
    );
  } catch (ex) {
    console.log(ex);
    return res.send(
      JSON.stringify(BaseControllerHelper.GetDefaultErrorResult(ex.Message || ex.message))
    );
  }
}

//#endregion

/**
 * Logout that actually logs out.
 *
 * This returned success without doing anything: the token stayed valid for its
 * full ten hours, so "log out" was cosmetic and a lost phone could not be cut
 * off. It now revokes THIS session by the jti verifyToken put on the request -
 * the caller sends nothing identifying it, so one session cannot be used to end
 * another.
 *
 * The response shape is unchanged, deliberately. frontend/src/helper/AuthHelper.js
 * already calls this with the bearer token and already clears localStorage on
 * Success: true, so the web client starts genuinely invalidating sessions with
 * no frontend change at all.
 *
 * Does nothing while TOKEN_REVOCATION_ENABLED is off, which is the default.
 */
async function LogOut(req, res) {
  try {
    if (req.TokenJti) await SessionStore.Revoke(req.TokenJti, 'logout');
  } catch (ex) {
    // A failure here must not stop the client clearing its own state - the
    // worst case is the old behaviour, which is what shipped for years.
    console.error('[UserController/LogOut] revoke failed: ' + ex.message);
  }
  return res.send({ Data: {}, Success: true, Message: 'Logout Success' });
}

async function Save(req, res) {
  try {
    // Writes Users straight from the body - RoleId, Password, any Id - so it is
    // an administrator tool or nothing. No screen calls it today; before this
    // check any token, a patient's included, could make itself role 1.
    if (!AccountWriteGuard.IsAdmin(req.LogedUser)) {
      return res.send(
        JSON.stringify(
          BaseControllerHelper.GetDefaultErrorResult('Хэрэглэгчийн эрх зөвхөн админ үүсгэнэ')
        )
      );
    }
    const Data = JSON.parse(req.body.Data);
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

    // This route writes Users directly, so it never passes through
    // ModelHelper.SaveRoot - the only place a Type:'Password' field gets bcrypted.
    // Hash here or the password lands in the table in plain text.
    if (Data.Password && !IsBcryptHash(Data.Password)) {
      if (!PasswordRegex.test(Data.Password)) {
        const errorResult = {
          Success: false,
          Message:
            'Нууц үг хамгийн багадаа 8 тэмдэгт, том, жижиг үсэг, тоо, тусгай тэмдэгт агуулсан байх ёстой',
          Data: null,
        };
        return res.send(errorResult);
      }
      Data.Password = await bcrypt.hash(Data.Password, 8);
    } else if (Data.Password === '' || Data.Password === null) {
      // An update that leaves the field blank must not wipe the stored password.
      delete Data.Password;
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
      console.log('[UserController/Save] Response: saved user Id', SaveUser.Id);
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
  // No request-body or password logging here, in any environment. The two
  // blocks that used to sit at this point printed req.body and then the
  // submitted password in plaintext. server.js silences console.log only when
  // NODE_ENV === 'production', so on every developer machine and every test
  // host those lines wrote real credentials into the log.
  const { UserName, Password } = req.body;

  // The password-checking branch is now the DEFAULT, not the production-only
  // one. It used to be gated on NODE_ENV === 'production', so anything that
  // was not exactly that string - a test host, a machine with NODE_ENV unset,
  // a container someone forgot to configure - issued a token for whoever you
  // named, with no password. Opting out is now explicit and defaults to off.
  const UseInsecureDevLogin = process.env.NODE_ENV !== 'production' && Flags.AllowInsecureDevAuth;

  try {
    if (!UseInsecureDevLogin) {
      // USERNAME AND PASSWORD VALIDATION
      if (!UserName || !Password) {
        return res.send({
          Success: false,
          Message: 'Login name or password is incorrect',
          Data: { token: null, LogedUser: null },
        });
      }

      // Lockout is checked BEFORE the lookup, which also closes a timing
      // oracle: the findAllDetail plus bcrypt.compare below takes measurably
      // longer than an early return, so without this an attacker could tell
      // "no such user" from "wrong password" by the clock even though both
      // answer with the same message.
      const Guard = await LoginGuard.Check({ UserType: 'staff', UserName });
      if (Guard.Locked) {
        return res.send({
          Success: false,
          Message: LoginGuard.LockedMessage(Guard.RetryAfterSec),
          Data: { token: null, LogedUser: null },
        });
      }

      // Get user
      let userDatas = await Models.Users.findAllDetail({
        where: { UserName, RoleId: { [Op.not]: 4 } },
      });

      userDatas = JSON.parse(JSON.stringify(userDatas));

      if (userDatas.length === 0) {
        // A doctor whose sign-up request is still open, or was declined, has
        // no Users row yet. Tell them why - but only when their password
        // matches the request's, so this reveals nothing to anyone else.
        const RequestMessage = await RegistrationRequest.LoginStatusMessage(UserName, Password);
        if (RequestMessage) {
          return res.send({
            Success: false,
            Message: RequestMessage,
            Data: { token: null, LogedUser: null },
          });
        }
        await LoginGuard.RecordFailure({
          UserType: 'staff',
          UserName,
          Reason: 'NO_USER',
          Req: req,
        });
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
        // Wrong password -> do not login
        const Fail = await LoginGuard.RecordFailure({
          UserType: 'staff',
          UserName,
          UserId: userData.Id,
          Reason: 'BAD_PASSWORD',
          Req: req,
        });

        // Notify the account holder, once per lock. Awaited rather than fired
        // and forgotten so a mail failure is logged against this request, but
        // LoginGuard.Notify never throws - a broken SMTP host must not turn a
        // failed login into a 500.
        if (Fail.ShouldNotify) {
          await LoginGuard.Notify({ Email: userData.Email, UserName, Req: req });
        }

        return res.send({
          Success: false,
          Message: Fail.Locked
            ? LoginGuard.LockedMessage(Flags.LoginLockoutMinutes * 60)
            : 'Login name or password is incorrect',
          Data: { token: null, LogedUser: null },
        });
      }

      // Remove password from response
      delete userData.Password;

      // Role check
      if (!userData.RoleId) {
        await LoginGuard.RecordFailure({
          UserType: 'staff',
          UserName,
          UserId: userData.Id,
          Reason: 'NO_ROLE',
          Req: req,
        });
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
            // The post-login contact prompt needs to know whether a phone exists.
            'telephone',
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

      /*
       * Licence gate (tracker 13). Checked AFTER the password, deliberately:
       * "your licence is not registered" told to somebody who does not know the
       * password would confirm that the account exists.
       *
       * Off by default. MEASURED 2026-09-14: all 3,298 active doctors across
       * 660 organizations currently have no licence code, so enforce mode today
       * would lock out the entire national user base. See helper/LicenceGate.js.
       */
      const Licence = await LicenceGate.CheckLicence(userData);
      if (!Licence.Allowed) {
        await LoginGuard.RecordFailure({
          UserType: 'staff',
          UserName,
          UserId: userData.Id,
          Reason: 'NO_LICENSE',
          Req: req,
        });
        return res.send({
          Success: false,
          Message: LicenceGate.RefusedMessage(),
          Data: { token: null, LogedUser: null },
        });
      }

      // warn mode: allowed, but recorded and reported. This is what produces
      // the "who is actually affected" answer from real logins.
      if (Licence.Reason && Licence.Reason !== 'exempt' && Licence.Reason !== 'CHECK_FAILED') {
        userData.LicenseWarning = LicenceGate.WarningFor(Licence);
        // Awaited, and caught. CreateUserActionHistory has no try/catch of its
        // own - it awaits GetConfigData and SaveRoot, both of which throw on any
        // DB error - and this was the one call site in the repo that neither
        // awaited it nor attached a .catch(). With no unhandledRejection handler
        // registered, a DB hiccup here terminated the process, on the staff
        // login path.
        //
        // The catch is deliberate: this row is a record of a licence warning,
        // and failing to write it must not stop a doctor with a correct password
        // from logging in.
        try {
          await BaseControllerHelper.CreateUserActionHistory({
            LinkObjectName: 'DoctorsProfile',
            LinkObjectId: userData.Id,
            Action: 'LoginNoLicense',
            LogedUser: userData,
            Notes: 'Login without a practice licence code',
            NotesMn: 'Зөвшөөрлийн кодгүй нэвтэрлээ',
          });
        } catch (ex) {
          console.error('Failed to record LoginNoLicense audit row:', ex);
        }
      }

      // The password was right and the account is usable: end the episode, so
      // a doctor who mistyped twice and then got it right does not stay two
      // failures away from a lockout for the rest of the window.
      await LoginGuard.RecordSuccess({
        UserType: 'staff',
        UserName,
        UserId: userData.Id,
        Req: req,
      });

      // Generate JWT token
      // req is passed so the session row records the originating IP - useful
      // when a user asks which devices are signed in.
      Auth.login(
        userData,
        function (token) {
          const result = {
            Success: true,
            Message: 'Successfully logged in',
            Data: { token, LogedUser: userData },
          };
          // The response carries a bearer token and the full user record. Log
          // that a login succeeded, not what was handed out.
          console.log('[UserController/Login] SUCCESS for', userData.UserName);
          return res.send(result);
        },
        req
      );
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
            'telephone',
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
  try {
    const user = UserName ? await Models.Users.findOne({ where: { UserName }, raw: true }) : null;
    if (user) {
      const email = user.Email;
      if (email) {
        const link = await PasswordResetLink.Issue({
          UserId: user.Id,
          UserName: user.UserName,
          ValidMinutes: 10,
        });
        const MailContent = {
          to: email,
          subject: 'MnCardio - Нууц үг шинэчлэх',
          html: `Сайн байна уу<br />Системд нэвтрэх нууц үгээ доорх холбоос дээр дарж орон шинэчилнэ үү.<br />
      <br /><a target="_blanks" href="${link}">${link}</a><br /><br />MnCardio системийг ашиглаж байгаа танд баярлалаа.`,
        };
        var MailRes = await MailHelper.SendMail(MailContent);
        if (MailRes !== null) {
          result.Success = true;
          result.Message = email + ' Successfully sent to email. Please check your email';
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

  if (!(UserName && Token && Password)) {
    const errorResult = BaseControllerHelper.GetDefaultErrorResult('Information is missing');
    console.log('[UserController/ResetPassword] ERROR Response:', JSON.stringify(errorResult));
    return res.send(JSON.stringify(errorResult));
  }

  try {
    const user = await Models.Users.findOne({ where: { UserName }, raw: true });
    if (user) {
      // Checks the expiry too, which the old comparison never did.
      if (PasswordResetLink.IsValid(user, Token)) {
        if (PasswordRegex.test(Password)) {
          const NewPass = await bcrypt.hash(Password, 8);
          // `user` is a raw row - it has no .update(). Calling it threw, outside
          // any try, so every reset ended in a hung request.
          await Models.Users.update(
            { Password: NewPass, ForgotPassToken: null, ForgotPassExpireDate: null },
            { where: { Id: user.Id } }
          );
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
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// Password shinechleh
async function ChangePassword(req, res) {
  var result = { Data: null, Message: '', Success: true };
  const { NewPassword, Password } = req.body;

  try {
    const LogedUser = req.LogedUser;

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
