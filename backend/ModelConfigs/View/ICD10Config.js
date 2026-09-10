const { Models } = require('../../config/DB');
const Model = Models.vwICD10;
var DicoType = Models.DicoType;

function ICD10Config() {
  this.Fields = [
    [
      {
        Name: 'id_dico',
        Label: 'Id',
        Type: 'Text',
        GridField: false,
        EditField: false,
      },
      {
        Name: 'dico',
        Label: 'Type',
        Type: 'SingleSelect',
        Config: {
          Model: DicoType,
          ObjectName: 'DicoType',
          IdField: 'dico',
          TextField: 'Name',
          MinTextLength: 1,
        },
        GridField: false,
      },
      { Name: 'DicoType.Name', Label: 'Type', Type: 'Text', EditField: false },
      { Name: 'label', Label: 'Name', Type: 'Text' },
      { Name: 'value', Label: 'Value', Type: 'Text' },
      { Name: 'pos', Label: 'Position', Type: 'Text' },
      { Name: 'translate_flag', Label: 'Translate', Type: 'Text' },
    ],
  ];

  this.ObjectName = 'vwICD10';
  this.Model = Model;
  this.PK = 'id_dico';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'vwICD10',
    NewObjectTitle: 'vwICD10 show',
    EditObjectTitle: 'vwICD10 show',
  };
}

module.exports = ICD10Config;
