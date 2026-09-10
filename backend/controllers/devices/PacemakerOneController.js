const express = require('express');
const router = express.Router();

const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const PrintHelper = require('../../helper/PrintHelper');

const PacemakerOneReport = require('../../reports/PacemakerOne');

router.post('/CustomSave', CustomSave);
router.post('/PrintReport', PrintReport);

async function GetReportData(Id, LogedUser) {
  const Option = {
    SearchText: '',
    limit: 1,
    offset: 0,
    SearchField: [{ Field: 'Id', Value: Id, Op: 'Equals' }],
    FindType: 'AllData',
    WhereType: '',
  };

  const DetailData = await BaseControllerHelper.BaseDetailInfo({
    ObjectName: 'PacemakerTblOne',
    LogedUser,
    Option,
  });

  return DetailData.Data;
}

async function PrintReport(req, res) {
  try {
    const Id = req.body.Id;
    const LogedUser = req.LogedUser;
    if (LogedUser && Id) {
      const Data = await GetReportData(Id, LogedUser);
      const html = PacemakerOneReport(Data);
      return await PrintHelper.SendPdf({
        res,
        html,
        namePrefix: 'PacemakerOne',
        downloadName: 'PacemakerOne.pdf',
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
    var result = {
      Success: true,
      Message: 'Successfully saved',
      Data: { DataId: null },
    };
    const PacemakerData = JSON.parse(req.body.Data);
    const LogedUser = req.LogedUser;

    var PacemakerTblOneId = null;
    //Save Echo
    if (LogedUser && PacemakerData) {
      if (PacemakerData.Id) {
        PacemakerTblOneId = await BaseControllerHelper.BaseUpdate({
          ObjectName: 'PacemakerTblOne',
          Data: PacemakerData,
          LogedUser,
          SaveLog: true,
        });
      } else {
        PacemakerTblOneId = await BaseControllerHelper.BaseCreate({
          ObjectName: 'PacemakerTblOne',
          Data: PacemakerData,
          LogedUser,
          SaveLog: true,
        });
      }
      result.Data = { DataId: PacemakerTblOneId };
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

module.exports = router;
