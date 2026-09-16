const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class UserRequests extends Sequelize.Model {}

UserRequests.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

    UserName: { type: Sequelize.STRING },
    Registration: { type: Sequelize.STRING },
    LastName: { type: Sequelize.STRING },
    FirstName: { type: Sequelize.STRING },
    Profession: { type: Sequelize.STRING },
    License: { type: Sequelize.STRING },
    Email: { type: Sequelize.STRING },
    Telephone: { type: Sequelize.STRING },
    OrgName: { type: Sequelize.STRING },
    OrgAddress: { type: Sequelize.STRING },
    addr_prov_city: { type: Sequelize.INTEGER },
    addr_soum_dist: { type: Sequelize.INTEGER },
    addr_bag_khoroo: { type: Sequelize.INTEGER },
    CreateDate: { type: Sequelize.DATE },
    DeclineUserId: { type: Sequelize.INTEGER },
    ConfirmUserId: { type: Sequelize.INTEGER },
    IsActive: { type: Sequelize.STRING },
    AppId: { type: Sequelize.INTEGER },

    // scripts/add_userrequest_approval_columns.sql. PasswordHash is in that
    // table too and is left off this model on purpose - see
    // helper/RegistrationRequest.js.
    OrganizationId: { type: Sequelize.INTEGER },
    DecisionDate: { type: Sequelize.DATE },
    DeclineReason: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'UserRequests',
    modelName: 'UserRequests',
    timestamps: false,
  }
);

UserRequests.SearchField = ['UserName', 'Email', 'FirstName', 'LastName'];

UserRequests.DetaultFields = ['Id', 'UserName', 'Email', 'FirstName', 'LastName'];

UserRequests.SetAssocations = (Models) => {
  UserRequests.belongsTo(Models.DictProvinceCity, {
    as: 'DictProvinceCity',
    foreignKey: 'addr_prov_city',
  });

  UserRequests.belongsTo(Models.DictSoumDistrict, {
    as: 'DictSoumDistrict',
    foreignKey: 'addr_soum_dist',
  });

  UserRequests.belongsTo(Models.DictBagKhoroo, {
    as: 'DictBagKhoroo',
    foreignKey: 'addr_bag_khoroo',
  });
  UserRequests.belongsTo(Models.Apps, {
    as: 'Apps',
    foreignKey: 'AppId',
  });
  UserRequests.belongsTo(Models.Organization, {
    as: 'Organization',
    foreignKey: 'OrganizationId',
    targetKey: 'Id',
  });
};

UserRequests.SetFunctions = (Models) => {
  UserRequests.findAllDetail = async function (Option) {
    const result = await UserRequests.findAll({
      ...Option,
      include: [{ model: Models.Apps, as: 'Apps' }],
    });
    return result;
  };
};
module.exports = UserRequests;
