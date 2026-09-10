const { Models } = require('../../config/DB');
const Model = Models.UserToRole;
var { Users, Roles } = Models;

function PatientUserToRoleConfig() {
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
      {
        Name: 'UserId',
        Label: 'User',
        Type: 'SingleSelect',
        Config: { Model: Users, IdField: 'Id', TextField: 'UserName' },
        md: 6,
        Position: 1,
      },
      {
        Name: 'RoleId',
        Label: 'Role',
        Type: 'SingleSelect',
        Config: { Model: Roles, IdField: 'Id', TextField: 'Name' },
        md: 6,
        Position: 1,
      },
    ],
  ];

  this.ObjectName = 'UserToRole';
  this.Model = Model;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Patient User to Role',
    NewObjectTitle: 'User to Role create',
    EditObjectTitle: 'User to Role edit',
  };
}

module.exports = PatientUserToRoleConfig;
