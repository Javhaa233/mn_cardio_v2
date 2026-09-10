const { Models } = require('../../config/DB');
const Model = Models.CVDManagement;

function CVDManagementConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text' },
      { Name: 'MonitoringId', Label: 'CVDMonitoring Id', Type: 'Number' },
      {
        Name: 'DiagnosedArterHypertension',
        Label: "Оношлогдсон 'Артерийн даралт' (I10)",
        Type: 'RadioBox',
        OptionType: 'yorn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'DiagnosedDiabetes',
        Label: "Оношлогдсон 'Чихрийн шижин' (E11.9)",
        Type: 'RadioBox',
        OptionType: 'yorn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'PreventiveTreatment',
        Label:
          'Зүрхний шигдээс, тархины харвалтын хоёрдогч урьдчилан сэргийлэх эмчилгээ хийлгэж байгаа эсэх',
        Type: 'RadioBox',
        OptionType: 'yorn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'IsSentLavlagaa',
        Label: 'Лавлагаа тусламжинд илгээх эсэх',
        Type: 'RadioBox',
        OptionType: 'yorn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'IsAdviceFromLavlagaa',
        Label: 'Лавлагаа тусламжаас зөвлөмжтэй ирсэн эсэх',
        Type: 'RadioBox',
        OptionType: 'yorn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      { Name: 'FutureAdvice', Label: 'Цаашдын зөвлөгөө', Type: 'Text' },

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

  this.ObjectName = 'CVDManagement';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Cardiovascular management',
    NewObjectTitle: 'Cardiovascular management create',
    EditObjectTitle: 'Cardiovascular management edit',
  };
}

module.exports = CVDManagementConfig;
