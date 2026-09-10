const { Models } = require('../config/DB');
const Model = Models.DoctorsTeamNotes;

function DoctorsTeamNotesConfig() {
  this.Fields = [
    [
      {
        Name: 'Id',
        Label: 'Id',
        Type: 'Text',
        md: 4,
        Position: 1,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'DoctorsProfile.firstname',
        Label: 'Doctor',
        Type: 'Text',
        EditField: false,
      },
      {
        Name: 'DoctorId',
        Label: 'Doctor',
        Type: 'GridLookUpSingleLoad',
        Config: {
          ObjectName: 'DoctorsProfile',
          IdField: 'id_data',
          TextField: 'firstname',
          Fields: [
            // { Name: "id_data", Label: "Id" },
            { Name: 'lastname', Label: 'Last name' },
            { Name: 'firstname', Label: 'first name' },
          ],
          MinTextLength: '2',
        },
        md: 4,
        Position: 2,
        GridField: false,
      },
      {
        Name: 'Patient.p_registration',
        Label: 'Patient',
        Type: 'Text',
        EditField: false,
      },
      {
        Name: 'PatientId',
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
        Position: 2,
        GridField: false,
      },
      {
        Name: 'DoctorsTeam.name',
        Label: 'Doctors team',
        Type: 'Text',
        EditField: false,
      },
      {
        Name: 'TeamId',
        Label: 'Doctors team',
        Type: 'SingleSelect',
        Config: {
          Model: Models.DoctorsTeam,
          IdField: 'id_data',
          TextField: 'name',
          MinTextLength: 0,
        },
        md: 4,
        Position: 2,
        GridField: false,
      },
      {
        Name: 'CreateDate',
        Label: 'Create date',
        Type: 'Date',
        md: 4,
        Position: 3,
      },
      { Name: 'Notes', Label: 'Note', Type: 'TextArea', md: 4, Position: 4 },
      {
        Name: 'CreateUserId',
        Label: 'Create user',
        Type: 'SingelSelect',
        Config: {
          Model: Models.Users,
          IdField: 'Id',
          TextField: 'UserName',
          MinTextLength: 0,
        },
        md: 4,
        Position: 5,
        GridField: false,
      },
    ],
  ];

  this.ObjectName = 'DoctorsTeamNotes';
  this.Model = Model;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: "Doctor's team notes",
    NewObjectTitle: "Doctor's team notes create",
    EditObjectTitle: "Doctor's team notes edit",
  };
}

module.exports = DoctorsTeamNotesConfig;
