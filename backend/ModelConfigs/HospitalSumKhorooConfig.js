const { Models } = require('../config/DB');
const Model = Models.HospitalSumKhoroo;

function HospitalSumKhorooConfig() {
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
      {
        Name: 'hospitalid',
        Label: 'Hospital id',
        Type: 'Text',
        Position: 3,
      },
      { Name: 'id', Label: 'User ID', Type: 'Text', Position: 4 },
      { Name: 'id_data', Label: 'Record ID', Type: 'Text', Position: 5 },
      { Name: 'id_group', Label: 'Group', Type: 'Text', Position: 6 },
      {
        Name: 'khorooid',
        Label: 'Khoroo id',
        Type: 'Text',
        Position: 8,
      },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'rec_status',
        Position: 10,
      },
      { Name: 'soumid', Label: 'Soum id', Type: 'Text', Position: 12 },
      {
        Name: 'user_mod',
        Label: 'Last update author',
        Type: 'Text',
        Position: 13,
      },
    ],
  ];

  this.ObjectName = 'HospitalSumKhoroo';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Hospital sum khoroo',
    NewObjectTitle: 'Hospital sum khoroo create',
    EditObjectTitle: 'Hospital sum khoroo edit',
  };
}

module.exports = HospitalSumKhorooConfig;
