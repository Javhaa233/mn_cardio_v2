import { useTranslation } from "react-i18next";
import React, { useState, createRef } from "react";
// @mui/material components
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
// @mui/icons-material
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
// helper
import Helper from "helper";

import { colors } from "@/theme/colors";
import { radius, space } from "@/theme/tokens";
import { gridToolbarButtonSx } from "@/theme/controlStyles";

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

/**
 * A single photo field (config Type "SingleImage": the patient and doctor
 * photos).
 *
 * It was a grey user-placeholder PNG with a FontAwesome camera strip that only
 * appeared on hover - invisible on a touch screen - and a grey close circle
 * hanging off the corner. It now follows the account dialogs' photo picker
 * (Profile/ProfileEditDialog, DoctorProfile/DoctorEditDialog): a preview, an
 * outlined "Add photo" / "Change photo" button, a remove button once there is
 * a photo, and a one-line hint. A photo can also be dropped on the preview.
 * The value shape and the ChangeValue calls are unchanged.
 */
export default function BaseImageSingle(props) {
  const { t } = useTranslation();
  const generatedId = React.useId();
  const {
    Config = null,
    Id = null,
    Value = [],
    ChangeValue,
    round = false,
    FullWidth = false,
  } = props;

  // The real <input type="file"> is hidden and driven by the button; it still
  // gets an id and an accessible name.
  const inputId = Id || generatedId;

  const [currentValue, setCurrentValue] = useState(Value);
  const [update, setUpdate] = useState(false);

  let fileInput = createRef();

  const hasImage =
    Array.isArray(currentValue) &&
    currentValue.length > 0 &&
    !!currentValue[0].FileSrc;

  const Remove = () => {
    ChangeValue && ChangeValue([]);
    setCurrentValue([]);
    setUpdate(!update);
  };

  const takeFile = async (file) => {
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

  const ChooseFile = async (e) => {
    e.preventDefault();
    await takeFile(e.target.files[0]);
  };

  if (!Config) return null;

  const size = FullWidth ? "120px" : "88px";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: space[3],
        py: space[1],
      }}
    >
      <Box
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer && e.dataTransfer.files[0];
          if (file && file.type.indexOf("image") > -1) takeFile(file);
        }}
        sx={{
          flex: "0 0 auto",
          width: size,
          height: size,
          borderRadius: round ? radius.pill : radius.md,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.brand.tintSolid,
          border: `1px solid ${colors.brand.hairline}`,
          color: colors.brand.inkDim,
        }}
      >
        {hasImage ? (
          <Box
            component="img"
            src={currentValue[0].FileSrc}
            alt={t("Choose image")}
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <PersonOutlineIcon sx={{ fontSize: "40px" }} />
        )}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: space[2] }}>
          <Button
            type="button"
            disableElevation
            startIcon={<PhotoCameraOutlinedIcon />}
            onClick={() => fileInput.current && fileInput.current.click()}
            sx={gridToolbarButtonSx.neutral}
          >
            {hasImage ? t("Change photo") : t("Зураг оруулах")}
          </Button>
          {hasImage ? (
            <Button
              type="button"
              disableElevation
              onClick={Remove}
              sx={gridToolbarButtonSx.danger}
            >
              {t("Remove image")}
            </Button>
          ) : null}
        </Box>
        <Typography
          variant="caption"
          component="div"
          sx={{ mt: space[1], color: colors.brand.inkDim }}
        >
          {t("JPG or PNG image")}
        </Typography>
      </Box>

      <input
        id={inputId}
        type="file"
        hidden
        aria-label={
          Config && Config.Label ? t(Config.Label + "") : t("Choose image")
        }
        onChange={ChooseFile}
        ref={fileInput}
        accept="image/*"
      />
    </Box>
  );
}
