import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { FormControl, MenuItem, Select, InputLabel } from "@mui/material";
import { colors } from "@/theme/colors";
import { elevation } from "@/theme/tokens";

export default function SimpleSelect(props) {
  const { t } = useTranslation();
  const { Value = "", Label, Data = [], ChangeValue, disabled } = props;

  const formControlSx = {
    minWidth: "80px",
    backgroundColor: colors.brand.surface,
  };

  const selectSx = {
    "& .MuiSelect-select": {
      padding: "12px 0 7px",
      fontSize: "14px",
      fontWeight: "400",
      lineHeight: "1.42857",
      textDecoration: "none",
      color: colors.brand.ink,
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
    backgroundColor: colors.brand.surface,
    boxShadow: elevation[3],
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
    backgroundColor: colors.brand.surface,
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
    color: colors.brand.ink,
    paddingRight: "30px",
    "&:hover": { backgroundColor: colors.brand.tint, color: colors.brand.ink },
    "&.Mui-selected": {
      backgroundColor: colors.brand.tintSolid,
      color: colors.brand.cyanInk,
      "&:hover": { backgroundColor: colors.brand.tintSolidHover },
    },
  };

  const [currentValue, setCurrentValue] = useState(Value);

  const GetMenuItem = () => {
    let MenuItems = [];
    if (Data) {
      for (let i = 0; i < Data.length; i++) {
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
      <InputLabel id="demo-simple-select-label">{t(Label + "")}</InputLabel>
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
