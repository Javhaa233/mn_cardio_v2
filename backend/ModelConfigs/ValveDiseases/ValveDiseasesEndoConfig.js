const { Models } = require('../../config/DB');
const Model = Models.ValveDiseasesEndo;
const ModelLookUp = Models.ValveDiseasesEndoLookUp;

function ValveDiseasesEndoConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'INTEGER' },
      { Name: 'is_confirm', Label: 'Батласан эсэх', Type: 'Text' },
      { Name: 'PatRegNo', Label: 'Personal number' },

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

      { Name: 'undur', Label: 'Өндөр (см)', Type: 'Number' },
      { Name: 'jin', Label: 'Жин (кг)', Type: 'Number' },
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

      // Харвалт
      {
        Name: 'is_harvalt',
        Label: 'Харвалт',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'harvalt_zowiur',
        Label: 'Одоогийн зовуурь, Шинж тэмдэг',
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
        OptionType: 'vvd_harvalt_zowiur',
      },
      { Name: 'harvalt_zowiur_other', Label: 'Бусад', Type: 'Text' },
      { Name: 'nyha', Label: 'nyha', Type: 'Text' },

      {
        Name: 'zurhnii_uwchnii_tuuh',
        // Label: "Зүрх судасны өвчний түүх",
        Label: undefined,
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
        OptionType: 'vvd_zurhnii_uwchnii_tuuh',
      },
      {
        Name: 'suulgats_tuhuurumj',
        Label: 'Суулгац эмчилгээ хийлгэсэн бол төрөл',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_suulgats_emchilgee_turul',
      },

      { Name: 'zurhnii_uwchnii_tuuh_other', Label: 'Бусад', Type: 'Text' },

      // Эрсдэлт хүчин зүйлс

      {
        Name: 'ersdeluud',
        Label: undefined,
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
        OptionType: 'vvd_ersdel',
      },

      // Эндокардитын вегитаци
      {
        Name: 'uuriin_havhlaga',
        Label: 'Өөрийн хавхлага',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'hiimel_havhlaga',
        Label: 'Хиймэл хавхлага',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'vegitasi_bairlal',
        Label: 'Вегитацийн байрлал',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_vegitasi_bairlal',
      },
      {
        Name: 'vegitasi_hemjee',
        Label: 'Вегитацийн хэмжээ (мм)',
        Type: 'Number',
      },

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

      { Name: 'niit_uurag', Label: 'Нийт уураг (г/л)', Type: 'Number' },
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

      // Их шалгуур:

      {
        Name: 'ih_shalguur',
        // Label: "Их шалгуур",
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
        OptionType: 'vvd_ih_shalguur',
      },
      //  Эндокардитын хүндрэл:
      {
        Name: 'endo_hundrel',
        // Label: "Эндокардитын хүндрэл",
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
        OptionType: 'vvd_endo_hundrel',
      },

      // Антибиотик
      {
        Name: 'antibiotic_name',
        Label: 'Антибиотикийн нэр',
        Type: 'Text',
      },
      { Name: 'antibiotic_days', Label: 'нийт хоног', Type: 'Number' },

      // Нас баралт
      {
        Name: 'is_nas_baralt',
        // Label: "",
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'vvd_nas_baralt',
        // Label: "Тийм дарвал дараах сонголт гарах",
        Label: 'Тийм бол',
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
        OptionType: 'vvd_nas_baralt',
      },

      {
        Name: 'nas_baralt_shaltgaan',
        Label: 'Нас баралтын шалтгаан',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_nas_baralt_shaltgaan',
      },

      // Мэс засалд орсон эсэх
      {
        Name: 'is_mes_zasald_orson',
        // Label: "",
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      //
      { Name: 'havhlaga_bairlal', Label: 'Хавхлага байрлал', Type: 'Text' },
      //
      { Name: 'havhlaga_turul', Label: 'Хавхлагын төрөл', Type: 'Text' },

      {
        Name: 'davtan_mes_zasal_date',
        Label: 'Мэс засалд орсон он, сар, өдөр',
        Type: 'Date',
      },
      {
        Name: 'hoish_days',
        Label: 'Оношлогдсоноос хойш мэс засалд орсон хоног',
        Type: 'Number',
      },

      // Давтан мэс засалд орсон

      {
        Name: 'is_davtan_mes_zasal',
        // Label: "Давтан мэс засалд орсон эсэх",
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      // Халдварт эндокардит  дахисан эсэх

      {
        Name: 'is_haldvart_dahisan',
        // Label: "",
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },

      // Зүрхний хэт авиан шинжилгээ
      { Name: 'het_awia_date', Label: 'Огноо', Type: 'Date' },
      { Name: 'lvdd', Label: 'LVDd (sm)', Type: 'Number' },
      { Name: 'lvds', Label: 'LVDs (sm)', Type: 'Number' },
      { Name: 'ivsd', Label: 'IVSd (sm)', Type: 'Number' },
      { Name: 'pwd', Label: 'PWd (sm)', Type: 'Number' },
      { Name: 'lv_massi', Label: 'LVmassi (g)', Type: 'Number' },
      { Name: 'lvef', Label: 'LVEF (Simpson method) (%)', Type: 'Number' },
      { Name: 'lv_cls', Label: 'LV GLS', Type: 'Number' },
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

      // Хавхлагын эмгэгийн шалтгаан:
      {
        Name: 'is_2xx_nar',
        Label: '2 Хавтаст хавхлагын нарийсал',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'vvd2xx_nar_shaltgaan',
        Label: 'Хавхлагын эмгэгийн шалтгаан',
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
        OptionType: 'vvd_2_hwatst_hawhlaga_emgeg_shaltgaan',
      },
      {
        Name: 'vvd2xx_nar_shaltgaan_other',
        Label: 'Бусад',
        Type: 'Text',
      },
      {
        Name: 'vvd2xx_nar_zereg',
        Label: 'Хүндийн зэрэг',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_hvndiin_zereg',
      },
      {
        Name: 'planometry',
        Label: '2 хавтаст хавхлагын онгойлтын талбай (planometry) (cm2)',
        Type: 'Number',
      },
      {
        Name: 'pht',
        Label: '2 хавтаст хавхлагын онгойлтын талбай (PHT) (cm2)',
        Type: 'Number',
      },
      { Name: 'mv_mean_pg', Label: 'MV mean PG (mmHg)', Type: 'Number' },
      { Name: 'mv_pht', Label: 'MV PHT', Type: 'Text' },
      {
        Name: 'vilkinsiin_shal_onoo',
        Label: 'Вилкинсийн шалгуур оноо',
        Type: 'Number',
      },

      // 2xx dutagdal
      {
        Name: 'is_2xx_dut',
        Label: '2 Хавтаст хавхлагын дутагдал',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'vvd2xx_dut_shaltgaan',
        Label: 'Хавхлагын эмгэгийн шалтгаан',
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
        OptionType: 'vvd_2_hwatst_hawhlaga_emgeg_shaltgaan',
      },
      {
        Name: 'vvd2xx_dut_shaltgaan_other',
        Label: 'Бусад',
        Type: 'Text',
      },
      {
        Name: 'vvd2xx_dut_zereg',
        Label: 'Хүндийн зэрэг',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_hvndiin_zereg',
      },
      { Name: 'mr_eroa', Label: 'MR EROA (см2)', Type: 'Number' },
      {
        Name: 'mr_vena_contract',
        Label: 'MR Vena contract',
        Type: 'Number',
      },
      { Name: 'mr_volume', Label: 'MR Volume (ml)', Type: 'Number' },
      {
        Name: 'mr_fraction_rate',
        Label: 'MR Fraction rate (%)',
        Type: 'Number',
      },
      {
        Name: 'mr_zuun_tosguur_hubi',
        Label: 'MR урсгалын зүүн тосгуурт эзлэх хувь (%)',
        Type: 'Number',
      },

      // Gol sudas
      // nariisal
      {
        Name: 'is_gol_sudas_nar',
        Label: 'Гол судасны хавхлагын нарийсал',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'gol_sudas_nar_shaltgaan',
        Label: 'Хавхлагын эмгэгийн шалтгаан',
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
        OptionType: 'vvd_gol_sudasnii_hawhlaga_emgegiin_shaltgaan',
      },
      {
        Name: 'gol_sudas_nar_shaltgaan_other',
        Label: 'Бусад',
        Type: 'Text',
      },
      {
        Name: 'gol_sudas_nar_zereg',
        Label: 'Хүндийн зэрэг',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_hvndiin_zereg',
      },
      {
        Name: 'gol_sudas_planometry',
        Label: 'Гол судасны хавхлагын онгойлтын талбай (planometry) (cm2)',
        Type: 'Number',
      },
      { Name: 'aov_mean_pg', Label: 'AoV mean PG (mmHg)', Type: 'Number' },
      { Name: 'aov_v_max', Label: 'AoV V max (m/sec)', Type: 'Number' },
      { Name: 'aov_pg_max', Label: 'AoV PG max (mm)', Type: 'Number' },

      // gol sudas dutagdal
      {
        Name: 'is_gol_sudas_dut',
        Label: 'Гол судасны хавхлагын дутагдал',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'gol_sudas_dut_shaltgaan',
        Label: 'Хавхлагын эмгэгийн шалтгаан',
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
        OptionType: 'vvd_gol_sudasnii_hawhlaga_emgegiin_shaltgaan',
      },
      {
        Name: 'gol_sudas_dut_shaltgaan_other',
        Label: 'Бусад',
        Type: 'Text',
      },
      {
        Name: 'gol_sudas_dut_zereg',
        Label: 'Хүндийн зэрэг',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_hvndiin_zereg',
      },
      { Name: 'ao_reg_pht', Label: 'AoReg PHT (m/sec)', Type: 'Number' },
      { Name: 'aor_vol', Label: 'AoR vol (ml)', Type: 'Number' },
      { Name: 'aor_eroa', Label: 'AoR EROA (см2)', Type: 'Number' },

      // titem
      { Name: 'titem_date', Label: 'Огноо', Type: 'Date' },
      {
        Name: 'dvgnelt',
        Label: 'Дүгнэлт',
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
        OptionType: 'hf_titem_dvgnelt',
      },

      // Зүрхний цахилгаан бичлэг
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
        OptionType: 'vvd_rhythm',
      },
      { Name: 'rhythm_other', Label: 'Бусад', Type: 'Text' },

      {
        Name: 'is_ct_mri',
        Label: 'CТ, MRI хийлгэсэн эсэх',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },

      {
        Name: 'ct_mri_garsan_uurchlult',
        Label: 'Шинжилгээнд гарсан өөрчлөлт',
        Type: 'Text',
      },

      // Цусны ариун чанар
      { Name: 'tsus_date', Label: 'Огноо', Type: 'Date' },

      {
        Name: 'is_davtan',
        Label: 'нийт 3 удаа цусны ариун чанар давтан авсан эсэх',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'is_nyan_urgasan',
        Label: 'нян ургасан эсэх',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'urgasan_uusgegch',
        Label: 'Ямар үүсгэгч илэрсэн нэр бичих',
        Type: 'Text',
      },

      // Other
      {
        Name: 'rentgen_kti',
        Label: 'Цээжний рентген зураг: КТИ тодорхойлох (%)',
        Type: 'Number',
      },
      // Гол судасны компьютер
      { Name: 'agatsonii_onoo', Label: 'Агатсоны оноо', Type: 'Number' },
      { Name: 'kaltsiin_onoo', Label: 'Кальцийн оноо', Type: 'Number' },
      // Цусны ариун чанар 3 удаа (халдварт эндокардитийн үед)
      {
        Name: 'is_nyan',
        Label: 'Нян илэрсэн эсэх',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      { Name: 'nyan', Label: 'Нян /төрөл зүйлийг бичих/', Type: 'Text' },

      // Мэс заслын өмнөх эрсдэлт хүчин зүйлс
      {
        Name: 'euro_score_logistic',
        Label: 'EuroScore Logistic (%)',
        Type: 'Number',
      },
      { Name: 'jin_mes_umnu', Label: 'Жин (кг)', Type: 'Number' },
      { Name: 'undur_mes_umnu', Label: 'Өндөр (см)', Type: 'Number' },
      {
        Name: 'tamhi',
        Label: 'Тамхи',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'hf_tamhi',
      },
      {
        Name: 'chihriin_shijin',
        Label: 'Чихрийн шижин',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_chihriin_shijin',
      },
      {
        Name: 'ad_ihselt',
        Label: 'Артерийн даралт ихсэлт',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_artreriin_daralt_ihselt',
      },
      {
        Name: 'is_uuh_tos_soliltsoo_uurchlult',
        Label: 'Өөх тосны солилцооны өөрчлөлт',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'vvd_buurnii_emgeg',
        Label: 'Бөөрний эмгэг',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_buurnii_emgeg',
      },
      {
        Name: 'vvd_uushig_arhag_emgeg',
        Label: 'Уушгины архаг өвчин',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_uushignii_arhag_uwchin',
      },
      {
        Name: 'vvd_busad_sudasnii_emgeg',
        Label: 'Бусад судасны эмгэг',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_busad_sudasnii_emgeg',
      },
      {
        Name: 'vvd_tarhi_sudasnii_emgeg',
        Label: 'Тархины судасны эмгэг',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_tarkhinii_sudasnii_emgeg',
      },
      {
        Name: 'is_medrel',
        Label: 'Мэдрэлийн үйл ажиллагааны алдагдал',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'gvree_arter_shum',
        Label: 'Гүрээний артерийн шум (Carotid bruits)',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'mes_umnu_z_rhythm',
        Label: 'Мэс заслын өмнөх зүрхний хэмнэл',
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
        OptionType: 'vvd_mes_zasaliin_umnukh_zurkhnii_khemnel',
      },
      // {
      //   Name: "mes_umnu_z_rhythm_other",
      //   Label: "Мэс заслын өмнөх зүрхний хэмнэл (Бусад)",
      //   Type: "Text",
      // },

      // Хавхлагын мэс заслын дараах байдал
      {
        Name: 'a_gol_sud_nar',
        Label: '',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_after_1',
      },
      {
        Name: 'a_gol_sud_dut',
        Label: '',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_after_1',
      },
      {
        Name: 'a_gol_sud_mes_ajil',
        Label: '',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_after_2',
      },
      {
        Name: 'a_gol_sud_imp_type',
        Label: '',
        Type: 'RadioBox',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_after_3',
      },
      {
        Name: 'a_mit_nar',
        Label: '',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_after_1',
      },
      {
        Name: 'a_mit_dut',
        Label: '',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_after_1',
      },
      {
        Name: 'a_mit_mes_ajil',
        Label: '',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_after_2',
      },
      {
        Name: 'a_mit_imp_type',
        Label: '',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_after_4',
      },
      {
        Name: 'a_vvd3xx_nar',
        Label: '',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_after_1',
      },
      {
        Name: 'a_vvd3xx_dut',
        Label: '',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_after_1',
      },
      {
        Name: 'a_vvd3xx_mes_ajil',
        Label: '',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_after_2',
      },
      {
        Name: 'a_vvd3xx_imp_type',
        Label: '',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_after_4',
      },
      {
        Name: 'a_ua_nar',
        Label: '',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_after_1',
      },
      {
        Name: 'a_ua_dut',
        Label: '',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_after_1',
      },
      {
        Name: 'a_ua_mes_ajil',
        Label: '',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_after_2',
      },
      {
        Name: 'a_ua_imp_type',
        Label: '',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_after_5',
      },

      { Name: 'implant_kod1', Label: 'Имплантын код', Type: 'Number' },
      { Name: 'implant_kod2', Label: 'Имплантын код', Type: 'Number' },
      { Name: 'implant_kod3', Label: 'Имплантын код', Type: 'Number' },
      { Name: 'implant_kod4', Label: 'Имплантын код', Type: 'Number' },
      {
        Name: 'st_jude_medical_hemjee',
        Label: 'St.Jude Medical',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_implant_hemjee_st_jude_medical',
      },
      {
        Name: 'medtronic_hemjee',
        Label: 'Medtronic',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_implant_hemjee_medtronic',
      },
      {
        Name: 'is_bental_mes',
        Label: 'Бентал мэс ажилбар',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'is_devid_mes',
        Label: 'Дэвид мэс ажилбар',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },

      // Мэс заслын дараах хүндрэлүүд
      {
        Name: 'is_tsus_aldagdal',
        Label: 'Цус алдагдал',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'is_hem_aldagdal',
        Label: 'Хэм алдагдал',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'is_tarhinii_tsus_harwalt',
        Label: 'Тархины цус харвалт',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'is_olon_erhtnii_dut',
        Label: 'Олон эрхтэний дутагдал',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'is_vjil',
        Label: 'Үжил',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },

      // Мэс заслын дараах хяналт
      {
        Name: 'vvd_mes_daraah_ehokg',
        Label: 'Мэс заслын дараах ЭХОКГ хяналт',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_mes_zasliin_daraakh_ehokg_hynalt',
      },

      {
        Name: 'hiimel_hawh_hemjee',
        Label: 'Хиймэл хавхлагын хэмжээ',
        Type: 'Text',
      },
      {
        Name: 'hiimel_hawh_turul',
        Label: 'Хиймэл хавхлагын төрөл',
        Type: 'Text',
      },
      {
        Name: 'mes_zasal_date',
        Label: 'Мэс засал хийгдсэн огноо',
        Type: 'Text',
      },
      { Name: 'ad_deed', Label: 'АД (систол) (мм.муб)', Type: 'Number' },
      { Name: 'ad_dood', Label: 'АД (диастол) (мм.муб)', Type: 'Number' },
      { Name: 'pulse', Label: 'Пульс (удаа)', Type: 'Number' },
      { Name: 'undur_mes_daraa', Label: 'Өндөр (см)', Type: 'Number' },
      { Name: 'jin_mes_daraa', Label: 'Жин (кг)', Type: 'Number' },
      { Name: 'bmi', Label: 'Биеийн жингийн индекс (кг/м2)', Type: 'Number' },

      // Хиймэл хавхлагын ЭХО үнэлгээ:
      { Name: 'hiimel_date', Label: 'Огноо', Type: 'Date' },
      {
        Name: 'is_gaduur_ursgal',
        Label: 'Хавхлагын гадуурх урсгал',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'vvd_hiimel_bvtets_hud',
        Label: 'Хиймэл хавхлагын бүтэц, хөдөлгөөн',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_hiimel_bvtets_hudulguun',
      },
      {
        Name: 'hiimel_dundaj_daralt',
        Label: 'Хиймэл хавхлагын дундаж даралт (mean PG) (mmHg)',
        Type: 'Number',
      },
      {
        Name: 'reg_hundiin_zereg',
        Label: 'Регургитацийн хүндийн зэрэг',
        Type: 'Number',
      },
      { Name: 'zvvn_tosguur', Label: 'Зүүн тосгуур (см)', Type: 'Number' },
      { Name: 'zvvn_howdol', Label: 'зүүн ховдлын (см)', Type: 'Number' },
      {
        Name: 'zvvn_howdol_agshih_chadwar',
        Label: 'Зүүн ховдлын агших чадвар (%)',
        Type: 'Number',
      },
      {
        Name: 'is_uad_ihselt',
        Label: 'УАД ихсэлт',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      { Name: 'spap', Label: ' SPAP (mm Hg)', Type: 'Number' },

      // Антикоагулянт эмчилгээний хяналт
      { Name: 'inr_date', Label: 'Огноо', Type: 'Date' },
      {
        Name: 'mes_daraa_inr',
        Label: 'INR',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'vvd_inr',
      },
    ],
  ];

  this.ObjectName = 'ValveDiseasesEndo';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Valve disease Registry',
    NewObjectTitle: 'Valve disease Registry create',
    EditObjectTitle: 'Valve disease Registry edit',
  };
}

module.exports = ValveDiseasesEndoConfig;
