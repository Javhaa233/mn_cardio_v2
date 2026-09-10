import React from "react";
// translation
import { useTranslation } from "react-i18next";

export default function IsActiveStatus(props) {
  const { t } = useTranslation();

  const {
    rowdata: { IsActive },
  } = props;

  return (
    <div>
      {IsActive + "" !== "0" && IsActive + "" !== "2" ? (
        <span
          style={{
            padding: "2px 4px",
            borderRadius: "2px",
            color: "white",
            backgroundColor: "#2bb559",
          }}
        >
          {t("Confirmed")}
        </span>
      ) : IsActive + "" === "2" ? (
        <span
          style={{
            padding: "2px 4px",
            borderRadius: "2px",
            color: "white",
            backgroundColor: "#ff5757",
          }}
        >
          {t("Declined")}
        </span>
      ) : (
        <span
          style={{
            padding: "2px 4px",
            borderRadius: "2px",
            color: "white",
            backgroundColor: "#ffbd17",
          }}
        >
          {t("Request received")}
        </span>
      )}
    </div>
  );
}
