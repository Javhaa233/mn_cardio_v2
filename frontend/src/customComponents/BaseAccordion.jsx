import React from "react";
import { useTranslation } from "react-i18next";

// @mui/material components
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
// @mat
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/tokens";

/**
 * A collapsible section of the cardiovascular patient page (history, body
 * size, 10-year risk, examination plan, analysis).
 *
 * It was a square MUI outlined accordion with a grey summary bar and a
 * BaseLabel title - a different panel from every GroupPanel and card around
 * it. Same content and behaviour; brand hairline, radius and label tint.
 */
export default function BaseAccordion(props) {
  const { Title = "", children } = props;
  const { t } = useTranslation();

  return (
    <Accordion
      disableGutters
      elevation={0}
      TransitionProps={{ unmountOnExit: false }}
      sx={{
        mt: 1.5,
        backgroundColor: colors.brand.surface,
        border: `1px solid ${colors.brand.hairline}`,
        borderRadius: `${radius.md} !important`,
        overflow: "hidden",
        "&::before": { display: "none" },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: colors.brand.inkDim }} />}
        sx={{
          minHeight: 48,
          px: 2,
          backgroundColor: colors.brand.tintSolid,
          "&:hover": { backgroundColor: colors.brand.tintSolidHover },
          "&.Mui-expanded": {
            borderBottom: `1px solid ${colors.brand.hairline}`,
          },
        }}
      >
        <Typography
          variant="h5"
          component="div"
          sx={{ color: colors.brand.ink }}
        >
          {t((Title + "").trim())}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ display: "block", p: 2 }}>
        {children}
      </AccordionDetails>
    </Accordion>
  );
}
