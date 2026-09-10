const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

class vwUserActionHistory extends Sequelize.Model {}
vwUserActionHistory.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true },
    PatientId: { type: Sequelize.INTEGER },
    UserId: { type: Sequelize.INTEGER },
    DoctorId: { type: Sequelize.STRING },
    LogDate: { type: Sequelize.DATE },
    Notes: { type: Sequelize.STRING },
    NotesMn: { type: Sequelize.STRING },
    LinkObjectName: { type: Sequelize.STRING },
    LinkObjectId: { type: Sequelize.INTEGER },
    Action: { type: Sequelize.STRING },
    NotesDetail: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'vwUserActionHistory',
    modelName: 'vwUserActionHistory',
    timestamps: false,
  }
);

vwUserActionHistory.SearchField = ['Id', 'PatientId', 'UserId', 'DoctorId'];

vwUserActionHistory.SetAssocations = (Models) => {
  vwUserActionHistory.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'UserId',
    targetKey: 'Id',
  });

  vwUserActionHistory.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'DoctorId',
    targetKey: 'id_data',
  });

  vwUserActionHistory.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'PatientId',
    targetKey: 'id_data',
  });

  vwUserActionHistory.belongsTo(Models.ObjectNameDic, {
    as: 'ObjectNameDic',
    foreignKey: 'LinkObjectName',
    targetKey: 'ObjectName',
  });
};

vwUserActionHistory.SetFunctions = (Models) => {
  vwUserActionHistory.findAllNew = async function (Option) {
    const result = await vwUserActionHistory.findAll({
      ...Option,
      include: [
        {
          model: Models.Users,
          as: 'Users',
          attributes: Models.Users.DefaultFields,
        },
        {
          model: Models.ObjectNameDic,
          as: 'ObjectNameDic',
          attributes: ['Id', 'ObjectName', 'ObjectNameMn'],
        },
        {
          model: Models.Patient,
          as: 'Patient',
          attributes: Models.Patient.DefaultFields,
        },
        {
          model: Models.DoctorsProfile,
          as: 'DoctorsProfile',
          attributes: Models.DoctorsProfile.DefaultFields,
        },
      ],
    });
    return result;
  };
};

module.exports = vwUserActionHistory;
