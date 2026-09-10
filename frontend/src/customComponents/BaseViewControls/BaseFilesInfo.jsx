import React, { useState } from "react";
// translation
import { useTranslation } from "react-i18next";

import { styled } from "@mui/material/styles";
import DialogContent from "@mui/material/DialogContent";
import Dialog from "@mui/material/Dialog";
import Tooltip from "@mui/material/Tooltip";
import FormLabel from "@mui/material/FormLabel";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// helper
import Helper from "helper";

const LightTooltip = styled(Tooltip)(() => ({
  tooltip: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: "#FFF",
    textTransform: "uppercase",
    fontSize: 11,
    marginTop: "2px",
  },
}));

const StyledDialogPaper = styled("div")({
  margin: 0,
  padding: 0,
});

const ThumbnailDiv = styled("div")(({ theme }) => ({
  position: "relative",
  overflow: "inherit",
  float: "left",
  display: "inline-block",
  margin: "0 10px 10px 0",
  width: "150px",
  height: "120px",
  "&:hover $downloadDiv, &:hover $zoomInDiv": {
    display: "block",
  },
}));

const DownloadDiv = styled("div")(({ theme }) => ({
  display: "none",
  position: "absolute",
  cursor: "pointer",
  bottom: "0",
  left: "0",
  right: "0",
  zIndex: "999",
  textAlign: "center",
  color: "#FFF",
  backgroundColor: "#0d6efd", // Common file upload/download button color (bootstrap primary)
  padding: "0 4px 4px",
  fontWeight: "400",
  "&:hover": { display: "block" },
}));

const ZoomInDiv = styled("div")(({ theme }) => ({
  display: "none",
  position: "absolute",
  cursor: "pointer",
  top: "0",
  right: "0",
  zIndex: "999",
  textAlign: "center",
  color: "#FFF",
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  padding: "0 8px 4px",
  fontWeight: "400",
  "&:hover": { display: "block" },
}));

const ZoomOutDiv = styled("div")(({ theme }) => ({
  cursor: "pointer",
  textAlign: "center",
  color: "#FFF",
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  padding: "0 16px 8px",
}));

const LinkStyle = styled("a")(({ theme }) => ({
  fontSize: "16px",
  fontWeight: "400",
  "&:hover": { textDecoration: "underline" },
}));

export default function BaseFilesInfo(props) {
  const { t } = useTranslation();
  const {
    Data = [],
    Label = "File attachment",
    md = 3,
    Left = false,
    LabelColor = "#75736c",
    Size = "14px",
    LabelWeight = "400",
    padding = "0 12px",
    margin = "0",
  } = props;

  const [ZoomDialog, setZoomDialog] = useState(null);

  const downloadFile = async (file) =>
    await Helper.BaseCrudHelper.BaseDownloadFile(file);

  const labelHorizontalSx = {
    color: LabelColor,
    cursor: "pointer",
    display: "inline-flex",
    fontSize: Size,
    lineHeight: 1,
    fontWeight: LabelWeight,
    marginRight: "2px",
    textAlign: "left",
  };

  const Zoom = (file) => {
    setZoomDialog(
      <Dialog
        open
        scroll="body"
        onClose={() => setZoomDialog(null)}
        maxWidth="md"
        disableEscapeKeyDown
        PaperProps={{
          style: { margin: 0, padding: 0 },
        }}
      >
        <DialogContent
          style={{ borderRadius: "0", padding: "0", overFlow: "hidden" }}
        >
          <div
            style={{
              position: "absolute",
              display: "flex",
              top: "0",
              right: "0",
              zIndex: "999",
            }}
          >
            <LightTooltip title={t("Download")}>
              <ZoomOutDiv onClick={() => downloadFile(file)}>
                <i
                  className={"fa fa-download"}
                  style={{ fontSize: "24px", marginTop: "8px" }}
                />
              </ZoomOutDiv>
            </LightTooltip>
            <LightTooltip title={t("Back")}>
              <ZoomOutDiv onClick={() => setZoomDialog(null)}>
                <i
                  className={"fa fa-search-minus"}
                  style={{ fontSize: "24px", marginTop: "8px" }}
                />
              </ZoomOutDiv>
            </LightTooltip>
          </div>
          <img
            src={file.FileSrc}
            style={{
              width: "auto",
              height: "auto",
              maxWidth: "960px",
              maxHeight: "90vh",
            }}
            alt={file.FileInfo.original_name}
          />
        </DialogContent>
      </Dialog>,
    );
  };

  const borderColor = "#d0d0d0";

  return (
    <div style={{ width: "100%" }}>
      {ZoomDialog}
      <GridContainer
        sx={{
          m: 0,
          width: "100%",
          border: `1px solid ${borderColor}`,
          borderRadius: "4px",
          marginTop: "-1px",
          alignItems: "stretch",
          backgroundColor: "#fff",
          transition: "border-color 0.15s ease-in-out",
          minHeight: "32px",
          "&:hover": {
            borderColor: borderColor,
          },
          "&:focus-within": {
            borderColor: borderColor,
          },
        }}
      >
        <GridItem
          xs={12}
          sm={12}
          md={md}
          sx={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#f5f5f5",
            borderRight: `1px solid ${borderColor}`,
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
            p: "4px 12px",
            backgroundColor: "#fff",
            minHeight: "32px",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", width: "100%" }}>
            {Array.isArray(Data)
              ? Data.map((file, key) => {
                  if (file.FileSrc) {
                    return (
                      <ThumbnailDiv key={key}>
                        <LightTooltip title={t("Download")}>
                          <DownloadDiv
                            className="download"
                            onClick={() => downloadFile(file)}
                          >
                            <i
                              className={"fa fa-download"}
                              style={{ fontSize: "18px", marginTop: "4px" }}
                            />
                          </DownloadDiv>
                        </LightTooltip>
                        <ZoomInDiv
                          className="zoomIn"
                          onClick={() => Zoom(file)}
                        >
                          <i
                            className={"fa fa-search-plus"}
                            style={{ fontSize: "18px", marginTop: "8px" }}
                          />
                        </ZoomInDiv>
                        <img
                          src={file.FileSrc}
                          style={{
                            objectFit: "cover",
                            width: "100%",
                            height: "100%",
                            cursor: "pointer",
                          }}
                          onClick={() => Zoom(file)}
                          alt={file.FileInfo.original_name}
                        />
                      </ThumbnailDiv>
                    );
                  }
                })
              : null}
          </div>
          {Array.isArray(Data)
            ? Data.map((file, key) => {
                if (!file.FileSrc && file.FileSrc === undefined) {
                  if (file.FileInfo) {
                    return (
                      <div
                        style={{
                          display: "inline-block",
                          width: "100%",
                          marginBottom: "12px",
                          padding: "2px 8px",
                          borderLeft: "2px solid #ccc",
                        }}
                        key={key}
                      >
                        <LightTooltip title={t("Download")}>
                          <LinkStyle
                            style={{ cursor: "pointer" }}
                            onClick={() => downloadFile(file)}
                          >
                            {file.FileInfo.original_name}.{file.FileInfo.ext}
                          </LinkStyle>
                        </LightTooltip>
                      </div>
                    );
                  } else {
                    return null;
                  }
                }
              })
            : null}
        </GridItem>
      </GridContainer>
    </div>
  );
}
