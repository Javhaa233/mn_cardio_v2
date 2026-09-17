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
  // The id comes from the INSERT, not from a follow-up query.
  //
  // This used to be `SELECT TOP 1 <pk> FROM [PatientMonitoring] ORDER BY <pk> DESC` run
  // immediately after the create. Two concurrent creates both read the HIGHER
  // id, so the loser returned the winner's row and attached its child rows -
  // files, lookups, many-to-many links - to the wrong record. Reproduced
  // against the database: two creates in one transaction returned 5 and 6,
  // while the old query returned 6 for both.
  //
  // create() already carries the generated key: ReturnIdField is declared
  // autoIncrement, and Sequelize reads it back through OUTPUT INSERTED.
  const Created = await PatientMonitoring.create(Data);

  return Created[ReturnIdField];
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
