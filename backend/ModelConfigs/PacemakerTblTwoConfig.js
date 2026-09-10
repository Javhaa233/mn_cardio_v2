const { Models } = require('../config/DB');
const Model = Models.PacemakerTblTwo;
var ModelLookUp = Models.PacemakerTblTwoLookUp;

function PacemakerTblTwoConfig() {
  this.Fields = [
    [
      { Name: 'otherOutlawedReason', Label: 'Бусад', Type: 'Text' },
      { Name: 'Id', Label: 'Id', Type: 'Text' },
      { Name: 'user_mod', Label: 'user_mod', Type: 'Text' },
      { Name: 'date_created', Label: 'date_created', Type: 'Text' },
      { Name: 'tbl_one_id', Label: 'tbl_one_id', Type: 'Text' },
      { Name: 'stay_id_data', Label: 'stay_id_data', Type: 'Text' },
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
      {
        Name: 'treatment_name',
        Label: 'Санал болгож буй эмчилгээний нэр',
        Type: 'Text',
      },
      {
        Name: 'treatment_result',
        Label: 'Санал болгож буй эмчилгээний үр дүн',
        Type: 'Text',
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
        Name: 'possible_adds',
        Label: 'Тухайн эмчилгээний үед хийгдэж болох нэмэлт ажилбарууд',
        Type: 'Text',
      },
      {
        Name: 'possible_other',
        Label: 'Тухай эмчилгээг орлуулж болох эмчилгээний бусад аргууд',
        Type: 'Text',
      },
      {
        Name: 'advantage',
        Label: 'Санал болгож буй эмчилгээний давуу тал',
        Type: 'Text',
      },
      {
        Name: 'anesthesia',
        Label: 'Санал болгож буй эмчилгээний үед хийгдэх мэдээгүйжүүлэг',
        Type: 'Text',
      },
      {
        Name: 'qfrom_pat',
        Label: 'Үйлчлүүлэгчээс тавьсан асуулт',
        Type: 'Text',
      },
      { Name: 'afrom_pat', Label: 'Дээрх асуултын хариулт', Type: 'Text' },
      { Name: 'doc_phone', Label: 'Эмчтэй холбоо барих утас', Type: 'Text' },
      {
        Name: 'doc_name',
        Label: 'Эмчийн нэр',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'pm_doctors',
      },
      { Name: 'pat_name', Label: 'Үйлчлүүлэгчийн нэр', Type: 'Text' },
      {
        Name: 'guardian_name',
        Label: 'Асран хамгаалагч/дэмжигчийн нэр',
        Type: 'Text',
      },
      {
        Name: 'guardian_rel',
        Label: 'Үйлчлүүлэгчтэй холбоотой эсэх',
        Type: 'Text',
      },
      {
        Name: 'outlawed_reason',
        Label: 'Үйлчлүүлэгч эрхзүйн чадамжгүй байгаа шалтгаан',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'pm_outlawed_reason',
      },
      { Name: 'husband_name', Label: 'Нөхрийн нэр', Type: 'Text' },
      {
        Name: 'reject_reason',
        Label: 'Хэрэв нөхөр зөвшөөрөөгүй бол тайлбар',
        Type: 'Text',
      },
      { Name: 'print_date', Label: 'print_date', Type: 'Date' },
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

  this.ObjectName = 'PacemakerTblTwo';
  this.Model = Model;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'PacemakerTblTwo',
    NewObjectTitle: 'PacemakerTblTwo show',
    EditObjectTitle: 'PacemakerTblTwo show',
  };
}

module.exports = PacemakerTblTwoConfig;
