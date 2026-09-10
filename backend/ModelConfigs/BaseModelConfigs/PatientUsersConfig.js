const { Models } = require('../../config/DB');
const Model = Models.PatientUsers;

function PatientUsersConfig() {
  this.Fields = [
    [
      {
        Name: 'AppId',
        Label: 'App',
        Type: 'SingleSelect',
        Config: { Model: Models.Apps, TextField: 'Name', IdField: 'Id' },
        md: 4,
        Position: 0,
        EditField: false,
        GridField: true,
      },
    ],
    [
      {
        Name: 'UserName',
        Label: 'User name',
        Type: 'Text',
        md: 4,
        Position: 2,
      },
      {
        Name: 'LastName',
        Label: 'Last name',
        Type: 'Text',
        md: 4,
        Position: 3,
      },
      {
        Name: 'FirstName',
        Label: 'First name',
        Type: 'Text',
        md: 4,
        Position: 4,
      },
    ],
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
      {
        Name: 'Password',
        Label: 'Password',
        Type: 'Password',
        md: 6,
        Position: 5,
        GridField: false,
        EditField: false,
      },
      { Name: 'Email', Label: 'Email', Type: 'Text', md: 6, Position: 6 },
      {
        Name: 'UserTypeId',
        Label: 'User Type',
        Type: 'Text',
        md: 6,
        Position: 7,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'CreateDate',
        Label: 'CreateUser',
        Type: 'Date',
        md: 6,
        Position: 8,
        EditField: false,
      },
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
        md: 6,
        Position: 9,
        EditField: false,
        GridField: false,
      },
      {
        Name: 'CreateUser.UserName',
        Label: 'CreateUser',
        Type: 'Text',
        md: 6,
        Position: 10,
        ReadOnly: true,
        EditField: false,
        GridField: true,
      },
      {
        Name: 'IsActive',
        Label: 'Status',
        Type: 'Text',
        md: 6,
        Position: 11,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'PassExpireDate',
        Label: 'Password expiration date',
        Type: 'Date',
        md: 6,
        Position: 12,
        EditField: false,
        GridField: false,
      },
      {
        Name: 'RoleId',
        Label: 'Role',
        Type: 'Text',
        // Config: { Model: Models.Roles, TextField: "Name", IdField: "Id" },
        Position: 13,
        md: 6,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'Language',
        Label: 'Language',
        Type: 'Text',
        md: 6,
        Position: 14,
        GridField: false,
        EditField: false,
      },
    ],
  ];

  this.ObjectName = 'PatientUsers';
  this.Model = Model;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Patient users',
    NewObjectTitle: 'Patient user create',
    EditObjectTitle: 'Patient user edit',
  };
}

module.exports = PatientUsersConfig;
