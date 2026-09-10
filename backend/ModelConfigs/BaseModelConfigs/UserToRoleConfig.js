const { Models } = require('../../config/DB');
const Model = Models.UserToRole;
var { Users, Roles } = Models;

function UserToRoleConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text' },
      {
        Name: 'UserId',
        Label: 'User',
        Type: 'SingleSelect',
        Config: { Model: Users, IdField: 'Id', TextField: 'UserName' },
      },
      {
        Name: 'RoleId',
        Label: 'Role',
        Type: 'SingleSelect',
        Config: { Model: Roles, IdField: 'Id', TextField: 'Name' },
      },
    ],
  ];

  this.ObjectName = 'UserToRole';
  this.Model = Model;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'User to Role',
    NewObjectTitle: 'User to Role create',
    EditObjectTitle: 'User to Role edit',
  };
}

module.exports = UserToRoleConfig;
