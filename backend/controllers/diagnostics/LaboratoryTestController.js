const express = require('express');
const router = express.Router();

const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const PrintHelper = require('../../helper/PrintHelper');

const { Models, sequelize } = require('../../config/DB');

const LaboratoryTest = require('../../reports/LaboratoryTest');

// routes
router.post('/PrintReport', PrintReport);

async function GetReportData(Id, LogedUser) {
  var DetailData = { Data: null };
  const Option = {
    SearchText: '',
    limit: 1,
    offset: 0,
    SearchField: [{ Field: 'Id', Value: Id, Op: 'Equals' }],
    FindType: 'AllData',
    WhereType: '',
  };

  const Data = await BaseControllerHelper.BaseDetailInfo({
    ObjectName: 'LaboratoryTest',
    LogedUser,
    Option,
  });

  DetailData.Data = Data.Data;

  return DetailData;
}

async function PrintReport(req, res) {
  try {
    const Id = req.body.Id;
    const LogedUser = req.LogedUser;
    if (LogedUser && Id) {
      const Data = await GetReportData(Id, LogedUser);
      const html = LaboratoryTest(Data);
      return await PrintHelper.SendPdf({
        res,
        html,
        namePrefix: 'LaboratoryTest',
        downloadName: 'LaboratoryTest.pdf',
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

module.exports = router;
