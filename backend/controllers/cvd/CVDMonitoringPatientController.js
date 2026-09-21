const express = require('express');
// const moment = require("moment/moment");
const router = express.Router();

const { Models, sequelize } = require('../../config/DB');

var { CVDMonitoring, CVDRisk, CVDHistory, CVDBodySize, Patient } = Models;

const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const ConfigHelper = require('../../helper/ConfigHelper');
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
          "SELECT TOP 1 m.Id, m.IsActive, m.Status FROM CVDMonitoring m INNER JOIN Patient p ON m.PatRegNo=p.p_registration WHERE m.PatRegNo=:PatRegNo AND p.p_registration=:PatRegNo AND Status <> 'inactive' ORDER BY m.Id DESC",
          { replacements: { PatRegNo } }
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

    /*
     * EVERY PATH MUST ANSWER.
     *
     * The block above is guarded by `if (PatRegNo && LogedUser)`, and had no
     * else — so a request without PatRegNo fell straight through, the response
     * was never sent, and the connection was held until the client gave up.
     * Measured 2026-09-21: three of three requests with an empty body never
     * responded (client timeout 90s), while the same call carrying PatRegNo
     * answered in 121ms.
     *
     * That matters more here than it would elsewhere: /CVDMonitoringPatient is
     * in PATIENT_ALLOWED_PREFIXES, so the least-privileged role on the system
     * could hold server connections open until the pool was exhausted.
     *
     * Same class as the AtrialRhythm(New)/checkConfirm defect fixed on
     * 2026-09-10.
     */
    return res.send(
      JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Регистрийн дугаар оруулна уу'))
    );
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function CheckLastData({ LogedUser, ObjectName, PatRegNo, AppId }) {
  if (LogedUser && ObjectName && PatRegNo && AppId) {
    if (PatRegNo) {
      // Two separate injection points lived on this line, and they need
      // different fixes. PatRegNo is a VALUE, so it binds. ObjectName is a TABLE
      // NAME, which cannot be bound at all - the only safe form is an allowlist.
      //
      // ConfigHelper is that allowlist: it returns null for anything not
      // registered in ModelConfigs/mainConfig.js, so only a declared ObjectName
      // ever reaches the query, and the name that does reach it is the config's
      // own, not the caller's string.
      const ModelConfig = ConfigHelper.getModelConfig(ObjectName);
      if (!ModelConfig) return null;

      const [LastData, data] = await sequelize.query(
        'SELECT TOP 1 * FROM [' +
          ModelConfig.ObjectName +
          '] WHERE PatRegNo = :PatRegNo' +
          ' ORDER BY Id DESC',
        { replacements: { PatRegNo } }
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
