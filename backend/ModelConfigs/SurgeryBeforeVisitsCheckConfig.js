const { Models } = require('../config/DB');
const Model = Models.SurgeryBeforeVisitsCheck;

function SurgeryBeforeVisitsCheckConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text' },
      {
        Name: 'Tsus',
        Label: 'Цусны дэлгэрэнгүй шинжилгээ',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      {
        Name: 'BioHimi',
        Label: 'Биохими',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      {
        Name: 'TsusBvlegneltINR',
        Label: 'Цус бүлэгнэлт + INR',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      {
        Name: 'VirusMarker',
        Label: 'Вирүсийн маркер',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      {
        Name: 'ZvrhTsahBichleg',
        Label: 'Зүрхний цахилгаан бичлэг',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      {
        Name: 'ZvrhEho',
        Label: 'Зүрхний эхо /3-р эмнэлэгт хийлгэсэн/',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      {
        Name: 'Spirometr',
        Label: 'Спирометр /амьсгалын багтаамжны сорил/',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      {
        Name: 'TseejRentgen',
        Label: 'Цээжний рентген том зураг',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      {
        Name: 'HevlinEho',
        Label: 'Хэвлийн эхо',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      {
        Name: 'TitemSudasDoturh',
        Label: 'Титэм судсан дотуурх оношилгоо ',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      {
        Name: 'GolSudasTomo',
        Label: 'Гол судас өргөссөн, тэлэгдсэн бол Гол судасны Компьютерт томографи',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      { Name: 'CreateDate', Label: 'CreateDate', Type: 'Date' },
      { Name: 'UpdateDate', Label: 'UpdateDate', Type: 'Date' },
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
      { Name: 'TeamId', Label: 'TeamId', Type: 'Text' },
      { Name: 'CreateUserId', Label: 'CreateUserId', Type: 'Text' },
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
      {
        Name: 'DoctorsTeamPatientId',
        Label: 'DoctorsTeamPatientId',
        Type: 'Text',
      },
    ],
  ];

  this.ObjectName = 'SurgeryBeforeVisitsCheck';
  this.Model = Model;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'SurgeryBeforeVisitsCheck ',
    NewObjectTitle: 'SurgeryBeforeVisitsCheck create',
    EditObjectTitle: 'SurgeryBeforeVisitsCheck edit',
  };
}

module.exports = SurgeryBeforeVisitsCheckConfig;
