const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

/**
 * A registered FCM / APNs device token.
 *
 * UserId means Users.Id when UserType is 'S' and Patient.id_data when it is
 * 'P'. The pair is mandatory - those two id spaces collide, so an unqualified
 * id would deliver one person's clinical notifications to another.
 *
 * DELIBERATELY ABSENT FROM ModelConfigs/mainConfig.js. Registering a config
 * would expose this table through the generic /api/BaseObject CRUD engine -
 * list, export to Excel, edit - and it is a credential store: a push token lets
 * its holder send a notification that appears to come from MnCardio. It is
 * reached only through helper/PushHelper.js, which never returns the token
 * itself even to the device's own owner.
 *
 * config/DB.js auto-discovers everything under model/, so no registration is
 * needed for the model to exist.
 */
class PushDevice extends Sequelize.Model {}

PushDevice.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    UserType: { type: Sequelize.STRING },
    UserId: { type: Sequelize.INTEGER },
    Platform: { type: Sequelize.STRING },
    Token: { type: Sequelize.STRING },
    DeviceId: { type: Sequelize.STRING },
    AppVersion: { type: Sequelize.STRING },
    Locale: { type: Sequelize.STRING },
    IsActive: { type: Sequelize.BOOLEAN },
    LastSeenDate: { type: Sequelize.DATE },
    FailCount: { type: Sequelize.INTEGER },
    DisabledReason: { type: Sequelize.STRING },
    CreateDate: { type: Sequelize.DATE },
    UpdateDate: { type: Sequelize.DATE },
  },
  {
    sequelize,
    tableName: 'PushDevice',
    modelName: 'PushDevice',
    timestamps: false,
  }
);

// Token is not searchable on purpose: there is no legitimate reason to look a
// person up by their push token, and making it searchable invites exactly that.
PushDevice.SearchField = ['UserType', 'UserId', 'Platform', 'DeviceId'];

module.exports = PushDevice;
