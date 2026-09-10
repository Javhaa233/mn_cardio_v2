import React from "react";
import { Grid, Paper } from "@mui/material";

export default ({
  labelLocation = "left",
  colCount = 2,
  children,
  ...props
}) => {
  const formProps = {
    ...props,
  };

  return (
    <Paper style={{ padding: "8px", ...props.style }}>
      <Grid container spacing={1}>
        {children}
      </Grid>
    </Paper>
  );
};
