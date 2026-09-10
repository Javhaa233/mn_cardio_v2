const express = require('express');
const router = express.Router();

const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const PrintHelper = require('../../helper/PrintHelper');

const HfStay = require('../../reports/HfStay');

// routes
router.post('/GetCustomFormData', GetCustomFormData);
router.post('/CustomSave', CustomSave);
router.post('/PrintReport', PrintReport);

async function GetReportData(Id, LogedUser) {
  var DetailData = {
    HfStayData: null,
    HfLifeStoryData: null,
    HfLabTreatmentData: null,
    HfTreatmentDischargeData: null,
  };
  const Option = {
    SearchText: '',
    limit: 1,
    offset: 0,
    SearchField: [{ Field: 'Id', Value: Id, Op: 'Equals' }],
    FindType: 'AllData',
    WhereType: '',
  };

  const SubOption = {
    SearchText: '',
    limit: 1,
    offset: 0,
    SearchField: [{ Field: 'HfStayId', Value: Id, Op: 'Equals' }],
    FindType: 'AllData',
    WhereType: '',
  };

  const HfStayData = await BaseControllerHelper.BaseDetailInfo({
    ObjectName: 'HfStay',
    LogedUser,
    Option,
  });

  const HfLifeStoryData = await BaseControllerHelper.BaseDetailInfo({
    ObjectName: 'HfLifeStory',
    LogedUser,
    Option: SubOption,
  });

  const HfLabTreatmentData = await BaseControllerHelper.BaseDetailInfo({
    ObjectName: 'HfLabTreatment',
    LogedUser,
    Option: SubOption,
  });

  const HfTreatmentDischargeData = await BaseControllerHelper.BaseDetailInfo({
    ObjectName: 'HfTreatmentDischarge',
    LogedUser,
    Option: SubOption,
  });

  DetailData.HfStayData = HfStayData.Data;
  DetailData.HfLifeStoryData = HfLifeStoryData.Data;
  DetailData.HfLabTreatmentData = HfLabTreatmentData.Data;
  DetailData.HfTreatmentDischargeData = HfTreatmentDischargeData.Data;

  return DetailData;
}

async function PrintReport(req, res) {
  try {
    const Id = req.body.Id;
    const LogedUser = req.LogedUser;
    if (LogedUser && Id) {
      const Data = await GetReportData(Id, LogedUser);

      const html = HfStay(Data);
      return await PrintHelper.SendPdf({
        res,
        html,
        namePrefix: 'HeartFailure',
        downloadName: 'HeartFailure.pdf',
        footer: await PrintHelper.FooterFor(LogedUser),
      });
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

async function CustomSave(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully saved', Data: {} };
    const PatientId = req.body.PatientId;
    const LogedUser = req.LogedUser;
    const Data = JSON.parse(req.body.Data);

    if (PatientId && LogedUser && Data) {
      //create hfstay
      const HfStayId = await BaseControllerHelper.BaseCreate({
        ObjectName: 'HfStay',
        Data: { ...Data, PatientId },
        LogedUser,
        SaveLog: true,
      });
      if (HfStayId) {
        await BaseControllerHelper.BaseCreate({
          ObjectName: 'HfLifeStory',
          Data: { ...Data, HfStayId },
          LogedUser,
          SaveLog: false,
        });
        await BaseControllerHelper.BaseCreate({
          ObjectName: 'HfLabTreatment',
          Data: { ...Data, HfStayId },
          LogedUser,
          SaveLog: false,
        });
        await BaseControllerHelper.BaseCreate({
          ObjectName: 'HfTreatmentDischarge',
          Data: { ...Data, HfStayId },
          LogedUser,
          SaveLog: false,
        });
      }

      result.Data = { DataId: HfStayId };
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

async function GetCustomFormData(req, res) {
  try {
    var result = { Success: true, Message: '', Data: {}, Option: {} };
    var HfStayConfigData = await BaseControllerHelper.GetConfigData('HfStay');
    var HfLifeStoryConfigData = await BaseControllerHelper.GetConfigData('HfLifeStory');
    var HfLabTreatmentConfigData = await BaseControllerHelper.GetConfigData('HfLabTreatment');
    var HfTreatmentDischargeConfigData =
      await BaseControllerHelper.GetConfigData('HfTreatmentDischarge');
    var CustomFields = [
      ...HfStayConfigData.Fields,
      ...HfLifeStoryConfigData.Fields,
      ...HfLabTreatmentConfigData.Fields,
      ...HfTreatmentDischargeConfigData.Fields,
    ];

    result.Option = { Total: 1, FooterData: [] };
    result.Data = { Fields: CustomFields };
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

module.exports = router;
