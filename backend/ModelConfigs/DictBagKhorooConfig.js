const { Models } = require('../config/DB');
const Model = Models.DictBagKhoroo;

function DictBagKhorooConfig() {
  this.Fields = [
    [
      {
        Name: 'DictSoumDistrict.name',
        Label: 'Soum/district',
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
        Name: 'id_soum',
        Label: 'Soum/District name',
        Type: 'SingleSelectLoad',
        Config: {
          ObjectName: 'DictSoumDistrict',
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
        Label: 'Bag/Khoroo name',
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
  ];

  this.ObjectName = 'DictBagKhoroo';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Dictionary for bag/khoroo',
    NewObjectTitle: 'Dictionary for bag/khoroo create',
    EditObjectTitle: 'Dictionary for bag/khoroo edit',
  };
}

module.exports = DictBagKhorooConfig;
