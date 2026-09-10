const express = require('express');
const router = express.Router();

const { Models } = require('../../config/DB');

const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const ModelHelper = require('../../helper/ModelHelper');
const ObjectHelper = require('../../helper/ObjectHelper');

// routes
router.post('/SavePatient', SavePatient);
router.post('/RemovePatient', RemovePatient);
router.post('/CheckPatientMonitoring', CheckPatientMonitoring);
router.post('/GetList', GetList);
router.post('/getPressureChartData', getPressureChartData);

async function GetList(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [], Option: {} };
    const ObjectName = req.body.ObjectName;
    const LogedUser = req.LogedUser;
    var ModHelper = new ModelHelper(Models.PatientMonitoringDoctor);

    if (ObjectName && LogedUser) {
      var Option = BaseControllerHelper.GetCrudRequestData(req);
      var { Data, Option } = await BaseControllerHelper.BaseGetList({
        ObjectName,
        LogedUser,
        Option,
      });
      var PatientMonitoringDoctors = ModHelper.GetNewObject(Data);
      for (var i = 0; i < PatientMonitoringDoctors.length; i++) {
        var patientMonitoringDoctor = PatientMonitoringDoctors[i];
        var PatientId = patientMonitoringDoctor.patient_id;
        var Journals = await Models.Journal.GetRealJournalData(PatientId);
        Journals = Journals.filter((s) => s.JournalRef && s.JournalRef.jr_type + '' === '5');
        patientMonitoringDoctor['Journals'] = ModHelper.GetNewObject(Journals);
      }

      result.Data = PatientMonitoringDoctors;
      result.Option = Option;

      // Log the returned rows count to console
      console.log(`[PatientMonitoring/GetList] Returned ${result.Data.length} rows`);
    }
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function CheckPatientMonitoring(req, res) {
  try {
    var result = { Message: '', Success: true, Data: false };
    const { PatientId, DoctorId } = req.body;
    const CheckData = await Models.PatientMonitoringDoctor.count({
      where: {
        patient_id: PatientId,
        '$DoctorProfile.id_data$': DoctorId,
        is_active: '1',
      },
      include: [
        {
          model: Models.DoctorsProfile,
          as: 'DoctorProfile',
          attributes: ['id_data', 'id', 'lastname', 'firstname'],
        },
      ],
    }).then((count) => {
      return count > 0 ? false : true;
    });

    result.Data = { Check: CheckData };
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function SavePatient(req, res) {
  try {
    var result = {
      Message: 'Successfully saved',
      Success: true,
      Data: { LogId: null },
    };
    const LogedUser = req.LogedUser;
    const { PatientId, UserId, DoctorId } = req.body;
    var Id = null;
    if (PatientId && UserId && DoctorId) {
      const OldMonitoring = await Models.PatientMonitoringDoctor.findAll({
        where: { patient_id: PatientId, user_id: UserId },
      });
      if (OldMonitoring.length > 0) {
        var Monitoring = OldMonitoring[0];
        Id = Monitoring.id_data;
        await Models.PatientMonitoringDoctor.update(
          { is_active: '1' },
          { where: { id_data: Monitoring.id_data } }
        );
      } else {
        const NewId = await BaseControllerHelper.BaseCreate({
          ObjectName: 'PatientMonitoringDoctor',
          Data: { patient_id: PatientId, user_id: UserId, is_active: '1' },
          LogedUser,
        });
        Id = NewId;
      }
      //create log
      const LogId = await BaseControllerHelper.BaseCreate({
        ObjectName: 'PatientMonitoringDoctorHistory',
        Data: {
          PatientId,
          UserId: UserId,
          DoctorId: DoctorId,
          IsStart: '1',
          Date: ObjectHelper.getDateYMDHMS(),
        },
        LogedUser,
      });

      await BaseControllerHelper.BaseCreate({
        ObjectName: 'PatientHistory',
        Data: {
          PatientId,
          UserId: UserId,
          DoctorId: DoctorId,
          Notes: 'Хувийн хяналтанд авлаа',
          LinkObjectName: 'PatientMonitoringDoctor',
          LinkObjectId: Id,
          LogDate: ObjectHelper.getDateYMDHMS(),
        },
        LogedUser,
      });

      result.Data = { LogId };
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

async function RemovePatient(req, res) {
  try {
    var result = { Message: '', Success: true, Data: [] };
    const LogedUser = req.LogedUser;
    const { PatientId, UserId, DoctorId } = req.body;
    var Id = null;
    if (PatientId && UserId && DoctorId) {
      const OldMonitoring = await Models.PatientMonitoringDoctor.findAll({
        where: { patient_id: PatientId, user_id: UserId },
      });

      if (OldMonitoring.length > 0) {
        const Monitoring = OldMonitoring[0];
        Id = Monitoring.id_data;
        await Models.PatientMonitoringDoctor.update(
          { is_active: '0' },
          { where: { id_data: Monitoring.id_data } }
        );
      }
      //create log
      const LogId = await BaseControllerHelper.BaseCreate({
        ObjectName: 'PatientMonitoringDoctorHistory',
        Data: {
          PatientId,
          UserId: UserId,
          DoctorId: DoctorId,
          IsStart: '0',
          Date: ObjectHelper.getDateYMDHMS(),
        },
        LogedUser,
      });

      await BaseControllerHelper.BaseCreate({
        ObjectName: 'PatientHistory',
        Data: {
          PatientId,
          UserId: UserId,
          DoctorId: DoctorId,
          Notes: 'Хувийн хяналтнаас гаргалаа',
          LinkObjectName: 'PatientMonitoringDoctor',
          LinkObjectId: Id,
          LogDate: ObjectHelper.getDateYMDHMS(),
        },
        LogedUser,
      });

      result.Message = 'Successfully';
      result.Data = { LogId };
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

async function getPressureChartData(req, res) {
  const result = {
    Message: '',
    Success: true,
    Data: { labels: [], datasets: [] },
  };
  try {
    const { patientId, patRegNo } = req.body;

    const Monitorings = await Models.PatientMonitoring.findAll({
      where: { patient_id: patientId, patient_registration: patRegNo },
      raw: true,
    });

    // chart data
    const chartData = { labels: [], datasets: [] };

    if (Monitorings && Monitorings.length > 0) {
      const dates = [];
      const pressureData = [];
      const pressure2Data = [];
      await Monitorings.map(async (e) => {
        dates.push(e.date_creation);
        pressureData.push(e.blood_pressure);
        pressure2Data.push(e.blood_pressure2);
      });

      chartData.labels = dates;
      chartData.datasets = [
        {
          label: 'Систол даралт',
          data: pressureData,
          fill: false,
          borderColor: 'rgba(75,192,192,1)',
        },
        {
          label: 'Дистол даралт',
          data: pressure2Data,
          fill: false,
          borderColor: '#742774',
        },
      ];
    }

    result.Data = chartData;
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    result.Message = 'An error occurred';
    return res.send(JSON.stringify(result));
  }
}

module.exports = router;
