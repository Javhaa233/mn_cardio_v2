import React, { useEffect, useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import FormLabel from "@mui/material/FormLabel";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import {
  fieldRowSx,
  labelCellSx,
  inputCellSx,
  labelSize,
  inputSize,
} from "./fieldRowStyles";
import SimpleSelect from "customComponents/SimpleSelect";
import { FIELD } from "./fieldRowStyles";

const labelHorizontalSx = {
  color: FIELD.labelInk,
  cursor: "pointer",
  display: "inline-flex",
  fontSize: "14px",
  lineHeight: "1.428571429",
  fontWeight: "400",
  paddingTop: "10px",
  marginRight: "0",
  textAlign: "left",
};

export default function BaseSelect(props) {
  const { t } = useTranslation();
  const generatedId = React.useId();
  const {
    Config = null,
    Id = null,
    ChangeValue,
    md = 4.8,
    FullWidth = false,
    Variant = "standard",
    LabelWidth,
  } = props;

  const effectiveMd = LabelWidth ? (LabelWidth / 100) * 12 : md;

  // MUI Select focuses a div[role=combobox], not an <input>, so a <label
  // htmlFor> would point at nothing usable. It is named with aria-labelledby
  // (Select `labelId`) instead.
  const labelId = (Id || generatedId) + "-label";

  const [Value, setValue] = useState(
    Config && Config.Value ? Config.Value : "",
  );

  // Sync internal state with external props when they change
  // This is intentional to support both controlled and uncontrolled usage
  useEffect(() => {
    if (Config && Config.Value) {
      setValue(Config.Value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(Config)]);

  const onChangeValue = (value) => {
    setValue(value);
    Config && ChangeValue && ChangeValue(Config.Name, value);
  };

  return (
    <GridContainer
      sx={(theme) => fieldRowSx(theme, { borderColor: FIELD.rowBorder })}
    >
      <GridItem
        {...labelSize(effectiveMd)}
        sx={(theme) => ({
          ...labelCellSx(theme, { borderColor: FIELD.rowBorder }),
          justifyContent: "flex-start",
          paddingLeft: "15px",
          paddingRight: "15px",
        })}
      >
        <FormLabel
          component="span"
          id={labelId}
          sx={{ ...labelHorizontalSx, paddingTop: 0, margin: 0 }}
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
          padding: "0",
        }}
      >
        <SimpleSelect
          LabelId={Config && Config.Label ? labelId : undefined}
          Config={Config}
          ChangeValue={onChangeValue}
          FullWidth={true} // Force full width inside the cell
          Variant={Variant}
          HideLabel={true}
          Sx={{
            width: "100%",
            height: "100%",
            "&:before": { borderBottom: "none !important" },
            "&:after": { borderBottom: "none !important" },
            "&:hover:not(.Mui-disabled):before": {
              borderBottom: "none !important",
            },
            border: "none",
            "&:hover": {
              border: "none",
            },
            "&.Mui-focused": {
              border: "none",
            },
            "& .MuiSelect-select": {
              textAlign: "left",
              height: "100%",
              display: "flex",
              alignItems: "center",
            },
          }}
        />
      </GridItem>
    </GridContainer>
  );
}
