import React, { useEffect, useState, useRef } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import TextField from "@mui/material/TextField";
import FormLabel from "@mui/material/FormLabel";
import Autocomplete from "@mui/material/Autocomplete";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import Box from "@mui/material/Box";
import {
  controlHeightSx,
  fieldRowSx,
  labelCellSx,
  inputCellSx,
  labelSize,
  inputSize,
} from "./fieldRowStyles";
// helper
import Helper from "helper";

const autoCompleteLabelHorizontalSx = {
  color: "#75736c",
  cursor: "pointer",
  display: "inline-flex",
  fontSize: "14px",
  lineHeight: "1.428571429",
  fontWeight: "400",
  paddingTop: "0px",
  marginRight: "0",
  textAlign: "left",
  whiteSpace: "normal",
};

export default function BaseAutoComplete(props) {
  const { t } = useTranslation();
  const generatedId = React.useId();

  const {
    Config = null,
    CustomFilter,
    ObjectValue,
    ChangeValue,
    FullWidth = true,
    Variant = "standard",
    md = 4.8,
    LabelWidth,
    borderColor = "#eee",
    HideLabel = false,
    Disabled = false,
    readOnly = false,
    Id = null,
    ContainerSx = null,
    Value: PropValue,
  } = props;

  const effectiveMd = LabelWidth ? (LabelWidth / 100) * 12 : md;

  // MUI Autocomplete puts its `id` straight onto the underlying <input>, so
  // this is what the <label htmlFor> must point at. The previous default was
  // the literal "combo-box-demo", which collided on every screen with more
  // than one autocomplete.
  const inputId = Id || generatedId;

  // Control height, radius and inner padding come from `src/theme.js`.
  // What stays here is what the theme does not cover: the bordered cell look,
  // the zeroed FormControl margin (the theme adds 6px), and the fact that this
  // control pads its input *root* by 10px, so the input itself must not pad
  // again.
  const autoCompleteSx = {
    padding: "0",
    margin: "0",
    boxSizing: "border-box",
    "& .MuiTextField-root": {
      margin: "0 !important",
      padding: "0 !important",
    },
    "& .MuiFormControl-root": {
      margin: "0 !important",
      padding: "0 !important",
    },
    "& .MuiInputBase-root": {
      margin: "0 !important",
      padding: "0 10px !important",
      boxSizing: "border-box",
      border: "1px solid #eee",
      backgroundColor: "#fff",
      "&:hover:not(.Mui-disabled)": {
        border: "1px solid #ccc",
      },
      "&.Mui-focused": {
        border: "1px solid #aaa",
      },
      "&:before, &:after": {
        display: "none",
      },
    },
    "& .MuiInput-root": {
      backgroundColor: "#ffffff",
      color: "#495057",
      padding: "0 10px !important",
      margin: "0 !important",
      "& .MuiAutocomplete-input": {
        padding: "0 !important",
      },
    },
    "& .MuiInputBase-input": {
      fontSize: "12px",
      padding: "0 !important",
      display: "block",
      boxSizing: "border-box",
    },
    "& .MuiOutlinedInput-root": {
      padding: "0 10px !important",
      margin: "0 !important",
      "& fieldset": {
        border: "none",
      },
      "&:hover fieldset": {
        border: "none",
      },
      "&.Mui-focused fieldset": {
        border: "none",
      },
      "& .MuiAutocomplete-input": {
        padding: "0 !important",
      },
    },
    "& .MuiAutocomplete-endAdornment": {
      top: "50% !important",
      transform: "translateY(-50%) !important",
    },
    "& .MuiAutocomplete-inputRoot": {
      paddingTop: "0 !important",
      paddingBottom: "0 !important",
    },
    "& .MuiAutocomplete-popupIndicator": {
      fontSize: "12px",
    },
    "& .MuiAutocomplete-option": {
      fontSize: "12px",
      padding: "4px 8px",
    },
    "& .MuiPaper-root": {
      fontSize: "12px",
    },
  };

  const [Data, setData] = useState([]);
  const [Value, setValue] = useState(
    PropValue !== undefined && PropValue !== null
      ? PropValue
      : Config && Config.Value
        ? Config.Value
        : null,
  );
  const timeoutRef = useRef(null);

  const { DataFilter: propsDataFilter = [] } = props;
  const dataFilterRef = useRef(propsDataFilter);
  const ObjectName =
    Config && Config.Config && Config.Config.ObjectName
      ? Config.Config.ObjectName
      : null;

  useEffect(() => {
    if (PropValue !== undefined && PropValue !== null) {
      setValue(PropValue);
    } else if (Config && Config.Value) {
      setValue(Config.Value);
    }
  }, [Config, PropValue]);

  useEffect(() => {
    if (Value && Config && Config.Config) {
      dataFilterRef.current = [{ Field: Config.Config.IdField, Value }];
      SearchData("");
    } else {
      SearchData("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Value]);

  var SearchOption = Helper.BaseCrudHelper.GetSearchOption();

  const SearchData = async (SearchText) => {
    if (Config && Config.Config) {
      var Url = Config.Config.SearchUrl
        ? Config.Config.SearchUrl
        : "/BaseObject";
      let ReqData = { SearchText };
      if (ObjectName) {
        SearchOption.SearchField = [
          { Field: Config.Config.TextField, Value: SearchText, Op: "Contains" },
        ];
        if (dataFilterRef.current && dataFilterRef.current.length > 0) {
          for (var i = 0; i < dataFilterRef.current.length; i++) {
            var Filter = dataFilterRef.current[i];
            SearchOption.SearchField.push({
              Field: Filter.Field,
              Value: Filter.Value,
              Op: "Equals",
            });
          }
        }

        SearchOption.PageOption.Limit = 100;
        ReqData = Helper.BaseCrudHelper.GetRequestData(
          ObjectName,
          SearchOption,
        );
      } else {
        if (CustomFilter) {
          ReqData = { ...CustomFilter, SearchText };
        }
      }

      await Helper.BaseCrudHelper.CallService(
        Url,
        ReqData,
        (resData) =>
          resData && setData(Array.isArray(resData.Data) ? resData.Data : []),
      );
    }
  };

  const GetValueObject = () => {
    if (Value !== null && Value !== undefined) {
      var temp = Array.isArray(Data)
        ? Data.filter((s) => s[Config.Config.IdField] === Value)
        : [];
      if (temp.length === 1) {
        return temp[0];
      } else {
        return null;
      }
    }
    return null;
  };

  const onChangeValue = (val) => {
    if (val && ChangeValue && Config && Config.Name) {
      if (ObjectValue) ChangeValue(Config.Name, val);
      else ChangeValue(Config.Name, val[Config.Config.IdField]);
      setValue(val[Config.Config.IdField]);
    } else if (val === null && ChangeValue && Config && Config.Name) {
      ChangeValue(Config.Name, null);
      setValue(null);
    }
  };

  const onInputChange = (event, newInputValue, reason) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (reason === "input" && newInputValue !== "") {
      timeoutRef.current = setTimeout(() => {
        SearchData(newInputValue);
      }, 500); // Reduced delay for better UX
    }
  };

  const autocompleteComponent = (
    <Autocomplete
      id={inputId}
      size="small"
      options={Data}
      getOptionLabel={(option) =>
        option && option[Config.Config.TextField]
          ? option[Config.Config.TextField]
          : ""
      }
      isOptionEqualToValue={(option, value) => {
        if (!option || !value) return false;
        return option[Config.Config.IdField] === value[Config.Config.IdField];
      }}
      renderOption={(props, option) => {
        const { key, ...otherProps } = props;
        return (
          <li key={option[Config.Config.IdField]} {...otherProps}>
            {option[Config.Config.TextField]}
          </li>
        );
      }}
      noOptionsText={t("No data found")}
      sx={autoCompleteSx}
      onChange={(object, val) => onChangeValue(val)}
      onInputChange={onInputChange}
      value={GetValueObject() || null}
      // Height is NOT set here. An inline `style` cannot hold a media query and
      // outranks emotion, so a height pinned here could never grow for touch;
      // `autoCompleteSx` and the theme's MuiAutocomplete rule size it instead.
      style={{ width: "100%" }}
      disabled={Disabled}
      readOnly={readOnly}
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth={FullWidth}
          variant={Variant}
          type="text"
          placeholder={Config.Placeholder || ""}
          size="small"
          margin="none"
          hiddenLabel
          InputLabelProps={{ shrink: false }}
        />
      )}
    />
  );

  if (HideLabel) {
    return (
      <Box
        sx={{
          width: FullWidth ? "100%" : "auto",
          margin: "0",
          ...controlHeightSx,
        }}
      >
        {autocompleteComponent}
      </Box>
    );
  }

  return (
    <GridContainer
      sx={(theme) => ({
        ...fieldRowSx(theme, { borderColor }),
        borderTop: "none",
        ...(ContainerSx || {}),
      })}
    >
      <GridItem
        {...labelSize(effectiveMd)}
        sx={(theme) => ({
          ...labelCellSx(theme, { borderColor }),
          justifyContent: "flex-start",
        })}
      >
        <FormLabel
          htmlFor={inputId}
          sx={{ ...autoCompleteLabelHorizontalSx, padding: 0, margin: 0 }}
        >
          {Config && Config.Label
            ? t(Config.Label + "") + ":" + (Config.Required ? " *" : "")
            : ""}
        </FormLabel>
      </GridItem>

      <GridItem
        {...inputSize(effectiveMd)}
        sx={{
          ...inputCellSx(),
          justifyContent: "flex-start",
          position: "relative",
          zIndex: 1,
        }}
      >
        {autocompleteComponent}
      </GridItem>
    </GridContainer>
  );
}
