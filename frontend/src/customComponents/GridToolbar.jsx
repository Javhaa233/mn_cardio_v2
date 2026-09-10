import React from "react";
import PropTypes from "prop-types";
import { Box } from "@mui/material";

/**
 * The filter-and-action row above a registry grid.
 *
 * Thirteen list screens each hand-assembled this out of GridContainer/GridItem
 * with per-item `pr: 0.5` / `pl: 0.5` gutters, and they had drifted into six
 * different shapes: `marginLeft: "0px"` in seven files, `"1px"` in one,
 * `marginBottom: "0px"` in two, an extra wrapper div in two more, and one file
 * with no width props at all. One of them put `pr` where the rest put `pl`, so
 * its Search button sat a gutter off from every other screen's.
 *
 * A flex row with one gap replaces all of that. Nothing here is per-screen, so
 * there is nothing left to drift.
 *
 * The FormControl rule is the load-bearing part. `theme.js` sets
 * `MuiFormControl.root { marginTop: 6px !important; marginBottom: 6px !important }`,
 * which is right for a stacked form and wrong on a single toolbar line - it is
 * why the filter boxes never sat on the buttons' baseline. `!important` here is
 * the only thing that beats it.
 */
export default function GridToolbar({ children, sx = {} }) {
  return (
    <Box
      sx={{
        flex: "0 0 auto",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "8px",
        marginBottom: "10px",
        "& .MuiFormControl-root": {
          marginTop: "0 !important",
          marginBottom: "0 !important",
        },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

GridToolbar.propTypes = {
  children: PropTypes.node,
  sx: PropTypes.object,
};

/**
 * Sizes one filter control in the row.
 *
 * The controls carried `sx={{ width: 150 }}` / `{ width: 120 }` / nothing at
 * all, applied inconsistently to the control itself - so a control that ignored
 * `sx` simply came out full width. Sizing the wrapper works whatever the child
 * does with its props.
 */
export function ToolbarField({ width = 170, children, sx = {} }) {
  return (
    <Box
      sx={{
        // Full width on a phone, untouched from `sm` up.
        //
        // The toolbar already wraps, but a rigid 170px meant that once a field
        // wrapped onto its own line it stayed 170px with the rest of the line
        // empty beside it - a column of stubby controls. Below `sm` each field
        // takes the line it has already been given. At `sm` and above the
        // width is exactly what it was, so desktop does not move.
        width: { xs: "100%", sm: width },
        maxWidth: "100%",
        minWidth: 0,
        "& .MuiFormControl-root": { width: "100%" },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

ToolbarField.propTypes = {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  children: PropTypes.node,
  sx: PropTypes.object,
};
