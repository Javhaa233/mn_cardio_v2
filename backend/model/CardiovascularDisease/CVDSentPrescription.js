const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class CVDSentPrescription extends Sequelize.Model {}
CVDSentPrescription.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

    MonitoringId: { type: Sequelize.INTEGER },
    SentData: { type: Sequelize.STRING },
    ResData: { type: Sequelize.STRING },
    RequestStatus: { type: Sequelize.STRING },
    DoctorRegNo: { type: Sequelize.STRING },

    CreateDate: { type: Sequelize.DATE },
    CreateUserId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'CVDSentPrescription',
    modelName: 'CVDSentPrescription',
    timestamps: false,
  }
);

CVDSentPrescription.SetAssocations = (Models) => {
  CVDSentPrescription.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'CreateUserId',
    targetKey: 'Id',
  });
  CVDSentPrescription.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'CreateUserId',
    targetKey: 'UserId',
  });
};

CVDSentPrescription.SetFunctions = (Models) => {
  CVDSentPrescription.findAllNew = async function (Option) {
    // var Option = { ...Option, order: [["Id", "DESC"]] };
    const result = await CVDSentPrescription.findAll({
      ...Option,
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
              attributes: ['Id', 'Name'],
            },
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
    });

    return result;
  };
};

module.exports = CVDSentPrescription;
