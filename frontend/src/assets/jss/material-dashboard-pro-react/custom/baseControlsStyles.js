import { colors } from "@/theme/colors";
import i18n from "i18n";
import {
  primaryColor,
  grayColor,
  dangerColor,
  blackColor,
  hexToRgb,
} from "assets/jss/material-dashboard-pro-react.js";

const baseControlsStyles = {
  formControl: {
    marginTop: "8px",
    minWidth: "160px",
    "& > div": { padding: "0 4px !important" },
  },
  labelRoot: { marginLeft: "-14px" },
  // CheckBox Styles
  checkRoot: {
    padding: "8px",
    margin: "-8px 4px",
    "&:hover": { backgroundColor: "unset" },
  },
  checkboxAndRadioHorizontal: {
    position: "relative",
    display: "block",
    "&:first-of-type": { marginTop: "10px" },
    "&:no(:first-of-type)": { marginTop: "-14px" },
    marginTop: "0",
    marginBottom: "0",
  },
  checked: { color: primaryColor[0] + "!important" },
  checkedIcon: {
    width: "20px",
    height: "20px",
    border: "1px solid rgba(" + hexToRgb(blackColor) + ", .54)",
    borderRadius: "3px",
  },
  uncheckedIcon: {
    width: "0px",
    height: "0px",
    padding: "9px",
    border: "1px solid rgba(" + hexToRgb(blackColor) + ", .54)",
    borderRadius: "3px",
  },

  disabled: {
    opacity: "0.5",
    pointerEvents: "none",
  },

  //   Radio Styles
  radioRoot: { padding: "16px", "&:hover": { backgroundColor: "unset" } },
  radio: { color: primaryColor[0] + "!important" },
  radioChecked: {
    width: "16px",
    height: "16px",
    border: "1px solid " + primaryColor[0],
    borderRadius: "50%",
  },
  radioUnchecked: {
    width: "0px",
    height: "0px",
    padding: "7px",
    border: "1px solid rgba(" + hexToRgb(blackColor) + ", .54)",
    borderRadius: "50%",
  },
  divInline: { display: "inline-block" },
  divRow: { display: "block", width: "100%" },

  // Input Styles
  input: {
    color: "#495057",
    backgroundColor: "#ffffff",
    fontWeight: "400",
    fontSize: "12px",
    height: "28px", // <<<< HEIGHT FIX (increased from default)
    padding: "4px 8px", // <<<< increased from default to proportionally match height
    "&,&::placeholder": {
      color: "#495057",
      fontSize: "12px",
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: "400",
      lineHeight: 1.5,
      opacity: "1",
    },
    "& label.Mui-focused": { color: "#495057" },
    "&::placeholder": { color: grayColor[3] },
  },

  inputUnderline: {
    "&:hover:no($disabled):before,&:before": {
      borderColor: "#D2D2D2 !important",
      borderWidth: "1px !important",
    },
    "&:after": { borderColor: colors.brand.cyan },
    "& + p": { fontWeight: "300" },
  },

  // Autocomplete Input Styles
  inputRoot: {
    "& .MuiInput-underline": {
      backgroundColor: "#ffffff",
      color: "#495057",
      transformOrigin: "left center",
      transition: "all 0.3s ease",
    },
    "& .MuiInput-underline:after": {
      borderColor: colors.brand.cyan,
      borderBottomWidth: "2px",
      left: "0",
    },
    "& .MuiInput-underline:before": {
      borderColor: "#ccc",
      borderBottomWidth: "1px",
    },
    "& .MuiInput-underline:hover::before": {
      borderColor: colors.brand.cyan,
      borderBottomWidth: "2px",
    },
  },
  outlined: {
    "& .MuiOutlinedInput-root": {
      padding: "9px", // <<<< increased 15% from 8px
      "& fieldset": { borderColor: "#aaaaaa" },
      "&.Mui-focused fieldset": { borderColor: "#aaaaaa", borderWidth: 1 },
    },
  },
  notchedOutline: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderColor: "#ccc", borderRadius: "0" },
      "&:hover fieldset": { borderColor: "#4a4a4a" },
      "&.Mui-focused fieldset": { borderColor: "#4a4a4a", borderWidth: "1px" },
    },
    "& .MuiInputBase-input": {
      padding: "9px 10px", // <<<< increased from default to match height
    },
  },

  //   File Upload

  link: {
    fontSize: "16px",
    fontWeight: "400",
    "&:hover": { textDecoration: "underline" },
  },
  thumbnail: {
    position: "relative",
    overflow: "inherit",
    float: "left",
    display: "inline-block",
    margin: "0 10px 10px 0",
    width: "150px",
    height: "120px",
    "&:hover .download": { display: "block" },
  },
  //   imagePanel: {
  //     position: "relative",
  //     overflow: "hidden",
  //     width: "150px",
  //     height: "150px",
  //   },
  image: { width: "100%", height: "100%", objectFit: "cover" },
  download: {
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
  },

  //   Image Single
  thumbnailImage: {
    clear: "both",
    display: "block",
    borderRadius: "0",
    marginTop: "15px",
    overflow: "inherit",
    width: "200px",
    background: "transparent",
    boxShadow: "none !important",
    "&:hover .upload": { display: "block" },
  },
  upload: {
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
    padding: "0 8px 14px",
    fontWeight: "400",
    "&:hover": { display: "block" },
  },
  close: { position: "absolute", zIndex: "999", top: "-2px", right: "10px" },
  closeRound: {
    top: "22%",
    right: "12%",
    transform: "scale(1) translate(50%, -50%)",
    transformOrigin: "100% 0%",
  },
  closeIconButton: {
    backgroundColor: "#5c5c5c",
    boxShadow: "0 1px 4px 0 rgba(255, 255, 255, 0.34)",
    color: "#FFF",
    padding: "8px",
    "&:hover": { backgroundColor: "#919191" },
  },
  imagePanel: {
    position: "relative",
    overflow: "hidden",
    width: "200px",
    height: "auto",
  },

  imagePanelRound: { borderRadius: "50%" },
  imagePanelSquare: { height: "200px" },
  imageSingle: { width: "100%", height: "100%" },
  imageRound: { objectFit: "cover" },
  imageSquare: { objectFit: "cover" },
  //   LookUpGrid Styles
  popperRoot: {
    backgroundColor: "#FFF",
    padding: "8px",
    zIndex: "9999",
    maxHeight: "200px",
    maxWidth: "500px",
    borderRadius: "6px",
    boxShadow: "0 1px 4px 0 rgba(0, 0, 0, 0.14)",
  },
  scroll: {
    maxHeight: "178px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    padding: "3px",
    overflow: "auto",
    "&::-webkit-scrollbar": { width: "6px", height: "6px" },
    "&::-webkit-scrollbar-track": {
      backgroundColor: "rgba(136, 136, 136, 0.1)",
      "&:hover": { backgroundColor: "rgba(173, 173, 173, 0.4)" },
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(136, 136, 136, 0.6)",
      borderRadius: "6px",
      width: "6px",
      "&:hover": { backgroundColor: "rgba(136, 136, 136, 0.9)" },
    },
  },
  //   Label Styles
  label: {
    cursor: "pointer",
    paddingLeft: "0",
    color: colors.brand.inkMuted,
    fontSize: "12px",
    lineHeight: "1.428571429",
    fontWeight: "400",
    display: "inline-flex",
    transition: "0.3s ease all",
    letterSpacing: "unset",
  },
  labelHorizontal: {
    color: colors.brand.inkMuted,
    cursor: "pointer",
    display: "inline-flex",
    fontSize: "12px",
    lineHeight: 1,
    fontWeight: "400",
    paddingTop: "5px",
    marginRight: "0",
    textAlign: "left",
    "@media (min-width: 992px)": { float: "right" },
  },

  // Autocomplete
  autoCompleteLabelHorizontal: {
    color: colors.brand.inkMuted,
    cursor: "pointer",
    display: "inline-flex",
    fontSize: "12px",
    lineHeight: "1.428571429",
    fontWeight: "400",
    paddingTop: "15px",
    marginRight: "0",
    textAlign: "right",
    "@media (min-width: 992px)": { float: "right" },
  },

  labelError: { color: dangerColor[0] },
  inlineChecks: { marginTop: "8px" },
};

export default baseControlsStyles;
