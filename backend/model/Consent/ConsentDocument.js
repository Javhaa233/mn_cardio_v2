const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

/**
 * The consent text a patient is shown, versioned.
 *
 * THE LEGAL WORDING IS A ROW, NOT A STRING IN CODE. That is what de-blocks the
 * feature: it is complete without the text, and ЗСҮТ supplying it later is an
 * INSERT rather than a deployment. Changing the wording is a NEW Version, never
 * an edit - PatientConsent records which document was accepted, so an old
 * consent stays attached to the text actually shown at the time.
 */
class ConsentDocument extends Sequelize.Model {}

ConsentDocument.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    PurposeCode: { type: Sequelize.STRING },
    Version: { type: Sequelize.STRING },
    TitleMn: { type: Sequelize.STRING },
    BodyMn: { type: Sequelize.TEXT },
    IsActive: { type: Sequelize.BOOLEAN },
    EffectiveFrom: { type: Sequelize.DATE },
    CreateDate: { type: Sequelize.DATE },
    CreateUserId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'ConsentDocument',
    modelName: 'ConsentDocument',
    timestamps: false,
  }
);

ConsentDocument.SearchField = ['PurposeCode', 'Version', 'TitleMn'];

module.exports = ConsentDocument;
