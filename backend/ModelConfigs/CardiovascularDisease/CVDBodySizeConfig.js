const { Models } = require('../../config/DB');
const Model = Models.CVDBodySize;

function CVDBodySizeConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text', EditField: false },
      { Name: 'MonitoringId', Label: 'CVDMonitoring Id', Type: 'Number' },
      { Name: 'Height', Label: 'Өндөр (см)', Type: 'Number' },
      { Name: 'Weigth', Label: 'Жин (кг)', Type: 'Number' },
      {
        Name: 'Buselkhii',
        Label: 'Бүсэлхийн тойргийн хэмжээ /см/',
        Type: 'Number',
      },
      { Name: 'BJI', Label: 'БЖИ (кг/м2)', Type: 'Number' },
      { Name: 'Tailbar', Label: 'Тайлбар', Type: 'Text' },
      { Name: 'HeartRate', Label: 'ЗЦТ (удаа/мин)', Type: 'Number' },
      { Name: 'RespiratoryRate', Label: 'Амьсгалын тоо', Type: 'Number' },
      { Name: 'Temperature', Label: 'Температур', Type: 'Number' },
      { Name: 'Saturatsi', Label: 'Сатураци', Type: 'Number' },
      { Name: 'Sahar', Label: 'Сахар mmol/m', Type: 'Number' },
      { Name: 'Cholesterol', Label: 'Холестерин mmol/m', Type: 'Number' },
      { Name: 'DaraltDeed', Label: 'Даралт (систол)', Type: 'Number' },
      { Name: 'DaraltDood', Label: 'Даралт (диастол)', Type: 'Number' },
      {
        Name: 'UlunGlucose',
        Label: 'Өлөн үеийн цусны глюкозын хэмжээ',
        Type: 'Number',
      },
      {
        Name: 'SanamsarguiGlucose',
        Label: 'Санамсаргүй үеийн цусны глюкозын хэмжээ',
        Type: 'Number',
      },
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

  this.ObjectName = 'CVDBodySize';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Cardiovascular disease body size',
    NewObjectTitle: 'Cardiovascular disease body size create',
    EditObjectTitle: 'Cardiovascular disease body size edit',
  };
}

module.exports = CVDBodySizeConfig;
