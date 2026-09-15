const express = require('express');
const router = express.Router();

const { Models, sequelize } = require('../../config/DB');

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

      /*
       * ONE journal query for the whole page, not one per row.
       *
       * This loop used to call Journal.GetRealJournalData(PatientId) per row.
       * HomeMonitoringPatients.jsx caps itself at 5 rows for exactly that
       * reason; this screen asks for 20, and ExportExcel asks for ALL of them -
       * so the export of a doctor with 300 patients issued 300 queries, each
       * with two nested includes, to build one spreadsheet.
       *
       * Journal.GetRealJournalDataForPatients already existed and had no
       * callers. The grouping below is the same shape AttachmentIntake.ListFor
       * and AdviceController.AttachFeedMedia use.
       */
      const PatientIds = [
        ...new Set(PatientMonitoringDoctors.map((r) => r.patient_id).filter(Boolean)),
      ];
      let AllJournals = await Models.Journal.GetRealJournalDataForPatients(PatientIds);
      // jr_type 5 is the ICD10 diagnosis reference; the others are not shown here.
      AllJournals = AllJournals.filter((s) => s.JournalRef && s.JournalRef.jr_type + '' === '5');

      const JournalsByPatient = new Map();
      ModHelper.GetNewObject(AllJournals).forEach((j) => {
        const list = JournalsByPatient.get(j.PatientId) || [];
        list.push(j);
        JournalsByPatient.set(j.PatientId, list);
      });

      PatientMonitoringDoctors.forEach((row) => {
        row['Journals'] = JournalsByPatient.get(row.patient_id) || [];
      });

      await AttachRosterColumns(PatientMonitoringDoctors, PatientIds);

      result.Data = PatientMonitoringDoctors;
      result.Option = Option;
    }
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}


/**
 * The three things a doctor actually scans this list for.
 *
 * The grid answered "who is on my list" and nothing about the state of the
 * relationship: a doctor could not see from it who was waiting on a reply, when
 * they last heard from someone, or whether a blood pressure had moved. The one
 * signal it did carry - vwVisitComments.CommentQty - counts EVERY comment in
 * the thread including the doctor's own, so a well-answered patient and an
 * ignored one look identical, and it is typed nvarchar so ordering puts 9 above
 * 10.
 *
 * Two queries for the whole page, not per row. This runs on the same request
 * that already batched the journals, and ExportExcel calls the same handler
 * with no row limit, so anything per-row here would reintroduce exactly the N+1
 * that was just removed.
 */
async function AttachRosterColumns(Rows, PatientIds) {
  const Blank = { LastContact: null, AwaitingReply: 0, LastReading: null };
  if (!PatientIds || PatientIds.length === 0) return;

  const Ids = PatientIds.filter((n) => Number.isInteger(n) || /^\d+$/.test(String(n)));
  if (Ids.length === 0) {
    Rows.forEach((r) => Object.assign(r, Blank));
    return;
  }
  const InList = Ids.join(',');

  let ThreadBy = new Map();
  let ReadingBy = new Map();

  try {
    /*
     * "Awaiting a reply" is the count of PATIENT messages written since the
     * doctor last answered - not the size of the thread. A patient who asked
     * three times and was answered is at 0; one who asked once and was not is
     * at 1, and that is the one to open first.
     *
     * is_doctor is an INTEGER on the model but the legacy rows carry both 1 and
     * '1', so it is compared as text. The doctor-side subquery uses a sentinel
     * date rather than being an inner join, or a patient who has never had a
     * reply - the case that matters most - would drop out entirely.
     */
    const [Thread] = await sequelize.query(
      "SELECT v.patient_id AS PatientId, MAX(v.date_creation) AS LastContact, " +
        "  SUM(CASE WHEN ISNULL(CAST(v.is_doctor AS nvarchar(5)), '0') <> '1' " +
        "            AND v.date_creation > ISNULL(d.LastDoctor, '1900-01-01') " +
        "           THEN 1 ELSE 0 END) AS AwaitingReply " +
        "FROM [VisitComments] v " +
        "LEFT JOIN (SELECT patient_id, MAX(date_creation) AS LastDoctor FROM [VisitComments] " +
        "            WHERE ISNULL(CAST(is_doctor AS nvarchar(5)), '0') = '1' " +
        "              AND ISNULL(rec_status, 0) <> 2 GROUP BY patient_id) d " +
        "       ON d.patient_id = v.patient_id " +
        "WHERE v.patient_id IN (" + InList + ") AND ISNULL(v.rec_status, 0) <> 2 " +
        "GROUP BY v.patient_id"
    );
    ThreadBy = new Map((Thread || []).map((r) => [r.PatientId, r]));
  } catch (ex) {
    console.log('[PatientMonitoring/GetList] thread columns failed:', ex.message);
  }

  try {
    // The newest self-reported reading per patient. ROW_NUMBER rather than a
    // correlated MAX so one pass over the window gives the whole row, not just
    // its date - the same shape AdviceController uses for preview comments.
    const [Reading] = await sequelize.query(
      "SELECT PatientId, blood_pressure, blood_pressure2, pulse, weight, ReadingDate FROM (" +
        "  SELECT patient_id AS PatientId, blood_pressure, blood_pressure2, pulse, weight, " +
        "         ISNULL([date], date_creation) AS ReadingDate, " +
        "         ROW_NUMBER() OVER (PARTITION BY patient_id ORDER BY id_data DESC) AS rn " +
        "    FROM [PatientMonitoring] " +
        "   WHERE patient_id IN (" + InList + ") AND ISNULL(rec_status, 0) <> 2" +
        ") x WHERE x.rn = 1"
    );
    ReadingBy = new Map((Reading || []).map((r) => [r.PatientId, r]));
  } catch (ex) {
    console.log('[PatientMonitoring/GetList] reading column failed:', ex.message);
  }

  Rows.forEach((Row) => {
    const T = ThreadBy.get(Row.patient_id);
    const R = ReadingBy.get(Row.patient_id);
    Row.LastContact = T ? T.LastContact : null;
    Row.AwaitingReply = T ? Number(T.AwaitingReply) || 0 : 0;
    Row.LastReading = R
      ? {
          BloodPressure:
            R.blood_pressure || R.blood_pressure2
              ? (R.blood_pressure || '') + '/' + (R.blood_pressure2 || '')
              : '',
          Pulse: R.pulse || '',
          Weight: R.weight || '',
          Date: R.ReadingDate || null,
        }
      : null;
  });
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
