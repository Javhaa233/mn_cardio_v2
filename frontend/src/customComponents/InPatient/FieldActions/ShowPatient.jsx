import { useTranslation } from "react-i18next";
import React from "react";
// @mui/icons-material
import VisibilityIcon from "@mui/icons-material/Visibility";
import navClick from "customComponents/PageTabs/navClick";

export default function ShowPatient(props) {
  const { t } = useTranslation();
  const { rowdata } = props;

  if (rowdata) {
    const href =
      "/admin/PatientInfo?RegisterNo=" +
      (rowdata.Patient ? rowdata.Patient.p_registration : "");
    return (
      <a
        href={href}
        onClick={navClick(href)}
        style={{
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.textDecoration = "underline";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.textDecoration = "none";
        }}
      >
        <VisibilityIcon fontSize="small" style={{ color: "#00acc1" }} />
        {rowdata.Patient ? rowdata.Patient.p_registration : null}
      </a>
    );
  } else {
    return null;
  }
}
