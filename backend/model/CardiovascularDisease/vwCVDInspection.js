const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');
const Op = Sequelize.Op;

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class vwCVDInspection extends Sequelize.Model {}

vwCVDInspection.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true },
    MonitoringId: { type: Sequelize.INTEGER },
    Score: { type: Sequelize.FLOAT },
    Risk: { type: Sequelize.FLOAT },
    DoctorAdvice: { type: Sequelize.TEXT },
    CreateDate: { type: Sequelize.DATE },
    CreateUserId: { type: Sequelize.INTEGER },
    UserName: { type: Sequelize.STRING },
    firstname: { type: Sequelize.STRING },
    lastname: { type: Sequelize.STRING },
    personal_number: { type: Sequelize.STRING },
    email: { type: Sequelize.STRING },
    telephone: { type: Sequelize.STRING },
    date_creation: { type: Sequelize.DATE },
    MonitoringUserId: { type: Sequelize.STRING },
    PatRegNo: { type: Sequelize.STRING },
    ParentOrganizationId: { type: Sequelize.INTEGER },
    OrganizationId: { type: Sequelize.INTEGER },
    ProvinceCityId: { type: Sequelize.INTEGER },
    SoumDistrictId: { type: Sequelize.INTEGER },
    BagKhorooId: { type: Sequelize.INTEGER },
    StartedDate: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'vwCVDInspection',
    modelName: 'vwCVDInspection',
    timestamps: false,
  }
);

vwCVDInspection.SearchField = ['AdviceId', 'Body'];

vwCVDInspection.SetAssocations = (Models) => {
  vwCVDInspection.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'CreateUserId',
    targetKey: 'Id',
  });
  vwCVDInspection.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'CreateUserId',
    targetKey: 'UserId',
  });
  vwCVDInspection.belongsTo(Models.DoctorsProfile, {
    as: 'MontoringDoctor',
    foreignKey: 'MonitoringUserId',
    targetKey: 'UserId',
  });
};

vwCVDInspection.SetFunctions = (Models) => {
  vwCVDInspection.findAllNew = async function (Option) {
    const NewOption = { ...Option, order: [['Id', 'DESC']] };
    const result = await vwCVDInspection.findAll({
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
        {
          model: Models.DoctorsProfile,
          as: 'MontoringDoctor',
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

    return result;
  };
};

module.exports = vwCVDInspection;
