import i18n from "i18n";

import lodash from "lodash";

export const getValue = (obj, fieldName) => {
  try {
    const val = lodash.get(obj, fieldName);
    if (val === undefined) {
      return null;
    }
    return val;
  } catch (ex) {
    return null;
  }
};

export const sleep = async (msec) => {
  return new Promise((resolve) => setTimeout(resolve, msec));
};

export const getFileSrc = async (file) => {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const numberFormat = (value, number) => {
  return value && value.toFixed
    ? value
        .toFixed(number ? parseInt(number) : 2)
        .replace(/\d(?=(\d{3})+\.)/g, "$&,")
    : "0";
};

export const sumFormat = (data) => {
  return `${numberFormat(data.value)}`;
};

export const countFormat = (data) => {
  return `Нийт: ${numberFormat(data.value)} ш`;
};

export const dateFormat = (dateStr) => {
  if (dateStr) {
    return new Date(dateStr)
      .toISOString()
      .replace(/Z/g, "")
      .replace(/T/g, " ")
      .replace(".000", "");
  }
  return "";
};

export const getFilterArrayByObject = ({
  filterData,
  joinOperator,
  fieldOperator,
}) => {
  const filter = [];
  if (filterData) {
    Object.keys(filterData).forEach((key) => {
      if (filterData[key]) {
        if (filter.length > 0) {
          filter.push(joinOperator);
        }
        const op =
          fieldOperator && fieldOperator[key] ? fieldOperator[key] : "=";
        filter.push([key, op, filterData[key]]);
      }
    });
  }

  return filter;
};

export const sum = (arr, field) => {
  return arr.reduce((a, b) => a + Number(b[field]), 0);
};
