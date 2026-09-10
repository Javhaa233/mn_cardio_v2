const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class DoctorsTeamNotes extends Sequelize.Model {}
DoctorsTeamNotes.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    DoctorId: { type: Sequelize.INTEGER },
    PatientId: { type: Sequelize.INTEGER },
    TeamId: { type: Sequelize.INTEGER },
    CreateDate: { type: Sequelize.DATE },
    Notes: { type: Sequelize.STRING },
    CreateUserId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'DoctorsTeamNotes',
    modelName: 'DoctorsTeamNotes',
    timestamps: false,
  }
);

DoctorsTeamNotes.SearchField = [
  'Id',
  'DoctorId',
  'PatientId',
  'TeamId',
  'CreateDate',
  'Notes',
  'CreateUserId',
];

DoctorsTeamNotes.SetAssocations = (Models) => {
  DoctorsTeamNotes.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'CreateUserId',
    targetKey: 'Id',
  });

  DoctorsTeamNotes.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'DoctorId',
    targetKey: 'id_data',
  });

  DoctorsTeamNotes.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'PatientId',
    targetKey: 'id_data',
  });

  DoctorsTeamNotes.belongsTo(Models.DoctorsTeam, {
    as: 'DoctorsTeam',
    foreignKey: 'TeamId',
  });
};

DoctorsTeamNotes.SetFunctions = (Models) => {
  DoctorsTeamNotes.findAllNew = async function (Option) {
    const result = await DoctorsTeamNotes.findAll({
      ...Option,
      include: [
        {
          model: Models.Users,
          as: 'Users',
          attributes: ['Id', 'LastName', 'FirstName'],
        },
        {
          model: Models.DoctorsProfile,
          as: 'DoctorsProfile',
          attributes: ['firstname', 'lastname', 'id_data'],
        },
        {
          model: Models.Patient,
          as: 'Patient',
          attributes: ['p_firstname', 'p_lastname', 'id_data', 'p_registration', 'Age'],
        },
        {
          model: Models.DoctorsTeam,
          as: 'DoctorsTeam',
          attributes: ['name', 'id_data'],
        },
      ],
    });
    return result;
  };

  DoctorsTeamNotes.FindByPatientAndTeam = async function (PatientId, TeamId, OtherOption) {
    var where = { where: { PatientId, TeamId } };
    if (OtherOption && OtherOption.where) {
      where = { where: { ...OtherOption.where, PatientId, TeamId } };
      delete OtherOption.where;
    }
    const result = await DoctorsTeamNotes.findAllNew({
      ...where,
      ...OtherOption,
    });

    return result;
  };
};

module.exports = DoctorsTeamNotes;
