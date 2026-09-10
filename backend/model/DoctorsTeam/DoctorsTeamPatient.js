const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class DoctorsTeamPatient extends Sequelize.Model {}
DoctorsTeamPatient.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },
    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    patient_id: { type: Sequelize.INTEGER },
    team_id: { type: Sequelize.INTEGER },
    comment: { type: Sequelize.STRING },
    EndDate: { type: Sequelize.DATE },
    StartDate: { type: Sequelize.DATE },
  },
  {
    sequelize,
    tableName: 'DoctorsTeamPatient',
    modelName: 'DoctorsTeamPatient',
    timestamps: false,
  }
);
/**
 * Columns the free-text box searches (ModelHelper.GetFindOption ORs a
 * `LIKE '%text%'` across every entry - it is the only consumer of this array).
 *
 * Two changes from the original list, both required for the patient list's
 * search box to work at all:
 *
 * 1. The int and date columns are gone. `id_data`, `id`, `id_group`,
 *    `patient_id`, `team_id`, `rec_status`, `date_creation` and `date_modif`
 *    were all in here, and MSSQL fails outright on `<int> LIKE '%Бат%'`
 *    ("Conversion failed when converting the varchar value ... to data type
 *    int"), so any non-numeric search term errored the whole query.
 * 2. The patient's name and register are in. Searching a list of patients by
 *    the patient's name is the entire point, and those live on the association,
 *    which Sequelize addresses with the `$Assoc.column$` form.
 */
DoctorsTeamPatient.SearchField = [
  'comment',
  'user_mod',
  '$Patient.p_lastname$',
  '$Patient.p_firstname$',
  '$Patient.p_registration$',
];

DoctorsTeamPatient.SetAssocations = (Models) => {
  DoctorsTeamPatient.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'patient_id',
    targetKey: 'id_data',
  });
  DoctorsTeamPatient.belongsTo(Models.Users, { as: 'Users', foreignKey: 'id' });
};

DoctorsTeamPatient.SetFunctions = (Models) => {
  DoctorsTeamPatient.createNew = async function (Data, ReturnIdField) {
    if (Data.team_id && Data.patient_id) {
      const check = await DoctorsTeamPatient.count({
        where: {
          team_id: Data.team_id,
          patient_id: Data.patient_id,
          rec_status: { [Sequelize.Op.ne]: '2' },
        },
      }).then(async (item) => {
        return item > 0 ? false : true;
      });
      if (!check) throw { Message: 'Иргэнийг багт нэмсэн байна' };

      await DoctorsTeamPatient.create(Data);
      const [ReturnData] = await sequelize.query(
        'SELECT TOP 1  ' +
          ReturnIdField +
          ' FROM [DoctorsTeamPatient] ORDER BY ' +
          ReturnIdField +
          ' DESC '
      );

      return ReturnData[0][ReturnIdField];
    } else {
      throw { Message: 'Information is missing' };
    }
  };
  DoctorsTeamPatient.findAllNew = async function (Option) {
    var Result = await DoctorsTeamPatient.findAll({
      ...Option,
      include: [
        {
          model: Models.Patient,
          as: 'Patient',
          include: [
            {
              model: Models.DictProvinceCity,
              as: 'DictProvinceCity',
              attributes: ['id_data', 'name', 'date_creation'],
            },
            {
              model: Models.DictSoumDistrict,
              as: 'DictSoumDistrict',
              attributes: ['id_data', 'name'],
            },
            {
              model: Models.DictBagKhoroo,
              as: 'DictBagKhoroo',
              attributes: ['id_data', 'name'],
            },
            { model: Models.vwGender, as: 'Gender' },
            { model: Models.vwProvince, as: 'Province' },
          ],
        },
        { model: Models.Users, as: 'Users', attributes: ['Id', 'UserName'] },
      ],
    });
    return Result;
  };
};

module.exports = DoctorsTeamPatient;
