const { Models } = require('../../config/DB');
const Model = Models.PatientSendPage;

function PatientSendPageConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text', EditField: false },

      {
        Name: 'type',
        Label: 'Бүртгэлийн төрөл',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          {
            Label: 'Эмнэлэгт өвчтөн илгээх хуудас (АМ-13А)',
            Value: 'to_hospital',
          },
          {
            Label: 'Эмнэлгээс өвчтөн илгээх хуудас (АМ-13Б)',
            Value: 'from_hospital',
          },
        ],
      },
      {
        Name: 'PatientId',
        Label: 'Patient ID',
        Type: 'GridLookUpSingleLoad',
        Config: {
          ObjectName: 'Patient',
          IdField: 'id_data',
          TextField: 'p_registration',
          Fields: [
            { Name: 'p_lastname', Label: 'Last name' },
            { Name: 'p_firstname', Label: 'first name' },
            { Name: 'p_registration', Label: 'Register' },
            { Name: 'DictProvinceCity.name', Label: 'City' },
          ],
          MinTextLength: '2',
        },
      },
      { Name: 'PatRegNo', Label: 'Personal number' },
      {
        Name: 'DoctorId',
        Label: 'Doctor',
        Type: 'GridLookUpSingleLoad',
        Config: {
          ObjectName: 'DoctorsProfile',
          IdField: 'id_data',
          TextField: 'firstname',
          Fields: [
            { Name: 'lastname', Label: 'Last name' },
            { Name: 'firstname', Label: 'first name' },
          ],
          MinTextLength: '2',
        },
      },
      { Name: 'CreateDate', Label: 'Create date', Type: 'Date', md: 4 },
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
      {
        Name: 'FromOrganizationId',
        Label: 'From organization',
        Type: 'GridLookUpSingleLoad',
        Config: {
          ObjectName: 'Organization',
          IdField: 'Id',
          TextField: 'Name',
          Fields: [{ Name: 'Name', Label: 'Name' }],
          MinTextLength: '2',
        },
      },
      { Name: 'FromOrgName', Label: 'FromOrgName', Type: 'Text' },

      {
        Name: 'ToOrganizationId',
        Label: 'To organization',
        Type: 'GridLookUpSingleLoad',
        Config: {
          ObjectName: 'Organization',
          IdField: 'Id',
          TextField: 'Name',
          Fields: [{ Name: 'Name', Label: 'Name' }],
          MinTextLength: '2',
        },
      },
      { Name: 'ToOrgName', Label: 'ToOrgName', Type: 'Text' },

      { Name: 'burtgel_code', Label: 'Бүртгэлийн код', Type: 'Text' },
      { Name: 'emd_no', Label: 'ЭМД дугаар', Type: 'Text' },
      { Name: 'pat_address', Label: 'Тогтмол хаяг', Type: 'Text' },
      {
        Name: 'work_position',
        Label: 'Ажлын газар, албан тушаал',
        Type: 'Text',
      },
      { Name: 'ts_ye_sh', Label: 'ЦЕШ', Type: 'Text' },
      { Name: 'sh_sye_sh', Label: 'ШЕШ', Type: 'Text' },
      { Name: 'biohimi', Label: 'Биохими', Type: 'Text' },
      { Name: 'rentgen', Label: 'Рентген', Type: 'Text' },
      { Name: 'other_test', Label: 'Бусад', Type: 'Text' },
      {
        Name: 'pat_notes',
        Label: 'Шилжүүлж буй эмнэлэгт хийгдсэн эмчилгээний үр дүн, өвчтөний биеийн байдал',
        Type: 'Text',
      },
      {
        Name: 'main_diagnosis',
        Label: 'Үндсэн онош (Өвчний олон улсын 10-р ангиллын дагуу дэлгэрэнгүй бичнэ.)',
        Type: 'Text',
      },
      {
        Name: 'undeslel',
        Label: 'Дараагийн шатлалын эмнэлэгт явуулж буй үндэслэл',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Онош тодруулах', Value: 'onosh_todruulah' },
          { Label: 'Эмчилгээ хийх', Value: 'emchilgee_hiih' },
        ],
      },
      { Name: 'main_doctor_name', Label: 'Ерөнхий эмч', Type: 'Text' },
      { Name: 'medical_doctor_name', Label: 'Эмчлэгч эмч', Type: 'Text' },

      // Өвчтөн өгсөн зөвлөгөө
      { Name: 'em_emchilgee', Label: 'Эмийн эмчилгээ', Type: 'Text' },
      { Name: 'em_bus_emchilgee', Label: 'Эмийн бус эмчилгээ', Type: 'Text' },
      {
        Name: 'org_advice_notes',
        Label: 'Хүлээн авч буй эрүүл мэндийн байгууллагад өгөх зөвлөмж',
        Type: 'Text',
      },

      { Name: 'Comment', Label: 'Comment', Type: 'TextArea' },
      { Name: 'SendDate', Label: 'Send date', Type: 'Text' },
    ],
  ];

  this.ObjectName = 'PatientSendPage';
  this.Model = Model;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Patient transfer',
    NewObjectTitle: 'Patient transfer create',
    EditObjectTitle: 'Patient transfer edit',
  };
}

module.exports = PatientSendPageConfig;
