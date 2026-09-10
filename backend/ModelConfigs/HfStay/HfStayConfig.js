const { Models } = require('../../config/DB');
const Model = Models.HfStay;

function HfStayConfig() {
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
      { Name: 'StayId', Label: 'Stay Id', Type: 'Text' },
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

      { Name: 'StartedDate', Label: 'Хэвтсэн огноо', Type: 'Date' },
      {
        Name: 'DiagnosedDate',
        Label: 'Зүрхний дутагдал оношлогдсон огноо',
        Type: 'Date',
      },
      {
        Name: 'StayReason',
        Label: 'Эмнэлэгт хэвтсэн шалгаан / Давтан үзүүлсэн шалтгаан',
        Type: 'RadioBox',
        OptionType: 'hf_stay_reason',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'DurationOfHf',
        Label: 'Зүрхний дутагдал оншлогдоод хэр хугацаа өнгөрсөн',
        Type: 'RadioBox',
        OptionType: 'hf_duration',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      { Name: 'OutDate', Label: 'Эмнэлэгээс гарсан хугацаа', Type: 'Date' },
      {
        Name: 'OutCondition',
        Label: 'Эмнэлгээс гарах үеийн биеийн байдал',
        Type: 'RadioBox',
        OptionType: 'hf_out_condition',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'IsGuardianGivenInfo',
        Label: 'Асран хамгаалагчид мэдээлэлд хамрагдсан эсэх',
        Type: 'RadioBox',
        OptionType: 'hf_guardian_given_info',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'MonitoringLevel',
        Label: 'Хяналтанд байх эмнэлгийн шатлал',
        Type: 'RadioBox',
        OptionType: 'hf_monitoring_level',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'IsMonitoringAmbulatory',
        Label: 'Зүрхний дутагдлын амбулаторид хянах шаардлагатай',
        Type: 'RadioBox',
        OptionType: 'yorn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'IsGivenInfo',
        Label: 'Зүрхний дутагдлын тухай мэдээлэл өгсөн',
        Type: 'RadioBox',
        OptionType: 'yorn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'IsFamilyGivenInfo',
        Label: 'Иргэн өр гэрт өгсөн',
        Type: 'RadioBox',
        OptionType: 'yorn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'IsGivenDestinyInfo',
        Label: 'Өвчний тавилан, өвчний явцын тухай мэдээлэл өгсөн',
        Type: 'RadioBox',
        OptionType: 'yorn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'IsNeededPalliative',
        Label: 'Хөнгөвчлөх эмчилгээ шаардлагатай юу?',
        Type: 'RadioBox',
        OptionType: 'yorn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'PalliativeType',
        Label: 'Иргэний хөнгөвчлөх эмчилгээний төрөл',
        Type: 'RadioBox',
        OptionType: 'hf_palliative_type',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
    ],
  ];

  this.ObjectName = 'HfStay';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Heart Failure Registry',
    NewObjectTitle: 'Heart Failure Registry create',
    EditObjectTitle: 'Heart Failure Registry edit',
  };
}

module.exports = HfStayConfig;
