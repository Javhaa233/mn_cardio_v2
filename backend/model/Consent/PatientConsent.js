const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

/**
 * APPEND-ONLY. Never update a row in this table.
 *
 * A withdrawal is a NEW row with Granted = 0. This is the whole design, and the
 * thing most likely to be "simplified" later by somebody adding an UPDATE:
 * consent is a legal record, and the question it must answer is not "does this
 * person consent" but "what exactly did they agree to, when, and when did they
 * withdraw it". An UPDATE destroys the evidence for the first two.
 *
 * The CURRENT state for a purpose is therefore the most recent row for it, not
 * a column somewhere.
 *
 * Keyed by PatRegNo, matching the rehab-era tables and what ДАН asserts.
 * PatientUserId is recorded where one exists but is not the key - under the ДАН
 * login path there is no PatientUsers row at all.
 */
class PatientConsent extends Sequelize.Model {}

PatientConsent.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    PatRegNo: { type: Sequelize.STRING },
    PatientId: { type: Sequelize.INTEGER },
    PatientUserId: { type: Sequelize.INTEGER },
    ConsentDocumentId: { type: Sequelize.INTEGER },
    PurposeCode: { type: Sequelize.STRING },
    Granted: { type: Sequelize.BOOLEAN },
    GrantedDate: { type: Sequelize.DATE },
    Channel: { type: Sequelize.STRING },
    /*
     * Guardian consent - mobile tender §1.2, columns added by
     * scripts/add_consent_guardian_columns.sql.
     *
     * DECLARED HERE OR THE WRITES VANISH. Sequelize silently drops any
     * attribute a model does not declare, so a guardian consent would insert
     * with its guardian fields missing and no error anywhere - the row would
     * say somebody consented and not say who.
     *
     * GrantedBy is NULL on every historical row. Those predate the guardian
     * route and are self-consents by construction; read NULL as 'self'.
     */
    GrantedBy: { type: Sequelize.STRING },
    GuardianRegNo: { type: Sequelize.STRING },
    GuardianName: { type: Sequelize.STRING },
    GuardianRelation: { type: Sequelize.STRING },
    IpAddress: { type: Sequelize.STRING },
    CreateDate: { type: Sequelize.DATE },
    CreateUserId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'PatientConsent',
    modelName: 'PatientConsent',
    timestamps: false,
  }
);

PatientConsent.SearchField = ['PatRegNo', 'PurposeCode'];

module.exports = PatientConsent;
