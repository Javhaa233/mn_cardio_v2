const express = require('express');
const { format, addYears } = require('date-fns');
const router = express.Router();

const { Models, sequelize } = require('../../config/DB');

var { CVDMonitoring, CVDRisk, CVDBodySize, CVDControlAndTransition, Organization, Patient } =
  Models;

const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const EMDServiceHelper = require('../../helper/EMDServiceHelper');
const ObjectHelper = require('../../helper/ObjectHelper');

// Helper function to extract BirthDate and Age from PatRegNo or p_birthday
function getBirthDateAndAge(p_birthday, PatRegNo) {
  var BirthDate = null;
  var Age = null;

  // First try to get from p_birthday
  if (p_birthday) {
    try {
      const birthDateObj = new Date(p_birthday);
      if (!isNaN(birthDateObj.getTime())) {
        BirthDate = format(birthDateObj, 'yyyy-MM-dd');
        var today = new Date();
        Age = today.getFullYear() - birthDateObj.getFullYear();
        var m = today.getMonth() - birthDateObj.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
          Age--;
        }
        Age = Age.toString();
        return { BirthDate, Age };
      }
    } catch (e) {
      // Invalid p_birthday, try PatRegNo
    }
  }

  // If p_birthday not available, try to parse from PatRegNo
  // PatRegNo structure: LLYYMMDDNN (LL=letters, YYMMDD=birthdate, NN=numbers)
  // If born in 2000+, MM is +20 (e.g., 21=January 2000s, 32=December 2000s)
  if (PatRegNo && typeof PatRegNo === 'string') {
    // Validate PatRegNo format: should be 2 letters + 8 digits or similar valid format
    const regNoUpper = PatRegNo.toUpperCase().trim();

    // Check if starts with exactly 2 Cyrillic or Latin letters
    const letterMatch = regNoUpper.match(/^[A-ZА-ЯӨҮЁ]{2}/);
    if (!letterMatch) {
      return { BirthDate: null, Age: null };
    }

    // Extract the date part (positions 2-7, which is YYMMDD)
    const datePart = regNoUpper.substring(2, 8);

    // Check if datePart is 6 digits
    if (!/^\d{6}$/.test(datePart)) {
      return { BirthDate: null, Age: null };
    }

    const yy = parseInt(datePart.substring(0, 2), 10);
    const mm = parseInt(datePart.substring(2, 4), 10);
    const dd = parseInt(datePart.substring(4, 6), 10);

    // Determine century and actual month
    var year, month;
    if (mm >= 21 && mm <= 32) {
      // Born in 2000s
      year = 2000 + yy;
      month = mm - 20;
    } else if (mm >= 1 && mm <= 12) {
      // Born in 1900s
      year = 1900 + yy;
      month = mm;
    } else {
      // Invalid month
      return { BirthDate: null, Age: null };
    }

    // Validate day
    if (dd < 1 || dd > 31) {
      return { BirthDate: null, Age: null };
    }

    // Create date and validate
    try {
      const birthDateObj = new Date(year, month - 1, dd);
      // Check if date is valid (e.g., not Feb 30)
      if (
        birthDateObj.getFullYear() !== year ||
        birthDateObj.getMonth() !== month - 1 ||
        birthDateObj.getDate() !== dd
      ) {
        return { BirthDate: null, Age: null };
      }

      // Check if date is not in the future
      var today = new Date();
      if (birthDateObj > today) {
        return { BirthDate: null, Age: null };
      }

      BirthDate = format(birthDateObj, 'yyyy-MM-dd');
      Age = today.getFullYear() - birthDateObj.getFullYear();
      var m = today.getMonth() - birthDateObj.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
        Age--;
      }
      Age = Age.toString();
    } catch (e) {
      return { BirthDate: null, Age: null };
    }
  }

  return { BirthDate, Age };
}

// routes
router.post('/CheckPatient', CheckPatient);
router.post('/CreateMonitoring', CreateMonitoring);
router.post('/GetLastHistoryData', GetLastHistoryData);
router.post('/GetLastBodySizeData', GetLastBodySizeData);
router.post('/GetLastManagementData', GetLastManagementData);
router.post('/GetLastDiagnosisData', GetLastDiagnosisData);

router.post('/GetLastRiskData', GetLastRiskData);
router.post('/CreateHistory', CreateHistory);
router.post('/CreateControlAndTransition', CreateControlAndTransition);
router.post('/GetAnalyzeData', GetAnalyzeData);
router.post('/CreateSentPrescription', CreateSentPrescription);
router.post('/CreateManagement', CreateManagement);
router.post('/CreateDiagnosis', CreateDiagnosis);

router.post('/CreatePatient', CreatePatient);
router.post('/UpdatePatient', UpdatePatient);
router.post('/GetPatientInfo', GetPatientInfo);
router.post('/GetList', GetList);
router.post('/FindPatientDataForUpdate', FindPatientDataForUpdate);

// take control
router.post('/TakeControl', TakeControl);
// router.post("/GetBodySizeData", GetBodySizeData);

// Create Monitoring
async function CreateMonitoring(req, res) {
  try {
    var result = { Success: false, Message: 'Successfully saved', Data: {} };

    let { PatRegNo } = req.body;
    const LogedUser = req.LogedUser;
    //
    var ServicePatientData = null;
    var Organization = null;
    var ParentOrganizationId = null;
    var OrganizationId = null;
    // var OrgLevel = null;
    var ProvinceCityId = null;
    var SoumDistrictId = null;
    var BagKhorooId = null;

    if (PatRegNo && LogedUser) {
      PatRegNo = PatRegNo.toUpperCase();
      // ServicePatientData = await EMDServiceHelper.getPatient(PatRegNo);

      Organization = LogedUser.Doctor && LogedUser.Doctor.Organization;
      // get value from Organization attributes
      ParentOrganizationId = Organization && Organization.ParentOrganizationId;
      OrganizationId = Organization && Organization.Id;
      // OrgLevel = Organization && Organization.level;
      ProvinceCityId = Organization && Organization.addr_prov_city;
      SoumDistrictId = Organization && Organization.addr_soum_dist;
      BagKhorooId = Organization && Organization.addr_bag_khoroo;

      // Get Patient data from local database
      const PatientData = await Patient.findOne({
        where: { p_registration: PatRegNo },
        raw: true,
      });

      // Calculate BirthDate and Age from Patient data or PatRegNo
      const { BirthDate, Age } = getBirthDateAndAge(
        PatientData ? PatientData.p_birthday : null,
        PatRegNo
      );

      //create cvd monitoring
      // if (OrgLevel === "1" && OrgLevel !== "2" && OrgLevel !== "3") {
      if (
        ServicePatientData &&
        ServicePatientData.regNo &&
        ServicePatientData.respMsgCode === '200'
      ) {
        var PatientId = null;

        const PatientDataFromService = await Patient.findOne({
          where: { p_registration: ServicePatientData.regNo },
          raw: true,
        });

        if (PatientDataFromService === null) {
          PatientId = await BaseControllerHelper.BaseCreate({
            ObjectName: 'Patient',
            Data: {
              p_registration: ServicePatientData.regNo,
              p_firstname: ServicePatientData.firstName,
              p_lastname: ServicePatientData.lastName,
            },
            LogedUser,
            SaveLog: false,
          });
        }

        const Id = await BaseControllerHelper.BaseCreate({
          ObjectName: 'CVDMonitoring',
          Data: {
            IsActive: '1',
            PatRegNo: ServicePatientData.regNo,
            BirthDate,
            Age,
            Status: 'inactive',
            ParentOrganizationId,
            OrganizationId,
            ProvinceCityId,
            SoumDistrictId,
            BagKhorooId,
          },
          LogedUser,
          SaveLog: false,
        });

        result.Success = false;
        result.Data = { Id, PatientId };
        return res.send(JSON.stringify(result));
      } else {
        return res.send(
          JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Patient data not downloaded'))
        );
      }
      // } else {
      //   res.send(
      //     JSON.stringify(
      //       BaseControllerHelper.GetDefaultErrorResult(
      //         "Хяналт үүсгэх боломжтой байгууллагын эмч биш байна"
      //       )
      //     )
      //   );
      // }
    } else {
      return res.send(JSON.stringify(result));
    }
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// CreateHistory
async function CreateHistory(req, res) {
  var result = { Success: true, Message: '', Data: {} };
  try {
    // Body params
    const { MonitoringId, Status, OldStatus, CVDHistoryData, CVDBodySizeData, CVDRiskData } =
      req.body;
    const LogedUser = req.LogedUser;

    if (!LogedUser) {
      return res.send(
        JSON.stringify(
          BaseControllerHelper.GetDefaultErrorResult('Нэвтэрсэн хэрэглэгчийн мэдээлэл олдсонгүй')
        )
      );
    }

    //
    //
    var UpdateMonitoringId = null;
    var HistoryId = null;
    var BodySizeId = null;
    var RiskId = null;

    var IsActive = '1';
    var OutDate = null;
    var ExpiredDate = null;
    var StartedDate = null;

    if (Status === 'expired') {
      IsActive = '0';
      OutDate = ObjectHelper.getDateYMDHMS();
      ExpiredDate = format(
        addYears(new Date(ObjectHelper.getDateYMDHMS()), 1),
        'yyyy-MM-dd HH:mm:ss'
      );
      result.Message = 'Үзлэгт хамрагдлаа';
    }

    if (Status === 'activated') {
      IsActive = '1';
      StartedDate = ObjectHelper.getDateYMDHMS();
      result.Message = 'Хяналтанд үзлэг нэмлээ';
    }

    // Create CVD history
    if (MonitoringId && Status && CVDHistoryData && CVDBodySizeData && CVDRiskData) {
      if (OldStatus === 'inactive' && (Status === 'expired' || Status === 'activated')) {
        let Data = { Id: MonitoringId, IsActive, Status };

        if (Status === 'expired') {
          Data = Object.assign(Data, {
            date_status: 'simple',
            OutDate,
            ExpiredDate,
          });
        } else if (Status === 'activated') {
          Data = Object.assign(Data, { StartedDate });
        }

        if (OldStatus === 'inactive') {
          Data = Object.assign(Data, {
            CreateUserId: LogedUser.Id,
            CreateData: ObjectHelper.getDateYMDHMS(),
          });
        }

        UpdateMonitoringId = await BaseControllerHelper.BaseUpdate({
          ObjectName: 'CVDMonitoring',
          Data,
          LogedUser,
          SaveLog: false,
        });
      }
      // Create history
      HistoryId = await BaseControllerHelper.BaseCreate({
        ObjectName: 'CVDHistory',
        Data: { ...CVDHistoryData, MonitoringId },
        LogedUser,
        SaveLog: false,
      });
      // Create body size
      BodySizeId = await BaseControllerHelper.BaseCreate({
        ObjectName: 'CVDBodySize',
        Data: { ...CVDBodySizeData, MonitoringId },
        LogedUser,
        SaveLog: false,
      });
      // Create risk
      RiskId = await BaseControllerHelper.BaseCreate({
        ObjectName: 'CVDRisk',
        Data: { ...CVDRiskData, MonitoringId },
        LogedUser,
        SaveLog: false,
      });
      result.Data = { MonitoringId, HistoryId, BodySizeId, RiskId };
    } else {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Information is missing'))
      );
    }
    // return response
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function CustomCreateMonitoring(LogedUser, Data) {
  const CreatedId = await BaseControllerHelper.BaseCreate({
    ObjectName: 'CVDMonitoring',
    Data,
    LogedUser,
    SaveLog: false,
  });
  const CreatedData = await CVDMonitoring.findAllNew({
    where: { Id: CreatedId },
    raw: true,
  });

  return CreatedData && CreatedData.length > 0 ? CreatedData[0] : null;
}

async function CheckPatient(req, res) {
  try {
    var result = { Success: true, Message: '', Data: null, Option: {} };

    let { PatRegNo } = req.body;
    const LogedUser = req.LogedUser;

    var Id = null;
    // var CVDMonitoringData = null;
    var PatientData = null;
    //
    var Organization = null;
    var ParentOrganizationId = null;
    var OrganizationId = null;
    var OrgLevel = null;
    var ProvinceCityId = null;
    var SoumDistrictId = null;
    var BagKhorooId = null;

    if (PatRegNo && LogedUser) {
      PatRegNo = PatRegNo.toUpperCase();
      Organization = LogedUser.Doctor && LogedUser.Doctor.Organization;
      // get value from Organization attributes
      ParentOrganizationId = Organization && Organization.ParentOrganizationId;
      OrganizationId = Organization && Organization.Id;
      OrgLevel = Organization && Organization.level;
      ProvinceCityId = Organization && Organization.addr_prov_city;
      SoumDistrictId = Organization && Organization.addr_soum_dist;
      BagKhorooId = Organization && Organization.addr_bag_khoroo;

      PatientData = await Patient.findOne({
        where: { p_registration: PatRegNo },
        raw: true,
      });

      console.log(
        '[CVDMonitoring/CheckPatient] PatRegNo=%j chars=%o patientFound=%o',
        PatRegNo,
        Array.from(PatRegNo).map((c) => c.charCodeAt(0)),
        !!PatientData
      );

      // herev uilchluulegchiin burtgel baigaa bol shuud hyanaltiin idevhgui burtgel uusgene
      if (PatientData) {
        // Calculate BirthDate and Age from Patient data or PatRegNo
        const { BirthDate, Age } = getBirthDateAndAge(PatientData.p_birthday, PatRegNo);

        // createData
        const CreateData = {
          IsActive: '1',
          PatRegNo,
          BirthDate,
          Age,
          Status: 'inactive',
          ParentOrganizationId,
          OrganizationId,
          ProvinceCityId,
          SoumDistrictId,
          BagKhorooId,
        };

        const [CVDMonitoringData, data] = await sequelize.query(
          "SELECT TOP 1 m.Id, m.IsActive, m.Status FROM CVDMonitoring m INNER JOIN Patient p ON m.PatRegNo=p.p_registration WHERE m.PatRegNo=N'" +
            PatRegNo +
            "' AND p.p_registration=N'" +
            PatRegNo +
            "' ORDER BY m.Id DESC"
        );
        console.log(
          '[CVDMonitoring/CheckPatient] CVDMonitoringRows=%o',
          CVDMonitoringData && CVDMonitoringData.length > 0
            ? { Id: CVDMonitoringData[0].Id, IsActive: CVDMonitoringData[0].IsActive, Status: CVDMonitoringData[0].Status }
            : null
        );

        if (CVDMonitoringData.length > 0) {
          Id = CVDMonitoringData[0].Id;
          if (Id) {
            // Сүүлийн хяналт идэвхитэй байгаа эсэх
            if (
              CVDMonitoringData[0].IsActive === '1' &&
              (CVDMonitoringData[0].Status === 'activated' ||
                CVDMonitoringData[0].Status === 'inactive')
            ) {
              let CVDMonitoringL = await CVDMonitoring.findAllNew({
                where: { Id, PatRegNo },
              });
              CVDMonitoringL = JSON.parse(JSON.stringify(CVDMonitoringL));
              let lastMonitoringData =
                CVDMonitoringL && CVDMonitoringL.length > 0 ? CVDMonitoringL[0] : null;

              if (lastMonitoringData.Status === 'inactive') {
                lastMonitoringData = Object.assign(lastMonitoringData, {
                  DoctorsProfile: LogedUser.Doctor,
                  Organization: LogedUser.Doctor ? LogedUser.Doctor.Organization : null,
                });
              }
              result.Data = lastMonitoringData;
              return res.send(JSON.stringify(result));
            } else if (
              CVDMonitoringData[0].IsActive === '0' &&
              (CVDMonitoringData[0].Status === 'expired' ||
                CVDMonitoringData[0].Status === 'out_control')
            ) {
              // Herev suuliin hyanaltiin medeeleld idevhitei hyanaltand baihgui bol suuliin data-gaar hyanalt uusgene
              result.Data = await CustomCreateMonitoring(LogedUser, CreateData);
            }
          }
        } else {
          result.Data = await CustomCreateMonitoring(LogedUser, CreateData);
        }

        return res.send(JSON.stringify(result));
      } else {
        return res.send(
          JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Иргэний мэдээлэл олдсонгүй'))
        );
      }
    }
  } catch (ex) {
    console.error('[CVDMonitoring/CheckPatient] error:', ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// Get CVDHistory Last data
async function GetLastHistoryData(req, res) {
  try {
    var result = { Success: true, Message: '', Data: null, Option: {} };

    const { MonitoringId, AppId } = req.body;
    const LogedUser = req.LogedUser;

    var Id = null;

    if (MonitoringId && LogedUser) {
      const [CVDHistory, data] = await sequelize.query(
        'SELECT TOP 1 * FROM CVDHistory WHERE MonitoringId=' + MonitoringId + ' ORDER BY Id DESC'
      );

      if (CVDHistory.length === 1) {
        Id = CVDHistory[0].Id;
        if (Id) {
          const Option = {
            SearchText: '',
            limit: 1,
            offset: 0,
            SearchField: [{ Field: 'Id', Value: Id, Op: 'Equals' }],
            FindType: 'AllData',
            WhereType: '',
          };
          const DetailData = await BaseControllerHelper.BaseDetailInfo({
            ObjectName: 'CVDHistory',
            LogedUser,
            AppId,
            Option,
          });
          result.Data = DetailData.Data;
        }
      }
    }
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// Get CVDBodySize Last data
async function GetLastBodySizeData(req, res) {
  try {
    var result = { Success: true, Message: '', Data: null, Option: {} };

    const { MonitoringId, AppId } = req.body;
    const LogedUser = req.LogedUser;

    var Id = null;

    if (MonitoringId && LogedUser) {
      const [CVDBodySize, data] = await sequelize.query(
        'SELECT TOP 1 * FROM CVDBodySize WHERE MonitoringId=' + MonitoringId + ' ORDER BY Id DESC'
      );

      if (CVDBodySize.length === 1) {
        Id = CVDBodySize[0].Id;
        if (Id) {
          const Option = {
            SearchText: '',
            limit: 1,
            offset: 0,
            SearchField: [{ Field: 'Id', Value: Id, Op: 'Equals' }],
            FindType: 'AllData',
            WhereType: '',
          };
          const DetailData = await BaseControllerHelper.BaseDetailInfo({
            ObjectName: 'CVDBodySize',
            LogedUser,
            AppId,
            Option,
          });
          result.Data = DetailData.Data;
        }
      }
    }
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// Get CVDBodySize Last data
async function GetLastRiskData(req, res) {
  try {
    var result = { Success: true, Message: '', Data: null, Option: {} };

    const { MonitoringId, AppId } = req.body;
    const LogedUser = req.LogedUser;

    var Id = null;

    if (MonitoringId && LogedUser) {
      const [CVDRiskData, data] = await sequelize.query(
        'SELECT TOP 1 * FROM CVDRisk WHERE MonitoringId=' + MonitoringId + ' ORDER BY Id DESC'
      );

      if (CVDRiskData.length === 1) {
        Id = CVDRiskData[0].Id;
        if (Id) {
          const RiskData = await CVDRisk.findByPk(Id);
          result.Data = RiskData;
        }
      }
    }
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// Get Management Data
async function GetLastManagementData(req, res) {
  try {
    var result = { Success: true, Message: '', Data: null, Option: {} };

    const { MonitoringId, AppId } = req.body;
    const LogedUser = req.LogedUser;

    var Id = null;

    if (MonitoringId && LogedUser) {
      const [CVDManagement, data] = await sequelize.query(
        'SELECT TOP 1 * FROM CVDManagement WHERE MonitoringId=' + MonitoringId + ' ORDER BY Id DESC'
      );

      if (CVDManagement.length === 1) {
        Id = CVDManagement[0].Id;
        if (Id) {
          const Option = {
            SearchText: '',
            limit: 1,
            offset: 0,
            SearchField: [{ Field: 'Id', Value: Id, Op: 'Equals' }],
            FindType: 'AllData',
            WhereType: '',
          };
          const DetailData = await BaseControllerHelper.BaseDetailInfo({
            ObjectName: 'CVDManagement',
            LogedUser,
            AppId,
            Option,
          });
          result.Data = DetailData.Data;
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

async function GetLastDiagnosisData(req, res) {
  try {
    var result = { Success: true, Message: '', Data: null, Option: {} };

    const { MonitoringId, AppId } = req.body;
    const LogedUser = req.LogedUser;

    var Id = null;

    if (MonitoringId && LogedUser) {
      const [CVDDiagnosis, data] = await sequelize.query(
        'SELECT TOP 1 * FROM CVDDiagnosis WHERE MonitoringId=' + MonitoringId + ' ORDER BY Id DESC'
      );

      if (CVDDiagnosis.length === 1) {
        Id = CVDDiagnosis[0].Id;
        if (Id) {
          const Option = {
            SearchText: '',
            limit: 1,
            offset: 0,
            SearchField: [{ Field: 'Id', Value: Id, Op: 'Equals' }],
            FindType: 'AllData',
            WhereType: '',
          };
          const DetailData = await BaseControllerHelper.BaseDetailInfo({
            ObjectName: 'CVDDiagnosis',
            LogedUser,
            AppId,
            Option,
          });
          result.Data = DetailData.Data;
        }
      }
    }
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

//#region  Control management

// Take Control
async function TakeControl(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully saved', Data: {} };

    const Data = JSON.parse(req.body.Data);
    const { MonitoringId } = req.body;
    const LogedUser = req.LogedUser;
    //

    let TransitionId = null;
    if (Data && MonitoringId && LogedUser) {
      //create cvd monitoring
      TransitionId = await BaseControllerHelper.BaseCreate({
        ObjectName: 'CVDControlAndTransition',
        Data,
        LogedUser,
        SaveLog: false,
      });

      result.Data = { TransitionId };
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

// Leave Control
async function CreateControlAndTransition(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully saved', Data: {} };

    const Data = JSON.parse(req.body.Data);
    const { MonitoringId } = req.body;
    const LogedUser = req.LogedUser;

    let Id = null;
    let TransitionId = null;
    let UpdateMonitoringId = null;

    if (Data && MonitoringId && LogedUser) {
      const control = await CVDControlAndTransition.findOne({
        where: { MonitoringId },
        attributes: ['Id'],
        order: [['Id', 'DESC']],
        raw: true,
      });
      // check control exists
      Id = control ? control.Id : null;
      if (Id) {
        TransitionId = await BaseControllerHelper.BaseUpdate({
          ObjectName: 'CVDControlAndTransition',
          Data: { ...Data, Id },
          LogedUser,
          SaveLog: false,
        });
      } else {
        TransitionId = await BaseControllerHelper.BaseCreate({
          ObjectName: 'CVDControlAndTransition',
          Data,
          LogedUser,
          SaveLog: false,
        });
      }

      // update monitoring
      if (TransitionId) {
        UpdateMonitoringId = await BaseControllerHelper.BaseUpdate({
          ObjectName: 'CVDMonitoring',
          Data: {
            Id: MonitoringId,
            IsActive: '0',
            Status: 'out_control',
            date_status: 'simple',
            OutUserId: LogedUser.Id,
            OutDate: ObjectHelper.getDateYMDHMS(),
            ExpiredDate: format(
              addYears(new Date(ObjectHelper.getDateYMDHMS()), 1),
              'yyyy-MM-dd HH:mm:ss'
            ),
          },
          LogedUser,
          SaveLog: false,
        });
      } else {
        return res.send(
          JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Data not found'))
        );
      }

      result.Data = { TransitionId, UpdateMonitoringId };
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

//#endregion

// Get Analyze Data
async function GetAnalyzeData(req, res) {
  try {
    var result = {
      Success: true,
      Message: 'Мэдээлэл амжилттай татлаа',
      Data: {},
      DataId: null,
    };

    const { MonitoringId } = req.body;
    const LogedUser = req.LogedUser;

    var dataRowsDaralt = ['Систол даралт ()'];
    var dataColumnsDaralt = ['Диастол даралт'];
    var dataXDaralt = ['x'];

    var dataRowsBJI = ['БЖИ (кг/м2)'];
    var dataColumnsBJI = null;
    var dataXBJI = ['x'];

    var dataRowsCholest = ['Холестерин mmol/m'];
    var dataColumnsCholest = null;
    var dataXCholest = ['x'];

    var dataRowsRisk = ['Эрсдэл'];
    var dataColumnsRisk = null;
    var dataXRisk = ['x'];

    var CVDBodySizeData = [];
    var CVDRiskData = [];
    //

    if (MonitoringId && LogedUser) {
      CVDBodySizeData = await CVDBodySize.findAll({
        where: { MonitoringId },
      });
      CVDRiskData = await CVDRisk.findAll({
        where: { MonitoringId },
      });

      if (CVDBodySizeData.length > 0) {
        CVDBodySizeData.forEach((element) => {
          // BJI
          dataRowsBJI.push(element.BJI);
          dataXBJI.push(ObjectHelper.getDateYMD({ Date: element.CreatedDate }));
          // Cholesterol
          dataRowsCholest.push(element.Cholesterol);
          dataXCholest.push(ObjectHelper.getDateYMD({ Date: element.CreatedDate }));
          // Daralt
          dataRowsDaralt.push(element.DaraltDeed);
          dataColumnsDaralt.push(element.DaraltDood);
          dataXDaralt.push(ObjectHelper.getDateYMD({ Date: element.CreatedDate }));
        });
      }
      if (CVDRiskData.length > 0) {
        CVDRiskData.forEach((element) => {
          // Risk
          dataRowsRisk.push(element.Risk);
          dataXRisk.push(ObjectHelper.getDateYMD({ Date: element.CreatedDate }));
        });
      }
      // response data
      result.Data = {
        Daralt: [dataRowsDaralt, dataColumnsDaralt, dataXDaralt],
        BJI: [dataRowsBJI, dataColumnsBJI, dataXBJI],
        Cholesterol: [dataRowsCholest, dataColumnsCholest, dataXCholest],
        Risk: [dataRowsRisk, dataColumnsRisk, dataXRisk],
      };
    } else {
      result.Message = 'Мэдээлэл татах утга дутуу байна';
    }
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// Create Sent Prescription
async function CreateSentPrescription(req, res) {
  var result = {
    Success: true,
    Message: 'Successfully',
    Data: null,
    DataId: null,
  };

  var SentData = {
    receiptType: 1,
    receiptDiag: '',
    desc: '',
    patient: { regNo: '', fingerImage: '' },
    doctor: { fingerImage: '' },
    survey: {
      heigth: 0,
      weigth: 0,
      waist: 0,
      pulse: 0,
      breath: 0,
      temp: 0,
      saturatsi: 0,
      sugar: 0,
      cholesterol: 0,
      maxPressure: 0,
      minPressure: 0,
      isSmoke: false,
    },
    tablets: [],
  };

  try {
    // Body params
    const { MonitoringId, Diagnosis, Desc, PatRegNo, Tablets, SurveyData, IsSmoke } = req.body;
    const DoctorRegNo = 'ЕЦ95042801';
    const LogedUser = req.LogedUser;
    //
    var SentPrescriptionId = null;
    var SavePrescriptionData = null;
    // Create CVD history
    if (MonitoringId && PatRegNo && LogedUser && Tablets.length > 0 && Array.isArray(Diagnosis)) {
      var receiptDiag = '';
      Diagnosis.map((Journal) => {
        var JournalMonName = null;
        JournalMonName = Journal.JournalRef.JournalRefTranslation.Mon
          ? Journal.JournalRef.JournalRefTranslation.Mon
          : null;

        var JournalText = JournalMonName
          ? Journal.JournalRef.jr_label.split(' ')[0] + ' ' + JournalMonName
          : Journal.JournalRef.jr_label;

        receiptDiag += JournalText.split('*')[1] + '; ';
      });

      // SentData get attributes to value
      SentData.receiptDiag = receiptDiag;
      SentData.desc = Desc;
      SentData.patient.regNo = PatRegNo;
      SentData.survey.heigth = SurveyData.Height;
      SentData.survey.weigth = SurveyData.Weigth;
      SentData.survey.waist = SurveyData.Buselkhii;
      SentData.survey.pulse = SurveyData.HeartRate;
      SentData.survey.breath = SurveyData.RespiratoryRate;
      SentData.survey.temp = SurveyData.Temperature;
      SentData.survey.saturatsi = SurveyData.Saturatsi;
      SentData.survey.sugar = SurveyData.Sahar;
      SentData.survey.cholesterol = SurveyData.Cholesterol;
      SentData.survey.maxPressure = SurveyData.DaraltDeed;
      SentData.survey.minPressure = SurveyData.DaraltDood;
      SentData.survey.isSmoke = IsSmoke === 'y' ? true : false;
      SentData.tablets = Tablets;

      // Create Prescription
      SentPrescriptionId = await BaseControllerHelper.BaseCreate({
        ObjectName: 'CVDSentPrescription',
        Data: {
          MonitoringId,
          SentData: JSON.stringify(SentData),
          ResData: null,
          DoctorRegNo: DoctorRegNo,
          RequestStatus: 'sent_request',
        },
        LogedUser,
        SaveLog: false,
      });

      // Send Prescription Data save
      if (SentPrescriptionId) {
        var RequestStatus = 'sent_request';
        var receiptNumber = null;
        var respMsgCode = '';
        var Success = false;

        SavePrescriptionData = await EMDServiceHelper.savePrescription(SentData, DoctorRegNo);

        respMsgCode = SavePrescriptionData && SavePrescriptionData.respMsgCode;
        receiptNumber = SavePrescriptionData && SavePrescriptionData.receiptNumber;

        // Sent request successfully && unsuccessfully
        if (SavePrescriptionData.receiptNumber && SavePrescriptionData.respMsgCode === '200') {
          RequestStatus = 'successfully';
          Success = true;
        }
        if (!SavePrescriptionData.receiptNumber && SavePrescriptionData.respMsgCode === '400') {
          RequestStatus = 'unsuccessfully';
          Success = false;
        }

        await BaseControllerHelper.BaseUpdate({
          ObjectName: 'CVDSentPrescription',
          Data: {
            Id: SentPrescriptionId,
            ResData: JSON.stringify(SavePrescriptionData),
            RequestStatus: RequestStatus,
          },
          LogedUser,
          SaveLog: false,
        });
        // response json data
        result.Success = Success;
        result.Message = SavePrescriptionData && SavePrescriptionData.respMsg;
        result.Data = SavePrescriptionData;
        result.DataId = SentPrescriptionId;
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
  return res.send(JSON.stringify(result));
}

// Create management
async function CreateManagement(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully saved', Data: {} };

    const { MonitoringId } = req.body;
    const Data = JSON.parse(req.body.Data);
    const LogedUser = req.LogedUser;

    var ManagementId = null;
    if (MonitoringId && LogedUser) {
      ManagementId = await BaseControllerHelper.BaseCreate({
        ObjectName: 'CVDManagement',
        Data: { ...Data, MonitoringId },
        LogedUser,
        SaveLog: false,
      });

      result.Data = { ManagementId };
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

async function CreateDiagnosis(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully saved', Data: {} };

    const { MonitoringId, Comment, MainDiagnosis } = req.body;
    const LogedUser = req.LogedUser;

    var CVDDiagnosisId = null;
    if (MonitoringId && LogedUser) {
      CVDDiagnosisId = await BaseControllerHelper.BaseCreate({
        ObjectName: 'CVDDiagnosis',
        Data: { MainDiagnosis, Comment, MonitoringId },
        LogedUser,
        SaveLog: false,
      });
    }

    result.Data = { CVDDiagnosisId };
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

//
async function CreatePatient(req, res) {
  var result = { Success: false, Message: 'Successfully', Data: {} };

  try {
    const Data = JSON.parse(req.body.Data);
    const LogedUser = req.LogedUser;

    var Organization = null;
    var ParentOrganizationId = null;
    var OrganizationId = null;
    // var OrgLevel = null;
    var ProvinceCityId = null;
    var SoumDistrictId = null;
    var BagKhorooId = null;

    if (LogedUser) {
      Organization = LogedUser.Doctor && LogedUser.Doctor.Organization;
      // get value from Organization attributes
      ParentOrganizationId = Organization && Organization.ParentOrganizationId;
      OrganizationId = Organization && Organization.Id;
      // OrgLevel = Organization && Organization.level;
      ProvinceCityId = Organization && Organization.addr_prov_city;
      SoumDistrictId = Organization && Organization.addr_soum_dist;
      BagKhorooId = Organization && Organization.addr_bag_khoroo;

      // Reuse existing Patient if same p_registration already exists,
      // so the CVD flow doesn't fail on the global duplicate guard in Patient.createNew.
      const PatRegNoNormalized =
        Data.p_registration && typeof Data.p_registration === 'string'
          ? Data.p_registration.toUpperCase()
          : Data.p_registration;

      let CreatedId = null;
      const ExistingPatient = PatRegNoNormalized
        ? await Patient.findOne({
            where: { p_registration: PatRegNoNormalized },
            raw: true,
          })
        : null;

      if (ExistingPatient) {
        CreatedId = ExistingPatient.id_data;
      } else {
        CreatedId = await BaseControllerHelper.BaseCreate({
          ObjectName: 'Patient',
          Data,
          LogedUser,
          SaveLog: false,
        });
      }

      if (CreatedId) {
        const PatientData = await Patient.findOne({
          where: { id_data: CreatedId },
          raw: true,
        });
        if (PatientData) {
          // Calculate BirthDate and Age from Patient data or PatRegNo
          const { BirthDate, Age } = getBirthDateAndAge(
            PatientData.p_birthday,
            PatientData.p_registration
          );

          const Id = await BaseControllerHelper.BaseCreate({
            ObjectName: 'CVDMonitoring',
            Data: {
              IsActive: '1',
              PatRegNo: PatientData.p_registration,
              BirthDate,
              Age,
              Status: 'inactive',
              ParentOrganizationId,
              OrganizationId,
              ProvinceCityId,
              SoumDistrictId,
              BagKhorooId,
            },
            LogedUser,
            SaveLog: false,
          });

          result.Success = true;
          result.Data = { Id, PatientId: CreatedId };
        }
      }
    }

    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.error('[CVDMonitoring/CreatePatient] error:', ex);
    const message = ex && (ex.Message || ex.message) ? (ex.Message || ex.message) : null;
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult(message)));
  }
}

// Update Patient Info
async function UpdatePatient(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully updated', Data: {} };

    const { PatRegNo } = req.body;
    const Data = JSON.parse(req.body.Data);
    const LogedUser = req.LogedUser;

    var UpdatedId = null;
    var PatientId = null;
    if (PatRegNo && LogedUser) {
      const PatientOneData = await Patient.findOne({
        where: { p_registration: PatRegNo },
        attributes: ['id_data'],
        raw: true,
      });

      PatientId = PatientOneData ? PatientOneData.id_data : null;
      if (PatientId) {
        UpdatedId = await BaseControllerHelper.BaseUpdate({
          ObjectName: 'Patient',
          Data: { ...Data, id_data: PatientId },
          LogedUser,
          SaveLog: false,
        });
      }
    }

    result.Data = { UpdatedId };
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// Get Patient Info
async function GetPatientInfo(req, res) {
  try {
    const result = { Success: true, Message: 'Successfully', Data: {} };

    const { PatRegNo } = req.body;
    const LogedUser = req.LogedUser;
    const AppId = LogedUser ? LogedUser.AppId : '1';

    if (PatRegNo && LogedUser) {
      var Option = {
        SearchText: '',
        limit: 1,
        offset: 0,
        SearchField: [{ Field: 'p_registration', Value: PatRegNo, Op: 'Equals' }],
        FindType: 'AllData',
        WhereType: '',
      };
      var DetailData = await BaseControllerHelper.BaseDetailInfo({
        ObjectName: 'Patient',
        LogedUser,
        AppId,
        Option,
      });
      result.Data = DetailData.Data;
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

// Get List
async function GetList(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [], Option: {} };
    const { ObjectName, AppId } = req.body;
    const LogedUser = req.LogedUser;

    const RoleId = LogedUser ? LogedUser.RoleId : null;

    if (ObjectName && LogedUser) {
      const OrganizationData = LogedUser.Doctor ? LogedUser.Doctor.Organization : null;
      const OrganizationId = OrganizationData ? OrganizationData.Id + '' : null;
      const OrgLevel = OrganizationData ? OrganizationData.level : null;

      var OrgIds = [];
      var ChildOrganizations = null;

      if (parseInt(RoleId) !== 1 && parseInt(RoleId) !== 6) {
        // 2 р түвшний эмнэлэг бол харьяалагдах сум, өрхийн эмнэлгүүдийн мэдээллийг харах боломжтой
        if (OrgLevel + '' === '2') {
          ChildOrganizations = await Organization.findAll({
            where: { ParentOrganizationId: OrganizationId, level: '1' },
            attributes: ['Id'],
            raw: true,
          });
          if (ChildOrganizations && ChildOrganizations.length > 0) {
            ChildOrganizations.forEach((e) => OrgIds.push(e.Id));
          }
        }

        // 1-р түвшний эмнэлэг бол зөвхөн өөрийн харьяаны хяналтын мэдээллийг харах
        if (OrgLevel === null || OrgLevel + '' === '1') {
          OrgIds.push(OrganizationId);
        }
      }
      // Байгууллагын ID-р хайх боломжтой талбар нэмэх
      let SearchOrgIdsField = null;
      if (OrgIds.length > 0) {
        SearchOrgIdsField = {
          Field: 'OrganizationId',
          Value: OrgIds,
          Op: 'In',
        };
      }

      // Идэвхигүй хяналт
      // var SearchNotInActive = {
      //   Field: "Status",
      //   Value: "inactive",
      //   Op: "NotEquals",
      // };

      // request Option
      var Option = BaseControllerHelper.GetCrudRequestData(req);
      if (parseInt(RoleId) !== 1 && parseInt(RoleId) !== 6 && SearchOrgIdsField)
        Option.SearchField.push(SearchOrgIdsField);
      // Option.SearchField.push(SearchNotInActive);
      // Get List Data
      const ListData = await BaseControllerHelper.BaseGetList({
        ObjectName: 'CVDMonitoring',
        LogedUser,
        AppId,
        Option,
      });

      if (ListData.Data && ListData.Data.length > 0) {
        for (var i = 0; i < ListData.Data.length; i++) {
          var MonitoringId = null;
          var LastRiskData = {};
          MonitoringId = ListData.Data[i] && ListData.Data[i].Id;
          // Last Datas
          var LastRiskId = await CVDRisk.max('Id', { where: { MonitoringId } });
          if (LastRiskId) {
            LastRiskData = await CVDRisk.findByPk(LastRiskId, {
              attributes: ['Score', 'Risk', 'DoctorAdvice'],
              raw: true,
            });
            // LastRiskData = JSON.parse(JSON.stringify(LastRiskData));
            // Add Last datas
            ListData.Data[i] = { ...ListData.Data[i], ...LastRiskData };
          }
        }
      }
      // response data
      result.Data = ListData.Data;
      result.Option = ListData.Option;
    }
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// Find Patient data for Update
async function FindPatientDataForUpdate(req, res) {
  try {
    var result = {
      Success: true,
      Message: 'Successfully updated',
      Data: null,
      Count: 0,
    };
    const LogedUser = req.LogedUser;
    //
    let Count = 0;
    const PatientData = await Patient.findAll({
      attributes: ['id_data', 'p_registration'],
    });
    result.Data = PatientData;
    if (PatientData && PatientData.length > 0) {
      for (let i = 0; i < PatientData.length; i++) {
        var PatId = PatientData[i].id_data;
        var PatRegNo = PatientData[i].p_registration;
        var UpdatePatientData = null;

        UpdatePatientData = await EMDServiceHelper.getPatient(PatRegNo);
        if (
          UpdatePatientData &&
          UpdatePatientData.regNo &&
          UpdatePatientData.respMsgCode === '200'
        ) {
          await BaseControllerHelper.BaseUpdate({
            ObjectName: 'Patient',
            Data: {
              id_data: PatId,
              p_registration: UpdatePatientData.regNo,
              p_firstname: UpdatePatientData.firstName,
              p_lastname: UpdatePatientData.lastName,
            },
            LogedUser,
            SaveLog: false,
          });

          Count++;
        }
      }
    }
    result.Count = Count;
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

module.exports = router;
