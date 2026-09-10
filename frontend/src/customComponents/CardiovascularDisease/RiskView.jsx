import React from "react";

export default function RiskView(props) {
  const { rowdata } = props;
  const level = rowdata ? rowdata.Risk : "";

  let bodyColor = "blue";
  let bodyText = "";

  if (level) {
    switch (level) {
      case 5:
        bodyColor = "brown";
        bodyText = "30-аас дээш хувь";
        break;
      case 4:
        bodyColor = "red";
        bodyText = "20-30 хувь";
        break;
      case 3:
        bodyColor = "orange";
        bodyText = "10-20 хувь";
        break;
      case 2:
        bodyColor = "#e6de02";
        bodyText = "5-10 хувь";
        break;
      case 1:
        bodyColor = "green";
        bodyText = " 5-аас бага хувь ";
        break;
      default:
        bodyColor = "blue";
        bodyText = "";
        break;
    }

    return (
      <span
        style={{
          backgroundColor: bodyColor,
          color: "#fff",
          fontWeight: "normal",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {bodyText}
      </span>
    );
  }
}
