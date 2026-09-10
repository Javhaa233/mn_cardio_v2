import i18n from "i18n";
import Excel from "exceljs";
import { getValue } from "utils/helper";

export const loadSheets = (file, callBack) => {
  if (file) {
    const wb = new Excel.Workbook();
    const reader = new FileReader();

    reader.readAsArrayBuffer(file);
    reader.onload = () => {
      const buffer = reader.result;
      wb.xlsx.load(buffer).then((workbook) => {
        const loadSheets = [];
        workbook.eachSheet((sheet, id) => {
          loadSheets.push(sheet.name);
        });
        callBack && callBack(loadSheets);
      });
    };
  } else {
    callBack && callBack([]);
  }
};

const getCellValue = ({ ws, config, rowNumber }) => {
  if (config.cell) {
    let value = ws.getCell(config.cell[0], config.cell[1]).text;
    if (config.dataType === Number) {
      value = Number(value);
    }
    return config.getValue ? config.getValue(value) : value;
  }
  if (rowNumber && config.col) {
    let value = ws.getCell(rowNumber, config.col).text;
    if (config.dataType === Number) {
      value = Number(value);
    }
    return config.getValue ? config.getValue(value) : value;
  }
  return "";
};

export const loadDataByConfig = ({ ws, config }) => {
  const data = {
    details: [],
  };
  for (let i = 0; i < Object.keys(config).length; i++) {
    const key = Object.keys(config)[i];
    if (key === "details") continue;
    data[key] = getCellValue({ ws, config: config[key] });
  }

  if (config.details && config.details.startRow && config.details.fields) {
    let rowNumber = Number(config.details.startRow);

    while (true) {
      const row = {};
      for (let i = 0; i < Object.keys(config.details.fields).length; i++) {
        const key = Object.keys(config.details.fields)[i];
        if (key.indexOf(".") !== -1) {
          if (row[key.split(".")[0]] === undefined) {
            row[key.split(".")[0]] = {};
          }
          row[key.split(".")[0]][key.split(".")[1]] = getCellValue({
            ws,
            config: config.details.fields[key],
            rowNumber,
          });
        } else {
          row[key] = getCellValue({
            ws,
            config: config.details.fields[key],
            rowNumber,
          });
        }
      }
      //console.log(getValue(row, config.details.requiredField));

      if (
        getValue(row, config.details.requiredField) != null &&
        getValue(row, config.details.requiredField) !== ""
      ) {
        data.details.push(row);

        rowNumber++;
      } else {
        break;
      }
    }
  }
  return data;
};

// const loadData = () => {

//   if (!sheet) {
//     setExcelData([]);
//     return;
//   }

//   const wb = new Excel.Workbook();
//   const reader = new FileReader();
//   reader.readAsArrayBuffer(file);
//   reader.onload = () => {
//     const buffer = reader.result;
//     wb.xlsx.load(buffer).then((workbook) => {
//       const loadData = [];
//       let headers = null;
//       const ws = workbook.getWorksheet(sheet);
//       let columnToFields = {};
//       ws.eachRow((row, rowIndex) => {
//         if (!headers) {
//           headers = row.values;
//           columnToFields = getColumnToFields(headers);
//         } else {
//           const rowData = {};
//           row.values.forEach((value, index) => {
//             if (columnToFields[index]) {
//               if (columnToFields[index].indexOf(".") === -1) {
//                 rowData[columnToFields[index]] = value;
//               } else {
//                 if (rowData[columnToFields[index].split(".")[0]]) {
//                   rowData[columnToFields[index].split(".")[0]][
//                     columnToFields[index].split(".")[1]
//                   ] = value;
//                 } else {
//                   rowData[columnToFields[index].split(".")[0]] = {
//                     [columnToFields[index].split(".")[1]]: value,
//                   };
//                 }
//               }
//             }
//           });
//           loadData.push(rowData);
//         }
//       });
//       setExcelData(loadData);
//     });
//   };
// };
