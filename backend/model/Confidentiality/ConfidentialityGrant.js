const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

/**
 * Break-glass access to a classified record: named, time-boxed, audited.
 *
 * A clinician in an emergency has to be able to open a classified record, and
 * the system has to record that they did. A design with no such path does not
 * prevent the access - it gets worked around by sharing logins, which is worse
 * than the problem it was meant to solve.
 *
 * ExpireDate matters: a grant with no expiry is a permission, and break-glass
 * that never closes is just a slower way of declassifying the record.
 */
class ConfidentialityGrant extends Sequelize.Model {}

ConfidentialityGrant.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    PatientId: { type: Sequelize.INTEGER },
    UserId: { type: Sequelize.INTEGER },
    GrantedByUserId: { type: Sequelize.INTEGER },
    GrantedDate: { type: Sequelize.DATE },
    ExpireDate: { type: Sequelize.DATE },
    Reason: { type: Sequelize.STRING },
    RevokedDate: { type: Sequelize.DATE },
  },
  {
    sequelize,
    tableName: 'ConfidentialityGrant',
    modelName: 'ConfidentialityGrant',
    timestamps: false,
  }
);

ConfidentialityGrant.SearchField = ['PatientId', 'UserId'];

module.exports = ConfidentialityGrant;
