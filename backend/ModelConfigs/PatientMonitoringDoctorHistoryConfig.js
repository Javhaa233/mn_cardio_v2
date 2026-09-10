const { Models } = require('../config/DB');
const Model = Models.PatientMonitoringDoctorHistory;

function PatientMonitoringDoctorHistoryConfig() {
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
      },
      { Name: 'IsStart', Label: 'IsStart', Type: 'SingleCheckbox', md: 4 },
      { Name: 'UserId', Label: 'UserId', Type: 'Text', md: 4 },
      { Name: 'Date', Label: 'Date', Type: 'Date', md: 4 },
    ],
  ];

  this.ObjectName = 'PatientMonitoringDoctorHistory';
  this.Model = Model;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'PatientMonitoringDoctorHistory',
    NewObjectTitle: 'PatientMonitoringDoctorHistory create',
    EditObjectTitle: 'PatientMonitoringDoctorHistory edit',
  };
}

module.exports = PatientMonitoringDoctorHistoryConfig;
