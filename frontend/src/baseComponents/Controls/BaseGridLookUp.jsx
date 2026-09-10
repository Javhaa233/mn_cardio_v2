import React, { useEffect, useState, useMemo, useCallback } from "react";
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
} from "@mui/material";
// @mui/icons-material
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import CloseIcon from "@mui/icons-material/Close";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseGrid from "baseComponents/BaseGrid/BaseLookUpGrid";

import { grayColor } from "assets/jss/material-dashboard-pro-react.js";

export default function BaseGridLookUp(props) {
  const { t } = useTranslation();
  const generatedId = React.useId();
  const {
    Config = null,
    Value = null,
    md = 3,
    WithLabel = false,
    ChangeValue,
    HideLabel = false,
    Id = null,
    LabelledBy = null,
  } = props;

  // MUI TextField forwards `id` to the underlying <input>, so this is what
  // the <label htmlFor> points at.
  const inputId = Id || generatedId;

  const labelHorizontalSx = {
    color: "#75736c",
    cursor: "pointer",
    display: "inline-flex",
    fontSize: "14px",
    lineHeight: 1,
    fontWeight: "400",
    paddingTop: "5px",
    marginRight: "0",
    textAlign: "left",
    "@media (min-width: 992px)": { float: "right" },
  };

  const textFieldSx = {
    "& .MuiInputBase-input": {
      color: "#495057",
      backgroundColor: "#ffffff",
      fontWeight: "400",
      fontSize: "14px",
      boxSizing: "border-box",
      padding: "0 10px",
      "&::placeholder": { color: grayColor[3], opacity: 1 },
    },
    "& .MuiInput-underline:before": {
      borderBottomColor: "#D2D2D2 !important",
      borderBottomWidth: "1px !important",
    },
    "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
      borderBottomColor: "#D2D2D2 !important",
      borderBottomWidth: "1px !important",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "#9c27b0",
    },
  };

  const popperSx = {
    backgroundColor: "#FFF",
    padding: "8px",
    zIndex: 9999,
    maxHeight: "200px",
    maxWidth: "500px",
    borderRadius: "6px",
    boxShadow: "0 1px 4px 0 rgba(0, 0, 0, 0.14)",
  };

  const scrollSx = {
    maxHeight: "178px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    padding: "3px",
    overflow: "auto",
    "&::-webkit-scrollbar": { width: "6px", height: "6px" },
    "&::-webkit-scrollbar-track": {
      backgroundColor: "rgba(136, 136, 136, 0.1)",
      "&:hover": { backgroundColor: "rgba(173, 173, 173, 0.4)" },
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(136, 136, 136, 0.6)",
      borderRadius: "6px",
      width: "6px",
      "&:hover": { backgroundColor: "rgba(136, 136, 136, 0.9)" },
    },
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const [Text, setText] = useState("");
  const [FilterText, setFilterText] = useState("");
  const [currentValue, setCurrentValue] = useState(Value);

  const Data = useMemo(
    () => (Config && Config.Data ? Config.Data : []),
    [Config],
  );

  var DataFilter = Config.DataFilter ? Config.DataFilter : [];

  const onChangeValue = useCallback(
    (value) => {
      setCurrentValue(value ? value[Config.Config.IdField] : null);
      setText(value ? value[Config.Config.TextField] : "");
      ChangeValue && ChangeValue(value ? value[Config.Config.IdField] : null);
    },
    [Config.Config.IdField, Config.Config.TextField, ChangeValue],
  );

  useEffect(() => {
    if (Value !== currentValue) {
      if (Value) {
        const Temp = Data.filter(
          (s) => s[Config.Config.IdField] + "" === "" + Value,
        );
        if (Temp.length === 1) onChangeValue(Temp[0]);
      } else {
        onChangeValue(null);
      }
    }
  }, [Value, currentValue, Data, Config.Config.IdField, onChangeValue]);

  useEffect(() => {
    if (currentValue) {
      const temp = Data.filter(
        (s) => s[Config.Config.IdField] + "" === currentValue + "",
      );
      if (temp.length === 1) setText(temp[0][Config.Config.TextField]);
    }
  }, [currentValue, Data, Config.Config.IdField, Config.Config.TextField]);

  const GetFilteredData = () => {
    var FilteredData = Data;
    for (var i = 0; i < DataFilter.length; i++) {
      var Filter = DataFilter[i];
      FilteredData = FilteredData.filter(
        (s) => s[Filter.Field] + "" === Filter.Value + "",
      );
    }
    if (FilterText !== "") {
      return FilteredData.filter(
        (s) =>
          s[Config.Config.TextField]
            .toLowerCase()
            .indexOf(FilterText.toLowerCase()) > -1,
      );
    } else {
      return FilteredData;
    }
  };

  const ChangeText = (value) => {
    if (value === "") onChangeValue(null);
    setText(value);
    setFilterText(value);
  };

  const GetControl = () => {
    return (
      <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
        <div style={{ width: "100%" }}>
          <TextField
            id={inputId}
            fullWidth
            inputProps={{ "aria-labelledby": LabelledBy || undefined }}
            label={
              WithLabel || HideLabel ? null : Config ? t(Config.Label + "") : ""
            }
            variant={WithLabel ? "standard" : "outlined"}
            size="small"
            sx={textFieldSx}
            value={Text}
            onChange={(event) => {
              ChangeText(event.target.value);
              setAnchorEl(event.currentTarget);
            }}
            onClick={(event) => {
              if (anchorEl) {
                setAnchorEl(null);
              } else {
                setAnchorEl(event.currentTarget);
              }
            }}
            InputProps={{
              endAdornment: (
                <div style={{ display: "flex" }}>
                  {currentValue ? (
                    <IconButton
                      style={{ padding: "3px" }}
                      aria-label={t("Clear selection")}
                      onClick={() => onChangeValue(null)}
                    >
                      <CloseIcon style={{ color: "#999" }} />
                    </IconButton>
                  ) : null}
                  <IconButton
                    style={{ padding: "3px" }}
                    aria-label={t("Show list")}
                  >
                    {anchorEl ? (
                      <ArrowDropUpIcon style={{ color: "#999" }} />
                    ) : (
                      <ArrowDropDownIcon style={{ color: "#999" }} />
                    )}
                  </IconButton>
                </div>
              ),
            }}
          />
          <Popper
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            placement="bottom-start"
            strategy="fixed"
            transition
            sx={popperSx}
          >
            <Box sx={scrollSx}>
              <BaseGrid
                SelectRow={(Id, Selected, Data) => {
                  onChangeValue(Data);
                  setAnchorEl(null);
                }}
                Data={GetFilteredData()}
                HideNumber
                HideCheck
                Fields={Config.Config.Fields ? Config.Config.Fields : []}
              />
            </Box>
          </Popper>
        </div>
      </ClickAwayListener>
    );
  };

  return (
    <div style={{ width: "100%" }}>
      {WithLabel ? (
        <GridContainer style={{ marginBottom: "10px" }}>
          <GridItem xs={12} sm={12} md={md}>
            <FormLabel
              htmlFor={inputId}
              sx={labelHorizontalSx}
              style={{ paddingTop: "10px" }}
            >
              {Config.Label
                ? t(Config.Label + "") + ":" + (Config.Required ? " *" : "")
                : ""}
            </FormLabel>
          </GridItem>
          <GridItem xs={12} sm={12} md={12 - md}>
            {GetControl()}
          </GridItem>
        </GridContainer>
      ) : (
        GetControl()
      )}
    </div>
  );
}
