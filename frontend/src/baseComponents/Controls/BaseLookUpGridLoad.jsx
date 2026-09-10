import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import {
  Popper,
  TextField,
  IconButton,
  ClickAwayListener,
  FormLabel,
  Box,
  Grow,
} from "@mui/material";
// @mui/icons-material
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import CloseIcon from "@mui/icons-material/Close";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import BaseGrid from "baseComponents/BaseGrid/BaseLookUpGrid";
// helper
import Helper from "helper";

import styles from "assets/jss/material-dashboard-pro-react/custom/baseControlsStyles";
import { grayColor } from "assets/jss/material-dashboard-pro-react.js";

export default function BaseLookUpGridLoad(props) {
  const { t } = useTranslation();
  const generatedId = React.useId();
  const {
    Config = { Value: null, Config: {} },
    ChangeValue,
    WithLabel = false,
    Value = null,
    InitialText = "",
    md = 4.8,
    readOnly = false,
    disabled = false,
    LabelWidth,
    height = 28,
    borderColor = "#eee",
    Id = null,
    LabelledBy = null,
  } = props;

  const effectiveMd = LabelWidth ? (LabelWidth / 100) * 12 : md;

  // MUI TextField forwards `id` to the underlying <input>, so this is what
  // the <label htmlFor> points at.
  const inputId = Id || generatedId;

  const inputRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentValue, setCurrentValue] = useState(
    Value !== null ? Value : Config?.Value || null,
  );
  const [Text, setText] = useState(InitialText || Config?.InitialText || "");
  const [FilterText, setFilterText] = useState("");
  const [Data, setData] = useState([]);

  const SearchOption = Helper.BaseCrudHelper.GetSearchOption();
  const DataFilter = useMemo(
    () => Config?.DataFilter || [],
    [Config?.DataFilter],
  );
  const timeoutRef = useRef(null);

  const textFieldSx = {
    width: "100%",
    "& .MuiOutlinedInput-root": {
      boxSizing: "border-box",
      padding: "0",
      alignItems: "center",
      "& fieldset": { border: "none" },
      "& .MuiOutlinedInput-notchedOutline": { top: "0" },
    },
    "& .MuiInputBase-input": {
      color: "#4a4a4a",
      backgroundColor: WithLabel ? "#ffffff" : "transparent",
      fontWeight: "400",
      fontSize: "11px !important",
      height: "auto !important",
      lineHeight: "1.5",
      boxSizing: "border-box",
      padding: "4px 28px 4px 6px !important",
      // 11px is below the 16px at which iOS Safari zooms the page on focus,
      // and this `!important` in an `sx` prop outranks both the theme's
      // coarse-pointer rule and the global backstop in index.jsx - so the
      // override has to be declared here, at the source. A browser probe
      // caught this control still at 11px after both of those were in place.
      "@media (pointer: coarse)": {
        fontSize: "16px !important",
        padding: "8px 28px 8px 8px !important",
      },
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      "&::placeholder": {
        color: "#6a6a6a",
        fontSize: "11px",
        opacity: "1",
      },
      "&.Mui-disabled": {
        color: "#4a4a4a",
        WebkitTextFillColor: "#4a4a4a",
        opacity: "1",
      },
    },
    "& legend": { display: "none" },
  };

  const labelHorizontalSx = {
    color: "#75736c",
    cursor: "pointer",
    display: "inline-flex",
    fontSize: "14px",
    lineHeight: "1.428571429",
    fontWeight: "400",
    paddingTop: "0",
    marginRight: "0",
    textAlign: "left",
  };

  /* -------------------------------------------------------
   * Helpers
   * ----------------------------------------------------- */

  const SearchData = useCallback(
    async (SearchText, customFilter = null) => {
      const Url = Config.Config.SearchUrl || "/BaseObject/";

      SearchOption.PageOption.Limit = 1000;
      SearchOption.FindType = "AllData";
      SearchOption.SearchField = [
        {
          Field: Config.Config.TextField,
          Value: SearchText,
          Op: "Contains",
        },
      ];

      const filterToUse = customFilter || DataFilter;
      filterToUse.forEach((f) => {
        SearchOption.SearchField.push({
          Field: f.Field,
          Value: f.Value,
          Op: f.Op || "Equals",
        });
      });

      const ReqData = Helper.BaseCrudHelper.GetRequestData(
        Config.Config.ObjectName,
        SearchOption,
      );

      await Helper.BaseCrudHelper.CallService(Url, ReqData, (res) => {
        setData(Array.isArray(res?.Data) ? res.Data : []);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      Config.Config.SearchUrl,
      Config.Config.TextField,
      Config.Config.ObjectName,
      DataFilter,
    ],
  );

  const onChangeValue = useCallback(
    (value) => {
      const val = value ? value[Config.Config.IdField] : null;
      setCurrentValue(val);
      setText(value ? value[Config.Config.TextField] : "");
      ChangeValue && ChangeValue(val);
    },
    [Config.Config.IdField, Config.Config.TextField, ChangeValue],
  );

  const ChangeText = (value) => {
    if (value === "") onChangeValue(null);
    setText(value);
    setFilterText(value);
  };

  const GetFilteredData = () => {
    let filtered = Data;
    DataFilter.forEach((f) => {
      filtered = filtered.filter((s) => s[f.Field] + "" === f.Value + "");
    });

    if (FilterText) {
      filtered = filtered.filter(
        (s) =>
          s[Config.Config.TextField] &&
          s[Config.Config.TextField]
            .toLowerCase()
            .includes(FilterText.toLowerCase()),
      );
    }
    return filtered;
  };

  /* -------------------------------------------------------
   * Effects
   * ----------------------------------------------------- */

  useEffect(() => {
    if (Value !== currentValue && Config?.Config?.IdField) {
      const filter = Value ? [{ Field: Config.Config.IdField, Value }] : null;
      SearchData("", filter);
      setCurrentValue(Value);
    }
  }, [Value, currentValue, Config.Config.IdField, SearchData]);

  useEffect(() => {
    if (Array.isArray(Data)) {
      const temp = Data.find(
        (s) => s[Config.Config.IdField] + "" === "" + currentValue,
      );
      if (temp) onChangeValue(temp);
    }
  }, [Data, Config.Config.IdField, currentValue, onChangeValue]);

  /* -------------------------------------------------------
   * Control
   * ----------------------------------------------------- */

  const renderControl = (hasBorder = true) => (
    <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
      <div style={{ width: "100%", margin: "0.1px" }}>
        <TextField
          id={inputId}
          fullWidth
          variant="outlined"
          size="small"
          inputProps={{ "aria-labelledby": LabelledBy || undefined }}
          inputRef={inputRef}
          value={Text}
          hiddenLabel
          label={undefined}
          InputLabelProps={{
            shrink: false,
          }}
          placeholder={
            !WithLabel ? t(Config?.Label || "") : Config?.placeholder || ""
          }
          onChange={(event) => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
            const val = event.target.value;
            timeoutRef.current = setTimeout(() => {
              SearchData(val);
            }, 800);
            ChangeText(val);
            setAnchorEl(inputRef.current);
          }}
          onClick={(event) => {
            if (!anchorEl && Data.length === 0) {
              SearchData("");
            }
            setAnchorEl(anchorEl ? null : inputRef.current);
          }}
          disabled={disabled}
          InputProps={{
            readOnly,
            endAdornment: (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                  position: "absolute",
                  right: 2,
                  top: 0,
                  pointerEvents: "auto",
                }}
              >
                {currentValue && (
                  <IconButton
                    disableRipple
                    size="small"
                    aria-label={t("Clear selection")}
                    sx={{ padding: "1px" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeValue(null);
                    }}
                  >
                    <CloseIcon sx={{ color: "#999", fontSize: "12px" }} />
                  </IconButton>
                )}
                <IconButton
                  disableRipple
                  size="small"
                  aria-label={t("Show list")}
                  sx={{ padding: "1px", ml: "-2px" }}
                >
                  {anchorEl ? (
                    <ArrowDropUpIcon sx={{ color: "#999", fontSize: "16px" }} />
                  ) : (
                    <ArrowDropDownIcon
                      sx={{ color: "#999", fontSize: "16px" }}
                    />
                  )}
                </IconButton>
              </Box>
            ),
          }}
          sx={{
            ...textFieldSx,
            "& .MuiOutlinedInput-root": {
              ...textFieldSx["& .MuiOutlinedInput-root"],
              "& fieldset": {
                ...(hasBorder
                  ? {
                      border: "1px solid #ccc",
                    }
                  : {
                      border: "none",
                    }),
              },
              "&:hover fieldset": {
                ...(hasBorder
                  ? {
                      border: "1px solid #4a4a4a",
                    }
                  : {
                      border: "none",
                    }),
              },
              "&.Mui-focused fieldset": {
                ...(hasBorder
                  ? {
                      border: "1px solid #4a4a4a",
                      borderWidth: "1px",
                    }
                  : {
                      border: "none",
                    }),
              },
            },
            "& legend": { display: "none" },
          }}
        />

        <Popper
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          placement="bottom-start"
          strategy="fixed"
          transition
          sx={{
            ...styles.popperRoot,
            minWidth: "min(600px, 90vw)",
            maxHeight: "70vh",
          }}
        >
          {({ TransitionProps }) => (
            <Grow {...TransitionProps}>
              <Box sx={{ maxHeight: 280, overflow: "auto" }}>
                <BaseGrid
                  Data={GetFilteredData()}
                  HideNumber
                  HideCheck
                  Fields={Config?.Config?.Fields || []}
                  SelectRow={(Id, Selected, Data) => {
                    onChangeValue(Data);
                    setAnchorEl(null);
                  }}
                />
              </Box>
            </Grow>
          )}
        </Popper>
      </div>
    </ClickAwayListener>
  );

  /* -------------------------------------------------------
   * Layout
   * ----------------------------------------------------- */

  if (!WithLabel) return renderControl(true);

  return (
    <GridContainer
      style={{
        marginBottom: "5px",
        width: "100%",
        border: `1px solid ${borderColor}`,
        borderBottom: "1px solid #eee",
        height: `${height}px`,
        minHeight: `${height}px`,
        maxHeight: `${height}px`,
        alignItems: "stretch",
        boxSizing: "border-box",
      }}
    >
      <GridItem
        xs={12}
        sm={6}
        md={effectiveMd}
        style={{
          backgroundColor: "#eff9fe",
          borderRight: `1px solid ${borderColor}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "0 10px",
          height: `${height}px`,
          minHeight: `${height}px`,
          maxHeight: `${height}px`,
          boxSizing: "border-box",
        }}
      >
        <FormLabel
          htmlFor={inputId}
          sx={{ ...labelHorizontalSx, paddingTop: 0, margin: 0 }}
        >
          {Config?.Label
            ? t(Config.Label) + ":" + (Config.Required ? " *" : "")
            : ""}
        </FormLabel>
      </GridItem>
      <GridItem
        xs={12}
        sm={6}
        md={12 - effectiveMd}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0",
          backgroundColor: "#fff",
          height: `${height}px`,
          minHeight: `${height}px`,
          maxHeight: `${height}px`,
          boxSizing: "border-box",
        }}
      >
        {renderControl(false)}
      </GridItem>
    </GridContainer>
  );
}
