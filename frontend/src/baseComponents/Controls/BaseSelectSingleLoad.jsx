import React, { useState, useRef, useEffect } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material
import TextField from "@mui/material/TextField";
import FormLabel from "@mui/material/FormLabel";
import Autocomplete from "@mui/material/Autocomplete";

// layout
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

// helper
import Helper from "helper";

// styles
import styles from "assets/jss/material-dashboard-pro-react/custom/baseControlsStyles";
import { grayColor } from "assets/jss/material-dashboard-pro-react.js";
import { FIELD } from "customComponents/BaseEditControls/fieldRowStyles";

const labelHorizontalSx = {
  color: FIELD.labelInk,
  cursor: "pointer",
  display: "inline-flex",
  fontSize: "14px",
  lineHeight: "1.428571429",
  fontWeight: "400",
  paddingTop: "0",
  marginRight: "0",
  textAlign: "left",
};

export default function BaseSelectSingleLoad(props) {
  const { t } = useTranslation();
  const generatedId = React.useId();
  const {
    Config = null,
    Value = null,
    WithLabel = false,
    md = 3,
    ChangeValue,
    LabelWidth,
    height = 32,
    borderColor = FIELD.rowBorder,
    Id = null,
    LabelledBy = null,
  } = props;

  const effectiveMd = LabelWidth ? (LabelWidth / 100) * 12 : md;

  // MUI Autocomplete puts its `id` on the underlying <input>, so this is what
  // the <label htmlFor> points at.
  const inputId = Id || generatedId;

  const [data, setData] = useState([]);
  const [currentValue, setCurrentValue] = useState(Value);
  const timeoutRef = useRef(null);

  const searchOption = Helper.BaseCrudHelper.GetSearchOption();
  const dataFilter = Config?.DataFilter || [];

  const textFieldSx = {
    width: "100%",
    "& .MuiOutlinedInput-root": {
      padding: "0",
      alignItems: "center",
      borderRadius: "0",
      "& fieldset": { border: "none" },
    },
    "& .MuiInputBase-root": {
      minHeight: `${height}px`,
      height: `${height}px`,
    },
    "& .MuiInputBase-input": {
      color: "#495057",
      backgroundColor: "#ffffff",
      fontWeight: "400",
      fontSize: "12px",
      height: `${height}px`,
      lineHeight: `${height}px`,
      boxSizing: "border-box",
      padding: "0 40px 0 12px",
      "&,&::placeholder": {
        color: "#495057",
        fontSize: "12px",
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontWeight: "400",
        lineHeight: `${height}px`,
        opacity: "1",
      },
      "&::placeholder": { color: grayColor[3] },
    },
  };

  /* -------------------------------------------------------
   * Load selected value initially
   * ----------------------------------------------------- */
  useEffect(() => {
    if (currentValue != null && data.length === 0) {
      searchData("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------------------------------------------------------
   * Helpers
   * ----------------------------------------------------- */

  const getValueObject = () => {
    if (currentValue != null && Array.isArray(data)) {
      return (
        data.find(
          (s) =>
            s?.[Config.Config.IdField]?.toString() === currentValue?.toString(),
        ) || null
      );
    }
    return null;
  };

  const searchData = async (searchText = "") => {
    if (!Config?.Config) return;

    const url = Config.Config.SearchUrl || "/BaseObject";

    searchOption.PageOption.Limit = 1000;
    searchOption.FindType = "Simple";
    searchOption.SearchField = [
      {
        Field: Config.Config.TextField,
        Value: searchText,
        Op: "Contains",
      },
    ];

    dataFilter.forEach((f) => {
      searchOption.SearchField.push({
        Field: f.Field,
        Value: f.Value,
        Op: f.Op || "Equals",
      });
    });

    const reqData = Helper.BaseCrudHelper.GetRequestData(
      Config.Config.ObjectName,
      searchOption,
    );

    await Helper.BaseCrudHelper.CallService(url, reqData, (res) => {
      setData(Array.isArray(res?.Data) ? res.Data : []);
    });
  };

  const onChangeValue = (option) => {
    const val = option ? option[Config.Config.IdField] : null;
    setCurrentValue(val);
    ChangeValue && ChangeValue(val);
  };

  /* -------------------------------------------------------
   * Control (IMPORTANT PART)
   * ----------------------------------------------------- */

  const Control = (hasBorder = true) => (
    <Autocomplete
      id={inputId}
      aria-labelledby={LabelledBy || undefined}
      options={data}
      value={getValueObject()}
      multiple={false}
      clearText="Цэвэрлэх"
      slotProps={{
        popper: {
          strategy: "fixed",
        },
      }}
      noOptionsText={t("No data found")}
      getOptionLabel={(option) => t(option?.[Config.Config.TextField] ?? "")}
      onChange={(e, val) => onChangeValue(val)}
      sx={{
        margin: 0,
        width: "100%",
        "& .MuiOutlinedInput-root": {
          padding: 0,
          ...textFieldSx["& .MuiOutlinedInput-root"],
          ...(hasBorder
            ? {
                border: `1px solid ${FIELD.rowBorder}`,
                "&:hover": {
                  border: `1px solid ${FIELD.inputBorderHover}`,
                },
                "&.Mui-focused": {
                  border: `1px solid ${FIELD.inputBorderFocus}`,
                },
              }
            : {
                border: "none",
                "&:hover": {
                  border: "none",
                },
                "&.Mui-focused": {
                  border: "none",
                },
              }),
        },
        "& .MuiAutocomplete-inputRoot": {
          padding: "0 !important",
          height: `${height}px`,
          minHeight: `${height}px`,
        },
        "& .MuiInputBase-input": {
          padding: "0 10px !important",
          height: `${height}px !important`,
          lineHeight: `${height}px !important`,
          fontSize: "12px",
        },
        "& .MuiAutocomplete-endAdornment": {
          top: "50%",
          transform: "translateY(-50%)",
        },
      }}
      renderInput={(params) => {
        // 🔴 THIS IS THE KEY FIX
        const { InputLabelProps, ...rest } = params;

        return (
          <TextField
            {...rest}
            fullWidth
            size="small"
            variant="outlined"
            hiddenLabel
            label=""
            InputLabelProps={{
              shrink: false,
              style: { display: "none" },
            }}
            onChange={(e) => {
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
              }
              const value = e.target.value;
              timeoutRef.current = setTimeout(() => {
                searchData(value);
              }, 800);
            }}
            sx={{
              "& .MuiInputBase-input": styles.input,
            }}
          />
        );
      }}
    />
  );

  /* -------------------------------------------------------
   * Layout with external label
   * ----------------------------------------------------- */

  if (!WithLabel) return Control(true);

  return (
    <GridContainer
      style={{
        marginBottom: "5px",
        width: "100%",
        border: `1px solid ${borderColor}`,
        borderBottom: `1px solid ${FIELD.rowBorder}`,
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
        {Control(false)}
      </GridItem>
    </GridContainer>
  );
}
