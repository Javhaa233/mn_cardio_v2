const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');
const Op = Sequelize.Op;

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class DictSoumDistrict extends Sequelize.Model {}
DictSoumDistrict.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },
    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    name: { type: Sequelize.STRING },
    short_name: { type: Sequelize.STRING },
    id_province: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'DictSoumDistrict',
    modelName: 'DictSoumDistrict',
    timestamps: false,
  }
);
DictSoumDistrict.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'name',
  'id_province',
];

DictSoumDistrict.SetAssocations = (Models) => {
  DictSoumDistrict.belongsTo(Models.DictProvinceCity, {
    as: 'DictProvinceCity',
    foreignKey: 'id_province',
  });
};

DictSoumDistrict.SetFunctions = (Models) => {
  DictSoumDistrict.findAllNew = async function (Option) {
    const result = await DictSoumDistrict.findAll({
      ...Option,
      include: [
        {
          model: Models.DictProvinceCity,
          as: 'DictProvinceCity',
          attributes: ['id_data', 'name'],
        },
      ],
    });
    return result;
  };
};
module.exports = DictSoumDistrict;
