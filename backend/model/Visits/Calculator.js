const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');
const Op = Sequelize.Op;

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class Calculator extends Sequelize.Model {}
Calculator.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },
    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    calculator: { type: Sequelize.STRING },
    user_id: { type: Sequelize.INTEGER },
    patient_id: { type: Sequelize.INTEGER },
    ref: { type: Sequelize.STRING },
    score: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'Calculator',
    modelName: 'Calculator',
    timestamps: false,
  }
);

Calculator.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',

  'rec_status',
  'calculator',
  'user_id',
  'patient_id',
  'ref',
  'score',
];

Calculator.SetAssocations = (Models) => {
  Calculator.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'user_id',
    targetKey: 'Id',
  });

  Calculator.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'user_id',
    targetKey: 'UserId',
  });
};

Calculator.SetFunctions = (Models) => {
  Calculator.findAllNew = async function (Option) {
    const result = await Calculator.findAll({
      ...Option,
      include: [
        {
          model: Models.Users,
          as: 'Users',
          attributes: ['Id', 'LastName', 'FirstName'],
        },
        {
          model: Models.DoctorsProfile,
          as: 'DoctorsProfile',
          attributes: ['firstname', 'lastname', 'id_data'],
        },
      ],
    });
    return result;
  };
};

module.exports = Calculator;
