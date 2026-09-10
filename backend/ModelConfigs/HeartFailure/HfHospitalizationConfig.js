const { Models } = require('../../config/DB');
const Model = Models.HfHospitalization;
const ModelLookUp = Models.HfHospitalizationLookUp;

function HfHospitalizationConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text' },
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
      { Name: 'CreatedDate', Label: 'Created Date', Type: 'Date' },
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

      {
        Name: 'hospitalized_date',
        Label: 'Эмнэлэгт хэвтсэн огноо (он-сар-өдөр)',
        Type: 'Text',
      },
      { Name: 'history_no', Label: 'Өвчний түүхийн дугаар', Type: 'Text' },
      {
        Name: 'hf_hevtelt',
        Label: 'Эмнэлэгт хэвтэлтийн байдал',
        Type: 'RadioBox',
        OptionType: 'hf_hevtelt',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      { Name: 'or_honog', Label: 'Ор хоног', Type: 'Number' },
      {
        Name: 'tasag',
        Label: 'Эмнэлгээс гарсан тасаг',
        Type: 'RadioBox',
        OptionType: 'hf_emnlegees_garsan_tasag',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'tasag_other',
        Label: 'Эмнэлгээс гарсан тасаг (Бусад)',
        Type: 'Text',
      },
      {
        Name: 'or_honog_tulbur',
        Label: 'Ор хоногийн төлбөр (төг)',
        Type: 'Number',
      },

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
        DataFilter: [{ Field: 'level', Value: ['2', '3'], Op: 'In' }],
      },
      {
        Name: 'organization_other',
        Label: 'Эрүүл мэндийн байгууллага (Бусад)',
        Type: 'Text',
      },

      {
        Name: 'hf_hawsarsan_emgeg',
        Label: 'Хавсарсан эмгэг',
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
        OptionType: 'hf_hawsarsan_emgeg',
      },
      {
        Name: 'hort_havdar_notes',
        Label: 'Эмгэг судлалын шинжилгээгээр батлагдсан хорт хавдар,төрөл/үе шат',
        Type: 'Text',
      },
      { Name: 'other_notes', Label: 'Бусад, бичих', Type: 'Text' },

      // Өвчний түүх - Бусад мэдээлэл
      {
        Name: 'hf_uwchinii_tvvh',
        Label: 'Өмнөх өвчний түүх',
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
        OptionType: 'hf_uwchinii_tvvh',
      },
      {
        Name: 'hf_uwchinii_tvvh_other',
        Label: 'Өмнөх өвчний түүх (Бусад)',
        Type: 'Text',
      },

      {
        Name: 'hf_himiin_emchilgee_turul',
        Label: 'Хими эмчилгээ хийлгэсэн бол төрөл',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_himiin_emchilgee_turul',
      },
      { Name: 'hf_himiin_emchilgee_other', Label: 'Бусад', Type: 'Text' },
      {
        Name: 'hf_suulgats_emchilgee_turul',
        Label: 'Суулгац эмчилгээ хийлгэсэн бол төрөл',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_suulgats_emchilgee_turul',
      },

      {
        Name: 'hf_pacemaker_turul',
        Label: 'Пейсмейкер',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_pacemaker_icd_turul',
      },
      {
        Name: 'hf_icd_turul',
        Label: 'ICD',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_pacemaker_icd_turul',
      },

      {
        Name: 'hf_cardiomiopati_turul',
        Label: 'Кардиомиопати (ишемийн бус) оношлогдсон бол төрөл',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_cardiomiopati_turul',
      },

      {
        Name: 'hf_asran_hamgaalagch',
        Label: 'Асран хамгаалагч',
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
        OptionType: 'hf_asran_hamgaalagch',
      },
      {
        Name: 'hf_asran_hamgaalagch_other',
        Label: 'Асран хамгаалагч (Бусад)',
        Type: 'Text',
      },

      // Хорт зуршил
      {
        Name: 'hf_tamhi',
        Label: 'Тамхи',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_hort_zurshil',
      },
      {
        Name: 'hf_arhi',
        Label: 'Архи',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_hort_zurshil',
      },

      // Хэвтэх үеийн зовуурь, шинж тэмдэг
      { Name: 'b_ad', Label: 'Артерийн даралт (мм.муб)', Type: 'Text' },
      {
        Name: 'b_ad_deed',
        Label: 'Артерийн даралт (систол) мм.муб',
        Type: 'Number',
      },
      {
        Name: 'b_ad_dood',
        Label: 'Артерийн даралт (диастол) мм.муб',
        Type: 'Number',
      },
      { Name: 'b_dd', Label: 'Дундаж даралт (мм.муб)', Type: 'Text' },
      {
        Name: 'b_dd_deed',
        Label: 'Дундаж даралт (систол) (мм.муб)',
        Type: 'Number',
      },
      {
        Name: 'b_dd_dood',
        Label: 'Дундаж даралт (диастол) (мм.муб)',
        Type: 'Number',
      },
      { Name: 'b_ztst', Label: 'ЗЦТ (удаа/мин)', Type: 'Number' },
      { Name: 'b_at', Label: 'Амьсгалын тоо (удаа/мин)', Type: 'Number' },
      { Name: 'b_undur', Label: 'Өндөр (см)', Type: 'Number' },
      {
        Name: 'b_jin',
        Label: 'Жин (Эмнэлэгт хэвтэх үеийн) (кг)',
        Type: 'Number',
      },
      { Name: 'b_bji', Label: 'БЖИ (кг/м2)', Type: 'Text' }, // (Тооцоолох)
      { Name: 'b_bgt', Label: 'БГТ (BSA) (м2)', Type: 'Text' }, // (Тооцоолох)

      {
        Name: 'heartache',
        Label: 'Хэвтэх үеийн зовуурь',
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
        Name: 'hf_zahiin_shinj',
        Label: 'ЗД-ын захын шинж тэмдэг',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'hf_zahiin_shinj_code',
        Label: 'ЗД-ын захын шинж тэмдэг',
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
        OptionType: 'hf_zahiin_shinj_code',
      },
      {
        Name: 'hf_uushig_shinj',
        Label: 'ЗД-ын уушгины шинж тэмдэг',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'hf_uushig_shinj_code',
        Label: 'ЗД-ын уушгины шинж тэмдэг',
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
        OptionType: 'hf_uushig_shinj_code',
      },
      {
        Name: 'hf_zurh_shinj',
        Label: 'ЗД-ын зүрхний шинж тэмдэг',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'hf_zurh_shinj_code',
        // Label: "ЗД-ын зүрхний шинж тэмдэг",
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
        OptionType: 'hf_zurh_shinj_code',
      },
      {
        Name: 'hf_hevliin_shinj',
        Label: 'ЗД-ын хэвлийн шинж тэмдэг',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'hf_hevliin_shinj_code',
        Label: 'ЗД-ын хэвлийн шинж тэмдэг',
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
        OptionType: 'hf_hevliin_shinj_code',
      },

      {
        Name: 'laboratory_test_date',
        Label: 'Огноо (он-сар-өдөр)',
        Type: 'Date',
      },
      { Name: 'tsagaan_es', Label: 'Цагаан эс (x10^9/л)', Type: 'Number' },
      { Name: 'ulaan_es', Label: 'Улаан эс (x10^9/л)', Type: 'Number' },
      { Name: 'yaltas_es', Label: 'Ялтас эс (x10^9/л)', Type: 'Number' },
      { Name: 'niit_uurag', Label: 'Нийт уураг (г/л)', Type: 'Number' },
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
        Label: null,
        Name: 'creatinin_type',
        Type: 'RadioBox',
        OptionType: 'hf_creatinin_type',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      // { Name: "mochevin", Label: "Мочевин (ОУН/л)", Type: "Number" },
      { Name: 'mochevin', Label: 'Мочевин (ммоль/л)', Type: 'Number' },
      { Name: 'albumin', Label: 'Альбумин (г/л)', Type: 'Number' },
      { Name: 't_sh_h', Label: 'ТШХ (мл/мин)', Type: 'Number' },
      // (Тооцоолох)  [[140 -нас(жил)]*жин(кг)]/[72*цусан дахь креатинин (тг/дл)], эмэгтэйд 0.85-р үржинэ )
      { Name: 'alat', Label: 'Алат (ОУН/л)', Type: 'Number' },
      { Name: 'asat', Label: 'Асат (ОУН/л)', UnitLabel: '', Type: 'Number' },
      { Name: 'g_g_t', Label: 'ГГТ (ОУН/л)', Type: 'Number' },
      {
        Name: 'digoksin_level',
        Label: 'Дигоксин түвшин (мкг/л)',
        Type: 'Number',
      },
      { Name: 'n_t_pro_b_n_p', Label: 'NT-proBNP (пг/мл)', Type: 'Number' },
      { Name: 'b_n_p', Label: 'BNP (пг/мл)', Type: 'Number' },
      { Name: 'saturatsi', Label: 'Трансферрин сатураци (%)', Type: 'Number' },
      { Name: 'tumur', Label: 'Төмөр (ммоль/л)', Type: 'Number' },
      { Name: 'ferritin', Label: 'Ферритин (мкг/л,  нг/мл)', Type: 'Number' },
      {
        Label: null,
        Name: 'hf_ferritin_type',
        Type: 'RadioBox',
        OptionType: 'hf_ferritin_type',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'sanamsargui_glukoz',
        Label: 'Санамсаргүй глюкоз (ммоль/л)',
        Type: 'Number',
      },

      { Name: 'hb_a1c', Label: 'HbA1c (%)', Type: 'Number' }, // (ЧШ-тэй)
      { Name: 's_r_b', Label: 'СРБ (мг/дл)', Type: 'Number' },

      // Зүрхний цахилгаан бичлэг
      { Name: 'tsa_bichleg_date', Label: 'Огноо (он-сар-өдөр)', Type: 'Date' },
      { Name: 'qrs_burdel', Label: 'QRS бүрдэл (мс)', Type: 'Number' },
      {
        Name: 'hf_rhythm',
        Label: 'Хэмнэл',
        Type: 'CheckBox',
        OptionType: 'hf_rhythm',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      { Name: 'hf_rhythm_other', Label: 'Хэмнэл (Бусад)', Type: 'Text' },
      {
        Name: 'hf_zurh_horig',
        Label: 'Зүрхний хориг',
        Type: 'RadioBox',
        OptionType: 'hf_zurh_horig',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'hf_zurh_horig_other',
        Label: 'Зүрхний хориг (Бусад)',
        Type: 'Text',
      },

      //
      { Name: 'tseej_rent_date', Label: 'Огноо (он-сар-өдөр)', Type: 'Text' },
      {
        Name: 'hf_tseej_rentgen_uurchlut',
        Label: 'Цээжний рентген зургийн өөрчлөлт',
        Type: 'RadioBox',
        OptionType: 'hf_tseej_rentgen_uurchlut',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      { Name: 'hf_tseej_rentgen_uurchlut_other', Label: 'Бусад', Type: 'Text' },

      // Зүрхний хэт авиан шинжилгээний үзүүлэлтүүд
      { Name: 'het_avia_date', Label: 'Огноо (он-сар-өдөр)', Type: 'Text' },
      { Name: 'lvdd', Label: 'LVDd (mm)', Type: 'Number' },
      { Name: 'lvds', Label: 'LVDs (mm)', Type: 'Number' },
      { Name: 'ivss', Label: 'IVSs (mm)', Type: 'Number' },
      { Name: 'pwd', Label: 'PWd (mm)', Type: 'Number' },
      { Name: 'lvmass', Label: 'LV mass (g)', Type: 'Number' }, //  тооцоолох) (0.8{1.04[([LVEDD + IVSd +PWd]3 - LVEDD3)]} + 0.6)
      { Name: 'lvef', Label: 'LVEF (Simpson method) (%)', Type: 'Number' },
      { Name: 'lv_strain', Label: 'LV strain (mm)', Type: 'Number' },
      { Name: 'la_volume', Label: 'LA volume (ml/m^2)', Type: 'Number' },
      { Name: 'la_area', Label: 'LA area (ml/m^2)', Type: 'Number' },

      // E/e’
      { Name: 'e_e_med', Label: 'E/e’ (Med)', Type: 'Number' },
      { Name: 'e_e_lat', Label: 'E/e’ (Lat)', Type: 'Number' },
      // e’
      { Name: 'e_med', Label: 'e’ (Med)', Type: 'Number' },
      { Name: 'e_lat', Label: 'e’ (Lat)', Type: 'Number' },
      {
        Name: 'uushig_systol_daralt',
        Label: 'Уушгины артерийн систолын даралт (мм куб)',
        Type: 'Number',
      },
      { Name: 'tapse', Label: 'TAPSE (mm)', Type: 'Number' },
      { Name: 'rv_fac', Label: 'RV FAC (%)', Type: 'Number' },
      { Name: 'rvw_d', Label: 'RVWd (mm)', Type: 'Number' },

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

      { Name: 'mibi_date', Label: 'Огноо (он-сар-өдөр)', Type: 'Number' },
      { Name: 'mibi_lvef', Label: 'LVEF (%)', Type: 'Number' },
      { Name: 'mibi_rvef', Label: 'RVEF (%)', Type: 'Number' },

      { Name: 'mri_date', Label: 'Огноо (он-сар-өдөр)', Type: 'Number' },
      { Name: 'mri_lvef', Label: 'LVEF (%)', Type: 'Number' },
      { Name: 'mri_rvef', Label: 'RVEF (%)', Type: 'Number' },

      { Name: 'titem_date', Label: 'Огноо (он-сар-өдөр)', Type: 'Number' },
      {
        Name: 'hf_titem_dvgnelt',
        Label: 'Дүгнэлт',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_titem_dvgnelt',
      },

      // Эмнэлэгт хэвтэх явцад хийгдсэн шинжилгээ ба эмчилгээ

      // Эмнэлэгт хэвтэх явцад хийгдсэн шинжилгээ
      {
        Name: 'hf_emlegt_hiigdsen_shinjilgee',
        Label: 'Хэрэв эмнэлэгт хэвтэх үед өвөрмөц шинжилгээ хийгдсэн бол',
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
        OptionType: 'hf_emlegt_hiigdsen_shinjilgee',
      },
      {
        Name: 'hya_biopsi_uurchlult',
        Label: 'Эмгэг судлалын хариуг бичнэ үү',
        Type: 'Text',
      },
      {
        Name: 'hya_cardio_pul_vo_max',
        Label: 'VO2max (мл/кг/мин)',
        Type: 'Text',
      },

      // Эмнэлэгт хэвтэх үед хийгдсэн эмчилгээ
      {
        Name: 'hf_hewteh_uyd_hiigdsen_emchilgee',
        Label: 'Хэрэв эмнэлэгт хэвтэх үед өвөрмөц эмчилгээ хийгдсэн бол',
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
        OptionType: 'hf_hewteh_uyd_hiigdsen_emchilgee',
      },

      {
        Name: 'hf_hevteh_uyed_suulgats_emchilgee_turul',
        Label: 'Суулгац эмчилгээ хийлгэсэн бол төрөл',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_suulgats_emchilgee_turul',
      },

      // Зүрхний дутагдлын шалтгаан ба эмнэлэгт хэвтэлтийн нөлөөлөх хүчин зүйлс
      {
        Name: 'hf_zvrh_dutagdal_shaltgaan',
        Label: 'Шалтгаан',
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
        OptionType: 'hf_zvrh_dutagdal_shaltgaan',
      },
      {
        Name: 'hf_zvrh_dutagdal_shaltgaan_other',
        Label: 'Бусад',
        Type: 'Text',
      },
      {
        Name: 'hf_hewtehed_nuluuluh_huchin_zuils',
        Label: 'Энэ удаагийн эмнэлэгт хэвтэхэд нөлөөлөгч хүчин зүйлс',
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
        OptionType: 'hf_hewtehed_nuluuluh_huchin_zuils',
      },
      {
        Name: 'hf_emchilgee_dagaagui',
        Label: 'Эмчилгээний зааврыг дагаагүй',
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
        OptionType: 'hf_emchilgee_dagaagui',
      },
      {
        Name: 'hf_hewtehed_nuluuluh_huchin_zuils_other',
        Label: 'Бусад',
        Type: 'Text',
      },

      {
        Name: 'is_life_quality',
        Label: 'Амьдралын чанар тодорхойлсон эсэх',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      { Name: 'life_minnesota', Label: 'Minnesota LHFQ оноо', Type: 'Number' },
      { Name: 'kccq', Label: 'KCCQ оноо', Type: 'Number' },
      { Name: 'life_quality_other', Label: 'Бусад', Type: 'Text' },
      {
        Name: 'hf_nyha',
        Label: 'Эмнэлгээс гарах үеийн Нью-Йоркийн үйл ажиллагааны ангилал (NYHA)',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_nyha',
      },
      {
        Name: 'hf_hudulguun_chadvhi',
        Label: 'Хөдөлгөөний чадавхи',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_hudulguun_chadvhi',
      },
      {
        Name: 'hf_amidraliin_idewhi',
        Label: 'Өдөр тутмын амьдралын идэвхи',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_amidraliin_idewhi',
      },

      // Эмнэлэгт хэвтэх явцад ЗД-тай холбоотой дараах тусламж үйлчилгээг үзүүлсэн эсэх
      {
        Name: 'hyanasan_eseh',
        Label: 'Эмнэлэгт хэвтэх үед ЗД-ын менежментийн хөтөчийн дагуу хянасан эсэх',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_patient_question',
      },
      {
        Name: 'is_tamhinaas_garah',
        Label: 'Тамхинаас гарах зөвлөмж өгсөн эсэх',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_patient_question_tamhi',
      },
      {
        Name: 'is_bolovsrol',
        Label: 'Өвчний талаарх боловсрол олгосон эсэх',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_patient_question',
      },
      {
        Name: 'is_hutulbur',
        Label: 'ЗД-ын хөтөлбөрт хамрагдсан эсэх',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_patient_question',
      },
      {
        Name: 'is_hevten_emchluuleh',
        Label: 'ЭЭТ-д хэвтэн эмчлүүлсэн эсэх',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_patient_question',
      },
      {
        Name: 'is_inotrop',
        Label: 'Судсаар инотроп эмчилгээ хийгдсэн эсэх',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_patient_question',
      },
      {
        Name: 'is_suulgats',
        Label: 'Суулгац эмчилгээ',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_patient_question',
      },
      {
        Name: 'hf_suulgats_turul',
        Label: 'Хэрэв ТИЙМ бол',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_suulgats_turul',
      },

      // Эмнэлгээс гарсан байдал
      {
        Name: 'hf_emnlegees_garah_uyiin_zowlomj',
        Label: 'Эмчлүүлэгчийг эмнэлгээс гарах үед дараах зөвлөмжийг зөвлөсөн эсэх',
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
        OptionType: 'hf_emnlegees_garah_uyiin_zowlomj',
      },
      {
        Name: 'hf_emnlegees_garah_uyiin_zowlomj_other',
        Label: 'Бусад',
        Type: 'Text',
      },

      {
        Name: 'is_hunguwchluh_emchilgee',
        Label: 'Хөнгөвчлөх эмчилгээ',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'hf_hunguwchluh_emchilgee',
        Label: 'Хэрэв үгүй бол',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_hunguwchluh_emchilgee',
      },

      {
        Name: 'hf_hewteh_uyd_sanal_tuslamj_uilchilgee',
        Label: 'Эмчлүүлэгчийг эмнэлэгт хэвтэх үед зөвлөсөн бусад тусламж үйлчилгээ',
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
        OptionType: 'hf_hewteh_uyd_sanal_tuslamj_uilchilgee',
      },
      {
        Name: 'hf_hewteh_uyd_sanal_tuslamj_uilchilgee_other',
        Label: 'Бусад',
        Type: 'Text',
      },

      {
        Name: 'hf_emnlegees_garsan_baidal',
        Label: 'Эмнэлгээс гарсан байдал',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_emnlegees_garsan_baidal',
      },
      {
        Name: 'hf_hevteh_uyd_garsan_hvndrel',
        Label: 'Эмнэлэгт хэвтэх хугацаанд гарсан хүндрэл',
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
        OptionType: 'hf_hevteh_uyd_garsan_hvndrel',
      },
      {
        Name: 'hf_hem_aldagdal',
        Label: 'Хэм алдагдал',
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
        OptionType: 'hf_hem_aldagdal',
      },
      {
        Name: 'hf_hevteh_uyd_garsan_hvndrel_other',
        Label: 'Бусад хүндрэл',
        Type: 'Text',
      },

      {
        Name: 'is_hyanalt',
        Label: 'ЗД-ын амбулаторийн хяналт санал болгосон эсэх',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_hyanalt',
      },
      {
        Name: 'hf_ambultoriin_hynalt_sanal_bolgoogvi',
        Label: 'Хэрэв ҮГҮЙ бол тодруулна уу',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_ambultoriin_hynalt_sanal_bolgoogvi',
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

      // Эмнэлгээс гарах үеийн үзүүлэлтүүд
      {
        Name: 'g_ad',
        Label: 'Артерийн даралт (систол/диастол мм.муб)',
        Type: 'Number',
      },
      {
        Name: 'g_ad_deed',
        Label: 'Артерийн даралт (систол) мм.муб',
        Type: 'Number',
      },
      {
        Name: 'g_ad_dood',
        Label: 'Артерийн даралт (диастол) мм.муб',
        Type: 'Number',
      },
      { Name: 'g_ztst', Label: 'ЗЦТ (удаа/мин)', Type: 'Number' },
      { Name: 'g_jin', Label: 'Жин (кг)', Type: 'Number' },

      // Эмнэлгээс гарах үеийн лабораторын шинжилгээ
      {
        Name: 'discharge_date',
        Label: 'Эмнэлгээс гарсан огноо (он-сар-өдөр)',
        Type: 'Text',
      },

      { Name: 'g_tsagaan_es', Label: 'Цагаан эс (x10^9/л)', Type: 'Number' },
      { Name: 'g_yaltas_es', Label: 'Ялтас эс (x10^9/л)', Type: 'Number' },
      { Name: 'g_gemoglobin', Label: 'Гемоглобин (г/дл)', Type: 'Number' },
      { Name: 'g_natri', Label: 'Натри (ммоль/л)', Type: 'Number' },
      { Name: 'g_kali', Label: 'Kали (ммоль/л)', Type: 'Number' },
      {
        Name: 'g_sheesnii_huchil',
        Label: 'Шээсний хүчил (мг/дл)',
        Type: 'Number',
      },
      { Name: 'g_creatinin', Label: 'Креатинин', Type: 'Number' },
      {
        Label: null,
        Name: 'g_creatinin_type',
        Type: 'RadioBox',
        OptionType: 'hf_creatinin_type',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      { Name: 'g_mochevin', Label: 'Мочевин (ОУН/л)', Type: 'Number' },
      { Name: 'g_albumin', Label: 'Альбумин (г/л)', Type: 'Number' },
      { Name: 'g_t_sh_h', Label: 'ТШХ (мл/мин)', Type: 'Number' },
      // (Тооцоолох)  [[140 -нас(жил)]*жин(кг)]/[72*цусан дахь креатинин (тг/дл)], эмэгтэйд 0.85-р үржинэ )
      { Name: 'g_alat', Label: 'Алат (ОУН/л)', Type: 'Number' },
      { Name: 'g_s_r_b', Label: 'СРБ (мг/дл)', Type: 'Number' },
      { Name: 'g_asat', Label: 'Асат (ОУН/л)', UnitLabel: '', Type: 'Number' },
      { Name: 'g_g_g_t', Label: 'ГГТ (ОУН/л)', Type: 'Number' },
      {
        Name: 'g_digoksin_level',
        Label: 'Дигоксин түвшин (мкг/л)',
        Type: 'Number',
      },
      { Name: 'g_tumur', Label: 'Төмөр (ммоль/л)', Type: 'Number' },
      { Name: 'g_ferritin', Label: 'Ферритин (мкг/л,  нг/мл)', Type: 'Number' },
      {
        Label: null,
        Name: 'g_hf_ferritin_type',
        Type: 'RadioBox',
        OptionType: 'hf_ferritin_type',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      { Name: 'g_n_t_pro_b_n_p', Label: 'NT-proBNP (пг/мл)', Type: 'Number' },
      { Name: 'g_b_n_p', Label: 'BNP (пг/мл)', Type: 'Number' },
      { Name: 'g_hb_a1c', Label: 'HbA1c (% (ЧШ-тэй))', Type: 'Number' },
      {
        Name: 'g_sanamsargui_glukoz',
        Label: 'Санамсаргүй глюкоз (ммоль/л)',
        Type: 'Number',
      },

      // Эмнэлгээс гарах үеийн эмийн эмчилгээний зөвлөмж
      {
        Name: 'g_hf_emchilgee_check',
        Label: 'АХФС/ АРХ/ АРНС зөвлөсөн эсэх',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_emchilgee_check',
      },
      {
        Name: 'g_hf_axpc_nershil',
        Label: 'Хэрэв АХФС зөвлөсөн бол',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_axpc_nershil',
      },
      { Name: 'g_hf_axpc_other', Label: 'АХФС бусад', Type: 'Text' },
      { Name: 'g_hf_axpc_tun', Label: 'АХФС тун (мг/хоног)', Type: 'Number' },

      {
        Name: 'g_hf_apc_nershil',
        Label: 'Хэрэв АРХ зөвлөсөн бол',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_apc_nershil',
      },
      { Name: 'g_hf_apc_other', Label: 'АРХ бусад', Type: 'Text' },
      { Name: 'g_hf_apc_tun', Label: 'АРХ тун (мг/хоног)', Type: 'Number' },

      {
        Name: 'g_aphc_tun',
        Label: 'Хэрэв АРНС зөвлөсөн бол тун (мг/хоног)',
        Type: 'Number',
      },

      {
        Name: 'g_hf_emchilgee_notcheck',
        Label: 'Хэрэв үгүй бол шалтгааныг сонгох',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_emchilgee_notcheck',
      },
      { Name: 'g_hf_emchilgee_notcheck_other', Label: 'Бусад', Type: 'Text' },

      //
      {
        Name: 'g_is_beta_horiglogch',
        Label: 'Бета хориглогч',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'g_hf_beta_horiglogch_nershil',
        Label: 'Хэрэв тийм бол',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_beta_horiglogch_nershil',
      },
      { Name: 'g_hf_beta_horiglogch_other', Label: 'Бусад', Type: 'Text' },
      {
        Name: 'g_hf_beta_horiglogch_tun',
        Label: 'Тун (мг/хоног)',
        Type: 'Number',
      },

      {
        Name: 'g_hf_notbeta_horiglogch',
        Label: 'Хэрэв үгүй бол',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_notbeta_horiglogch',
      },
      { Name: 'g_hf_notbeta_horiglogch_other', Label: 'Бусад', Type: 'Text' },

      {
        Name: 'g_is_mra',
        Label: 'Минералокортикоид рецепторын антагонист',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'g_hf_mra_check',
        Label: 'Хэрэв тийм бол',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_mra_check',
      },
      { Name: 'g_hf_mra_tun', Label: 'Тун (мг/хоног)', Type: 'Number' },
      {
        Name: 'g_hf_mra_notcheck',
        Label: 'Хэрэв үгүй бол',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_mra_notcheck',
      },
      { Name: 'g_hf_mra_notcheck_other', Label: 'Бусад', Type: 'Text' },

      {
        Name: 'g_is_sglt2',
        Label: 'SGLT2 саатуулагч',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'g_hf_sglt2_check',
        Label: 'Хэрэв тийм бол',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_sglt2_check',
      },
      { Name: 'g_hf_sglt2_tun', Label: 'Тун (мг/хоног)', Type: 'Number' },
      {
        Name: 'g_hf_sglt2_notcheck',
        Label: 'Хэрэв үгүй бол',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_sglt2_notcheck',
      },
      { Name: 'g_hf_sglt2_notcheck_other', Label: 'Бусад', Type: 'Text' },

      {
        Name: 'g_is_ibabradin',
        Label: 'Ивабрадин зөвлөсөн эсэх',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      { Name: 'g_ibabradin_tun', Label: 'Тун (мг/хоног)', Type: 'Number' },
      {
        Name: 'g_is_antitrombotic',
        Label: 'Антитромботик зөвлөсөн эсэх',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'g_hf_antitrombotic_check',
        Label: 'Хэрэв тийм бол',
        Type: 'CheckBox',
        LookUpConfig: {
          Model: ModelLookUp,
          ParentValueField: 'id_data',
          ChildValueField: 'value',
          IdField: 'id_lookup',
          Field: 'id_question',
        },
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_antitrombotic_check',
      },
      {
        Name: 'g_hf_antitrombotic_other',
        Label: 'Антитромботик (бусад)',
        Type: 'Text',
      },
      {
        Name: 'g_hf_antitrombotic_tun',
        // Label: "Тун (мкг/хоног)",
        Label: 'Тун (мг/хоног)',
        Type: 'Text',
      },

      {
        Name: 'g_is_digoksin',
        Label: 'Дигоксин',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      { Name: 'g_digoksin_tun', Label: 'Тун (мкг/хоног)', Type: 'Number' },

      {
        Name: 'g_is_shees_huuh_em',
        Label: 'Шээс хөөх эм',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'g_hf_shees_huuh_em_check',
        Label: 'Хэрэв тийм бол',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_shees_huuh_em_check',
      },
      { Name: 'g_hf_shees_huuh_em_other', Label: 'Бусад', Type: 'Text' },
      {
        Name: 'g_hf_shees_huuh_em_tun',
        Label: 'Тун (мг/хоног)',
        Type: 'Number',
      },

      {
        Name: 'g_is_lipid_buuruulah',
        Label: 'Липид бууруулах эм',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'g_hf_lipid_buuruulah_em_check',
        Label: 'Хэрэв ТИЙМ бол эмийн нэршлийг сонгож',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_lipid_buuruulah_em_check',
      },
      { Name: 'g_hf_lipid_buuruulah_em_other', Label: 'Бусад', Type: 'Text' },
      {
        Name: 'g_hf_lipid_buuruulah_em_tun',
        Label: 'Тун (мг/хоног)',
        Type: 'Number',
      },

      {
        Name: 'g_is_sudas_telegch',
        Label: 'Судас тэлэгч эм',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'g_hf_sudas_telegch_em_check',
        Label: 'Хэрэв тийм бол',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_sudas_telegch_em_check',
      },
      {
        Name: 'g_hf_sudas_telegch_em_tun',
        Label: 'Тун (мг/хоног)',
        Type: 'Number',
      },

      // Нас баралт
      { Name: 'nb_date', Label: 'Огноо (он-сар-өдөр)', Type: 'Text' },
      {
        Name: 'hf_nas_baralt_shaltgaan',
        Label: 'Нас барсан шалтгаан',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_nas_baralt_shaltgaan',
      },
      { Name: 'hf_nas_baralt_shaltgaan_other', Label: 'Бусад', Type: 'Text' },
      {
        Name: 'hf_zurhnii_shaltgaant_nas_baralt',
        Label: 'Зүрхний шалтгаант нас баралт бол тодруулна уу',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_zurhnii_shaltgaant_nas_baralt',
      },
      {
        Name: 'hf_zurhnii_shaltgaant_nas_baralt_other',
        Label: 'Бусад',
        Type: 'Text',
      },
    ],
  ];

  this.ObjectName = 'HfHospitalization';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Heart failure hospitalization',
    NewObjectTitle: 'Heart failure hospitalization create',
    EditObjectTitle: 'Heart failure hospitalization edit',
  };
}

// const a = new HfHospitalizationConfig();
// a.Fields[0].map((d) => {
//   console.log(
//     `insert into AppObjectFields (appObject,appObjectName,name,dataType,label,linkedObjectName,linkedField,options,optionsName) values(1,'HfHospitalization','${
//       d.Name
//     }','${d.Type.toLowerCase()}',N'${d.Label}','','','','${
//       d.OptionType ? d.OptionType : ""
//     }');`
//   );
// });
module.exports = HfHospitalizationConfig;
