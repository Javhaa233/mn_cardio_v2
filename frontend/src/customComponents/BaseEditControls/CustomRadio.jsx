import React, { useState } from "react";
// @mui/material components
import Radio from "@mui/material/Radio";
import FormControlLabel from "@mui/material/FormControlLabel";
// @mui/icons-material
import FiberManualRecord from "@mui/icons-material/FiberManualRecord";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

import {
  primaryColor,
  blackColor,
  hexToRgb,
} from "assets/jss/material-dashboard-pro-react.js";
import { FIELD } from "./fieldRowStyles";

export default function CustomRadio(props) {
  const { Config = null, ChangeValue, Row = false } = props;

  const [selectedValue, setSelectedValue] = useState(
    Config && Config.Value ? Config.Value : null,
  );

  const onChangeValue = (event) => {
    const value = event.target.value;
    Config && ChangeValue && ChangeValue(Config.Name, value);
    setSelectedValue(value);
  };

  const GetRadio = () => {
    var Radios = [];
    if (Config && Array.isArray(Config.Data)) {
      for (var i = 0; i < Config.Data.length; i++) {
        Radios.push(
          <div
            style={{
              display: Row ? "block" : "inline-block",
              width: Row ? "100%" : undefined,
            }}
            key={"Div" + i}
          >
            <FormControlLabel
              key={"Label" + i}
              control={
                <Radio
                  key={"Radio" + i}
                  checked={
                    selectedValue === Config.Data[i][Config.Config.IdField]
                  }
                  onChange={onChangeValue}
                  value={Config.Data[i][Config.Config.IdField]}
                  name={Config.Name}
                  icon={
                    <FiberManualRecord
                      sx={{
                        width: "0px",
                        height: "0px",
                        padding: "7px",
                        border: `1px solid ${FIELD.unchecked}`,
                        borderRadius: "50%",
                      }}
                    />
                  }
                  checkedIcon={
                    <FiberManualRecord
                      sx={{
                        width: "16px",
                        height: "16px",
                        border: "1px solid " + primaryColor[0],
                        borderRadius: "50%",
                      }}
                    />
                  }
                  sx={{
                    "&:hover": { backgroundColor: "unset" },
                    "&.Mui-checked": { color: primaryColor[0] + "!important" },
                  }}
                />
              }
              sx={{
                ml: "-14px",
                "& .MuiFormControlLabel-label": {
                  cursor: "pointer",
                  color: FIELD.labelInk,
                  fontSize: "0.875rem",
                  lineHeight: "1.428571429",
                  fontWeight: "400",
                  display: "inline-flex",
                  transition: "0.3s ease all",
                  letterSpacing: "unset",
                },
              }}
              label={Config.Data[i][Config.Config.TextField]}
            />
          </div>,
        );
      }
    }

    return Radios;
  };
  if (Config) {
    return (
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          {GetRadio()}
        </GridItem>
      </GridContainer>
    );
  } else {
    return null;
  }
}
