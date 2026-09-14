const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

/**
 * One row per issued token pair, so a single session can be cancelled.
 *
 * Before this, revoking one session meant rotating JWT_PASS and logging
 * everyone out, and LogOut was a stub that returned success without doing
 * anything - a stolen phone could not be cut off.
 *
 * Read through helper/SessionStore.js, which keeps the revoked-and-unexpired
 * jti values in memory and refreshes them periodically. Nothing queries this
 * table per request: that would add a read in front of every route on the
 * system to answer "no" almost every time.
 *
 * Not registered in ModelConfigs/mainConfig.js - session identifiers are
 * credentials-adjacent and have no business in a generic CRUD screen.
 */
class UserSession extends Sequelize.Model {}

UserSession.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    UserType: { type: Sequelize.STRING },
    UserId: { type: Sequelize.INTEGER },
    Jti: { type: Sequelize.STRING },
    RefreshJti: { type: Sequelize.STRING },
    IssuedDate: { type: Sequelize.DATE },
    ExpireDate: { type: Sequelize.DATE },
    LastSeenDate: { type: Sequelize.DATE },
    RevokedDate: { type: Sequelize.DATE },
    RevokedReason: { type: Sequelize.STRING },
    DeviceName: { type: Sequelize.STRING },
    IpAddress: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'UserSession',
    modelName: 'UserSession',
    timestamps: false,
  }
);

UserSession.SearchField = ['UserType', 'UserId', 'RevokedReason'];

module.exports = UserSession;
