const { Models } = require('../config/DB');
const Model = Models.OutPatientInfo;
const ModelLookUp = Models.OutPatientInfoLookUp;

function OutPatientInfoConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text' },
      {
        Name: 'PatientId',
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
      { Name: 'Diagnosis', Label: 'Онош', Type: 'TextArea' },
      {
        Name: 'HiigdsenShinjilgee',
        Label: 'Хийгдсэн шинжилгээ',
        Type: 'TextArea',
      },
      {
        Name: 'HiigdsenEmchilgee',
        Label: 'Хийгдсэн эмчилгээ',
        Type: 'TextArea',
      },

      // {
      //   Name: "SergeenZasah",
      //   Label: "Зүрхний шигдээсийн дараах сэргээн засах эмчилгээнд явах",
      //   Type: "TextArea",
      // },
      // { Name: "No135", Label: "No135 тоотод үзүүлэх", Type: "TextArea" },

      { Name: 'Tsaashid', Label: 'Цаашид', Type: 'TextArea' },
      {
        Name: 'LifeAdvice',
        Label: 'Амьдралын хэв маягийн зөвлөмж',
        Type: 'TextArea',
      },
      {
        Name: 'LifeAdviceSelect',
        Label: 'Амьдралын хэв маягийн зөвлөмж',
        Type: 'CheckBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        LookUpConfig: {
          Model: ModelLookUp,
          ParentValueField: 'id_data',
          ChildValueField: 'value',
          IdField: 'id_lookup',
          Field: 'id_question',
        },
        Multiple: true,
        OptionType: 'life_advice',
      },
      {
        Name: 'LifeAdviceOther',
        Label: 'Амьдралын хэв маягийн зөвлөмж (Бусад)',
        Type: 'Text',
      },
      { Name: 'Monitoring', Label: 'Хяналт', Type: 'TextArea' },
      {
        Name: 'MonitoringSelect',
        Label: 'Хяналт',
        Type: 'CheckBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        LookUpConfig: {
          Model: ModelLookUp,
          ParentValueField: 'id_data',
          ChildValueField: 'value',
          IdField: 'id_lookup',
          Field: 'id_question',
        },
        Multiple: true,
        OptionType: 'out_monitoring',
      },
      { Name: 'MonitoringOther', Label: 'Хяналт', Type: 'Text' },
      {
        Name: 'UuhEmSelect',
        Label: 'Уух эм',
        Type: 'CheckBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        LookUpConfig: {
          Model: ModelLookUp,
          ParentValueField: 'id_data',
          ChildValueField: 'value',
          IdField: 'id_lookup',
          Field: 'id_question',
        },
        Multiple: true,
        OptionType: 'emiin_emchilee',
      },
      { Name: 'UuhEm', Label: 'Уух эм (Бусад)', Type: 'TextArea' },
      {
        Name: 'DoctorId',
        Label: 'Doctor',
        Type: 'GridLookUpSingleLoad',
        Config: {
          ObjectName: 'DoctorsProfile',
          IdField: 'id_data',
          TextField: 'firstname',
          Fields: [
            // { Name: "id_data", Label: "Id" },
            { Name: 'lastname', Label: 'Last name' },
            { Name: 'firstname', Label: 'first name' },
          ],
          MinTextLength: '2',
        },
      },
      { Name: 'CreateUserId', Label: 'User', Type: 'Text' },
      { Name: 'CreateDate', Label: 'Create date', Type: 'Date' },
      { Name: 'UpdateDate', Label: 'Update date', Type: 'Date' },
      { Name: 'StayId', Label: 'StayId', Type: 'Text' },
    ],
  ];

  this.ObjectName = 'OutPatientInfo';
  this.Model = Model;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'OutPatientInfo',
    NewObjectTitle: 'OutPatientInfo create',
    EditObjectTitle: 'OutPatientInfo edit',
  };
}

module.exports = OutPatientInfoConfig;
