const { Models } = require('../config/DB');
const Model = Models.Icd9PcLevel4;

function Icd9PcLevel4Config() {
  this.Fields = [
    [
      { Name: 'date_creation', Label: 'Creation date', Type: 'Date' },
      { Name: 'date_modif', Label: 'Update date', Type: 'Date' },
      { Name: 'id', Label: 'User ID', Type: 'Text' },
      { Name: 'id_data', Label: 'Record ID', Type: 'Text' },
      { Name: 'id_group', Label: 'Group', Type: 'Text' },
      { Name: 'id_parent', Label: 'ID parent', Type: 'Text' },
      { Name: 'name', Label: 'Name', Type: 'Text' },
      { Name: 'name_mgl', Label: 'Name MGL', Type: 'Text' },
      { Name: 'number', Label: 'Number', Type: 'Text' },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'rec_status',
      },
      { Name: 'user_mod', Label: 'Last update author', Type: 'Text' },
    ],
  ];

  this.ObjectName = 'Icd9PcLevel4';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'ICD9 PC Level 4',
    NewObjectTitle: 'ICD9 PC Level 4 create',
    EditObjectTitle: 'ICD9 PC Level 4 edit',
  };
}

module.exports = Icd9PcLevel4Config;
