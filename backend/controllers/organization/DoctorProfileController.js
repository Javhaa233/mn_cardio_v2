const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const { Models, Op } = require('../../config/DB');

const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const ObjectHelper = require('../../helper/ObjectHelper');
const ModelHelper = require('../../helper/ModelHelper');
const { PasswordRegex } = require('../../helper/PasswordPolicy');
const { CheckContact } = require('../../helper/ContactValidation');

// routes
router.post('/GetByUserId', GetByUserId);
router.post('/GetCustomFormData', GetCustomFormData);
router.post('/GetDoctorsProfileInfo', GetDoctorsProfileInfo);
router.post('/CustomCreate', CustomCreate);
router.post('/CustomUpdate', CustomUpdate);
router.post('/ChangePassword', ChangePassword);

// Practice licence codes (tracker 13). Without these nothing could SET a code,
// so enabling enforcement would lock everybody out with no way back in.
router.post('/SetLicense', SetLicense);
router.post('/GetLicenseStatus', GetLicenseStatus);
router.post('/ClearLicense', ClearLicense);

async function GetName(ObjectName, Id) {
  var Name = null;
  const DictArray = ['DictProvinceCity', 'DictSoumDistrict', 'DictBagKhoroo'];
  if (DictArray.includes(ObjectName)) {
    const Model = Models[ObjectName];
    if (Id) {
      const Data = await Model.findByPk(Id, {
        attributes: ['id_data', 'name'],
        raw: true,
      });
      Name = Data && Data.name;
    }
  }

  return Name;
}

async function SetDictNames(Data) {
  var NewData = Data;
  const addr_prov_city = NewData && NewData.addr_prov_city ? NewData.addr_prov_city : null;
  const addr_soum_dist = NewData && NewData.addr_soum_dist ? NewData.addr_soum_dist : null;
  const addr_bag_khoroo = NewData && NewData.addr_bag_khoroo ? NewData.addr_bag_khoroo : null;

  if (addr_prov_city) {
    NewData['ProvCityName'] = await GetName('DictProvinceCity', addr_prov_city);
  }
  if (addr_soum_dist) {
    NewData['SoumDistName'] = await GetName('DictSoumDistrict', addr_soum_dist);
  }
  if (addr_bag_khoroo) {
    NewData['BagKhorooName'] = await GetName('DictBagKhoroo', addr_bag_khoroo);
  }

  return NewData;
}

async function CustomCreate(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully saved', Data: {} };
    const LogedUser = req.LogedUser;
    let Data = JSON.parse(req.body.Data);

    // A new doctor account must carry both - see helper/ContactValidation.
    const ContactError = CheckContact(Data, { Required: true });
    if (ContactError) {
      return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult(ContactError)));
    }

    Data = await SetDictNames(Data);

    if (Data && LogedUser) {
      const Result = await BaseControllerHelper.BaseCreate({
        ObjectName: 'DoctorsProfile',
        Data,
        LogedUser,
        SaveLog: true,
      });
      result.Data = { DataId: Result };
      return res.send(JSON.stringify(result));
    } else {
      result.Success = false;
      result.Message = 'Save failed';
      return res.send(JSON.stringify(result));
    }
  } catch (ex) {
    console.error(ex);
    return res.send(
      JSON.stringify(BaseControllerHelper.GetDefaultErrorResult(ex.Message || ex.message))
    );

  }
}

// Custom Update
async function CustomUpdate(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully saved', Data: {} };
    const LogedUser = req.LogedUser;
    let Data = JSON.parse(req.body.Data);

    // Only changed fields arrive; a sent email/phone must be valid and not blank.
    const ContactError = CheckContact(Data, { Required: false });
    if (ContactError) {
      return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult(ContactError)));
    }

    Data = await SetDictNames(Data);
    if (Data && LogedUser) {
      const Result = await BaseControllerHelper.BaseUpdate({
        ObjectName: 'DoctorsProfile',
        Data,
        LogedUser,
        SaveLog: true,
      });

      result.Success = true;
      result.Data = { DataId: Result };
      return res.send(JSON.stringify(result));
    } else {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Information is missing'))
      );
    }
  } catch (ex) {
    console.error(ex);
    return res.send(
      JSON.stringify(BaseControllerHelper.GetDefaultErrorResult(ex.Message || ex.message))
    );

  }
}

async function GetCustomFormData(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [], Option: {} };
    const DoctorsProfileConfigData = await BaseControllerHelper.GetConfigData('DoctorsProfile');
    const Data = DoctorsProfileConfigData.Fields;
    result.Option = { Total: 1, FooterData: [] };
    result.Data = { Fields: Data };
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function GetDoctorsProfileInfo(req, res) {
  try {
    var result = { Success: true, Message: '', Data: null, Option: {} };
    // const LogedUser = req.LogedUser;
    var DoctorId = req.body.DoctorId;
    const AppId = req.body.AppId;

    const DoctorsProfileConfigData = await BaseControllerHelper.GetConfigData('DoctorsProfile');
    const ModHelper = new ModelHelper(Models.DoctorsProfile);
    let Doctors = await Models.DoctorsProfile.findAllNew({
      where: { id_data: DoctorId, AppId: AppId },
    });
    Doctors = JSON.parse(JSON.stringify(Doctors));

    var Doctor = null;
    if (Doctors.length === 1) {
      Doctor = ModHelper.GetNewObject(Doctors[0]);
    }
    await ModHelper.GetInfoData(Doctor, DoctorsProfileConfigData);
    Doctor = await BaseControllerHelper.BaseSetFiles({
      ConfigData: DoctorsProfileConfigData,
      Data: Doctor,
      Thumbnail: true,
      Percentage: 70,
    });
    delete Doctor.idObj;
    result.Data = Doctor;
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function GetByUserId(req, res) {
  try {
    var result = { Success: true, Message: '', Data: null, Option: {} };

    const { UserId, AppId } = req.body;
    const LogedUser = req.LogedUser;

    if (!UserId) {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('UserId шаардлагатай'))
      );
    }

    // A request that omitted AppId put `undefined` straight into the where
    // clause, which Sequelize rejects - so this answered "An error occurred"
    // for every caller that did not happen to send it. Fall back to the
    // caller's own AppId, and simply do not constrain the column if there is
    // none to constrain it by.
    const ScopeAppId = AppId !== undefined && AppId !== null ? AppId : LogedUser && LogedUser.AppId;
    const Where = { '$Users.Id$': UserId };
    if (ScopeAppId !== undefined && ScopeAppId !== null) Where.AppId = ScopeAppId;

    const DoctorsProfileConfigData = await BaseControllerHelper.GetConfigData('DoctorsProfile');
    const ModHelper = new ModelHelper(Models.DoctorsProfile);
    let Doctors = await Models.DoctorsProfile.findAllNew({ where: Where });
    Doctors = JSON.parse(JSON.stringify(Doctors));

    var Doctor = null;
    if (Doctors.length === 1) {
      Doctor = ModHelper.GetNewObject(Doctors[0]);
      await ModHelper.GetInfoData(Doctor, DoctorsProfileConfigData);
      Doctor = await BaseControllerHelper.BaseSetFiles({
        ConfigData: DoctorsProfileConfigData,
        Data: Doctor,
        Thumbnail: true,
        Percentage: 70,
      });
      delete Doctor.idObj;
      result.Data = Doctor;
    }

    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// Password shinechleh
async function ChangePassword(req, res) {
  var result = { Data: null, Message: '', Success: true };

  const LogedUser = req.LogedUser;
  const { OldPassword, NewPassword, UserId, DoctorId } = req.body;

  try {
    if (LogedUser && NewPassword && (UserId || DoctorId)) {
      let targetUserId = UserId;
      let doctorProfile = null;

      if (DoctorId) {
        doctorProfile = await Models.DoctorsProfile.findByPk(DoctorId, { raw: true });
        if (doctorProfile && !targetUserId) {
          targetUserId = doctorProfile.UserId;
        }
      }

      let user = null;
      if (targetUserId) {
        user = await Models.Users.findOne({
          where: { Id: targetUserId },
          raw: true,
        });
      }

      // If user not found but we have a DoctorProfile, create the user
      if (!user && doctorProfile) {
        const NewPass = await bcrypt.hash(NewPassword, 8);
        const UserData = {
          UserName:
            doctorProfile.email || doctorProfile.telephone || `user_${doctorProfile.id_data}`,
          Email: doctorProfile.email,
          LastName: doctorProfile.lastname,
          FirstName: doctorProfile.firstname,
          Password: NewPass,
          AppId: doctorProfile.AppId,
          IsActive: '1',
          CreateDate: new Date().toISOString(),
          CreateUserId: LogedUser.Id,
        };

        // Create new user
        const newUser = await Models.Users.create(UserData);
        targetUserId = newUser.Id;

        // Link user to DoctorProfile if not already linked correctly
        await Models.DoctorsProfile.update(
          { UserId: targetUserId },
          { where: { id_data: DoctorId } }
        );

        result.Success = true;
        result.Message = 'User created and password set successfully';
        return res.send(result);
      }

      if (user) {
        if (PasswordRegex.test(NewPassword)) {
          const NewPass = await bcrypt.hash(NewPassword, 8);
          // Update password for the target UserId
          await Models.Users.update(
            {
              Password: NewPass,
              ForgotPassToken: null,
              ForgotPassExpireDate: null,
            },
            { where: { Id: targetUserId } }
          );

          result.Success = true;
          result.Message = 'Password changed successfully';
          console.log(
            '[DoctorProfileController/ChangePassword] SUCCESS Response (Target):',
            JSON.stringify(result)
          );
          return res.send(result);
        } else {
          return res.send(
            JSON.stringify(
              BaseControllerHelper.GetDefaultErrorResult(
                'Password does not meet the requirements !!! Must be longer than 8, contain 1 uppercase letter, 1 special character, and 1 number'
              )
            )
          );
        }
      } else {
        return res.send(
          JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('User not found'))
        );
      }
    } else if (LogedUser && OldPassword && NewPassword) {
      // Always use LogedUser.Id for security - users can only change their own password
      const user = await Models.Users.findOne({
        where: { Id: LogedUser.Id },
        raw: true,
      });
      if (user) {
        // Verify the old password matches
        const isPasswordMatch = await bcrypt.compare(OldPassword, user.Password);
        if (!isPasswordMatch) {
          return res.send(
            JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('The old password is wrong'))
          );
        }

        if (PasswordRegex.test(NewPassword)) {
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
            '[DoctorProfileController/ChangePassword] SUCCESS Response:',
            JSON.stringify(result)
          );
          return res.send(result);
        } else {
          return res.send(
            JSON.stringify(
              BaseControllerHelper.GetDefaultErrorResult(
                'Password does not meet the requirements !!! Must be longer than 8, contain 1 uppercase letter, 1 special character, and 1 number'
              )
            )
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

//#region Practice licence codes (tracker 13)

/*
 * WITHOUT THESE THE LICENCE FEATURE IS UNUSABLE. helper/LicenceGate.js can
 * refuse a login for a missing code, and until now nothing anywhere could
 * SET one - so enabling enforcement would have locked everybody out with no
 * way back in. That is the gap these three close.
 *
 * Legacy PascalCase envelope, because the consumer is the web admin panel, not
 * the mobile app (CLAUDE.md §5).
 *
 * Where the codes come from is still a customer question (BLOCKERS item 4): an
 * ЭМХТ registry lookup, or administrator entry. These implement administrator
 * entry and stamp LicenseSource 'admin', so a later ЭМХТ sync writes 'emkht'
 * into the same column and needs no schema change.
 */

const LICENCE_ADMIN_ROLES = ['1', '6'];

function MayAdministerLicences(LogedUser) {
  return !!LogedUser && LICENCE_ADMIN_ROLES.includes(String(LogedUser.RoleId));
}

/**
 * Record or replace a doctor's practice licence code.
 *
 * Role 1 may set anybody's. Role 6 is scoped to its own organisation - a
 * settings account at one hospital has no business licensing another's staff.
 */
async function SetLicense(req, res) {
  try {
    const LogedUser = req.LogedUser;
    if (!MayAdministerLicences(LogedUser)) {
      return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Хандах эрхгүй байна')));
    }

    const { DoctorId, LicenseCode, LicenseIssuedDate, LicenseExpireDate } = req.body;
    if (!DoctorId || !LicenseCode || !String(LicenseCode).trim()) {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Эмч болон зөвшөөрлийн кодыг заана уу'))
      );
    }

    const Code = String(LicenseCode).trim();
    if (Code.length > 50) {
      return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Код хэт урт байна')));
    }

    const Doctor = await Models.DoctorsProfile.findOne({
      where: { id_data: DoctorId },
      attributes: ['id_data', 'id', 'OrganizationId', 'lastname', 'firstname'],
      raw: true,
    });
    if (!Doctor) {
      return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Эмч олдсонгүй')));
    }

    if (String(LogedUser.RoleId) === '6') {
      const MyOrg = LogedUser.Doctor ? LogedUser.Doctor.OrganizationId : null;
      if (!MyOrg || String(Doctor.OrganizationId) !== String(MyOrg)) {
        return res.send(
          JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Өөр байгууллагын эмч байна'))
        );
      }
    }

    /*
     * Warn on a duplicate rather than refusing. Whether a practice licence is
     * unique per person is NOT confirmed - the unique index in
     * add_doctor_licence_code.sql is deliberately commented out for that
     * reason. Refusing here would encode an assumption the customer has not
     * made; recording it lets the duplicate show up in the report instead.
     */
    const Clash = await Models.DoctorsProfile.findOne({
      where: { LicenseCode: Code, id_data: { [Op.ne]: DoctorId } },
      attributes: ['id_data'],
      raw: true,
    });
    if (Clash) {
      console.error(
        '[DoctorProfile/SetLicense] duplicate licence code on doctors ' +
          DoctorId + ' and ' + Clash.id_data + ' - uniqueness is unconfirmed, allowing'
      );
    }

    await Models.DoctorsProfile.update(
      {
        LicenseCode: Code,
        LicenseIssuedDate: LicenseIssuedDate || null,
        LicenseExpireDate: LicenseExpireDate || null,
        LicenseVerifiedDate: ObjectHelper.getDateYMDHMS(),
        LicenseVerifiedUserId: LogedUser.Id,
        LicenseSource: 'admin',
      },
      { where: { id_data: DoctorId } }
    );

    await BaseControllerHelper.CreateUserActionHistory({
      LinkObjectName: 'DoctorsProfile',
      LinkObjectId: DoctorId,
      Action: 'SetLicense',
      LogedUser,
      Notes: 'Set practice licence code',
      NotesMn: 'Мэргэжлийн зөвшөөрлийн код бүртгэлээ',
    });

    return res.send(
      JSON.stringify({
        Success: true,
        Message: 'Successfully saved',
        Data: {
          DoctorId,
          LicenseCode: Code,
          LicenseVerifiedDate: ObjectHelper.getDateYMDHMS(),
          DuplicateWarning: !!Clash,
        },
      })
    );
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

/**
 * Who has a code and who does not.
 *
 * This is the operational form of the query at the bottom of
 * add_doctor_licence_code.sql, and it exists so the answer stays current: the
 * whole decision about whether enforcement is safe rests on that count, and a
 * number from a fortnight ago is not the number.
 */
async function GetLicenseStatus(req, res) {
  try {
    const LogedUser = req.LogedUser;
    if (!MayAdministerLicences(LogedUser)) {
      return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Хандах эрхгүй байна')));
    }

    const where = { rec_status: { [Op.ne]: 2 } };

    // Role 1 may look at any organisation, or all of them. Role 6 is pinned to
    // its own regardless of what it asks for.
    if (String(LogedUser.RoleId) === '6') {
      where.OrganizationId = LogedUser.Doctor ? LogedUser.Doctor.OrganizationId : -1;
    } else if (req.body.OrganizationId) {
      where.OrganizationId = req.body.OrganizationId;
    }

    const rows = await Models.DoctorsProfile.findAll({
      where,
      attributes: ['id_data', 'lastname', 'firstname', 'OrganizationId', 'LicenseCode', 'LicenseExpireDate'],
      include: [
        { model: Models.Organization, as: 'Organization', attributes: ['Id', 'Name'], required: false },
      ],
      order: [['lastname', 'ASC']],
    });

    const data = rows.map((r) => {
      const row = r.toJSON();
      const Code = row.LicenseCode ? String(row.LicenseCode).trim() : '';
      return {
        DoctorId: row.id_data,
        FullName: [row.lastname, row.firstname].filter(Boolean).join(' '),
        OrganizationName: row.Organization ? row.Organization.Name : null,
        LicenseCode: Code || null,
        LicenseExpireDate: row.LicenseExpireDate,
        HasLicense: !!Code,
      };
    });

    const WithCode = data.filter((d) => d.HasLicense).length;

    return res.send(
      JSON.stringify({
        Success: true,
        Message: '',
        Data: {
          Total: data.length,
          WithCode,
          WithoutCode: data.length - WithCode,
          Rows: data,
        },
      })
    );
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

/**
 * Remove a code - a licence withdrawn or entered in error.
 *
 * Role 1 only, and a Reason is required. Clearing a licence can stop somebody
 * working once enforcement is on, so it should be deliberate and explicable
 * afterwards.
 */
async function ClearLicense(req, res) {
  try {
    const LogedUser = req.LogedUser;
    if (!LogedUser || String(LogedUser.RoleId) !== '1') {
      return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Хандах эрхгүй байна')));
    }

    const { DoctorId, Reason } = req.body;
    if (!DoctorId || !Reason || !String(Reason).trim()) {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Эмч болон шалтгааныг заана уу'))
      );
    }

    await Models.DoctorsProfile.update(
      {
        LicenseCode: null,
        LicenseVerifiedDate: ObjectHelper.getDateYMDHMS(),
        LicenseVerifiedUserId: LogedUser.Id,
      },
      { where: { id_data: DoctorId } }
    );

    await BaseControllerHelper.CreateUserActionHistory({
      LinkObjectName: 'DoctorsProfile',
      LinkObjectId: DoctorId,
      Action: 'ClearLicense',
      LogedUser,
      Notes: 'Cleared practice licence code: ' + String(Reason).slice(0, 200),
      NotesMn: 'Мэргэжлийн зөвшөөрлийн кодыг хаслаа',
    });

    return res.send(JSON.stringify({ Success: true, Message: 'Successfully saved', Data: null }));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

//#endregion

module.exports = router;
