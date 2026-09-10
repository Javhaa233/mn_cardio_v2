const { Models } = require('../../config/DB');
const Model = Models.PaceMakerRhythm;
const ModelLookUp = Models.PaceMakerRhythmLookUp;

function PaceMakerRhythmConfig() {
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

    // Organization
    [
      {
        Name: 'organization_id',
        Label: 'Эрүүл мэндийн байгууллага',
        Type: 'GridLookUpSingleLoad',
        Config: {
          ObjectName: 'Organization',
          IdField: 'Id',
          TextField: 'Name',
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

    // II. Эмнэлэгт хэвтэх үеийн бүртгэл
    [
      {
        Name: 'suulgasan_ognoo',
        Label: 'Пейсмейкер суулгасан огноо:',
        Type: 'Text',
      },
      { Name: 'hevtsen_ognoo', Label: 'Хэвтсэн огноо', Type: 'Text' },
      { Name: 'now_age', Label: 'Пейсмейкер суулгах үеийн нас', Type: 'Text' },
      {
        Name: 'suulgasan_baidal',
        Label: 'Пейсмейкер байдал',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_suulgasan_baidal',
      },
      { Name: 'suulgasan_baidal_other', Label: 'Бусад', Type: 'Text' },
      { Name: 'garsan_ognoo', Label: 'Гарсан огноо', Type: 'Text' },
      {
        Name: 'monitoring_hostpital_name',
        Label: 'Хяналтанд байх эмнэлгийн нэр',
        Type: 'Text',
      },
      {
        Name: 'code',
        Label: 'Пейсмейкер бүртгэлийн төвд зөвхөн хамаарна. Код:',
        Type: 'Text',
      },
    ],

    // III. Пейсмейкер эмчилгээний заалт (нэгийг нь сонгох)
    [
      {
        Name: 'emchilgee_zaalt',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_emchilgee_zaalt_pm',
      },
      { Name: 'emchilgee_zaalt_other', Label: 'Бусад', Type: 'Text' },
      {
        Name: 'suulgah_ablation',
        Label: 'Пейсмейкер суулгах шаардлагатай: Абляци:',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
    ],

    // IV. Шинж тэмдэг (хэд хэдийг сонгож болно)
    [
      {
        Name: 'shinj_temdeg',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_shinj_temdeg',
      },
      { Name: 'shinj_temdeg_other', Label: 'Бусад', Type: 'Text' },
    ],

    // V. Зүрхний үндсэн өвчин (нэгийг нь сонгох)
    [
      {
        Name: 'undsen_uvchin',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_undsen_uvchin_pm',
      },
      { Name: 'undsen_uvchin_other', Label: 'Бусад', Type: 'Text' },
    ],

    // VI. Титэм судасны эмгэгт хүргэх эрсдэлт хүчин зүйлс
    [
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

      // {
      //   Name: "arhi_hereglee",
      //   Label: "Архины хэрэглээ",
      //   Type: "RadioBox",
      //   Config: { IdField: "Value", TextField: "Label" },
      //   OptionType: "r_arhidalt",
      // },
      // {
      //   Name: "arhinaas_garsan_hugatsaa",
      //   Label: "Архинаас гарсан хугацаа",
      //   Type: "Text",
      // },
    ],

    // VII. Бусад онцлох өвчний түүх
    [
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

      { Name: 'y_havhlaga_gajig_mes', Label: 'Хэрэв тийм бол', Type: 'Text' },
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
        Name: 'y_haldvart_endokardit',
        Label: 'Хэрэв тийм бол',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_haldvart_endokardit',
      },
      { Name: 'y_uusgech', Label: 'Үүсгэч', Type: 'Text' },
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
      {
        Name: 'is_other_uvchin',
        Label: 'Бусад',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      {
        Name: 'y_other_uvchin',
        Label: 'Хэрэв тийм бол тодорхой бичих',
        Type: 'Text',
      },
    ],

    // VIII. Пейсмейкер суулгах ажилбар
    [
      {
        Name: 'hiigdsen_ajilbar',
        Label: 'Хийгдсэн ажилбар (нэгийг сонгоно) ',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_pm_hiigdsen_ajilbar',
      },
      { Name: 'hiigdsen_ajilbar_other', Type: 'Text' },
      {
        Name: 'uus_tuluv',
        Label: 'Үүсгүүрийн төлөв (нэгийг сонгоно)',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_pm_uus_tuluv',
      },
      { Name: 'uus_tuluv_other', Label: 'Бусад', Type: 'Text' },
      {
        Name: 'ajil_elect_helber',
        Label: 'Электродны хэлбэр',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_pm_ajil_elect_helber',
      },
      {
        Name: 'ajil_elect_tuil',
        Label: 'Электродийн туйл',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_pm_ajil_elect_tuil',
      },

      //
      {
        Name: 'electrid_behelgee_bt',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_behelgee',
      },
      {
        Name: 'electrid_behelgee_bh',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_behelgee',
      },
      {
        Name: 'electrid_behelgee_zh',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_behelgee',
      },

      {
        Name: 'hatgalt_sudas_bt',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_hatgalt_sudas',
      },
      {
        Name: 'hatgalt_sudas_bh',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_hatgalt_sudas',
      },
      {
        Name: 'hatgalt_sudas_zh',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_hatgalt_sudas',
      },

      {
        Name: 'electrod_zagvar_bt',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_zagvar',
      },
      { Name: 'electrod_zagvar_bt_other', Type: 'Text' },
      {
        Name: 'electrod_zagvar_bh',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_zagvar',
      },
      { Name: 'electrod_zagvar_bh_other', Type: 'Text' },
      {
        Name: 'electrod_zagvar_zh',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_zagvar',
      },
      { Name: 'electrod_zagvar_zh_other', Type: 'Text' },

      {
        Name: 'electrod_bairlal_bt',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_el_bairlal_bt',
      },
      { Name: 'electrod_bairlal_bh', Type: 'Text' },
      { Name: 'electrod_bairlal_zh_bhajuu', Type: 'Text' },
      { Name: 'electrod_bairlal_zh_zhajuu', Type: 'Text' },

      // { Name: "electrod_bairlal_zh", Type: "Text" },

      { Name: 'electrod_zagvar_no', Type: 'Text' },
      { Name: 'electrod_zagvar_no_bt', Type: 'Text' },
      { Name: 'electrod_zagvar_no_bh', Type: 'Text' },
      { Name: 'electrod_zagvar_no_zh', Type: 'Text' },

      { Name: 'electrod_serial_no', Type: 'Text' },
      { Name: 'electrod_serial_no_bt', Type: 'Text' },
      { Name: 'electrod_serial_no_bh', Type: 'Text' },
      { Name: 'electrod_serial_no_zh', Type: 'Text' },

      { Name: 'pr_amp', Type: 'Text' },
      { Name: 'pr_amp_bt', Type: 'Text' },
      { Name: 'pr_amp_bh', Type: 'Text' },
      { Name: 'pr_amp_zh', Type: 'Text' },

      { Name: 'slew_rate', Type: 'Text' },
      { Name: 'slew_rate_bt', Type: 'Text' },
      { Name: 'slew_rate_bh', Type: 'Text' },
      { Name: 'slew_rate_zh', Type: 'Text' },

      { Name: 'pacing_thres', Type: 'Text' },
      { Name: 'pacing_thres_bt', Type: 'Text' },
      { Name: 'pacing_thres_bh', Type: 'Text' },
      { Name: 'pacing_thres_zh', Type: 'Text' },

      { Name: 'resistance', ype: 'Text' },
      { Name: 'resistance_bt', ype: 'Text' },
      { Name: 'resistance_bh', ype: 'Text' },
      { Name: 'resistance_zh', ype: 'Text' },

      // Pulse Generator
      { Name: 'pulse_zagvar', Type: 'Text' },
      { Name: 'pulse_model_no', Type: 'Text' },
      { Name: 'pulse_serial_no', Type: 'Text' },
      { Name: 'pulse_bairlal', Type: 'Text' },

      {
        Name: 'ajilbar_full_time',
        // Label: "Ажилбар хийгдсэн нийт хугацаа (мин : сек)",
        Type: 'Text',
      },
      {
        Name: 'fulu_full_time',
        // Label: "Флюроскопи хийгдсэн нийт хугацаа (мин : сек)",
        Type: 'Text',
      },
      {
        Name: 'gadar_tun',
        // Label: "Гадаргуугийн тун (mGy.cm2)",
        Type: 'Text',
      },
      {
        Name: 'aris_tun',
        // Label: "Арьсны тун (mGy)",
        Type: 'Text',
      },
    ],

    // IX. Хүндрэл (эмнэлэгт байх үеийн)
    [
      {
        Name: 'is_hundrel',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_hevteh_hundrel',
      },
      { Name: 'hevteh_hundrel_other', Label: 'aris_tun', Type: 'Text' },
    ],

    // X. Пейсмейкерийг эргүүлж авах ажилбар (зөвхөн хуучин үүсгүүр болон электродийг авч буй үед бөглөнө)
    [
      {
        Name: 'ea_pulse_zagvar',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_zagvar',
      },
      { Name: 'ea_pulse_zagvar_other', Type: 'Text' },
      { Name: 'ea_pulse_model_no', Type: 'Text' },
      { Name: 'ea_pulse_serial_no', Type: 'Text' },
      {
        Name: 'ea_pulse_shaltgaan',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_zagvar',
      },
      { Name: 'ea_pulse_shaltgaan_other', Type: 'Text' },

      // Electrod
      {
        Name: 'ea_elect_bairlal',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_zagvar',
      },
      {
        Name: 'ea_elect_zagvar',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_zagvar',
      },
      { Name: 'ea_elect_zagvar_other', Type: 'Text' },
      { Name: 'ea_elect_model_no', Type: 'Text' },
      { Name: 'ea_elect_serial_no', Type: 'Text' },
      {
        Name: 'ea_elect_shaltgaan',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_zagvar',
      },
      { Name: 'ea_elect_shaltgaan_other', Type: 'Text' },
      {
        Name: 'ea_elect_2_bairlal',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_zagvar',
      },
      {
        Name: 'ea_elect_2_zagvar',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_zagvar',
      },
      { Name: 'ea_elect_2_zagvar_other', Type: 'Text' },
      { Name: 'ea_elect_2_model_no', Type: 'Text' },
      { Name: 'ea_elect_2_serial_no', Type: 'Text' },
      {
        Name: 'ea_elect_2_shaltgaan',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_zagvar',
      },
      { Name: 'ea_elect_2_shaltgaan_other', Type: 'Text' },
    ],
  ];

  this.ObjectName = 'PaceMakerRhythm';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Pace maker',
    NewObjectTitle: 'Pace maker create',
    EditObjectTitle: 'Pace maker edit',
  };
}

module.exports = PaceMakerRhythmConfig;
