import React, { useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import { styled } from "@mui/material/styles";
import { DialogContent, Dialog, Tooltip } from "@mui/material";
// default components
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
  margin: "0 6px 6px 0",
  width: "120px",
  height: "100px",
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
  backgroundColor: "rgba(0, 0, 0, 0.4)",
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

export default function AdviceFileInfo(props) {
  const { t } = useTranslation();
  const { Data = null } = props;

  const [ZoomDialog, setZoomDialog] = useState(null);

  const imageExtensions = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "bmp",
    "webp",
    "svg",
    "ico",
    "tiff",
    "tif",
  ];

  const isImageFile = (file) => {
    const ext = file?.FileInfo?.ext?.toLowerCase();
    return ext && imageExtensions.includes(ext);
  };

  // The server reports, with the row, whether the bytes are actually on the
  // host - see BaseControllerHelper.FileOnDisk. An older server leaves the flag
  // undefined, which reads as available.
  const isMissingFile = (file) => file?.FileInfo?.Available === false;

  const missingStyle = (file) =>
    isMissingFile(file)
      ? { cursor: "not-allowed", opacity: 0.65, textDecoration: "line-through" }
      : { cursor: "pointer" };

  const downloadFile = async (file) =>
    await Helper.BaseCrudHelper.BaseDownloadFile(file);

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

  if (Array.isArray(Data)) {
    return (
      <div>
        {ZoomDialog}
        <GridContainer style={{ margin: "0" }}>
          <GridItem
            xs={12}
            sm={12}
            md={12}
            style={{ padding: "0 2px", marginTop: "4px" }}
          >
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {Data.map((file, key) => {
                if (file.FileSrc && file.FileInfo) {
                  const isImage = isImageFile(file);
                  if (isImage) {
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
                  } else {
                    return (
                      <div
                        style={{
                          display: "inline-block",
                          width: "100%",
                          marginBottom: "6px",
                          padding: "2px 4px",
                          borderLeft: "2px solid #ccc",
                        }}
                        key={key}
                      >
                        <LightTooltip
                          title={
                            isMissingFile(file)
                              ? t("Файл серверт олдсонгүй")
                              : t("Download")
                          }
                        >
                          <LinkStyle
                            style={missingStyle(file)}
                            onClick={
                              isMissingFile(file)
                                ? undefined
                                : () => downloadFile(file)
                            }
                          >
                            {file.FileInfo.original_name}.{file.FileInfo.ext}
                          </LinkStyle>
                        </LightTooltip>
                      </div>
                    );
                  }
                }
              })}
            </div>
            {Data.map((file, key) => {
              if (!file.FileSrc && file.FileInfo) {
                return (
                  <div
                    style={{
                      display: "inline-block",
                      width: "100%",
                      marginBottom: "6px",
                      padding: "2px 4px",
                      borderLeft: "2px solid #ccc",
                    }}
                    key={key}
                  >
                    <LightTooltip
                      title={
                        isMissingFile(file)
                          ? t("Файл серверт олдсонгүй")
                          : t("Download")
                      }
                    >
                      <LinkStyle
                        style={missingStyle(file)}
                        onClick={
                          isMissingFile(file)
                            ? undefined
                            : () => downloadFile(file)
                        }
                      >
                        {file.FileInfo.original_name}.{file.FileInfo.ext}
                      </LinkStyle>
                    </LightTooltip>
                  </div>
                );
              }
            })}
          </GridItem>
        </GridContainer>
      </div>
    );
  } else {
    return <div></div>;
  }
}
