import React, { useState, useEffect } from "react";
// translation
import { useTranslation } from "react-i18next";

import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";

import { FIELD } from "customComponents/BaseEditControls/fieldRowStyles";
import { colors } from "@/theme/colors";
import { radius, elevation } from "@/theme/tokens";

export default function SimpleSelect(props) {
  const { t } = useTranslation();
  const {
    Config = {},
    ChangeValue,
    Value: PropValue,
    defaultValueLabel = "-- Select --",
    Label = "",
    HideLabel = false,
    DefaultValueDisable = false,
    FullWidth = false,
    Variant = "standard",
    disabled = false,
    Sx,
    Width = "100px",
    LeftLabel = "",
    LabelId = null,
    AriaLabel = null,
  } = props;

  // Only a select drawn beside its own inline label sits in the flex row below.
  const HasInlineLabel = !!(
    LeftLabel ||
    (!HideLabel && (Label || Config?.Label))
  );

  const formControlSx = {
    width: FullWidth ? "100%" : Width,
    minWidth: "80px",
    height: "28px !important",
    maxHeight: "28px !important",
    backgroundColor: FIELD.inputBg,
    // Beside an inline label, a FullWidth select takes the rest of the row;
    // width 100% alone let the flex row shrink it to its content. Without a
    // label the caller owns the width (AnalyticsRail keeps it compact).
    ...(FullWidth && HasInlineLabel ? { flex: "1 1 auto", minWidth: 0 } : null),
    ...(Variant === "outlined" ? { mt: "0px !important" } : null),
    ...Sx,
  };

  const inputLabelSx = {
    backgroundColor: FIELD.inputBg,
    padding: "0 4px",
    lineHeight: 1.1,
    zIndex: 1,
    ...(Variant === "outlined"
      ? {
          transform: "translate(12px, 6px) scale(1)",
          "&.MuiInputLabel-shrink": {
            transform: "translate(12px, -9px) scale(0.85)",
            top: "0px",
          },
        }
      : null),
  };

  const selectSx = {
    height: "28px !important",
    minHeight: "28px !important",
    maxHeight: "28px !important",
    boxSizing: "border-box",
    "& .MuiSelect-select": {
      padding: "4px 24px 4px 8px !important",
      fontSize: "12px !important",
      fontWeight: "400",
      lineHeight: "1.5",
      textDecoration: "none",
      color: FIELD.valueInk,
      letterSpacing: "0",
      height: "auto !important",
      minHeight: "unset !important",
      display: "flex",
      alignItems: "center",
      boxSizing: "border-box",
    },
    "& .MuiSelect-icon": {
      transition: "all 300ms linear",
      pointerEvents: "none",
      cursor: "pointer",
      top: "50%",
      transform: "translateY(-50%)",
    },
    "& .MuiSelect-iconOpen": {
      transform: "translateY(-50%) rotate(180deg)",
    },
    ...(Variant === "outlined"
      ? {
          "& .MuiOutlinedInput-input": { paddingLeft: "8px" },
        }
      : null),
    width: "100%",
    "&:before": { borderBottom: "none !important" },
    "&:after": { borderBottom: "none !important" },
    "&:hover:not(.Mui-disabled):before": {
      borderBottom: "none !important",
    },
    border: `1px solid ${FIELD.rowBorder}`,
    borderRadius: radius.xs,
    "&.Mui-disabled": { backgroundColor: FIELD.disabledBg },
    "&:hover": {
      border: `1px solid ${FIELD.inputBorderHover}`,
    },
    "&.Mui-focused": {
      border: `1px solid ${FIELD.inputBorderFocus}`,
    },
    ...Sx,
  };

  const menuPaperSx = {
    backgroundColor: colors.brand.surface,
    boxShadow: elevation[3],
    border: `1px solid ${colors.brand.hairline}`,
    borderRadius: radius.sm,
    maxHeight: "266px !important",
  };

  const menuListSx = {
    border: "0",
    padding: "5px 0",
    margin: "0",
    boxShadow: "none",
    minWidth: "100%",
    borderRadius: radius.sm,
    boxSizing: "border-box",
    display: "block",
    fontSize: "12px",
    textAlign: "left",
    listStyle: "none",
    backgroundColor: colors.brand.surface,
    backgroundClip: "padding-box",
  };

  const menuItemSx = {
    fontSize: "12px",
    padding: "4px 8px",
    margin: "0 5px",
    borderRadius: radius.xs,
    transition: "all 150ms linear",
    display: "block",
    clear: "both",
    fontWeight: "400",
    lineHeight: "1.8",
    whiteSpace: "nowrap",
    color: colors.brand.ink,
    paddingRight: "30px",
    // Was a #999 fill with white text on hover - the template's dropdown.
    "&:hover": { backgroundColor: colors.brand.tint, color: colors.brand.ink },
    "&.Mui-selected": {
      backgroundColor: colors.brand.tintSolid,
      color: colors.brand.cyanInk,
      fontWeight: 600,
      "&:hover": { backgroundColor: colors.brand.tintSolidHover },
    },
  };

  // state
  const [Value, setValue] = useState(PropValue ?? Config?.Value ?? "-1");

  const NewValue = Config?.NewValue ?? null;

  // Sync internal state with external props when they change
  // This is intentional to support both controlled and uncontrolled usage
  useEffect(() => {
    if (NewValue != null) {
      const safeValue = NewValue ?? "-1";
      setValue(safeValue);
      ChangeValue && ChangeValue(safeValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [NewValue]);

  useEffect(() => {
    if (PropValue != null) {
      setValue(PropValue);
    }
  }, [PropValue]);

  const handleChange = (event) => {
    const newValue = event?.target?.value != null ? event.target.value : "-1";
    setValue(newValue);
    ChangeValue && ChangeValue(newValue);
  };

  const GetMenuItem = () => {
    var MenuItems = [];
    if (Config && Config.Data) {
      for (var i = 0; i < Config.Data.length; i++) {
        MenuItems.push(
          <MenuItem
            key={"Item" + i}
            value={Config.Data[i][Config.Config.IdField] + ""}
            sx={menuItemSx}
          >
            {t(Config.Data[i][Config.Config.TextField] + "")}
          </MenuItem>,
        );
      }
    }
    return MenuItems;
  };

  const displayLabel = Label || Config?.Label;
  const labelString = displayLabel ? t(displayLabel + "") : undefined;

  // Label is always rendered inline (in front of select), not as a floating InputLabel
  const GetLabel = () => null;

  const GetDefaultValue = () => {
    return (
      <MenuItem value="-1" sx={menuItemSx} disabled={DefaultValueDisable}>
        {t(defaultValueLabel + "")}
      </MenuItem>
    );
  };

  const select = (
    <FormControl
      fullWidth={FullWidth}
      sx={formControlSx}
      variant={Variant}
      size="small"
    >
      {GetLabel()}
      <Select
        labelId={LabelId || undefined}
        aria-label={LabelId ? undefined : AriaLabel || undefined}
        disabled={disabled}
        sx={selectSx}
        label={undefined}
        MenuProps={{
          PaperProps: { sx: menuPaperSx },
          MenuListProps: { sx: menuListSx },
        }}
        value={Value != null ? Value : "-1"}
        onChange={(event) => handleChange(event)}
      >
        {GetDefaultValue()}
        {GetMenuItem()}
      </Select>
    </FormControl>
  );

  const inlineLabel = LeftLabel || (!HideLabel && displayLabel);
  const inlineLabelText = LeftLabel ? t(LeftLabel + "") : labelString;

  if (inlineLabel && inlineLabelText) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          ...(FullWidth ? { width: "100%" } : null),
        }}
      >
        <span
          style={{
            fontSize: "12px",
            fontWeight: "400",
            color: FIELD.labelInk,
            whiteSpace: "nowrap",
            lineHeight: 1.42857,
          }}
        >
          {inlineLabelText}
        </span>
        {select}
      </div>
    );
  }

  return select;
}
