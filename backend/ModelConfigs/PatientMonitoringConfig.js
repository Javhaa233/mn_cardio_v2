const { Models } = require('../config/DB');
const Model = Models.PatientMonitoring;

function PatientMonitoringConfig() {
  this.Fields = [
    [
      { Name: 'blood_pressure', Label: 'СИС/ДАРАЛТ (мм.муб)', Type: 'Number' },
      { Name: 'blood_pressure2', Label: 'ДИАС/ДАРАЛТ (мм.муб)', Type: 'Number' },
      // Holds the medications taken, not a remark.
      { Name: 'comment', Label: 'УУСАН ЭМ', Type: 'Text', md: 4, Position: 3 },
      { Name: 'date', Label: 'Date', Type: 'Date', md: 4, Position: 4 },
      { Name: 'date_creation', Label: 'Creation date', Type: 'Date' },
      { Name: 'date_modif', Label: 'Update date', Type: 'Date' },
      { Name: 'id', Label: 'User ID', Type: 'Text' },
      { Name: 'id_data', Label: 'Record ID', Type: 'Text', md: 4, Position: 8 },
      { Name: 'id_group', Label: 'Group', Type: 'Text', md: 4, Position: 9 },
      { Name: 'inr', Label: 'INR', Type: 'Text', md: 4, Position: 11 },
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
        Name: 'patient_registration',
        Label: 'Personal number',
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
      { Name: 'pulse', Label: 'Pulse', Type: 'Text', md: 4, Position: 14 },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'rec_status',
      },
      { Name: 'time', Label: 'Time', Type: 'Text', md: 4, Position: 17 },
      { Name: 'user_mod', Label: 'Last update author', Type: 'Text' },
      { Name: 'weight', Label: 'ЖИН (кг)', Type: 'Number', md: 4, Position: 19 },
    ],
  ];

  this.ObjectName = 'PatientMonitoring';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Patient Monitoring',
    NewObjectTitle: 'Patient Monitoring create',
    EditObjectTitle: 'Patient Monitoring edit',
  };
}

module.exports = PatientMonitoringConfig;
