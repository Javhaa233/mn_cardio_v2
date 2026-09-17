const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class LookupDoctorTeam extends Sequelize.Model {}
LookupDoctorTeam.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },
    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    doctor_id: { type: Sequelize.INTEGER },
    team_id: { type: Sequelize.INTEGER },
    privilege_add_patient: { type: Sequelize.INTEGER },
    privilege_admin: { type: Sequelize.INTEGER },
    privilege_delete_patient: { type: Sequelize.INTEGER },
    EndDate: { type: Sequelize.DATE },
    StartDate: { type: Sequelize.DATE },
  },
  {
    sequelize,
    tableName: 'LookupDoctorTeam',
    modelName: 'LookupDoctorTeam',
    timestamps: false,
  }
);
LookupDoctorTeam.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'doctor_id',
  'team_id',
  'privilege_add_patient',
  'privilege_admin',
  'privilege_delete_patient',
  'EndDate',
  'StartDate',
];

LookupDoctorTeam.SetAssocations = (Models) => {
  LookupDoctorTeam.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'doctor_id',
  });
  LookupDoctorTeam.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'id',
  });
  LookupDoctorTeam.belongsTo(Models.DoctorsTeam, {
    as: 'DoctorsTeam',
    foreignKey: 'team_id',
  });
};
LookupDoctorTeam.SetFunctions = (Models) => {
  LookupDoctorTeam.createNew = async function (Data, ReturnIdField) {
    console.log({ Data });
    if (Data.doctor_id && Data.team_id) {
      const check = await LookupDoctorTeam.count({
        where: { team_id: Data.team_id, doctor_id: Data.doctor_id },
      }).then(async (item) => {
        return item > 0 ? false : true;
      });
      if (!check) throw { Message: 'Эмчийг багт нэмсэн байна' };
      // The id comes from the INSERT, not from a follow-up query.
      //
      // This used to be `SELECT TOP 1 <pk> FROM [LookupDoctorTeam] ORDER BY <pk> DESC` run
      // immediately after the create. Two concurrent creates both read the HIGHER
      // id, so the loser returned the winner's row and attached its child rows -
      // files, lookups, many-to-many links - to the wrong record. Reproduced
      // against the database: two creates in one transaction returned 5 and 6,
      // while the old query returned 6 for both.
      //
      // create() already carries the generated key: ReturnIdField is declared
      // autoIncrement, and Sequelize reads it back through OUTPUT INSERTED.
      const Created = await LookupDoctorTeam.create(Data);

      return Created[ReturnIdField];
    } else {
      throw { Message: 'Information is missing' };
    }
  };
  LookupDoctorTeam.findAllNew = async function (Option) {
    var Result = await LookupDoctorTeam.findAll({
      ...Option,
      include: [
        {
          model: Models.DoctorsProfile,
          as: 'DoctorsProfile',
          attributes: [
            'lastname',
            'firstname',
            'id_data',
            'id',
            'organisation',
            'profession',
            'email',
            'telephone',
          ],
          include: [
            {
              model: Models.Organization,
              as: 'Organization',
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
              ],
            },
            {
              model: Models.vwProvince,
              as: 'Province',
            },
          ],
        },
        {
          model: Models.DoctorsTeam,
          as: 'DoctorsTeam',
          attributes: ['name', 'extra_info', 'date_creation'],
        },
        { model: Models.Users, as: 'Users', attributes: ['UserName', 'Id'] },
      ],
    });
    return Result;
  };
};

module.exports = LookupDoctorTeam;
