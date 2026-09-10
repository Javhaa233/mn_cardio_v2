const xlsx = require('xlsx');
const path = require('path');

const BaseControllerHelper = require('../../helper/BaseControllerHelper');

const RowArrayUnshift = [
  {
    Number: '',
    ProvinceCity: '',
    SoumDistrict: '',
    BagKhoroo: '',
    DoctorName: '',
    PatFullName: '',
    PatRegisterNo: '',
    PatAge: '',
    PatGender: '',
    PatAddress: '',
    PatPhoneNumber: '',
    PatWorkplace: '',
    BuurniiArhagUwchin: '',
    IsHolestrin: '',
    TsusniiSahar: '',
    ZurkhShigdees: '',
    TarkhiHarvalt: '',
    Stenokardi: '',
    TsusHomsroh: '',
    ZahiinSudas: '',
    GerbulNasbaralt: '',
    TamkhiTatdag: '',
    IsDaraltEm: '',
    IsDiabeticEm: '',
    Height: '',
    Weigth: '',
    BJI: '',
    Buselkhii: '',
    DaraltDeed: '',
    DaraltDood: '',
    UlunGlucose: '',
    Cholesterol: '',
    RiskTo5: '',
    Risk5To10: '',
    Risk10To20: '',
    Risk20To30: '',
    RiskUp30: '',
    DiagnosedArterHypertension: '',
    DiagnosedDiabetes: '',
    Tablets: '',
    TestDiagnose: '',
    Advice: '',
    IsSentLavlagaa: '',
    IsAdviceFromLavlagaa: '',
    FurtherAdvice: '',
    HynaltandOrson: '',
    HyanaltDate: '',
    HynaltandOrsonTorol: '',
    HynaltiinUzleg: '',
    HynaltandDahihHugatsaa: '',
    IsTransfered: '',
    TransferNote: '',
    TransferDate: '',
    HariutssanEmch: '',
  },
  {
    Number: '',
    ProvinceCity: '',
    SoumDistrict: '',
    BagKhoroo: '',
    DoctorName: '',
    PatFullName: '',
    PatRegisterNo: '',
    PatAge: '',
    PatGender: '',
    PatAddress: '',
    PatPhoneNumber: '',
    PatWorkplace: '',
    BuurniiArhagUwchin: '',
    IsHolestrin: '',
    TsusniiSahar: '',
    ZurkhShigdees: '',
    TarkhiHarvalt: '',
    Stenokardi: '',
    TsusHomsroh: '',
    ZahiinSudas: '',
    GerbulNasbaralt: '',
    TamkhiTatdag: '',
    IsDaraltEm: '',
    IsDiabeticEm: '',
    Height: '',
    Weigth: '',
    BJI: '',
    Buselkhii: '',
    DaraltDeed: '',
    DaraltDood: '',
    UlunGlucose: '',
    Cholesterol: '',
    RiskTo5: '',
    Risk5To10: '',
    Risk10To20: '',
    Risk20To30: '',
    RiskUp30: '',
    DiagnosedArterHypertension: '',
    DiagnosedDiabetes: '',
    Tablets: '',
    TestDiagnose: '',
    Advice: '',
    IsSentLavlagaa: '',
    IsAdviceFromLavlagaa: '',
    FurtherAdvice: '',
    HynaltandOrson: '',
    HyanaltDate: '',
    HynaltandOrsonTorol: '',
    HynaltiinUzleg: '',
    HynaltandDahihHugatsaa: '',
    IsTransfered: '',
    TransferNote: '',
    TransferDate: '',
    HariutssanEmch: '',
  },
  {
    Number: '',
    ProvinceCity: '',
    SoumDistrict: '',
    BagKhoroo: '',
    DoctorName: '',
    PatFullName: '',
    PatRegisterNo: '',
    PatAge: '',
    PatGender: '',
    PatAddress: '',
    PatPhoneNumber: '',
    PatWorkplace: '',
    BuurniiArhagUwchin: '',
    IsHolestrin: '',
    TsusniiSahar: '',
    ZurkhShigdees: '',
    TarkhiHarvalt: '',
    Stenokardi: '',
    TsusHomsroh: '',
    ZahiinSudas: '',
    GerbulNasbaralt: '',
    TamkhiTatdag: '',
    IsDaraltEm: '',
    IsDiabeticEm: '',
    Height: '',
    Weigth: '',
    BJI: '',
    Buselkhii: '',
    DaraltDeed: '',
    DaraltDood: '',
    UlunGlucose: '',
    Cholesterol: '',
    RiskTo5: '',
    Risk5To10: '',
    Risk10To20: '',
    Risk20To30: '',
    RiskUp30: '',
    DiagnosedArterHypertension: '',
    DiagnosedDiabetes: '',
    Tablets: '',
    TestDiagnose: '',
    Advice: '',
    IsSentLavlagaa: '',
    IsAdviceFromLavlagaa: '',
    FurtherAdvice: '',
    HynaltandOrson: '',
    HyanaltDate: '',
    HynaltandOrsonTorol: '',
    HynaltiinUzleg: '',
    HynaltandDahihHugatsaa: '',
    IsTransfered: '',
    TransferNote: '',
    TransferDate: '',
    HariutssanEmch: '',
  },
  {
    Number: '',
    ProvinceCity: '',
    SoumDistrict: '',
    BagKhoroo: '',
    DoctorName: '',
    PatFullName: '',
    PatRegisterNo: '',
    PatAge: '',
    PatGender: '',
    PatAddress: '',
    PatPhoneNumber: '',
    PatWorkplace: '',
    BuurniiArhagUwchin: '',
    IsHolestrin: '',
    TsusniiSahar: '',
    ZurkhShigdees: '',
    TarkhiHarvalt: '',
    Stenokardi: '',
    TsusHomsroh: '',
    ZahiinSudas: '',
    GerbulNasbaralt: '',
    TamkhiTatdag: '',
    IsDaraltEm: '',
    IsDiabeticEm: '',
    Height: '',
    Weigth: '',
    BJI: '',
    Buselkhii: '',
    DaraltDeed: '',
    DaraltDood: '',
    UlunGlucose: '',
    Cholesterol: '',
    RiskTo5: '',
    Risk5To10: '',
    Risk10To20: '',
    Risk20To30: '',
    RiskUp30: '',
    DiagnosedArterHypertension: '',
    DiagnosedDiabetes: '',
    Tablets: '',
    TestDiagnose: '',
    Advice: '',
    IsSentLavlagaa: '',
    IsAdviceFromLavlagaa: '',
    FurtherAdvice: '',
    HynaltandOrson: '',
    HyanaltDate: '',
    HynaltandOrsonTorol: '',
    HynaltiinUzleg: '',
    HynaltandDahihHugatsaa: '',
    IsTransfered: '',
    TransferNote: '',
    TransferDate: '',
    HariutssanEmch: '',
  },
  {
    Number: '',
    ProvinceCity: '',
    SoumDistrict: '',
    BagKhoroo: '',
    DoctorName: '',
    PatFullName: '',
    PatRegisterNo: '',
    PatAge: '',
    PatGender: '',
    PatAddress: '',
    PatPhoneNumber: '',
    PatWorkplace: '',
    BuurniiArhagUwchin: '',
    IsHolestrin: '',
    TsusniiSahar: '',
    ZurkhShigdees: '',
    TarkhiHarvalt: '',
    Stenokardi: '',
    TsusHomsroh: '',
    ZahiinSudas: '',
    GerbulNasbaralt: '',
    TamkhiTatdag: '',
    IsDaraltEm: '',
    IsDiabeticEm: '',
    Height: '',
    Weigth: '',
    BJI: '',
    Buselkhii: '',
    DaraltDeed: '',
    DaraltDood: '',
    UlunGlucose: '',
    Cholesterol: '',
    RiskTo5: '',
    Risk5To10: '',
    Risk10To20: '',
    Risk20To30: '',
    RiskUp30: '',
    DiagnosedArterHypertension: '',
    DiagnosedDiabetes: '',
    Tablets: '',
    TestDiagnose: '',
    Advice: '',
    IsSentLavlagaa: '',
    IsAdviceFromLavlagaa: '',
    FurtherAdvice: '',
    HynaltandOrson: '',
    HyanaltDate: '',
    HynaltandOrsonTorol: '',
    HynaltiinUzleg: '',
    HynaltandDahihHugatsaa: '',
    IsTransfered: '',
    TransferNote: '',
    TransferDate: '',
    HariutssanEmch: '',
  },
];

function WorkSheetHeader(sheet) {
  // Headers
  var SumName = '*********';

  // Cell Style
  const headerStyle = {
    font: { bold: true },
    alignment: { horizontal: 'center', textRotation: 90 },
  };

  sheet.A1 = { t: 's', v: 'Сум, өрхийн ЭМТ-ийн нэр' + SumName };
  sheet.A2 = { t: 's', v: 'Он, сар, өдөр: **********' };
  sheet.M2 = {
    t: 's',
    v: 'МонгПЭН төслийн үзлэг, эрсдэлийн үнэлгээ, эмчилгээ, хяналтын бүртгэл',
    s: headerStyle,
  };
  sheet.A3 = {
    t: 's',
    v: 'Нэг. Бүртгэлийн хэсэг',
    s: { font: { bold: true } },
  };
  sheet.M3 = { t: 's', v: 'Хоёр. ЗСӨ-ний түүх', s: headerStyle };
  sheet.Y3 = { t: 's', v: 'Гурав.Биеийн хэмжээс' };
  sheet.AG3 = { t: 's', v: 'Дөрөв. ЗСӨ-ний 10 жилийн эрсдэл' };
  sheet.AL3 = { t: 's', v: 'Тав. Үзлэг ба менежментийн төлөвлөгөө' };
  sheet.AT3 = { t: 's', v: 'Зургаа. Хяналт' };
  sheet.AY3 = { t: 's', v: 'Долоо. Шилжилт хөдөлгөөн' };
  // #region Columns
  sheet.A4 = { t: 's', v: '№' };
  sheet.B4 = { t: 's', v: 'Хяналтад авсан Аймаг/хот' };
  sheet.C4 = { t: 's', v: 'Хяналтад авсан Дүүрэг/сум' };
  sheet.D4 = { t: 's', v: 'Хяналтад авсан Хороо/баг' };
  sheet.E4 = { t: 's', v: 'Хяналтад авсан эмнэлгийн нэр' };
  sheet.F4 = { t: 's', v: 'Овог нэр' };
  sheet.G4 = { t: 's', v: 'РД' };
  sheet.H4 = { t: 's', v: 'Нас' };
  sheet.I4 = { t: 's', v: 'Хүйс' };
  sheet.J4 = { t: 's', v: 'Гэрийн хаяг' };
  sheet.K4 = { t: 's', v: 'Утас' };
  sheet.L4 = {
    t: 's',
    v: 'Ажил эрхлэлтийн байдал /Ажилтай, Ажилгүй, тэтгэвэр, групп, оюутан/',
  };
  sheet.M4 = {
    t: 's',
    v: 'ЧШ-ийн нефропати-г оролцуулаад бөөрний архаг өвчтэй эсэх',
  };
  sheet.N4 = {
    t: 's',
    v: 'Батлагдсан  эсвэл нийт холестрин өндөртэй эсэх',
  };
  sheet.O4 = {
    t: 's',
    v: 'Батлагдсан ЧШ эсвэл цусны сахар өндөртэй эсэх',
  };
  sheet.P4 = { t: 's', v: 'Өмнө нь зүрхний шигдээс болж байсан эсэх' };
  sheet.Q4 = { t: 's', v: 'Өмнө нь тархины харвалт болж байсан эсэх' };
  sheet.R4 = { t: 's', v: 'Стенокарди/цээжний бахтай байсан эсэх' };
  sheet.S4 = {
    t: 's',
    v: 'Тархины цус хомсрох түр зуурын дайрлага болж байсан эсэх',
  };
  sheet.T4 = { t: 's', v: 'Захын судасны өвчтэй эсэх' };
  sheet.U4 = {
    t: 's',
    v: 'Гэр бүлд ЗСӨ-ний гэнэтийн нас баралтын түүх байсан эсэх',
  };
  sheet.V4 = { t: 's', v: 'Тамхи хэрэглэж байгаа эсэх' };
  sheet.W4 = {
    t: 's',
    v: 'Цусны даралт бууруулах эм хэрэглэж байсан эсэх',
  };
  sheet.X4 = { t: 's', v: 'ЧШ-гийн эм хэрэглэж байсан эсэх' };
  sheet.Y4 = { t: 's', v: 'Биеийн өндөр (см)' };
  sheet.Z4 = { t: 's', v: 'Жин (кг)' };
  sheet.AA4 = { t: 's', v: 'БЖИ (кг/м2)' };
  sheet.AB4 = { t: 's', v: 'Бүсэлхий' };
  sheet.AC4 = { t: 's', v: 'Систолийн даралт' };
  sheet.AD4 = { t: 's', v: 'Диастолийн даралт' };
  sheet.AE4 = { t: 's', v: 'Өлөн үеийн цусны сахар' };
  sheet.AF4 = { t: 's', v: 'Холестерин' };
  sheet.AG4 = { t: 's', v: 'ЗСӨ-ний эрсдэл 5 % хүртэл' };
  sheet.AH4 = { t: 's', v: 'ЗСӨ-ний эрсдэл 5%-10% хүртэл' };
  sheet.AI4 = { t: 's', v: 'ЗСӨ-ний эрсдэл 10% -20 % хүртэл' };
  sheet.AJ4 = { t: 's', v: 'ЗСӨ-ний эрсдэл 20% -30 % хүртэл' };
  sheet.AK4 = { t: 's', v: 'ЗСӨ-ний эрсдэл ≥ 30%' };
  sheet.AL4 = { t: 's', v: 'Оношлогдсон  А Г (I 10)' };
  sheet.AM4 = { t: 's', v: 'Оношлогдсон  ЧШ (E11.9)' };
  sheet.AN4 = { t: 's', v: 'Бичсэн эм' };
  sheet.AO4 = { t: 's', v: 'Хийсэн шинжилгээ оношлуур' };
  sheet.AP4 = { t: 's', v: 'Өгсөн зөвлөгөө' };
  sheet.AQ4 = { t: 's', v: 'Лавлагаа тусламжинд илгээсэн эсэх' };
  sheet.AR4 = { t: 's', v: 'Лавлагаа тусламжаас бичигтэй ирсэн эсэх' };
  sheet.AS4 = {
    t: 's',
    v: 'Цаашдын үнэлгээ / эмчилгээний талаар тэмдэглэл',
  };
  sheet.AT4 = { t: 's', v: ' Хяналтын үзлэгт хамрагдсан эсэх' };
  sheet.AU4 = { t: 's', v: 'Огноо' };
  sheet.AV4 = { t: 's', v: 'Хяналтанд орсон төрөл' };
  sheet.AW4 = { t: 's', v: 'Үзлэгт хамрагдсан эсэх' };
  sheet.AX4 = { t: 's', v: 'Дахин үзүүлэх хугацаа /сараар/' };
  sheet.AY4 = { t: 's', v: 'Шилжсэн эсэх' };
  sheet.AZ4 = { t: 's', v: 'Тайлбар' };
  sheet.BA4 = { t: 's', v: 'Огноо' };
  sheet.BB4 = { t: 's', v: 'Хариуцсан эмч' };
  //#endregion

  //#region Numbers
  sheet.A5 = { t: 's', v: '1' };
  sheet.B5 = { t: 's', v: '2' };
  sheet.C5 = { t: 's', v: '3' };
  sheet.D5 = { t: 's', v: '4' };
  sheet.E5 = { t: 's', v: '5' };
  sheet.F5 = { t: 's', v: '6' };
  sheet.G5 = { t: 's', v: '7' };
  sheet.H5 = { t: 's', v: '8' };
  sheet.I5 = { t: 's', v: '9' };
  sheet.J5 = { t: 's', v: '10' };
  sheet.K5 = { t: 's', v: '11' };
  sheet.L5 = { t: 's', v: '12' };
  sheet.M5 = { t: 's', v: '13' };
  sheet.N5 = { t: 's', v: '14' };
  sheet.O5 = { t: 's', v: '15' };
  sheet.P5 = { t: 's', v: '16' };
  sheet.Q5 = { t: 's', v: '17' };
  sheet.R5 = { t: 's', v: '18' };
  sheet.S5 = { t: 's', v: '19' };
  sheet.T5 = { t: 's', v: '20' };
  sheet.U5 = { t: 's', v: '21' };
  sheet.V5 = { t: 's', v: '22' };
  sheet.W5 = { t: 's', v: '23' };
  sheet.X5 = { t: 's', v: '24' };
  sheet.Y5 = { t: 's', v: '25' };
  sheet.Z5 = { t: 's', v: '26' };
  sheet.AA5 = { t: 's', v: '27' };
  sheet.AB5 = { t: 's', v: '28' };
  sheet.AC5 = { t: 's', v: '29' };
  sheet.AD5 = { t: 's', v: '30' };
  sheet.AE5 = { t: 's', v: '31' };
  sheet.AF5 = { t: 's', v: '32' };
  sheet.AG5 = { t: 's', v: '33' };
  sheet.AH5 = { t: 's', v: '34' };
  sheet.AI5 = { t: 's', v: '35' };
  sheet.AJ5 = { t: 's', v: '36' };
  sheet.AK5 = { t: 's', v: '37' };
  sheet.AL5 = { t: 's', v: '38' };
  sheet.AM5 = { t: 's', v: '39' };
  sheet.AN5 = { t: 's', v: '40' };
  sheet.AO5 = { t: 's', v: '41' };
  sheet.AP5 = { t: 's', v: '42' };
  sheet.AQ5 = { t: 's', v: '43' };
  sheet.AR5 = { t: 's', v: '44' };
  sheet.AS5 = { t: 's', v: '45' };
  sheet.AT5 = { t: 's', v: '46' };
  sheet.AU5 = { t: 's', v: '47' };
  sheet.AV5 = { t: 's', v: '48' };
  sheet.AW5 = { t: 's', v: '49' };
  sheet.AX5 = { t: 's', v: '50' };
  sheet.AY5 = { t: 's', v: '51' };
  sheet.AZ5 = { t: 's', v: '52' };
  sheet.BA5 = { t: 's', v: '53' };
  sheet.BB5 = { t: 's', v: '54' };
  //#endregion

  const merge = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 53 } }, // Сум, өрхийн ЭМТ-ийн нэр:
    { s: { r: 1, c: 0 }, e: { r: 1, c: 11 } }, // Он, сар, өдөр: **********
    { s: { r: 1, c: 12 }, e: { r: 1, c: 53 } }, // МонгПЭН төслийн үзлэг, эрсдэлийн үнэлгээ, эмчилгээ, хяналтын бүртгэл
    { s: { r: 2, c: 0 }, e: { r: 2, c: 11 } }, // Нэг. Бүртгэлийн хэсэг
    { s: { r: 2, c: 12 }, e: { r: 2, c: 23 } }, // Хоёр. ЗСӨ-ний түүх
    { s: { r: 2, c: 24 }, e: { r: 2, c: 31 } }, // Гурав.Биеийн хэмжээс
    { s: { r: 2, c: 32 }, e: { r: 2, c: 36 } }, // Дөрөв. ЗСӨ-ний 10 жилийн эрсдэл
    { s: { r: 2, c: 37 }, e: { r: 2, c: 44 } }, // Тав. Үзлэг ба менежментийн төлөвлөгөө
    { s: { r: 2, c: 45 }, e: { r: 2, c: 49 } }, // Зургаа. Хяналт
    { s: { r: 2, c: 50 }, e: { r: 2, c: 52 } }, // Долоо. Шилжилт хөдөлгөөн
  ];

  sheet['!merges'] = merge;

  return sheet;
}

function SoumSheetHeader(sheet) {}

// Report to excel
async function ReportExportExcel(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully', Data: {} };

    // Excel column value
    // var RowArray = [];
    var RowArray = [];

    RowArray.unshift(...RowArrayUnshift);

    const sheetName = 'Monitoring';
    var filePath = '';
    filePath = 'outputExcel/Monitoring.xlsx';

    const workBook = xlsx.utils.book_new();

    var sheet = xlsx.utils.json_to_sheet(RowArray, { skipHeader: true });

    sheet = WorkSheetHeader(sheet);

    // sheet["!cols`"] = this.fitToColumn(sheetData);

    xlsx.utils.book_append_sheet(workBook, sheet, sheetName);
    xlsx.writeFile(workBook, path.resolve(filePath));

    res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.download(filePath);
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

module.exports = { ReportExportExcel };
