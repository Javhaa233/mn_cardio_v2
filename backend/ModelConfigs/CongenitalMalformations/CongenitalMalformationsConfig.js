const { Models } = require('../../config/DB');
const Model = Models.CongenitalMalformations;
const ModelLookUp = Models.CongenitalMalformationsLookUp;

function CongenitalMalformationsConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'INTEGER' },
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

      // Organization
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
        Name: 'n_type',
        Label: 'Төрөл',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Value' },
        Data: [{ Value: 'Насанд хүрэгчид' }, { Value: 'Хүүхэд' }],
      },
      {
        Name: 'n_category',
        Label: 'Төрөл',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Нээлттэй мэс засал', Value: 'neelttei' },
          { Label: 'Судсан дотуурх мэс засал', Value: 'sudsan_dotuurh' },
          { Label: 'Катетр ангиографийн оношилгоо', Value: 'katetr' },
        ],
      },

      { Name: 'ognoo', Label: 'Огноо', Type: 'Number' },

      {
        Name: 'type_exam',
        Label: 'Үзлэгийн төрөл',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'type_exam1',
      },
      {
        Name: 'risk_factors',
        Label: 'Зүрх судасны эрсдэлт хүчин зүйлс',
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
        OptionType: 'cd_risk_factors',
      },
      {
        Name: 'heartache',
        Label: 'Зовиур',
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
        OptionType: 'cd_hearthache',
        //
      },

      { Name: 'p_address', Label: 'Гэрийн хаяг', Type: 'Text' },
      { Name: 'p_phonenumber', Label: 'Утас', Type: 'Number' },

      {
        Name: 'onosh',
        Label: 'Онош',
        Type: 'SingleSelectLoad',
        Config: {
          ObjectName: 'vwICD10',
          IdField: 'value',
          TextField: 'label',
          MinTextLength: 1,
        },
      },
      {
        Name: 'hawsarsan_onosh',
        Label: 'Хавсарсан онош',
        Type: 'SingleSelectLoad',
        Config: {
          ObjectName: 'vwICD10',
          IdField: 'value',
          TextField: 'label',
          MinTextLength: 1,
        },
      },

      { Name: 'DiagnosedDate', Label: 'Оношлогдсон огноо', Type: 'Date' },
      { Name: 'StartedDate', Label: 'Хяналтанд орсон огноо', Type: 'Date' },
      // Хяналтанд орсон огноо
      {
        Name: 'is_udamshil',
        Label: 'Удамшил',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      { Name: 'udamshil', Label: 'Удамшил', Type: 'Text' },
      {
        Name: 'odoogiin_zowiur',
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
      {
        Name: 'em_taria_hereglej_bga',
        Label: 'Тогтмол хэрэглэж байгаа эм, тариа',
        Type: 'TextArea',
      },
      {
        Name: 'is_harvalt',
        Label: 'Харвалт',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },

      // Bodit uzleg
      { Name: 'jin', Label: 'Жин (кг)', Type: 'Number' },
      { Name: 'undur', Label: 'Өндөр (см)', Type: 'Number' },
      { Name: 'ad_deed', Label: 'АД систол (мм.муб)', Type: 'Number' },
      { Name: 'ad_dood', Label: 'АД диастол (мм.муб)', Type: 'Number' },
      { Name: 'ztst', Label: 'ЗЦ (уд/мин)', Type: 'Number' },
      { Name: 'at', Label: 'АТ (уд/мин)', Type: 'Number' },
      { Name: 'saturatsi', Label: 'Сатураци (%)', Type: 'Number' },

      // ШИНЖ ТЭМДЭГ
      {
        Name: 'zahiin_shinj',
        Label: 'Зүрхний Төрөлхийн Гажгийн -ын захын шинж тэмдэг',
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
        OptionType: 'cm_zahiin_shinj',
      },
      {
        Name: 'uushginii_shinj',
        Label: 'ЗТГ-ын уушгины шинж тэмдэг',
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
        OptionType: 'cm_uushignii_shinj',
      },
      {
        Name: 'zurhnii_shinj',
        Label: 'ЗТГ-ын зүрхний шинж тэмдэг',
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
        OptionType: 'cm_zurhnii_shinj',
      },
      {
        Name: 'hevliin_shinj',
        Label: 'ЗТГ-ын хэвлийн шинж тэмдэг',
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
        OptionType: 'cm_hevliin_shinj',
      },
      {
        Name: 'shuugian_shinj_chanar',
        Label: 'Шуугианы шинж чанар',
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
        OptionType: 'cm_shuugian_shinj',
      },
      { Name: 'shuugian_systol', Label: 'Систол', Type: 'Number' },
      { Name: 'shuugian_diastol', Label: 'Диастол', Type: 'Number' },
      {
        Name: 'shuugian_bairlal',
        Label: 'Байрлал',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'shuugian_bairlal',
      },

      {
        Name: 'shuugian_damjilt',
        Label: 'Дамжилт',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },

      { Name: 'shuugian_tod', Label: 'Тод', Type: 'Text' },
      { Name: 'shuugian_sulavtar', Label: 'Сулавтар', Type: 'Number' },
      { Name: 'shuugian_sul', Label: 'Сул', Type: 'Number' },

      // ОНОШИЛГОО, ШИНЖИЛГЭЭ

      // Лабораторийн шинжилгээ
      { Name: 'ShinjilgeeDate', Label: 'Огноо', Type: 'Date' },

      // tsusnii delgerengui shinjilgee
      { Name: 'wbc', Label: 'WBC (103/ul)', Type: 'Number' },
      { Name: 'rbc', Label: 'RBC (106/ul)', Type: 'Number' },
      { Name: 'hb', Label: 'Hb (g/l)', Type: 'Number' },
      { Name: 'hct', Label: 'HCT (%)', Type: 'Number' },
      { Name: 'plt', Label: 'PLT (103/ul)', Type: 'Number' },
      { Name: 'coe', Label: 'СОЭ', Type: 'Number' },

      { Name: 'pt', Label: 'PT', Type: 'Number' },
      { Name: 'inr', Label: 'INR', Type: 'Number' },
      { Name: 'fibrinogen', Label: 'fibrinogen', Type: 'Number' },
      { Name: 'tt', Label: 'TT', Type: 'Number' },
      { Name: 'aptt', Label: 'APTT', Type: 'Number' },

      // Биохими
      { Name: 'mochevin', Label: 'Мочевин (mmol/L)', Type: 'Number' },
      { Name: 'creatinin', Label: 'Креатинин', Type: 'Number' },
      {
        Label: null,
        Name: 'creatinin_type',
        Type: 'RadioBox',
        OptionType: 'hf_creatinin_type',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      { Name: 'aslo', Label: 'ASLO', Type: 'Number' },
      { Name: 'crb', Label: 'CRB', Type: 'Number' },
      { Name: 'rf', Label: 'RF', Type: 'Number' },

      { Name: 'niit_uurag', Label: 'Нийт уураг', Type: 'Number' },
      { Name: 'alibumin', Label: 'Альбумин', Type: 'Number' },
      { Name: 'asat', Label: 'АСАТ', Type: 'Number' },
      { Name: 'alat', Label: 'АЛАТ', Type: 'Number' },
      { Name: 'niit_bilirubin', Label: 'Нийт Билирубин', Type: 'Number' },
      { Name: 'ggt', Label: 'ГГТ', Type: 'Number' },
      { Name: 'glukoz', Label: 'Глюкоз (mmol/L)', Type: 'Number' },

      {
        Name: 'is_hbs_ag',
        Label: 'HbsAg',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_virus_maker',
      },
      {
        Name: 'is_hcv',
        Label: 'HCV',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_virus_maker',
      },
      {
        Name: 'is_tembvv',
        Label: 'Тэмбүү',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_virus_maker',
      },
      {
        Name: 'is_hiv',
        Label: 'HIV',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_virus_maker',
      },

      // Зүрхний цахилгаан бичлэг
      //
      { Name: 'tsa_date', Label: 'Огноо', Type: 'Text' },
      { Name: 'qrs_burdel', Label: 'QRS бүрдэл (мс)', Type: 'Number' },
      {
        Name: 'zurhnii_hem',
        Label: 'Зүрхний хориг',
        Type: 'RadioBox',
        OptionType: 'hf_zurh_horig',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      { Name: 'zurhnii_hem_other', Label: 'Бусад', Type: 'Text' },

      {
        Name: 'zurhnii_horig',
        Label: 'Зүрхний хориг',
        Type: 'RadioBox',
        OptionType: 'hf_zurh_horig',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      { Name: 'zurhnii_horig_other', Label: 'Бусад', Type: 'Text' },

      { Name: 'ztsb_date', Label: 'Огноо', Type: 'Date' },
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
        OptionType: 'cm_rhythm',
      },
      { Name: 'rhythm_other', Label: 'Бусад', Type: 'Text' },

      // Sudas - ЦЭЭЖНИЙ РЕНТГЕН ХАРАЛТ
      { Name: 'tseej_rentgen', Type: 'Text' },

      // Зүрхний хэт авиан оношилгоо

      { Name: 'het_awia_date', Label: 'Огноо', Type: 'Date' },
      { Name: 'lvdd', Label: 'LVDd (sm)', Type: 'Number' },
      { Name: 'lvds', Label: 'LVDs (sm)', Type: 'Number' },
      { Name: 'ivsd', Label: 'IVSd (sm)', Type: 'Number' },
      { Name: 'pwd', Label: 'PWd (sm)', Type: 'Number' },
      { Name: 'lv_massi', Label: 'LVmassi (g)', Type: 'Number' },
      { Name: 'lvef', Label: 'LVEF (Simpson method) (%)', Type: 'Number' },
      { Name: 'lv_gls', Label: 'LV GLS', Type: 'Number' },
      { Name: 'la_volume', Label: 'LA volume (ml)', Type: 'Number' },
      { Name: 'ee_med', Label: 'E/e’(Med)', Type: 'Number' },
      { Name: 'ee_lat', Label: 'E/e’(Lat)', Type: 'Number' },
      { Name: 'dundaj_ee', Label: 'Дундаж E/e’', Type: 'Number' }, // tootsooloh
      { Name: 'taslawch_e', Label: 'Таславч e’ (см/сек)', Type: 'Number' },
      { Name: 'hajuu_hana_e', Label: 'Хажуу хана e’ (см/сек)', Type: 'Number' },
      {
        Name: 'uushig_systol_daralt',
        Label: 'Уушгины артерийн систолын даралт (мм.муб)',
        Type: 'Number',
      },
      { Name: 'tapse', Label: 'TAPSE (sm)', Type: 'Number' },
      { Name: 'rv_fac', Label: 'RV FAC (%)', Type: 'Number' },

      // Баруун ховдлын хэмжээ: basal ______mm; mid _______mm; longitudinal _______mm

      { Name: 'bh_basal', Label: 'basal (mm)', Type: 'Number' },
      { Name: 'bh_mid', Label: 'mid (mm)', Type: 'Number' },
      { Name: 'bh_longitudinal', Label: 'longitudinal (mm)', Type: 'Number' },

      { Name: 'txt_tso', Label: 'ТХТЦоорхой байрлал', Type: 'Number' },
      { Name: 'txt_tso_helber', Label: 'Хэлбэр', Type: 'Number' },
      { Name: 'txt_tso_hemjee', Label: 'Хэмжээ (мм)', Type: 'Number' },

      {
        Name: 'txt_shunt_chiglel',
        Label: 'Шунтын чиглэл',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'shunt_chiglel',
      },
      {
        Name: 'txt_shunt_urs_hurd',
        Label: 'Шунтын урсгалын хурд (m/s)',
        Type: 'Number',
      },

      { Name: 'xxt_tso', Label: 'ХХТЦоорхой байрлал', Type: 'Number' },
      { Name: 'xxt_tso_helber', Label: 'Хэлбэр', Type: 'Number' },
      { Name: 'xxt_tso_hemjee', Label: 'Хэмжээ (мм)', Type: 'Number' },
      {
        Name: 'xxt_shunt_chiglel',
        Label: 'Шунтын чиглэл',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'shunt_chiglel',
      },
      {
        Name: 'xxt_shunt_urs_hurd',
        Label: 'Шунтын урсгалын хурд (m/s)',
        Type: 'Number',
      },

      {
        Name: 'abts',
        Label: 'Артерийн битүүрээгүй цорго',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      { Name: 'abts_helber', Label: 'Хэлбэр', Type: 'Number' },
      { Name: 'abts_hemjee', Label: 'Хэмжээ (мм)', Type: 'Number' },
      { Name: 'abts_urs_hurd', Label: 'урсгалын хурд (m/s)', Type: 'Number' },

      {
        Name: 'uldets',
        Label: 'Үлдэц зуйван цонх',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      { Name: 'uldets_helber', Label: 'Хэлбэр', Type: 'Number' },
      { Name: 'uldets_hemjee', Label: 'Хэмжээ (мм)', Type: 'Number' },
      { Name: 'uldets_urs_hurd', Label: 'урсгалын хурд (m/s)', Type: 'Number' },

      { Name: 'rvot', Label: 'RVOT vel. (m/s)', Type: 'Number' },
      {
        Name: 'rvot_gipertrofi',
        Label: 'гипертрофи',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      { Name: 'rv', Label: 'RV', Type: 'Number' },
      { Name: 'rv_zuzaan', Label: 'ханын зузаан (mm)', Type: 'Number' },
      { Name: 'ra', Label: 'RA', Type: 'Number' },
      { Name: 'ra_zuzaan', Label: 'ханын зузаан (mm)', Type: 'Number' },
      { Name: 'tapse', Label: 'TAPSE', Type: 'Number' },
      { Name: 'rv_fac', Label: 'RV FAC', Type: 'Number' },
      { Name: 'rv_strain', Label: 'RV strain', Type: 'Number' },
      { Name: 'lvot', Label: 'LVOT vel.', Type: 'Number' },
      {
        Name: 'lvot_gipertrofi',
        Label: 'Гипертрофи',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      // { Name: "lv", Label: "LV", Type: "Number" },
      // { Name: "lv_zuzaan", Label: "ханын зузаан (mm)", Type: "Number" },
      // { Name: "la", Label: "LA", Type: "Number" },
      // { Name: "la_zuzaan", Label: "ханын зузаан (mm)", Type: "Number" },

      { Name: 'pa_mpa', Label: 'PA : MPA (mm)', Type: 'Number' },
      { Name: 'rb', Label: 'Rb (mm)', Type: 'Number' },
      { Name: 'lb', Label: 'Lb (mm)', Type: 'Number' },
      // { Name: "ph_spap", Label: "PH: SPAP", Type: "Number" },
      {
        Name: 'gxx_ursgaliin_hurd',
        Label: 'Гурван хавтаст хавхлагын урсгалын хурд (м/с)',
        Type: 'Number',
      },
      {
        Name: 'gol_sudas_ursgaliin_hurd',
        Label: 'Гол судас урсгалын хурд (м/с)',
        Type: 'Number',
      },
      {
        Name: 'uushig_ursgaliin_hurd',
        Label: 'Уушигны артери урсгалын хурд (м/с)',
        Type: 'Number',
      },

      // Хавхлагын эмгэг
      {
        Name: 'is_havhlaga',
        Label: 'Төрөлхийн хавхлагын эмгэг',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },

      // УЛААН ХООЛОЙН ЗҮРХНИЙ ХЭТ АВИАН ШИНЖИЛГЭЭ

      // Катетр ангиографи
      { Name: 'katetr_date', Label: 'Огноо (он-сар-өдөр)', Type: 'Text' },
      { Name: 'qp_qs', Label: 'QP/QS', Type: 'Number' },
      { Name: 'pvr', Label: 'PVR', Type: 'Number' },

      { Name: 'mes_umnuh_onosh', Label: 'Мэс заслын өмнөх онош', Type: 'Text' },
      { Name: 'tuluv_mes', Label: 'Төлөвлөсөн мэс засал', Type: 'Text' },
      { Name: 'hiigdsen_mes', Label: 'Хийгдсэн мэс засал', Type: 'Text' },
      {
        Name: 'nemelt_ajilbar',
        Label: 'Нэмэлтээр хийгдсэн ажилбар',
        Type: 'Text',
      },

      {
        Name: 'is_now_hundrel',
        Label: 'Мэс заслын үеийн хүндрэл',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      { Name: 'now_hundrel', Label: 'Тийм бол', Type: 'Text' },
      {
        Name: 'is_next_ert_hundrel',
        Label: 'Мэс заслын дараах эрт үеийн хүндрэл',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      { Name: 'next_ert_hundrel', Label: 'Тийм бол', Type: 'Text' },
      {
        Name: 'is_next_hojuu_hundrel',
        Label: 'Мэс заслын дараах хожуу үеийн хүндрэл',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      { Name: 'next_hojuu_hundrel', Label: 'Тийм бол', Type: 'Text' },

      {
        Name: 'going_time',
        Label: 'Mэс засал үргэлжилсэн хугацаа',
        Type: 'Text',
      },
      {
        Name: 'u_tasagt_hevtsen_hugatsaa',
        Label: 'Мэс заслын өмнө тасагт хэвтсэн хугацаа',
        Type: 'Text',
      },

      // Мэс заслын хугацаа
      { Name: 'ms_full_time', Label: 'Нийт хугацаа', Type: 'Text' },
      { Name: 'ms_perfuz_time', Label: 'Перфузийн хугацаа', Type: 'Text' },
      { Name: 'ms_aort_time', Label: 'Аорт хавчсан хугацаа', Type: 'Text' },
      { Name: 'ms_anes_time', Label: 'Мэдээгүйжүүлгийн хугацаа', Type: 'Text' },

      {
        Name: 'ekstubatsi_hugatsaa',
        Label: 'Экстубаци хийгдсэн хугацаа',
        Type: 'Text',
      },
      {
        Name: 'erchimt_hugatsaa',
        Label: 'Мэс заслын дараах эрчимт эмчилгээний хугацаа',
        Type: 'Text',
      },
      {
        Name: 'tasagt_hevtsen_hugatsaa',
        Label: 'Мэс заслын дараа тасагт хэвтсэн хугацаа',
        Type: 'Text',
      },
      {
        Name: 'niit_hevtsen_hugatsaa',
        Label: 'Эмнэлэгт нийт хэвтсэн хугацаа',
        Type: 'Text',
      },

      // { Name: "ms_full_time", Label: "", Type: "Text" },

      // НЭЭЛТТЭЙ МЭС ЗАСАЛ ЭМЧИЛГЭЭ ОНОШ

      {
        Name: 'neelttei_mes_onosh',
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
        OptionType: 'neelttei_mes_onosh',
      },
      { Name: 'neelttei_mes_onosh_other', Label: 'Бусад', Type: 'Text' },

      // СУДСАН ДОТУУРХ МЭС ЗАСАЛ ХИЙГДСЭН ОНОШ
      { Name: 'hatgalt_sudas', Label: 'Хатгалт хийсэн судас', Type: 'Text' },
      {
        Name: 'fluroscopi_full_time',
        Label: 'Флюороскопи хийгдсэн нийт хугацаа',
        Type: 'Text',
      },
      { Name: 'shuher_zagvar', Label: 'Шүхэрийн загвар', Type: 'Text' },
      { Name: 'shuher_hemjee', Label: 'Шүхэрийн хэмжээ', Type: 'Text' },
      { Name: 'balloon_hemjee', Label: 'Баллооны хэмжээ', Type: 'Text' },

      // Тосгуур хоорондын таславчийн цоорхой

      //  Зүрхний хэт авиан шинжилгээгээр
      { Name: 'ha_txt_tso_helber', Label: 'Хэлбэр', Type: 'Text' },
      { Name: 'ha_txt_tso_hemjee', Label: 'Хэмжээ (мм)', Type: 'Number' },

      {
        Name: 'ha_txt_shunt_chiglel',
        Label: 'Шунтын чиглэл',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'shunt_chiglel',
      },

      // Улаан хоолойн зүрхний хэт авиан шинжилгээгээр
      { Name: 'uh_txt_tso_helber', Label: 'Хэлбэр', Type: 'Text' },
      { Name: 'uh_txt_tso_hemjee', Label: 'Хэмжээ (мм)', Type: 'Number' },

      {
        Name: 'uh_txt_shunt_chiglel',
        Label: 'Шунтын чиглэл',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'shunt_chiglel',
      },

      // Katetr
      // КАТЕТР АНГИОГРАФИ ШИНЖИЛГЭЭНИЙ ӨМНӨХ ОНОШ
      {
        Name: 'katetr_b_onosh',
        Type: 'SingleSelectLoad',
        Config: {
          ObjectName: 'vwICD10',
          IdField: 'value',
          TextField: 'label',
          MinTextLength: 1,
        },
      },

      // КАТЕТР АНГИОГРАФИ ШИНЖИЛГЭЭНИЙ ДАРААХ ОНОШ
      {
        Name: 'katetr_n_onosh',
        Type: 'SingleSelectLoad',
        Config: {
          ObjectName: 'vwICD10',
          IdField: 'value',
          TextField: 'label',
          MinTextLength: 1,
        },
      },

      {
        Name: 'shinjilgee_notes',
        Label: ' Шинжилгээ хийсэн тухай тэмдэглэл',
        Type: 'TextArea',
      },
      {
        Name: 'niit_shinjilgee_urgeljilsen',
        Label: 'Нийт шинжилгээ үргэлжилсэн хугацаа',
        Type: 'Text',
      },
      { Name: 'k_hatgalt_sudas', Label: 'Хатгалт хийсэн судас', Type: 'Text' },
      {
        Name: 'k_fluroscopi_full_time',
        Label: 'Флюороскопи хийгдсэн нийт хугацаа',
        Type: 'Text',
      },
      {
        Name: 'k_tod_bodis_hemjee',
        Label: ' Ашигласан тодосгогч бодисын хэмжээ',
        Type: 'Text',
      },

      // КАТЕТР АНГИОГРАФИ ШИНЖИЛГЭЭНИЙ ДАРАА
      { Name: 'n_qp_qs', Label: 'QP/QS', Type: 'Number' },
      { Name: 'n_pvr', Label: 'PVR', Type: 'Number' },

      // МЭС ЗАСЛЫН ДАРААХ ХЯНАЛТ
      { Name: 'bh_hemjee_1d', Type: 'Number' },
      { Name: 'bh_hemjee_7d', Type: 'Number' },
      { Name: 'bh_hemjee_1m', Type: 'Number' },
      { Name: 'bh_hemjee_3m', Type: 'Number' },
      { Name: 'bh_hemjee_6m', Type: 'Number' },

      { Name: 'bt_hemjee_1d', Type: 'Number' },
      { Name: 'bt_hemjee_7d', Type: 'Number' },
      { Name: 'bt_hemjee_1m', Type: 'Number' },
      { Name: 'bt_hemjee_3m', Type: 'Number' },
      { Name: 'bt_hemjee_6m', Type: 'Number' },

      { Name: 'lvdd_1d', Type: 'Number' },
      { Name: 'lvdd_7d', Type: 'Number' },
      { Name: 'lvdd_1m', Type: 'Number' },
      { Name: 'lvdd_3m', Type: 'Number' },
      { Name: 'lvdd_6m', Type: 'Number' },

      { Name: 'ef_1d', Type: 'Number' },
      { Name: 'ef_7d', Type: 'Number' },
      { Name: 'ef_1m', Type: 'Number' },
      { Name: 'ef_3m', Type: 'Number' },
      { Name: 'ef_6m', Type: 'Number' },

      { Name: 'uushig_arteri_daralt_1d', Type: 'Number' },
      { Name: 'uushig_arteri_daralt_7d', Type: 'Number' },
      { Name: 'uushig_arteri_daralt_1m', Type: 'Number' },
      { Name: 'uushig_arteri_daralt_3m', Type: 'Number' },
      { Name: 'uushig_arteri_daralt_6m', Type: 'Number' },

      { Name: 'uldegdel_shunt_1d', Type: 'Text' },
      { Name: 'uldegdel_shunt_7d', Type: 'Text' },
      { Name: 'uldegdel_shunt_1m', Type: 'Text' },
      { Name: 'uldegdel_shunt_3m', Type: 'Text' },
      { Name: 'uldegdel_shunt_6m', Type: 'Text' },

      { Name: 'shuher_bairlal_1d', Type: 'Text' },
      { Name: 'shuher_bairlal_7d', Type: 'Text' },
      { Name: 'shuher_bairlal_1m', Type: 'Text' },
      { Name: 'shuher_bairlal_3m', Type: 'Text' },
      { Name: 'shuher_bairlal_6m', Type: 'Text' },

      { Name: 'unheltseg_shingen_1d', Type: 'Text' },
      { Name: 'unheltseg_shingen_7d', Type: 'Text' },
      { Name: 'unheltseg_shingen_1m', Type: 'Text' },
      { Name: 'unheltseg_shingen_3m', Type: 'Text' },
      { Name: 'unheltseg_shingen_6m', Type: 'Text' },

      { Name: 'hem_aldagdal_1d', Type: 'Text' },
      { Name: 'hem_aldagdal_7d', Type: 'Text' },
      { Name: 'hem_aldagdal_1m', Type: 'Text' },
      { Name: 'hem_aldagdal_3m', Type: 'Text' },
      { Name: 'hem_aldagdal_6m', Type: 'Text' },

      // 11.ЭМЧИЛГЭЭ
      // ЭМИЙН ЭМЧИЛГЭЭ:
      { Name: 'antiagregant_name', Label: 'Эмийн нэр', Type: 'Text' },
      { Name: 'antiagregant_tun', Label: 'Тун', Type: 'Number' },

      { Name: 'antikoagulyant_name', Label: 'Эмийн нэр', Type: 'Text' },
      { Name: 'antikoagulyant_tun', Label: 'Тун', Type: 'Number' },

      { Name: 'era_name', Label: 'Эмийн нэр', Type: 'Text' },
      { Name: 'era_tun', Label: 'Тун', Type: 'Number' },

      { Name: 'pde_name', Label: 'Эмийн нэр', Type: 'Text' },
      { Name: 'pde_tun', Label: 'Тун', Type: 'Number' },

      { Name: 'shees_huuh_name', Label: 'Эмийн нэр', Type: 'Text' },
      { Name: 'shees_huuh_tun', Label: 'Тун', Type: 'Number' },

      { Name: 'beta_name', Label: 'Эмийн нэр', Type: 'Text' },
      { Name: 'beta_tun', Label: 'Тун', Type: 'Number' },

      { Name: 'aphc_arni_name', Label: 'Эмийн нэр', Type: 'Text' },
      { Name: 'aphc_arni_tun', Label: 'Тун', Type: 'Number' },

      { Name: 'ahfs_name', Label: 'Эмийн нэр', Type: 'Text' },
      { Name: 'ahfs_tun', Label: 'Тун', Type: 'Number' },

      // ЭМЧИЛГЭЭ

      // Аортын хавхлага:
      { Name: 'aort_vel', Label: 'vel (m/s)', Type: 'Number' },
      { Name: 'aort_pg_mean', Label: 'PGmean (mmHg)', Type: 'Number' },
      { Name: 'aort_pg_max', Label: 'PG max (mmHg)', Type: 'Number' },
      { Name: 'aort_as', Label: 'AS', Type: 'Number' },
      { Name: 'aort_ar', Label: 'AR', Type: 'Number' },

      // Хоёр хавтаст хавхлага:
      { Name: 'he_2xx_vel', Label: 'vel (m/s)', Type: 'Number' },
      { Name: 'he_2xx_pg_mean', Label: 'he_2xx_pg_mean', Type: 'Number' },
      { Name: 'he_2xx_pg_max', Label: 'PG max (mmHg)', Type: 'Number' },
      { Name: 'he_2xx_ms', Label: 'MS', Type: 'RadioBox' },
      { Name: 'he_2xx_mr', Label: 'MR', Type: 'RadioBox' },

      // Гурван хавтаст хавхлага:
      { Name: 'he_3xx_vel', Label: 'vel (m/s)', Type: 'Number' },
      { Name: 'he_3xx_pg_max', Label: 'PG max (mmHg)', Type: 'Number' },
      { Name: 'he_3xx_ts', Label: 'TS', Type: 'RadioBox' },
      { Name: 'he_3xx_tr', Label: 'TR', Type: 'RadioBox' },

      // Уушгины артерийн хавхлага:
      { Name: 'uushig_vel', Label: 'vel (m/s)', Type: 'Number' },
      { Name: 'uushig_pg_max', Label: 'PG max (mmHg)', Type: 'Number' },
      { Name: 'uushig_ps', Label: 'PS', Type: 'RadioBox' },
      { Name: 'uushig_pr', Label: 'PR', Type: 'RadioBox' },

      {
        Name: 'havhlaga_dugnelt',
        Label: 'Дүгнэлт /Зүрхний ямар гажиг/',
        Type: 'Number',
      },
      {
        Name: 'havhlaga_dugnelt_other',
        Label: 'Дүгнэлт (Бусад)',
        Type: 'Text',
      },

      // Улаан хоолойн зүрхний хэт авиан шинжилгээ:
      { Name: 'u_h_date', Label: 'Огноо (он-сар-өдөр)', Type: 'Text' },
      { Name: 'u_h_tte', Label: 'ТТЕ (ТХТЦ-н хэмжээ) (mm)', Type: 'Number' },
      { Name: 'u_h_tee', Label: 'ТЕЕ (ТХТЦ-н хэмжээ)  (mm)', Type: 'Number' },

      // Ирмэгүүд
      { Name: 'u_h_anteroinferor', Label: 'Anteroinferior', Type: 'Number' },
      { Name: 'u_h_posterosuperior', Label: 'Posterosuperior', Type: 'Number' },
      { Name: 'u_h_aortic', Label: 'Aortic', Type: 'Number' },
      { Name: 'u_h_posterior', Label: 'Posterior', Type: 'Number' },
      { Name: 'u_h_inferior', Label: 'Inferior', Type: 'Number' },
      { Name: 'u_h_superior', Label: 'Superior', Type: 'Number' },

      { Name: 'u_h_la_size', Label: 'LA уртын хэмжээ', Type: 'Number' },
      {
        Name: 'u_h_mv',
        Label: 'MV (AML-c LA-н posterior хана хүртэлх хэмжээ)',
        Type: 'Number',
      },
      { Name: 'u_h_ven_orolt', Label: 'Венийн буруу оролт', Type: 'Number' },
      { Name: 'u_h_uad', Label: 'УАД', Type: 'Number' },
      { Name: 'u_h_bx_size', Label: 'БХ-н хэмжээ', Type: 'Number' },
      { Name: 'u_h_bt_size', Label: 'БТ-н хэмжээ', Type: 'Number' },
      { Name: 'u_h_tapse', Label: 'TAPSE', Type: 'Number' },
      { Name: 'u_h_arter', Label: 'Уушгины артери', Type: 'Number' },
      {
        Name: 'u_h_shunt',
        Label: 'Шунтын чиглэл ',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'shunt_chiglel',
      },

      { Name: 'u_h_bt_dd', Label: 'БТ-н дундаж даралт', Type: 'Number' },
      { Name: 'u_h_zt_dd', Label: 'ЗТ-н дундаж даралт', Type: 'Number' },
      { Name: 'u_h_ua_dd', Label: 'УА-н дундаж даралт', Type: 'Number' },
      { Name: 'u_h_balloon_size', Label: 'Баллооны хэмжээ', Type: 'Number' },
      { Name: 'u_h_asd', Label: 'ASD occlude-н xэмжээ', Type: 'Number' },
      {
        Name: 'u_h_fluoroscopy_hour',
        Label: 'Fluoroscopy-хугацаа',
        Type: 'Number',
      },
      { Name: 'u_h_emboli', Label: 'Эмболи (агаарын)', Type: 'Number' },
    ],
  ];

  this.ObjectName = 'CongenitalMalformations';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Congenital malformation',
    NewObjectTitle: 'Congenital malformation create',
    EditObjectTitle: 'Congenital malformation edit',
  };
}

module.exports = CongenitalMalformationsConfig;
