const { Models } = require('../config/DB');
const Model = Models.Icd9PcLevel3;

function Icd9PcLevel3Config() {
  this.Fields = [
    [
      {
        Name: 'date_creation',
        Label: 'Creation date',
        Type: 'Date',
        Position: 1,
      },
      {
        Name: 'date_modif',
        Label: 'Update date',
        Type: 'Date',
        Position: 2,
      },
      { Name: 'id', Label: 'User ID', Type: 'Text', md: 4, Position: 3 },
      { Name: 'id_data', Label: 'Record ID', Type: 'Text', md: 4, Position: 4 },
      { Name: 'id_group', Label: 'Group', Type: 'Text', md: 4, Position: 5 },
      {
        Name: 'id_parent',
        Label: 'ID parent',
        Type: 'Text',
        Position: 6,
      },
      { Name: 'name', Label: 'Name', Type: 'Text', md: 4, Position: 9 },
      {
        Name: 'name_mgl',
        Label: 'Name MGL',
        Type: 'Text',
        Position: 10,
      },
      { Name: 'number', Label: 'Number', Type: 'Text', md: 4, Position: 11 },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'rec_status',
        Position: 12,
      },
      {
        Name: 'user_mod',
        Label: 'Last update author',
        Type: 'Text',
        Position: 14,
      },
    ],
  ];

  this.ObjectName = 'Icd9PcLevel3';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'ICD9 PC Level 3',
    NewObjectTitle: 'ICD9 PC Level 3 create',
    EditObjectTitle: 'ICD9 PC Level 3 edit',
  };
}

module.exports = Icd9PcLevel3Config;
