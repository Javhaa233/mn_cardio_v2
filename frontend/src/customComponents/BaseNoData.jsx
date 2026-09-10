import React from "react";
// translation
import { useTranslation } from "react-i18next";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { hexToRgb } from "assets/jss/material-dashboard-pro-react.js";

export default function BaseNoData(props) {
  const { t } = useTranslation();

  const {
    BgColor = "#faa698",
    IconColor = "#f58f7f",
    Text = "No data found",
  } = props;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "0 10px",
        border: "1px solid" + " " + BgColor,
        borderRadius: "6px",
        margin: "10px 0 10px",
        backgroundColor: "rgba(" + hexToRgb(BgColor) + ", 0.1)",
      }}
    >
      <InfoOutlinedIcon
        style={{
          fontSize: "18px",
          marginRight: "4px",
          color: IconColor,
        }}
      />
      <h5 style={{ fontSize: "14px" }}>{t(Text + "")}</h5>
    </div>
  );
}
