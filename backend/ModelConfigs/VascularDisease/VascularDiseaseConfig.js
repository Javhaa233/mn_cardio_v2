const { Models } = require('../../config/DB');
const Model = Models.VascularDisease;
const ModelLookUp = Models.VascularDiseaseLookUp;

function VascularDiseaseConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Number' },
      { Name: 'is_confirm', Label: 'Батласан эсэх', Type: 'Text' },
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
      { Name: 'ConfirmedDate', Label: 'CreatedDate', Type: 'Text' },

      { Name: 'started_date', Label: 'Эхэлсэн он', Type: 'Text' },
      { Name: 'diagnosed_date', Label: 'Оншлогдсон огноо', Type: 'Text' },

      { Name: 'ad', Label: 'АД (мм.муб)', Type: 'Text' },
      { Name: 'ad_deed', Label: 'АД систол (мм.муб)', Type: 'Number' },
      { Name: 'ad_dood', Label: 'АД диастол (мм.муб)', Type: 'Number' },
      { Name: 'ztst', Label: 'ЗЦТ (удаа/мин)', Type: 'Number' },
      { Name: 'undur', Label: 'Өндөр (см)', Type: 'Number' },
      { Name: 'jin', Label: 'Жин (кг)', Type: 'Number' },

      { Name: 'bji', Label: 'БЖИ (кг/м2)', Type: 'Text' }, // (Тооцоолох)
      { Name: 'bgt', Label: 'БГТ (BSA) (м2)', Type: 'Text' }, // (Тооцоолох)
      {
        Name: 'heartache',
        Label: 'Одоогийн зовуурь',
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
        OptionType: 'heartache',
      },
      { Name: 'heartache_other', Label: 'Зовуурь (Бусад)', Type: 'Text' },
      {
        Name: 'vd_ccs_angilal',
        Label: 'Цээжний тогтвортой бахын үйл ажиллагааны ангилал',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_ccs_angilal',
      },

      //Үзлэгийн үеийн шинжилгээнүүд

      //ЦДШ-нд
      { Name: 'wbc', Label: 'WBC (*10^9)', Type: 'Number' },
      { Name: 'rbc', Label: 'RBC (*10^9)', Type: 'Number' },
      { Name: 'hgb', Label: 'HGB (g/dl)', Type: 'Number' },
      { Name: 'hct', Label: 'HCT (%)', Type: 'Number' },
      { Name: 'plt', Label: 'PLT (*10^9)', Type: 'Number' },
      // { Name: "plt", Label: "PLT (*10^9)", Type: "Number" },
      // { Name: "plt", Label: "PLT (*10^9)", Type: "Number" },
      // { Name: "plt", Label: "PLT (*10^9)", Type: "Number" },

      // Биохими

      // Холестеролын үзүүлэлтүүд
      { Name: 'ldl', Label: 'LDL (ммоль/л)', Type: 'Number' },
      { Name: 'hdl', Label: 'HDL (ммоль/л)', Type: 'Number' },
      { Name: 'triglyceride', Label: 'Триглицерид (ммоль/л)', Type: 'Number' },
      {
        Name: 'cholesterine',
        Label: 'Total cholesterine (mmol/l)',
        Type: 'Number',
      },
      {
        Name: 'non_cholesterine',
        Label: 'non-HDL холестерол (ммоль/л)',
        Type: 'Number',
      },
      {
        Name: 'uldets_cholesterine',
        Label: 'үлдэц холестеролууд (ммоль/л)',
        Type: 'Number',
      },

      { Name: 'kali', Label: 'Кали', Type: 'Number' },
      { Name: 'creatinin', Label: 'Креатинин', Type: 'Number', min: 10 },
      {
        Label: null,
        Name: 'creatinin_type',
        Type: 'RadioBox',
        OptionType: 'hf_creatinin_type',
        Config: { IdField: 'Value', TextField: 'Label' },
      },

      { Name: 'mochevin', Label: 'Мочевин (ммоль/л)', Type: 'Number' },
      { Name: 'egfr', Label: 'eGFR (мл/мин)', Type: 'Number' },
      { Name: 'asat', Label: 'Асат', Type: 'Number' },
      { Name: 'alam', Label: 'Алат', Type: 'Number' },
      { Name: 'ferritin', Label: 'Ферритин (мкг/л)', Type: 'Number' },
      { Name: 'sensitive_crp', Label: 'high sensitive CRP', Type: 'Number' },
      { Name: 'nt_pro_np', Label: 'NTproBNP (нг/мл)', Type: 'Number' },
      {
        Name: 'sanamsargui_glukoz',
        Label: 'Санамсаргүй буюу хоолны дараах глюкоз(ммоль/л)',
        Type: 'Number',
      },
      { Name: 'hba_1_c', Label: 'HBA1C(%)', Type: 'Number' },
      // { Name: "troponin", Label: "хмТропонин", Type: "Number" },

      // tsahilgaan bichleg
      { Name: 'tsa_bichleg_date', Label: 'Огноо (он/сар/өдөр)', Type: 'Text' },
      { Name: 'qrs_burdel', Label: 'QRS бүрдэл (мс)', Type: 'Number' },
      {
        Name: 'rhythm',
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
      { Name: 'rhythm_other', Label: 'Хэмнэл (Бусад)', Type: 'Text' },

      // zurhnii horig
      {
        Name: 'zurh_horig',
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
        Name: 'zurh_horig_other',
        Label: 'Зүрхний хориг (Бусад)',
        Type: 'Text',
      },
      {
        Name: 'giss_horig',
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
        OptionType: 'giss_horig',
      },
      {
        Name: 'giss_horig_other',
        Label: 'Гиссийн хориг (Бусад)',
        Type: 'Text',
      },
      {
        Name: 'vd_surug_t_shvd',
        Label: 'Сөрөг Т шүд',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_surug_t_shvd',
      },
      {
        Name: 'vd_st_buult',
        Label: 'ST буулт',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_surug_t_shvd',
      },

      // st urgugdul,
      {
        Name: 'vd_st_urgugdul',
        Label: 'ST өргөгдөл',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_surug_t_shvd',
      },

      // Emgeg Q shud
      {
        Name: 'vd_emgeg_q_shud',
        Label: 'Эмгэг Q шүд',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_surug_t_shvd',
      },
      {
        Name: 'vd_wellness',
        Label: 'Wellens шинж',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_wellness',
      },

      // Het avian shinjilgee
      { Name: 'het_avia_date', Label: 'Огноо', Type: 'Date' },
      { Name: 'lvdd', Label: 'LVDd (sm)', Type: 'Number' },
      { Name: 'lvds', Label: 'LVDs (sm)', Type: 'Number' },
      { Name: 'ivsd', Label: 'IVSd (sm)', Type: 'Number' },
      { Name: 'pwd', Label: 'PWd (sm)', Type: 'Number' },
      { Name: 'lv_mass', Label: 'LV mass (g)', Type: 'Number' }, // ( тооцоолох) (0.8{1.04[([LVEDD + IVSd +PWd]3 - LVEDD3)]} + 0.6)
      { Name: 'lvef_teicholz', Label: 'LVEF Teicholz (%)', Type: 'Number' }, // EF (%): -ECHO
      {
        Name: 'lvef_simpson_method',
        Label: 'LVEF Simpson method (%)',
        Type: 'Number',
      },
      { Name: 'lv_gls', Label: 'LV GLS', Type: 'Number' },
      { Name: 'la_volume', Label: 'LA volume (ml/m^2)', Type: 'Number' },
      { Name: 'ee_med', Label: 'E/e’(Med)', Type: 'Number' },
      { Name: 'ee_lat', Label: 'E/e’ (Lat)', Type: 'Number' },
      { Name: 'dundaj_ee', Label: 'Дундаж E/e', Type: 'Number' },
      { Name: 'taslavch_e', Label: 'Таславч e (см/сек)', Type: 'Number' },
      { Name: 'hajuu_hana_e', Label: 'Хажуу хана e (см/сек)', Type: 'Number' },
      {
        Name: 'uushig_systol_daralt',
        Label: 'Уушгины артерийн систолын даралт (мм.муб)',
        Type: 'Number',
      },
      { Name: 'tapse', Label: 'TAPSE (mm)', Type: 'Number' },
      { Name: 'rv_fac', Label: 'RV FAC (%)', Type: 'Number' },

      // Ханын хөдөлгөөний алдагдал
      {
        Name: 'segment1',
        Label: 'basal anterior',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_segment',
      },
      {
        Name: 'segment2',
        Label: 'basal anteroseptal',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_segment',
      },
      {
        Name: 'segment3',
        Label: 'basal inferoseptal',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_segment',
      },
      {
        Name: 'segment4',
        Label: 'basal inferior',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_segment',
      },
      {
        Name: 'segment5',
        Label: 'basal inferolateral',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_segment',
      },
      {
        Name: 'segment6',
        Label: 'basal anterolateral',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_segment',
      },
      {
        Name: 'segment7',
        Label: 'mid anterior',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_segment',
      },
      {
        Name: 'segment8',
        Label: 'mid anteroseptal',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_segment',
      },
      {
        Name: 'segment9',
        Label: 'mid inferoseptal',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_segment',
      },
      {
        Name: 'segment10',
        Label: 'mid inferior',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_segment',
      },
      {
        Name: 'segment11',
        Label: 'mid inferolateral',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_segment',
      },
      {
        Name: 'segment12',
        Label: 'mid anterolateral',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_segment',
      },
      {
        Name: 'segment13',
        Label: 'apical anterior',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_segment',
      },
      {
        Name: 'segment14',
        Label: 'apical septal',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_segment',
      },
      {
        Name: 'segment15',
        Label: 'apical inferior',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_segment',
      },
      {
        Name: 'segment16',
        Label: 'apical lateral',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_segment',
      },
      {
        Name: 'segment17',
        Label: 'apex',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_segment',
      },

      // Хавхлагын эмгэг
      {
        Name: 'is_havhlaga_emgeg',
        Label: 'Хавхлагын эмгэг',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'havhlaga_emgeg_shaltgaan',
        Label: 'Шалтгаан',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'havhlaga_emgeg_shaltgaan',
      },
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
        Name: 'h_e_gol_sudas_nar',
        Label: 'Гол судасны хавхлагын нарийсал',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_level',
      },
      {
        Name: 'h_e_gol_sudas_dut',
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

      // Ачаалалтай зүрхний цахилгаан бичлэг
      {
        Name: 'is_ach_tsa_bichleg',
        Label: 'Ачаалалтай зүрхний цахилгаан бичлэг хийлгэсэн эсэх',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'vd_ach_tsa_bichleg',
        Label: 'Ачаалалтай бичлэгийн хариу',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_ach_tsa_bichleg',
      },
      {
        Name: 'bichleg_hariu_uye',
        Label: 'Хэддүгээр үед эерэг гарсан бэ?',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'bichleg_hariu_uye',
      },
      {
        Name: 'is_ach_zhash',
        Label: 'Ачаалалтай ЗХАШ хийлгэсэн эсэх',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'vd_ach_zhash',
        Label: 'Ачаалалтай ЗХАШ хариу',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_ach_zhash',
      },
      {
        Name: 'is_zvrh_tsum_shinjilgee',
        Label: 'Зүрхний цөмийн шинжилгээ хийлгэсэн эсэх',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'vd_zvrh_tsum_shinjilgee',
        Label: 'Зүрхний цөмийн шинжилгээ хариу',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_zvrh_tsum_shinjilgee',
      },
      {
        Name: 'is_holter_ekg',
        Label: 'Холтер ЭКГ хийлгэсэн эсэх',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'vd_holter_ekg',
        Label: 'Холтер ЭКГ хийлгэсэн',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_holter_ekg',
      },

      {
        Name: 'is_titem_ktg',
        Label: 'Хийлгэсэн эсэх',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },

      {
        Name: 'vd_titem_ktg1',
        Label: 'БТА',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_titem_ktg',
      },
      {
        Name: 'vd_titem_ktg2',
        Label: 'БТА',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_titem_ktg',
      },
      {
        Name: 'vd_titem_ktg3',
        Label: 'БТА',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_titem_ktg',
      },
      {
        Name: 'vd_titem_ktg4',
        Label: 'БТА',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_titem_ktg',
      },
      {
        Name: 'vd_titem_ktg5',
        Label: 'ЗТБА',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_titem_ktg',
      },
      {
        Name: 'vd_titem_ktg6',
        Label: 'Проксимал ХХУС',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_titem_ktg',
      },
      {
        Name: 'vd_titem_ktg7',
        Label: 'ХХУС II сегмент',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_titem_ktg',
      },
      {
        Name: 'vd_titem_ktg8',
        Label: 'ХХУС дисталь',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_titem_ktg',
      },
      {
        Name: 'vd_titem_ktg9',
        Label: 'ХХУС Diag I',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_titem_ktg',
      },
      {
        Name: 'vd_titem_ktg10',
        Label: 'ХХУС Diag II',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_titem_ktg',
      },
      {
        Name: 'vd_titem_ktg11',
        Label: 'ТС I сегмент',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_titem_ktg',
      },
      {
        Name: 'vd_titem_ktg12',
        Label: 'ТС-OM-I сегмент',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_titem_ktg',
      },
      {
        Name: 'vd_titem_ktg13',
        Label: 'ТС II сегмент',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_titem_ktg',
      },
      {
        Name: 'vd_titem_ktg14',
        Label: 'ТС-OM-II сегмент',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_titem_ktg',
      },
      {
        Name: 'vd_titem_ktg15',
        Label: 'ТС III сегмент',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_titem_ktg',
      },

      {
        Name: 'vd_titem_ktg_dvgnelt',
        // Label: "Дүгнэлт",
        Label: '',
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
        OptionType: 'vd_titem_ktg_dvgnelt',
      },

      {
        Name: 'titem_helber',
        Label: 'Титэм судасны давамгайлсан хэлбэр',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_titem_helber',
      },

      // Титэм судсан дотуурх оношилгоо
      {
        Name: 'is_titem_dotuurh_onshilgoo',
        Label: 'Хийлгэсэн эсэх',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'titem_dotuurh_date',
        Label: 'Огноо (он/сар/өдөр)',
        Type: 'Text',
      },
      {
        Name: 'vd_titem_dotuurh_dugnelt',
        Label: 'Титэм судсан дотуурх оношилгоо',

        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_titem_dotuurh_dugnelt',
      },
      {
        Name: 'vd_titem_dotuurh_onshilgoo',
        Label: 'Титэм судсан дотуурх оношилгоо',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_titem_dotuurh_onshilgoo',
      },
      {
        Name: 'vd_titem_onshilgoond_nar_shalt',
        Label: 'Титэм судсан дотуурх оношилгоонд нарийслын шалтгаан',
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
        OptionType: 'vd_titem_onshilgoond_nar_shalt',
      },
      {
        Name: 'vd_titem_onsh_nar_shalt_other',
        Label: 'Титэм судсан дотуурх оношилгоонд нарийслын шалтгаан (Бусад)',
        Type: 'Text',
      },
      {
        Name: 'titem_dotuurh_emchil_date',
        Label: 'Огноо (он/сар/өдөр)',
        Type: 'Text',
      },
      {
        Name: 'vd_titem_dotuurh_emchilgee',
        Label: 'Титэм судсан дотуурх эмчилгээ',
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
        OptionType: 'vd_titem_dotuurh_emchilgee',
      },

      // ТИТМИЙН ЦОЧМОГ ХАМШИНЖ, ЗҮРХНИЙ ЦОЧМОГ ШИГДЭЭС
      // ТиСДЭ-ийн үр дүн
      {
        Name: 'angio',
        Label: 'Angio_Үгүйreflow',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'timi_lmca',
        Label: 'TIMI_LMCA',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_tisde_result',
      },
      {
        Name: 'timi_lad',
        Label: 'TIMI_LAD',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_tisde_result',
      },
      {
        Name: 'timi_lcx',
        Label: 'TIMI_LCx',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_tisde_result',
      },
      {
        Name: 'timi_rca',
        Label: 'TIMI_RCA',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_tisde_result',
      },

      // Стент байршил
      {
        Name: 'des_lmca',
        Label: 'DES_LMCA',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'des_lad',
        Label: 'DES_LAD',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'des_lcx',
        Label: 'DES_LCX',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'des_rca',
        Label: 'DES_RCA',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'des_ramus',
        Label: 'DES_Ramus',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },

      {
        Name: 'vd_kag_hundrel',
        Label: 'КАГ-ийн хатгалтын хүндрэл',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_kag_hundrel',
      },
      {
        Name: 'vd_kag_hundrel_other',
        Label: 'КАГ-ийн хатгалтын хүндрэл (Бусад)',
        Type: 'Text',
      },

      {
        Name: 'vd_kag_hurts',
        Label: 'КАГ орсон хүрц',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_kag_hurts',
      },

      {
        Name: 'vd_tugsgul',
        Label: 'Төгсгөл',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vd_tugsgul',
      },
      {
        Name: 'cardiacarrest_admission',
        Label: 'Cardiacarrest_admission',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      { Name: 'grace_score', Label: 'GRACE_score', Type: 'Number' },
      { Name: 'time_riskscore', Label: 'TIMI_riskscore', Type: 'Number' },
    ],
  ];

  this.ObjectName = 'VascularDisease';
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

module.exports = VascularDiseaseConfig;
