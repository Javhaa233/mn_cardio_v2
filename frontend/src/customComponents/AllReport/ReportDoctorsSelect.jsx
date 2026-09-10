import React from "react";
// translation
import { useTranslation } from "react-i18next";

import BaseLookUpGridLoad from "baseComponents/Controls/BaseLookUpGridLoad";

export default function ReportDoctorsSelect(props) {
  const { t } = useTranslation();
  const { Value = null, ChangeValue } = props;

  const Config = {
    Name: "UserId",
    placeholder: "Нэр, И-мэйл",
    Config: {
      ObjectName: "DoctorsProfile",
      IdField: "id",
      TextField: "firstname",
      MinTextLength: 1,
      Fields: [
        { Label: t("First name"), Name: "firstname" },
        { Label: t("Email"), Name: "email" },
      ],
    },
  };

  const labelStyle = {
    padding: 0,
    margin: "0 0 2px 0", // 🔽 reduced gap
    lineHeight: "14px",
    fontSize: "12px",
  };

  return (
    <div>
      {/* Label */}
      <h5 style={labelStyle}>{t("Doctor")}</h5>

      {/* Doctor lookup */}
      <BaseLookUpGridLoad
        Config={Config}
        Value={Value}
        ChangeValue={(value) => ChangeValue && ChangeValue(value)}
      />
    </div>
  );
}
