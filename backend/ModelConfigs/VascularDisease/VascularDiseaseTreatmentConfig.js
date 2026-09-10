const { Models } = require('../../config/DB');
const Model = Models.VascularDiseaseTreatment;
const ModelLookUp = Models.VascularDiseaseTreatmentLookUp;

function VascularDiseaseTreatmentConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text' },
      { Name: 'DiseaseId', Label: 'DiseaseId', Type: 'Text' },
      {
        Name: 'emchilgee_check',
        Label: 'АХФС/ АРХ/ АРНС зөвлөсөн эсэх',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_emchilgee_check',
      },
      // АХФС
      {
        Name: 'axpc_nershil',
        Label: 'АХФС зөвлөсөн нэршил',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_axpc_nershil',
      },
      { Name: 'axpc_other', Label: 'АХФС  зөвлөсөн (бусад)', Type: 'Text' },
      { Name: 'axpc_tun', Label: 'АХФС тун (мг/хоног)', Type: 'Number' },
      // АРХ
      {
        Name: 'apc_nershil',
        Label: 'АРХ зөвлөсөн бол эмийн нэршил',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_apc_nershil',
      },
      { Name: 'apc_other', Label: 'АРХ зөвлөсөн (бусад)', Type: 'Text' },
      { Name: 'apc_tun', Label: 'АРХ тун (мг/хоног)', Type: 'Number' },
      // АРНС
      {
        Name: 'aphc_tun',
        Label: 'АРНС зөвлөсөн бол тун (мг/хоног)',
        Type: 'Number',
      },
      //
      {
        Name: 'emchilgee_notcheck',
        Label: 'зөвлөөгүй бол шалтгаан',
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
      {
        Name: 'emchilgee_other',
        Label: 'зөвлөөгүй бол шалтгаан (бусад)',
        Type: 'Text',
      },
      {
        Name: 'is_beta_horiglogch',
        Label: 'Бета хориглогч',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'beta_horiglogch_nershil',
        Label: 'Бета-хориглогчийн нэршил',
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
        OptionType: 'hf_beta_horiglogch_nershil',
      },
      {
        Name: 'beta_horiglogch_other',
        Label: 'Бета-хориглогчийн нэршил (бусад)',
        Type: 'Text',
      },
      {
        Name: 'beta_horiglogch_tun',
        Label: 'Бета-хориглогчийн тун (мг/хоног)',
        Type: 'Number',
      },
      {
        Name: 'not_beta_shaltgaan',
        Label: 'Бета-хориглогч зөвлөөгүй',
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
        OptionType: 'hf_notbeta_horiglogch',
      },
      {
        Name: 'not_beta_other',
        Label: 'Бета-хориглогч зөвлөөгүй (бусад)',
        Type: 'Text',
      },
      {
        Name: 'is_mra',
        Label: 'Минералокортикоид рецепторын антагонист',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'mra_check',
        Label: 'Минералокортикоид рецепторын антагонист нэршил',
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
        OptionType: 'hf_mra_check',
      },
      {
        Name: 'mra_tun',
        Label: 'Минералокортикоид рецепторын антагонист тун (мг/хоног)',
        Type: 'Number',
      },
      {
        Name: 'mra_notcheck',
        Label: 'Минералокортикоид рецепторын антагонист зөвлөөгүй',
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
        OptionType: 'hf_mra_notcheck',
      },
      {
        Name: 'mra_notcheck_other',
        Label: 'Минералокортикоид рецепторын антагонист зөвлөөгүй (бусад)',
        Type: 'Text',
      },
      {
        Name: 'is_sglt2',
        Label: 'SGLT2 саатуулагч',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'sglt2_check',
        Label: 'SGLT2 саатуулагч нэршил',
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
        OptionType: 'hf_sglt2_check',
      },
      {
        Name: 'sglt2_tun',
        Label: 'SGLT2 саатуулагч тун (мг/хоног)',
        Type: 'Number',
      },
      {
        Name: 'sglt2_notcheck',
        Label: 'SGLT2 саатуулагч зөвлөөгүй',
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
      {
        Name: 'sglt2_notcheck_other',
        Label: 'SGLT2 саатуулагч зөвлөөгүй (бусад)',
        Type: 'Text',
      },

      //
      {
        Name: 'is_antiagregant',
        Label: 'Антиагрегант',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'vd_antiagregant_check',
        Label: 'Антиагрегант зөвлөсөн эмийн нэршил',
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
        OptionType: 'vd_antiagregant_check',
      },
      {
        Name: 'vd_antiagregant_em_ner',
        Label: 'Антиагрегант эмийн нэр',
        Type: 'Text',
      },
      {
        Name: 'vd_antiagregant_tun',
        Label: 'Антиагрегант эмийн тун (мг/хоног)',
        Type: 'Number',
      },
      {
        Name: 'vd_antiagregant_em_ner1',
        Label: 'Антиагрегант эмийн нэр1',
        Type: 'Text',
      },
      {
        Name: 'vd_antiagregant_tun1',
        Label: 'Антиагрегант эмийн тун1 (мг/хоног)',
        Type: 'Number',
      },
      {
        Name: 'vd_antiagregant_em_ner2',
        Label: 'Антиагрегант эмийн нэр2',
        Type: 'Text',
      },
      {
        Name: 'vd_antiagregant_tun2',
        Label: 'Антиагрегант эмийн тун2 (мг/хоног)',
        Type: 'Number',
      },

      //
      {
        Name: 'is_antikoagulyant',
        Label: 'Уухаар антикоагулянт',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'vd_antikoagulyant_check',
        Label: 'Уухаар антикоагулянт эм зөвлөсөн',
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
        OptionType: 'vd_antikoagulyant_check',
      },
      {
        Name: 'vd_antikoagulyant_other',
        Label: 'Уухаар антикоагулянт (Бусад)',
        Type: 'Text',
      },
      // {
      //   Name: "vd_antikoagulyant_em_ner",
      //   Label: "Уухаар антикоагулянт эмийн нэр",
      //   Type: "Text",
      // },
      {
        Name: 'vd_antikoagulyant_tun',
        Label: 'Уухаар антикоагулянт эмийн тун (мг/хоног)',
        Type: 'Number',
      },

      // {
      //   Name: "vd_antikoagulyant_em_ner1",
      //   Label: "Уухаар антикоагулянт эмийн нэр1",
      //   Type: "Text",
      // },
      // {
      //   Name: "vd_antikoagulyant_tun1",
      //   Label: "Уухаар антикоагулянт эмийн тун1 (мг/хоног)",
      //   Type: "Number",
      // },
      // {
      //   Name: "vd_antikoagulyant_em_ner2",
      //   Label: "Уухаар антикоагулянт эмийн нэр2",
      //   Type: "Text",
      // },
      // {
      //   Name: "vd_antikoagulyant_tun2",
      //   Label: "Уухаар антикоагулянт эмийн тун2 (мг/хоног)",
      //   Type: "Number",
      // },

      //
      {
        Name: 'is_shees_huuh_em',
        Label: 'Шээс хөөх эм',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'shees_huuh_em_check',
        Label: 'Шээс хөөх эм нэршил',
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
        OptionType: 'hf_shees_huuh_em_check',
      },
      { Name: 'shees_huuh_em_other', Label: 'Бусад', Type: 'Text' },
      { Name: 'shees_huuh_em_tun', Label: 'Тун (мг/хоног)', Type: 'Number' },
      {
        Name: 'is_lipid_buuruulah',
        Label: 'Липид бууруулах эм',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'lipid_buuruulah_em_check',
        Label: 'Липид бууруулах эм нэршил',
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
        OptionType: 'hf_lipid_buuruulah_em_check',
      },
      { Name: 'lipid_buuruulah_em_other', Label: 'Бусад', Type: 'Text' },
      {
        Name: 'lipid_buuruulah_em_tun',
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
        Name: 'sudas_telegch_em_check',
        Label: 'Судас тэлэгч эм нэршил',
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
        OptionType: 'hf_sudas_telegch_em_check',
      },
      { Name: 'sudas_telegch_em_tun', Label: 'Тун (мг/хоног)', Type: 'Number' },
      {
        Name: 'sudas_telegch_em_tun2',
        Label: 'Тун (мг/хоног)',
        Type: 'Number',
      },
      {
        Name: 'sudas_telegch_em_tun3',
        Label: 'Тун (мг/хоног)',
        Type: 'Number',
      },

      // monitoring
      { Name: 'hyanalt', Label: 'ХЯНАЛТ', Type: 'Text' },
      { Name: 'notes', Label: 'Тэмдэглэл', Type: 'Text' },
    ],
  ];

  this.ObjectName = 'VascularDiseaseTreatment';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Vascular Disease Ambulance Treatment',
    NewObjectTitle: 'Vascular Disease Ambulance Treatment create',
    EditObjectTitle: 'Vascular Disease Ambulance Treatment edit',
  };
}

module.exports = VascularDiseaseTreatmentConfig;
