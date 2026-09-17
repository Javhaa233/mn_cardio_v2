import React, { useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Box from "@mui/material/Box";
// @mui/icons-material
import Check from "@mui/icons-material/Check";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

import {
  primaryColor,
  dangerColor,
  blackColor,
  hexToRgb,
} from "assets/jss/material-dashboard-pro-react.js";
import { FIELD } from "customComponents/BaseEditControls/fieldRowStyles";

export default function CustomCheckBox(props) {
  const { t } = useTranslation();
  const { Config = {}, boxMd = 12, ChangeValue } = props;

  const labelHorizontalSx = {
    color: FIELD.labelInk,
    cursor: "pointer",
    display: "inline-flex",
    fontSize: "14px",
    lineHeight: 1,
    fontWeight: "400",
    paddingTop: "5px",
    marginRight: "0",
    textAlign: "right",
    "@media (min-width: 992px)": { float: "right" },
  };

  const [changed, setChanged] = useState(false);
  const [CheckedData, setCheckedData] = useState(
    Array.isArray(Config.Value) ? Config.Value : [],
  );

  const GetChecked = (Value) => {
    return Array.isArray(CheckedData)
      ? CheckedData.filter((s) => s + "" === "" + Value).length > 0
      : false;
  };

  const onChange = (Value, Checked) => {
    let tempCheckedData = CheckedData;
    const index = tempCheckedData.indexOf(Value);

    let type = "";
    if (Checked === true && index === -1) {
      tempCheckedData.push(Value);
      type = "check";
    }
    if (Checked === false && index !== -1) {
      tempCheckedData.splice(index, 1);
      type = "uncheck";
    }

    setCheckedData(tempCheckedData);
    setChanged(!changed);
    Config &&
      ChangeValue &&
      ChangeValue(Config.Name, tempCheckedData, Value, type);
  };

  const GetCheckBox = () => {
    var CheckBoxes = [];
    if (Config && Config.Data && Config.Config) {
      for (var i = 0; i < Config.Data.length; i++) {
        const checkboxAndRadioHorizontalSx = {
          position: "relative",
          display: "block",
          marginTop: i === 0 ? "10px" : "-14px",
          marginBottom: "15px",
        };
        CheckBoxes.push(
          <GridItem xs={12} sm={12} md={boxMd} key={"Grid" + i}>
            <Box sx={checkboxAndRadioHorizontalSx}>
              <FormControlLabel
                key={"label" + i}
                control={
                  <Checkbox
                    key={"Check" + i}
                    tabIndex={-1}
                    onChange={(event, checked) =>
                      onChange(event.target.value, checked)
                    }
                    value={Config.Data[i][Config.Config.IdField]}
                    checked={GetChecked(Config.Data[i][Config.Config.IdField])}
                    checkedIcon={
                      <Check
                        sx={{
                          width: "20px",
                          height: "20px",
                          border: `1px solid ${FIELD.unchecked}`,
                          borderRadius: "3px",
                        }}
                      />
                    }
                    icon={
                      <Check
                        sx={{
                          width: "0px",
                          height: "0px",
                          padding: "9px",
                          border: `1px solid ${FIELD.unchecked}`,
                          borderRadius: "3px",
                        }}
                      />
                    }
                    sx={{
                      padding: "14px",
                      "&:hover": { backgroundColor: "unset" },
                      "&.Mui-checked": {
                        color: primaryColor[0] + "!important",
                      },
                    }}
                  />
                }
                sx={{
                  ml: "-14px",
                  mt: "-18px",
                  "& .MuiFormControlLabel-label": {
                    cursor: "pointer",
                    paddingLeft: "0",
                    color: FIELD.labelInk,
                    fontSize: "14px",
                    lineHeight: 1,
                    fontWeight: "400",
                    display: "inline-flex",
                    transition: "0.3s ease all",
                    letterSpacing: "unset",
                  },
                }}
                label={t(Config.Data[i][Config.Config.TextField] + "")}
              />
            </Box>
          </GridItem>,
        );
      }
    }
    return CheckBoxes;
  };

  if (Config) {
    return (
      <GridContainer style={{ marginBottom: "10px" }}>
        {Config.Label && (
          <GridItem xs={12} sm={6} md={3}>
            <FormLabel sx={labelHorizontalSx}>
              {t(Config.Label + "") + ":" + (Config.Required ? " *" : "")}
            </FormLabel>
          </GridItem>
        )}
        <GridItem xs={12} sm={Config.Label ? 6 : 12} md={Config.Label ? 9 : 12}>
          <GridContainer>{GetCheckBox()}</GridContainer>
        </GridItem>
      </GridContainer>
    );
  } else {
    return null;
  }
}
