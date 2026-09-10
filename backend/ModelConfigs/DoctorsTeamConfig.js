const { Models } = require('../config/DB');
const Model = Models.DoctorsTeam;
var ModelLookUp = Models.DoctorsTeamLookUp;

function DoctorsTeamConfig() {
  this.Fields = [
    [
      {
        Name: 'AppId',
        Label: 'App',
        Type: 'SingleSelect',
        Config: { Model: Models.Apps, TextField: 'Name', IdField: 'Id' },
        Position: 0,
        EditField: false,
        GridField: true,
      },
      {
        Name: 'name',
        Label: 'Name',
        Type: 'Text',
        md: 4,
        Position: 1,
        GridField: true,
        EditField: true,
      },
      {
        Name: 'description',
        Label: 'Description',
        Type: 'Text',
        md: 4,
        Position: 3,
        EditField: true,
        GridField: false,
      },
      {
        Name: 'date_creation',
        Label: 'Creation date',
        Type: 'Date',
        md: 4,
        Position: 20,
      },
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
        Name: 'extra_info',
        Label: 'Enum for extra information',
        Type: 'Text',
        md: 4,
        Position: 3,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'id',
        Label: 'User ID',
        Type: 'Text',
        md: 4,
        Position: 4,
        GridField: false,
        EditField: false,
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
      },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'rec_status',
        Position: 10,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'user_mod',
        Label: 'Last update author',
        Type: 'Text',
        md: 4,
        Position: 12,
      },
      {
        Name: 'procedures',
        Label: 'Procedures ',
        Type: 'CheckBox',
        Multiple: true,
        md: 8,
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'TeamProcedures',
        LookUpConfig: {
          Model: ModelLookUp,
          ParentValueField: 'id_data',
          ChildValueField: 'value',
          IdField: 'id_lookup',
          Field: 'id_question',
        },
        GridField: false,
      },
      {
        Name: 'vwDoctorsTeamInfo.DoctorCount',
        Label: 'Doctor count',
        Type: 'Text',
        md: 4,
        Position: 8,
        GridField: true,
        EditField: false,
      },
      {
        Name: 'vwDoctorsTeamInfo.PatientCount',
        Label: 'Patient count',
        Type: 'Text',
        md: 4,
        Position: 9,
        GridField: true,
        EditField: false,
      },
    ],
    [
        {
          Name: 'DoctorTeamPatient',
          Label: 'Иргэн',
          Type: 'ListView',
          HideNew: false,
          Config: { ObjectName: 'DoctorsTeamPatient', ForiegnKey: 'team_id' },
          md: 12,
          Position: 1,
          GridField: false,
          EditField: true,
        },
        {
          Name: 'LookupDoctorTeam',
          Label: 'Эмч',
          Type: 'ListView',
          HideNew: false,
          Config: { ObjectName: 'LookupDoctorTeam', ForiegnKey: 'team_id' },
          md: 12,
          Position: 1,
          GridField: false,
          EditField: true,
        },
      ],
    ];

  this.ObjectName = 'DoctorsTeam';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: "Doctor's team",
    NewObjectTitle: "Doctor's team create",
    EditObjectTitle: "Doctor's team edit",
  };
}

module.exports = DoctorsTeamConfig;
