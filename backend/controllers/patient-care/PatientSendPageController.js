const express = require('express');
const router = express.Router();

const { Models } = require('../../config/DB');

const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const ObjectHelper = require('../../helper/ObjectHelper');

// routes
router.post('/GetCustomFormData', GetCustomFormData);
router.post('/CustomSave', CustomSave);

async function CustomSave(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully saved', Data: {} };
    const ObjectName = req.body.ObjectName;
    const Data = JSON.parse(req.body.Data);
    const LogedUser = req.LogedUser;
    const Doctor = LogedUser.Doctor;
    if (!Doctor) {
      return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Эмчийн мэдээлэл олдсонгүй')));
    }

    const FromOrganization = await Models.Organization.findOne({
      where: { Id: Data.FromOrganization },
      attributes: ['Id', 'Name'],
      raw: true,
    });

    const ToOrganization = await Models.Organization.findOne({
      where: { Id: Data.ToOrganization },
      attributes: ['Id', 'Name'],
      raw: true,
    });

    if (ObjectName && Data && LogedUser && Data.PatientId) {
      const NewId = await BaseControllerHelper.BaseCreate({
        ObjectName,
        Data: {
          ...Data,
          FromOrganizationId: Data.FromOrganization,
          ToOrganizationId: Data.ToOrganization,
          DoctorId: Doctor.id_data,
          main_diagnosis: Data.ICD10,
        },
        LogedUser,
        SaveLog: true,
      });
      if (NewId) {
        await BaseControllerHelper.BaseCreate({
          ObjectName: 'PatientHistory',
          Data: {
            PatientId: Data.PatientId,
            UserId: LogedUser.Id,
            DoctorId: Doctor.id_data,
            Notes:
              '"' +
              (FromOrganization ? FromOrganization.Name : null) +
              '"-с "' +
              (ToOrganization ? ToOrganization.Name : null) +
              '"-т шилжүүллээ ',
            LinkObjectName: ObjectName,
            LinkObjectId: NewId,
            LogDate: ObjectHelper.getDateYMDHMS(),
          },
          LogedUser,
        });
      }

      result.Data = { DataId: NewId };
      return res.send(JSON.stringify(result));
    } else {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Information is missing'))
      );
    }
  } catch (ex) {
    console.error(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function GetCustomFormData(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [], Option: {} };
    const PatientId = req.body.PatientId;

    const ConfigData = await BaseControllerHelper.GetConfigData('PatientSendPage');

    let Journals = await Models.Journal.GetRealJournalData(PatientId);
    Journals = Journals.filter((s) => s.JournalRef.jr_type + '' === '5');
    var JournalRefs = [];
    for (let i = 0; i < Journals.length; i++) {
      JournalRefs.push(Journals[i].JournalRef);
    }
    var CustomFields = [
      {
        Name: 'ICD10',
        Label: 'Transfered diagnosis',
        Type: 'SingleSelect',
        Config: { IdField: 'id_data', TextField: 'jr_label' },
        Data: JournalRefs,
      },
      {
        Name: 'FromOrganization',
        Label: 'From',
        Type: 'GridLookUpSingleLoad',
        Config: {
          ObjectName: 'Organization',
          IdField: 'Id',
          TextField: 'Name',
          MinTextLength: 0,
          SearchType: 'AllData',
          Fields: [
            { Name: 'Id', Label: 'Id' },
            { Name: 'Name', Label: 'Name' },
          ],
        },
        DataFilter: [{ Field: 'level', Value: ['1', '2'], Op: 'In' }],
      },
      {
        Name: 'ToOrganization',
        Label: 'To',
        Type: 'GridLookUpSingleLoad',
        Config: {
          ObjectName: 'Organization',
          IdField: 'Id',
          TextField: 'Name',
          MinTextLength: 0,
          SearchType: 'AllData',
          Fields: [
            { Name: 'Id', Label: 'Id' },
            { Name: 'Name', Label: 'Name' },
          ],
        },
        DataFilter: [{ Field: 'level', Value: ['2', '3'], Op: 'In' }],
      },
    ];

    var Data = ConfigData.Fields;
    Data.push(CustomFields);

    result.Data = { Fields: Data };
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

module.exports = router;
