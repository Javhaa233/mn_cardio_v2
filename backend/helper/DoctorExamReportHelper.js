const path = require('path');
const ExcelJS = require('exceljs');
const { Sequelize, sequelize, Models } = require('../config/DB');
const BaseControllerHelper = require('./BaseControllerHelper');
const Provenance = require('./Provenance');

/**
 * Эмчийн нэгдсэн үзлэгийн тайлан - эмч тус бүрээр нэг мөр, тухайн хүний системд
 * үүсгэсэн бүртгэлийн тоо.
 *
 * Юуг тоолж байгаа вэ, яагаад ийм холбоос вэ:
 *
 * Хуучин үеийн хүснэгтүүдэд бичлэг ҮҮСГЭСЭН хэрэглэгчийн `Users.Id` нь `id` баганад
 * хадгалагддаг (ModelHelper.SetDefaultValue), шинэ үеийнхэд `CreateUserId`. Хоёулаа
 * ижил утга - `Users.Id` - учраас `DoctorsProfile.id` (Sequelize дээр `UserId`) рүү
 * нэг л холбоосоор нийлдэг. Visit.belongsTo(DoctorsProfile, {foreignKey:'id',
 * targetKey:'UserId'}) гэдэг нь системийн өөрийнх нь хүлээн зөвшөөрсөн холбоос.
 *
 * САНАМЖ: энэ нь "үзлэг хийсэн эмч" биш, "бичлэг үүсгэсэн хэрэглэгч" юм. Сувилагч
 * эсвэл бүртгэгч оруулсан үзлэг тухайн хүн дээр тоологдоно (VisitController.js:144-150
 * үүнийг өөрөө тэмдэглэсэн). Тиймээс энэ тайланг эмчийн ачаалал биш, СИСТЕМИЙН
 * АШИГЛАЛТ гэж уншина.
 */

// Нэг эх сурвалж = нэг UNION ALL хэсэг.
// Bucket нь эцсийн хүснэгтийн аль багана руу нийлэхийг заана.
const SOURCES = [
  { Bucket: 'visit', Table: 'Visit', UserCol: 'id', DateCol: 'visit_date' },
  { Bucket: 'echo', Table: 'ExaminationEcho', UserCol: 'id', DateCol: 'echo_date' },
  { Bucket: 'ecg', Table: 'EcgExamination', UserCol: 'id', DateCol: 'date_creation' },
  { Bucket: 'cath', Table: 'PCathlab', UserCol: 'id', DateCol: 'cath_lab_operation_date' },
  { Bucket: 'advice', Table: 'Advice', UserCol: 'id', DateCol: 'date_creation' },
  { Bucket: 'advicecomment', Table: 'AdviceComment', UserCol: 'id', DateCol: 'date_creation' },
  { Bucket: 'cvd', Table: 'CVDMonitoring', UserCol: 'CreateUserId', DateCol: 'CreateDate' },
  // Бусад бүртгэл - тус бүрдээ цөөн мөртэй тул нэг баганад нийлнэ
  { Bucket: 'other', Table: 'CardiacSurgeryReport', UserCol: 'id', DateCol: 'date_of_operation' },
  { Bucket: 'other', Table: 'BloodStroke', UserCol: 'id', DateCol: 'date' },
  { Bucket: 'other', Table: 'TenderFormData', UserCol: 'DoctorId', DateCol: 'FormDate' },
  { Bucket: 'other', Table: 'AtrialRhythmNew', UserCol: 'CreateUserId', DateCol: 'CreatedDate' },
  { Bucket: 'other', Table: 'AtrialRhythm', UserCol: 'CreateUserId', DateCol: 'CreatedDate' },
  { Bucket: 'other', Table: 'ValveDiseases', UserCol: 'CreateUserId', DateCol: 'CreatedDate' },
  { Bucket: 'other', Table: 'ValveDiseasesEndo', UserCol: 'CreateUserId', DateCol: 'CreatedDate' },
  { Bucket: 'other', Table: 'VascularDisease', UserCol: 'CreateUserId', DateCol: 'CreatedDate' },
  {
    Bucket: 'other',
    Table: 'CongenitalMalformations',
    UserCol: 'CreateUserId',
    DateCol: 'CreatedDate',
  },
  { Bucket: 'other', Table: 'HfAmbulance', UserCol: 'CreateUserId', DateCol: 'CreatedDate' },
  { Bucket: 'other', Table: 'HfHospitalization', UserCol: 'CreateUserId', DateCol: 'CreatedDate' },
  { Bucket: 'other', Table: 'SurgeryPlans', UserCol: 'CreateUserId', DateCol: 'CreateDate' },
  { Bucket: 'other', Table: 'ICDRhythm', UserCol: 'CreateUserId', DateCol: 'CreatedDate' },
  { Bucket: 'other', Table: 'PaceMakerRhythm', UserCol: 'CreateUserId', DateCol: 'CreatedDate' },
  { Bucket: 'other', Table: 'MonitoringRhythm', UserCol: 'CreateUserId', DateCol: 'CreatedDate' },
];

// Гарах багана: Name нь SQL-ийн alias, Label нь толгойн бичиг.
const COLUMNS = [
  { Name: 'OrganizationName', Label: 'Байгууллага', Width: 260 },
  { Name: 'ProvinceName', Label: 'Аймаг/хот', Width: 130 },
  { Name: 'SoumName', Label: 'Сум/Дүүрэг', Width: 130 },
  { Name: 'BagName', Label: 'Баг/Хороо', Width: 120 },
  { Name: 'Position', Label: 'Албан тушаал', Width: 160 },
  { Name: 'LastName', Label: 'Овог', Width: 120 },
  { Name: 'FirstName', Label: 'Нэр', Width: 130 },
  { Name: 'Telephone', Label: 'Утас', Width: 110 },
  { Name: 'VisitCount', Label: 'Үзлэг', Width: 90, Numeric: true },
  { Name: 'EchoCount', Label: 'ЭХО', Width: 80, Numeric: true },
  { Name: 'EcgCount', Label: 'ЭКГ', Width: 80, Numeric: true },
  { Name: 'CathCount', Label: 'Ангиографи', Width: 110, Numeric: true },
  { Name: 'AdviceCount', Label: 'Зөвлөгөө', Width: 100, Numeric: true },
  { Name: 'AdviceCommentCount', Label: 'Зөвлөгөөний хариу', Width: 140, Numeric: true },
  { Name: 'CvdCount', Label: 'ЗСӨ хяналт', Width: 110, Numeric: true },
  { Name: 'OtherCount', Label: 'Бусад бүртгэл', Width: 120, Numeric: true },
  { Name: 'TotalCount', Label: 'НИЙТ', Width: 100, Numeric: true },
  { Name: 'LastActivity', Label: 'Сүүлд бүртгэл хийсэн', Width: 150 },
];

// INFORMATION_SCHEMA-г нэг л удаа уншина. Продакшн, тест, сэргээсэн хуулбар гурав
// ижил схемтэй биш - MnCardio_restored дээр ValveDiseases-д CreateUserId байхгүй -
// тул байхгүй хүснэгт/баганыг асуултаас хасах ёстой, эс тэгвээс бүх тайлан унана.
let AvailableSources = null;

async function GetAvailableSources() {
  if (AvailableSources) return AvailableSources;

  const [Rows] = await sequelize.query(
    "SELECT TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dbo'"
  );
  const Have = new Set(Rows.map((r) => r.TABLE_NAME + '.' + r.COLUMN_NAME));

  AvailableSources = SOURCES.filter((s) => {
    const Ok = Have.has(s.Table + '.' + s.UserCol) && Have.has(s.Table + '.' + s.DateCol);
    if (!Ok) {
      console.log(
        '[DoctorExamReport] эх сурвалж алгасав: ' +
          s.Table +
          ' (' +
          s.UserCol +
          '/' +
          s.DateCol +
          ' олдсонгүй)'
      );
    }
    return Ok;
  }).map((s) => ({ ...s, HasRecStatus: Have.has(s.Table + '.rec_status') }));

  return AvailableSources;
}

/**
 * Хэрэглэгч ямар байгууллагуудыг харах эрхтэй вэ.
 *
 * null буцаавал "бүгд" гэсэн үг (хязгаарлалт тавихгүй). Хоосон массив буцаавал
 * "юу ч биш". Админ (role 1) болон 3-р түвшний үндэсний төв бүгдийг, 2-р түвшний
 * эмнэлэг өөрийгөө + харьяа 1-р түвшнийхээ, бусад нь зөвхөн өөрийгөө харна.
 */
async function ResolveOrgScope(LogedUser) {
  const RoleId = LogedUser ? parseInt(LogedUser.RoleId, 10) : null;
  if (RoleId === 1) return null;

  const Organization = LogedUser && LogedUser.Doctor ? LogedUser.Doctor.Organization : null;
  if (!Organization || !Organization.Id) return [];

  const OrgLevel = Organization.level === null ? null : Organization.level + '';
  // Үндэсний төв (ЗСҮТ) бүх байгууллагын ашиглалтыг хардаг.
  if (OrgLevel === '3') return null;

  const OrgIds = [Organization.Id];
  if (OrgLevel === '2') {
    const Children = await Models.Organization.findAll({
      where: { ParentOrganizationId: Organization.Id + '', level: '1' },
      attributes: ['Id'],
      raw: true,
    });
    (Children || []).forEach((e) => OrgIds.push(e.Id));
  }
  return OrgIds;
}

// Зөвхөн бүхэл тоо. Массивыг SQL-д шууд бичдэг цорын ганц газар тул хатуу шүүнэ.
function ToIntList(Value) {
  if (!Array.isArray(Value)) return [];
  return Value.map((v) => parseInt(v, 10)).filter((v) => Number.isInteger(v));
}

function ToIntOrNull(Value) {
  if (Value === null || Value === undefined || Value === '' || Value === '-1') return null;
  const N = parseInt(Value, 10);
  return Number.isInteger(N) ? N : null;
}

// 'YYYY-MM-DD' л зөвшөөрнө; өөр бүхнийг хаяна.
function ToDateOrNull(Value) {
  if (!Value) return null;
  const S = String(Value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(S) ? S : null;
}

async function BuildQuery({ LogedUser, Filter }) {
  const Sources = await GetAvailableSources();

  const StartDate = ToDateOrNull(Filter.StartDate);
  const EndDate = ToDateOrNull(Filter.EndDate);
  const ProvinceId = ToIntOrNull(Filter.addr_prov_city);
  const SoumId = ToIntOrNull(Filter.addr_soum_dist);
  const BagId = ToIntOrNull(Filter.addr_bag_khoroo);
  const OrganizationId = ToIntOrNull(Filter.OrganizationId);
  const SearchText = Filter.SearchText ? String(Filter.SearchText).trim() : '';

  const Scope = await ResolveOrgScope(LogedUser);
  if (Array.isArray(Scope) && Scope.length === 0) {
    return { Empty: true };
  }

  // ---- CTE: бүх эх сурвалжийг нэг багана болгож нийлүүлнэ -------------------
  const Parts = Sources.map((s) => {
    const Where = ['[' + s.UserCol + '] IS NOT NULL'];
    if (s.HasRecStatus) Where.push('ISNULL([rec_status], 0) <> 2');
    if (StartDate) Where.push('[' + s.DateCol + '] >= $StartDate');
    if (EndDate) Where.push('[' + s.DateCol + '] <= $EndDate');
    // ActDate-г заавал `date` болгоно. Эх багануудад `date` ба `datetime` хоёулаа
    // байдаг ба UNION ALL нь илүү нарийвчлалтайг нь сонгодог тул 1753-аас өмнөх
    // хог огноо бүхий хуучин мөр "out-of-range value" алдаа өгдөг. TRY_CAST нь
    // хөрвүүлэгдэхгүй утгыг NULL болгоно. WHERE нь түүхий багана дээрээ үлдэж
    // байгаа тул индекс ашиглах чадвар алдагдахгүй.
    return (
      "SELECT [" +
      s.UserCol +
      "] AS UserId, '" +
      s.Bucket +
      "' AS Bucket, TRY_CAST([" +
      s.DateCol +
      '] AS date) AS ActDate FROM [' +
      s.Table +
      '] WHERE ' +
      Where.join(' AND ')
    );
  });

  // ---- Гадна талын шүүлтүүд -------------------------------------------------
  const Where = ['ISNULL(d.rec_status, 0) <> 2'];
  if (Array.isArray(Scope)) {
    const Ids = ToIntList(Scope);
    if (Ids.length === 0) return { Empty: true };
    Where.push('d.OrganizationId IN (' + Ids.join(',') + ')');
  }
  if (OrganizationId !== null) Where.push('d.OrganizationId = ' + OrganizationId);
  if (ProvinceId !== null) Where.push('o.addr_prov_city = ' + ProvinceId);
  if (SoumId !== null) Where.push('o.addr_soum_dist = ' + SoumId);
  if (BagId !== null) Where.push('o.addr_bag_khoroo = ' + BagId);
  if (SearchText) {
    Where.push(
      '(d.lastname LIKE $Search OR d.firstname LIKE $Search OR d.position LIKE $Search' +
        ' OR d.telephone LIKE $Search OR o.Name LIKE $Search)'
    );
  }

  const Sum = (Bucket) => "SUM(CASE WHEN a.Bucket = '" + Bucket + "' THEN 1 ELSE 0 END)";

  const Sql =
    'WITH Activity AS (\n' +
    Parts.join('\nUNION ALL\n') +
    '\n)\n' +
    'SELECT\n' +
    '  d.id_data                       AS DoctorId,\n' +
    "  ISNULL(o.Name, '')              AS OrganizationName,\n" +
    "  ISNULL(pc.name, '')             AS ProvinceName,\n" +
    "  ISNULL(sd.name, '')             AS SoumName,\n" +
    "  ISNULL(bk.name, '')             AS BagName,\n" +
    "  ISNULL(d.position, '')          AS Position,\n" +
    "  ISNULL(d.lastname, '')          AS LastName,\n" +
    "  ISNULL(d.firstname, '')         AS FirstName,\n" +
    "  ISNULL(d.telephone, '')         AS Telephone,\n" +
    '  ' +
    Sum('visit') +
    ' AS VisitCount,\n  ' +
    Sum('echo') +
    ' AS EchoCount,\n  ' +
    Sum('ecg') +
    ' AS EcgCount,\n  ' +
    Sum('cath') +
    ' AS CathCount,\n  ' +
    Sum('advice') +
    ' AS AdviceCount,\n  ' +
    Sum('advicecomment') +
    ' AS AdviceCommentCount,\n  ' +
    Sum('cvd') +
    ' AS CvdCount,\n  ' +
    Sum('other') +
    ' AS OtherCount,\n' +
    '  COUNT(a.UserId)                 AS TotalCount,\n' +
    '  CONVERT(varchar(10), MAX(a.ActDate), 120) AS LastActivity\n' +
    'FROM DoctorsProfile d\n' +
    '  LEFT JOIN Organization     o  ON o.Id       = d.OrganizationId\n' +
    '  LEFT JOIN DictProvinceCity pc ON pc.id_data = o.addr_prov_city\n' +
    '  LEFT JOIN DictSoumDistrict sd ON sd.id_data = o.addr_soum_dist\n' +
    '  LEFT JOIN DictBagKhoroo    bk ON bk.id_data = o.addr_bag_khoroo\n' +
    '  LEFT JOIN Activity         a  ON a.UserId   = d.id\n' +
    'WHERE ' +
    Where.join('\n  AND ') +
    '\n' +
    'GROUP BY d.id_data, o.Name, pc.name, sd.name, bk.name,\n' +
    '         d.position, d.lastname, d.firstname, d.telephone\n' +
    'ORDER BY TotalCount DESC, OrganizationName ASC, LastName ASC';

  // Кирилл утга replacements-ээр явбал N'' биш '' болж хувирдаг тул bind хэрэглэнэ.
  const Bind = {};
  if (StartDate) Bind.StartDate = StartDate;
  if (EndDate) Bind.EndDate = EndDate;
  if (SearchText) Bind.Search = '%' + SearchText + '%';

  return { Sql, Bind, Empty: false };
}

/** Тайлангийн мөрүүд. Дээд хязгаар 20,000 мөр - экспорттой ижил таг. */
const ROW_CAP = 20000;

async function GetData({ LogedUser, Filter }) {
  const { Sql, Bind, Empty } = await BuildQuery({ LogedUser, Filter });
  if (Empty) return { Data: [], Total: 0, Summary: EmptySummary() };

  const Rows = await sequelize.query(Sql, {
    type: Sequelize.QueryTypes.SELECT,
    bind: Bind,
  });

  const Capped = Rows.length > ROW_CAP ? Rows.slice(0, ROW_CAP) : Rows;
  return { Data: Capped, Total: Rows.length, Summary: BuildSummary(Rows) };
}

function EmptySummary() {
  return { DoctorCount: 0, ActiveDoctorCount: 0, RecordCount: 0 };
}

/** Grid-ийн дээр гарах гурван тоо. Шүүлтийн хүрээнд тооцогдоно. */
function BuildSummary(Rows) {
  let Active = 0;
  let Records = 0;
  Rows.forEach((r) => {
    const Total = Number(r.TotalCount) || 0;
    if (Total > 0) Active += 1;
    Records += Total;
  });
  return { DoctorCount: Rows.length, ActiveDoctorCount: Active, RecordCount: Records };
}

/**
 * Экспортын эх сурвалжийн тэмдэглэгээ.
 *
 * MOVED TO helper/Provenance.js on 2026-09-14, unchanged in output. Every other
 * export - the patient journal, the visit list, the summary - needs the exact
 * same block, and a stamp whose format depends on which endpoint produced it
 * defeats the purpose of having one. This wrapper keeps the local call sites
 * and the Filter shape they pass.
 */
function BuildProvenance({ LogedUser, Filter }) {
  return Provenance.Lines({
    LogedUser,
    Register: 'Эмчийн нэгдсэн үзлэгийн тайлан',
    From: Filter.StartDate,
    To: Filter.EndDate,
    Note: 'тоо бүр тухайн бичлэгийг СИСТЕМД ҮҮСГЭСЭН хэрэглэгчээр тоологдсон болно.',
  });
}

async function BuildExport({ LogedUser, Filter }) {
  const { Data } = await GetData({ LogedUser, Filter });
  return {
    headers: COLUMNS.map((c) => c.Label),
    rows: Data.map((row) => COLUMNS.map((c) => (row[c.Name] === null ? '' : row[c.Name]))),
    provenance: BuildProvenance({ LogedUser, Filter }),
  };
}

async function ExportExcel({ LogedUser, Filter }) {
  const { headers, rows, provenance } = await BuildExport({ LogedUser, Filter });
  const filePath = BaseControllerHelper.ExportFilePath('DoctorExamReport', 'xlsx');

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('DoctorExamReport');

  provenance.forEach((line) => worksheet.addRow([line]));
  worksheet.addRow([]);
  for (let r = 1; r <= provenance.length; r++) {
    worksheet.getRow(r).font = { italic: true, size: 9 };
  }

  const HeaderRow = worksheet.addRow(headers);
  HeaderRow.font = { bold: true };
  worksheet.views = [{ state: 'frozen', ySplit: HeaderRow.number }];

  rows.forEach((row) => worksheet.addRow(row));

  const columnWidths = BaseControllerHelper.fitToColumn([headers, ...rows]);
  worksheet.columns = worksheet.columns.map((col, i) => ({
    ...col,
    width: columnWidths[i] ? columnWidths[i].wch : 20,
  }));

  await workbook.xlsx.writeFile(path.resolve(filePath));
  return { filePath };
}

/** .xlsx-тэй ижил өгөгдөл, таб-аар тусгаарласан UTF-8 BOM текст (тендер §103). */
async function ExportText({ LogedUser, Filter }) {
  const { headers, rows, provenance } = await BuildExport({ LogedUser, Filter });
  const filePath = BaseControllerHelper.ExportFilePath('DoctorExamReport', 'txt');

  const Lines = provenance
    .concat([''])
    .concat([headers.join('\t')])
    .concat(rows.map((r) => r.map((v) => String(v === null ? '' : v)).join('\t')));

  require('fs').writeFileSync(path.resolve(filePath), '﻿' + Lines.join('\r\n'), 'utf8');
  return { filePath };
}

module.exports = {
  COLUMNS,
  GetData,
  ExportExcel,
  ExportText,
  // Exported for /api/doctor/reports/summary/export, which renders the same
  // headers, rows and provenance block through helper/Export.js. Sharing this
  // is what stops the mobile download and the web download disagreeing about
  // the numbers.
  BuildExport,
  BuildProvenance,
};
