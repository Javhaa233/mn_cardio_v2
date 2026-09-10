import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FormControl, MenuItem, Select, InputLabel } from "@mui/material";

import { grayColor } from "assets/jss/material-dashboard-pro-react.js";

const selectFormControlSx = {
  minWidth: "80px",
  backgroundColor: "#FFF",
};

const selectSx = {
  padding: "6px 0 6px",
  fontSize: "14px",
  fontWeight: "400",
  lineHeight: "1.42857",
  textDecoration: "none",
  color: grayColor[14],
  letterSpacing: "0",
  "&:focus": { backgroundColor: "transparent" },
  "&[aria-owns] + input + svg": { transform: "rotate(180deg)" },
  "& + input + svg": { transition: "all 300ms linear" },
};

const selectMenuItemSx = {
  fontSize: "14px",
  padding: "4px 8px",
  margin: "0 5px",
  borderRadius: "2px",
  transition: "all 150ms linear",
  display: "block",
  clear: "both",
  fontWeight: "400",
  lineHeight: "2",
  whiteSpace: "nowrap",
  color: "#333",
  paddingRight: "30px",
  "&:hover": { backgroundColor: "#999", color: "#FFF" },
};

export default function SimpleSelect(props) {
  const { t } = useTranslation();
  const {
    Data = [],
    PlaceHolder = null,
    disabled = false,
    ChangeValue,
    Value = "",
  } = props;

  const [currentValue, setCurrentValue] = useState(Value || "");

  const GetMenuItem = () => {
    var MenuItems = [];
    if (Data) {
      for (var i = 0; i < Data.length; i++) {
        MenuItems.push(
          <MenuItem
            key={"Item" + i}
            value={Data[i]["id_data"] + ""}
            sx={selectMenuItemSx}
          >
            {t(Data[i]["name"] + "")}
          </MenuItem>,
        );
      }
    }
    return MenuItems;
  };

  return (
    <FormControl
      fullWidth
      sx={selectFormControlSx}
      variant="outlined"
      size="small"
    >
      {PlaceHolder ? (
        <InputLabel sx={{ paddingLeft: "18px" }}>{PlaceHolder}</InputLabel>
      ) : null}
      <Select
        disabled={disabled}
        MenuProps={{
          PaperProps: {
            sx: {
              "& .MuiMenu-list": {
                border: 0,
                padding: "5px 0",
                margin: 0,
                boxShadow: "none",
                minWidth: "100%",
                borderRadius: "4px",
                boxSizing: "border-box",
                display: "block",
                fontSize: "14px",
                textAlign: "left",
                listStyle: "none",
                backgroundColor: "#FFF",
                backgroundClip: "padding-box",
              },
              "& .MuiMenu-paper": {
                maxHeight: "266px !important",
              },
            },
          },
        }}
        sx={{
          "& .MuiSelect-select": selectSx,
          "& .MuiOutlinedInput-input": { paddingLeft: "18px" },
        }}
        value={currentValue || ""}
        onChange={(event) => {
          const value = event.target.value;
          ChangeValue && ChangeValue(value);
          setCurrentValue(value);
        }}
        label={PlaceHolder}
      >
        <MenuItem value={""} sx={selectMenuItemSx}>
          <em>{t("-- Select --")}</em>
        </MenuItem>
        {GetMenuItem()}
      </Select>
    </FormControl>
  );
}
