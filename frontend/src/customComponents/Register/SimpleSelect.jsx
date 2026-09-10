import React, { useState } from "react";

import { FormControl, MenuItem, Select } from "@mui/material";

import { grayColor } from "assets/jss/material-dashboard-pro-react.js";
import { useTranslation } from "react-i18next";

export default function SimpleSelect(props) {
  const { t } = useTranslation();
  const { Data = [], Value = "", ChangeValue, disabled = false } = props;

  const formControlSx = {
    minWidth: "80px",
    backgroundColor: "#FFF",
    "& > div": {
      "&:before": {
        borderBottomWidth: "1px !important",
        borderBottomColor: "#D2D2D2 !important",
      },
      "&:after": { borderBottomColor: "#9c27b0 !important" },
    },
  };

  const selectSx = {
    "& .MuiSelect-select": {
      padding: "12px 0 7px",
      fontSize: "14px",
      fontWeight: "400",
      lineHeight: "1.42857",
      textDecoration: "none",
      color: grayColor[14],
      letterSpacing: "0",
    },
    "& .MuiSelect-icon": {
      transition: "all 300ms linear",
    },
    "& .MuiSelect-iconOpen": {
      transform: "rotate(180deg)",
    },
  };

  const menuPaperSx = {
    backgroundColor: "#FFF",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    borderRadius: "4px",
    maxHeight: "266px !important",
  };

  const menuListSx = {
    border: "0",
    padding: "5px 0",
    margin: "0",
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
  };

  const menuItemSx = {
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
    "&:hover": { backgroundColor: "#999999", color: "#FFF" },
    "&.Mui-selected": {
      backgroundColor: "#f4f4f4",
      color: "#000",
      "&:hover": { backgroundColor: "#e0e0e0" },
    },
  };

  const [currentValue, setCurrentValue] = useState(Value);

  const GetMenuItem = () => {
    var MenuItems = [];
    if (Data && Array.isArray(Data) && Data.length > 0) {
      for (var i = 0; i < Data.length; i++) {
        MenuItems.push(
          <MenuItem
            key={"Item" + i}
            value={Data[i]["id_data"] + ""}
            sx={menuItemSx}
          >
            {t(Data[i]["name"] + "")}
          </MenuItem>,
        );
      }
    }
    return MenuItems;
  };

  return (
    <FormControl fullWidth sx={formControlSx} variant="standard" size="small">
      <Select
        disabled={disabled}
        sx={selectSx}
        MenuProps={{
          PaperProps: { sx: menuPaperSx },
          MenuListProps: { sx: menuListSx },
        }}
        value={currentValue}
        onChange={(event) => {
          const value = event.target.value;
          setCurrentValue(value);
          ChangeValue && ChangeValue(value);
        }}
      >
        {GetMenuItem()}
      </Select>
    </FormControl>
  );
}
