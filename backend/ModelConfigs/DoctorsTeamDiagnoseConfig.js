const { Models } = require('../config/DB');
const Model = Models.DoctorsTeamDiagnose;

function DoctorsTeamDiagnoseConfig() {
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
        Name: 'diagnose_id',
        Label: 'Diagnose ID',
        Type: 'Text',
        md: 4,
        Position: 3,
      },
      { Name: 'id', Label: 'User ID', Type: 'Text', md: 4, Position: 4 },
      { Name: 'id_data', Label: 'Record ID', Type: 'Text', md: 4, Position: 5 },
      { Name: 'id_group', Label: 'Group', Type: 'Text', md: 4, Position: 6 },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'rec_status',
        md: 4,
        Position: 9,
      },
      { Name: 'team_id', Label: 'Team ID', Type: 'Text', md: 4, Position: 11 },
      {
        Name: 'user_mod',
        Label: 'Last update author',
        Type: 'Text',
        md: 4,
        Position: 12,
      },
    ],
  ];

  this.ObjectName = 'DoctorsTeamDiagnose';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: "Doctor's team diagnose",
    NewObjectTitle: "Doctor's team diagnose create",
    EditObjectTitle: "Doctor's team diagnose edit",
  };
}

module.exports = DoctorsTeamDiagnoseConfig;
