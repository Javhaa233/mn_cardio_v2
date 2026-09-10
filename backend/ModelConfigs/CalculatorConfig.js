const { Models } = require('../config/DB');
const Model = Models.Calculator;

function CalculatorConfig() {
  this.Fields = [
    [
      { Name: 'calculator', Label: 'Calculator', Type: 'Text' },
      { Name: 'date_creation', Label: 'Creation date', Type: 'Date' },
      { Name: 'date_modif', Label: 'Update date', Type: 'Date' },
      { Name: 'id', Label: 'User ID', Type: 'Text', Position: 4 },
      { Name: 'id_data', Label: 'Record ID', Type: 'Text', Position: 5 },
      { Name: 'id_group', Label: 'Group', Type: 'Text', Position: 6 },
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
      },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'rec_status',
      },
      { Name: 'ref', Label: 'Ref', Type: 'Text' },
      { Name: 'score', Label: 'Score', Type: 'Text' },
      { Name: 'user_id', Label: 'Doctor Id', Type: 'Text' },
      { Name: 'user_mod', Label: 'Last update author', Type: 'Text' },
    ],
  ];

  this.ObjectName = 'Calculator';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Calculator',
    NewObjectTitle: 'Calculator create',
    EditObjectTitle: 'Calculator edit',
  };
}

module.exports = CalculatorConfig;
