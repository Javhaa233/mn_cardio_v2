import React from "react";
// @mui/material components
import Box from "@mui/material/Box";

/**
 * PageContainer
 *
 * The standard box for a top-level screen inside the Admin/Patient shell.
 *
 * Screens used to size themselves with viewport arithmetic, and there were
 * four different answers in the codebase - `calc(100vh - 123px)`, `- 105px`,
 * `- 165px` and `- 85px` - none of which matched the others, so the grid's
 * bottom edge and the pagination bar sat at a different height on every
 * screen. Each number was a guess at navbar + padding height.
 *
 * No arithmetic is needed. The shell already lays out a flex column
 * (`layouts/Admin.jsx` Content -> route wrapper), so a page that declares
 * `flex: 1` with `minHeight: 0` fills exactly the space that is left, at any
 * navbar height and any zoom level.
 *
 * `MaxWidth` is opt-in. Most screens are full-bleed; pass it only for screens
 * that are deliberately centred.
 */
export default function PageContainer({
  children,
  MaxWidth,
  Padding,
  sx,
  ...rest
}) {
  return (
    <Box
      {...rest}
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        width: "100%",
        maxWidth: MaxWidth || "100%",
        margin: MaxWidth ? "0 auto" : undefined,
        padding: Padding,
        boxSizing: "border-box",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
