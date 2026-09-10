import React from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";

import { colors } from "@/theme/colors";
import { radius, elevation } from "@/theme/tokens";

/**
 * The card around a list, a grid or a form. 52 importers.
 *
 * It used to render `components/Card/CardHeader` with `color="info"` and no
 * `text`/`icon` flag, which lands in that component's pill branch: a
 * cyan-gradient badge, `marginTop: -14px` so it straddles the card's top edge,
 * a coloured border and a hover lift. A floating gradient label was the first
 * thing on screen above every data grid in the product.
 *
 * The header is drawn here now, flat, and `components/Card/CardHeader` is left
 * alone - its `groupbox`, `icon`, `stats` and `text` branches still serve
 * GroupPanel and the clinical forms.
 *
 * `color` stays in the signature and is ignored. 52 call sites pass it.
 */
export default function UniCard({
  title,
  actions,
  children,
  padding = 10,
  color, // accepted and ignored - kept so the 52 call sites still type-check
  showHeader = true,
  cardStyle = {},
  cardBodyStyle = {},
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        height: "100%",
        minHeight: 0,
        minWidth: 0,
        margin: 0,
        overflow: "visible",
        backgroundColor: colors.brand.surface,
        border: `1px solid ${colors.brand.hairline}`,
        borderRadius: radius.sm,
        boxShadow: elevation[1],
        ...cardStyle,
      }}
    >
      {/* An empty title used to still draw a header. BaseCrudManager passes ""
          whenever a config has no TitleObject, which left a bare bordered band
          above the grid saying nothing. */}
      {showHeader && (title || actions) && (
        <Box
          sx={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 1,
            padding: "10px 12px",
            borderBottom: `1px solid ${colors.brand.hairline}`,
            overflow: "visible",
          }}
        >
          {/* component="div" is deliberate. A bare h3 is reachable by the
              element-level selectors in styles/_misc.scss, which would restyle
              this from outside the theme. */}
          <Typography
            variant="h3"
            component="div"
            sx={{
              color: colors.brand.ink,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </Typography>
          {actions ? (
            <Box
              sx={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {actions}
            </Box>
          ) : null}
        </Box>
      )}
      <Box
        sx={{
          padding: `${padding}px`,
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden",
          ...cardBodyStyle,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

UniCard.propTypes = {
  title: PropTypes.node,
  /** Optional right-aligned slot in the header - a toolbar, a chip, a count. */
  actions: PropTypes.node,
  children: PropTypes.node,
  padding: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  color: PropTypes.string,
  showHeader: PropTypes.bool,
  cardStyle: PropTypes.object,
  cardBodyStyle: PropTypes.object,
};
