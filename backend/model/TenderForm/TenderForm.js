const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class TenderForm extends Sequelize.Model {}
TenderForm.init(
  {
    FormCode: { type: Sequelize.STRING, primaryKey: true },
    NameMn: { type: Sequelize.STRING },
    NameEn: { type: Sequelize.STRING },
    GroupCode: { type: Sequelize.STRING },
    GroupLabelMn: { type: Sequelize.STRING },
    Version: { type: Sequelize.INTEGER },
    Position: { type: Sequelize.INTEGER },
    IsActive: { type: Sequelize.BOOLEAN },
    AllowDuplicate: { type: Sequelize.BOOLEAN },
    CreateDate: { type: Sequelize.DATE },
    UpdateDate: { type: Sequelize.DATE },
  },
  { sequelize, tableName: 'TenderForm', modelName: 'TenderForm', timestamps: false }
);

TenderForm.SearchField = [
  'FormCode',
  'NameMn',
  'GroupCode',
  'Position',
  'IsActive',
  'AllowDuplicate',
];

TenderForm.SetAssocations = (Models) => {
  TenderForm.hasMany(Models.TenderFormField, {
    as: 'Fields',
    foreignKey: 'FormCode',
    sourceKey: 'FormCode',
  });
};

module.exports = TenderForm;
