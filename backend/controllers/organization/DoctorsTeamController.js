const express = require('express');
const router = express.Router();

const { Models, Op } = require('../../config/DB');

const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const ModelHelper = require('../../helper/ModelHelper');
const BaseHelper = require('../../helper/BaseHelper');
const ObjectHelper = require('../../helper/ObjectHelper');
const DoctorsTeamHelper = require('../../helper/DoctorsTeamHelper');

// routes
router.post('/GetCustomFormData', GetCustomFormData);
router.post('/GetDoctorsTeams', GetDoctorsTeams);
router.post('/CreateDoctorsTeam', CreateDoctorsTeam);
router.post('/RemoveDoctor', RemoveDoctor);
router.post('/SavePatient', SavePatient);
router.post('/RemovePatient', RemovePatient);
router.post('/SaveDoctor', SaveDoctor);
router.post('/GetDoctorsTeamsWithoutPatient', GetDoctorsTeamsWithoutPatient);
router.post('/CheckSurgeryBeforeCheck', CheckSurgeryBeforeCheck);
router.post('/GetList', GetList);
router.post('/ExportDoctorsTeamPatient', ExportDoctorsTeamPatient);
router.post('/DeleteDoctorsTeam', DeleteDoctorsTeam);


async function GetList(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [], Option: {} };
    const ObjectName = req.body.ObjectName;
    const LogedUser = req.LogedUser;
    var ModHelper = new ModelHelper(Models.DoctorsTeamPatient);

    if (ObjectName && LogedUser) {
      var CrudOption = BaseControllerHelper.GetCrudRequestData(req);
      const { Data, Option } = await BaseControllerHelper.BaseGetList({
        ObjectName,
        LogedUser,
        Option: CrudOption,
      });
      const DoctorsTeamPatients = ModHelper.GetNewObject(Data);
      const patientIds = [...new Set(DoctorsTeamPatients.map((p) => p.patient_id).filter(Boolean))];
      if (patientIds.length > 0) {
        const allJournals = await Models.Journal.GetRealJournalDataForPatients(patientIds);
        const journalMap = {};
        for (const journal of allJournals) {
          const pid = journal.PatientId || journal.patient_id;
          if (!journalMap[pid]) journalMap[pid] = [];
          journalMap[pid].push(journal);
        }
        for (const doctorsTeamPatient of DoctorsTeamPatients) {
          const PatientId = doctorsTeamPatient.patient_id;
          const Journals = (journalMap[PatientId] || []).filter(
            (s) => s.JournalRef && s.JournalRef.jr_type + '' === '5'
          );
          doctorsTeamPatient['Journals'] = ModHelper.GetNewObject(Journals);
        }
      }

      result.Data = DoctorsTeamPatients;
      result.Option = Option;
    }

    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function CheckSurgeryBeforeCheck(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully', CheckData: false };

    const DoctorsTeamPatientId = req.body.DoctorsTeamPatientId;
    const LogedUser = req.LogedUser;

    if (DoctorsTeamPatientId && LogedUser) {
      const DoctorsTeamPatients = await Models.DoctorsTeamPatient.findOne({
        where: { id_data: DoctorsTeamPatientId },
        raw: true,
      });

      if (DoctorsTeamPatients) {
        const Option = {
          SearchText: '',
          limit: 1,
          offset: 0,
          SearchField: [
            {
              Field: 'id_data',
              Value: DoctorsTeamPatients.team_id,
              Op: 'Equals',
            },
          ],
          FindType: 'AllData',
          WhereType: 'Contains',
        };

        const DetailData = await BaseControllerHelper.BaseDetail({
          ObjectName: 'DoctorsTeam',
          LogedUser,
          Option,
        });
        const DoctorsTeams = DetailData.Data;
        if (DoctorsTeams) {
          if (DoctorsTeams.procedures.filter((s) => s + '' === '1').length > 0) {
            result.CheckData = true;
          }
        }
      }
    }

    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function CreateDoctorsTeam(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [] };
    const Data = JSON.parse(req.body.Data);
    const LogedUser = req.LogedUser;

    const TeamId = await BaseControllerHelper.BaseCreate({
      ObjectName: 'DoctorsTeam',
      Data,
      LogedUser,
      SaveLog: true,
    });

    const Doctor = await Models.DoctorsProfile.findOne({
      where: { id: LogedUser.Id },
      raw: true,
    });
    if (Doctor) {
      //inser team doctors
      await BaseControllerHelper.BaseCreate({
        ObjectName: 'LookupDoctorTeam',
        Data: {
          team_id: TeamId,
          doctor_id: Doctor.id_data,
          privilege_add_patient: '1',
          privilege_admin: '1',
          privilege_delete_patient: '1',
          StartDate: ObjectHelper.getDateYMDHMS(),
        },
        LogedUser,
        SaveLog: true,
      });

      const DoctorsTeams = await Models.DoctorsTeam.findOne({
        where: { id_data: TeamId },
        raw: true,
      });
      if (DoctorsTeams) {
        await BaseControllerHelper.BaseCreate({
          ObjectName: 'DoctorsTeamDoctorHistory',
          Data: {
            CreateUserId: LogedUser.Id,
            DoctorId: Doctor.id_data,
            Notes: '"' + DoctorsTeams.name + '" багт орлоо',
            TeamId: TeamId,
            CreateDate: ObjectHelper.getDateYMDHMS(),
          },
          LogedUser,
        });
      }
    }
    result.Data = [{ TeamId: TeamId }];
    return res.send(result);
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function RemovePatient(req, res) {
  try {
    const Data = JSON.parse(req.body.Data);
    const LogedUser = req.LogedUser;
    var Doctor = LogedUser.Doctor || null;
    if (Data.patient_id && Data.team_id && LogedUser) {
      const RemoveResult = await DoctorsTeamHelper.RemovePatient({
        Data,
        LogedUser,
        Doctor,
      });

      return res.send(JSON.stringify(RemoveResult));
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

async function SavePatient(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [] };
    const Data = JSON.parse(req.body.Data);
    const LogedUser = req.LogedUser;
    const Doctor = LogedUser.Doctor || null;
    // Admins without doctor profiles can still edit teams.

    var RemoveTeamId = Data.remove_team_id;
    if (RemoveTeamId) {
      await DoctorsTeamHelper.RemovePatient({
        Data: { ...Data, team_id: RemoveTeamId },
        LogedUser,
        Doctor,
      });
    }

    const SaveResult = await DoctorsTeamHelper.SavePatient({
      Data,
      LogedUser,
      Doctor,
    });

    return res.send(JSON.stringify(SaveResult));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function SaveDoctor(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [] };
    const Data = JSON.parse(req.body.Data);
    const LogedUser = req.LogedUser;

    const DoctorId = Data.doctor_id;
    const TeamId = Data.team_id;

    const LkpDtrTeamFindObj = await Models.LookupDoctorTeam.findOne({
      where: { doctor_id: DoctorId, team_id: TeamId },
      raw: true,
    });

    if (LkpDtrTeamFindObj) {
      result = {
        Success: false,
        Message: 'Аль хэдийн нэмсэн байна',
        Data: [],
      };
    } else {
      const LkpDtrTeamId = await BaseControllerHelper.BaseCreate({
        ObjectName: 'LookupDoctorTeam',
        Data: { ...Data, StartDate: ObjectHelper.getDateYMDHMS() },
        LogedUser,
        SaveLog: true,
      });

      const DoctorsTeams = await Models.DoctorsTeam.findOne({
        where: { id_data: TeamId },
        raw: true,
      });
      if (DoctorsTeams) {
        await BaseControllerHelper.BaseCreate({
          ObjectName: 'DoctorsTeamDoctorHistory',
          Data: {
            CreateUserId: LogedUser.Id,
            DoctorId: Data.doctor_id,
            Notes: '"' + DoctorsTeams.name + '" багт орлоо',
            TeamId: Data.team_id,
            CreateDate: ObjectHelper.getDateYMDHMS(),
          },
          LogedUser,
        });
      }
      result.Data = [{ LkpDtrTeamId: LkpDtrTeamId }];
    }

    return res.send(result);
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function RemoveDoctor(req, res) {
  try {
    var result = {
      Success: true,
      Message: 'Successfully released from the team',
      Data: [],
    };
    const Data = JSON.parse(req.body.Data);
    const LogedUser = req.LogedUser;
    const whereClause = Data.id_data
      ? { id_data: Data.id_data, rec_status: { [Op.ne]: '2' } }
      : { rec_status: { [Op.ne]: '2' }, team_id: Data.TeamId, doctor_id: Data.DoctorId };
    let LookupDoctorTeams = await Models.LookupDoctorTeam.findAllNew({ where: whereClause });
    LookupDoctorTeams = JSON.parse(JSON.stringify(LookupDoctorTeams));

    for (var i = 0; i < LookupDoctorTeams.length; i++) {
      var LDTId = LookupDoctorTeams[i].id_data;
      const teamId = LookupDoctorTeams[i].team_id;
      const doctorId = LookupDoctorTeams[i].doctor_id;
      var Id = await BaseControllerHelper.BaseUpdate({
        ObjectName: 'LookupDoctorTeam',
        Data: {
          id_data: LDTId,
          rec_status: '2',
          EndDate: ObjectHelper.getDateYMDHMS(),
        },
        LogedUser,
        SaveLog: true,
      });

      var DoctorsTeams = await Models.DoctorsTeam.findOne({
        where: { id_data: teamId },
        raw: true,
      });

      if (DoctorsTeams) {
        await BaseControllerHelper.BaseCreate({
          ObjectName: 'DoctorsTeamDoctorHistory',
          Data: {
            CreateUserId: LogedUser.Id,
            DoctorId: doctorId,
            Notes: '"' + DoctorsTeams.name + '" багаас гарлаа',
            TeamId: teamId,
            CreateDate: ObjectHelper.getDateYMDHMS(),
          },
          LogedUser,
        });
      }
    }

    return res.send(result);
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function GetDoctorsTeams(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [] };
    var DoctorId = req.body.DoctorId;
    var AppId = req.body.AppId;
    const LogedUser = req.LogedUser;
    if (LogedUser) {
      const Result = await Models.DoctorsTeam.GetByDoctorId(DoctorId, {
        where: { AppId: AppId },
      });
      result.Data = Result;
    }
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function GetDoctorsTeamsWithoutPatient(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [] };

    var { DoctorId, PatientId, AppId } = req.body;
    const LogedUser = req.LogedUser;

    if (LogedUser) {
      var ResultWithoutPatient = [];
      const Result = await Models.DoctorsTeam.GetByDoctorId(DoctorId, {
        where: { AppId: AppId },
      });
      for (var i = 0; i < Result.length; i++) {
        let DoctorTeam = Result[i];
        DoctorTeam = JSON.parse(JSON.stringify(DoctorTeam));
        const checkPatient = await Models.DoctorsTeamPatient.count({
          where: {
            patient_id: PatientId,
            team_id: DoctorTeam.id_data,
            rec_status: { [Op.ne]: '2' },
          },
        }).then(async (count) => {
          return count > 0 ? false : true;
        });
        ResultWithoutPatient.push({ ...DoctorTeam, IsActive: checkPatient });
      }

      result.Data = ResultWithoutPatient;
    }

    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function GetCustomFormData(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [], Option: {} };
    const PatientId = req.body.PatientId;
    const DoctorsTeamConfigData = await BaseControllerHelper.GetConfigData('DoctorsTeam');
    const ModHelper = new ModelHelper(Models.DoctorsTeam);
    result.Data = { Fields: [] };

    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function ExportDoctorsTeamPatient(req, res) {
  return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));

  try {
    const LogedUser = req.LogedUser;

    if (LogedUser) {
      // SearchOption
      var { SearchText, WhereType, FindType, SearchField, OrderByType, OrderByField } = req.body;

      var Option = {
        SearchText: SearchText,
        limit: 0,
        offset: 0,
        SearchField: SearchField,
        FindType: FindType,
        WhereType: WhereType,
      };
      if (OrderByField && OrderByType) {
        Option.OrderBy = { OrderByField, OrderByType };
      }

      const { filePath } = await BaseControllerHelper.ExportExcel({
        ObjectName: 'DoctorsTeamPatient',
        LogedUser,
        Option,
      });

      if (filePath && filePath !== null) {
        res.set(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        return res.download(filePath);
      } else {
        return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
      }
    } else {
      return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
    }
  } catch (ex) {
    console.error(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function DeleteDoctorsTeam(req, res) {
  try {
    const TeamId = req.body.TeamId;
    const LogedUser = req.LogedUser;

    if (TeamId && LogedUser) {
      const Result = await DoctorsTeamHelper.DeleteDoctorsTeam({
        TeamId,
        LogedUser,
      });

      return res.send(JSON.stringify(Result));
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

