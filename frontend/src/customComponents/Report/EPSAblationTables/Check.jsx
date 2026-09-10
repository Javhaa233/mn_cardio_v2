import React from "react";

export default function Check(props) {
  const { Check = false } = props;

  return (
    <div
      style={{
        float: "left",
        position: "relative",
        border: "1px solid #ccc",
        width: "12px",
        height: "12px",
        marginTop: "4px",
        marginRight: "3px",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "-6px",
          fontSize: "18px",
          fontWeight: "600",
          //   visibility: Check ? "visible" : "hidden",
          display: Check ? "block" : "none",
        }}
      >
        ✓
      </span>
    </div>
  );
}
