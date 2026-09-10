import React, { useEffect, useState, useRef } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import { styled } from "@mui/material/styles";
import FormLabel from "@mui/material/FormLabel";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
// @mui/icons-material
import CloseIcon from "@mui/icons-material/Close";
// default components
import Button from "components/CustomButtons/Button";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// helper
import Helper from "helper";

import baseControlsStyles from "assets/jss/material-dashboard-pro-react/custom/baseControlsStyles";

const LightTooltip = styled(Tooltip)({
  tooltip: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: "#FFF",
    textTransform: "uppercase",
    fontSize: 11,
    marginTop: "2px",
  },
});

const ThumbnailDiv = styled("div")({
  ...baseControlsStyles.thumbnail,
  margin: "0 10px 5px 0",
});
const ImagePanelDiv = styled("div")(baseControlsStyles.imagePanel);
const ImageStyled = styled("img")(baseControlsStyles.image);
const DownloadDiv = styled("div")(baseControlsStyles.download);
const LinkStyled = styled("a")(baseControlsStyles.link);

const labelHorizontalSx = {
  color: "#75736c",
  cursor: "pointer",
  display: "inline-flex",
  fontSize: "14px",
  lineHeight: "1.428571429",
  fontWeight: "400",
  paddingTop: "0",
  marginRight: "0",
  textAlign: "left",
  whiteSpace: "normal",
};

// var Value = [{
//    id_data
//    ext: "JPG",
//    hash: "1",
//    original_name: "1212",
//    generated_name: "dwdw"
//    LinkedObjectName:"DoctorsProfile",
//    LinkedObjectId:"319",
//    File:"blob",
//    FileSrc:"base64" only picture,
// }];

export default function BaseFileUpload(props) {
  const { t } = useTranslation();
  const generatedId = React.useId();

  const {
    Config = null,
    Value = [],
    WithLabel = false,
    md = 4.8,
    LabelWidth,
    borderColor = "#eee",
    Id = null,
    ChangeValue,
    maxFileSize = 100, // MB, default 100MB
    allowedFileTypes = [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "bmp",
      "tiff",
      "webp",
      "doc",
      "docx",
      "pdf",
      "mp4",
      "avi",
      "mov",
      "wmv",
      "flv",
      "webm",
      "mkv",
      "m4v",
    ], // Array of allowed extensions e.g., ['jpg', 'png', 'pdf', 'mp4']
  } = props;

  const effectiveMd = LabelWidth ? (LabelWidth / 100) * 12 : md;

  // The real <input type="file"> is display:none (see .fileinput in
  // assets/css/material-dashboard-pro-react.css) and is driven by the visible
  // "Choose files" button. It still gets an id so the field label can be
  // associated with it, and an aria-label so it is never nameless.
  const inputId = Id || generatedId;

  const [currentValue, setCurrentValue] = useState(Value);
  const [Update, setUpdate] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  let fileInput = useRef();

  useEffect(() => {
    Array.isArray(Value) && setCurrentValue(Value);
  }, [Value]);

  //FileUrl: URL.createObjectURL(file),
  //   const ShowProgress = (evt) => {
  //     setProcent((evt.loaded / evt.total) * 100);
  //   };

  //   const ResetProgressBar = () => {
  //     setProcent(0);
  //   };

  const downloadFile = async (file) =>
    await Helper.BaseCrudHelper.BaseDownloadFile(file);

  const openPreview = (file) => {
    setPreviewFile(file);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewFile(null);
  };

  const Remove = (Name) => {
    var NewValue = currentValue;
    NewValue = NewValue.filter((s) => s.FileInfo.Name !== Name);
    ChangeValue && ChangeValue(NewValue);
    fileInput.current.value = "";
    setCurrentValue(NewValue);
    setUpdate(!Update);
  };

  const validateFile = (file) => {
    const fileSizeMB = file.size / (1024 * 1024);
    const fileExtension = file.name.split(".").pop().toLowerCase();

    // Check file size
    if (fileSizeMB > maxFileSize) {
      return {
        valid: false,
        error:
          t("File size exceeds maximum allowed size") +
          ` (${maxFileSize}MB). ${file.name}: ${fileSizeMB.toFixed(2)}MB`,
      };
    }

    // Check file type if restrictions are specified
    if (allowedFileTypes && allowedFileTypes.length > 0) {
      if (!allowedFileTypes.includes(fileExtension)) {
        return {
          valid: false,
          error:
            t("File type not allowed") +
            `. ${file.name}: .${fileExtension}. ` +
            t("Allowed types") +
            `: ${allowedFileTypes.join(", ")}`,
        };
      }
    }

    return { valid: true };
  };

  const ChooseFile = async (e) => {
    e.preventDefault();
    setValidationError(null);

    let files = e.target.files;
    // COPIED, not appended in place. This used to be `= currentValue`, pushed
    // into, and handed to ChangeValue - the same array object the parent was
    // already holding. React compares with Object.is, so every parent's
    // setState was a no-op: the array did gain the file (which is why saving
    // always worked) but the parent never re-rendered, and anything derived
    // from it during render - a file count, an enabled/disabled Send button -
    // silently never updated. Remove() below was always correct because
    // filter() returns a new array; only this path was mutating.
    var NewValue = Array.isArray(currentValue) ? [...currentValue] : [];
    var validationErrors = [];

    for (var l = 0; l < files.length; l++) {
      var file = files[l];

      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        validationErrors.push(validation.error);
        continue; // Skip this file
      }

      var FileSrc = null;
      if (file.type.indexOf("image") > -1) {
        try {
          FileSrc = await Helper.FileHelper.GetFileSrc(file);
        } catch (err) {
          console.error("Error reading file:", err);
        }
      }

      NewValue.push({
        FileSrc,
        File: file,
        Type: file.type,
        FileInfo: { Name: file.name },
      });
    }

    // Show validation errors if any
    if (validationErrors.length > 0) {
      setValidationError(validationErrors.join("\n"));
    }

    ChangeValue && ChangeValue(NewValue);
    setCurrentValue(NewValue);
    setUpdate(!Update);

    // Reset file input
    fileInput.current.value = "";
  };

  const GetControl = () => {
    return (
      <div
        className="fileinput"
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          minHeight: "auto",
          paddingTop: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            padding: "0px",
          }}
        >
          <Button
            onClick={() => fileInput.current.click()}
            size="sm"
            style={{
              margin: "0px",
              backgroundColor: "#5ba3ff",
              color: "#FFF",
              border: "1px solid #5ba3ff",
              boxShadow: "none",
            }}
          >
            {t("Choose files")}
          </Button>
        </div>
        <input
          id={inputId}
          type="file"
          multiple
          aria-label={
            Config && Config.Label ? t(Config.Label + "") : t("Choose files")
          }
          onChange={ChooseFile}
          ref={fileInput}
        />
        {validationError && (
          <div
            style={{
              marginTop: "8px",
              padding: "8px 12px",
              backgroundColor: "#fff3cd",
              border: "1px solid #ffc107",
              borderRadius: "4px",
              color: "#856404",
              fontSize: "13px",
              whiteSpace: "pre-line",
            }}
          >
            <strong>{t("Validation Error")}:</strong>
            <br />
            {validationError}
          </div>
        )}
        {Array.isArray(currentValue)
          ? currentValue.map((file, key) => {
              if (file.Type && file.Type.indexOf("image") > -1) {
                return (
                  <div
                    style={{
                      float: "left",
                      display: "inline-block",
                      position: "relative",
                    }}
                    key={"Div" + key}
                  >
                    <ThumbnailDiv className="thumbnail">
                      <ImagePanelDiv
                        onClick={() => openPreview(file)}
                        style={{ cursor: "pointer" }}
                      >
                        <ImageStyled
                          src={file.FileSrc}
                          alt={file.FileInfo.name}
                        />
                      </ImagePanelDiv>
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
                    </ThumbnailDiv>
                    <div
                      style={{
                        position: "absolute",
                        top: "-10px",
                        right: "14px",
                        zIndex: "999",
                      }}
                    >
                      <IconButton
                        aria-label={t("Remove file")}
                        style={{
                          backgroundColor: "#5c5c5c",
                          boxShadow: "0 1px 4px 0 rgba(255, 255, 255, 0.34)",
                          color: "#FFF",
                        }}
                        size="small"
                        onClick={() => Remove(file.FileInfo.Name)}
                      >
                        <CloseIcon fontSize="inherit" />
                      </IconButton>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div
                    style={{
                      display: "flex",
                      width: "100%",
                      marginBottom: "5px",
                      padding: "2px 8px",
                      borderLeft: "2px solid #ccc",
                    }}
                    key={"Div" + key}
                  >
                    <div style={{ float: "left", minWidth: "250px" }}>
                      <LightTooltip title={t("Download")}>
                        <LinkStyled
                          style={{ cursor: "pointer" }}
                          onClick={() => downloadFile(file)}
                        >
                          {file.FileInfo.Name}
                        </LinkStyled>
                      </LightTooltip>
                    </div>
                    <div
                      style={{ display: "inline-block", marginLeft: "15px" }}
                    >
                      <IconButton
                        aria-label={t("Remove file")}
                        style={{
                          padding: "0",
                          backgroundColor: "#ff1414",
                          boxShadow: "0 1px 4px 0 rgba(255, 255, 255, 0.34)",
                          color: "#FFF",
                        }}
                        size="small"
                        onClick={() => Remove(file.FileInfo.Name)}
                      >
                        <CloseIcon fontSize="inherit" />
                      </IconButton>
                    </div>
                  </div>
                );
              }
            })
          : null}
      </div>
    );
  };

  const PreviewDialog = () => (
    <Dialog
      open={previewOpen}
      onClose={closePreview}
      maxWidth="lg"
      PaperProps={{
        style: {
          backgroundColor: "transparent",
          boxShadow: "none",
        },
      }}
    >
      <DialogContent
        style={{
          padding: 0,
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <IconButton
          aria-label={t("Close preview")}
          onClick={closePreview}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            color: "#FFF",
            zIndex: 1,
          }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
        {previewFile && (
          <img
            src={previewFile.FileSrc}
            alt={previewFile.FileInfo?.Name || "Preview"}
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              objectFit: "contain",
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );

  if (Config) {
    return (
      <div style={{ width: "100%" }}>
        <PreviewDialog />
        {WithLabel ? (
          <GridContainer
            style={{
              margin: "0",
              width: "100%",
              border: `1px solid ${borderColor}`,
              borderBottom: "1px solid #eee",
              minHeight: "32px",
              alignItems: "stretch",
              boxSizing: "border-box",
            }}
          >
            <GridItem
              xs={12}
              sm={6}
              md={effectiveMd}
              style={{
                backgroundColor: "#eff9fe",
                borderRight: `1px solid ${borderColor}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                padding: "0 10px",
                minHeight: "32px",
                boxSizing: "border-box",
              }}
            >
              <FormLabel
                htmlFor={inputId}
                sx={{ ...labelHorizontalSx, padding: 0, margin: 0 }}
              >
                {Config.Label
                  ? t(Config.Label + "") + ":" + (Config.Required ? " *" : "")
                  : ""}
              </FormLabel>
            </GridItem>
            <GridItem
              xs={12}
              sm={6}
              md={12 - effectiveMd}
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "center",
                backgroundColor: "#fff",
                minHeight: "32px",
                position: "relative",
                zIndex: 1,
                boxSizing: "border-box",
              }}
            >
              {GetControl()}
            </GridItem>
          </GridContainer>
        ) : (
          GetControl()
        )}
      </div>
    );
  } else {
    return null;
  }
}
