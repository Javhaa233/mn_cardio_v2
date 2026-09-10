const { Models } = require('../../config/DB');
const Model = Models.Users;

function UsersConfig() {
  this.Fields = [
    [
      {
        Name: 'AppId',
        Label: 'App',
        Type: 'SingleSelect',
        Config: { Model: Models.Apps, TextField: 'Name', IdField: 'Id' },
        Position: 0,
        EditField: false,
        GridField: true,
      },
      {
        Name: 'Id',
        Label: 'Id',
        Type: 'Text',
        md: 6,
        Position: 2,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'UserName',
        Label: 'User name',
        Type: 'Text',
        md: 6,
        Position: 3,
        EditField: true,
      },
      {
        Name: 'Email',
        Label: 'Email',
        Type: 'Text',
        md: 6,
        Position: 1,
        EditField: true,
      },

      {
        Name: 'LastName',
        Label: 'Last name',
        Type: 'Text',
        md: 6,
        Position: 4,
        EditField: true,
      },
      {
        Name: 'FirstName',
        Label: 'First name',
        Type: 'Text',
        md: 6,
        Position: 1,
        EditField: true,
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
        Name: 'UserTypeId',
        Label: 'User type',
        Type: 'Text',
        md: 6,
        Position: 1,
        EditField: true,
      },
      {
        Name: 'IsActive',
        Label: 'Is active',
        Type: 'Text',
        md: 6,
        Position: 1,
        EditField: true,
      },
      {
        Name: 'RoleId',
        Label: 'Role',
        Type: 'SingleSelect',
        Config: { Model: Models.Roles, TextField: 'Name', IdField: 'Id' },
        Position: 5,
        md: 6,
        GridField: false,
        EditField: true,
      },
      {
        Name: 'Role.Name',
        Label: 'Role',
        Type: 'Text',
        Position: 6,
        ReadOnly: true,
        GridField: true,
        EditField: false,
      },
      {
        Name: 'CreateUserId',
        Label: 'CreateUser',
        Type: 'Text',
        md: 6,
        Position: 7,
        EditField: false,
        GridField: false,
      },
      {
        Name: 'CreateUser.UserName',
        Label: 'CreateUser',
        Type: 'Text',
        md: 6,
        Position: 8,
        ReadOnly: true,
        EditField: false,
        GridField: true,
      },
      {
        Name: 'CreateDate',
        Label: 'Create date',
        Type: 'Date',
        md: 6,
        Position: 9,
        EditField: false,
      },

      // {
      //   Name: "RoleId",
      //   Label: "Role",
      //   Type: "MultipleSelect",
      //   Multiple: true,
      //   Config: {
      //     Model: Roles,
      //     IdField: "Id",
      //     TextField: "Name",
      //   },
      //   ManyConfig: {
      //     Model: UserToRole,
      //     ParentField: "UserId",
      //     ChildField: "RoleId",
      //     IdField: "Id",
      //     Values: "UserToRole",
      //   },
      //   md: 6,
      //   Position: 1,
      //   GridField: false,
      // },
      {
        Name: 'Password',
        Label: 'Password',
        Type: 'Password',
        md: 6,
        Position: 10,
        GridField: false,
        EditField: false,
      },
    ],
  ];

  this.ObjectName = 'Users';
  this.Model = Model;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Users',
    NewObjectTitle: 'Users create',
    EditObjectTitle: 'Users edit',
  };
}

module.exports = UsersConfig;
