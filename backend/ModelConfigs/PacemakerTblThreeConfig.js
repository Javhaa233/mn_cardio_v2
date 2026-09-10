const { Models } = require('../config/DB');
const Model = Models.PacemakerTblThree;
var ModelLookUp = Models.PacemakerTblThreeLookUp;

function PacemakerTblThreeConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text' },
      {
        Name: 'pat_id_data',
        Label: 'Patient ID',
        Type: 'GridLookUpSingleLoad',
        Config: {
          ObjectName: 'Patient',
          IdField: 'id_data',
          TextField: 'p_registration',
          Fields: [
            // { Name: "id_data", Label: "Id" },
            { Name: 'p_lastname', Label: 'Last name' },
            { Name: 'p_firstname', Label: 'first name' },
            { Name: 'p_registration', Label: 'Register' },
            { Name: 'DictProvinceCity.name', Label: 'City' },
          ],
          MinTextLength: '2',
        },
      },
      { Name: 'stay_id_data', Label: 'stay_id_data', Type: 'Text' },
      { Name: 'user_mod', Label: 'user_mod', Type: 'Text' },
      { Name: 'date_created', Label: 'date_created', Type: 'Text' },
      { Name: 'tbl_two_id', Label: 'tbl_two_id', Type: 'Text' },
      {
        Name: 'treatment_name',
        Label: 'Төлөвлөсөн эмчилгээний нэр',
        Type: 'Text',
      },
      {
        Name: 'clinical_diagnosis',
        Label: 'Клиник оношийн үндэслэл',
        Type: 'Text',
      },
      {
        Name: 'started_date',
        Label: 'Эхэлсэн огноо, цаг, минут',
        Type: 'Date',
      },
      { Name: 'started_hour', Label: 'цаг', Type: 'Text' },
      { Name: 'started_min', Label: 'минут', Type: 'Text' },
      { Name: 'dur_hour', Label: 'Үргэлжилсэн цаг, минут', Type: 'Text' },
      { Name: 'dur_min', Label: 'минут', Type: 'Text' },
      {
        Name: 'scriptum',
        Label: 'Байнгын пейсмейкер суулгах эмчилгээний бичлэг',
        Type: 'Text',
      },
      { Name: 'xray_dose', Label: 'Рентген тун, хугацаа', Type: 'Text' },
      { Name: 'xray_time', Label: 'Хугацаа /Минут/', Type: 'Text' },
      { Name: 'pm_model', Label: 'Пейсмейкер: Загвар', Type: 'Text' },
      { Name: 'pm_serial', Label: 'Пейсмейкер: Сери', Type: 'Text' },
      { Name: 'pm_pos', Label: 'Пейсмейкер: Байрлал', Type: 'Text' },

      { Name: 'bt_model', Label: 'Баруун тосгуур:Загвар', Type: 'Text' },
      { Name: 'bt_serial', Label: 'Баруун тосгуур:Сери', Type: 'Text' },
      { Name: 'bt_pos', Label: 'Баруун тосгуур:Байрлал', Type: 'Text' },
      { Name: 'bt_sens', Label: 'Баруун тосгуур:Мэдрэмж', Type: 'Text' },
      { Name: 'bt_pow', Label: 'Баруун тосгуур:Босго хүч', Type: 'Text' },
      { Name: 'bt_res', Label: 'Баруун тосгуур:Эсэргүүцэл', Type: 'Text' },

      { Name: 'bh_model', Label: 'Баруун ховдол:Загвар', Type: 'Text' },
      { Name: 'bh_serial', Label: 'Баруун ховдол:Сери', Type: 'Text' },
      { Name: 'bh_pos', Label: 'Баруун ховдол:Байрлал', Type: 'Text' },
      { Name: 'bh_sens', Label: 'Баруун ховдол:Мэдрэмж', Type: 'Text' },
      { Name: 'bh_pow', Label: 'Баруун ховдол:Босго хүч', Type: 'Text' },
      { Name: 'bh_res', Label: 'Баруун ховдол:Эсэргүүцэл', Type: 'Text' },

      {
        Name: 'biopsy_and_other',
        Label: 'Байнгын пейсмейкер суулгах эмчилгээний үед авсан эдийн болон бусад шинжилгээ',
        Type: 'Text',
      },
      {
        Name: 'about_wound',
        Label: 'Байнгын пейсмейкер суулгах эмчилгээний үед шархны арчдас авсан эсэх',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'pm_about_wound',
      },
      {
        Name: 'after_diagnosis',
        Label: 'Байнгын пейсмейкер суулгах эмчилгээний дараах онош',
        Type: 'Text',
      },
      { Name: 'anes_type', Label: 'Мэдээгүйжүүлэлтийн хэлбэр', Type: 'Text' },
      {
        Name: 'pm_cond',
        Label: 'Пейсмейкер суулгах эмчилгээ',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'pm_cond',
      },
      {
        Name: 'wire_fix',
        Label: 'Оёдол тавьсан утас:Бэхэлгээнд',
        Type: 'Text',
      },
      {
        Name: 'wire_under',
        Label: 'Оёдол тавьсан утас:Арьсан дор',
        Type: 'Text',
      },
      { Name: 'wire_skin', Label: 'Оёдол тавьсан утас:Арьсанд', Type: 'Text' },

      {
        Name: 'ab_before',
        Label: 'Эмчилгээний өмнө хэрэглэсэн антибиотек',
        Type: 'Text',
      },
      {
        Name: 'ab_during',
        Label: 'Эмчилгээний үед хэрэглэсэн антибиотек',
        Type: 'Text',
      },
      {
        Name: 'ab_after',
        Label: 'Эмчилгээний дараа хэрэглэсэн антибиотек',
        Type: 'Text',
      },
      {
        Name: 'operating_emch',
        Label: 'Гардан гүйцэтгэх эмч',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'pm_doctors',
      },
      {
        Name: 'support_emch',
        Label: 'Туслах эмч',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'pm_doctors',
      },
      {
        Name: 'surg_nurse',
        Label: 'Мэс заслын сувилагч',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'pm_support_people',
      },
      {
        Name: 'engineer',
        Label: 'Инженер',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'pm_support_people',
      },
      {
        Name: 'technician',
        Label: 'Техникч',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'pm_support_people',
      },
      {
        Name: 'anes_emch',
        Label: 'Мэдээгүйжүүлгийн эмч',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'pm_support_people',
      },
      {
        Name: 'anes_nurse',
        Label: 'Мэдээгүйжүүлгийн сувилагч',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'pm_support_people',
      },
      {
        Name: 'emch',
        Label: 'Doctor',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'pm_doctors',
      },
      { Name: 'pat_history_id', Label: 'Өвчний түүхийн дугаар', Type: 'Text' },
      {
        Name: 'department',
        Label: 'Тасаг',
        Type: 'SingleSelect',
        Config: {
          Model: Models.DrgroupDepartments,
          IdField: 'id_data',
          TextField: 'name',
        },
      },
    ],
  ];

  this.ObjectName = 'PacemakerTblThree';
  this.Model = Model;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'PacemakerTblThreeConfig',
    NewObjectTitle: 'PacemakerTblThreeConfig show',
    EditObjectTitle: 'PacemakerTblThreeConfig show',
  };
}

module.exports = PacemakerTblThreeConfig;
