const { Models } = require('../../config/DB');
const Model = Models.CVDRisk;

function CVDRiskConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text' },
      { Name: 'MonitoringId', Label: 'CVDMonitoring Id', Type: 'Number' },
      { Name: 'Score', Label: 'Эрсдлийн хувь', Type: 'Number' },
      { Name: 'Risk', Label: 'Эрсдлийн түвшин', Type: 'Number' },
      { Name: 'DoctorAdvice', Label: 'Өгсөн зөвлөгөө', Type: 'TextArea' },

      { Name: 'CreateDate', Label: 'Create Date', Type: 'Date' },
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

  this.ObjectName = 'CVDRisk';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Cardiovascular disease risk',
    NewObjectTitle: 'Cardiovascular disease risk create',
    EditObjectTitle: 'Cardiovascular disease risk edit',
  };
}

module.exports = CVDRiskConfig;
