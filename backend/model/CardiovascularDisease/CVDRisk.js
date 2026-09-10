const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class CVDRisk extends Sequelize.Model {}
CVDRisk.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

    MonitoringId: { type: Sequelize.INTEGER },
    Score: { type: Sequelize.INTEGER },
    Risk: { type: Sequelize.INTEGER },
    DoctorAdvice: { type: Sequelize.TEXT },

    CreateDate: { type: Sequelize.DATE },
    CreateUserId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'CVDRisk',
    modelName: 'CVDRisk',
    timestamps: false,
  }
);

CVDRisk.SetAssocations = (Models) => {
  CVDRisk.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'CreateUserId',
    targetKey: 'Id',
  });
  CVDRisk.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'CreateUserId',
    targetKey: 'UserId',
  });
};

CVDRisk.SetFunctions = (Models) => {
  CVDRisk.findAllNew = async function (Option) {
    const NewOption = { ...Option, order: [['Id', 'DESC']] };
    const result = await CVDRisk.findAll({
      ...NewOption,
      include: [
        {
          model: Models.Users,
          as: 'Users',
          attributes: Models.Users.DetaultFields,
        },
        {
          model: Models.DoctorsProfile,
          as: 'DoctorsProfile',
          attributes: Models.DoctorsProfile.DefaultFields,
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
          ],
        },
      ],
    });
    // let newRes = [];
    // for (let i = 0; i < result.length; i++) {
    //   // newRes.push({
    //   //   ...result[i].dataValues,
    //   //   CVDHistory: await result[i].getCVDHistory(),
    //   // });
    //   result[i].dataValues.CVDHistory1 = await result[i].getCVDHistory();
    // }

    return result;
  };
};

module.exports = CVDRisk;
