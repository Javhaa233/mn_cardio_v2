import React, { useState } from "react";
import PropTypes from "prop-types";

// @mui/material components
import { styled, useTheme } from "@mui/material/styles";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Box from "@mui/material/Box";

// @mui/icons-material
import ExpandMore from "@mui/icons-material/ExpandMore";

import {
  primaryColor,
  grayColor,
} from "assets/jss/material-dashboard-pro-react.js";

const RootBox = styled(Box)({
  flexGrow: 1,
  marginBottom: "20px",
});

const Title = styled("h4")({
  fontSize: "15px",
  fontWeight: "bolder",
  marginTop: "0",
  marginBottom: "0",
  color: "inherit",
});

export default function CustomAccordion(props) {
  const theme = useTheme();
  const { collapses } = props;

  const [active, setActive] = useState(props.active);

  const handleChange = (panel) => (event, expanded) =>
    setActive(expanded ? panel : -1);

  return (
    <RootBox>
      {Array.isArray(collapses) &&
        collapses.map((prop, key) => (
          <Accordion
            expanded={active === key}
            onChange={handleChange(key)}
            key={key}
            sx={{
              boxShadow: "none",
              "&:before": { display: "none !important" },
              "&.Mui-expanded": {
                margin: "0 !important",
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                minHeight: "auto !important",
                backgroundColor: "transparent",
                borderBottom: `1px solid ${grayColor[5]}`,
                padding: "25px 10px 5px 0px",
                borderTopLeftRadius: "3px",
                borderTopRightRadius: "3px",
                color: grayColor[2],
                "&:hover": { color: primaryColor[0] },
                "&.Mui-expanded": {
                  color: primaryColor[0],
                  "& .MuiAccordionSummary-expandIconWrapper": {
                    [theme.breakpoints.up("md")]: { top: "auto !important" },
                    transform: "rotate(180deg)",
                    [theme.breakpoints.down("sm")]: { top: "10px !important" },
                  },
                },
                "& .MuiAccordionSummary-content": {
                  margin: "0 !important",
                },
                "& .MuiAccordionSummary-expandIconWrapper": {
                  [theme.breakpoints.up("md")]: { top: "auto !important" },
                  transform: "rotate(0deg)",
                  color: "inherit",
                  position: "absolute",
                  right: "20px",
                  [theme.breakpoints.down("sm")]: { top: "10px !important" },
                },
              }}
            >
              <Title>{prop.title}</Title>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: "15px 0px 5px" }}>
              {prop.content}
            </AccordionDetails>
          </Accordion>
        ))}
    </RootBox>
  );
}

CustomAccordion.defaultProps = {
  active: -1,
};

CustomAccordion.propTypes = {
  // index of the default active collapse
  active: PropTypes.number,
  collapses: PropTypes.arrayOf(
    PropTypes.shape({ title: PropTypes.string, content: PropTypes.node }),
  ).isRequired,
};
