import { useTranslation } from "react-i18next";
import React from "react";
// TODO: DevExtreme not installed
// // TODO: DevExtreme not installed
// import SelectBox from "devextreme-react/select-box";
import useBaseTimeSelectBox from "./useBaseTimeSelectBox";

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
  ...rest
}) => {
  const { t } = useTranslation();
  return (
    <FormControl variant="outlined" style={{ width: width }}>
      <InputLabel>{placeholder}</InputLabel>
      <Select
        value={value}
        onChange={(e) => onValueChanged({ value: e.target.value })}
        input={<OutlinedInput label={placeholder} />}
        {...rest}
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

export default ({ hourOnly, ...props }) => {
  const { minut, hour, hours, minuts, setHour, setMinut, Config } =
    useBaseTimeSelectBox(props);
  const timeConfig = Config && Config.timeConfig ? Config.timeConfig : {};
  const minutConfig = Config && Config.minutConfig ? Config.minutConfig : {};

  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <SelectBox
        width={hourOnly ? "100%" : "49%"}
        onValueChanged={({ value }) => setHour(value)}
        value={hour}
        dataSource={hours}
        displayExpr="id"
        valueExpr="id"
        placeholder="Цаг"
        {...timeConfig}
      />
      {!hourOnly ? (
        <SelectBox
          width={"49%"}
          onValueChanged={({ value }) => setMinut(value)}
          value={minut}
          dataSource={minuts}
          displayExpr="id"
          valueExpr="id"
          placeholder="Минут"
          {...minutConfig}
        />
      ) : null}
    </div>
  );
};
