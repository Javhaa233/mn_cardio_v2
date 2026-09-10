const { Models } = require('../../config/DB');
const Model = Models.UserRequests;

function UserRequestsConfig() {
  this.Fields = [
    [
      {
        Name: 'AppId',
        Label: 'App',
        Type: 'SingleSelect',
        Config: { Model: Models.Apps, TextField: 'Name', IdField: 'Id' },
        EditField: false,
        GridField: true,
      },
      {
        Name: 'Id',
        Label: 'Id',
        Type: 'Text',
        GridField: false,
        EditField: false,
      },
      {
        Name: 'UserName',
        Label: 'User name',
        Type: 'Text',
      },
      {
        Name: 'Registration',
        Label: 'Personal number',
        Type: 'Text',
        GridField: false,
      },
      {
        Name: 'LastName',
        Label: 'Last name',
        Type: 'Text',
      },
      { Name: 'FirstName', Label: 'First name', Type: 'Text' },
      {
        Name: 'Profession',
        Label: 'Profession',
        Type: 'Text',
        GridField: false,
      },
      {
        Name: 'License',
        Label: 'License number',
        Type: 'Text',
        GridField: false,
      },
      { Name: 'Email', Label: 'Email', Type: 'Text' },
      { Name: 'Telephone', Label: 'Telephone', Type: 'Text' },
      {
        Name: 'OrgName',
        Label: 'Organization name',
        Type: 'Text',
      },
      {
        Name: 'OrgAddress',
        Label: 'Organization address',
        Type: 'Text',
        GridField: false,
      },
      {
        Name: 'IsActive',
        Label: 'Status',
        Type: 'Boolean',
      },
      {
        Name: 'DeclineUserId',
        Label: 'Decline user',
        Type: 'Text',
        GridField: false,
        EditField: false,
      },
      {
        Name: 'ConfirmUserId',
        Label: 'Confirm user',
        Type: 'Text',
        GridField: false,
        EditField: false,
      },
      {
        Name: 'addr_prov_city',
        Label: 'Province/city',
        Type: 'SingleSelect',
        Config: {
          Model: Models.DictProvinceCity,
          IdField: 'id_data',
          TextField: 'name',
          MinTextLength: 1,
          //  SearchUrl: undefined
        },
        GridField: false,
      },

      {
        Name: 'addr_soum_dist',
        Label: 'Soum/district',
        Type: 'SingleSelect',
        Config: {
          SearchType: 'AllData',
          Model: Models.DictSoumDistrict,
          ObjectName: 'DictSoumDistrict',
          IdField: 'id_data',
          TextField: 'name',
          MinTextLength: 0,
          Fields: [
            { Name: 'id_data', Label: 'Id' },
            { Name: 'name', Label: 'Name' },
          ],
        },
        GridField: false,
      },
      {
        Name: 'addr_bag_khoroo',
        Label: 'Bag/khoroo',
        Type: 'SingleSelect',
        GridField: false,
        Config: {
          SearchType: 'AllData',
          Model: Models.DictBagKhoroo,
          ObjectName: 'DictBagKhoroo',
          IdField: 'id_data',
          TextField: 'name',
          MinTextLength: 0,
          Fields: [
            { Name: 'id_data', Label: 'Id' },
            { Name: 'name', Label: 'Name' },
          ],
        },
      },
      { Name: 'CreateDate', Label: 'Create date', Type: 'Date' },
    ],
  ];

  this.ObjectName = 'UserRequests';
  this.Model = Model;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'User requests',
    NewObjectTitle: 'User request create',
    EditObjectTitle: 'User request edit',
  };
}

module.exports = UserRequestsConfig;
