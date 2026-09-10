const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class PatientMonitoring extends Sequelize.Model {}

PatientMonitoring.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },
    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    blood_pressure: { type: Sequelize.STRING },
    blood_pressure2: { type: Sequelize.STRING },
    comment: { type: Sequelize.STRING },
    date: { type: Sequelize.DATE },
    inr: { type: Sequelize.STRING },
    patient_id: { type: Sequelize.INTEGER },
    patient_registration: { type: Sequelize.STRING },
    pulse: { type: Sequelize.STRING },
    time: { type: Sequelize.TIME },
    weight: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'PatientMonitoring',
    modelName: 'PatientMonitoring',
    timestamps: false,
  }
);

PatientMonitoring.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'blood_pressure',
  'blood_pressure2',
  'comment',
  'date',
  'inr',
  'patient_id',
  'pulse',
  'time',
  'weight',
];

PatientMonitoring.createNew = async function (Data, ReturnIdField) {
  await PatientMonitoring.create(Data);
  const [ReturnData] = await sequelize.query(
    'SELECT TOP 1  ' +
      ReturnIdField +
      ' FROM [PatientMonitoring] ORDER BY ' +
      ReturnIdField +
      ' DESC '
  );
  return ReturnData[0][ReturnIdField];
};

PatientMonitoring.findAllNew = async function (Option) {
  try {
    const result = await PatientMonitoring.findAll({
      ...Option,
      attributes: {
        include: [
          [sequelize.literal("(CONCAT(blood_pressure,'/',blood_pressure2))"), 'BloodPressure'],
        ],
      },
    });
    return result;
  } catch (ex) {
    console.log(ex);
    return [];
  }
};

module.exports = PatientMonitoring;
