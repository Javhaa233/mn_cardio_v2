import React from "react";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

/**
 * FlexContainer - Unified component to replace verbose flex wrapping patterns
 *
 * Replaces the common pattern:
 * <div style={{ flex: "1 1 auto", minHeight: 0, minWidth: 0, maxWidth: "100%", ... }}>
 *   <GridContainer sx={{ margin: 0, width: "100%" }} style={{ flex: "1 1 auto", ... }}>
 *     <GridItem xs={12} md={12} sx={{ padding: 0 }} style={{ display: "flex", flex: "1 1 auto", ... }}>
 *       {children}
 *     </GridItem>
 *   </GridContainer>
 * </div>
 */
export default function FlexContainer({
  children,
  outerStyle = {},
  containerStyle = {},
  itemStyle = {},
  xs = 12,
  md = 12,
  overflow = "hidden",
  ...rest
}) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        flex: "1 1 auto",
        minHeight: 0,
        minWidth: 0,
        maxWidth: "100%",
        ...outerStyle,
      }}
    >
      <GridContainer
        sx={{ margin: 0, width: "100%" }}
        style={{
          flex: "1 1 auto",
          minHeight: 0,
          minWidth: 0,
          maxWidth: "100%",
          height: "100%",
          ...containerStyle,
        }}
        {...rest}
      >
        <GridItem
          xs={xs}
          md={md}
          sx={{ padding: 0 }}
          style={{
            display: "flex",
            flexDirection: "column",
            flex: "1 1 auto",
            minHeight: 0,
            minWidth: 0,
            maxWidth: "100%",
            overflow: overflow,
            ...itemStyle,
          }}
        >
          {children}
        </GridItem>
      </GridContainer>
    </div>
  );
}
