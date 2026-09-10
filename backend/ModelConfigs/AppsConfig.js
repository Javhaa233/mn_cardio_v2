const { Models } = require('../config/DB');
const Model = Models.Apps;

function AppsConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text', GridField: false },
      { Name: 'Name', Label: 'Name', Type: 'Text', md: 4, Position: 1 },
      { Name: 'Code', Label: 'Code', Type: 'Text', md: 6, Position: 1 },
      { Name: 'Description', Label: 'Description', Type: 'Text' },
    ],
  ];

  this.ObjectName = 'Apps';
  this.Model = Model;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'App',
    NewObjectTitle: 'App create',
    EditObjectTitle: 'App edit',
  };
}

module.exports = AppsConfig;
