const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class PatientHistory extends Sequelize.Model {}
PatientHistory.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    PatientId: { type: Sequelize.INTEGER },
    UserId: { type: Sequelize.INTEGER },
    DoctorId: { type: Sequelize.STRING },
    LogDate: { type: Sequelize.DATE },
    Notes: { type: Sequelize.STRING },
    LinkObjectName: { type: Sequelize.STRING },
    LinkObjectId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'PatientHistory',
    modelName: 'PatientHistory',
    timestamps: false,
  }
);

PatientHistory.SearchField = ['Id', 'PatientId', 'UserId', 'DoctorId'];

PatientHistory.SetAssocations = (Models) => {
  PatientHistory.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'UserId',
    targetKey: 'Id',
  });

  PatientHistory.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'DoctorId',
    targetKey: 'id_data',
  });

  PatientHistory.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'PatientId',
    targetKey: 'id_data',
  });
};

PatientHistory.SetFunctions = (Models) => {
  PatientHistory.findAllNew = async function (Option) {
    const result = await PatientHistory.findAll({
      ...Option,
      include: [
        {
          model: Models.Users,
          as: 'Users',
          attributes: ['Id', 'UserName', 'LastName', 'FirstName'],
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

module.exports = PatientHistory;
