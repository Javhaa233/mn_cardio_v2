const { Models } = require('../../config/DB');
const Model = Models.RoleToPermission;
var { Roles, Permissions } = Models;

function RoleToPermissionConfig() {
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
        Name: 'Roles.Name',
        Label: 'Role',
        Type: 'Text',
        md: 6,
        Position: 1,
        EditField: false,
      },
      {
        Name: 'Permissions.Name',
        Label: 'Permission',
        Type: 'Text',
        md: 6,
        Position: 1,
        EditField: false,
      },
      {
        Name: 'RoleId',
        Label: 'Role',
        Type: 'SingleSelect',
        Config: { Model: Roles, IdField: 'Id', TextField: 'Name' },
        md: 6,
        Position: 1,
        GridField: false,
      },
      {
        Name: 'PermissionId',
        Label: 'Permission',
        Type: 'SingleSelect',
        Config: { Model: Permissions, IdField: 'Id', TextField: 'Name' },
        md: 6,
        Position: 1,
        GridField: false,
      },
      {
        Name: 'Read',
        Label: 'Read',
        Type: 'SingleCheckBox',
        md: 3,
        Position: 1,
      },
      {
        Name: 'Create',
        Label: 'Create',
        Type: 'SingleCheckBox',
        md: 3,
        Position: 1,
      },
      {
        Name: 'Update',
        Label: 'Update',
        Type: 'SingleCheckBox',
        md: 3,
        Position: 1,
      },
      {
        Name: 'Delete',
        Label: 'Delete',
        Type: 'SingleCheckBox',
        md: 3,
        Position: 1,
      },
    ],
  ];

  this.ObjectName = 'RoleToPermission';
  this.Model = Model;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'RoleToPermission',
    NewObjectTitle: 'RoleToPermission create',
    EditObjectTitle: 'RoleToPermission edit',
  };
}

module.exports = RoleToPermissionConfig;
