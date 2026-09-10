const path = require('path');
const db = require('../../config/DB');
const { ExcelJS, getExcelData } = require('../../helper/excel');

module.exports.getData = async ({
  StartDate,
  EndDate,
  UserId,
  OrganizationId,
  ProvinceCityId,
  SoumDistrictId,
  Offset,
  Limit,
}) => {
  const result = { success: true, message: 'Амжилттай', data: [] };
  try {
    const [data] = await db.execProcedure('spCVDMonitoringReportSoum', {
      StartDate,
      EndDate,
      UserId,
      OrganizationId,
      ProvinceCityId,
      SoumDistrictId,
      Offset,
      Limit,
    });
    result.data = data;
    return result;
  } catch (ex) {
    console.error(ex);
    return {
      success: false,
      message: 'Тайлан татах явцад алдаа гарлаа',
    };
  }
};

module.exports.getExcelFile = async ({ data }) => {
  const result = { success: true, message: 'Амжилттай', data: null };
  try {
    const filePath = 'outputExcel/Soum1.xlsx';
    const workBook = new ExcelJS.Workbook();
    workBook = await workBook.xlsx.readFile('inputExcel/Soum1.xlsx');
    const newWorkSheet = workBook.getWorksheet('Sheet1');
    const excelData = getExcelData({
      config: {
        OrganizationName: { col: 1 },
        genderM: { col: 2 },
        genderF: { col: 3 },
        ageLt40: { col: 4 },
        ageGte40: { col: 5 },

        patCnt: { col: 6 },
        zurkhShigdees: { col: 7 },
        buurniiArhagUwchin: { col: 8 },
        riskGte30: { col: 9 },
        riskLt30: { col: 10 },
        isDaraltEm: { col: 12 },
        tsusniiSahar: { col: 13 },
      },
      data,
    });

    newWorkSheet.addRows(excelData);
    await workBook.xlsx.writeFile(path.resolve(filePath));
    result.data = filePath;
    return result;
  } catch (ex) {
    console.error(ex);
    return {
      success: false,
      message: 'Файл үүсгэх явцад алдаа гарлаа',
    };
  }
};
