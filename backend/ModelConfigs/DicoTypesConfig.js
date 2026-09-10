const { Models } = require('../config/DB');
const Model = Models.DicoType;

function DicoTypesConfig() {
  this.Fields = [
    [
      {
        Name: 'dico',
        Label: 'Type',
        Type: 'Text',
        md: 6,
        Position: 1,
        EditField: true,
      },
      {
        Name: 'Name',
        Label: 'Name',
        Type: 'TextArea',
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
        Name: 'OptionTypes',
        Label: 'OptionTypes',
        Type: 'ListView',
        Config: {
          ObjectName: 'OptionTypes',
          Fields: ['dico', 'value'],
          ForiegnKey: 'dico',
        },
        md: 12,
        Position: 1,
        GridField: false,
        EditField: true,
      },
    ],
  ];

  this.ObjectName = 'DicoType';
  this.Model = Model;
  this.PK = 'dico';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Dico type',
    NewObjectTitle: 'Dico type create',
    EditObjectTitle: 'Dico type edit',
  };
}

module.exports = DicoTypesConfig;
