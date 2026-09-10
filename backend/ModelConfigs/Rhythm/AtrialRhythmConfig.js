const { Models } = require('../../config/DB');
const Model = Models.AtrialRhythm;
const ModelLookUp = Models.AtrialRhythmLookUp;

function AtrialRhythmConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text' },
      { Name: 'is_confirm', Label: 'is_confirm', Type: 'Text' },
      { Name: 'PatRegNo', Label: 'Personal number' },
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
      { Name: 'CreatedDate', Label: 'CreatedDate', Type: 'Text' },
      {
        Name: 'UpdateUserId',
        Label: 'Update user',
        Type: 'SingelSelect',
        Config: {
          Model: Models.Users,
          IdField: 'Id',
          TextField: 'UserName',
          MinTextLength: 0,
        },
      },
      { Name: 'UpdatedDate', Label: 'Updated date', Type: 'Text' },
      {
        Name: 'ConfirmUserId',
        Label: 'Confirm user',
        Type: 'SingelSelect',
        Config: {
          Model: Models.Users,
          IdField: 'Id',
          TextField: 'UserName',
          MinTextLength: 0,
        },
      },
      { Name: 'ConfirmedDate', Label: 'Confirmed date', Type: 'Text' },
    ],

    [
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
      { Name: 'visit_date', Label: 'Үзлэгийн огноо', Type: 'Text' },
      { Name: 'doctor_name', Label: 'Эмчийн нэр', Type: 'Text' },
      { Name: 'out_score', Label: 'Гарсан оноо', Type: 'Number' },
      {
        Name: 'monitoring_hostpital_name',
        Label: 'Хяналтанд байх эмнэлгийн нэр',
        Type: 'Text',
      },
      { Name: 'undur', Label: 'Өндөр (см)', Type: 'Number' },
      { Name: 'jin', Label: 'Жин (кг)', Type: 'Number' },
      { Name: 'bji', Label: 'Биеийн жингийн индекс (кг/м2)', Type: 'Number' },
      { Name: 'ad_deed', Label: 'АД (систол) (мм.муб)', Type: 'Number' },
      { Name: 'ad_dood', Label: 'АД (диастол) (мм.муб)', Type: 'Number' },
      {
        Name: 'r_symptoms',
        Label: '',
        // Label: "Шинж тэмдэг (хэд хэдийг сонгож болно)",
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
        OptionType: 'r_symptoms',
      },
      {
        Name: 'r_symptoms_other',
        Label: 'Бусад',
        Type: 'Text',
      },

      {
        Name: 'daralt_ihselt',
        Label: 'Артерийн даралт ихсэлт',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_arteri_daralt_ihselt',
      },
      {
        Name: 'uuh_tos_uurchlult',
        Label: 'Өөх тосны солилцооны өөрчлөлт',
        Type: 'RadioBox',
        OptionType: 'r_uuh_tos_uurchlult',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'chihriin_shijin',
        Label: 'Чихрийн шижин',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_chihriin_shijin',
      },
      {
        Name: 'ishemi_urid',
        Label: 'Зүрхний ишеми өвчин эрт насандаа оношлогдсон удамшлын өгүүлэмж (эр55 нас)',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      {
        Name: 'zurh_genet_uhel',
        Label: 'Зүрхний гэнэтийн үхэл болж байсан удамшлын өгүүлэмж',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      {
        Name: 'tamhidalt',
        Label: 'Тамхидалт',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_tamhidalt',
      },
      {
        Name: 'tamhinaas_garsan_hugatsaa',
        Label: 'Тамхинаас гарсан хугацаа',
        Type: 'Text',
      },

      {
        Name: 'dundaj_tamhinii_too',
        Label: 'Өдөрт татдаг дундаж тамхины тоо',
        Type: 'Number',
      },

      {
        Name: 'arhi_hereglee',
        Label: 'Архины хэрэглээ',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_arhidalt',
      },
      {
        Name: 'arhinaas_garsan_hugatsaa',
        Label: 'Архинаас гарсан хугацаа',
        Type: 'Text',
      },

      // Бусад онцлох өвчний түүх
      {
        Name: 'hereg_emgeg',
        Label: 'Хэрэхийн шалтгаант зүрхний эмгэг',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      {
        Name: 'havhlaga_gajig_mes',
        Label: 'Хавхлагын гажиг/мэс засал',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      {
        Name: 'cardiomiopati',
        Label: 'Кардиомиопати',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      {
        Name: 'arhag_dutagdal',
        Label: 'Зүрхний архаг дутагдал',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      {
        Name: 'miokardit',
        Label: 'Миокардит',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      {
        Name: 'haldvart_endokardit',
        Label: 'Халдварт эндокардит',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      {
        Name: 'buur_dutagdal',
        Label: 'Бөөрний дутагдал',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_buur_dutagdal',
      },
      {
        Name: 'umnu_tarhi_sudas',
        Label: 'Тархины судасны хүндрэл өмнө нь тохиолдсон',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      {
        Name: 'y_umnu_tarhi_sudas',
        Label: 'Хэрэв тийм бол ',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_umnu_tarhi_sudas',
      },
      {
        Name: 'is_tisde',
        Label: 'ТСДЭ хийлгэж байсан',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      {
        Name: 'is_gabg',
        Label: 'CABG хийлгэж байсан',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },

      //
      {
        Name: 'uushig_arhag',
        Label: 'Уушгины архаг бөглөрөлт өвчин',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      {
        Name: 'giperti',
        Label: 'Гипертиройдизм',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      {
        Name: 'gipoti',
        Label: 'Гипотиройдизм',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      {
        Name: 'zahiin_sudas_emgeg',
        Label: 'Захын судасны эмгэг',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      {
        Name: 'amisgal_noir_tasaldah',
        Label: 'Амьсгал нойрон дунд тасалдах хам шинж',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      { Name: 'other_uwchin', Label: 'Бусад', Type: 'Text' },

      // Тосгуурын жирвэгнээгийн тохиолдлын давтамж
      { Name: 'tosguur_tohioldol', Label: '', Type: 'Text' },
      {
        Name: 'suuliin_48_tsag',
        Label: 'Сүүлийн 48 цагийн дотор',
        Type: 'Text',
      },
      { Name: 'ehnii_udaa', Label: 'Эхний удаагийн тохиолдол', Type: 'Text' },

      // Зүрхний цахилгаан бичлэг
      { Name: 'qrs_duration', Label: 'QRS duration ', Type: 'Number' },
      {
        Name: 'left_bbb',
        Label: 'Left BBB ',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      {
        Name: 'right_bbb',
        Label: 'Right BBB ',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      { Name: 'ztst', Label: 'Зүрхний цохилтын тоо', Type: 'Number' },
      {
        Name: 'zuun_hovdol_gipertrofi',
        Label: 'Зүүн ховдлын гипертрофи',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },

      // Зүүн тосгуурын хэмжээ
      //

      {
        Name: 'zuun_tosguur_hemjee',
        // Label: "Зүүн тосгуурын хэмжээ ",
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
        OptionType: 'r_zuun_tosguur_hemjee',
      },

      // Зүүн ховдолын цацалтын фракцын хэмжээ
      {
        Name: 'zuun_tsatsalt_frakts',
        // Label: "Зүүн ховдолын цацалтын фракцын хэмжээ",
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
        OptionType: 'r_zuun_tsatsalt_frakts',
      },

      // Хэм алдагдлын эсрэг эмийн хэрэглээ
      {
        Name: 'hem_aldagdal_esreg',
        // Label: "Хэм алдагдлын эсрэг эмийн хэрэглээ",
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
        OptionType: 'r_hem_aldagdal_esreg',
      },

      // Өмнө хийгдэсэн эмчилгээ
      {
        Name: 'umnuh_emchilgee',
        // Label: "Өмнө хийгдэсэн эмчилгээ",
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
        OptionType: 'r_umnuh_emchilgee',
      },

      // Тогтмол уудаг эмийн хэрэглээ
      {
        Name: 'togtmol_uudag_em',
        // Label: "Тогтмол уудаг эмийн хэрэглээ",
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
        OptionType: 'r_togtmol_uudag_em',
      },

      // Эрсдлийн үнэлгээ
      { Name: 'chads2_score', Label: 'CHADS2 score', Type: 'Number' },
      {
        Name: 'chads2_vasc_score',
        Label: 'CHA2DS2 – VASc score',
        Type: 'Number',
      },
      { Name: 'has_bled_score', Label: 'HAS – BLED score', Type: 'Number' },
      { Name: 'c2hest_score', Label: 'C2HEST Score ', Type: 'Number' },
    ],
  ];

  this.ObjectName = 'AtrialRhythm';
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

module.exports = AtrialRhythmConfig;
