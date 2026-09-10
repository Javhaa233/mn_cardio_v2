import React from "react";
import { useTranslation } from "react-i18next";

export default function DateStatus(props) {
  const { t } = useTranslation();
  const spanStyle = { padding: "2px 4px", borderRadius: "2px", color: "white" };

  const { rowdata } = props;

  return (
    <div>
      {rowdata.date_status && rowdata.date_status + "" === "simple" ? (
        <span style={{ ...spanStyle, backgroundColor: "#2bb559" }}>
          {t("Хэвийн")}
        </span>
      ) : rowdata.date_status && rowdata.date_status + "" === "date_expired" ? (
        <span style={{ ...spanStyle, backgroundColor: "#ff5757" }}>
          {t("Хугацаа дууссан")}
        </span>
      ) : rowdata.date_status && rowdata.date_status + "" === "date_warning" ? (
        <span style={{ ...spanStyle, backgroundColor: "#ffcc00" }}>
          {t("Хугацаа тулсан")}
        </span>
      ) : (
        <span style={{ ...spanStyle, backgroundColor: "#a9b0ab" }}>
          {t("Тодорхойгүй")}
        </span>
      )}
    </div>
  );
}
