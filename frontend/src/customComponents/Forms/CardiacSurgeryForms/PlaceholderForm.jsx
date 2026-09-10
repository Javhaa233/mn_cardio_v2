import React, { forwardRef, useImperativeHandle } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import Box from "@mui/material/Box";
// @mui/icons-material
import ConstructionIcon from "@mui/icons-material/Construction";

/**
 * Түр зуурын (dummy) маягт.
 * Зүрх судасны мэс заслын 1.1-1.9 маягтууд хөгжүүлэгдэх хүртэл
 * цэсний бүтэц, диалогийг шалгах зорилгоор ашиглана.
 */
const PlaceholderForm = forwardRef((props, ref) => {
  const { t } = useTranslation();

  const {
    Title = "",
    FormNo = "",
    PatientId = null,
    PatientRegNo = null,
  } = props;

  useImperativeHandle(ref, () => ({
    Save: (callback) => callback && callback(false),
    Confirm: (callback) => callback && callback(false),
    Print: (callback) => callback && callback(false),
  }));

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        minHeight: "220px",
        padding: "24px",
        textAlign: "center",
        color: "text.secondary",
      }}
    >
      <ConstructionIcon sx={{ width: "40px", height: "40px" }} />
      <Box sx={{ fontSize: "16px", fontWeight: 500, color: "text.primary" }}>
        {FormNo ? FormNo + " " : ""}
        {Title}
      </Box>
      <Box sx={{ fontSize: "13px" }}>
        {t("Энэ маягт хөгжүүлэлтийн шатанд байна")}
      </Box>
      <Box sx={{ fontSize: "12px" }}>
        {t("Patient")}: {PatientRegNo || PatientId || "-"}
      </Box>
    </Box>
  );
});

PlaceholderForm.displayName = "PlaceholderForm";

export default PlaceholderForm;
