const { Models } = require('../../config/DB');
const Model = Models.HfLifeStory;

function HfLifeStoryConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Number' },
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
        Name: 'AskedLife',
        Label: 'Иргэний амьдралын хэв маяг ба амьдралын чанарын хэсгийн асуултуудыг асуусан уу?',
        Type: 'RadioBox',
        OptionType: 'yorn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'Marriage',
        Label: 'Гэрлэлт',
        Type: 'RadioBox',
        OptionType: 'marriage',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'WorkCondition',
        Label: 'Ажлын нөхцөл',
        Type: 'RadioBox',
        OptionType: 'hf_work_condition',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'PhysicalTherapy',
        Label: 'Хөдөлгөөн засал эмчилгээнд хамрагдсан байдал',
        Type: 'RadioBox',
        OptionType: 'yorn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'HfEducation',
        Label: 'Зүрхний дутагдлын боловсрол олгох сургалтын хөтөлбөр',
        Type: 'RadioBox',
        OptionType: 'yorn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'Smoking',
        Label: 'Тамхи татах зуршил',
        Type: 'RadioBox',
        OptionType: 'hf_smoking',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'DrinkingWeekly',
        Label: 'Архи, Та долоо хоногт хэдэн удаа стандарт уулт ууж байна вэ?',
        Type: 'RadioBox',
        OptionType: 'hf_alcohol',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'DrinkingLoop',
        Label:
          'Архи, Та хэр давтамжтай стандарт уулт уудаг вэ? (Эмэгтэй бол 4 стандарт уулт, эрэгтэй бол 5 стандарт уулт)',
        Type: 'RadioBox',
        OptionType: 'hf_alcohol_loop',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'Fatigue',
        Label: 'Ядрах',
        Type: 'RadioBox',
        OptionType: 'hf_fatigue',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'Dyspnea',
        Label: 'Амьсгаадах',
        Type: 'RadioBox',
        OptionType: 'hf_dyspnea',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'PhysicalActivity',
        Label: 'Хөдөлгөөний идэвхи',
        Type: 'RadioBox',
        OptionType: 'hf_physical_activity',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'SelfService',
        Label: 'Өөрөө өөртөө үйлчлэх',
        Type: 'RadioBox',
        OptionType: 'hf_self_service',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'DailyActivity',
        Label: 'Өдөр тутмын амьдралын идэвхи',
        Type: 'RadioBox',
        OptionType: 'hf_daily_activity',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'PainDiscomfort',
        Label: 'Өвдөлт, тааламжгүй байдал',
        Type: 'RadioBox',
        OptionType: 'hf_pain_discomfort',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'Anxiety',
        Label: 'Сэтгэл түгжилт, сэтгэл гутрал',
        Type: 'RadioBox',
        OptionType: 'hf_anxiety',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      { Name: 'LifeQuality', Label: 'Амьдралын чанар', Type: 'Number' },
      // 0-100 (100=Өөрийн эрүүл мэндээ маш сайнаар төсөөлж байна)
      // 0=Өөрийн эрүүл мэндээ маш муугаар төсөөлж байна
      {
        Name: 'hist_hf',
        Label: 'Өмнө нь зүрхний шигдээсээр өвдсөн',
        Type: 'RadioBox',
        OptionType: 'yorn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'hist_revasc',
        Label: 'Титэм судасны цусан хангамж сэргээх',
        Type: 'RadioBox',
        OptionType: 'hf_hist_revasc',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'hist_hypertension',
        Label: 'Артерийн гипертензи',
        Type: 'RadioBox',
        OptionType: 'yorn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'hist_attrfib',
        Label: 'Тосгуурын жирвэгнээ / чичиргээ',
        Type: 'RadioBox',
        OptionType: 'yorn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'hist_diabetes',
        Label: 'Чихрийн шижин',
        Type: 'RadioBox',
        OptionType: 'hf_hist_diabetes',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'hist_copd',
        Label: 'Уушгины архаг бөглөрөлтөт өвчин',
        Type: 'RadioBox',
        OptionType: 'yorn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'hist_valvedisease',
        Label: 'Зүрхний хавхлагын өвчин',
        Type: 'RadioBox',
        OptionType: 'yorn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'hist_valvesurgery',
        Label: 'Зүрхний хавхлагын мэс засал',
        Type: 'RadioBox',
        OptionType: 'hf_hist_valvesurgery',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'hist_dcm',
        Label: 'Тэлэгдлийн кардиомиопати',
        Type: 'RadioBox',
        OptionType: 'yorn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'hist_primary',
        Label: 'Анхдагч шалтгаан',
        Type: 'RadioBox',
        OptionType: 'hf_hist_primary',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
    ],
  ];

  this.ObjectName = 'HfLifeStory';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Life Story',
    NewObjectTitle: 'Life Story create',
    EditObjectTitle: 'Life Story edit',
  };
}

module.exports = HfLifeStoryConfig;
