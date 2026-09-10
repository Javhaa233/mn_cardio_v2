import React from "react";

// @mui/material components
import CircularProgress from "@mui/material/CircularProgress";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

export default function BaseLoading() {
  return (
    <GridContainer style={{ width: "100%" }}>
      <GridItem xs={12} sm={12} md={12}>
        <div
          style={{
            position: "relative",
            margin: "15px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div style={{ position: "relative" }}>
            <CircularProgress
              variant="determinate"
              value={100}
              style={{ color: "#eef3fd" }}
            />
            <CircularProgress
              variant="indeterminate"
              disableShrink
              style={{
                color: "#a3a3a3",
                animationDuration: "550ms",
                position: "absolute",
                left: 0,
              }}
            />
          </div>
        </div>
      </GridItem>
    </GridContainer>
  );
}
