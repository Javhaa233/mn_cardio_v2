import React from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import Box from "@mui/material/Box";
// @mui/icons-material
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
// default components
import Button from "components/CustomButtons/Button";
// theme
import { colors } from "@/theme/colors";

/**
 * LoadError
 *
 * Shown when a screen cannot load the data it needs. Before this existed, a
 * failed request left list screens spinning forever and forms rendering as
 * label-less empty boxes, with no way to recover short of a page reload.
 *
 * Shares its visual language with `view/NotFound.jsx` so the app has one idiom
 * for "this screen cannot show you what you asked for".
 */
export default function LoadError({ Message, Retry, MinHeight = "160px" }) {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        minHeight: MinHeight,
        padding: "28px 20px",
        textAlign: "center",
        backgroundColor: colors.background.primary,
        borderRadius: "3px",
      }}
    >
      <ErrorOutlineIcon sx={{ fontSize: "36px", color: colors.label.error }} />
      <Box
        sx={{ fontSize: "15px", fontWeight: 500, color: colors.text.primary }}
      >
        {t("Мэдээлэл ачаалахад алдаа гарлаа")}
      </Box>
      {Message ? (
        <Box
          sx={{
            fontSize: "12.5px",
            color: colors.text.secondary,
            maxWidth: "420px",
          }}
        >
          {t(Message + "")}
        </Box>
      ) : null}
      {Retry ? (
        <Button
          color="info"
          size="sm"
          style={{
            textTransform: "none",
            borderRadius: "3px",
            marginTop: "4px",
          }}
          onClick={Retry}
        >
          <RefreshIcon />
          {t("Дахин оролдох")}
        </Button>
      ) : null}
    </Box>
  );
}
