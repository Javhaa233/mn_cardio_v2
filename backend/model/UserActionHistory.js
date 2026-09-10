const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class UserActionHistory extends Sequelize.Model {}
UserActionHistory.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    PatientId: { type: Sequelize.INTEGER },
    UserId: { type: Sequelize.INTEGER },
    DoctorId: { type: Sequelize.STRING },
    LogDate: { type: Sequelize.DATE },
    Notes: { type: Sequelize.STRING },
    NotesMn: { type: Sequelize.STRING },
    LinkObjectName: { type: Sequelize.STRING },
    LinkObjectId: { type: Sequelize.INTEGER },
    Action: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'UserActionHistory',
    modelName: 'UserActionHistory',
    timestamps: false,
  }
);

UserActionHistory.SearchField = ['Id', 'PatientId', 'UserId', 'DoctorId'];

UserActionHistory.SetAssocations = (Models) => {
  UserActionHistory.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'UserId',
    targetKey: 'Id',
  });

  UserActionHistory.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'DoctorId',
    targetKey: 'id_data',
  });

  UserActionHistory.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'PatientId',
    targetKey: 'id_data',
  });

  UserActionHistory.belongsTo(Models.ObjectNameDic, {
    as: 'ObjectNameDic',
    foreignKey: 'LinkObjectName',
    targetKey: 'ObjectName',
  });
};

UserActionHistory.SetFunctions = (Models) => {
  UserActionHistory.findAllNew = async function (Option) {
    const result = await UserActionHistory.findAll({
      ...Option,
      include: [
        {
          model: Models.Users,
          as: 'Users',
          attributes: ['Id', 'UserName', 'LastName', 'FirstName'],
        },
        {
          model: Models.ObjectNameDic,
          as: 'ObjectNameDic',
          attributes: ['Id', 'ObjectName', 'ObjectNameMn'],
        },
        {
          model: Models.Patient,
          as: 'Patient',
          attributes: ['id_data', 'p_lastname', 'p_firstname', 'p_registration', 'p_birthday'],
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

module.exports = UserActionHistory;
