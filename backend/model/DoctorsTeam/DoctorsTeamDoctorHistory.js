const Sequelize = require('sequelize');

const sequelize = require('../../config/DbConnection');
Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class DoctorsTeamDoctorHistory extends Sequelize.Model {}
DoctorsTeamDoctorHistory.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    CreateUserId: { type: Sequelize.INTEGER },
    DoctorId: { type: Sequelize.STRING },
    CreateDate: { type: Sequelize.DATE },
    Notes: { type: Sequelize.STRING },
    TeamId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'DoctorsTeamDoctorHistory',
    modelName: 'DoctorsTeamDoctorHistory',
    timestamps: false,
  }
);

DoctorsTeamDoctorHistory.SearchField = ['Id', 'TeamId', 'CreateUserId', 'DoctorId'];

DoctorsTeamDoctorHistory.SetAssocations = (Models) => {
  DoctorsTeamDoctorHistory.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'CreateUserId',
    targetKey: 'Id',
  });

  DoctorsTeamDoctorHistory.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'DoctorId',
    targetKey: 'id_data',
  });

  DoctorsTeamDoctorHistory.belongsTo(Models.DoctorsTeam, {
    as: 'DoctorsTeam',
    foreignKey: 'TeamId',
    targetKey: 'id_data',
  });
};

DoctorsTeamDoctorHistory.SetFunctions = (Models) => {
  DoctorsTeamDoctorHistory.findAllNew = async function (Option) {
    const result = await DoctorsTeamDoctorHistory.findAll({
      ...Option,
      include: [
        {
          model: Models.Users,
          as: 'Users',
          attributes: ['Id', 'UserName', 'LastName', 'FirstName', 'Email'],
        },
        {
          model: Models.DoctorsTeam,
          as: 'DoctorsTeam',
          attributes: ['id_data', 'name'],
        },
        {
          model: Models.DoctorsProfile,
          as: 'DoctorsProfile',
          attributes: ['id_data', 'firstname', 'lastname'],
        },
      ],
    });
    return result;
  };
};

module.exports = DoctorsTeamDoctorHistory;
