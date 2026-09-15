import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
// @mui/material components
import FormLabel from "@mui/material/FormLabel";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import {
  controlHeightSx,
  fieldRowSx,
  labelCellSx,
  inputCellSx,
  labelSize,
  inputSize,
} from "./fieldRowStyles";

import { grayColor } from "assets/jss/material-dashboard-pro-react.js";
import { FIELD } from "./fieldRowStyles";

export default function BaseTextArea(props) {
  const { t } = useTranslation();
  const generatedId = React.useId();
  const {
    Config = null,
    Id = null,
    md = 4.8,
    Rows = "3",
    readOnly = false,
    Disabled = false,
    ChangeValue,
    LabelWidth,
    HideLabel = false,
    LabelOnTop = false,
    Value: PropValue,
  } = props;

  const effectiveMd = LabelWidth ? (LabelWidth / 100) * 12 : md;

  // Stable id shared by the <label htmlFor> and the <textarea>.
  // `Id` wins when a parent (BaseField) already owns the association.
  const inputId = Id || generatedId;

  const [Value, setValue] = useState(
    Config && Config.Value ? Config.Value : "",
  );

  // Sync internal state with external props when they change
  // This is intentional to support both controlled and uncontrolled usage
  useEffect(() => {
    if (PropValue !== undefined && PropValue !== null) {
      setValue(PropValue);
    } else if (Config && Config.Value) {
      setValue(Config.Value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(Config), PropValue]);

  const onChangeValue = (Value) => {
    setValue(Value);
    if (ChangeValue) {
      ChangeValue(Config ? Config.Name : null, Value);
    }
  };

  if (HideLabel) {
    return (
      <textarea
        id={inputId}
        rows={Rows}
        value={Value}
        readOnly={readOnly}
        disabled={Disabled}
        onChange={(event) => onChangeValue(event.target.value)}
        style={{
          width: "100%",
          padding: "5px 10px",
          border: "none",
          borderRadius: "0",
          fontSize: "14px",
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          color: grayColor[14],
          backgroundColor: "#fff",
          resize: "vertical",
          outline: "none",
          display: "block",
          margin: "0",
          boxSizing: "border-box",
        }}
      />
    );
  }

  if (LabelOnTop) {
    return (
      <GridContainer
        style={{
          marginBottom: "5px",
          width: "100%",
          border: `1px solid ${FIELD.rowBorder}`,
        }}
      >
        {Config?.Label && (
          <GridItem
            xs={12}
            md={12}
            style={{
              backgroundColor: "#eff9fe",
              borderBottom: `1px solid ${FIELD.rowBorder}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              padding: "5px 10px",
            }}
          >
            <FormLabel
              htmlFor={inputId}
              sx={{
                color: FIELD.labelInk,
                cursor: "pointer",
                display: "inline-flex",
                fontSize: "14px",
                lineHeight: 1,
                fontWeight: "400",
                paddingTop: 0,
                marginRight: "0",
                textAlign: "left",
              }}
            >
              {t(Config.Label + "") + ":" + (Config.Required ? " *" : "")}
            </FormLabel>
          </GridItem>
        )}
        <GridItem
          xs={12}
          md={12}
          style={{ padding: "0", backgroundColor: "#fff" }}
        >
          <textarea
            id={inputId}
            rows={Rows}
            value={Value}
            readOnly={readOnly}
            disabled={Disabled}
            onChange={(event) => onChangeValue(event.target.value)}
            style={{
              width: "100%",
              padding: "5px 10px",
              border: `1px solid ${FIELD.rowBorder}`,
              borderRadius: "0",
              fontSize: "14px",
              fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
              color: grayColor[14],
              backgroundColor: "#fff",
              resize: "vertical",
              outline: "none",
              display: "block",
              margin: "0",
            }}
          />
        </GridItem>
      </GridContainer>
    );
  }

  return (
    <GridContainer
      sx={(theme) =>
        fieldRowSx(theme, { borderColor: FIELD.rowBorder, fixedHeight: false })
      }
    >
      {Config?.Label && (
        <GridItem
          {...labelSize(effectiveMd)}
          sx={(theme) => ({
            ...labelCellSx(theme, { borderColor: FIELD.rowBorder }),
            // A textarea is taller than one row, so its label sits at the top
            // of the cell rather than centred against it.
            alignItems: "flex-start",
            justifyContent: "flex-start",
          })}
        >
          <FormLabel
            htmlFor={inputId}
            sx={{
              color: FIELD.labelInk,
              cursor: "pointer",
              display: "inline-flex",
              fontSize: "14px",
              lineHeight: 1,
              fontWeight: "400",
              paddingTop: 0,
              marginRight: "0",
              textAlign: "left",
            }}
          >
            {t(Config.Label + "") + ":" + (Config.Required ? " *" : "")}
          </FormLabel>
        </GridItem>
      )}
      <GridItem
        {...inputSize(effectiveMd, !!Config?.Label)}
        sx={{ ...inputCellSx(), padding: "0", alignItems: "stretch" }}
      >
        <textarea
          id={inputId}
          rows={Rows}
          value={Value}
          readOnly={readOnly}
          disabled={Disabled}
          onChange={(event) => onChangeValue(event.target.value)}
          style={{
            width: "100%",
            padding: "5px 10px",
            border: `1px solid ${FIELD.rowBorder}`,
            borderRadius: "0",
            fontSize: "14px",
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            color: grayColor[14],
            backgroundColor: "#fff",
            resize: "vertical",
            outline: "none",
            display: "block",
            margin: "0",
          }}
        />
      </GridItem>
    </GridContainer>
  );
}

BaseTextArea.propTypes = { md: PropTypes.number };
