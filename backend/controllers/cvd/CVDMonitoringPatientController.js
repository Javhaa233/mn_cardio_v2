const express = require('express');
// const moment = require("moment/moment");
const router = express.Router();

const { Models, sequelize } = require('../../config/DB');

var { CVDMonitoring, CVDRisk, CVDHistory, CVDBodySize, Patient } = Models;

const BaseControllerHelper = require('../../helper/BaseControllerHelper');
// const EMDServiceHelper = require("../../helper/EMDServiceHelper");
// const ObjectHelper = require("../../helper/ObjectHelper");

router.post('/CheckPatient', CheckPatient);
router.post('/GetLastData', GetLastData);
router.post('/CreateAndUpdateMonitoring', CreateAndUpdateMonitoring);

async function CheckPatient(req, res) {
  try {
    var result = { Success: true, Message: '', Data: null, Option: {} };

    let { PatRegNo } = req.body;
    const LogedUser = req.LogedUser;

    var Id = null;
    // var CVDMonitoringData = null;
    var PatientData = null;
    //
    var Organization = null;
    var ParentOrganizationId = null;
    var OrganizationId = null;
    var OrgLevel = null;
    var ProvinceCityId = null;
    var SoumDistrictId = null;
    var BagKhorooId = null;

    if (PatRegNo && LogedUser) {
      PatRegNo = PatRegNo.toUpperCase();
      Organization = LogedUser.Doctor && LogedUser.Doctor.Organization;
      // get value from Organization attributes
      ParentOrganizationId = Organization && Organization.ParentOrganizationId;
      OrganizationId = Organization && Organization.Id;
      OrgLevel = Organization && Organization.level;
      ProvinceCityId = Organization && Organization.addr_prov_city;
      SoumDistrictId = Organization && Organization.addr_soum_dist;
      BagKhorooId = Organization && Organization.addr_bag_khoroo;

      PatientData = await Patient.findOne({
        where: { p_registration: PatRegNo },
        raw: true,
      });

      // herev uilchluulegchiin burtgel baigaa bol shuud hyanaltiin idevhgui burtgel uusgene
      if (PatientData) {
        const [CVDMonitoringData, data] = await sequelize.query(
          "SELECT TOP 1 m.Id, m.IsActive, m.Status FROM CVDMonitoring m INNER JOIN Patient p ON m.PatRegNo=p.p_registration WHERE m.PatRegNo=N'" +
            PatRegNo +
            "' AND p.p_registration=N'" +
            PatRegNo +
            "' AND Status <> 'inactive' ORDER BY m.Id DESC"
        );
        if (CVDMonitoringData.length > 0) {
          Id = CVDMonitoringData[0].Id;
          if (Id) {
            // Сүүлийн хяналт идэвхитэй байгаа эсэх
            let CVDMonitoringL = await CVDMonitoring.findAllNew({
              where: { Id, PatRegNo },
            });
            CVDMonitoringL = JSON.parse(JSON.stringify(CVDMonitoringL));
            const RiskMaxId = await CVDRisk.findAll({
              where: { MonitoringId: Id },
              attributes: ['MonitoringId', [sequelize.fn('MAX', sequelize.col('Id')), 'MaxId']],
              group: ['MonitoringId'],
              raw: true,
            }).then(async (item) => {
              return item && item.length > 0 ? item[0].MaxId : null;
            });
            const HistroyMaxId = await CVDHistory.findAll({
              where: { MonitoringId: Id },
              attributes: ['MonitoringId', [sequelize.fn('MAX', sequelize.col('Id')), 'MaxId']],
              group: ['MonitoringId'],
              raw: true,
            }).then(async (item) => {
              return item && item.length > 0 ? item[0].MaxId : null;
            });
            const BodySizeMaxId = await CVDBodySize.findAll({
              where: { MonitoringId: Id },
              attributes: ['MonitoringId', [sequelize.fn('MAX', sequelize.col('Id')), 'MaxId']],
              group: ['MonitoringId'],
              raw: true,
            }).then(async (item) => {
              return item && item.length > 0 ? item[0].MaxId : null;
            });

            result.Data = CVDMonitoringL && CVDMonitoringL.length > 0 ? CVDMonitoringL[0] : null;

            if (RiskMaxId) {
              const Risk = await CVDRisk.findOne({
                where: { Id: RiskMaxId },
                raw: true,
              });
              result.Data.Risk = Risk;
            }

            if (HistroyMaxId) {
              const Risk = await CVDHistory.findOne({
                where: { Id: HistroyMaxId },
                raw: true,
              });
              result.Data.History = Risk;
            }

            if (BodySizeMaxId) {
              const Risk = await CVDBodySize.findOne({
                where: { Id: BodySizeMaxId },
                raw: true,
              });
              result.Data.BodySize = Risk;
            }
          }
        }

        return res.send(JSON.stringify(result));
      } else {
        return res.send(
          JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Иргэний мэдээлэл олдсонгүй'))
        );
      }
    }
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function CheckLastData({ LogedUser, ObjectName, PatRegNo, AppId }) {
  if (LogedUser && ObjectName && PatRegNo && AppId) {
    if (PatRegNo) {
      const [LastData, data] = await sequelize.query(
        'SELECT TOP 1 * FROM ' + ObjectName + " WHERE PatRegNo=N'" + PatRegNo + "' ORDER BY Id DESC"
      );

      if (LastData.length === 1) {
        const Id = LastData[0].Id;
        if (Id) {
          const Option = {
            SearchText: '',
            limit: 1,
            offset: 0,
            SearchField: [{ Field: 'Id', Value: Id, Op: 'Equals' }],
            FindType: 'AllData',
            WhereType: '',
          };
          const DetailData = await BaseControllerHelper.BaseDetailInfo({
            ObjectName,
            LogedUser,
            AppId,
            Option,
          });
          return DetailData.Data;
        }
      } else {
        return null;
      }
    } else {
      return null;
    }
  } else {
    return null;
  }
}

// Get  Last data
async function GetLastData(req, res) {
  try {
    var result = { Success: true, Message: '', Data: {}, Option: {} };

    const { ObjectName, PatRegNo, AppId } = req.body;
    const LogedUser = req.LogedUser;

    if (PatRegNo && LogedUser) {
      const LastData = await CheckLastData({
        LogedUser,
        ObjectName,
        PatRegNo,
        AppId,
      });
      result.Success = true;
      result.Data = LastData;
      return res.send(JSON.stringify(result));
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

async function CreateAndUpdateMonitoring(req, res) {
  try {
    var result = { Success: true, Message: '', Data: null, Option: {} };
    const Data = JSON.parse(req.body.Data);
    const LogedUser = req.LogedUser;

    if (Data && LogedUser) {
    }

    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

module.exports = router;
