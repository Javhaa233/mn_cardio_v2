import React from "react";
import BaseTextBox from "newComponents/BaseControls/BaseTextBox";
import BaseNumberBox from "newComponents/BaseControls/BaseNumberBox";
import BaseSelectBox from "newComponents/BaseControls/BaseSelectBox";
import BaseDateBox from "newComponents/BaseControls/BaseDateBox";
import BaseDateTimeBox from "newComponents/BaseControls/BaseDateTimeBox";
import BaseTimeBox from "newComponents/BaseControls/BaseTimeBox";
import BaseTextArea from "newComponents/BaseControls/BaseTextArea";
import BaseCheckBox from "newComponents/BaseControls/BaseCheckBox";
import BaseLookupGrid from "newComponents/BaseControls/BaseLookupGrid";
import BasePassword from "newComponents/BaseControls/BasePassword";
import BaseLookupGridMulti from "newComponents/BaseControls/BaseLookupGridMulti";
import BaseDayPlan from "newComponents/BaseControls/BaseDayPlan";
import BaseLookupTree from "newComponents/BaseControls/BaseLookupTree";
import BaseFontStyle from "newComponents/BaseControls/BaseFontStyle";
import BaseDateBoxRange from "newComponents/BaseControls/BaseDateBoxRange";
import BaseFileChooser from "newComponents/BaseControls/BaseFileChooser";
import BaseHtmlEditor from "newComponents/BaseControls/BaseHtmlEditor";
import BaseRadioBox from "newComponents/BaseControls/BaseRadioBox";
import BaseCheckBoxMulti from "newComponents/BaseControls/BaseCheckBoxMulti";
import BaseSingleImage from "newComponents/BaseControls/BaseSingleImage";
import BaseFileUploader from "newComponents/BaseControls/BaseFileUploader";

export const editors = {
  textBox: "textBox",
  numberBox: "numberBox",
  dateBox: "dateBox",
  dateTimeBox: "dateTimeBox",
  timeBox: "timeBox",
  textArea: "textArea",
  htmlEditor: "htmlEditor",
  lookupGrid: "lookupGrid",
  selectBox: "selectBox",
  checkBox: "checkBox",
  password: "password",
  lookupGridMulti: "lookupGridMulti",
  dayPlan: "dayPlan",
  lookupTree: "lookupTree",

  fontStyle: "fontStyle",
  dateBoxRange: "dateBoxRange",
  fileChooser: "fileChooser",
  companyChooser: "companyChooser",
  radioBox: "radioBox",
  checkBoxMulti: "checkBoxMulti",
  singleImage: "singleImage",
  fileUploader: "fileUploader",
};

export const getFieldEditor = (field) => {
  if (field.editor && typeof field.editor === "string") {
    return field.editor;
  }
  if (field.editor && Object.keys(field.editor).length > 0) {
    return Object.keys(field.editor)[0];
  }
  return editors.textBox;
};

export default ({ editor, ...props }) => {
  if (editor === editors.textBox) {
    return <BaseTextBox {...props} />;
  } else if (editor === editors.textArea) {
    return <BaseTextArea {...props} />;
  } else if (editor === editors.selectBox) {
    return <BaseSelectBox {...props} />;
  } else if (editor === editors.numberBox) {
    return <BaseNumberBox {...props} />;
  } else if (editor === editors.dateBox) {
    return <BaseDateBox {...props} />;
  } else if (editor === editors.dateTimeBox) {
    return <BaseDateTimeBox {...props} />;
  } else if (editor === editors.timeBox) {
    return <BaseTimeBox {...props} />;
  } else if (editor === editors.checkBox) {
    return <BaseCheckBox {...props} />;
  } else if (editor === editors.lookupGrid) {
    return <BaseLookupGrid {...props} />;
  } else if (editor === editors.lookupGridMulti) {
    return <BaseLookupGridMulti {...props} />;
  } else if (editor === editors.password) {
    return <BasePassword {...props} />;
  } else if (editor === editors.dayPlan) {
    return <BaseDayPlan {...props} />;
  } else if (editor === editors.lookupTree) {
    return <BaseLookupTree {...props} />;
  } else if (editor === editors.fontStyle) {
    return <BaseFontStyle {...props} />;
  } else if (editor === editors.dateBoxRange) {
    return <BaseDateBoxRange {...props} />;
  } else if (editor === editors.fileChooser) {
    return <BaseFileChooser {...props} />;
  } else if (editor === editors.htmlEditor) {
    return <BaseHtmlEditor {...props} />;
  } else if (editor === editors.radioBox) {
    return <BaseRadioBox {...props} />;
  } else if (editor === editors.checkBoxMulti) {
    return <BaseCheckBoxMulti {...props} />;
  } else if (editor === editors.singleImage) {
    return <BaseSingleImage {...props} />;
  } else if (editor === editors.fileUploader) {
    return <BaseFileUploader {...props} />;
  }

  return <BaseTextBox {...props} />;
};
