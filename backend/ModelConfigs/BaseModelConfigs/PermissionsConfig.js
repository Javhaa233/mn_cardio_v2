const { Models } = require('../../config/DB');
const Model = Models.Permissions;

function PermissionsConfig() {
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
        Name: 'ObjectName',
        Label: 'Object name',
        Type: 'Text',
        md: 6,
        Position: 1,
        EditField: true,
      },
      // {
      //   Name: "Read",
      //   Label: "Read",
      //   Type: "SingleCheckBox",
      //   md: 4,
      //   Position: 1
      // },
      // {
      //   Name: "Create",
      //   Label: "Create",
      //   Type: "SingleCheckBox",
      //   md: 4,
      //   Position: 1
      // },
      // {
      //   Name: "Delete",
      //   Label: "Delete",
      //   Type: "SingleCheckBox",
      //   md: 4,
      //   Position: 1
      // },
      {
        Name: 'CreateUrl',
        Label: 'Create url',
        Type: 'Text',
        md: 4,
        Position: 1,
        EditField: true,
      },
      {
        Name: 'UpdateUrl',
        Label: 'Update url',
        Type: 'Text',
        md: 4,
        Position: 1,
        EditField: true,
      },
      {
        Name: 'ReadUrl',
        Label: 'Read url',
        Type: 'Text',
        md: 4,
        Position: 1,
        EditField: true,
      },
      {
        Name: 'DeleteUrl',
        Label: 'Delete url',
        Type: 'Text',
        md: 4,
        Position: 1,
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
  ];

  this.ObjectName = 'Permissions';
  this.Model = Model;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Permissions',
    NewObjectTitle: 'Permissions create',
    EditObjectTitle: 'Permissions edit',
  };
}

module.exports = PermissionsConfig;
