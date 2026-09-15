import React from "react";
// translation
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

import { colors } from "@/theme/colors";
import { radius, space } from "@/theme/tokens";

/**
 * "Nothing here" - 80 importers.
 *
 * It was a salmon (#faa698) bordered strip with an info icon: the same colour
 * family as an error, for what is almost always a normal state (no visits yet,
 * no questions yet). It now reads like BaseGrid's own empty overlay - a quiet
 * inbox glyph and one line of muted text - so "no data" looks the same inside a
 * grid and outside one.
 *
 * `BgColor` and `IconColor` stay in the signature and are ignored, like
 * UniCard's `color`: one caller passed brand colours precisely to escape the
 * salmon default. `Action` is an optional slot for the one thing to do next.
 */
export default function BaseNoData(props) {
  const { t } = useTranslation();

  const { BgColor, IconColor, Text = "No data found", Action = null } = props;

  return (
    <Box
      role="status"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: space[2],
        padding: `${space[5]} ${space[4]}`,
        margin: `${space[2]} 0`,
        textAlign: "center",
        backgroundColor: colors.brand.tintSolid,
        borderRadius: radius.md,
      }}
    >
      <InboxOutlinedIcon
        aria-hidden
        sx={{ fontSize: "28px", color: colors.brand.inkDim, opacity: 0.7 }}
      />
      {/* component="div": BaseNoData used to emit a bare h5, which _misc.scss
          restyles; a Typography heading element would inherit the same. */}
      <Typography
        variant="body2"
        component="div"
        sx={{ color: colors.brand.inkMuted, maxWidth: "520px" }}
      >
        {t(Text + "")}
      </Typography>
      {Action}
    </Box>
  );
}
