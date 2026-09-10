import React from "react";
// @mui material components
import CircularProgress from "@mui/material/CircularProgress";

export default function PageLoading() {
  return (
    <div
      style={{
        position: "fixed",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      }}
    >
      <div style={{ position: "relative" }}>
        <CircularProgress
          variant="determinate"
          value={100}
          size={78}
          style={{ color: "#e3e3e3" }}
        />
        <CircularProgress
          variant="indeterminate"
          disableShrink
          size={78}
          thickness={3.8}
          style={{
            color: "#1a90ff",
            animationDuration: "550ms",
            position: "absolute",
            left: 0,
            strokeLinecap: "round",
          }}
        />
      </div>
    </div>
  );
}
