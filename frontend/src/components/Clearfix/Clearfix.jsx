import React from "react";
import { styled } from "@mui/material/styles";

const ClearfixDiv = styled("div")({
  "&:after,&:before": { display: "table", content: '" "' },
  "&:after": { clear: "both" },
});

export default function Clearfix() {
  return <ClearfixDiv />;
}
