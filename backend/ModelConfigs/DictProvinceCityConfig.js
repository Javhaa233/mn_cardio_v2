const { Models } = require('../config/DB');
const Model = Models.DictProvinceCity;

function DictProvinceCityConfig() {
  this.Fields = [
    [
      {
        Name: 'name',
        Label: 'Province/City name',
        Type: 'Text',
        md: 4,
        Position: 0,
        EditField: true,
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
        Name: 'date_creation',
        Label: 'Creation date',
        Type: 'Date',
        md: 4,
        Position: 1,
        EditField: false,
      },
      {
        Name: 'date_modif',
        Label: 'Update date',
        Type: 'Date',
        md: 4,
        Position: 2,
        EditField: false,
        GridField: false,
      },
      {
        Name: 'id',
        Label: 'User ID',
        Type: 'Text',
        md: 4,
        Position: 3,
        EditField: false,
        GridField: false,
      },
      {
        Name: 'id_data',
        Label: 'Record ID',
        Type: 'Text',
        md: 4,
        Position: 4,
        EditField: false,
        GridField: false,
      },
      {
        Name: 'id_group',
        Label: 'Group',
        Type: 'Text',
        md: 4,
        Position: 5,
        EditField: false,
        GridField: false,
      },
      {
        Name: 'is_city',
        Label: 'Is city',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'yorn',
        Position: 7,
        GridField: false,
      },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'rec_status',
        Position: 10,
        EditField: false,
        GridField: false,
      },
      {
        Name: 'user_mod',
        Label: 'Last update author',
        Type: 'Text',
        md: 4,
        Position: 12,
        EditField: false,
        GridField: false,
      },
    ],
    [
      {
        Name: 'DictSoumDistrict',
        Label: 'DictSoumDistrict',
        Type: 'ListView',
        Config: {
          ObjectName: 'DictSoumDistrict',
          Fields: ['dico', 'value'],
          ForiegnKey: 'id_province',
        },
        md: 12,
        Position: 1,
        GridField: false,
        EditField: true,
      },
    ],
  ];

  this.ObjectName = 'DictProvinceCity';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Dictionary for province/city',
    NewObjectTitle: 'Dictionary for province/city create',
    EditObjectTitle: 'Dictionary for province/city edit',
  };
}

module.exports = DictProvinceCityConfig;
