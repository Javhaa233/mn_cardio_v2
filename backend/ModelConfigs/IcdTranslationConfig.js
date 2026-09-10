const { Models } = require('../config/DB');
const Model = Models.IcdTranslation;

function IcdTranslationConfig() {
  this.Fields = [
    [
      { Name: 'code', Label: 'Code', Type: 'Text' },
      { Name: 'date_creation', Label: 'Creation date', Type: 'Date' },
      { Name: 'date_modif', Label: 'Update date', Type: 'Date' },
      { Name: 'eng', Label: 'Eng', Type: 'Text' },
      { Name: 'id', Label: 'User ID', Type: 'Text' },
      { Name: 'id_data', Label: 'Record ID', Type: 'Text' },
      { Name: 'id_group', Label: 'Group', Type: 'Text' },
      { Name: 'mon', Label: 'Mon', Type: 'Text' },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'rec_status',
        Position: 11,
      },
      { Name: 'rus', Label: 'Rus', Type: 'Text' },
      { Name: 'user_mod', Label: 'Last update author', Type: 'Text' },
    ],
  ];

  this.ObjectName = 'IcdTranslation';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'ICD10 translation',
    NewObjectTitle: 'ICD10 translation create',
    EditObjectTitle: 'ICD10 translation edit',
  };
}

module.exports = IcdTranslationConfig;
