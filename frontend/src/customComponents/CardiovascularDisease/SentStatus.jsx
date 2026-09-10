import React from "react";
import { useTranslation } from "react-i18next";

export default function SentStatus(props) {
  const { t } = useTranslation();
  const spanStyle = { padding: "2px 4px", borderRadius: "2px", color: "white" };

  const { rowdata } = props;

  return (
    <div>
      {rowdata.RequestStatus &&
      rowdata.RequestStatus + "" === "successfully" ? (
        <span style={{ ...spanStyle, backgroundColor: "#2bb559" }}>
          {t("Амжилттай")}
        </span>
      ) : rowdata.RequestStatus &&
        rowdata.RequestStatus + "" === "unsuccessfully" ? (
        <span style={{ ...spanStyle, backgroundColor: "#ff5757" }}>
          {t("Амжилтгүй")}
        </span>
      ) : (
        <span style={{ ...spanStyle, backgroundColor: "#a9b0ab" }}>
          {t("Илгээсэн")}
        </span>
      )}
    </div>
  );
}
