import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
// @mui/material components
import FormLabel from "@mui/material/FormLabel";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

import { grayColor } from "assets/jss/material-dashboard-pro-react.js";

import "react-quill/dist/quill.snow.css";
import { FIELD } from "./fieldRowStyles";

const quillGlobalStyles = `
  .ql-toolbar.ql-snow {
    padding: 2px 8px !important;
    border-top: none !important;
    border-left: none !important;
    border-right: none !important;
    border-bottom: 1px solid #eee !important;
    background-color: #fafafa;
  }
  .ql-toolbar.ql-snow .ql-formats {
    margin-right: 8px !important;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
  }
  .ql-snow.ql-toolbar button, .ql-snow .ql-toolbar button {
    width: 26px !important;
    height: 24px !important;
    padding: 3px 5px !important;
  }
  .ql-snow.ql-toolbar .ql-picker-label {
    padding: 2px 4px !important;
  }
  .ql-snow.ql-toolbar .ql-picker-label svg {
    width: 14px !important;
    height: 14px !important;
  }
  .ql-container.ql-snow {
    border: none !important;
    font-size: 14px;
    font-family: "Roboto", "Helvetica", "Arial", sans-serif;
  }
  .ql-editor {
    min-height: 80px;
    padding: 5px 10px !important;
    color: #3C4858;
  }
`;

export default function BaseRichText(props) {
  const { t } = useTranslation();
  const generatedId = React.useId();
  const quillWrapRef = React.useRef(null);
  const {
    Config = null,
    Id = null,
    LabelledBy = null,
    md = 4.8,
    Rows = "3",
    readOnly = false,
    Disabled = false,
    ChangeValue,
    LabelWidth,
    HideLabel = false,
    Value: PropValue,
  } = props;

  const effectiveMd = LabelWidth ? (LabelWidth / 100) * 12 : md;

  // Quill edits a contenteditable div, not an <input>, so <label htmlFor>
  // cannot reach it. The label gets an id and it is applied to Quill's
  // .ql-editor node as aria-labelledby once the editor has mounted.
  const labelId = LabelledBy || (Id || generatedId) + "-label";

  useEffect(() => {
    const editor = quillWrapRef.current?.querySelector(".ql-editor");
    if (!editor) return;
    editor.setAttribute("aria-labelledby", labelId);
    if (!editor.getAttribute("role")) editor.setAttribute("role", "textbox");
    editor.setAttribute("aria-multiline", "true");
  }, [labelId]);

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

  const onChangeValue = (val) => {
    setValue(val);
    Config && ChangeValue && ChangeValue(Config.Name, val);
  };

  if (HideLabel) {
    return (
      <>
        <style>{quillGlobalStyles}</style>
        <div
          ref={quillWrapRef}
          style={{
            width: "100%",
            padding: "0",
            border: "none",
            borderRadius: "0",
            fontSize: "14px",
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            color: grayColor[14],
            backgroundColor: "#fff",
            display: "block",
            margin: "0",
            boxSizing: "border-box",
          }}
        >
          <ReactQuill
            theme="snow"
            value={Value}
            readOnly={readOnly || Disabled}
            onChange={onChangeValue}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <style>{quillGlobalStyles}</style>
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
            sm={6}
            md={effectiveMd}
            style={{
              backgroundColor: "#eff9fe",
              borderRight: `1px solid ${FIELD.rowBorder}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              padding: "0 10px",
            }}
          >
            <FormLabel
              component="span"
              id={labelId}
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
          sm={Config?.Label ? 6 : 12}
          md={Config?.Label ? 12 - effectiveMd : 12}
          style={{ padding: "0", backgroundColor: "#fff" }}
        >
          <div
            ref={quillWrapRef}
            style={{
              width: "100%",
              // border: "1px solid #eee" // Not adding border here to avoid double border with GridContainer
              // If strict adherence to BaseTextArea logic is needed, we could add it, but it might look better without double borders.
              // BaseTextArea had it on textarea.
            }}
          >
            <ReactQuill
              theme="snow"
              value={Value}
              readOnly={readOnly || Disabled}
              onChange={onChangeValue}
              style={{ height: "100%" }}
            />
          </div>
        </GridItem>
      </GridContainer>
    </>
  );
}

BaseRichText.propTypes = { md: PropTypes.number };
