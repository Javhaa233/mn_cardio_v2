const express = require('express');
const router = express.Router();

const { Models } = require('../../config/DB');

const BaseControllerHelper = require('../../helper/BaseControllerHelper');

// routes
router.post('/SearchPatient', SearchPatient);
router.post('/CheckPatient', CheckPatient);
router.post('/FindPatient', FindPatient);

async function SearchPatient(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [], Option: {} };

    const LogedUser = req.LogedUser;
    const ObjectName = req.body.ObjectName;

    if (ObjectName === 'Patient' && LogedUser) {
      const Option = BaseControllerHelper.GetCrudRequestData(req);

      await BaseControllerHelper.AddOrgFilter({ ObjectName, LogedUser, Option });

      const DetailData = await BaseControllerHelper.BaseDetailInfo({
        ObjectName,
        LogedUser,
        Option,
      });

      if (DetailData.Data && DetailData.Data.id_data) {
        await BaseControllerHelper.CreateUserActionHistory({
          LinkObjectName: 'Patient',
          LinkObjectId: DetailData.Data.id_data,
          NotesMn: 'Мэдээлэл хайлаа',
          Notes: 'Search info',
          Action: 'Search',
          LogedUser,
        });
      } else {
        BaseControllerHelper.LogNoDataReturned({
          ObjectName,
          endpoint: 'SearchPatient',
          filePath: __filename,
        });
      }

      result.Data = DetailData.Data;
    }

    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function CheckPatient(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [], Option: {} };
    const ObjectName = req.body.ObjectName;
    const LogedUser = req.LogedUser;
    if (ObjectName === 'Patient' && LogedUser) {
      const Option = BaseControllerHelper.GetCrudRequestData(req);
      const DetailData = await BaseControllerHelper.BaseDetailInfo({
        ObjectName,
        LogedUser,
        Option,
      });

      if (!DetailData.Data || Object.keys(DetailData.Data).length === 0) {
        BaseControllerHelper.LogNoDataReturned({
          ObjectName,
          endpoint: 'CheckPatient',
          filePath: __filename,
        });
      }

      result.Data = DetailData.Data;
    }

    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function FindPatient(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [], Option: {} };
    const PatientId = req.body.PatientId;
    const LogedUser = req.LogedUser;

    if (PatientId && LogedUser) {
      const PatientData = await Models.Patient.findOne({
        where: { id_data: PatientId },
        attributes: ['id_data', 'p_registration'],
        raw: true,
      });

      if (!PatientData) {
        BaseControllerHelper.LogNoDataReturned({
          ObjectName: 'Patient',
          endpoint: 'FindPatient',
          filePath: __filename,
        });
      }

      result.Data = PatientData;
    }

    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

module.exports = router;
