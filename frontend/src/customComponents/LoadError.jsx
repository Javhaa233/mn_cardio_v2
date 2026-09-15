import React from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
// @mui/icons-material
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
// theme
import { colors } from "@/theme/colors";
import { space } from "@/theme/tokens";
import { gridToolbarButtonSx } from "@/theme/controlStyles";

/**
 * LoadError
 *
 * Shown when a screen cannot load the data it needs. Before this existed, a
 * failed request left list screens spinning forever and forms rendering as
 * label-less empty boxes, with no way to recover short of a page reload.
 *
 * Shares its visual language with `view/NotFound.jsx` so the app has one idiom
 * for "this screen cannot show you what you asked for". `PageTabs/
 * TabErrorBoundary` renders this too, with `Title` and `Close`.
 */
export default function LoadError({
  Message,
  Retry,
  Close,
  Title = "Мэдээлэл ачаалахад алдаа гарлаа",
  MinHeight = "160px",
}) {
  const { t } = useTranslation();

  return (
    <Box
      role="alert"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: space[2],
        minHeight: MinHeight,
        padding: `${space[6]} ${space[5]}`,
        textAlign: "center",
      }}
    >
      <ErrorOutlineIcon
        aria-hidden
        sx={{ fontSize: "36px", color: colors.status.danger }}
      />
      <Typography variant="h5" component="div" sx={{ color: colors.brand.ink }}>
        {t(Title)}
      </Typography>
      {Message ? (
        <Typography
          variant="body2"
          component="div"
          sx={{ color: colors.brand.inkDim, maxWidth: "420px" }}
        >
          {t(Message + "")}
        </Typography>
      ) : null}
      {Retry || Close ? (
        <Box sx={{ display: "flex", gap: space[2], marginTop: space[2] }}>
          {Retry ? (
            <Button
              disableElevation
              startIcon={<RefreshIcon />}
              onClick={Retry}
              sx={gridToolbarButtonSx.neutral}
            >
              {t("Дахин оролдох")}
            </Button>
          ) : null}
          {Close ? (
            <Button
              disableElevation
              startIcon={<CloseIcon />}
              onClick={Close}
              sx={gridToolbarButtonSx.danger}
            >
              {t("Хаах")}
            </Button>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
}
