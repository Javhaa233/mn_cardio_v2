const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

// The field dictionary. One row per field of a tender form; this is what drives
// the rendered form, the JSON keys in TenderFormData.Data, and the generated view.
class TenderFormField extends Sequelize.Model {}
TenderFormField.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    FormCode: { type: Sequelize.STRING },
    FieldCode: { type: Sequelize.STRING },
    LabelMn: { type: Sequelize.STRING },
    LabelEn: { type: Sequelize.STRING },
    FieldType: { type: Sequelize.STRING },
    OptionType: { type: Sequelize.STRING },
    SectionCode: { type: Sequelize.STRING },
    SectionLabel: { type: Sequelize.STRING },
    SectionPos: { type: Sequelize.INTEGER },
    ParentField: { type: Sequelize.STRING },
    ParentValue: { type: Sequelize.STRING },
    IsRequired: { type: Sequelize.BOOLEAN },
    IsSearchable: { type: Sequelize.BOOLEAN },
    Md: { type: Sequelize.INTEGER },
    Position: { type: Sequelize.INTEGER },
    Unit: { type: Sequelize.STRING },
    HelpTextMn: { type: Sequelize.STRING },
    TableConfig: { type: Sequelize.TEXT },
    TableRows: { type: Sequelize.INTEGER },
    IsActive: { type: Sequelize.BOOLEAN },
    CreateDate: { type: Sequelize.DATE },
    UpdateDate: { type: Sequelize.DATE },
  },
  { sequelize, tableName: 'TenderFormField', modelName: 'TenderFormField', timestamps: false }
);

TenderFormField.SearchField = [
  'Id', 'FormCode', 'FieldCode', 'LabelMn', 'FieldType', 'OptionType',
  'SectionCode', 'SectionLabel', 'SectionPos', 'Position', 'IsSearchable',
];

module.exports = TenderFormField;
