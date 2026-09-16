import React, { useEffect, useState, useRef } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import FormLabel from "@mui/material/FormLabel";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
// @mui/icons-material
import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import MicIcon from "@mui/icons-material/Mic";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// helper
import Helper from "helper";

import { FIELD } from "customComponents/BaseEditControls/fieldRowStyles";
import { docIcon } from "customComponents/AdviceFeed/PostMedia";
import {
  AUDIO_EXTENSIONS,
  durationLabel,
} from "customComponents/AdviceFeed/mediaUtils";
import { colors } from "@/theme/colors";
import { radius, space, motion } from "@/theme/tokens";

const labelHorizontalSx = {
  color: FIELD.labelInk,
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
    borderColor = FIELD.rowBorder,
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

  // The real <input type="file"> is hidden with an inline display:none and is
  // driven by the drop zone, which is a real button. It still gets an id so the field label can be
  // associated with it, and an aria-label so it is never nameless.
  const inputId = Id || generatedId;

  const [currentValue, setCurrentValue] = useState(Value);
  const [Update, setUpdate] = useState(false);
  // Files the last pick or drop refused, each with its reason.
  const [rejected, setRejected] = useState([]);
  const [dragActive, setDragActive] = useState(false);
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

    // Short on purpose: the drop zone above already lists the accepted types
    // and the size limit, so a rejection only has to say which file and why.
    if (fileSizeMB > maxFileSize) {
      return {
        valid: false,
        error: `${file.name} — ${t("File size exceeds maximum allowed size")} (${fileSizeMB.toFixed(1)} / ${maxFileSize} MB)`,
      };
    }

    if (allowedFileTypes && allowedFileTypes.length > 0) {
      if (!allowedFileTypes.includes(fileExtension)) {
        return {
          valid: false,
          error: `${file.name} — ${t("File type not allowed")} (.${fileExtension})`,
        };
      }
    }

    return { valid: true };
  };

  /**
   * Validate and append picked or dropped files. Same rules and the same
   * {FileSrc, File, Type, FileInfo:{Name}} shape as before (BaseUploadFile
   * appends `File` under `FileInfo.Name`), so every caller's save path is
   * untouched. Rejections are kept per file so each one can say what was wrong.
   */
  const addFiles = async (fileList) => {
    const list = Array.from(fileList || []);
    if (list.length === 0) return;
    setRejected([]);

    // COPIED, not appended in place. This used to be `= currentValue`, pushed
    // into, and handed to ChangeValue - the same array object the parent was
    // already holding. React compares with Object.is, so every parent's
    // setState was a no-op and anything derived from it (a file count, an
    // enabled Send button) silently never updated.
    const NewValue = Array.isArray(currentValue) ? [...currentValue] : [];
    const problems = [];

    for (const file of list) {
      const validation = validateFile(file);
      if (!validation.valid) {
        problems.push({ Name: file.name, Reason: validation.error });
        continue;
      }

      let FileSrc = null;
      if (file.type && file.type.indexOf("image") > -1) {
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

    if (problems.length > 0) setRejected(problems);

    ChangeValue && ChangeValue(NewValue);
    setCurrentValue(NewValue);
    setUpdate(!Update);
  };

  const ChooseFile = async (e) => {
    e.preventDefault();
    await addFiles(e.target.files);
    // Reset so picking the same file again still fires onChange.
    fileInput.current.value = "";
  };

  const extOf = (file) => {
    const info = file.FileInfo || {};
    if (info.ext) return String(info.ext).toLowerCase();
    return String(info.Name || info.original_name || "")
      .split(".")
      .pop()
      .toLowerCase();
  };
  const nameOf = (file) => {
    const info = file.FileInfo || {};
    if (info.Name) return info.Name;
    return info.ext
      ? `${info.original_name}.${info.ext}`
      : info.original_name || "file";
  };
  const sizeOf = (file) => {
    const bytes = file.File ? file.File.size : null;
    if (!bytes && bytes !== 0) return null;
    if (bytes < 1024 * 1024)
      return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  const isImage = (file) =>
    !!file.FileSrc && !!file.Type && file.Type.indexOf("image") > -1;

  // "JPG, PNG, PDF, DOCX +6" - enough to know what is accepted without a
  // paragraph of extensions under every composer.
  const typesLabel = (() => {
    if (!Array.isArray(allowedFileTypes) || allowedFileTypes.length === 0)
      return "";
    const shown = allowedFileTypes.slice(0, 4).map((x) => x.toUpperCase());
    const more = allowedFileTypes.length - shown.length;
    return shown.join(", ") + (more > 0 ? ` +${more}` : "");
  })();

  const onDrag = (e, active) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragActive !== active) setDragActive(active);
  };

  /**
   * Attaching a file before sending.
   *
   * Phase 4 replaced the old light-blue button and oversized thumbnails; this
   * is the step after that, modelled on the chat composer, which already did
   * attachments well:
   *   - a drop zone that says what it takes (types, size per file) and accepts
   *     drag-and-drop as well as a click;
   *   - every attached file as the same card - a thumbnail or a type icon, the
   *     name, type and size, and a remove button - so a photo and a PDF no
   *     longer look like two different features;
   *   - each rejected file on its own line with its reason, instead of one
   *     yellow block that listed them all together.
   */
  const GetControl = () => {
    const files = Array.isArray(currentValue) ? currentValue : [];
    const quietIconSx = {
      color: colors.brand.inkDim,
      "&:hover": {
        color: colors.brand.ink,
        backgroundColor: colors.brand.tint,
      },
    };
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: space[2],
          width: "100%",
          py: space[1],
        }}
      >
        <Box
          component="button"
          type="button"
          onClick={() => fileInput.current.click()}
          onDragEnter={(e) => onDrag(e, true)}
          onDragOver={(e) => onDrag(e, true)}
          onDragLeave={(e) => onDrag(e, false)}
          onDrop={(e) => {
            onDrag(e, false);
            addFiles(e.dataTransfer && e.dataTransfer.files);
          }}
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: space[3],
            px: space[3],
            py: space[2],
            minHeight: "52px",
            font: "inherit",
            textAlign: "left",
            cursor: "pointer",
            borderRadius: radius.md,
            border: `1px dashed ${
              dragActive ? colors.brand.cyan : colors.brand.hairlineStrong
            }`,
            backgroundColor: dragActive
              ? colors.brand.tint
              : colors.brand.surface,
            transition: `background-color ${motion.fast}, border-color ${motion.fast}`,
            "&:hover": {
              borderColor: colors.brand.cyan,
              backgroundColor: colors.brand.tint,
            },
            "&:focus-visible": {
              outline: `2px solid ${colors.brand.focus}`,
              outlineOffset: "1px",
            },
          }}
        >
          <Box
            aria-hidden
            sx={{
              flex: "0 0 auto",
              width: "32px",
              height: "32px",
              borderRadius: radius.pill,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.brand.tint,
              color: colors.brand.cyanInk,
            }}
          >
            <AttachFileIcon sx={{ fontSize: "18px" }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              component="div"
              sx={{ color: colors.brand.ink }}
            >
              {t("Файлаа энд чирж оруулах эсвэл")}{" "}
              <Box
                component="span"
                sx={{
                  color: colors.brand.cyanInk,
                  fontWeight: 600,
                  textDecoration: "underline",
                  textUnderlineOffset: "2px",
                }}
              >
                {t("сонгох")}
              </Box>
            </Typography>
            <Typography
              variant="caption"
              component="div"
              sx={{ color: colors.brand.inkDim }}
            >
              {typesLabel ? typesLabel + " · " : ""}
              {t("файл тус бүр {{size}} MB хүртэл", { size: maxFileSize })}
            </Typography>
          </Box>
        </Box>

        <input
          id={inputId}
          type="file"
          multiple
          style={{ display: "none" }}
          accept={
            Array.isArray(allowedFileTypes) && allowedFileTypes.length
              ? allowedFileTypes.map((x) => "." + x).join(",")
              : undefined
          }
          aria-label={
            Config && Config.Label ? t(Config.Label + "") : t("Choose files")
          }
          onChange={ChooseFile}
          ref={fileInput}
        />

        {rejected.length > 0 ? (
          <Box role="alert" sx={{ display: "grid", gap: space[1] }}>
            {rejected.map((r, i) => (
              <Box
                key={"rej" + i}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: space[2],
                  padding: `${space[1]} ${space[2]}`,
                  borderRadius: radius.sm,
                  backgroundColor: colors.status.dangerTint,
                  color: colors.status.dangerInk,
                }}
              >
                <ErrorOutlineIcon sx={{ fontSize: "18px", mt: "1px" }} />
                <Typography
                  variant="caption"
                  component="div"
                  sx={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}
                >
                  {r.Reason}
                </Typography>
                {i === 0 ? (
                  <IconButton
                    size="small"
                    aria-label={t("Хаах")}
                    onClick={() => setRejected([])}
                    sx={{ p: "2px", color: "inherit" }}
                  >
                    <CloseIcon sx={{ fontSize: "16px" }} />
                  </IconButton>
                ) : null}
              </Box>
            ))}
          </Box>
        ) : null}

        {files.length > 0 ? (
          <Box
            sx={{
              display: "grid",
              gap: space[2],
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(auto-fill, minmax(220px, 1fr))",
              },
            }}
          >
            {files.map((file, key) => {
              const image = isImage(file);
              const ext = extOf(file);
              const size = sizeOf(file);
              return (
                <Box
                  key={"Div" + key}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: space[2],
                    minWidth: 0,
                    padding: space[1],
                    paddingRight: space[1],
                    borderRadius: radius.md,
                    border: `1px solid ${colors.brand.hairline}`,
                    backgroundColor: colors.brand.surface,
                  }}
                >
                  <Box
                    component={image ? "button" : "div"}
                    type={image ? "button" : undefined}
                    aria-label={image ? nameOf(file) : undefined}
                    onClick={image ? () => openPreview(file) : undefined}
                    sx={{
                      flex: "0 0 auto",
                      width: "44px",
                      height: "44px",
                      padding: 0,
                      border: "none",
                      borderRadius: radius.sm,
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: colors.brand.tintSolid,
                      color: colors.brand.cyanInk,
                      cursor: image ? "zoom-in" : "default",
                    }}
                  >
                    {image ? (
                      <Box
                        component="img"
                        src={file.FileSrc}
                        alt=""
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : AUDIO_EXTENSIONS.includes(ext) ? (
                      <MicIcon fontSize="small" />
                    ) : (
                      docIcon(ext)
                    )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      component="div"
                      noWrap
                      title={nameOf(file)}
                      sx={{ color: colors.brand.ink, fontWeight: 500 }}
                    >
                      {nameOf(file)}
                    </Typography>
                    <Typography
                      variant="caption"
                      component="div"
                      sx={{ color: colors.brand.inkDim }}
                    >
                      {[
                        ext ? ext.toUpperCase() : null,
                        // A recorded voice note carries its length.
                        file.FileInfo && file.FileInfo.DurationMs
                          ? durationLabel(file.FileInfo.DurationMs)
                          : null,
                        size,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </Typography>
                  </Box>
                  {/* A file that is already on the server can be fetched
                      back; a just-picked one is still on this machine. */}
                  {file.FileInfo && file.FileInfo.id_data ? (
                    <IconButton
                      size="small"
                      aria-label={t("Download")}
                      onClick={() => downloadFile(file)}
                      sx={quietIconSx}
                    >
                      <DownloadOutlinedIcon sx={{ fontSize: "18px" }} />
                    </IconButton>
                  ) : null}
                  <IconButton
                    size="small"
                    aria-label={t("Remove file")}
                    onClick={() => Remove(file.FileInfo.Name)}
                    sx={{
                      ...quietIconSx,
                      "&:hover": {
                        color: colors.status.danger,
                        backgroundColor: colors.status.dangerTint,
                      },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: "18px" }} />
                  </IconButton>
                </Box>
              );
            })}
          </Box>
        ) : null}
      </Box>
    );
  };

  /*
   * PLAIN JSX, not a component.
   *
   * This was `const PreviewDialog = () => (...)` rendered as <PreviewDialog />.
   * Declared inside the body, its type identity is new on every render, so
   * React unmounted and remounted the whole MUI Dialog - portal, transition,
   * focus trap, scroll lock - each time this control re-rendered. With the
   * preview open, every keystroke in the reply box behind it replayed the enter
   * transition: the dialog visibly popped. A value closes over the same state
   * and cannot remount.
   */
  const previewDialog = (
    <Dialog
      open={previewOpen}
      onClose={closePreview}
      maxWidth="lg"
      PaperProps={{
        sx: {
          backgroundColor: "transparent",
          boxShadow: "none",
          borderRadius: radius.md,
        },
      }}
    >
      {/* A dark plate with a floor, so a small image is not covered by the
          two buttons and a large one still fits the viewport. */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minWidth: "min(280px, 90vw)",
          minHeight: "200px",
          backgroundColor: "rgba(12, 34, 51, 0.85)",
          borderRadius: radius.md,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: space[2],
            right: space[2],
            display: "flex",
            gap: space[1],
            zIndex: 1,
          }}
        >
          {previewFile ? (
            <IconButton
              aria-label={t("Download")}
              size="small"
              onClick={() => downloadFile(previewFile)}
              sx={{
                color: colors.text.white,
                backgroundColor: "rgba(12, 34, 51, 0.7)",
                "&:hover": { backgroundColor: colors.brand.ink },
              }}
            >
              <DownloadOutlinedIcon />
            </IconButton>
          ) : null}
          <IconButton
            aria-label={t("Close preview")}
            onClick={closePreview}
            size="small"
            sx={{
              color: colors.text.white,
              backgroundColor: "rgba(12, 34, 51, 0.7)",
              "&:hover": { backgroundColor: colors.brand.ink },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        {previewFile && (
          <img
            src={previewFile.FileSrc}
            alt={nameOf(previewFile)}
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              objectFit: "contain",
              borderRadius: radius.md,
            }}
          />
        )}
      </Box>
    </Dialog>
  );

  if (Config) {
    return (
      <div style={{ width: "100%" }}>
        {previewDialog}
        {WithLabel ? (
          <GridContainer
            style={{
              margin: "0",
              width: "100%",
              border: `1px solid ${borderColor}`,
              borderBottom: `1px solid ${FIELD.rowBorder}`,
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
                backgroundColor: FIELD.labelBg,
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
                backgroundColor: FIELD.inputBg,
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
