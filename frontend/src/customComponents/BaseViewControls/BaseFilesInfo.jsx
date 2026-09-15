import React from "react";
// translation
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import FormLabel from "@mui/material/FormLabel";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import PostMedia from "customComponents/AdviceFeed/PostMedia";
import { forMediaView } from "customComponents/AdviceFeed/mediaUtils";
import { FIELD } from "customComponents/BaseEditControls/fieldRowStyles";
import { space } from "@/theme/tokens";

/**
 * A read-only "attachments" row on the detail views (Visit, Echo, Ecg, Tcd2,
 * FollowUp).
 *
 * The row keeps the label/value shape of every other read-only field. Inside
 * it the files now render with AdviceFeed's PostMedia - the same photo grid,
 * lightbox and download chips the Advice feed and chat use - instead of this
 * file's own 150x120 thumbnails, hover bars in Bootstrap blue (#0d6efd),
 * FontAwesome icons and a separate zoom dialog. One way to look at a scan,
 * wherever the scan is.
 */
export default function BaseFilesInfo(props) {
  const { t } = useTranslation();
  const {
    Data = [],
    Label = "File attachment",
    md = 3,
    LabelColor = FIELD.labelInk,
    Size = "14px",
    LabelWeight = "400",
  } = props;

  const Files = forMediaView(Data);

  const labelHorizontalSx = {
    color: LabelColor,
    display: "inline-flex",
    fontSize: Size,
    lineHeight: 1,
    fontWeight: LabelWeight,
    marginRight: "2px",
    textAlign: "left",
  };

  return (
    <div style={{ width: "100%" }}>
      <GridContainer
        sx={{
          m: 0,
          width: "100%",
          border: `1px solid ${FIELD.rowBorder}`,
          marginTop: "-1px",
          alignItems: "stretch",
          backgroundColor: FIELD.inputBg,
          minHeight: "32px",
        }}
      >
        <GridItem
          xs={12}
          sm={12}
          md={md}
          sx={{
            display: "flex",
            alignItems: "center",
            backgroundColor: FIELD.labelBg,
            borderRight: `1px solid ${FIELD.rowBorder}`,
            px: "15px",
            minHeight: "32px",
          }}
        >
          {Label && (
            <FormLabel sx={labelHorizontalSx}>{t(Label + "") + ":"}</FormLabel>
          )}
        </GridItem>
        <GridItem
          xs={12}
          sm={12}
          md={12 - md}
          sx={{
            display: "flex",
            alignItems: "center",
            p: `${space[1]} ${space[3]} ${space[3]}`,
            backgroundColor: FIELD.inputBg,
            minHeight: "32px",
          }}
        >
          {/* Capped width: a single photo renders whole and uncropped in
              PostMedia, which inside a wide detail row would be page-sized. */}
          <Box sx={{ width: "100%", maxWidth: "520px" }}>
            <PostMedia Files={Files} FullBleedMargin="0" />
          </Box>
        </GridItem>
      </GridContainer>
    </div>
  );
}
