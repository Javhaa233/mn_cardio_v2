import React from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import Box from "@mui/material/Box";
// @mui/icons-material
import SearchOffIcon from "@mui/icons-material/SearchOff";
// default components
import Button from "components/CustomButtons/Button";
// theme
import { colors } from "@/theme/colors";
// history
import customHistory from "customHistory";

/**
 * NotFound
 *
 * Rendered by every layout's `path="*"` route. Before this existed, an unknown
 * URL - a stale bookmark, a typo, or a route a role is not allowed to see -
 * rendered an empty panel with no explanation and no way forward.
 *
 * `HomePath` lets each layout say where "back" goes, since /admin and /patient
 * have different landing pages.
 */
export default function NotFound({ HomePath = "/admin" }) {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: "320px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        padding: "40px 20px",
        textAlign: "center",
        backgroundColor: colors.background.primary,
        borderRadius: "3px",
      }}
    >
      <SearchOffIcon sx={{ fontSize: "44px", color: colors.text.disabled }} />
      <Box
        sx={{
          fontSize: "18px",
          fontWeight: 500,
          color: colors.text.primary,
        }}
      >
        {t("Хуудас олдсонгүй")}
      </Box>
      <Box
        sx={{
          fontSize: "13px",
          color: colors.text.secondary,
          maxWidth: "420px",
        }}
      >
        {t("Таны хайсан хуудас байхгүй эсвэл нэвтрэх эрх хүрэхгүй байна")}
      </Box>
      <Button
        color="info"
        size="sm"
        style={{ textTransform: "none", borderRadius: "3px", marginTop: "6px" }}
        onClick={() => customHistory.push(HomePath)}
      >
        {t("Нүүр хуудас руу буцах")}
      </Button>
    </Box>
  );
}
