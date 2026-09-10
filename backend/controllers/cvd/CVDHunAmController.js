const express = require('express');
const router = express.Router();

const { Models } = require('../../config/DB');

const BaseControllerHelper = require('../../helper/BaseControllerHelper');

// routes
router.post('/GetData', GetData);
router.post('/CreateAndUpdate', CreateAndUpdate);

async function GetData(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully', Data: null };

    const ReqOrganizationId = req.body.OrganizationId;
    const Year = req.body.Year;
    const LogedUser = req.LogedUser;

    const UserOrganizationId =
      LogedUser.Doctor && LogedUser.Doctor.Organization ? LogedUser.Doctor.Organization.Id : null;

    if (ReqOrganizationId && UserOrganizationId && ReqOrganizationId === UserOrganizationId) {
      const whereOption = { Year, OrganizationId: UserOrganizationId };
      const ResultData = await Models.CVDHunAm.findOne({
        where: whereOption,
        raw: true,
      });

      result.Data = ResultData;
      return res.send(result);
    } else {
      return res.send(
        JSON.stringify(
          BaseControllerHelper.GetDefaultErrorResult('Байгууллагын мэдээлэл таарахгүй байна')
        )
      );
    }
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function CreateAndUpdate(req, res) {
  try {
    const result = { Success: true, Message: 'Successfully saved', Data: null };
    const LogedUser = req.LogedUser;
    const Data = JSON.parse(req.body.Data);

    const ObjectName = 'CVDHunAm';
    const Year = Data.Year ? Data.Year : null;
    const OrganizationId = Data.OrganizationId ? Data.OrganizationId : null;

    if (Year && OrganizationId) {
      let whereOption = null;
      whereOption = { Year, OrganizationId };
      // Хайлт хийх мэдээлэл олдсон эсэх
      if (whereOption) {
        const CheckData = await Models.CVDHunAm.findOne({
          where: { ...whereOption },
          attributes: ['Id'],
          raw: true,
        });
        let DataId = null;
        if (!CheckData) {
          DataId = await BaseControllerHelper.BaseCreate({
            ObjectName,
            Data,
            LogedUser,
            SaveLog: false,
          });
        } else {
          Data['Id'] = CheckData ? CheckData.Id : null;
          DataId = await BaseControllerHelper.BaseUpdate({
            ObjectName,
            Data,
            LogedUser,
            SaveLog: false,
          });
        }
        result.Data = { DataId };
        // response data
        return res.send(result);
      } else {
        return res.send(
          JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Information is missing'))
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
