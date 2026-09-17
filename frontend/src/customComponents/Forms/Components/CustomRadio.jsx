import React, { useState } from "react";

import { useTranslation } from "react-i18next";
// @mui/material components
import Radio from "@mui/material/Radio";
import Box from "@mui/material/Box";
// import FormLabel from "@mui/material/FormLabel";
import FormControlLabel from "@mui/material/FormControlLabel";
// @mui/icons-material
import FiberManualRecord from "@mui/icons-material/FiberManualRecord";
// default components
// import GridContainer from "components/Grid/GridContainer";
// import GridItem from "components/Grid/GridItem";

import {
  primaryColor,
  blackColor,
  hexToRgb,
} from "assets/jss/material-dashboard-pro-react.js";
import { FIELD } from "customComponents/BaseEditControls/fieldRowStyles";

export default function CustomRadio(props) {
  const { t } = useTranslation();
  const {
    Config = null,
    ChangeValue,

    Row = false,
    Unknown = false,
    UnknownText = "Unknown",
  } = props;

  const [selectedValue, setSelectedValue] = useState(
    Config && Config.Value ? Config.Value + "" : null,
  );

  const onChange = (event) => {
    const value = event.target.value;
    setSelectedValue(value);
    Config && ChangeValue && ChangeValue(Config.Name, value);
  };

  const GetRadio = () => {
    var Radios = [];
    if (Config && Config.Data && Config.Config) {
      for (var i = 0; i < Config.Data.length; i++) {
        Radios.push(
          <div
            style={{
              width: "100%",
              textAlign: "left",
              paddingLeft: "15px",
            }}
            key={"Div" + i}
          >
            <FormControlLabel
              control={
                <Radio
                  checked={
                    selectedValue === Config.Data[i][Config.Config.IdField]
                  }
                  onChange={onChange}
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
                    margin: "-8px 0",
                    padding: "14px",
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
                  fontWeight:
                    selectedValue === Config.Data[i][Config.Config.IdField]
                      ? "bold"
                      : "400",
                  display: "inline-flex",
                  transition: "0.3s ease all",
                  letterSpacing: "unset",
                },
              }}
              label={t(Config.Data[i][Config.Config.TextField] + "")}
            />
          </div>,
        );
      }
    }

    if (Unknown) {
      Radios.push(
        <div
          style={{
            width: "100%",
            textAlign: "left",
            paddingLeft: "15px",
          }}
          key="DivUnknown"
        >
          <FormControlLabel
            control={
              <Radio
                checked={selectedValue === "-1"}
                onChange={onChange}
                value={"-1"}
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
                  margin: "-8px 0",
                  padding: "14px",
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
                fontWeight: selectedValue === "-1" ? "bold" : "400",
                display: "inline-flex",
                transition: "0.3s ease all",
                letterSpacing: "unset",
              },
            }}
            label={t(UnknownText)}
          />
        </div>,
      );
    }

    return (
      <Box
        sx={{
          border: `1px solid ${FIELD.rowBorder}`,
          borderRadius: "4px",
          display: "grid",
          // Was a hardcoded `1fr 1fr`. These radio groups sit inside table
          // cells that are themselves narrowed (some to 44%), so on a phone two
          // fixed columns left each option a few characters wide. auto-fit
          // collapses to one column when two will not fit and goes back to two
          // when they will, without needing a breakpoint.
          gridTemplateColumns: Row
            ? "1fr"
            : "repeat(auto-fit, minmax(120px, 1fr))",
          padding: "5px",
          width: "100%",
          backgroundColor: "#e1f5fe",
        }}
      >
        {Radios}
      </Box>
    );
  };

  if (Config) {
    return GetRadio();
  } else {
    return null;
  }
}
