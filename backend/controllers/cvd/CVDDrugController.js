const express = require('express');
const router = express.Router();

const { Models } = require('../../config/DB');

const BaseControllerHelper = require('../../helper/BaseControllerHelper');

// routes
router.post('/GetDrugData', GetDrugData);
router.post('/CreateAndUpdate', CreateAndUpdate);

async function GetDrugData(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully', Data: null };

    const { OrganizationId, Year, Month } = req.body;
    const whereOption = { Year, Month, OrganizationId };
    // Хайлт хийх мэдээлэл олдсон эсэх
    const CVDDrugBalanceData = await Models.CVDDrugBalance.findOne({
      where: { ...whereOption },
    });

    result.Data = CVDDrugBalanceData;
    return res.send(result);
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function CreateAndUpdate(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully saved', Data: null };
    const LogedUser = req.LogedUser;

    var Data = req.body.Data;
    Data = JSON.parse(Data);
    const ObjectName = 'CVDDrugBalance';

    const Year = Data.Year ? Data.Year : null;
    const Month = Data.Month ? Data.Month : null;

    var CreatedId = null;

    if (Year && Month && LogedUser) {
      const Organization = LogedUser.Doctor ? LogedUser.Doctor.Organization : null;
      var OrganizationId = Organization ? Organization.Id : null;
      var ProvinceCityId = Organization ? Organization.addr_prov_city : null;
      var SoumDistrictId = Organization ? Organization.addr_soum_dist : null;
      var BagKhorooId = Organization ? Organization.addr_bag_khoroo : null;

      var whereOption = { Year, Month, OrganizationId };

      // Check if record already exists
      const ExistingRecord = await Models.CVDDrugBalance.findOne({
        where: { ...whereOption },
      });

      Data['OrganizationId'] = OrganizationId;
      Data['ProvinceCityId'] = ProvinceCityId;
      Data['SoumDistrictId'] = SoumDistrictId;
      Data['BagKhorooId'] = BagKhorooId;

      if (ExistingRecord) {
        // Update existing record
        CreatedId = await BaseControllerHelper.BaseUpdate({
          ObjectName,
          Data: { ...Data, Id: ExistingRecord.Id },
          LogedUser,
          SaveLog: false,
        });
        result.Success = true;
        result.Message = 'Successfully updated';
        result.Data = { UpdatedId: CreatedId };
      } else {
        // Create new record
        CreatedId = await BaseControllerHelper.BaseCreate({
          ObjectName,
          Data,
          LogedUser,
          SaveLog: false,
        });
        result.Success = true;
        result.Message = 'Successfully saved';
        result.Data = { CreatedId };
      }
    } else {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Information is missing'))
      );
    }

    // response data
    return res.send(result);
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

module.exports = router;
