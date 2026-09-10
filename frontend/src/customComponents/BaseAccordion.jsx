import React from "react";

// @mui/material components
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
// @mat
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import BaseLabel from "customComponents/BaseViewControls/BaseLabel";

export default function BaseAccordion(props) {
  const { Title = "", children } = props;

  return (
    <div style={{ marginTop: "10px" }}>
      <Accordion
        elevation={0}
        variant="outlined"
        square
        sx={{
          margin: "15px 0",
          "&::before": { opacity: 0 },
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <BaseLabel Label={Title} Size="16px" Weight="500" />
        </AccordionSummary>
        <AccordionDetails style={{ display: "block" }}>
          {children}
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
