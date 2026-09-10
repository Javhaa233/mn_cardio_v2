import React from "react";
// helper
import Helper from "helper";
import navClick from "customComponents/PageTabs/navClick";

export default function ShowCVDInfo(props) {
  const { rowdata, fieldName } = props;
  var Text = "";

  if (rowdata) {
    Text = Helper.ObjectHelper.getValue(rowdata, fieldName);
  }

  const href = "/admin/Cardiovascular?PatRegNo=" + Text;

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
      {Text}
    </a>
  );
}
