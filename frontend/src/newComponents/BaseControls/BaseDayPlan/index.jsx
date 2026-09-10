// DevExtreme stub components (package not installed)
const SelectBox = ({ children, ...props }) => (
  <div>SelectBox not available</div>
);
const TagBox = ({ children, ...props }) => <div>TagBox not available</div>;

import React from "react";
// translation
import { useTranslation } from "react-i18next";

// TODO: DevExtreme not installed
// // TODO: DevExtreme not installed
// import TagBox from "devextreme-react/tag-box";
// TODO: DevExtreme not installed
// // TODO: DevExtreme not installed
// import SelectBox from "devextreme-react/select-box";

import useInput from "newComponents/BaseControls/useInput";

export const WeekDays = [
  { id: 1, text: "Даваа" },
  { id: 2, text: "Мягмар" },
  { id: 3, text: "Лхагва" },
  { id: 4, text: "Пүрэв" },
  { id: 5, text: "Баасан" },
  { id: 6, text: "Бямба" },
  { id: 7, text: "Ням" },
];

export const Days = [
  { id: 1, text: "1" },
  { id: 2, text: "2" },
  { id: 3, text: "3" },
  { id: 4, text: "4" },
  { id: 5, text: "5" },
  { id: 6, text: "6" },
  { id: 7, text: "7" },
  { id: 8, text: "8" },
  { id: 9, text: "9" },
  { id: 10, text: "10" },
  { id: 11, text: "11" },
  { id: 12, text: "12" },
  { id: 13, text: "13" },
  { id: 14, text: "14" },
  { id: 15, text: "15" },
  { id: 16, text: "16" },
  { id: 17, text: "17" },
  { id: 18, text: "18" },
  { id: 19, text: "19" },
  { id: 20, text: "20" },
  { id: 21, text: "21" },
  { id: 22, text: "22" },
  { id: 23, text: "23" },
  { id: 24, text: "24" },
  { id: 25, text: "25" },
  { id: 26, text: "26" },
  { id: 27, text: "27" },
  { id: 28, text: "28" },
  { id: 29, text: "29" },
  { id: 30, text: "30" },
  { id: 31, text: "31" },
];

export const dsEPriceTypeParkingDate = [
  { id: 0, name: "Сар бүрийн" },
  { id: 1, name: "Долоо хоног бүрийн" },
  { id: 2, name: "Өдөр бүр" },
];

export default ({ dataSource, ...props }) => {
  const { t } = useTranslation();

  const { value, changeValue } = useInput(props);
  const { priceTypeParkingDate, days, weekDays } = value
    ? value
    : { riceTypeParkingDate: 2, days: [], weekDays: [] };

  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: "48%", marginRight: "10px" }}>
        <SelectBox
          placeholder={t("-- Select --")}
          value={priceTypeParkingDate}
          stylingMode="outlined"
          showClearButton
          dataSource={dsEPriceTypeParkingDate}
          onValueChanged={(v) => {
            changeValue({
              priceTypeParkingDate: v.value,
              weekDays: [],
              days: [],
            });
          }}
          searchEnabled={true}
          searchMode="contains"
          displayExpr={"name"}
          valueExpr="id"
        ></SelectBox>
      </div>
      <div style={{ width: "42%" }}>
        {priceTypeParkingDate === 0 ? (
          <TagBox
            placeholder={t("-- Select --")}
            dataSource={
              Array.isArray(Days)
                ? Days.map((s) => ({
                    ...s,
                    text: s.text + " өдөр",
                  }))
                : []
            }
            displayExpr="text"
            valueExpr="id"
            value={days}
            showSelectionControls={true}
            onValueChanged={(v) => {
              changeValue({ ...value, days: v.value });
            }}
          ></TagBox>
        ) : null}
        {priceTypeParkingDate === 1 ? (
          <TagBox
            placeholder={t("-- Select --")}
            dataSource={WeekDays}
            displayExpr="text"
            valueExpr="id"
            value={weekDays}
            showSelectionControls={true}
            onValueChanged={(v) => {
              changeValue({ ...value, weekDays: v.value });
            }}
          ></TagBox>
        ) : null}
      </div>
    </div>
  );
};
