const ExcelJS = require('exceljs');

module.exports.ExcelJS = ExcelJS;

module.exports.dataTypes = {
  number: 'number',
  date: 'date',
  datetime: 'datetime',
  string: 'string',
};

const exampleConfig = {
  name: { col: 0, type: this.dataTypes.string },
  age: { col: 1, type: this.dataTypes.number },
  code: { col: 2, type: this.dataTypes.string },
};

module.exports.getExcelData = ({ config, data }) => {
  const excelData = [];
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const excelRow = [];
    if (!config) {
      Object.keys(row).map((field, i) => {
        excelRow[i] = row[field];
      });
    } else {
      Object.keys(row).map((field) => {
        excelRow[config[field].col] = row[field];
      });
    }
    excelData.push(excelRow);
  }

  return excelData;
};
