const { Models } = require('../config/DB');
const Model = Models.AdviceViews;

function AdviceViewsConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text', GridField: false },
      {
        Name: 'AdviceId',
        Label: 'Advice',
        Type: 'SingleSelectLoad',
        Config: {
          ObjectName: 'Advice',
          IdField: 'id_data',
          TextField: 'id_data',
          MinTextLength: 0,
        },
      },
      { Name: 'ViewDate', Label: 'View date', Type: 'Date' },
      { Name: 'Users.UserName', Label: 'User', Type: 'Text' },
      {
        Name: 'UserId',
        Label: 'User',
        Type: 'SingleSelect',
        Config: {
          Model: Models.Users,
          IdField: 'Id',
          TextField: 'UserName',
          MinTextLength: 0,
        },
      },
    ],
  ];

  this.ObjectName = 'AdviceViews';
  this.Model = Model;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Advice views',
    NewObjectTitle: 'Advice views create',
    EditObjectTitle: 'Advice views edit',
  };
}

module.exports = AdviceViewsConfig;
