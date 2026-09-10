import React, { useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import TextField from "@mui/material/TextField";
import FormLabel from "@mui/material/FormLabel";
import Autocomplete from "@mui/material/Autocomplete";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

import styles from "assets/jss/material-dashboard-pro-react/custom/baseControlsStyles";

export default function BaseSelectMultiple(props) {
  const { t } = useTranslation();
  const generatedId = React.useId();
  const {
    Config = {},
    Value = [],
    ChangeValue,
    WithLabel = false,
    md = 3,
    Id = null,
    LabelledBy = null,
  } = props;

  // MUI Autocomplete puts its `id` on the underlying <input>, so this is what
  // the <label htmlFor> points at.
  const inputId = Id || generatedId;

  const [currentValue, setCurrentValue] = useState(Value);

  const Data = Config.Data ? Config.Data : [];
  const DataFilter = Config.DataFilter ? Config.DataFilter : [];

  const GetValueObject = () => {
    var Values = [];
    if (currentValue !== null) {
      currentValue.forEach((element) => {
        var temp = Data.filter((s) => s[Config.Config.IdField] === element);
        if (temp.length === 1) Values.push(temp[0]);
      });
    }
    return Values;
  };

  const GetFilteredData = () => {
    for (var i = 0; i < DataFilter.length; i++) {
      var Filter = DataFilter[i];
      return Data.filter((s) => s[Filter.Field] === Filter.Value);
    }
    return Data;
  };

  const onChangeValue = (value) => {
    var Val = [];
    value.forEach((element) => {
      if (element[Config.Config.IdField])
        Val.push(element[Config.Config.IdField]);
    });
    setCurrentValue(Val);
    ChangeValue && ChangeValue(Val);
  };

  const GetControl = () => {
    return (
      <Autocomplete
        id={inputId}
        aria-labelledby={LabelledBy || undefined}
        variant="outlined"
        style={{ margin: "4px" }}
        options={GetFilteredData()}
        value={GetValueObject()}
        clearText="Цэвэрлэх"
        multiple={true}
        noOptionsText={t("No data found")}
        getOptionLabel={(option) => t(option[Config.Config.TextField] + "")}
        onChange={(object, val) => onChangeValue(val)}
        renderInput={(params) => (
          <TextField
            {...params}
            label={WithLabel ? null : Config ? t(Config.Label + "") : ""}
            size="small"
            fullWidth
            variant={WithLabel ? "standard" : "outlined"}
            sx={{
              "& .MuiInputBase-input": styles.input,
            }}
          />
        )}
      />
    );
  };

  return (
    <div>
      {WithLabel ? (
        <GridContainer>
          <GridItem xs={12} sm={12} md={md}>
            <FormLabel htmlFor={inputId} sx={styles.labelHorizontal}>
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
