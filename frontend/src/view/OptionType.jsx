import React from "react";
// @mui/material components
import Box from "@mui/material/Box";
// custom components
import BaseCrudManager from "baseComponents/BaseCrudManager";

export default function OptionType() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        height: "100%",
        gap: 2, // 👈 spacing between boxes (theme spacing: 2 = 16px)
      }}
    >
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          borderBottom: "1px solid #ddd",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <BaseCrudManager
          ObjectName="DicoType"
          HideRangeDate={true}
          GridHideCheck={true}
          isDialog={false}
          HideExport={true}
          widthPattern="40c, 150,150, 200"
          formSize={{ height: "600px", width: "700px" }}
        />
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          borderBottom: "1px solid #ddd",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <BaseCrudManager
          ObjectName="OptionTypes"
          HideRangeDate={true}
          GridHideCheck={true}
          isDialog={false}
          HideExport={true}
          widthPattern="40c, 150,150, 60c, 70c"
          formSize={{ height: "300px", width: "700px" }}
        />
      </Box>
    </Box>
  );
}
