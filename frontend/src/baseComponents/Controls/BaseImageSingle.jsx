import { useTranslation } from "react-i18next";
import React, { useState, createRef } from "react";
// @mui/material components
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
// @mui/icons-material
import CloseIcon from "@mui/icons-material/Close";
// helper
import Helper from "helper";

import defaultImage from "assets/img/user_placeholder.png";

// var Value = [{
// id_data
// ext: "JPG",
// hash: "1",
// original_name: "1212",
// generated_name: "dwdw"
// LinkedObjectName:"DoctorsProfile",
// LinkedObjectId:"319",
// File:"blob",
// FileSrc:"base64" only picture,
// }];

export default function BaseImageSingle(props) {
  const { t } = useTranslation();
  const generatedId = React.useId();
  const {
    Config = null,
    Id = null,
    Value = [],
    ChangeValue,
    round = false,
    square = false,
    FullWidth = false,
  } = props;

  const thumbnailImageSx = {
    clear: "both",
    display: "block",
    borderRadius: "0",
    marginTop: "8px",
    overflow: "inherit",
    width: FullWidth ? "100%" : "100px",
    background: "transparent",
    boxShadow: "none !important",
    "&:hover .upload": { display: "block" },
  };

  const uploadSx = {
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
    padding: "0 4px 7px",
    fontWeight: "400",
    "&:hover": { display: "block" },
  };

  const closeSx = {
    position: "absolute",
    zIndex: "999",
    top: "-2px",
    right: FullWidth ? "0" : "5px",
  };

  const closeRoundSx = {
    top: "22%",
    right: "12%",
    transform: "scale(1) translate(50%, -50%)",
    transformOrigin: "100% 0%",
  };

  const closeIconButtonSx = {
    backgroundColor: "#5c5c5c",
    boxShadow: "0 1px 4px 0 rgba(255, 255, 255, 0.34)",
    color: "#FFF",
    padding: "4px",
    "&:hover": { backgroundColor: "#919191" },
  };

  const imagePanelSx = {
    position: "relative",
    overflow: "hidden",
    width: FullWidth ? "100%" : "100px",
    height: "auto",
  };

  const imagePanelRoundSx = { borderRadius: "50%" };
  const imagePanelSquareSx = {
    height: FullWidth ? "auto" : "100px",
    minHeight: FullWidth ? "100px" : "auto",
  };

  const imageSingleSx = { width: "100%", height: "100%", objectFit: "cover" };

  // The real <input type="file"> is display:none and is driven by the camera
  // overlay; it still gets an id and an accessible name.
  const inputId = Id || generatedId;

  const [currentValue, setCurrentValue] = useState(Value);
  const [update, setUpdate] = useState(false);
  //   const [Procent, setProcent] = useState(0);

  let fileInput = createRef();

  const Remove = () => {
    ChangeValue && ChangeValue([]);
    setCurrentValue([]);
    setUpdate(!update);
  };

  const ChooseFile = async (e) => {
    e.preventDefault();

    let file = e.target.files[0];
    var FileSrc = null;
    if (file) {
      if (file.type.indexOf("image") > -1)
        FileSrc = await Helper.FileHelper.GetFileSrc(file);
      var NewValue = [
        { FileSrc, File: file, Type: file.type, FileInfo: { Name: file.name } },
      ];
      ChangeValue && ChangeValue("Files", NewValue);
      setCurrentValue(NewValue);
    }
    setUpdate(!update);
  };

  if (Config) {
    return (
      <div className="fileinput">
        <div style={{ position: "relative" }}>
          <Box className="thumbnail" sx={thumbnailImageSx}>
            <Box
              sx={{
                ...imagePanelSx,
                ...(round ? imagePanelRoundSx : {}),
                ...(square ? imagePanelSquareSx : {}),
              }}
            >
              <Box
                component="img"
                sx={imageSingleSx}
                src={
                  Array.isArray(currentValue) && currentValue.length > 0
                    ? currentValue[0].FileSrc
                    : defaultImage
                }
                alt="SingleImage"
              />
              <Box
                component="button"
                type="button"
                className="upload"
                aria-label={t("Choose image")}
                sx={{ ...uploadSx, border: "none", width: "100%" }}
                onClick={() => {
                  fileInput.current.click && fileInput.current.click();
                }}
              >
                <i
                  className={"fa fa-camera-retro"}
                  style={{ fontSize: "12px", margin: "5px" }}
                />
              </Box>
            </Box>
          </Box>
          {Array.isArray(currentValue) && currentValue.length > 0 ? (
            <Box sx={{ ...closeSx, ...(round ? closeRoundSx : {}) }}>
              <IconButton
                size="small"
                aria-label={t("Remove image")}
                sx={closeIconButtonSx}
                onClick={() =>
                  currentValue[0].FileInfo &&
                  Remove(currentValue[0].FileInfo.Name)
                }
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            </Box>
          ) : null}
        </div>

        <input
          id={inputId}
          type="file"
          aria-label={
            Config && Config.Label ? t(Config.Label + "") : t("Choose image")
          }
          onChange={ChooseFile}
          ref={fileInput}
          accept="image/*"
        />
      </div>
    );
  } else {
    return null;
  }
}
