const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const { Models } = require('../../config/DB');

const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const ModelHelper = require('../../helper/ModelHelper');
const { PasswordRegex } = require('../../helper/PasswordPolicy');

// routes
router.post('/GetByUserId', GetByUserId);
router.post('/GetCustomFormData', GetCustomFormData);
router.post('/GetDoctorsProfileInfo', GetDoctorsProfileInfo);
router.post('/CustomCreate', CustomCreate);
router.post('/CustomUpdate', CustomUpdate);
router.post('/ChangePassword', ChangePassword);

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

module.exports = router;
