import React from "react";
import { Grid } from "@mui/material";

/**
 * One cell of the registry filter bars.
 *
 * TWO BUGS FIXED HERE, AND THE FIRST ONE IS THE REASON THE SECOND WAS HIDDEN
 *
 * 1. It rendered `<Grid item xs={...}>`. That is the MUI v5 API. This app is on
 *    MUI v7, where `Grid` IS the former Grid v2: `item` and the bare breakpoint
 *    props were removed in favour of `size`. So `xs` was not a layout
 *    instruction at all - it was an unknown prop forwarded to the DOM, and
 *    every cell fell back to auto width. (`components/Grid/GridItem` exists
 *    precisely to translate the old props for the ~191 files that still pass
 *    them; this file bypassed it.)
 *
 * 2. The widths it meant to set had no mobile step. `colSpan: 1` asked for
 *    `xs={4}` - one third of the line at EVERY size, including a 360px phone,
 *    which leaves ~110px for a filter control.
 *
 * Both are addressed by stacking at `xs` and applying the intended three-column
 * layout from `sm` up.
 */
export default ({ children, colSpan = 1, style, ...props }) => {
  // The intended three-column layout, applied from `sm` upward.
  const span = colSpan === 1 ? 4 : colSpan === 2 ? 8 : 12;

  return (
    <Grid
      size={{ xs: 12, sm: span }}
      style={{ display: "flex", alignItems: "center", ...style }}
      {...props}
    >
      {children}
    </Grid>
  );
};
