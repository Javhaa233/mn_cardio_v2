import React from "react";
// @mui material components
import CircularProgress from "@mui/material/CircularProgress";

export default function DivLoading(props) {
  const { WithoutCard = false } = props;

  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: "2",
        top: 0,
        bottom: 0,
        borderRadius: "6px",
        backgroundColor: "rgba(130, 130, 130, 0.3)",
        right: WithoutCard ? 0 : "-10px",
        left: WithoutCard ? 0 : "-10px",
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
          thickness={3.8}
          style={{
            color: "#a3a3a3",
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
