import React, { useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import TextField from "@mui/material/TextField";
import FormLabel from "@mui/material/FormLabel";
import Autocomplete from "@mui/material/Autocomplete";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

import { grayColor } from "assets/jss/material-dashboard-pro-react.js";
import { FIELD } from "customComponents/BaseEditControls/fieldRowStyles";

export default function BaseSelectSingle(props) {
  const { t } = useTranslation();
  const generatedId = React.useId();
  const {
    Config = {},
    Value = null,
    WithLabel = false,
    md = 3,
    ChangeValue,
    Id = null,
    LabelledBy = null,
  } = props;

  // MUI Autocomplete puts its `id` on the underlying <input>, so this is what
  // the <label htmlFor> points at.
  const inputId = Id || generatedId;

  const labelHorizontalSx = {
    color: FIELD.labelInk,
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
      fontSize: "12px",
      boxSizing: "border-box",
      padding: "0 10px",
      "&::placeholder": { color: grayColor[3], opacity: 1 },
    },
  };

  const autoCompleteSx = {
    margin: "0px",
    "& .MuiOutlinedInput-root": {
      padding: "0px",
      "& fieldset": { borderColor: "#aaaaaa" },
      "&.Mui-focused fieldset": { borderColor: "#aaaaaa", borderWidth: 1 },
    },
  };

  const [currentValue, setCurrentValue] = useState(Value);

  const Data = Config.Data ? Config.Data : [];
  var DataFilter = Config.DataFilter ? Config.DataFilter : [];

  const GetValueObject = () => {
    if (currentValue !== null) {
      var temp = Data.filter((s) => s[Config.Config.IdField] === currentValue);
      if (temp.length === 1) return temp[0];
    }
    return null;
  };

  const GetFilteredData = () => {
    for (var i = 0; i < DataFilter.length; i++) {
      var Filter = DataFilter[i];
      return Data.filter((s) => s[Filter.Field] + "" === Filter.Value + "");
    }
    return Data;
  };

  const onChangeValue = (value) => {
    var Val = value ? value[Config.Config.IdField] : null;
    setCurrentValue(Val);
    ChangeValue && ChangeValue(Val);
  };

  const GetControl = () => {
    return (
      <Autocomplete
        id={inputId}
        aria-labelledby={LabelledBy || undefined}
        variant="outlined"
        sx={autoCompleteSx}
        options={GetFilteredData()}
        value={GetValueObject()}
        clearText="Цэвэрлэх"
        multiple={false}
        noOptionsText={t("No data found") + ""}
        slotProps={{
          popper: {
            strategy: "fixed",
          },
        }}
        getOptionLabel={(option) => {
          return t(option[Config.Config.TextField] + "");
        }}
        onChange={(object, val) => onChangeValue(val)}
        renderInput={(params) => (
          <TextField
            {...params}
            label={null}
            sx={textFieldSx}
            size="small"
            fullWidth
            variant="outlined"
          />
        )}
      />
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
