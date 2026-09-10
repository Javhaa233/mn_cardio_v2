const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');
const Op = Sequelize.Op;

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class AdviceViews extends Sequelize.Model {}
AdviceViews.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    AdviceId: { type: Sequelize.INTEGER },
    UserId: { type: Sequelize.INTEGER },
    ViewDate: { type: Sequelize.DATE },
  },
  {
    sequelize,
    tableName: 'AdviceViews',
    modelName: 'AdviceViews',
    timestamps: false,
  }
);
AdviceViews.SearchField = ['Id', 'AdviceId', 'UserId', 'ViewDate'];

AdviceViews.SetAssocations = (Models) => {
  AdviceViews.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'UserId',
    targetKey: 'Id',
  });
  AdviceViews.belongsTo(Models.Advice, {
    as: 'Advice',
    foreignKey: 'AdviceId',
  });
};

AdviceViews.SetFunctions = (Models) => {
  AdviceViews.findAllNew = async function (Option) {
    const result = await AdviceViews.findAll({
      ...Option,
      include: [
        {
          model: Models.Users,
          as: 'Users',
          attributes: ['Id', 'LastName', 'FirstName', 'UserName'],
        },
        {
          model: Models.Advice,
          as: 'Advice',
          include: [
            {
              model: Models.Patient,
              as: 'Patient',
              attributes: ['id_data', 'p_lastname', 'p_birthday', 'p_gender', 'p_firstname'],
              include: [{ model: Models.vwProvince, as: 'Province' }],
            },
          ],
        },
      ],
    });
    return result;
  };
};

module.exports = AdviceViews;
