const { Models } = require('../../config/DB');
const Model = Models.HfAmbulance;
const ModelLookUp = Models.HfAmbulanceLookUp;

function HfAmbulanceConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text' },
      { Name: 'is_confirm', Label: 'Батласан эсэх', Type: 'Text' },
      { Name: 'PatRegNo', Label: 'Personal number' },
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
      },
      { Name: 'CreatedDate', Label: 'Created Date', Type: 'Date' },
      {
        Name: 'UpdateUserId',
        Label: 'Update user',
        Type: 'SingelSelect',
        Config: { Model: Models.Users, IdField: 'Id', TextField: 'UserName' },
      },
      { Name: 'UpdatedDate', Label: 'Updated date', Type: 'Text' },
      {
        Name: 'ConfirmUserId',
        Label: 'Confirm user',
        Type: 'SingelSelect',
        Config: { Model: Models.Users, IdField: 'Id', TextField: 'UserName' },
      },
      { Name: 'ConfirmedDate', Label: 'Confirmed date', Type: 'Text' },

      {
        Name: 'diagnosed_year',
        Label: 'Зүрхний дутагдал оношлогдсон он',
        Type: 'Number',
      },
      { Name: 'ambulance_date', Label: 'Огноо', Type: 'Date' },
      {
        Name: 'ambulance_type',
        Label: 'Амбулаторийн төрөл',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'ambulance_type',
      },

      // emneleg
      {
        Name: 'organization_id',
        Label: 'Эрүүл мэндийн байгууллага',
        Type: 'GridLookUpSingleLoad',
        Config: {
          ObjectName: 'Organization',
          IdField: 'Id',
          TextField: 'Name',
          MinTextLength: 0,
          SearchType: 'AllData',
          Fields: [
            { Name: 'Id', Label: 'Id' },
            { Name: 'Name', Label: 'Name' },
          ],
        },
        DataFilter: [{ Field: 'level', Value: ['2', '3'], Op: 'In' }],
      },
      {
        Name: 'organization_other',
        Label: 'Эрүүл мэндийн байгууллага (Бусад)',
        Type: 'Text',
      },

      { Name: 'ad', Label: 'Артерийн даралт (мм.муб)', Type: 'Text' },
      {
        Name: 'ad_deed',
        Label: 'Артерийн даралт (систол) (мм.муб)',
        Type: 'Number',
      },
      {
        Name: 'ad_dood',
        Label: 'Артерийн даралт (диастол) (мм.муб)',
        Type: 'Number',
      },
      { Name: 'zts', Label: 'ЗЦТ (удаа/мин)', Type: 'Number' },
      { Name: 'jin', Label: 'Жин (кг)', Type: 'Number' },
      {
        Name: 'nyha',
        Label: 'Нью-Йоркийн үйл ажиллагааны ангилал (NYHA)',
        Type: 'RadioBox',
        OptionType: 'hf_nyha',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'heartache',
        Label: 'Одоогийн зовуурь',
        Type: 'CheckBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        LookUpConfig: {
          Model: ModelLookUp,
          ParentValueField: 'id_data',
          ChildValueField: 'value',
          IdField: 'id_lookup',
          Field: 'id_question',
        },
        Multiple: true,
        OptionType: 'heartache',
      },
      {
        Name: 'heartache_other',
        Label: 'Одоогийн зовуурь (Бусад)',
        Type: 'Text',
      },

      {
        Name: 'hf_zahiin_shinj',
        Label: 'ЗД-ын захын шинж тэмдэг',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'hf_zahiin_shinj_code',
        Label: 'ЗД-ын захын шинж тэмдэг',
        Type: 'CheckBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        LookUpConfig: {
          Model: ModelLookUp,
          ParentValueField: 'id_data',
          ChildValueField: 'value',
          IdField: 'id_lookup',
          Field: 'id_question',
        },
        Multiple: true,
        OptionType: 'hf_zahiin_shinj_code',
      },
      {
        Name: 'hf_uushig_shinj',
        Label: 'ЗД-ын уушгины шинж тэмдэг',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'hf_uushig_shinj_code',
        Label: 'ЗД-ын уушгины шинж тэмдэг',
        Type: 'CheckBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        LookUpConfig: {
          Model: ModelLookUp,
          ParentValueField: 'id_data',
          ChildValueField: 'value',
          IdField: 'id_lookup',
          Field: 'id_question',
        },
        Multiple: true,
        OptionType: 'hf_uushig_shinj_code',
      },
      {
        Name: 'hf_zurh_shinj',
        Label: 'ЗД-ын зүрхний шинж тэмдэг',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'hf_zurh_shinj_code',
        Label: 'ЗД-ын зүрхний шинж тэмдэг',
        Type: 'CheckBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        LookUpConfig: {
          Model: ModelLookUp,
          ParentValueField: 'id_data',
          ChildValueField: 'value',
          IdField: 'id_lookup',
          Field: 'id_question',
        },
        Multiple: true,
        OptionType: 'hf_zurh_shinj_code',
      },
      {
        Name: 'hf_hevliin_shinj',
        Label: 'ЗД-ын хэвлийн шинж тэмдэг',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'hf_hevliin_shinj_code',
        Label: 'ЗД-ын хэвлийн шинж тэмдэг',
        Type: 'CheckBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        LookUpConfig: {
          Model: ModelLookUp,
          ParentValueField: 'id_data',
          ChildValueField: 'value',
          IdField: 'id_lookup',
          Field: 'id_question',
        },
        Multiple: true,
        OptionType: 'hf_hevliin_shinj_code',
      },
    ],
  ];

  this.ObjectName = 'HfAmbulance';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Heart failure ambulance',
    NewObjectTitle: 'Heart failure ambulance create',
    EditObjectTitle: 'Heart failure ambulance edit',
  };
}

module.exports = HfAmbulanceConfig;
