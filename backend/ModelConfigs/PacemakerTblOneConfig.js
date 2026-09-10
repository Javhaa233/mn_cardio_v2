const { Models } = require('../config/DB');
const Model = Models.PacemakerTblOne;
var ModelLookUp = Models.PacemakerTblOneLookUp;

function PacemakerTblOneConfig() {
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
      { Name: 'pat_history_id', Label: 'Өвчний түүхийн дугаар', Type: 'Text' },
      {
        Name: 'diagnostic_change',
        Label: 'Шинжилгээнд гарсан өөрчлөлт',
        Type: 'Text',
      },
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
      {
        Name: 'diag_decision',
        Label: 'Эмч нарын зөвлөгөөний онош шийдвэр',
        Type: 'Text',
      },
      {
        Name: 'zuvlukh_emch',
        Label: 'Зөвлөх эмч',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'pm_doctors',
      },
      {
        Name: 'emchlegch_emch',
        Label: 'Эмчлэгч эмч',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'pm_doctors',
      },
      {
        Name: 'emch',
        Label: 'Doctor',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'pm_doctors',
      },
      {
        Name: 'risks',
        Label: 'Гарч болох эрсдэлүүд',
        Type: 'CheckBox',
        Multiple: true,
        Config: { IdField: 'Value', TextField: 'Label' },
        LookUpConfig: {
          Model: ModelLookUp,
          ParentValueField: 'id_data',
          ChildValueField: 'value',
          IdField: 'id_lookup',
          Field: 'id_question',
        },
        OptionType: 'pm_risks',
        md: 12,
      },

      {
        Name: 'diffs',
        Label: 'Гарч болох хүндрэлүүд',
        Type: 'CheckBox',
        Multiple: true,
        Config: { IdField: 'Value', TextField: 'Label' },
        LookUpConfig: {
          Model: ModelLookUp,
          ParentValueField: 'id_data',
          ChildValueField: 'value',
          IdField: 'id_lookup',
          Field: 'id_question',
        },

        OptionType: 'pm_diffs',
        md: 12,
      },

      {
        Name: 'device_model',
        Label: 'Байнгын пейсмейкер төхөөрөмжийн загварын заалт',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'pm_models',
      },
      {
        Name: 'prev_diagnosis',
        Label: 'Байнгын пейсмейкер суулгах эмчилгээний өмнөх онош',
        Type: 'TextArea',
      },
      { Name: 'planned_date', Label: 'Төлөвлөх огноо', Type: 'Date' },
      {
        Name: 'operating_emch',
        Label: 'Гардан гүйцэтгэх эмч',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'pm_doctors',
      },
      {
        Name: 'tuslakh_emch',
        Label: 'Туслах эмч',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'pm_doctors',
      },
      {
        Name: 'surgery_nurse',
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
        Name: 'anasthesia_emch',
        Label: 'Мэдээгүйжүүлгийн эмч',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'pm_support_people',
      },
      {
        Name: 'anasthesia_nurse',
        Label: 'Мэдээгүйжүүлгийн сувилагч',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'pm_support_people',
      },
    ],
  ];

  this.ObjectName = 'PacemakerTblOne';
  this.Model = Model;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'PacemakerTblOne',
    NewObjectTitle: 'PacemakerTblOne show',
    EditObjectTitle: 'PacemakerTblOne show',
  };
}

module.exports = PacemakerTblOneConfig;
