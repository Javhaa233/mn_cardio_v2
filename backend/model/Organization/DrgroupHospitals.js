const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class DrgroupHospitals extends Sequelize.Model {}
DrgroupHospitals.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },
    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    name: { type: Sequelize.STRING },
    dsid: { type: Sequelize.INTEGER },
    haid: { type: Sequelize.INTEGER },
    khbid: { type: Sequelize.INTEGER },
    level: { type: Sequelize.STRING },
    province: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'DrgroupHospitals',
    modelName: 'DrgroupHospitals',
    timestamps: false,
  }
);
DrgroupHospitals.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'name',
  'dsid',
  'haid',
  'khbid',
  'level',
  'province',
];
DrgroupHospitals.SetAssocations = (Models) => {
  DrgroupHospitals.belongsTo(Models.DictBagKhoroo, {
    as: 'DictBagKhoroo',
    foreignKey: 'khbid',
  });
  DrgroupHospitals.belongsTo(Models.DictProvinceCity, {
    as: 'DictProvinceCity',
    foreignKey: 'haid',
  });
  DrgroupHospitals.belongsTo(Models.DictSoumDistrict, {
    as: 'DictSoumDistrict',
    foreignKey: 'dsid',
  });
};

DrgroupHospitals.SetFunctions = (Models) => {
  DrgroupHospitals.findAllNew = async function (Option) {
    const result = await DrgroupHospitals.findAll({
      ...Option,
      include: [
        { model: Models.DictBagKhoroo, as: 'DictBagKhoroo' },
        { model: Models.DictProvinceCity, as: 'DictProvinceCity' },
        { model: Models.DictSoumDistrict, as: 'DictSoumDistrict' },
      ],
    });
    return result;
  };
};
module.exports = DrgroupHospitals;
