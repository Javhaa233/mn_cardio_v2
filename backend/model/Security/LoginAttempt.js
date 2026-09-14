const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

/**
 * One row per login attempt, successful or not.
 *
 * NO PASSWORD IS STORED HERE in any form - not the value, not a hash, not its
 * length. The row records that an attempt happened, by whom, from where.
 *
 * FailReason is recorded and NEVER returned to a caller: the API answer stays
 * the single opaque "Login name or password is incorrect" whether the account
 * is unknown or the password was wrong. This column is for whoever investigates
 * afterwards.
 *
 * Not registered in ModelConfigs/mainConfig.js - exposing a login-attempt log
 * through generic CRUD would hand an attacker a search tool over usernames.
 */
class LoginAttempt extends Sequelize.Model {}

LoginAttempt.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    UserType: { type: Sequelize.STRING },
    UserName: { type: Sequelize.STRING },
    UserId: { type: Sequelize.INTEGER },
    AttemptDate: { type: Sequelize.DATE },
    Success: { type: Sequelize.BOOLEAN },
    FailReason: { type: Sequelize.STRING },
    IpAddress: { type: Sequelize.STRING },
    UserAgent: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'LoginAttempt',
    modelName: 'LoginAttempt',
    timestamps: false,
  }
);

LoginAttempt.SearchField = ['UserType', 'UserName', 'FailReason'];

module.exports = LoginAttempt;
