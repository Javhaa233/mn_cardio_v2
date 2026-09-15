const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

/**
 * Local field -> international code (LOINC, SNOMED CT) plus its UCUM unit.
 *
 * Created by scripts/add_code_mapping.sql. Read that file before changing
 * anything here - in particular, `Verified` is not a status field but a safety
 * interlock: an unverified row supplies a DISPLAY LABEL and nothing else, and
 * no LOINC coding is emitted for it.
 */
class CodeMapping extends Sequelize.Model {}

CodeMapping.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    LocalObject: { type: Sequelize.STRING },
    LocalCode: { type: Sequelize.STRING },
    System: { type: Sequelize.STRING },
    Code: { type: Sequelize.STRING },
    Display: { type: Sequelize.STRING },
    Unit: { type: Sequelize.STRING },
    RefLow: { type: Sequelize.DECIMAL },
    RefHigh: { type: Sequelize.DECIMAL },
    Verified: { type: Sequelize.BOOLEAN },
    VerifiedBy: { type: Sequelize.INTEGER },
    VerifiedAt: { type: Sequelize.DATE },
    Notes: { type: Sequelize.STRING },
    CreateDate: { type: Sequelize.DATE },
  },
  {
    sequelize,
    tableName: 'CodeMapping',
    modelName: 'CodeMapping',
    timestamps: false,
  }
);

CodeMapping.SearchField = ['Id', 'LocalObject', 'LocalCode', 'Code', 'Display', 'Unit'];

module.exports = CodeMapping;
