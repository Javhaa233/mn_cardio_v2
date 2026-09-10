const { Models } = require('../../config/DB');
const Model = Models.Roles;

function RolesConfig() {
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
        Name: 'Name',
        Label: 'Name',
        Type: 'Text',
        md: 6,
        Position: 1,
        EditField: true,
      },
      {
        Name: 'Code',
        Label: 'Code',
        Type: 'Text',
        md: 6,
        Position: 1,
        EditField: true,
      },
      {
        Name: 'Description',
        Label: 'Description',
        Type: 'TextArea',
        md: 12,
        Position: 1,
        EditField: true,
      },
    ],
    [
      {
        Name: 'RoleToPermission',
        Label: 'Permissions',
        Type: 'ListView',
        Config: { ObjectName: 'RoleToPermission', ForiegnKey: 'RoleId' },
        md: 12,
        Position: 1,
        GridField: false,
        EditField: true,
      },
    ],
  ];

  this.ObjectName = 'Roles';
  this.Model = Model;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Roles',
    NewObjectTitle: 'Roles create',
    EditObjectTitle: 'Roles edit',
  };
}

module.exports = RolesConfig;
