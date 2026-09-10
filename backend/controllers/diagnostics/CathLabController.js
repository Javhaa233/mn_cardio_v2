const express = require('express');
const router = express.Router();

const { Models, sequelize } = require('../../config/DB');

const BaseControllerHelper = require('../../helper/BaseControllerHelper');

// routes
router.post('/CustomSave', CustomSave);
router.post('/GetLastCathLabId', GetLastCathLabId);

async function CustomSave(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully saved', Data: [] };
    const Data = JSON.parse(req.body.Data);

    const { PatientId, PatRegNo } = req.body;
    const LogedUser = req.LogedUser;
    if (LogedUser && Data && PatientId && PatRegNo) {
      const Doctor = await Models.DoctorsProfile.findOne({
        where: { id: LogedUser.Id },
        raw: true,
      });
      if (Doctor) {
        const PCathlabId = await BaseControllerHelper.BaseCreate({
          ObjectName: 'PCathlab',
          Data: {
            ...Data.CathLabData,
            OrganizationId: Doctor.OrganizationId,
            PatientId,
            PatRegNo,
          },
          LogedUser,
          SaveLog: true,
        });

        var UniqueNames = await Models.vwCathLabUniqueName.findAll();
        var ElementTags = await Models.vwCathLabElementTags.findAll();

        for (var i = 0; i < Data.CathLabElements.length; i++) {
          var CatlabElement = Data.CathLabElements[i];
          var UniqueName = '';
          var TempUniqueName = UniqueNames.filter(
            (s) => s.label + '' === CatlabElement.UniqueName + ''
          );
          if (TempUniqueName.length === 1) {
            UniqueName = TempUniqueName[0].value;

            var NewCatlabElement = {
              comment: CatlabElement.Comment,
              tags: [],
              type: CatlabElement.Type,
              unique_name: UniqueName,
              PCathlabId: PCathlabId,
            };
            for (var l = 0; l < CatlabElement.Tags.length; l++) {
              var Tag = CatlabElement.Tags[l];
              var TempTag = ElementTags.filter((s) => s.label + '' === Tag);
              if (TempTag.length === 1) {
                NewCatlabElement.tags.push(TempTag[0].value);
              }
            }

            await BaseControllerHelper.BaseCreate({
              ObjectName: 'CathlabElement',
              Data: NewCatlabElement,
              LogedUser,
              SaveLog: true,
            });
          }
        }
      }

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

async function GetLastCathLabId(req, res) {
  try {
    var result = { Success: true, Message: '', Data: null, Option: {} };
    const { PatientId, PatRegNo } = req.body;
    const LogedUser = req.LogedUser;
    if (LogedUser && PatientId && PatRegNo) {
      const [LastCathlabId, data] = await sequelize.query(
        'SELECT TOP 1 id_data FROM PCathlab WHERE PatientId=' +
          PatientId +
          " AND PatRegNo=N'" +
          PatRegNo +
          "' ORDER BY id_data DESC"
      );
      if (LastCathlabId.length === 1) {
        result.Data = { DataId: LastCathlabId[0].id_data };
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
