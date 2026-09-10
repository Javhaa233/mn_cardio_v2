import React from "react";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

import BaseLabel from "customComponents/BaseViewControls/BaseLabel";

export default function CustomContainer(props) {
  const {
    children,
    MarginTop = 0,
    Label = "",
    NoDivBorder = false,
    ...rest
  } = props;

  return (
    <GridContainer {...rest}>
      <GridItem
        xs={12}
        sm={2}
        md={2}
        style={{
          marginTop: MarginTop,
          display: "flex",
          alignItems: "center",
        }}
      >
        <BaseLabel Label={Label} Weight="500" Size="15px" />
      </GridItem>
      <GridItem xs={12} sm={10} md={10}>
        <GridContainer style={{ width: "100%" }}>
          <div
            style={{
              border: NoDivBorder ? "none" : "1px solid #ccc",
              margin: "8px 0",
              display: "flex",
              width: "100%",
              paddingLeft: "10px",
              alignItems: "center",
            }}
          >
            {children}
          </div>
        </GridContainer>
      </GridItem>
    </GridContainer>
  );
}
