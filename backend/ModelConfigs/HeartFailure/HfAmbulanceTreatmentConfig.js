const { Models } = require('../../config/DB');
const Model = Models.HfAmbulanceTreatment;
const ModelLookUp = Models.HfAmbulanceTreatmentLookUp;

function HfAmbulanceTreatmentConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text' },
      { Name: 'AmbulanceId', Label: 'AmbulanceId', Type: 'Text' },

      // Эмчилгээ
      {
        Name: 'hf_emchilgee_check',
        Label: 'АХФС/ АРХ/ АРНС зөвлөсөн эсэх',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_emchilgee_check',
      },
      {
        Name: 'hf_axpc_nershil',
        Label: 'Хэрэв АХФС зөвлөсөн бол',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_axpc_nershil',
      },
      { Name: 'hf_axpc_other', Label: 'АХФС бусад', Type: 'Text' },
      { Name: 'hf_axpc_tun', Label: 'АХФС тун (мг/хоног)', Type: 'Number' },

      {
        Name: 'hf_apc_nershil',
        Label: 'Хэрэв АХС зөвлөсөн бол',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_apc_nershil',
      },
      { Name: 'hf_apc_other', Label: 'АРХ бусад', Type: 'Text' },
      { Name: 'hf_apc_tun', Label: 'АРХ тун (мг/хоног)', Type: 'Number' },

      {
        Name: 'aphc_tun',
        Label: 'Хэрэв АРНС зөвлөсөн бол тун (мг/хоног)',
        Type: 'Number',
      },

      {
        Name: 'hf_emchilgee_notcheck',
        Label: 'Хэрэв үгүй бол шалтгааныг сонгох',
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
        OptionType: 'hf_emchilgee_notcheck',
      },
      { Name: 'hf_emchilgee_notcheck_other', Label: 'Бусад', Type: 'Text' },

      {
        Name: 'is_beta_horiglogch',
        Label: 'Бета хориглогч',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'hf_beta_horiglogch_nershil',
        Label: 'Хэрэв тийм бол',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_beta_horiglogch_nershil',
      },
      { Name: 'hf_beta_horiglogch_other', Label: 'Бусад', Type: 'Text' },
      {
        Name: 'hf_beta_horiglogch_tun',
        Label: 'Тун (мг/хоног)',
        Type: 'Number',
      },

      {
        Name: 'hf_notbeta_horiglogch',
        Label: 'Хэрэв үгүй бол',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_notbeta_horiglogch',
      },
      { Name: 'hf_notbeta_horiglogch_other', Label: 'Бусад', Type: 'Text' },

      {
        Name: 'is_mra',
        Label: 'Минералокортикоид рецепторын антагонист',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'hf_mra_check',
        Label: 'Хэрэв тийм бол',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_mra_check',
      },
      { Name: 'hf_mra_tun', Label: 'Тун (мг/хоног)', Type: 'Number' },

      {
        Name: 'hf_mra_notcheck',
        Label: 'Хэрэв үгүй бол',
        Type: 'CheckBox',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_mra_notcheck',
      },
      { Name: 'hf_mra_notcheck_other', Label: 'Бусад', Type: 'Text' },

      {
        Name: 'is_sglt2',
        Label: 'SGLT2 саатуулагч',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'hf_sglt2_check',
        Label: 'Хэрэв тийм бол',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_sglt2_check',
      },
      { Name: 'hf_sglt2_tun', Label: 'Тун (мг/хоног)', Type: 'Number' },
      {
        Name: 'hf_sglt2_notcheck',
        Label: 'Хэрэв үгүй бол',
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
        OptionType: 'hf_sglt2_notcheck',
      },
      { Name: 'hf_sglt2_notcheck_other', Label: 'Бусад', Type: 'Text' },

      {
        Name: 'is_ibabradin',
        Label: 'Ивабрадин зөвлөсөн эсэх',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      { Name: 'ibabradin_tun', Label: 'Тун (мг/хоног)', Type: 'Number' },

      {
        Name: 'is_antitrombotic',
        Label: 'Антитромботик зөвлөсөн эсэх',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'hf_antitrombotic_check',
        Label: 'Хэрэв тийм бол',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_antitrombotic_check',
      },
      { Name: 'hf_antitrombotic_other', Label: 'Бусад', Type: 'Text' },
      { Name: 'hf_antitrombotic_tun', Label: 'Тун (мг/хоног)', Type: 'Number' },

      {
        Name: 'is_digoksin',
        Label: 'Дигоксин',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      { Name: 'digoksin_tun', Label: 'Тун (мкг/хоног)', Type: 'Number' },
      {
        Name: 'is_shees_huuh_em',
        Label: 'Шээс хөөх эм',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'hf_shees_huuh_em_check',
        Label: 'Хэрэв тийм бол',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_shees_huuh_em_check',
      },
      {
        Name: 'hf_shees_huuh_em_other',
        Label: 'Шээс хөөх эм бусад',
        Type: 'Text',
      },
      { Name: 'hf_shees_huuh_em_tun', Label: 'Тун (мг/хоног)', Type: 'Number' },
      {
        Name: 'is_lipid_buuruulah',
        Label: 'Липид бууруулах эм',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'hf_lipid_buuruulah_em_check',
        Label: 'Хэрэв тийм бол',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_lipid_buuruulah_em_check',
      },
      { Name: 'hf_lipid_buuruulah_em_other', Label: 'Бусад', Type: 'Text' },
      {
        Name: 'hf_lipid_buuruulah_em_tun',
        Label: 'Тун (мг/хоног)',
        Type: 'Number',
      },

      {
        Name: 'is_sudas_telegch',
        Label: 'Судас тэлэгч эм',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'hf_sudas_telegch_em_check',
        Label: 'Хэрэв тийм бол',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_sudas_telegch_em_check',
      },
      {
        Name: 'hf_sudas_telegch_em_tun',
        Label: 'Тун (мг/хоног)',
        Type: 'Number',
      },

      // tuhuurumj
      {
        Name: 'hf_tuhuurumj_zowloson',
        Label: 'Төхөөрөмж суулгац эмчилгээ зөвлөсөн санал болгосон эсэх',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_tuhuurumj_zowloson',
      },
      {
        Name: 'hf_tuhuurumj_zowloson_check',
        Label: 'Хэрэв тийм бол',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_tuhuurumj_zowloson_check',
      },
      // Сэргээн засах эмчилгээ
      {
        Name: 'sergen_zasah',
        Label: 'Сэргээн засах эмчилгээ санал болгосон эсэх',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'hf_sergeen_zasah_emchilgee_notcheck',
        Label: 'Хэрэв үгүй бол шалтгааныг сонгоно уу',
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
        OptionType: 'hf_sergeen_zasah_emchilgee_notcheck',
      },
      { Name: 'sergen_zasah_not_other', Label: 'Бусад', Type: 'Text' },

      // Цаашид
      { Name: 'davtan_date', Label: 'Давтан үзүүлэх огноо', Type: 'Text' },
      {
        Name: 'hevtuuleh',
        Label: 'Эмнэлэгт хэвтүүлэх',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'shiljuuleh',
        Label: 'Шилжүүлэх',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      { Name: 'notes', Label: 'Тэмдэглэл', Type: 'Text' },
    ],
  ];

  this.ObjectName = 'HfAmbulanceTreatment';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Heart failure ambulance treatment',
    NewObjectTitle: 'Heart failure ambulance treatment create',
    EditObjectTitle: 'Heart failure ambulance treatment edit',
  };
}

module.exports = HfAmbulanceTreatmentConfig;
