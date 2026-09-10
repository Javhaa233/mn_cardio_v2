const { Models } = require('../config/DB');
const Model = Models.PatientLogin;

function PatientLoginConfig() {
  this.Fields = [
    [
      {
        Name: 'date_creation',
        Label: 'Creation date',
        Type: 'Date',
        md: 4,
        Position: 1,
      },
      {
        Name: 'date_modif',
        Label: 'Update date',
        Type: 'Date',
        md: 4,
        Position: 2,
      },
      {
        Name: 'expire_date',
        Label: 'Expire date',
        Type: 'Date',
        md: 4,
        Position: 3,
      },
      { Name: 'id', Label: 'User ID', Type: 'Text', md: 4, Position: 4 },
      { Name: 'id_data', Label: 'Record ID', Type: 'Text', md: 4, Position: 5 },
      { Name: 'id_group', Label: 'Group', Type: 'Text', md: 4, Position: 6 },
      {
        Name: 'last_access_date',
        Label: 'Last access date',
        Type: 'Date',
        md: 4,
        Position: 8,
      },
      {
        Name: 'patient_id',
        Label: 'Patient ID',
        Type: 'GridLookUpSingleLoad',
        Config: {
          ObjectName: 'Patient',
          IdField: 'id_data',
          TextField: 'p_registration',
          Fields: [
            // { Name: "id_data", Label: "Id" },
            { Name: 'p_lastname', Label: 'Last name' },
            { Name: 'p_firstname', Label: 'first name' },
            { Name: 'p_registration', Label: 'Register' },
            { Name: 'DictProvinceCity.name', Label: 'City' },
          ],
          MinTextLength: '2',
        },
        md: 4,
        Position: 10,
      },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'rec_status',
        Position: 11,
      },
      { Name: 'uid', Label: 'UID', Type: 'Text', md: 4, Position: 13 },
      {
        Name: 'user_mod',
        Label: 'Last update author',
        Type: 'Text',
        md: 4,
        Position: 14,
      },
    ],
  ];

  this.ObjectName = 'PatientLogin';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Patient Login',
    NewObjectTitle: 'Patient Login create',
    EditObjectTitle: 'Patient Login edit',
  };
}

module.exports = PatientLoginConfig;
