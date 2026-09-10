const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');
const Op = Sequelize.Op;

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class DrgroupBranches extends Sequelize.Model {}
DrgroupBranches.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },
    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    hospital_id: { type: Sequelize.INTEGER },
    name: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'DrgroupBranches',
    modelName: 'DrgroupBranches',
    timestamps: false,
  }
);
DrgroupBranches.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',

  'rec_status',
  'hospital_id',
  'name',
];
DrgroupBranches.SetAssocations = (Models) => {
  DrgroupBranches.belongsTo(Models.DrgroupHospitals, {
    as: 'DrgroupHospitals',
    foreignKey: 'hospital_id',
  });
};

DrgroupBranches.SetFunctions = (Models) => {
  DrgroupBranches.findAllNew = async function (Option) {
    const result = await DrgroupBranches.findAll({
      ...Option,
      include: [
        {
          model: Models.DrgroupHospitals,
          as: 'DrgroupHospitals',
          attributes: ['id_data', 'name'],
        },
      ],
    });
    return result;
  };
};
module.exports = DrgroupBranches;
