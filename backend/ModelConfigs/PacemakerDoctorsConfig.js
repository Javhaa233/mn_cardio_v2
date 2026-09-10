const { Models } = require('../config/DB');
const Model = Models.PacemakerDoctors;

function PacemakerDoctorsConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text' },
      { Name: 'DoctorName', Label: 'Doctor name', Type: 'Text' },
      { Name: 'DepartmentId', Label: 'DepartmentId', Type: 'Text' },
    ],
  ];

  this.ObjectName = 'PacemakerDoctors';
  this.Model = Model;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'PacemakerDoctors',
    NewObjectTitle: 'PacemakerDoctors show',
    EditObjectTitle: 'PacemakerDoctors show',
  };
}

module.exports = PacemakerDoctorsConfig;
