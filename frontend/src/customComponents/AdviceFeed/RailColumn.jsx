import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { colors } from "@/theme/colors";
import { space } from "@/theme/tokens";

/**
 * A collapsible rail. Knows nothing about what is inside it.
 *
 * Collapsed, the track is a narrow spine holding the chevron and a count, so it
 * still reads as "there is content here" rather than as a mystery affordance.
 */
export default function RailColumn({
  collapsed,
  onToggle,
  side = "right",
  count,
  id,
  children,
}) {
  const { t } = useTranslation();

  // The chevron always points the way the rail will move.
  const collapseIcon =
    side === "right" ? <ChevronRightIcon /> : <ChevronLeftIcon />;
  const expandIcon =
    side === "right" ? <ChevronLeftIcon /> : <ChevronRightIcon />;

  const label = collapsed
    ? t("Хажуугийн хэсгийг дэлгэх")
    : t("Хажуугийн хэсгийг хураах");

  const toggle = (
    <Tooltip title={label} placement={side === "right" ? "left" : "right"}>
      <IconButton
        size="small"
        onClick={onToggle}
        aria-label={label}
        aria-expanded={!collapsed}
        aria-controls={id}
        sx={{
          color: colors.text.muted,
          "&:hover": { backgroundColor: colors.background.hover },
        }}
      >
        {collapsed ? expandIcon : collapseIcon}
      </IconButton>
    </Tooltip>
  );

  if (collapsed) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: space[1],
          pt: space[1],
        }}
      >
        {toggle}
        {count ? (
          <Box sx={{ fontSize: "11px", color: colors.text.muted }}>{count}</Box>
        ) : null}
      </Box>
    );
  }

  return (
    <Box sx={{ minWidth: 0 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: side === "right" ? "flex-end" : "flex-start",
          minHeight: "32px",
          alignItems: "center",
          mb: space[1],
        }}
      >
        {toggle}
      </Box>
      <Box id={id}>{children}</Box>
    </Box>
  );
}
