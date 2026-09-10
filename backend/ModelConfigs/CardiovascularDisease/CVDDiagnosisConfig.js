const { Models } = require('../../config/DB');
const Model = Models.CVDDiagnosis;

function CVDDiagnosisConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text' },
      { Name: 'MonitoringId', Label: 'CVDMonitoring Id', Type: 'Number' },

      { Name: 'MainDiagnosis', Label: 'Онош', Type: 'Text' },

      { Name: 'Comment', Label: 'Тайлбар', Type: 'Text' },
      { Name: 'CreatedDate', Label: 'Created Date', Type: 'Date' },
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
    ],
  ];

  this.ObjectName = 'CVDDiagnosis';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Cardiovascular disease disagnosis',
    NewObjectTitle: 'Cardiovascular disease disagnosis create',
    EditObjectTitle: 'Cardiovascular disease disagnosis edit',
  };
}

module.exports = CVDDiagnosisConfig;
