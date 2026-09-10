const { Models } = require('../config/DB');
const Model = Models.RiskScores;

function RiskScoresConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text' },
      {
        Name: 'CreateUserId',
        Label: 'Created user',
        Type: 'SingleSelectLoad',
        Config: { ObjectName: 'Users', IdField: 'Id', TextField: 'UserName' },
      },
      { Name: 'CreatedDate', Label: 'Create date', Type: 'Date' },

      { Name: 'isCholestrol', Label: 'Холестрин үзсэн эсэх', Type: 'Text' },
      { Name: 'isDiabetes', Label: 'Чихрийн шижинтэй эсэх', Type: 'Text' },
      { Name: 'isSmoker', Label: 'Тамхи татдаг эсэх', Type: 'Text' },
      { Name: 'minAge', Label: 'Нас', Type: 'Text' },
      { Name: 'maxAge', Label: 'Нас', Type: 'Text' },
      { Name: 'minCholestrol', Label: 'Холестрин', Type: 'Text' },
      { Name: 'maxCholestrol', Label: 'Холестрин', Type: 'Text' },
      { Name: 'minPressure', Label: 'Даралт', Type: 'Text' },
      { Name: 'maxPressure', Label: 'Даралт', Type: 'Text' },
      { Name: 'minBMI', Label: 'БЖИ (кг/м2)', Type: 'Text' },
      { Name: 'maxBMI', Label: 'БЖИ (кг/м2)', Type: 'Text' },
      { Name: 'risk', Label: 'Хувь', Type: 'Text' },
      { Name: 'score', Label: 'Оноо', Type: 'Text' },
    ],
  ];

  this.ObjectName = 'RiskScores';
  this.Model = Model;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Risk scores',
    NewObjectTitle: 'Risk score create',
    EditObjectTitle: 'Risk score edit',
  };
}

module.exports = RiskScoresConfig;
