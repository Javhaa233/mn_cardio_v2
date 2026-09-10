const { Models } = require('../config/DB');
const Model = Models.PatientMonitoringDoctor;

function PatientMonitoringDoctorConfig() {
  this.Fields = [
    [
      {
        Name: 'date_modif',
        Label: 'Update date',
        Type: 'Date',
        md: 4,
        Position: 2,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'id',
        Label: 'User ID',
        Type: 'Text',
        md: 4,
        Position: 3,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'id_data',
        Label: 'Record ID',
        Type: 'Text',
        md: 4,
        Position: 4,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'id_group',
        Label: 'Group',
        Type: 'Text',
        md: 4,
        Position: 5,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'DoctorProfile.firstname',
        Label: 'Doctor',
        Type: 'Text',
        EditField: false,
        GridField: false,
      },
      {
        Name: 'Patient.p_lastname',
        Label: 'Last name',
        Type: 'Text',
        EditField: false,
      },
      {
        Name: 'Patient.p_firstname',
        Label: 'First name',
        Type: 'Text',
        EditField: false,
      },
      {
        Name: 'Patient.p_registration',
        Label: 'Register',
        Type: 'Text',
        EditField: false,
      },
      {
        Name: 'date_creation',
        Label: 'Start date',
        Type: 'Date',
        EditField: false,
      },
      {
        Name: 'patient_id',
        Label: 'Patient Id',
        Type: 'GridLookUpSingleLoad',
        Config: {
          ObjectName: 'Patient',
          IdField: 'id_data',
          TextField: 'p_registration',
          Fields: [
            { Name: 'id_data', Label: 'Id' },
            { Name: 'p_lastname', Label: 'Last name' },
            { Name: 'p_firstname', Label: 'first name' },
            { Name: 'p_registration', Label: 'Register' },
            { Name: 'DictProvinceCity.name', Label: 'City' },
          ],
        },
        md: 4,
        Position: 9,
        GridField: false,
      },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'rec_status',
        Position: 10,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'user_id',
        Label: 'Doctor Id',
        Type: 'GridLookUpSingleLoad',
        md: 4,
        Position: 12,
        GridField: false,
        Config: {
          ObjectName: 'Users',
          IdField: 'Id',
          MinTextLength: 0,
          TextField: 'UserName',
          Fields: [
            { Name: 'Id', Label: 'Id' },
            { Name: 'UserName', Label: 'User name' },
            { Name: 'email', Label: 'Email' },
          ],
        },
      },
      {
        Name: 'is_active',
        Label: 'Is Active',
        Type: 'SingleCheckBox',
        md: 4,
        Position: 7,
        GridField: false,
      },
      {
        Name: 'user_mod',
        Label: 'Last update author',
        Type: 'Text',
        md: 4,
        Position: 13,
        GridField: false,
        EditField: false,
      },
    ],
  ];

  this.ObjectName = 'PatientMonitoringDoctor';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Personal monitoring',
    NewObjectTitle: 'Personal monitoring create',
    EditObjectTitle: 'Personal monitoring edit',
  };
}

module.exports = PatientMonitoringDoctorConfig;
