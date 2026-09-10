const { Models } = require('../../config/DB');
const Model = Models.CVDControlAndTransition;

function CVDControlAndTransitionConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text', EditField: false },
      { Name: 'MonitoringId', Label: 'CVDMonitoring Id', Type: 'Number' },

      // Hyanaltand oroh
      {
        Name: 'HynaltandOrson',
        Label: 'Хяналтанд орсон',
        Type: 'RadioBox',
        OptionType: 'yorn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'HynaltandOrsonTorol',
        Label: 'Хяналтанд орсон төрөл',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Лавлагаа тусламжаас ирсэн', Value: '1' },
          { Label: 'Эрсдэлд суурилсан хяналт', Value: '2' },
        ],
      },

      // Hyanaltnaas garah
      {
        Name: 'HynaltandDahihHugatsaa',
        Label: 'Хяналтанд дахин үзүүлэх хугацаа',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: '1 сар', Value: '1' },
          { Label: '3 сар', Value: '2' },
          { Label: '6 сар', Value: '3' },
          { Label: '12 сар', Value: '4' },
        ],
      },
      {
        Name: 'Lavlagaa',
        Label: 'Лавлагаа тусламжаас авсан зөвлөмжийн дагуу хянана',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          {
            Label: 'Лавлагаа тусламжаас авсан зөвлөмжийн дагуу хянана',
            Value: '1',
          },
        ],
      },
      {
        Name: 'HynaltiinUzleg',
        Label: 'Хяналтын үзлэгт хамрагдсан эсэх',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Хугацаандаа ирсэн', Value: '1' },
          { Label: 'Хугацаанаас өмнө', Value: '2' },
          { Label: 'Хожимдож ирсэн', Value: '3' },
        ],
      },
      {
        Name: 'HynaltaasGarsan',
        Label: 'Хяналтаас гарсан',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Сайжирсан', Value: '1' },
          { Label: 'Шилжсэн', Value: '2' },
          { Label: 'Нас барсан', Value: '3' },
          { Label: 'Тодорхойгүй', Value: '4' },
        ],
      },
      {
        Name: 'Tamhi',
        Label: 'Тамхи татсаар байгаа эсэх',
        Type: 'RadioBox',
        OptionType: 'yorn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'EmiinTorol',
        Label: 'Эмчилгээнд ууж байгаа эмийн төрөл',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Статин', Value: '1' },
          { Label: 'Аспирин', Value: '2' },
          { Label: 'АД буулгах эм', Value: '3' },
        ],
      },
      {
        Name: 'EmiinNer',
        Label: 'Эмчилгээнд ууж байгаа эмийн нэр',
        Type: 'Text',
      },
      {
        Name: 'Glucose',
        Label: 'HbA1c глюкозжсон гемоглобин хэмжээ',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: '6.5% их', Value: '1' },
          { Label: '6.5% бага', Value: '2' },
        ],
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

  this.ObjectName = 'CVDControlAndTransition';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Cardiovascular disease control, transition',
    NewObjectTitle: 'Cardiovascular disease control, transition create',
    EditObjectTitle: 'Cardiovascular disease control, transition edit',
  };
}

module.exports = CVDControlAndTransitionConfig;
