const { Models } = require('../../config/DB');
const Model = Models.AtrialRhythmNew;
const ModelLookUp = Models.AtrialRhythmLookUp;

function AtrialRhythmNewConfig() {
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
        Name: 'visit_date',
        Label: 'Үзлэгийн огноо/ Эмнэлэгт хэвтсэн огноо',
        Type: 'Text',
      },
      {
        Name: 'type',
        Label: 'Эмчлүүлэгчийн төрөл',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Хэвтэн эмчлүүлэх', Value: 1 },
          { Label: 'Амбулатори', Value: 2 },
        ],
      }, // int
      {
        Name: 'advice_type',
        Label: 'Хэвтэн эмчлүүлэх/зөвлөгөө авах төрөл',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Төлөвлөгөөт', Value: 1 },
          { Label: 'Яаралтай', Value: 2 },
          { Label: 'Тодорхойгүй', Value: 3 },
        ],
      }, // int
      {
        Name: 'emch_type',
        Label: 'Тус эмчлүүлэгчийг хэн явуулсан бэ?',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Өрхийн эмч', Value: 1 },
          { Label: 'Зүрхний эмч', Value: 2 },
          { Label: 'Бусад зүрхний тасаг', Value: 3 },
          { Label: 'Өөрөө', Value: 4 },
          { Label: 'Яаралтай тусламж', Value: 5 },
          { Label: 'Бусад', Value: 6 },
          { Label: 'Тодорхойгүй', Value: 7 },
        ],
      }, // int
      {
        Name: 'hamrah_negj',
        Label: 'Тусламж үйлчилгээний хамрах нэгж',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Зүрх судлалын тасаг', Value: 1 },
          { Label: 'Зүрхний мэс заслын тасаг', Value: 2 },
          { Label: 'Дотрын тасаг', Value: 3 },
          { Label: 'Аймгийн нэгдсэн эмнэлэг', Value: 4 },
          { Label: 'Зүрхний хэм судлалын төв', Value: 5 },
          { Label: 'Титэм судасны эмчилгээний тасаг (CCU) ', Value: 6 },
          { Label: 'Амбулатори', Value: 7 },
          { Label: 'Нэгдсэн цогц тусламж үйлчилгээ (ICC)', Value: 8 },
          { Label: 'Эмнэлгийн амбулатори', Value: 9 },
          { Label: '', Value: 10 },
        ],
      }, // int
      {
        Name: 'hamrah_negj_other',
        Label: 'Бусад тасаг, тодруулна уу',
        Type: 'Text',
      }, // nvarchar
      { Name: 'doctor_name', Label: 'doctor_name', Type: 'Text' }, // nvarchar
      { Name: 'out_score', Label: 'out_score', Type: 'Text' }, // float
      {
        Name: 'monitoring_hostpital_name',
        Label: 'monitoring_hostpital_name',
        Type: 'Text',
      }, // nvarchar
      {
        Name: 'gender',
        Label: 'Gender',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'sexe',
      }, // int
      {
        Name: 'is_tsevershilt',
        Label: 'Эмэгтэй бол цэвэршсэн үү?',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      { Name: 'birthdate', Label: 'Эмчлүүлэгчийн төрсөн огноо', Type: 'Date' }, // nvarchar
      {
        Name: 'living',
        Label: 'Амьдралын орчин',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: ' Ганцаараа амьдардаг', Value: 1 },
          { Label: 'Гэр бүлтэйгээ амьдардаг', Value: 2 },
          { Label: 'Асрамжийн газар', Value: 3 },
          { Label: 'Бусад', Value: 4 },
          { Label: 'Тодорхойгүй', Value: 5 },
        ],
      }, // int
      {
        Name: 'ger_bul',
        Label: 'Гэр бүлийн байдал',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Гэрлээгүй', Value: 1 },
          { Label: 'Гэрлэсэн', Value: 2 },
          { Label: 'Гэрлэлт цуцалсан', Value: 3 },
          { Label: 'Бэлэвсэн', Value: 4 },
          { Label: 'Бусад', Value: 5 },
          { Label: 'Тодорхойгүй', Value: 6 },
        ],
      }, // int
      {
        Name: 'main_shaltgaan',
        Label:
          'Эмнэлэгт хэвтэх эсвэл эмнэлэгт үзүүлэх үндсэн шалтгаан: Доорх жагсаалтаас нэгийг сонгоно уу.',
        Type: 'CheckBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Зүрхний шигдээсийн шинжтэй', Value: 1 },
          {
            Label: 'Титэм судасны ангиографид титэм судасны эмгэг (ТСЭ) илэрсэн',
            Value: 2,
          },
          { Label: 'Мэс заслын өмнөх үнэлгээ (зүрхний мэс засал)', Value: 3 },
          {
            Label: 'Мэс заслын өмнөх үнэлгээ (зүрхний бус мэс засал)',
            Value: 4,
          },
          { Label: ' Тосгуурын жирвэгнээ', Value: 5 },
          { Label: 'Брадиаритми', Value: 6 },
          { Label: 'Ховдолын хэм алдагдал', Value: 7 },
          { Label: 'Зүрх зогсох', Value: 8 },
          { Label: 'Түр зуур ухаан алдах', Value: 9 },
          {
            Label: 'Кардиомиопати буюу зүүн ховдлын систолын дисфункци шинээр илрэх',
            Value: 10,
          },
          { Label: 'Хяналтгүй гипертензи ', Value: 11 },
          { Label: 'Иатрогений (ажилбарын хүндрэл зэрэг)', Value: 12 },
          { Label: 'Амбулатори: хяналтын үзлэг ', Value: 13 },
          { Label: 'Зүрх судасны интервеншн төлөвлөгдсөн', Value: 14 },
          { Label: '', Value: 15 },
        ],
      }, // int
      { Name: 'main_shaltgaan_other', Label: 'Бусад шалтгаан', Type: 'Text' }, // nvarchar

      {
        Name: 'shinj_start_date',
        Label: 'Шинж тэмдэг эхэлсэн огноо',
        Type: 'Text',
      }, // nvarchar
      {
        Name: 'shinj_daraa_first_date',
        Label: 'Эмнэлэгт анх үзүүлсэн (шинж тэмдэг эхэлсний дараа)',
        Type: 'Text',
      }, // nvarchar
      {
        Name: 'shinj_daraa_first_where',
        Label: 'Хаана',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Түргэн тусламжийн дуудлага', Value: 1 },
          { Label: 'Эмнэлгийн яаралтай тусламж', Value: 2 },
          { Label: 'Амбулаторийн хэсэг', Value: 3 },
          { Label: 'Тодорхойгүй', Value: 4 },
        ],
      }, // nvarchar
      {
        Name: 'shinj_daraa_first_where_other',
        Label: 'Бусад',
        Type: 'Text',
      }, // nvarchar
      {
        Name: 'hevtsen_ognoo',
        Label: 'Эмнэлэгт анх хэвтсэн огноо (одоогийн өвчлөл)',
        Type: 'Text',
      }, // nvarchar
      { Name: 'onosh_ognoo', Label: 'Урьдчилсан онош тавигдсан', Type: 'Date' }, // nvarchar

      { Name: 'undur', Label: 'Өндөр (см)', Type: 'Number' }, // float
      { Name: 'jin', Label: 'Жин (кг)', Type: 'Number' }, // float
      {
        Name: 'bji',
        Label: 'Биеийн жингийн индекс (БЖИ) (кг/м²)',
        Type: 'Number',
      }, // float
      {
        Name: 'bsa',
        Label: 'Биеийн гадаргуугийн талбай (BSA)',
        Type: 'Number',
      }, // float

      { Name: 'ad_deed', Label: 'Систолын даралт', Type: 'Number' }, // float
      { Name: 'ad_dood', Label: 'Диастолын даралт', Type: 'Number' }, // float
      { Name: 'z_ts_t', Label: 'Зүрхний цохилтын тоо', Type: 'Number' }, // float
      {
        Name: 'synus_hemnel',
        Label: 'Синусын хэмнэлтэй',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // int

      {
        Name: 'zurh_chagnalt',
        Label: 'zurh_chagnalt',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'zurh_chagnalt_yes',
        Label: 'zurh_chagnalt_yes',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'aort_nar',
        Label: 'aort_nar',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
        Type: 'Text',
      }, // nvarchar
      {
        Name: 'aort_reg',
        Label: 'aort_reg',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'mitral_nar',
        Label: 'mitral_nar',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'mitral_reg',
        Label: 'mitral_reg',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'gurvan_havtast_nar',
        Label: 'gurvan_havtast_nar',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'gurvan_havtast_reg',
        Label: 'gurvan_havtast_reg',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'uushig_nar',
        Label: 'uushig_nar',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'uushig_reg',
        Label: 'uushig_reg',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'uushig_herjig',
        Label: 'uushig_herjig',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 's3_morin',
        Label: 's3_morin',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'amisgaadalt',
        Label: 'amisgaadalt',
        Type: 'RadioBox',
        OptionType: 'hf_nyha',
        Config: { IdField: 'Value', TextField: 'Label' },
      }, // nvarchar
      {
        Name: 'nyha',
        Label: 'nyha',
        Type: 'RadioBox',
        OptionType: 'hf_nyha',
        Config: { IdField: 'Value', TextField: 'Label' },
      }, // nvarchar
      {
        Name: 'tseejeer_uvduh',
        Label: 'tseejeer_uvduh',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'tseejeer_uvduh_yes',
        Label: 'tseejeer_uvduh_yes',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Сонгомол', Value: 1 },
          { Label: 'Сонгомол бус', Value: 2 },
          { Label: 'Зүрхний бус', Value: 3 },
          { Label: 'Тодорхойгүй', Value: 4 },
        ],
      }, // nvarchar

      {
        Name: 'tur_uhaan_aldah',
        Label: 'tur_uhaan_aldah',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'uhaan_balartah',
        Label: 'uhaan_balartah',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'zahiin_havan',
        Label: 'zahiin_havan',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar

      // 2
      {
        Name: 'zurh_ersdelt_huchin',
        Label: 'zurh_ersdelt_huchin',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'zurh_ersdelt_huchin_yes',
        Label: 'zurh_ersdelt_huchin_yes',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'daralt_ihselt',
        Label: 'daralt_ihselt',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'daralt_ihselt_yes',
        Label: 'daralt_ihselt_yes',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Хянагдсан*', Value: 1 },
          { Label: 'Хянагдаагүй', Value: 2 },
        ],
      }, // nvarchar
      {
        Name: 'daralt_ihselt_hugatsaa',
        Label: 'daralt_ihselt_hugatsaa',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: '≤1 жил ', Value: 1 },
          { Label: '>1 -5 жил ', Value: 2 },
          { Label: '> 5 -10 жил', Value: 3 },
          { Label: ' > 10 жил', Value: 4 },
          { Label: 'Тодорхойгүй', Value: 5 },
        ],
      }, // nvarchar
      {
        Name: 'tamhi_hereglee',
        Label: 'tamhi_hereglee',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'tamhi_hereglee_yes',
        Label: 'tamhi_hereglee_yes',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
      }, // nvarchar
      { Name: 'tamhi_hereglee_box', Label: 'tamhi_hereglee_box', Type: 'Text' }, // nvarchar
      {
        Name: 'arhinii_hereglee',
        Label: 'arhinii_hereglee',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'arhinii_hereglee_yes',
        Label: 'arhinii_hereglee_yes',
        Data: [
          { Label: '<1 нэгж/хоног ', Value: 1 },
          { Label: ' 1 нэгж/хоног ', Value: 2 },
          { Label: '2-3 нэгж/хоног', Value: 3 },
          { Label: '≥ 4 нэгж/хоног', Value: 4 },
          { Label: 'Тодорхойгүй', Value: 5 },
        ],
      }, // nvarchar
      {
        Name: 'emiin_hereglee',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'emiin_hereglee_yes',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Каннабис', Value: 1 },
          { Label: 'Бензодиапезин', Value: 2 },
          { Label: 'Психостимулант', Value: 3 },
          { Label: 'MDMA (жнь амфетамин) ', Value: 4 },
          { Label: 'Кокайн', Value: 5 },
          { Label: 'Героин (опойд) ', Value: 6 },
          { Label: 'Бусад', Value: 7 },
        ],
      }, // nvarchar
      {
        Name: 'idevhitei_hudul',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Байхгүй', Value: 1 },
          { Label: 'Хааяа', Value: 2 },
          { Label: 'Тогтмол', Value: 3 },
          { Label: 'Эрчимтэй', Value: 4 },
          { Label: 'Тодорхойгүй', Value: 5 },
        ],
      }, // nvarchar
      {
        Name: 'chihriin_shijin',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'chihriin_shijin_yes',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'I хэв шинж', Value: 1 },
          { Label: 'II хэв шинж', Value: 2 },
        ],
      }, // nvarchar
      {
        Name: 'chihriin_shijin_hugatsaa',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: ' Анх оношлогдсон', Value: 1 },
          { Label: ' Судалгааны өмнө оношлогдсон байсан ', Value: 2 },
          { Label: '≤1 жил', Value: 3 },
          { Label: '>1 -5 жил ', Value: 4 },
          { Label: '> 5 -10 жил', Value: 5 },
          { Label: '> 10 жил', Value: 6 },
          { Label: 'Тодорхойгүй', Value: 7 },
        ],
      }, // nvarchar
      {
        Name: 'chihriin_shijin_odoo_emchilgee',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Байхгүй', Value: 1 },
          { Label: 'Хоолны дэглэм', Value: 2 },
          { Label: 'Эмчилгээ*', Value: 3 },
          { Label: 'Тодорхойгүй', Value: 4 },
        ],
      }, // nvarchar
      {
        Name: 'dislipidemi',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'dislipidemi_yes',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: ' Холестерол (LDL) ', Value: 1 },
          { Label: 'Триглицерид', Value: 2 },
          { Label: 'Липопротейн (a)', Value: 3 },
          { Label: 'Тодорхойгүй', Value: 4 },
        ],
      }, // nvarchar
      { Name: 'dislipidemi_yes_other', Label: 'Бусад', Type: 'Text' }, // nvarchar
      {
        Name: 'dislipidemi_udamshil',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'dislipidemi_hugatsaa',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Анх оношлогдсон', Value: 1 },
          { Label: 'Судалгааны өмнө оношлогдсон байсан', Value: 2 },
          { Label: '≤1 жил', Value: 3 },
          { Label: '>1 -5 жил', Value: 4 },
          { Label: '> 5 -10 жил', Value: 5 },
          { Label: '> 10 жил', Value: 6 },
          { Label: 'Тодорхойгүй', Value: 7 },
        ],
      }, // nvarchar
      {
        Name: 'dislipidemi_emchilgee',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Байхгүй', Value: 1 },
          { Label: 'Хоолны дэглэм', Value: 2 },
          { Label: 'Эмчилгээ*', Value: 3 },
          { Label: 'Тодорхойгүй', Value: 4 },
        ],
      }, // nvarchar
      {
        Name: 'zurh_udamshliin_oguul',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'genet_nas_barah_udam',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'titem_emgeg_udamshil',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'zurh_sudas_oguulemj',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'zurh_sudas_oguulemj_yes',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'z_s_tosguur',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'z_s_tosguur_yes',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Пароксизмт', Value: 1 },
          { Label: 'Тогтмол', Value: 2 },
          { Label: 'Удаан үргэлжилсэн тогтмол', Value: 3 },
          { Label: 'Байнгын', Value: 4 },
          { Label: 'Тодорхойгүй', Value: 5 },
        ],
      }, // nvarchar
      {
        Name: 'z_s_dutagdal',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      { Name: 'z_s_dutagdal_frakts', Type: 'Text' }, // nvarchar
      {
        Name: 'z_s_dutagdal_hugatsaa',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: ' ≤1 жил', Value: 1 },
          { Label: '>1 -5 жил', Value: 2 },
          { Label: '> 5 -10 жил', Value: 3 },
          { Label: '> 10 жил', Value: 4 },
          { Label: 'Тодорхойгүй', Value: 5 },
        ],
      }, // nvarchar
      {
        Name: 'z_s_umnuh_harvalt',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Тархинд цус харвах эмгэг', Value: 1 },
          { Label: 'Түр зуур цус хомсрох дайрлага (TIA) ', Value: 2 },
          { Label: 'Венийн тромбоэмболи (VTE)', Value: 3 },
          { Label: 'Цусны эргэлтийн эмболи ', Value: 4 },
          { Label: 'Уушигны эмболи', Value: 5 },
          { Label: 'Захын артерийн эмболи', Value: 6 },
          { Label: 'Тодорхойгүй', Value: 7 },
        ],
      }, // nvarchar
      {
        Name: 'z_s_umnuh_harvalt_suuliin',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: '<1 сар ', Value: 1 },
          { Label: '1-6 сар ', Value: 2 },
          { Label: '> 6 сар', Value: 3 },
          { Label: 'Тодорхойгүй', Value: 4 },
        ],
      }, // nvarchar
      {
        Name: 'z_s_umnuh_harvalt_suuliin_tohioldol',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: '<1 сар ', Value: 1 },
          { Label: '1-6 сар ', Value: 2 },
          { Label: '> 6 сар', Value: 3 },
          { Label: 'Тодорхойгүй', Value: 4 },
        ],
      }, // nvarchar
      {
        Name: 'z_s_umnuh_tsus_aldalt',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Үгүй', Value: 1 },
          { Label: 'Тархин дотор цус алдах', Value: 2 },
          { Label: 'Бусад гавлын дотоод цус алдалт', Value: 3 },
          { Label: 'Хоол боловсруулах замын цус алдалт', Value: 4 },
          { Label: ' Ерөнхий цус эргэлтийн цус алдалт	', Value: 5 },
          { Label: ' Бусад цус алдалт', Value: 6 },
          { Label: 'Тодорхойгүй', Value: 7 },
        ],
      }, // nvarchar
      {
        Name: 'z_s_umnuh_tsus_aldalt_tohioldol',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: '<1 сар ', Value: 1 },
          { Label: '1-6 сар ', Value: 2 },
          { Label: '> 6 сар', Value: 3 },
          { Label: 'Тодорхойгүй', Value: 4 },
        ],
      },
      {
        Name: 'z_s_uvchin',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'z_s_uvchin_yes',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'z_s_kardiomiopati',
        Label: 'z_s_kardiomiopati',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'z_s_kardiomiopati_yes',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Гипертрофийн', Value: 1 },
          { Label: 'Тэлэгдлийн (шалтгаан тодорхой)', Value: 2 },
          { Label: 'Тэлэгдлийн (шалтгаан тодорхойгүй)	', Value: 3 },
          { Label: 'Рестриктив', Value: 4 },
          { Label: 'Хэм алдагдлын шалтгаант (баруун ховдлын) ', Value: 5 },
          { Label: 'Такоцубо', Value: 6 },
          { Label: 'Удамшлын/генетик', Value: 7 },
          { Label: ' Архины хамааралтай байж болзошгүй', Value: 8 },
          { Label: ' Халдварын шалтгаант ', Value: 9 },
          { Label: 'Тахикарди өдөөгдсөн', Value: 10 },
          { Label: 'Тодорхойгүй', Value: 11 },
        ],
      }, // nvarchar
      {
        Name: 'z_s_guree',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'z_s_dood_much',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'z_s_genet_zogsoh',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'z_s_pacemaker',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'z_s_pacemaker_yes',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Антибрадикарди', Value: 1 },
          { Label: 'Хар тугалгагүй', Value: 2 },
          {
            Label: 'Зүрхний ресинхронизаци эмчилгээний пэйсмэйкер (CRT-P)',
            Value: 3,
          },
          {
            Label: 'Зүрхний ресинхронизаци эмчилгээний дефибриллятор (CRT-D)',
            Value: 4,
          },
          { Label: 'ЗДС', Value: 5 },
          { Label: 'Арьсан доорх ЗДС', Value: 6 },
        ],
      }, // nvarchar
      {
        Name: 'z_s_aort_intervention',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      },
      {
        Name: 'z_s_aort_intervention_yes',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Гол судасны хавхлага солих мэс засал ', Value: 1 },
          {
            Label: 'Транскатетр аортын хавхлага дээр хиймэл хавхлага суулгах эмчилгээ (TAVI)',
            Value: 2,
          },
          { Label: 'Бусад', Value: 3 },
          { Label: 'Тодорхойгүй', Value: 4 },
        ],
      }, // nvarchar
      {
        Name: 'z_s_mitral_intervention',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'z_s_mitral_intervention_yes',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          {
            Label: 'Хавхлагыг ирмэг-ирмэгээр нийлүүлэх судсанд дотуур мэс засал ',
            Value: 1,
          },
          { Label: 'Судсанд дотуур аргаар хавхлага солих мэс засал', Value: 2 },
          { Label: 'Хавхлага засах нээлттэй мэс засал', Value: 3 },
          { Label: 'Хавхлага солих нээлттэй мэс засал', Value: 4 },
          { Label: 'Бусад', Value: 5 },
          { Label: 'Тодорхойгүй', Value: 6 },
        ],
      }, // nvarchar
      {
        Name: 'z_s_3havtast_intervention',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'z_s_3havtast_intervention_yes',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          {
            Label: 'Хавхлагыг ирмэг-ирмэгээр нийлүүлэх судсанд дотуур мэс засал',
            Value: 1,
          },
          { Label: 'Судсанд дотуур аргаар хавхлага солих мэс засал', Value: 2 },
          { Label: 'Транскатетер анулопласти', Value: 3 },
          { Label: 'Хавхалга засах нээлттэй мэс засал', Value: 4 },
          { Label: 'Хавхлага солих нээлттэй мэс засал', Value: 5 },
          { Label: 'Бусад', Value: 6 },
          { Label: 'Тодорхойгүй', Value: 7 },
        ],
      }, // nvarchar
      {
        Name: 'z_s_aort_emgeg',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'z_s_aort_emgeg_yes',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [],
      }, // nvarchar
      {
        Name: 'z_s_aort_emgeg_odoo',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Хиймэл хавхлага', Value: 1 },
          { Label: 'Засагдсан хавхлага', Value: 2 },
          { Label: 'Өөрийн хавхлага', Value: 3 },
          { Label: 'Тодорхойгүй', Value: 4 },
        ],
      }, // nvarchar
      {
        Name: 'z_s_aort_emgeg_turul',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [],
      }, // nvarchar
      {
        Name: 'z_s_aort_emgeg_nar',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Байхгүй', Value: 1 },
          { Label: 'Хөнгөн', Value: 2 },
          { Label: 'Дунд', Value: 3 },
          { Label: 'Хүнд', Value: 4 },
          { Label: 'Тодорхойгүй', Value: 5 },
        ],
      }, // nvarchar
      {
        Name: 'z_s_aort_emgeg_reg',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Байхгүй', Value: 1 },
          { Label: 'Хөнгөн', Value: 2 },
          { Label: 'Дунд', Value: 3 },
          { Label: 'Хүнд', Value: 4 },
          { Label: 'Тодорхойгүй', Value: 5 },
        ],
      }, // nvarchar
      {
        Name: 'z_s_aort_emgeg_morfologi',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Хоёр хавтаст', Value: 1 },
          { Label: 'Гурван хавтаст', Value: 2 },
          { Label: 'Тодорхойгүй', Value: 3 },
        ],
      }, // nvarchar
      { Name: 'z_s_aort_emgeg_talbai', Type: 'Text' }, // nvarchar
      { Name: 'z_s_aort_emgeg_dun_zoruu', Type: 'Text' }, // nvarchar

      {
        Name: 'z_s_mitral_emgeg',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'z_s_mitral_emgeg_yes',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [],
      }, // nvarchar

      {
        Name: 'z_s_3havtast_emgeg',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'z_s_3havtast_emgeg_yes',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'z_s_3havtast_emgeg_odoo',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Хиймэл хавхлага', Value: 1 },
          { Label: 'Засагдсан хавхлага', Value: 2 },
          { Label: 'Өөрийн хавхлага', Value: 3 },
          { Label: 'Тодорхойгүй', Value: 4 },
        ],
      }, // nvarchar
      {
        Name: 'z_s_3havtast_emgeg_regur',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Байхгүй', Value: 1 },
          { Label: 'Хөнгөн', Value: 2 },
          { Label: 'Дунд', Value: 3 },
          { Label: 'Хүнд', Value: 4 },
          { Label: 'Тодорхойгүй', Value: 5 },
        ],
      }, // nvarchar

      {
        Name: 'z_s_turulh_emgeg',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'z_s_turulh_emgeg_yes',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      { Name: 'z_s_turulh_emgeg_yes_other', Type: 'Text' }, // nvarchar
      {
        Name: 'z_s_aldagdal',
        Label: 'Цус хөдлөлзүйд саад учруулах ховдлын хэм алдагдал байна уу?',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'z_s_busad',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      { Name: 'z_s_busad_yes', Label: 'z_s_busad_yes', Type: 'Text' }, // nvarchar

      // Зүрх судасны бус өвчний түүх
      {
        Name: 'zs_busad',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      { Name: 'zs_busad_yes', Label: 'zs_busad_yes', Type: 'Text' }, // nvarchar
      {
        Name: 'zs_busad_bambai',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'zs_busad_bambai_yes',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Гипертиреодизм (11)', Value: 1 },
          { Label: 'Гипотиреодизм (12)', Value: 2 },
          { Label: 'Одоогийн эмгэг', Value: 3 },
          { Label: 'Өмнөх эмгэг', Value: 4 },
        ],
      }, // nvarchar
      {
        Name: 'zs_busad_buur',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'zs_busad_buur_yes',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: ' Диализ тогтмол хийдэггүй	', Value: 1 },
          { Label: ' Диализ тогтмол хийдэг', Value: 2 },
          { Label: 'Бөөр шилжүүлэн суулгасан', Value: 3 },
        ],
      }, // nvarchar
      {
        Name: 'zs_busad_eleg',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'zs_busad_uushig',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'zs_busad_amisgal_tasaldah',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'zs_busad_amisgal_tasaldah_yes',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          {
            Label: 'Үргэлжилсэн эерэг даралтат эмчилгээ (CPAP) хийлгэдэг',
            Value: 1,
          },
          { Label: ' CPAP хийгдээгүй', Value: 2 },
        ],
      }, // nvarchar
      {
        Name: 'zs_busad_hort_havdar',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'zs_busad_hort_havdar_yes',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Одоогийн', Value: 1 },
          { Label: ' Өмнө нь (намжлын байдалд шилжсэн/ эдгэрсэн)', Value: 2 },
          { Label: 'Тодорхойгүй', Value: 3 },
        ],
      }, // nvarchar
      {
        Name: 'zs_busad_artrit',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'zs_busad_gutral',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'zs_busad_tanin',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'zs_busad_pregnant',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Үгүй', Value: 1 },
          { Label: 'Тийм', Value: 2 },
          {
            Label: 'Хамааралгүй (эрэгтэй эсвэл хүүхэд тээх насны эмэгтэй биш)',
            Value: 3,
          },
          { Label: 'Тодорхойгүй', Value: 4 },
        ],
      }, // nvarchar
      {
        Name: 'zs_busad_hdhv',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'zs_busad_covid',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'zs_busad_autimun',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'zs_busad_aspirin_ul',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'zs_busad_antikogulyant',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
      {
        Name: 'zs_busad_antikogulyant_yes',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Тосгуурын жирвэгнээ', Value: 1 },
          { Label: 'Механик хавхлага', Value: 2 },
          { Label: 'Уушигны эмболи', Value: 3 },
          { Label: 'Бусад', Value: 4 },
        ],
      }, // nvarchar
      {
        Name: 'zs_busad_tsus_aldah',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn_mn',
      }, // nvarchar
    ],
  ];

  this.ObjectName = 'AtrialRhythmNew';
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

module.exports = AtrialRhythmNewConfig;
