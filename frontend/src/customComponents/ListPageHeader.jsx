import React from "react";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { colors } from "@/theme/colors";
import { space, radius, elevation } from "@/theme/tokens";

/**
 * The header strip above a list screen: what you are looking at, how much of it
 * there is, and the actions that apply to the whole list.
 *
 * Every list screen used to open straight onto its filter bar, so a doctor
 * arriving from a link had nothing on screen telling them whose list this was
 * or how big it was. This is that missing line, in one place rather than
 * re-drawn per screen.
 *
 * Deliberately dumb: it takes strings and an `Actions` slot. It resolves
 * nothing and fetches nothing, so a screen whose title needs looking up does
 * that itself and passes the result down.
 */
export default function ListPageHeader({
  Title,
  Overline,
  Count,
  CountLabel,
  Actions,
}) {
  const { t } = useTranslation();
  const hasCount = Count !== undefined && Count !== null && Count !== "";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: space[3],
        padding: space[4],
        marginBottom: space[3],
        backgroundColor: colors.brand.surface,
        border: `1px solid ${colors.brand.hairline}`,
        borderRadius: radius.lg,
        boxShadow: elevation[1],
      }}
    >
      <Box sx={{ flex: "1 1 220px", minWidth: 0 }}>
        {Overline ? (
          <Typography
            variant="overline"
            component="p"
            sx={{ color: colors.brand.inkDim, lineHeight: 1.4 }}
          >
            {Overline}
          </Typography>
        ) : null}

        <Box sx={{ display: "flex", alignItems: "center", gap: space[2] }}>
          {/* role/aria-level rather than a real <h1>: _misc.scss styles bare
              h1-h6 at element level, so a heading element here would inherit
              the template's rules (h6 is uppercased, for one). */}
          <Typography
            variant="h2"
            component="div"
            role="heading"
            aria-level={1}
            noWrap
            sx={{ color: colors.brand.ink, minWidth: 0 }}
          >
            {Title}
          </Typography>

          {hasCount ? (
            <Box
              aria-label={
                CountLabel
                  ? Count + " " + CountLabel
                  : t("{{count}} өвчтөн", { count: Count })
              }
              sx={{
                flex: "0 0 auto",
                padding: `2px ${space[2]}`,
                borderRadius: radius.pill,
                backgroundColor: colors.brand.tint,
                color: colors.brand.cyanInk,
                border: `1px solid ${colors.brand.hairline}`,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {Count} {CountLabel || t("өвчтөн")}
              </Typography>
            </Box>
          ) : null}
        </Box>
      </Box>

      {Actions ? (
        <Box sx={{ display: "flex", gap: space[2], flex: "0 0 auto" }}>
          {Actions}
        </Box>
      ) : null}
    </Box>
  );
}
