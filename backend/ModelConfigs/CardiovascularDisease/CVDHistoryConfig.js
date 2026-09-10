const { Models } = require('../../config/DB');
const Model = Models.CVDHistory;

function CVDHistoryConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text' },
      { Name: 'MonitoringId', Label: 'CVDMonitoring Id', Type: 'Number' },
      {
        Name: 'BuurniiArhagUwchin',
        Label: '1. ЧШ-ийн нефропати-г оролцуулаад бөөрний архаг өвчтэй эсэх',
        Type: 'RadioBox',
        OptionType: 'yorn_mn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'Holestrin',
        Label: '2. Батлагдсан эсвэл нийт холестрин өндөртэй эсэх',
        Type: 'RadioBox',
        OptionType: 'yorn_mn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'TsusniiSahar',
        Label: '3. Батлагдсан ЧШ эсвэл цусны сахар өндөртэй эсэх',
        Type: 'RadioBox',
        OptionType: 'yorn_mn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'ZurkhShigdees',
        Label: '4. Өмнө нь зүрхний шигдээс болж байсан эсэх',
        Type: 'RadioBox',
        OptionType: 'yorn_mn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'TarkhiHarvalt',
        Label: '5. Өмнө нь тархины харвалт болж байсан эсэх',
        Type: 'RadioBox',
        OptionType: 'yorn_mn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'Stenokardi',
        Label: '6. Стенокарди/ цээжний бахтай байсан эсэх',
        Type: 'RadioBox',
        OptionType: 'yorn_mn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'TsusHomsroh',
        Label: '7. Тархины цус хомсрох түр зуурын дайрлага болж байсан эсэх',
        Type: 'RadioBox',
        OptionType: 'yorn_mn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'ZahiinSudas',
        Label: '8. Захын судасны өвчтэй эсэх',
        Type: 'RadioBox',
        OptionType: 'yorn_mn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'GerbulNasbaralt',
        Label: '9. Гэр бүлд ЗСӨ-ний цаг бусын (эм>65, эр >55) нас баралтын түүх байсан эсэх',
        Type: 'RadioBox',
        OptionType: 'yorn_mn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'TamkhiTatdag',
        Label:
          '10. Тамхи хэрэглэж байгаа эсэх /тамхинаас гараад 12 сар болоогүй бол татдаг гэж тооцно/',
        Type: 'RadioBox',
        OptionType: 'yorn_mn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      // Additional
      {
        Name: 'IsDaraltEm',
        Label: 'Цусны даралт бууруулах эм хэрэглэж байсан  эсэх ',
        Type: 'RadioBox',
        OptionType: 'yorn_mn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'IsDiabeticEm',
        Label: 'ЧШ-гийн эм хэрэглэж байсан эсэх ',
        Type: 'RadioBox',
        OptionType: 'yorn_mn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      { Name: 'CreateDate', Label: 'Created Date', Type: 'Date' },
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

  this.ObjectName = 'CVDHistory';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Cardiovascular disease history',
    NewObjectTitle: 'Cardiovascular disease history create',
    EditObjectTitle: 'Cardiovascular disease history edit',
  };
}

module.exports = CVDHistoryConfig;
