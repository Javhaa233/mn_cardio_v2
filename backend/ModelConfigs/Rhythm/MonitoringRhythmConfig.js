const { Models } = require('../../config/DB');
const Model = Models.MonitoringRhythm;
const ModelLookUp = Models.MonitoringRhythmLookUp;

function MonitoringRhythmConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text' },
      { Name: 'is_confirm', Label: 'is_confirm', Type: 'Text' },
      { Name: 'PatRegNo', Label: 'Personal number' },
      {
        Name: 'CreateUserId',
        Label: 'Create user',
        Type: 'SingelSelect',
        Config: { Model: Models.Users, IdField: 'Id', TextField: 'UserName' },
      },
      { Name: 'CreatedDate', Label: 'CreatedDate', Type: 'Text' },
      {
        Name: 'UpdateUserId',
        Label: 'Update user',
        Type: 'SingelSelect',
        Config: { Model: Models.Users, IdField: 'Id', TextField: 'UserName' },
      },
      { Name: 'UpdatedDate', Label: 'Updated date', Type: 'Text' },
      {
        Name: 'ConfirmUserId',
        Label: 'Confirm user',
        Type: 'SingelSelect',
        Config: { Model: Models.Users, IdField: 'Id', TextField: 'UserName' },
      },
      { Name: 'ConfirmedDate', Label: 'Confirmed date', Type: 'Text' },
    ],
    [
      // II. Эмнэлэгт хэвтэх үеийн бүртгэл
      //
      {
        Name: 'organization_id',
        Label: 'Эрүүл мэндийн байгууллага',
        Type: 'GridLookUpSingleLoad',
        Config: {
          ObjectName: 'Organization',
          IdField: 'Id',
          TextField: 'Name',
          MinTextLength: 0,
          SearchType: 'AllData',
          Fields: [
            { Name: 'Id', Label: 'Id' },
            { Name: 'Name', Label: 'Name' },
          ],
        },
      },
      {
        Name: 'organization_other',
        Label: 'Эрүүл мэндийн байгууллага (Бусад)',
        Type: 'Text',
      },
    ],

    [
      {
        Name: 'suulgasan_ognoo',
        Label: 'Ажилбар суулгасан огноо:',
        Type: 'Text',
      },
      { Name: 'hevtsen_ognoo', Label: 'Хэвтсэн огноо', Type: 'Text' },
      { Name: 'garsan_ognoo', Label: 'Гарсан огноо', Type: 'Text' },
      {
        Name: 'code',
        Label: 'ICD бүртгэлийн төвд зөвхөн хамаарна. Код:',
        Type: 'Text',
      },

      // III.Хяналтын бүртгэл
      {
        Name: 'hyanalt',
        Label: 'Хяналт',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_hyanalt',
      },
      {
        Name: 'hyanalt_type',
        Label: 'Хяналтын төрөл',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_hyanalt_type',
      },
      {
        Name: 'hyanalt_arga',
        Label: 'Хяналтын арга',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_hyanalt_arga',
      },

      { Name: 'hyanalt_arga_other', Label: 'Бусад', Type: 'TextArea' },
      {
        Name: 'is_hugatsaa',
        Label: 'Өвчтөн хяналтын хугацаануудад ирсэн үү?',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      { Name: 'y_hugatsaa', Label: 'Огноо', Type: 'Text' },
      {
        Name: 'n_hugatsaa',
        Label: 'Хэрэв үгүй бол шалтгаан',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_no_hugatsaa',
      },
      { Name: 'n_hugatsaa_other', Label: 'Бусад', Type: 'TextArea' },

      {
        Name: 'baidal',
        Label: 'Хяналтын үеийн өвчтний байдал',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_hyanalt_baidal',
      },
      {
        Name: 'idevhi_baidal',
        Label: 'Хяналтын үеийн өвчтний идэвхийн байдал',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_hyanalt_idevhi_baidal',
      },
      {
        Name: 'nyha',
        Label: 'NYHA ангилал',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_nyha',
      },
      {
        Name: 'hyanalt_baidal',
        Label: 'Хяналтын байдал',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_baidal',
      },
      {
        Name: 'orhison_shaltgaan',
        Label: 'Хэрэв хяналтаа орхисон бол шалтгаан нь',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_orhison_shaltgaan',
      },

      { Name: 'orhison_shaltgaan_other', Label: 'Бусад', Type: 'TextArea' },

      // IV. Нас баралтын бүртгэл
      {
        Name: 'nas_baralt_shaltgaan',
        Label: 'Нас баралтын шалтгаан',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_nas_barsan_shaltgaan',
      },
      {
        Name: 'nas_baralt_shaltgaan_other',
        Label: 'Бусад',
        Type: 'Text',
      },

      {
        Name: 'is_hevtelt',
        Label: 'Өвчтөн эмнэлэгт хэвтсэн үү?',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      { Name: 'nas_barsan_ognoo', Label: 'Нас барсан огноо', Type: 'Text' },
      {
        Name: 'is_zadlan',
        Label: 'Задлан шинижлгээ',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },

      // V. Эмнэлзүйн байдал ( одоогийн байдал )
      {
        Name: 'is_dahilt',
        Label: 'Шинж тэмдэгийн дахилт',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      {
        Name: 'if_shinj_turul',
        Label: 'Хэрэв тийм бол шинж тэмдгийн төрөл ',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_shinj_temdeg',
      },
      { Name: 'shinj_turul_other', Label: 'Бусад', Type: 'Text' },
      {
        Name: 'hovdliin_horig',
        Label: 'Тосгуур ховдлын хориг',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_hovdliin_horig',
      },

      {
        Name: 'is_uurchlult',
        Label: 'Хяналтын үеийн ЗЦБ- н өөрчлөлт',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      {
        Name: 'if_uurchlult_hemnel',
        Label: 'Хэрэв тийм бол хэмнэл',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_ztsb_uurchlult',
      },
      { Name: 'uurchlult_hemnel_other', Label: 'Бусад', Type: 'Text' },

      // VI. Үр дүнгийн байдал
      {
        Name: 'is_emiin_hyanalt',
        Label: 'Хэм алдагдалд хэрэглэсэн хэм алдагдлын эсрэг эмийн хяналт',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      {
        Name: 'if_yamar_em',
        Label: 'Хэрэв тийм бол яиар эм',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_hyanalt_em',
      },
      { Name: 'em_other', Label: 'Бусад', Type: 'Text' },

      {
        Name: 'is_ablation_dahilt',
        Label: 'Аблацийн хэм алдагдалын дахилт',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      {
        Name: 'if_ablation_dahilt',
        Label: 'Хэрэв тийм бол',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_ablation_hem_dahilt',
      },

      {
        Name: 'is_bainga_pm',
        Label: 'Байнгын пейсмейкер:',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      {
        Name: 'if_pm',
        Label: 'Хэрэв тийм бол',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_baingiin_pacemaker',
      },
      { Name: 'pm_other', Label: 'Бусад', Type: 'Text' },

      {
        Name: 'is_icd',
        Label: 'ICD',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      {
        Name: 'if_icd',
        Label: 'Хэрэв тийм бол',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_icd',
      },
      { Name: 'icd_other', Label: 'Бусад', Type: 'Text' },
      { Name: 'm_notes', Label: 'Тэмдэглэл', Type: 'TextArea' },
    ],
  ];

  this.ObjectName = 'MonitoringRhythm';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'App',
    NewObjectTitle: 'App create',
    EditObjectTitle: 'App edit',
  };
}

module.exports = MonitoringRhythmConfig;
