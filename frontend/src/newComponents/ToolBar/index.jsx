import React from "react";
import { Toolbar as MuiToolbar, Button, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  SaveAlt as ExportIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";

import { gridToolbarButtonSx } from "@/theme/controlStyles";

/**
 * The five-button bar on the newer list screens (Organization, and the
 * NationalRegistry/New/* family).
 *
 * Ranked like every other toolbar in the app now: `Шинэ` is the filled action,
 * `Устгах` is outlined danger, everything else is outlined neutral. It used to
 * be five identical outlined buttons in five different MUI palette colours -
 * success, primary, error, success, primary - which encoded nothing.
 *
 * Labels go through t() rather than being hardcoded Mongolian fallbacks; the
 * caller's `texts` override still wins where it is supplied.
 */
export default ({
  clickExport,
  clickRefresh,
  clickCreate,
  clickDelete,
  clickEdit,
  hideCreate,
  hideEdit,
  hideDelete,
  hideExport,
  texts,
  children,
  ...props
}) => {
  const { t } = useTranslation();

  return (
    <MuiToolbar
      disableGutters
      sx={{
        px: 0.25,
        py: 0.7,
        minHeight: "36px !important",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        ...props.sx,
      }}
    >
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        {!hideCreate && (
          <Button
            variant="contained"
            onClick={clickCreate}
            startIcon={<AddIcon />}
            sx={gridToolbarButtonSx.primary}
          >
            {texts?.create || t("Шинэ")}
          </Button>
        )}

        <Button
          variant="outlined"
          onClick={clickRefresh}
          startIcon={<RefreshIcon />}
          sx={gridToolbarButtonSx.neutral}
        >
          {texts?.reload || t("Сэргээх")}
        </Button>

        {!hideEdit && clickEdit && (
          <Button
            variant="outlined"
            onClick={clickEdit}
            startIcon={<EditIcon />}
            sx={gridToolbarButtonSx.neutral}
          >
            {texts?.edit || t("Засах")}
          </Button>
        )}

        {!hideDelete && (
          <Button
            variant="outlined"
            onClick={clickDelete}
            startIcon={<DeleteIcon />}
            sx={gridToolbarButtonSx.danger}
          >
            {texts?.destroy || t("Устгах")}
          </Button>
        )}

        {children}
      </Box>

      {!hideExport && (
        <Button
          variant="outlined"
          onClick={clickExport}
          startIcon={<ExportIcon />}
          sx={gridToolbarButtonSx.neutral}
        >
          {texts?.export || t("Экспорт")}
        </Button>
      )}
    </MuiToolbar>
  );
};
