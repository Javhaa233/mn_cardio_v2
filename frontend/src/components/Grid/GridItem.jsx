import React from "react";
// nodejs library to set properties for components
import PropTypes from "prop-types";
// @mui/material components
import Grid from "@mui/material/Grid";

const GridItem = React.forwardRef((props, ref) => {
  const { children, className, sx, xs, sm, md, lg, xl, size, ...rest } = props;

  // Support both old API (xs, sm, md, lg, xl props) and new API (size prop)
  let sizeValue = size;

  // If size prop is not provided, construct it from breakpoint props
  if (!sizeValue) {
    const constructedSize = {};
    if (xs !== undefined) constructedSize.xs = xs;
    if (sm !== undefined) constructedSize.sm = sm;
    if (md !== undefined) constructedSize.md = md;
    if (lg !== undefined) constructedSize.lg = lg;
    if (xl !== undefined) constructedSize.xl = xl;

    if (Object.keys(constructedSize).length > 0) {
      sizeValue = constructedSize;
    }
  }

  return (
    <Grid
      ref={ref}
      {...rest}
      size={sizeValue}
      className={className}
      sx={{
        ...(sx || {}),
      }}
    >
      {children}
    </Grid>
  );
});

GridItem.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

export default GridItem;
