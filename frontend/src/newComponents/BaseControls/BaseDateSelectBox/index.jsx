import React from "react";
// TODO: DevExtreme not installed
// // TODO: DevExtreme not installed
// import SelectBox from "devextreme-react/select-box";
import useBaseDateSelectBox from "./useBaseDateSelectBox";

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  OutlinedInput,
} from "@mui/material";

const SelectBox = ({
  value,
  dataSource,
  displayExpr,
  valueExpr,
  placeholder,
  onValueChanged,
  width,
}) => {
  return (
    <FormControl variant="outlined" style={{ width: width }}>
      <InputLabel>{placeholder}</InputLabel>
      <Select
        value={value}
        onChange={(e) => onValueChanged({ value: e.target.value })}
        input={<OutlinedInput label={placeholder} />}
      >
        {dataSource.map((item, index) => (
          <MenuItem key={index} value={item[valueExpr]}>
            {item[displayExpr]}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default (props) => {
  const { year, month, day, days, setYear, setMonth, setDay, years, months } =
    useBaseDateSelectBox(props);

  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <SelectBox
        width={"32%"}
        onValueChanged={({ value }) => setYear(value)}
        value={year}
        dataSource={years}
        displayExpr="year"
        valueExpr="year"
        placeholder="Жил"
      />
      <SelectBox
        width={"32%"}
        onValueChanged={({ value }) => setMonth(value)}
        value={month}
        dataSource={months}
        displayExpr="month"
        valueExpr="month"
        placeholder="Сар"
      />
      <SelectBox
        width={"32%"}
        onValueChanged={({ value }) => setDay(value)}
        value={day}
        dataSource={days}
        displayExpr="day"
        valueExpr="day"
        placeholder="Өдөр"
      />
    </div>
  );
};
