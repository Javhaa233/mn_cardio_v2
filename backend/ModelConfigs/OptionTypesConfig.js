const { Models } = require('../config/DB');
const Model = Models.OptionTypes;

function OptionTypesConfig() {
  this.Fields = [
    [
      {
        Name: 'id_dico',
        Label: 'Id',
        Type: 'Text',
        md: 6,
        Position: 1,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'dico',
        Label: 'Type',
        Type: 'SingleSelect',
        md: 6,
        Config: {
          Model: Models.DicoType,
          ObjectName: 'DicoType',
          IdField: 'dico',
          TextField: 'Name',
          MinTextLength: 1,
          // SearchUrl: undefined
        },
        Position: 1,
        GridField: false,
        EditField: true,
      },
      {
        Name: 'DicoType.Name',
        Label: 'Type',
        Type: 'Text',
        md: 6,
        Position: 1,
        EditField: false,
      },
      {
        Name: 'label',
        Label: 'Name',
        Type: 'Text',
        md: 6,
        Position: 1,
        EditField: true,
      },
      {
        Name: 'value',
        Label: 'Value',
        Type: 'Text',
        md: 6,
        Position: 1,
        EditField: true,
      },
      {
        Name: 'pos',
        Label: 'Position',
        Type: 'Number',
        md: 6,
        Position: 1,
        EditField: true,
      },
      {
        Name: 'translate_flag',
        Label: 'Translate',
        Type: 'Number',
        md: 6,
        Position: 1,
        EditField: false,
        GridField: false,
      },
    ],
  ];

  this.ObjectName = 'OptionTypes';
  this.Model = Model;
  this.PK = 'id_dico';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Option type',
    NewObjectTitle: 'Option type create',
    EditObjectTitle: 'Option type edit',
  };
}

module.exports = OptionTypesConfig;
