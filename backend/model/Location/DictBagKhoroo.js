const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class DictBagKhoroo extends Sequelize.Model {}
DictBagKhoroo.init(
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
    id_soum: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'DictBagKhoroo',
    modelName: 'DictBagKhoroo',
    timestamps: false,
  }
);
DictBagKhoroo.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'name',
  'id_soum',
];

DictBagKhoroo.SetAssocations = (Models) => {
  DictBagKhoroo.belongsTo(Models.DictSoumDistrict, {
    as: 'DictSoumDistrict',
    foreignKey: 'id_soum',
  });
};

DictBagKhoroo.SetFunctions = (Models) => {
  DictBagKhoroo.findAllNew = async function (Option) {
    const result = await DictBagKhoroo.findAll({
      ...Option,
      include: [
        {
          model: Models.DictSoumDistrict,
          as: 'DictSoumDistrict',
          attributes: ['id_data', 'name'],
        },
      ],
    });
    return result;
  };
};

module.exports = DictBagKhoroo;
