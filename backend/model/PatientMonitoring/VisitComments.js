const Sequelize = require('sequelize');

const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class VisitComments extends Sequelize.Model {}

VisitComments.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },
    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    user_id: { type: Sequelize.INTEGER },
    patient_user_id: { type: Sequelize.INTEGER },
    is_doctor: { type: Sequelize.INTEGER },
    patient_id: { type: Sequelize.INTEGER },
    comment: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'VisitComments',
    modelName: 'VisitComments',
    timestamps: false,
  }
);

VisitComments.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'patient_user_id',
  'user_id',
  'is_doctor',
  'patient_id',
  'comment',
];

VisitComments.SetAssocations = (Models) => {
  VisitComments.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'patient_id',
  });

  VisitComments.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'user_id',
    targetKey: 'UserId',
  });

  VisitComments.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'user_id',
  });

  VisitComments.belongsTo(Models.PatientUsers, {
    as: 'PatientUsers',
    foreignKey: 'patient_user_id',
  });
};

VisitComments.SetFunctions = (Models) => {
  VisitComments.findAllNew = async function (Option) {
    var Result = await VisitComments.findAll({
      ...Option,
      order: [['id_data', 'DESC']],
      include: [
        {
          model: Models.Users,
          as: 'Users',
          attributes: ['Id', 'UserName', 'email'],
        },
        {
          model: Models.PatientUsers,
          as: 'PatientUsers',
          attributes: ['Id', 'UserName', 'FirstName', 'LastName', 'Email'],
        },
        {
          model: Models.DoctorsProfile,
          as: 'DoctorsProfile',
          attributes: ['id_data', 'firstname', 'lastname'],
        },
        {
          model: Models.Patient,
          as: 'Patient',
          attributes: ['id_data', 'p_lastname', 'p_firstname', 'p_registration'],
        },
      ],
    });
    return Result;
  };

  VisitComments.createNew = async function (Data, ReturnIdField) {
    await VisitComments.create(Data);
    const [ReturnData] = await sequelize.query(
      'SELECT TOP 1  ' +
        ReturnIdField +
        ' FROM [VisitComments] ORDER BY ' +
        ReturnIdField +
        ' DESC '
    );
    return ReturnData[0][ReturnIdField];
  };
};

module.exports = VisitComments;
