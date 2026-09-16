const express = require('express');
const router = express.Router();

const { Models, sequelize } = require('../../config/DB');

const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const PrintHelper = require('../../helper/PrintHelper');

const ExaminationEcho = require('../../reports/ExaminationEcho');

// routes
router.post('/CustomSave', CustomSave);
router.post('/GetLastEchoId', GetLastEchoId);
router.post('/PrintReport', PrintReport);

async function GetReportData(Id, LogedUser) {
  var Option = {
    SearchText: '',
    limit: 1,
    offset: 0,
    SearchField: [{ Field: 'id_data', Value: Id, Op: 'Equals' }],
    FindType: 'AllData',
    WhereType: '',
  };

  var DetailData = await BaseControllerHelper.BaseDetailInfo({
    ObjectName: 'ExaminationEcho',
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
      const html = ExaminationEcho(Data);
      return await PrintHelper.SendPdf({
        res,
        html,
        namePrefix: 'Echo',
        downloadName: 'Echo.pdf',
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
    var result = { Success: true, Message: 'Successfully saved', Data: [] };
    const Data = JSON.parse(req.body.Data);

    const PatientId = req.body.PatientId;
    const LogedUser = req.LogedUser;
    if (LogedUser && Data && PatientId) {
      const Doctor = await Models.DoctorsProfile.findOne({
        where: { id: LogedUser.Id },
        raw: true,
      });
      if (Doctor) {
        const EchoId = await BaseControllerHelper.BaseCreate({
          ObjectName: 'ExaminationEcho',
          Data: {
            ...Data.EchoData,
            OrganizationId: Doctor.OrganizationId,
            PatientId,
          },
          LogedUser,
          SaveLog: true,
        });

        const SectionNames = await Models.vwEchoSectionName.findAll();
        const ElementTags = await Models.vwEchoElementTag.findAll();

        if (Data.ExaminationEchoNotations && Data.ExaminationEchoNotations.length > 0) {
          for (var i = 0; i < Data.ExaminationEchoNotations.length; i++) {
            var ExaminationEchoNotation = Data.ExaminationEchoNotations[i];
            var SectionName = '';
            var TempSectionName = SectionNames.filter(
              (s) => s.label + '' === ExaminationEchoNotation.SectionName + ''
            );
            if (TempSectionName.length === 1) {
              SectionName = TempSectionName[0].value;

              var NewExaminationEchoNotation = {
                comment: ExaminationEchoNotation.Comment,
                tags: [],
                section_name: SectionName,
                EchoId,
              };
              for (var l = 0; l < ExaminationEchoNotation.Tags.length; l++) {
                var Tag = ExaminationEchoNotation.Tags[l];
                var TempTag = ElementTags.filter((s) => s.label + '' === Tag);
                if (TempTag.length === 1) {
                  NewExaminationEchoNotation.tags.push(TempTag[0].value);
                }
              }

              await BaseControllerHelper.BaseCreate({
                ObjectName: 'ExaminationEchoNotation',
                Data: NewExaminationEchoNotation,
                LogedUser,
                SaveLog: true,
              });
            }
          }
        }

        result.Data = { DataId: EchoId };
        return res.send(JSON.stringify(result));
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

async function GetLastEchoId(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [], Option: {} };
    const PatientId = req.body.PatientId;
    const LogedUser = req.LogedUser;
    if (LogedUser) {
      var [LastEchoId, data] = await sequelize.query(
        'SELECT TOP 1 id_data FROM ExaminationEcho WHERE PatientId = :PatientId' +
          ' ORDER BY id_data DESC',
        // Bound as NULL rather than the string "undefined" when the caller omits
        // PatientId - this route only guards on LogedUser. NULL matches no row,
        // which the `length === 1` check below already handles.
        { replacements: { PatientId: PatientId === undefined ? null : PatientId } }
      );
      if (LastEchoId.length === 1) {
        result.Data = { DataId: LastEchoId[0].id_data };
      } else {
        result.Data = { DataId: null };
      }
    }

    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

module.exports = router;
