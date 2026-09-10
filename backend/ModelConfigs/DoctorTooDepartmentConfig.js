const { Models } = require('../config/DB');
const Model = Models.DoctorTooDepartment;

function DoctorTooDepartmentConfig() {
  this.Fields = [
    [
      {
        Name: 'Id',
        Label: 'Id',
        Type: 'Text',
        md: 6,
        Position: 1,
        GridField: false,
        EditField: false,
      },
      { Name: 'DoctorsProfile.firstname', Label: 'Doctor', EditField: false },
      {
        Name: 'DrgroupDepartments.name',
        Label: 'Department',
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
            { Name: 'lastname', Label: 'Last name' },
            { Name: 'firstname', Label: 'first name' },
          ],
          MinTextLength: '2',
        },
        md: 6,
        Position: 1,
        GridField: false,
        EditField: true,
      },
      {
        Name: 'DepartmentId',
        Label: 'Department',
        Type: 'SingleSelect',
        Config: {
          Model: Models.DrgroupDepartments,
          IdField: 'id_data',
          TextField: 'name',
        },
        md: 6,
        Position: 1,
        GridField: false,
        EditField: true,
      },
    ],
  ];

  this.ObjectName = 'DoctorTooDepartment';
  this.Model = Model;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'DoctorTooDepartment',
    NewObjectTitle: 'DoctorTooDepartment create',
    EditObjectTitle: 'DoctorTooDepartment edit',
  };
}

module.exports = DoctorTooDepartmentConfig;
