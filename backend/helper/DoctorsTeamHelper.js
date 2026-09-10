const { Models, Op } = require('../config/DB');

const BaseControllerHelper = require('./BaseControllerHelper');
const ObjectHelper = require('./ObjectHelper');

class DoctorsTeamHelper {
  RemovePatient = async ({ Data, LogedUser, Doctor }) => {
    try {
      var result = { Success: true, Message: '', Data: null };
      const DoctorsTeams = await Models.DoctorsTeam.findOne({
        where: { id_data: Data.team_id },
        raw: true,
      });
      const DoctorsTeamPatients = await Models.DoctorsTeamPatient.findAll({
        where: {
          patient_id: Data.patient_id,
          team_id: Data.team_id,
          rec_status: { [Op.ne]: '2' },
        },
        raw: true,
      });

      if (DoctorsTeams && DoctorsTeamPatients) {
        for (var i = 0; i < DoctorsTeamPatients.length; i++) {
          const Id = DoctorsTeamPatients[i] ? DoctorsTeamPatients[i].id_data : null;
          let UpdateId = null;
          if (Id) {
            UpdateId = await BaseControllerHelper.BaseUpdate({
              ObjectName: 'DoctorsTeamPatient',
              Data: {
                id_data: Id,
                rec_status: '2',
                EndDate: ObjectHelper.getDateYMDHMS(),
              },
              SaveLog: true,
              LogedUser,
            });
          }

          await BaseControllerHelper.BaseCreate({
            ObjectName: 'PatientHistory',
            Data: {
              PatientId: Data.patient_id,
              UserId: LogedUser.Id,
              DoctorId: Doctor ? Doctor.id_data : null,
              Notes: '"' + DoctorsTeams.name + '" багийн хяналтаас гарлаа',
              LinkObjectName: 'DoctorsTeamPatient',
              LinkObjectId: UpdateId,
              LogDate: ObjectHelper.getDateYMDHMS(),
            },
            LogedUser,
          });
        }
      }
      result.Success = true;
      result.Message = 'Successfully';
      return result;
    } catch (ex) {
      result.Success = false;
      console.log(ex);
      return result;
    }
  };

  SavePatient = async ({ Data, LogedUser, Doctor }) => {
    try {
      var result = { Success: true, Message: '', Data: [] };
      const DoctorsTeams = await Models.DoctorsTeam.findOne({
        where: { id_data: Data.team_id },
        raw: true,
      });
      let DoctorsTeamPatients = await Models.DoctorsTeamPatient.findAllNew({
        where: {
          patient_id: Data.patient_id,
          team_id: Data.team_id,
          rec_status: { [Op.ne]: '2' },
        },
      });
      DoctorsTeamPatients = JSON.parse(JSON.stringify(DoctorsTeamPatients));
      if (DoctorsTeamPatients.length === 0) {
        const DTPatId = await BaseControllerHelper.BaseCreate({
          ObjectName: 'DoctorsTeamPatient',
          Data: { ...Data, StartDate: ObjectHelper.getDateYMDHMS() },
          LogedUser,
          SaveLog: true,
        });

        await BaseControllerHelper.BaseCreate({
          ObjectName: 'PatientHistory',
          Data: {
            PatientId: Data.patient_id,
            UserId: LogedUser.Id,
            DoctorId: Doctor ? Doctor.id_data : null,
            Notes: '"' + DoctorsTeams.name + '" багийн хяналтанд орлоо',
            LinkObjectName: 'DoctorsTeamPatient',
            LinkObjectId: DTPatId,
            LogDate: ObjectHelper.getDateYMDHMS(),
          },
          LogedUser,
        });
        result.Data = [{ DTPatId }];
        result.Success = true;
        result.Message = 'Successfully';
        return result;
      } else {
        result.Message = 'Мэдээлэл давхцаж байна';
        result.Success = false;
        return result;
      }
    } catch (ex) {
      console.log(ex);
      return BaseControllerHelper.GetDefaultErrorResult();
    }
  };

  DeleteDoctorsTeam = async ({ TeamId, LogedUser }) => {
    try {
      var result = { Success: true, Message: 'Successfully deleted', Data: null };

      // Soft delete the team
      await Models.DoctorsTeam.update(
        { rec_status: 2, date_modif: ObjectHelper.getDateYMDHMS(), user_mod: LogedUser.UserName },
        { where: { id_data: TeamId } }
      );

      // Soft delete team members
      await Models.LookupDoctorTeam.update(
        { rec_status: 2, EndDate: ObjectHelper.getDateYMDHMS() },
        { where: { team_id: TeamId, rec_status: { [Op.ne]: 2 } } }
      );

      // Soft delete team patients
      await Models.DoctorsTeamPatient.update(
        { rec_status: 2, EndDate: ObjectHelper.getDateYMDHMS() },
        { where: { team_id: TeamId, rec_status: { [Op.ne]: 2 } } }
      );

      return result;
    } catch (ex) {
      console.error(ex);
      return BaseControllerHelper.GetDefaultErrorResult();
    }
  };
}

module.exports = new DoctorsTeamHelper();
