const { Models } = require('../../config/DB');
const Model = Models.HfLabTreatment;

function HfLabTreatmentConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text' },
      { Name: 'HfStayId', Label: 'Hf Stay Id', Type: 'Text' },
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
      { Name: 'CreatedDate', Label: 'Created Date', Type: 'Date' },
      {
        Name: 'Killip',
        Label: 'Хэвтэх үе Киллипийн ангилал',
        Type: 'RadioBox',
        OptionType: 'hf_killip',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      { Name: 'Height', Label: 'Өндөр (см)', Type: 'Number' },
      { Name: 'a_weight', Label: 'Жин (кг)', Type: 'Number' },
      { Name: 'a_sys', Label: 'Систолын даралт', Type: 'Number' },
      { Name: 'a_dias', Label: 'Диастолын даралт', Type: 'Number' },
      { Name: 'a_hrate', Label: 'ЗЦТ (удаа/мин)', Type: 'Number' },
      { Name: 'a_hb', Label: 'Гемоглобин', Type: 'Number' },
      { Name: 'a_creat', Label: 'Креатинин', Type: 'Number' },
      { Name: 'a_kali', Label: 'Кали', Type: 'Number' },
      { Name: 'a_natri', Label: 'Натри', Type: 'Number' },
      { Name: 'a_ntprobnp', Label: 'NT-pro.BNP', Type: 'Number' },
      { Name: 'a_bnp', Label: 'BNP', Type: 'Number' },
      { Name: 'b_weight', Label: 'Жин (кг)', Type: 'Number' },
      { Name: 'b_sys', Label: 'Систолын даралт', Type: 'Number' },
      { Name: 'b_dias', Label: 'Диастолын даралт', Type: 'Number' },
      { Name: 'b_hrate', Label: 'ЗЦТ (удаа/мин)', Type: 'Number' },
      { Name: 'b_hb', Label: 'Гемоглобин', Type: 'Number' },
      { Name: 'b_creat', Label: 'Креатинин', Type: 'Number' },
      { Name: 'b_kali', Label: 'Кали', Type: 'Number' },
      { Name: 'b_natri', Label: 'Натри', Type: 'Number' },
      { Name: 'b_ntprobnp', Label: 'NT-pro.BNP', Type: 'Number' },
      { Name: 'b_bnp', Label: 'BNP', Type: 'Number' },
      { Name: 'b_ferrit', Label: 'Ферритин', Type: 'Number' },
      { Name: 'b_transferrin', Label: 'Трансферрины ханалт', Type: 'Number' },
      {
        Name: 'Nyha',
        Label: 'Нью-Йоркийн ангилал',
        Type: 'RadioBox',
        OptionType: 'hf_nyha',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'EcgRhythm',
        Label: 'ЗЦБ хэмнэл',
        Type: 'RadioBox',
        OptionType: 'hf_ecg_rhythm',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'Lbbb',
        Label: 'Гиссийн зүүн хөлийн хориг',
        Type: 'RadioBox',
        OptionType: 'yorn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      { Name: 'Qrs', Label: 'QRS өргөн', Type: 'Text' },
      {
        Name: 'LvefMethod',
        Label: 'EF тодорхойлсон аргачлал',
        Type: 'RadioBox',
        OptionType: 'hf_lvef_method',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      { Name: 'LvefDate', Label: 'EF тодорхойлсон огноо', Type: 'Date' },
      {
        Name: 'Lvef',
        Label: 'EF%',
        Type: 'RadioBox',
        OptionType: 'hf_lvef',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'ChestXray',
        Label: 'Цээжний рентген дүгнэлт',
        Type: 'RadioBox',
        OptionType: 'hf_chest_xray',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'Spirometry',
        Label: 'Спирометрийн дүгнэлт',
        Type: 'RadioBox',
        OptionType: 'yorn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'DiuerticDone',
        Label: 'Гогцооны шээс хөөгч',
        Type: 'RadioBox',
        OptionType: 'yorn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      { Name: 'DiureticDate', Label: 'Тийм бол, огноо', Type: 'DateTime' },
      {
        Name: 'Inotropic',
        Label: 'Төлөвлөөгүй инотроп дэмжлэг',
        Type: 'RadioBox',
        OptionType: 'hf_inotropic',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
    ],
  ];

  this.ObjectName = 'HfLabTreatment';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Heart Failure Lab Treatment',
    NewObjectTitle: 'Heart Failure Lab Treatment create',
    EditObjectTitle: 'Heart Failure Lab Treatment edit',
  };
}

module.exports = HfLabTreatmentConfig;
