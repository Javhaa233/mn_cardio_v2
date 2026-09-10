const { Models } = require('../../config/DB');
const Model = Models.ICDRhythm;
const ModelLookUp = Models.ICDRhythmLookUp;

function ICDRhythmConfig() {
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
    [
      { Name: 'suulgasan_ognoo', Label: 'ICD суулгасан огноо:', Type: 'Text' },
      { Name: 'hevtsen_ognoo', Label: 'Хэвтсэн огноо', Type: 'Text' },
      { Name: 'now_age', Label: 'ICD суулгах үеийн нас', Type: 'Text' },
      {
        Name: 'suulgasan_baidal',
        Label: 'ICD байдал',
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
        Label: 'ICD бүртгэлийн төвд зөвхөн хамаарна. Код:',
        Type: 'Text',
      },
    ],
    // III. Өвчний түүх болон эрсдэлт хүчин зүйлс
    [
      // Илэрч буй шинж тэмдгүүд: (хэд хэдийг сонгож болно)
      {
        Name: 'anhdagch',
        Label: 'Анхдагч урьдчилан сэргийлэлт',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_uridchilan_sergiilelt',
      },
      { Name: 'anhdagch_other', Label: 'Бусад', Type: 'Text' },
      {
        Name: 'hoyordogch',
        Label: 'Хоёрдогч урьдчилан сэргийлэлт',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_uridchilan_sergiilelt',
      },
      { Name: 'hoyordogch_other', Label: 'Бусад', Type: 'Text' },

      {
        Name: 'hem_aldagdal_helber',
        Label: 'Хэм алдагдлын хэлбэр (хэд хэдийг сонгож болно)',
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
        OptionType: 'r_aldagdal_helber',
      },
      { Name: 'hem_aldagdal_helber_other', Label: 'Бусад', Type: 'TextArea' },

      {
        Name: 'zurh_suuri_emgeg',
        Label: 'Зүрхний суурь эмгэг',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_zurh_suuri',
      },
      { Name: 'zurh_suuri_emgeg_other', Label: 'Бусад', Type: 'Text' },
      { Name: 'zuun_hovdol_ef', Label: 'Зүүн ховдлын EF (%)', Type: 'Number' }, // float
    ],

    // IV. Титэм судасны эмгэгт хүргэх эрсдэлт хүчин зүйлс
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

    // V. Бусад онцлох өвчний түүх
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

    // VI. ICD суулгах ажилбар
    [
      {
        Name: 'helber',
        Label: 'ICD-ийн хэлбэр',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_ajilbar_helber',
      },

      //
      {
        Name: 'zuun_hovdol',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_ajilbar_zuun_hovdol',
      },
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
      {
        Name: 'electrod_bairlal_bh',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_bairlal_bh',
      },
      {
        Name: 'electrod_bairlal_zh_bhajuu',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_bairlal_zh_bhajuu',
      },
      {
        Name: 'electrod_bairlal_zh_zhajuu',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_bairlal_zh_zhajuu',
      },

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

      // Төхөөрөмжийн пейсмейкерийн үзүүлэлтүүд
      {
        Name: 'tuh_electrod_helber',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_tuh_elect_helber',
      },
      { Name: 'tuh_slew_rate', Type: 'Text' },
      { Name: 'tuh_pacing_thres', Type: 'Text' },
      { Name: 'tuh_pacing_impa', Type: 'Text' },

      // Pulse Generator
      {
        Name: 'pulse_zagvar',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_zagvar',
      },
      { Name: 'pulse_zagvar_other', Type: 'Text' },
      { Name: 'pulse_model_no', Type: 'Text' },
      { Name: 'pulse_serial_no', Type: 'Text' },
      {
        Name: 'pulse_bairlal',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_pulse_bairlal',
      },
      { Name: 'pulse_bairlal_other', Type: 'Text' },

      // Дефибрилляторийн зааг тест (DFT testing)
      {
        Name: 'is_dft_testing',
        Label: 'Тест хийгдсэн ?',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      {
        Name: 'y_dft_testing',
        Label: 'Хэрэв тийм бол 10J-ийн аюулгүй хязгаартай тэнцүү эсвэл илүү байсан ?',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
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

    // VII. Хүндрэл (эмнэлэгт байх үеийн)
    [
      {
        Name: 'is_hundrel',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_hevteh_hundrel',
      },
      { Name: 'hevteh_hundrel_other', Label: 'aris_tun', Type: 'Text' },
    ],

    // VIII. Багажийг дахин суулгах болон эргүүлж авах
    [
      {
        Name: 'is_bagaj_dahin',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      // Зөвхөн дахиж суулгах тохиолдолд бөглөнө
      { Name: 's_first_date', Label: 'Анх суулгасан огноо', Type: 'Text' },
      {
        Name: 's_solison_date',
        Label: 'Өмнө нь үүсгүүрийг сольсон огноо',
        Type: 'Text',
      },

      // Үүсгүүрийг эргүүлж авах:
      {
        Name: 'uus_zagvar',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_zagvar',
      },
      { Name: 'uus_model_no', Type: 'Text' },
      { Name: 'uus_serial_no', Type: 'Text' },
      { Name: 'uus_bairlal', Type: 'Text' },
      {
        Name: 'uus_shaltgaan',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_uus_shaltgaan',
      },
      { Name: 'uus_shaltgaan_other', Type: 'Text' },

      {
        Name: 'is_electrod_awsan',
        Label: 'Электродийг эргүүлж авсан',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
      },
      {
        Name: 'electrod_bair_date',
        Label: 'Электрод байрлуулсан огноо',
        Type: 'Text',
      },
      {
        Name: 'e_electrod_bairlal',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_el_bairlal_bt',
      },
      {
        Name: 'e_electrod_zagvar',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_zagvar',
      },
      { Name: 'e_electrod_model_no', Type: 'Text' },
      { Name: 'e_electrod_serial_no', Type: 'Text' },
      {
        Name: 'e_electrod_shaltgaan',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'r_e_electrod_shaltgaan',
      },
      { Name: 'e_electrod_shaltgaan_other', Type: 'Text' },
    ],
  ];

  this.ObjectName = 'ICDRhythm';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'ICD',
    NewObjectTitle: 'ICD create',
    EditObjectTitle: 'ICD edit',
  };
}

module.exports = ICDRhythmConfig;
