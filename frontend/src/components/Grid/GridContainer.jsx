import React from "react";
// nodejs library to set properties for components
import PropTypes from "prop-types";
// @mui/material components
import Grid from "@mui/material/Grid";

const GridContainer = React.forwardRef((props, ref) => {
  const { children, className, sx, spacing, ...rest } = props;

  return (
    <Grid
      container
      ref={ref}
      spacing={spacing !== undefined ? spacing : 0}
      {...rest}
      className={className}
      sx={{
        ...(sx || {}),
      }}
    >
      {children}
    </Grid>
  );
});

GridContainer.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

export default GridContainer;
