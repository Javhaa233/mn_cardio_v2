const { Models } = require('../config/DB');
const Model = Models.Advice;

function AdviceConfig() {
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
        Name: 'DoctorsProfile.FullName',
        Label: 'Doctor',
        Type: 'Text',
        Position: 1,
      },
      { Name: 'Users.UserName', Label: 'User name', Type: 'Text', Position: 1 },
      {
        Name: 'level',
        Label: 'Organization level',
        Type: 'SingleSelect',
        md: 4,
        OptionType: 'organization_level',
        Config: { IdField: 'Value', TextField: 'Label' },
        EditField: true,
        GridField: false,
        Position: 1,
      },
      {
        Name: 'addr_prov_city',
        Label: 'Province/city',
        Type: 'SingleSelectLoad',
        md: 4,
        Config: {
          ObjectName: 'DictProvinceCity',
          IdField: 'id_data',
          TextField: 'name',
          MinTextLength: 1,
          //  SearchUrl: undefined
        },
        GridField: false,
        Position: 1,
      },
      {
        Name: 'addr_soum_dist',
        Label: 'Soum/district',
        Type: 'GridLookUpSingle',
        md: 4,
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
            { Name: 'DictProvinceCity.name', Label: 'City' },
          ],
          //  SearchUrl: undefined
        },
        GridField: false,
        Position: 1,
      },
      {
        Name: 'addr_bag_khoroo',
        Label: 'Bag/khoroo',
        Type: 'GridLookUpSingleLoad',
        md: 4,
        GridField: false,
        Config: {
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
    ],
    [
      {
        Name: 'Patient.p_lastname',
        Label: 'Last name',
        Type: 'Text',
        EditField: false,
        Position: 1,
      },
      {
        Name: 'Patient.p_firstname',
        Label: 'First name',
        Type: 'Text',
        EditField: false,
        Position: 1,
      },
      {
        Name: 'Patient.p_registration',
        Label: 'Register',
        Type: 'Text',
        EditField: false,
        Position: 1,
      },
      {
        Name: 'DictProvinceCity.name',
        Label: 'Province/city',
        Type: 'Text',
        Position: 1,
        ReadOnly: true,
        GridField: false,
        EditField: false,
      },

      {
        Name: 'DictSoumDistrict.name',
        Label: 'Soum/district',
        Type: 'Text',
        Position: 1,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'DictBagKhoroo.name',
        Label: 'Bag/khoroo',
        Type: 'Text',
        Position: 1,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'level',
        Label: 'Level',
        Type: 'SingleSelect',
        md: 4,
        OptionType: 'organization_level',
        Config: { IdField: 'Value', TextField: 'Label' },
        EditField: false,
        GridField: false,
        Position: 1,
      },
      {
        Name: 'adv_id_patient',
        Label: 'Регистрийн дугаар',
        Type: 'GridLookUpSingleLoad',
        Config: {
          ObjectName: 'Patient',
          IdField: 'id_data',
          TextField: 'p_registration',
          Fields: [
            { Name: 'p_registration', Label: 'Register' },
            { Name: 'p_lastname', Label: 'Last name' },
            { Name: 'p_firstname', Label: 'first name' },
            { Name: 'DictProvinceCity.name', Label: 'City' },
          ],
          MinTextLength: '2',
        },
        md: 4,
        Position: 1,
        GridField: false,
      },
      {
        Name: 'adv_ticket_closed',
        Label: 'Ticket closed',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        ReadOnly: true,
        md: 4,
        OptionType: 'ticket_status',
        Position: 2,
      },
      {
        Name: 'date_modif',
        Label: 'Date de modification',
        Type: 'Date',
        md: 4,
        Position: 4,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'Users.UserName',
        Label: 'User',
        Type: 'Text',
        GridField: false,
        EditField: false,
      },
      {
        Name: 'id',
        Label: "Identifiant d'utilisateur",
        Type: 'SingleSelectLoad',
        Config: { ObjectName: 'Users', IdField: 'Id', TextField: 'UserName' },
        md: 4,
        Position: 5,
        GridField: false,
      },
      {
        Name: 'id_data',
        Label: 'Identifiant de la fiche',
        Type: 'Text',
        md: 4,
        Position: 6,
        EditField: false,
        GridField: false,
      },
      {
        Name: 'id_group',
        Label: 'Groupe',
        Type: 'Text',
        md: 4,
        Position: 7,
        GridField: false,
        EditField: false,
      },
      { Name: 'Body', Label: 'Body', Type: 'Text', EditField: false },
      {
        Name: 'vwAdviceInfo.CommentQty',
        Label: 'Comments',
        Type: 'Text',
        EditField: false,
      },

      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'rec_status',
        Position: 10,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'ticket_type',
        Label: 'Type',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'ticket_type',
        Position: 12,
      },
      {
        Name: 'user_mod',
        Label: 'Auteur de la derni',
        Type: 'Text',
        md: 4,
        Position: 13,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'date_creation',
        Label: 'Date de cr',
        Type: 'Date',
        md: 4,
        Position: 14,
        EditField: false,
      },
      {
        // Photos on a ticket. `File` is a single generic table keyed by
        // LinkedObjectName/LinkedObjectId/FieldName, so declaring this field
        // is the whole feature on the storage side - no DDL, nothing new
        // stored. The name must stay 'Files' to match AdviceCommentConfig and
        // DoctorsProfileConfig, because the frontend upload helper addresses
        // files by FieldName.
        Name: 'Files',
        Label: 'Photos',
        Type: 'File',
        md: 12,
        Position: 16,
        GridField: false,
        EditField: true,
      },
    ],
    [
      {
        Name: 'AdviceComment',
        Label: 'AdviceComment',
        Type: 'ListView',
        Config: {
          ObjectName: 'AdviceComment',
          Fields: ['dico', 'value'],
          ForiegnKey: 'adv_com_id_adv',
        },
        md: 12,
        Position: 15,
        GridField: false,
        EditField: true,
      },
    ],
  ];

  this.ObjectName = 'Advice';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Advice',
    NewObjectTitle: 'Advice create',
    EditObjectTitle: 'Advice edit',
  };
}

module.exports = AdviceConfig;
