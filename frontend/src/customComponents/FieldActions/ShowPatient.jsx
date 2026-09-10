import { useTranslation } from "react-i18next";
import React from "react";
// helper
import Helper from "helper";
import navClick from "customComponents/PageTabs/navClick";

export default function ShowPatient(props) {
  const { t } = useTranslation();
  const { rowdata, fieldName } = props;

  // let text = "";
  // if (rowdata) text = Helper.ObjectHelper.getValue(rowdata, fieldName);
  let text = "";
  if (rowdata && fieldName) {
    text = Helper.ObjectHelper.getValue(rowdata, fieldName);
  }

  if (!text) return <span>—</span>;
  const href = "/admin/PatientInfo?RegisterNo=" + text;
  return (
    <a
      title="Иргэний мэдээлэл харах"
      href={href}
      onClick={navClick(href)}
      style={{ textDecoration: "none" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.textDecoration = "underline";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.textDecoration = "none";
      }}
    >
      {text}
    </a>
  );
}
