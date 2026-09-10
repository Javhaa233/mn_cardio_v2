const express = require('express');
const router = express.Router();

const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const PrintHelper = require('../../helper/PrintHelper');

const PacemakerThree = require('../../reports/PacemakerThree');

// routes
router.post('/CustomSave', CustomSave);
router.post('/PrintReport', PrintReport);

async function GetReportData(Id, LogedUser) {
  var Option = {
    SearchText: '',
    limit: 1,
    offset: 0,
    SearchField: [{ Field: 'Id', Value: Id, Op: 'Equals' }],
    FindType: 'AllData',
    WhereType: '',
  };

  var DetailData = await BaseControllerHelper.BaseDetailInfo({
    ObjectName: 'PacemakerTblThree',
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
      const Data = await GetReportData(Id);
      const html = PacemakerThree(Data);
      return await PrintHelper.SendPdf({
        res,
        html,
        namePrefix: 'PacemakerThree',
        downloadName: 'PacemakerThree.pdf',
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
    var PacemakerTblThreeId = null;
    //Save Echo
    if (LogedUser && PacemakerData) {
      if (PacemakerData.Id) {
        PacemakerTblThreeId = await BaseControllerHelper.BaseUpdate({
          ObjectName: 'PacemakerTblThree',
          Data: PacemakerData,
          LogedUser,
          SaveLog: true,
        });
        return res.send(JSON.stringify(result));
      } else {
        PacemakerTblThreeId = await BaseControllerHelper.BaseCreate({
          ObjectName: 'PacemakerTblThree',
          Data: PacemakerData,
          LogedUser,
          SaveLog: true,
        });

        result.Data = { DataId: PacemakerTblThreeId };
        return res.send(JSON.stringify(result));
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
