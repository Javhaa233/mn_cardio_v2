const { Models } = require('../config/DB');
const Model = Models.DoctorsTeamPatient;

function DoctorsTeamPatientConfig() {
  this.Fields = [
    [
      {
        Name: 'date_creation',
        Label: 'Creation date',
        Type: 'Date',
        md: 4,
        Position: 20,
        Required: true,
      },
      {
        Name: 'date_modif',
        Label: 'Update date',
        Type: 'Date',
        md: 4,
        Position: 20,
        GridField: false,
        EditField: false,
        Required: true,
      },
      {
        Name: 'id',
        Label: 'User ID',
        Type: 'Text',
        md: 4,
        Position: 4,
        GridField: false,
        EditField: false,
        Required: true,
      },
      {
        Name: 'id_data',
        Label: 'Record ID',
        Type: 'Text',
        md: 4,
        Position: 5,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'id_group',
        Label: 'Group',
        Type: 'Text',
        md: 4,
        Position: 6,
        GridField: false,
        EditField: false,
        Required: true,
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
        Position: 9,
        GridField: false,
        EditField: true,
      },
      {
        Name: 'Users.UserName',
        Label: 'Doctor',
        Type: 'Text',
        md: 4,
        Position: 9,
        EditField: false,
      },
      {
        Name: 'Patient.p_registration',
        Label: 'Register',
        Type: 'Text',
        md: 4,
        Position: 9,
        EditField: false,
      },
      {
        Name: 'Patient.p_lastname',
        Label: 'Last name',
        Type: 'Text',
        md: 4,
        Position: 9,
        EditField: false,
      },
      {
        Name: 'Patient.p_firstname',
        Label: 'First name',
        Type: 'Text',
        md: 4,
        Position: 9,
        EditField: false,
      },
      {
        Name: 'Patient.p_birthday',
        Label: 'Birth day',
        Type: 'Text',
        md: 4,
        Position: 9,
        EditField: false,
      },
      {
        Name: 'Patient.Gender.label',
        Label: 'Gender',
        Type: 'Text',
        md: 4,
        Position: 9,
        EditField: false,
      },
      {
        Name: 'Patient.Province.label',
        Label: 'Province City',
        Type: 'Text',
        md: 4,
        Position: 9,
        EditField: false,
      },
      {
        Name: 'Patient.p_telephone',
        Label: 'Phone',
        Type: 'Text',
        md: 4,
        Position: 9,
        EditField: false,
      },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'rec_status',
        Position: 10,
      },
      {
        Name: 'team_id',
        Label: 'Team ID',
        Type: 'GridLookUpSingleLoad',
        Config: {
          ObjectName: 'DoctorsTeam',
          IdField: 'id_data',
          TextField: 'name',
          Fields: [{ Name: 'name', Label: 'Name' }],
          MinTextLength: '2',
        },
        md: 4,
        Position: 9,
        GridField: false,
        EditField: true,
      },
      { Name: 'comment', Label: 'Notes', Type: 'Text', md: 4, Position: 20 },
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

  this.ObjectName = 'DoctorsTeamPatient';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: "Doctor's team patient",
    NewObjectTitle: "Doctor's team patient create",
    EditObjectTitle: "Doctor's team patient edit",
  };
}

module.exports = DoctorsTeamPatientConfig;
