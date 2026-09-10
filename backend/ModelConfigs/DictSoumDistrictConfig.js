const { Models } = require('../config/DB');
const Model = Models.DictSoumDistrict;

function DictSoumDistrictConfig() {
  this.Fields = [
    [
      {
        Name: 'DictProvinceCity.name',
        Label: 'Province/city',
        Type: 'Text',
        Position: 0,
        GridField: true,
        EditField: false,
      },
      {
        Name: 'short_name',
        Label: 'Province/City short name',
        Type: 'Text',
        md: 4,
        Position: 0,
        EditField: true,
      },
      {
        Name: 'id_province',
        Label: 'Province/City ID',
        Type: 'SingleSelectLoad',
        Config: {
          ObjectName: 'DictProvinceCity',
          MinTextLength: 1,
          IdField: 'id_data',
          TextField: 'name',
        },
        md: 4,
        Position: 6,
        GridField: false,
      },
      {
        Name: 'name',
        Label: 'Soum/District name',
        Type: 'Text',
        md: 4,
        Position: 1,
        EditField: true,
      },
      {
        Name: 'date_creation',
        Label: 'Creation date',
        Type: 'Date',
        md: 4,
        Position: 2,
        GridField: true,
        EditField: false,
      },
      {
        Name: 'date_modif',
        Label: 'Update date',
        Type: 'Date',
        md: 4,
        Position: 2,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'id',
        Label: 'User ID',
        Type: 'Text',
        md: 4,
        Position: 3,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'id_data',
        Label: 'Record ID',
        Type: 'Text',
        md: 4,
        Position: 4,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'id_group',
        Label: 'Group',
        Type: 'Text',
        md: 4,
        Position: 5,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'rec_status',
        Position: 10,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'user_mod',
        Label: 'Last update author',
        Type: 'Text',
        md: 4,
        Position: 12,
        GridField: false,
        EditField: false,
      },
    ],
    [
      {
        Name: 'DictBagKhoroo',
        Label: 'DictBagKhoroo',
        Type: 'ListView',
        Config: {
          ObjectName: 'DictBagKhoroo',
          Fields: ['dico', 'value'],
          ForiegnKey: 'id_soum',
        },
        md: 12,
        Position: 1,
        GridField: false,
        EditField: true,
      },
    ],
  ];

  this.ObjectName = 'DictSoumDistrict';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Dictionary for soum/district',
    NewObjectTitle: 'Dictionary for soum/district create',
    EditObjectTitle: 'Dictionary for soum/district edit',
  };
}

module.exports = DictSoumDistrictConfig;
