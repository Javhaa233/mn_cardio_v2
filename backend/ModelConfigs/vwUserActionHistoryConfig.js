const { Models } = require('../config/DB');
const Model = Models.vwUserActionHistory;

function vwUserActionHistoryConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text', md: 4 },
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
      },
      { Name: 'UserId', Label: 'UserId', Type: 'Text', md: 4 },
      { Name: 'Notes', Label: 'Notes', Type: 'Text', md: 4 },
      { Name: 'LinkObjectName', Label: 'LinkObjectName', Type: 'Text', md: 4 },
      { Name: 'LinkObjectId', Label: 'LinkObjectId', Type: 'Text', md: 4 },
      { Name: 'LogDate', Label: 'LogDate', Type: 'Date', md: 4 },
      { Name: 'Action', Label: 'Action', Type: 'Text', md: 4 },
      { Name: 'NotesDetail', Label: 'Notes', Type: 'Text' },
    ],
  ];

  this.ObjectName = 'vwUserActionHistory';
  this.Model = Model;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'vwUserActionHistory',
    NewObjectTitle: 'vwUserActionHistory create',
    EditObjectTitle: 'vwUserActionHistory edit',
  };
}

module.exports = vwUserActionHistoryConfig;
