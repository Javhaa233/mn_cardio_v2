const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class PatientMonitoringDoctor extends Sequelize.Model {}

PatientMonitoringDoctor.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },
    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    user_id: { type: Sequelize.INTEGER },
    is_active: { type: Sequelize.INTEGER },
    patient_id: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'PatientMonitoringDoctor',
    modelName: 'PatientMonitoringDoctor',
    timestamps: false,
  }
);
/**
 * Columns the free-text box searches (ModelHelper.GetFindOption ORs a
 * `LIKE '%text%'` across every entry - it is the only consumer of this array).
 *
 * Same two corrections as DoctorsTeamPatient:
 *
 * 1. The int and date columns are gone. `id_data`, `id`, `id_group`,
 *    `rec_status`, `user_id`, `is_active`, `patient_id`, `date_creation` and
 *    `date_modif` were all listed here, and MSSQL fails outright on
 *    `<int> LIKE '%Бат%'`, so a search for any non-numeric term could not work.
 * 2. The patient's name and register are in, addressed through the association
 *    with Sequelize's `$Assoc.column$` form. Searching a monitoring list by the
 *    patient's name is the whole point; before this it matched only the
 *    register number, and only because the screen filtered on that column
 *    directly rather than going through SearchText.
 */
PatientMonitoringDoctor.SearchField = [
  'user_mod',
  '$Patient.p_lastname$',
  '$Patient.p_firstname$',
  '$Patient.p_registration$',
];

PatientMonitoringDoctor.SetAssocations = (Models) => {
  PatientMonitoringDoctor.belongsTo(Models.vwVisitComments, {
    as: 'vwVisitComments',
    foreignKey: 'patient_id',
    targetKey: 'PatientId',
  });

  PatientMonitoringDoctor.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'patient_id',
  });

  PatientMonitoringDoctor.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'user_id',
    targetKey: 'Id',
  });

  PatientMonitoringDoctor.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorProfile',
    foreignKey: 'user_id',
    targetKey: 'UserId',
  });
};

PatientMonitoringDoctor.SetFunctions = (Models) => {
  PatientMonitoringDoctor.createNew = async function (Data, ReturnIdField) {
    await PatientMonitoringDoctor.create(Data);
    const [ReturnData] = await sequelize.query(
      'SELECT TOP 1  ' +
        ReturnIdField +
        ' FROM [PatientMonitoringDoctor] ORDER BY ' +
        ReturnIdField +
        ' DESC '
    );
    return ReturnData[0][ReturnIdField];
  };

  PatientMonitoringDoctor.findAllNew = async function (Option) {
    try {
      const result = await PatientMonitoringDoctor.findAll({
        ...Option,
        include: [
          {
            model: Models.Patient,
            as: 'Patient',
            attributes: ['id_data', 'p_lastname', 'p_firstname', 'p_registration', 'FullName'],
          },
          {
            model: Models.DoctorsProfile,
            as: 'DoctorProfile',
            attributes: ['id_data', 'id', 'lastname', 'firstname'],
          },
          {
            model: Models.Users,
            as: 'Users',
            attributes: ['Id', 'UserName', 'email'],
          },
          {
            model: Models.vwVisitComments,
            as: 'vwVisitComments',
          },
        ],
      });
      return result;
    } catch (ex) {
      console.log(ex);
      return [];
    }
  };
};

module.exports = PatientMonitoringDoctor;