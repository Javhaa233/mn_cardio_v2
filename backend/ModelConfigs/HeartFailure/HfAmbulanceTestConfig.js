const { Models } = require('../../config/DB');
const Model = Models.HfAmbulanceTest;
const ModelLookUp = Models.HfAmbulanceTestLookUp;

function HfAmbulanceTestConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Number' },
      { Name: 'AmbulanceId', Label: 'AmbulanceId', Type: 'Number' },
      { Name: 'test_date', Label: 'Огноо', Type: 'Date' },

      { Name: 'tsagaan_es', Label: 'Цагаан эс (x10^9/л)', Type: 'Number' },
      { Name: 'yaltas_es', Label: 'Ялтас эс (x10^9/л)', Type: 'Number' },
      { Name: 'gemoglobin', Label: 'Гемоглобин (г/дл)', Type: 'Number' },
      { Name: 'natri', Label: 'Натри (ммоль/л)', Type: 'Number' },
      { Name: 'kali', Label: 'Kали (ммоль/л)', Type: 'Number' },
      {
        Name: 'sheesnii_huchil',
        Label: 'Шээсний хүчил (мг/дл)',
        Type: 'Number',
      },
      { Name: 'creatinin', Label: 'Креатинин', Type: 'Number' },
      {
        Name: 'creatinin_type',
        Type: 'RadioBox',
        OptionType: 'hf_creatinin_type',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      { Name: 'mochevin', Label: 'Мочевин (ОУН/л)', Type: 'Number' },
      { Name: 'albumin', Label: 'Альбумин (г/л)', Type: 'Number' },
      { Name: 't_sh_h', Label: 'ТШХ (мл/мин)', Type: 'Number' }, // (Тооцоолох)  [[140 -нас(жил)]*жин(кг)]/[72*цусан дахь креатинин (тг/дл)], эмэгтэйд 0.85-р үржинэ)
      { Name: 'alat', Label: 'Алат (ОУН/л)', Type: 'Number' },
      { Name: 's_r_b', Label: 'СРБ (мг/дл)', Type: 'Number' },
      { Name: 'asat', Label: 'Асат (ОУН/л)', UnitLabel: '', Type: 'Number' },
      { Name: 'g_g_t', Label: 'ГГТ (ОУН/л)', Type: 'Number' },
      {
        Name: 'digoksin_level',
        Label: 'Дигоксин түвшин (мкг/л)',
        Type: 'Number',
      },
      { Name: 'tumur', Label: 'Төмөр (ммоль/л)', Type: 'Number' },
      { Name: 'ferritin', Label: 'Ферритин (мкг/л,  нг/мл)', Type: 'Number' },
      {
        Name: 'hf_ferritin_type',
        Label: '',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_ferritin_type',
      },
      { Name: 'n_t_pro_b_n_p', Label: 'NT-proBNP (пг/мл)', Type: 'Number' },
      { Name: 'b_n_p', Label: 'BNP (пг/мл)', Type: 'Number' },
      { Name: 'hb_a1c', Label: 'HbA1c (% (ЧШ-тэй))', Type: 'Number' },
      {
        Name: 'sanamsargui_glukoz',
        Label: 'Санамсаргүй глюкоз (ммоль/л)',
        Type: 'Number',
      },

      // Ongoo dutuu
      // Зүрхний цахилгаан бичлэг
      { Name: 'tsa_bichleg_date', Label: 'Огноо', Type: 'Date' },
      { Name: 'qrs_burdel', Label: 'QRS Бүрдэл (ms)', Type: 'Number' },
      {
        Name: 'hf_rhythm',
        Label: 'Хэмнэл',
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
        OptionType: 'hf_rhythm',
      },
      { Name: 'hf_rhythm_other', Label: 'Хэмнэл (Бусад)', Type: 'Text' },
      {
        Name: 'hf_zurh_horig',
        Label: 'Зүрхний хориг',
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
        OptionType: 'hf_zurh_horig',
      },
      {
        Name: 'hf_zurh_horig_other',
        Label: 'Зүрхний хориг (Бусад)',
        Type: 'Text',
      },

      // Зүрхний хэт авиан шинжилгээ
      { Name: 'het_avia_date', Label: 'Огноо', Type: 'Date' },
      { Name: 'lvdd', Label: 'LVDd (mm)', Type: 'Number' },
      { Name: 'lvds', Label: 'LVDs (mm)', Type: 'Number' },
      { Name: 'ivss', Label: 'IVSd (mm)', Type: 'Number' },
      { Name: 'pwd', Label: 'PWd (mm)', Type: 'Number' },
      { Name: 'lvmass', Label: 'LV mass (g)', Type: 'Number' },
      //  тооцоолох) (0.8{1.04[([LVEDD + IVSd +PWd]3 - LVEDD3)]} + 0.6)
      { Name: 'lvef', Label: 'LVEF (Simpson method) (%)', Type: 'Number' },
      { Name: 'lv_strain', Label: 'LV strain (%)', Type: 'Number' },
      { Name: 'la_volume', Label: 'LA volume (ml)', Type: 'Number' },

      // E/e’
      { Name: 'e_e_med', Label: 'E/e’ (Med)', Type: 'Number' },
      { Name: 'e_e_lat', Label: 'E/e’ (Lat)', Type: 'Number' },
      // e’
      { Name: 'e_med', Label: 'e’ (Med)', Type: 'Number' },
      { Name: 'e_lat', Label: 'e’ (Lat)', Type: 'Number' },

      {
        Name: 'uushig_systol_daralt',
        Label: 'Уушгины артерийн систолын даралт (мм.муб)',
        Type: 'Number',
      },
      { Name: 'tapse', Label: 'TAPSE (mm)', Type: 'Number' },
      { Name: 'rvw_d', Label: 'RVWd (mm)', Type: 'Number' },
      { Name: 'rv_fac', Label: 'RV FAC (%)', Type: 'Number' },
      {
        Name: 'havhlaga_emgeg',
        Label: 'Хавхлагын эмгэг',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },

      // 2хх- 2 хавтаст хавхлага, 3 хавтаст хавлага, УА- уушгины артер
      {
        Name: 'h_e_2xx_nar',
        Label: '2хх-ын нарийсал',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_level',
      },
      {
        Name: 'h_e_2xx_dut',
        Label: '2хх-ын дутагдал',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_level',
      },
      {
        Name: 'h_e_3xx_nar',
        Label: '3хх-ын нарийсал',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_level',
      },
      {
        Name: 'h_e_3xx_dut',
        Label: '3хх-ын дутагдал',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_level',
      },
      {
        Name: 'h_e_gol_nar',
        Label: 'Гол судасны хавхлагын нарийсал',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_level',
      },
      {
        Name: 'h_e_gol_dut',
        Label: 'Гол судасны хавхлагын дутагдал',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_level',
      },
      {
        Name: 'h_e_ua_nar',
        Label: 'УА-ын хавхлагын нарийсал',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_level',
      },
      {
        Name: 'h_e_ua_dut',
        Label: 'УА-ын хавхлагын дутагдал',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_level',
      },

      { Name: 'mibi_date', Label: 'Огноо', Type: 'Date' },
      { Name: 'mibi_lvef', Label: 'LVEF (%)', Type: 'Number' },
      { Name: 'mibi_rvef', Label: 'RVEF (%)', Type: 'Number' },

      { Name: 'mri_date', Label: 'Огноо', Type: 'Date' },
      { Name: 'mri_lvef', Label: 'LVEF (%)', Type: 'Number' },
      { Name: 'mri_rvef', Label: 'RVEF (%)', Type: 'Number' },

      // Титэм судсан дотуурх оношилгоо
      { Name: 'titem_date', Label: 'Огноо', Type: 'Date' },
      {
        Name: 'hf_titem_dvgnelt',
        Label: 'Дүгнэлт',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_titem_dvgnelt',
      },

      // Бусад шинжилгээнүүд
      {
        Name: 'hf_busad_shinjilgee',
        Label: 'Хэрэв доорх өвөрмөц шинжилгээнээс хийгдсэн бол',
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
        OptionType: 'hf_busad_shinjilgee',
      },

      {
        Name: 'is_biopsi_uurchlult',
        Label: 'Зүрхний булчингийн биопси хийгдсэн эсэх',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'biopsi_uurchlult',
        Label: 'Эмгэг судлалын хариуг бичнэ үү',
        Type: 'Text',
      },
      {
        Name: 'is_cardio_pul_vo_max',
        Label: 'Зүрх уушгины ачаалалтай сорил хийгдсэн эсэх',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'cardio_pul_vo_max',
        Label: 'VO2max (мл/кг/мин)',
        Type: 'Number',
      },
    ],
  ];

  this.ObjectName = 'HfAmbulanceTest';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Heart failure ambulance test',
    NewObjectTitle: 'Heart failure ambulance test create',
    EditObjectTitle: 'Heart failure ambulance test edit',
  };
}

module.exports = HfAmbulanceTestConfig;
