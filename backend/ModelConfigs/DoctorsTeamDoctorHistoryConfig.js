const { Models } = require('../config/DB');
const Model = Models.DoctorsTeamDoctorHistory;

function DoctorsTeamDoctorHistoryConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text', md: 4 },
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
      },
      { Name: 'CreateUserId', Label: 'CreateUserId', Type: 'Text', md: 4 },
      { Name: 'Notes', Label: 'Notes', Type: 'Text', md: 4 },
      { Name: 'TeamId', Label: 'TeamId', Type: 'Text', md: 4 },
      { Name: 'CreateDate', Label: 'CreateDate', Type: 'Date', md: 4 },
    ],
  ];

  this.ObjectName = 'DoctorsTeamDoctorHistory';
  this.Model = Model;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'DoctorsTeamDoctorHistory',
    NewObjectTitle: 'DoctorsTeamDoctorHistory create',
    EditObjectTitle: 'DoctorsTeamDoctorHistory edit',
  };
}

module.exports = DoctorsTeamDoctorHistoryConfig;
