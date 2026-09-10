import { useTranslation } from "react-i18next";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { IconButton, InputAdornment, Popover, TextField } from "@mui/material";

import Helper from "helper";

export default function DateTime(props) {
  const { t } = useTranslation();
  const {
    Value = "",
    Label = "",
    FullWidth,
    minDate,
    maxDate,
    dateFormat = "yyyy-MM-dd",
    ChangeValue,
    Variant = "standard",
    Sx,
    InputProps,
    Disabled = false,
    Id = null,
    AriaLabel = null,
  } = props;

  const normalizedFormat = (dateFormat || "yyyy-MM-dd")
    .replace(/YYYY/g, "yyyy")
    .replace(/YY/g, "yy")
    .replace(/DD/g, "dd");

  const displayValue = useMemo(() => {
    if (!Value) return "";
    return Value;
  }, [Value]);

  const [currentValue, setCurrentValue] = useState(
    Value ? new Date(Value) : null,
  );

  const [anchorEl, setAnchorEl] = useState(null);
  const prevValueRef = useRef(Value);

  useEffect(() => {
    const prevFormatted = prevValueRef.current
      ? Helper.ObjectHelper.getDateYMD({ Date: new Date(prevValueRef.current) })
      : null;

    const newFormatted = Value
      ? Helper.ObjectHelper.getDateYMD({ Date: new Date(Value) })
      : null;

    if (newFormatted !== prevFormatted) {
      // Sync external Value prop changes to internal state

      setCurrentValue(Value ? new Date(Value) : null);
      prevValueRef.current = Value;
    }
  }, [Value]);

  const handleChange = (newValue) => {
    if (newValue) {
      const formatted = Helper.ObjectHelper.getDateYMD({ Date: newValue });
      setCurrentValue(newValue);
      ChangeValue && ChangeValue(formatted);
    }
  };

  const handleManualChange = (e) => {
    const next = e?.target?.value ?? "";
    if (next === "") {
      setCurrentValue(null);
      ChangeValue && ChangeValue("");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(next)) return;
    const parsed = new Date(next);
    if (Number.isNaN(parsed.getTime())) return;
    const formatted = Helper.ObjectHelper.getDateYMD({ Date: parsed });
    setCurrentValue(parsed);
    ChangeValue && ChangeValue(formatted);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <>
        <TextField
          id={Id || undefined}
          label={Label ? Label : undefined}
          inputProps={{
            "aria-label": !Label && AriaLabel ? AriaLabel : undefined,
          }}
          value={displayValue}
          onChange={handleManualChange}
          size="small"
          variant={Variant}
          disabled={Disabled}
          fullWidth={FullWidth ? FullWidth : false}
          placeholder={normalizedFormat}
          sx={{
            width: FullWidth ? "100%" : "126px",
            backgroundColor: "#fff",
            "& .MuiInput-underline:before": {
              borderBottomColor: "#D2D2D2 !important",
              borderBottomWidth: "1px !important",
            },
            "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
              borderBottomColor: "#D2D2D2 !important",
              borderBottomWidth: "1px !important",
            },
            "& .MuiInput-underline:after": { borderBottomColor: "#9c27b0" },
            "& .MuiInputBase-root": {
              minHeight: "32px !important",
              height: "32px !important",
            },
            "& .MuiOutlinedInput-root": {
              alignItems: "center",
              paddingRight: "2px !important",
              borderRadius: "0",
            },
            "& .MuiInputAdornment-root": {
              marginLeft: "0px !important",
            },
            "& .MuiIconButton-root": {
              padding: "4px !important",
            },
            "& .MuiInputBase-input": {
              fontSize: "14px !important",
              height: "100% !important",
              boxSizing: "border-box",
              padding: "6px 4px !important",
              lineHeight: "1.42857",
            },
            "& .MuiOutlinedInput-input": {
              fontSize: "14px !important",
              height: "100% !important",
              boxSizing: "border-box",
              padding: "6px 4px !important",
              lineHeight: "1.42857",
            },
            ...Sx,
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  aria-label={t("Open calendar")}
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                >
                  <CalendarMonthIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
            ...InputProps,
          }}
        />
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <DateCalendar
            value={currentValue}
            onChange={(v) => {
              handleChange(v);
              setAnchorEl(null);
            }}
            minDate={minDate ? new Date(minDate) : undefined}
            maxDate={maxDate ? new Date(maxDate) : undefined}
          />
        </Popover>
      </>
    </LocalizationProvider>
  );
}
