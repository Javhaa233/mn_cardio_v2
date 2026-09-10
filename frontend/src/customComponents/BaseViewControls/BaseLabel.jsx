import React from "react";
// translation
import { useTranslation } from "react-i18next";
import FormLabel from "@mui/material/FormLabel";

export default function BaseLabel(props) {
  const { t } = useTranslation();
  const {
    Clear = "none",
    Right = false,
    Color = "rgba(0, 0, 0, 0.8)",
    Size = "14px",
    Weight = "300",
    Lined = false,
    padding = "1px 0",
    MarginTop = 0,
    Label = "",
  } = props;

  return (
    <FormLabel
      style={{
        clear: Clear,
        float: Right ? "right" : "left",
        color: Color,
        fontSize: Size,
        fontWeight: Weight,
        lineHeight: "1.428571429",
        textDecoration: Lined ? "line-through" : "none",
        padding: padding,
        textAlign: Right ? "right" : "left",
        marginTop: MarginTop,
      }}
    >
      {t(Label + "")}
    </FormLabel>
  );
}
