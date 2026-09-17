const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');
const Op = Sequelize.Op;

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class BloodStroke extends Sequelize.Model {}
BloodStroke.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },
    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    type: { type: Sequelize.STRING },
    date: { type: Sequelize.DATE },
    inr_value: { type: Sequelize.STRING },
    OrganizationId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'BloodStroke',
    modelName: 'BloodStroke',
    timestamps: false,
  }
);

BloodStroke.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'type',
  'date',
  'inr_value',
];

BloodStroke.SetAssocations = (Models) => {
  BloodStroke.belongsTo(Models.vwBloodStrokeType, {
    as: 'BloodStrokeType',
    foreignKey: 'type',
    targetKey: 'value',
  });

  BloodStroke.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'PatientId',
    targetKey: 'id_data',
  });

  BloodStroke.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'id',
    targetKey: 'Id',
  });

  BloodStroke.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'id',
    targetKey: 'UserId',
  });

  BloodStroke.belongsTo(Models.Organization, {
    as: 'Organization',
    foreignKey: 'OrganizationId',
    targetKey: 'Id',
  });
};

BloodStroke.SetFunctions = (Models) => {
  BloodStroke.createNew = async function (Data, ReturnIdField) {
    // The id comes from the INSERT, not from a follow-up query.
    //
    // This used to be `SELECT TOP 1 <pk> FROM [BloodStroke] ORDER BY <pk> DESC` run
    // immediately after the create. Two concurrent creates both read the HIGHER
    // id, so the loser returned the winner's row and attached its child rows -
    // files, lookups, many-to-many links - to the wrong record. Reproduced
    // against the database: two creates in one transaction returned 5 and 6,
    // while the old query returned 6 for both.
    //
    // create() already carries the generated key: ReturnIdField is declared
    // autoIncrement, and Sequelize reads it back through OUTPUT INSERTED.
    const Created = await BloodStroke.create(Data);

    return Created[ReturnIdField];
  };

  BloodStroke.findAllNew = async function (Option) {
    var Result = await BloodStroke.findAll({
      ...Option,
      include: [
        {
          model: Models.Users,
          as: 'Users',
          attributes: ['UserName', 'Id'],
        },
        {
          model: Models.DoctorsProfile,
          as: 'DoctorsProfile',
          attributes: Models.DoctorsProfile.DefaultFields,
        },

        {
          model: Models.vwBloodStrokeType,
          as: 'BloodStrokeType',
        },

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
          model: Models.Patient,
          as: 'Patient',
          attributes: Models.Patient.DefaultFields,
        },
      ],
    });
    return Result;
  };
};

module.exports = BloodStroke;
