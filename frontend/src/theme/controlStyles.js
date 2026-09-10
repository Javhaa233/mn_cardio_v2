/**
 * Centralized style definitions for form controls
 * Eliminates duplication of labelHorizontalSx, textFieldSx, etc.
 */

import colors from "./colors";
import { radius, motion } from "./tokens";

/**
 * Label styles for horizontal layout
 */
export const labelHorizontalSx = {
  display: "flex",
  alignItems: "center",
  marginBottom: 1,
  "& .MuiFormLabel-root": {
    width: "30%",
    marginRight: 2,
    marginBottom: 0,
    color: colors.label.primary,
    fontSize: 16,
    fontWeight: 500,
    "&.Mui-focused": {
      color: colors.label.primary,
    },
    "&.Mui-error": {
      color: colors.label.error,
    },
    "&.Mui-disabled": {
      color: colors.label.disabled,
    },
  },
  "& .MuiFormControl-root": {
    width: "70%",
    marginBottom: 0,
  },
};

/**
 * Label styles for vertical layout
 */
export const labelVerticalSx = {
  display: "flex",
  flexDirection: "column",
  marginBottom: 1,
  "& .MuiFormLabel-root": {
    marginBottom: 0.5,
    color: colors.label.primary,
    fontSize: 16,
    fontWeight: 500,
    "&.Mui-focused": {
      color: colors.label.primary,
    },
    "&.Mui-error": {
      color: colors.label.error,
    },
    "&.Mui-disabled": {
      color: colors.label.disabled,
    },
  },
  "& .MuiFormControl-root": {
    width: "100%",
  },
};

/**
 * TextField/Input base styles
 */
export const textFieldSx = {
  "& .MuiInputBase-root": {
    fontSize: 16,
    backgroundColor: colors.input.background,
  },
  "& .MuiInputBase-input": {
    padding: "8px 12px",
    color: colors.input.text,
    fontSize: 16,
    "&::placeholder": {
      color: colors.input.placeholder,
      opacity: 0.7,
    },
    "&:disabled": {
      color: colors.input.textDisabled,
      backgroundColor: colors.input.backgroundDisabled,
      cursor: "not-allowed",
    },
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: colors.input.border,
    },
    "&:hover fieldset": {
      borderColor: colors.input.borderHover,
    },
    "&.Mui-focused fieldset": {
      borderColor: colors.input.borderFocus,
    },
    "&.Mui-error fieldset": {
      borderColor: colors.input.error,
    },
    "&.Mui-disabled": {
      backgroundColor: colors.input.backgroundDisabled,
      "& fieldset": {
        borderColor: colors.border.light,
      },
    },
  },
  "& .MuiFormHelperText-root": {
    fontSize: 14,
    marginTop: 0.5,
    "&.Mui-error": {
      color: colors.input.error,
    },
  },
};

/**
 * TextArea specific styles
 */
export const textAreaSx = {
  ...textFieldSx,
  "& .MuiInputBase-input": {
    ...textFieldSx["& .MuiInputBase-input"],
    minHeight: 80,
    resize: "vertical",
  },
};

/**
 * Select/Autocomplete styles
 */
export const selectSx = {
  ...textFieldSx,
  "& .MuiAutocomplete-inputRoot": {
    padding: "4px 12px",
  },
  "& .MuiAutocomplete-input": {
    padding: "4px 0",
  },
  "& .MuiAutocomplete-endAdornment": {
    right: 12,
  },
};

/**
 * Checkbox styles
 */
export const checkBoxSx = {
  "& .MuiCheckbox-root": {
    color: colors.input.border,
    "&.Mui-checked": {
      color: colors.button.primary,
    },
    "&.Mui-disabled": {
      color: colors.input.backgroundDisabled,
    },
  },
  "& .MuiFormControlLabel-label": {
    fontSize: 16,
    color: colors.text.primary,
    "&.Mui-disabled": {
      color: colors.text.disabled,
    },
  },
};

/**
 * Radio button styles
 */
export const radioSx = {
  "& .MuiRadio-root": {
    color: colors.input.border,
    "&.Mui-checked": {
      color: colors.button.primary,
    },
    "&.Mui-disabled": {
      color: colors.input.backgroundDisabled,
    },
  },
  "& .MuiFormControlLabel-label": {
    fontSize: 16,
    color: colors.text.primary,
    "&.Mui-disabled": {
      color: colors.text.disabled,
    },
  },
};

/**
 * Date/Time picker styles
 */
export const datePickerSx = {
  ...textFieldSx,
  "& .MuiInputAdornment-root": {
    marginLeft: 0,
  },
};

/**
 * Number input styles
 */
export const numberInputSx = {
  ...textFieldSx,
  "& input[type=number]": {
    MozAppearance: "textfield",
  },
  "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button":
    {
      WebkitAppearance: "none",
      margin: 0,
    },
};

/**
 * File upload styles
 */
export const fileUploadSx = {
  border: `1px dashed ${colors.border.medium}`,
  borderRadius: 1,
  padding: 2,
  textAlign: "center",
  cursor: "pointer",
  backgroundColor: colors.background.secondary,
  transition: "all 0.3s ease",
  "&:hover": {
    borderColor: colors.input.borderFocus,
    backgroundColor: colors.background.hover,
  },
  "&.disabled": {
    cursor: "not-allowed",
    backgroundColor: colors.input.backgroundDisabled,
    opacity: 0.6,
  },
};

/**
 * The button language for anything sitting next to a data grid - the toolbars
 * above a list, and by extension any action bar that wants to match them.
 *
 * Three ranks, and the rank carries the meaning. A toolbar shows AT MOST ONE
 * `primary`; everything else is `neutral`. That is the whole point: before this
 * existed, Search was green, Export was cyan and New was purple, all of them
 * filled, so nothing on the bar read as the thing you were meant to press.
 *
 * `primary` fills with `brand.cyanInk`, never `cyan`/`cyanDeep` - see the
 * contrast rule in colors.js. cyanInk is 5.84:1, which covers white-on-fill.
 *
 * DELIBERATELY ABSENT: padding, minHeight, fontSize. `theme.js` MuiButton.root
 * sets all three with `!important`, so declaring them here would lose silently
 * and only mislead the next reader. `height` is not blocked, so that is the one
 * size lever available.
 */
const toolbarButtonBase = {
  height: "30px",
  borderRadius: radius.xs,
  textTransform: "none",
  fontWeight: 500,
  whiteSpace: "nowrap",
  boxShadow: "none",
  transition: `background-color ${motion.fast}, border-color ${motion.fast}, color ${motion.fast}`,
  "&:hover": { boxShadow: "none" },
  "& .MuiButton-startIcon": {
    marginRight: "5px",
    marginLeft: 0,
    "& svg": { fontSize: "16px" },
  },
  "&:focus-visible": {
    outline: `2px solid ${colors.brand.focus}`,
    outlineOffset: "1px",
  },
  "&.Mui-disabled": { opacity: 0.5 },
};

export const gridToolbarButtonSx = {
  /** The one action the screen exists for. At most one per toolbar. */
  primary: {
    ...toolbarButtonBase,
    color: colors.text.white,
    backgroundColor: colors.brand.cyanInk,
    border: `1px solid ${colors.brand.cyanInk}`,
    "&:hover": {
      boxShadow: "none",
      backgroundColor: colors.brand.cyanInkHover,
      borderColor: colors.brand.cyanInkHover,
    },
    "&.Mui-disabled": {
      opacity: 1,
      color: colors.text.white,
      backgroundColor: colors.brand.cyanInk,
      borderColor: colors.brand.cyanInk,
      filter: "saturate(0.4) opacity(0.55)",
    },
  },

  /** Everything else on the bar: Refresh, Export, Print, secondary Search. */
  neutral: {
    ...toolbarButtonBase,
    color: colors.brand.ink,
    backgroundColor: colors.brand.surface,
    border: `1px solid ${colors.brand.hairlineStrong}`,
    "&:hover": {
      boxShadow: "none",
      backgroundColor: colors.brand.tint,
      borderColor: colors.brand.cyanDeep,
    },
  },

  /** Destructive. Outlined here; a filled danger button belongs in the confirm. */
  danger: {
    ...toolbarButtonBase,
    color: colors.status.danger,
    backgroundColor: colors.brand.surface,
    border: `1px solid ${colors.status.danger}`,
    "&:hover": {
      boxShadow: "none",
      backgroundColor: "rgba(220, 53, 69, 0.06)",
      borderColor: colors.status.danger,
    },
  },
};

/**
 * DataGrid/Table styles
 */
export const gridSx = {
  "& .MuiDataGrid-root": {
    border: `1px solid ${colors.grid.border}`,
    fontSize: 16,
  },
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: colors.grid.headerBackground,
    color: colors.grid.headerText,
    fontSize: 16,
    fontWeight: 600,
    borderBottom: `2px solid ${colors.grid.border}`,
    minHeight: 40,
    "& .MuiDataGrid-columnHeader": {
      minHeight: 40,
    },
  },
  "& .MuiDataGrid-columnHeader": {
    borderRight: `1px solid ${colors.grid.border}`,
    "&:last-of-type": {
      borderRight: `1px solid ${colors.grid.border}`,
    },
  },
  "& .MuiDataGrid-cell": {
    borderBottom: `1px solid ${colors.grid.border}`,
    borderRight: `1px solid ${colors.grid.border}`,
    fontSize: 16,
    minHeight: 36,
    "&:last-of-type": {
      borderRight: `1px solid ${colors.grid.border}`,
    },
  },
  "& .MuiDataGrid-row": {
    "&:hover": {
      backgroundColor: colors.grid.rowHover,
    },
    "&.Mui-selected": {
      backgroundColor: colors.grid.rowSelected,
      "&:hover": {
        backgroundColor: colors.grid.rowSelected,
      },
    },
  },
  "& .MuiDataGrid-footerContainer": {
    borderTop: `2px solid ${colors.grid.border}`,
    backgroundColor: colors.grid.headerBackground,
    minHeight: 36,
  },
};

/**
 * Modal/Dialog styles
 */
export const modalSx = {
  "& .MuiDialog-paper": {
    borderRadius: 2,
    padding: 2,
  },
  "& .MuiDialogTitle-root": {
    fontSize: 20,
    fontWeight: 600,
    color: colors.text.primary,
    padding: 2,
    paddingBottom: 1,
  },
  "& .MuiDialogContent-root": {
    padding: 2,
    fontSize: 16,
  },
  "& .MuiDialogActions-root": {
    padding: 2,
    paddingTop: 1,
  },
};

/**
 * Card styles
 */
export const cardSx = {
  borderRadius: 2,
  boxShadow: `0 1px 3px ${colors.shadow.light}`,
  "& .MuiCardHeader-root": {
    backgroundColor: colors.background.secondary,
    borderBottom: `1px solid ${colors.border.light}`,
    padding: 2,
  },
  "& .MuiCardContent-root": {
    padding: 2,
  },
  "& .MuiCardActions-root": {
    padding: 2,
    paddingTop: 1,
    borderTop: `1px solid ${colors.border.light}`,
  },
};

/**
 * Alert/Notification styles
 */
export const alertSx = {
  fontSize: 16,
  borderRadius: 1,
  "&.MuiAlert-standardSuccess": {
    backgroundColor: colors.status.success,
    color: colors.text.white,
  },
  "&.MuiAlert-standardError": {
    backgroundColor: colors.status.danger,
    color: colors.text.white,
  },
  "&.MuiAlert-standardWarning": {
    backgroundColor: colors.status.warning,
    color: colors.text.primary,
  },
  "&.MuiAlert-standardInfo": {
    backgroundColor: colors.status.info,
    color: colors.text.white,
  },
};

/**
 * Helper function to combine styles
 */
export const combineStyles = (...styles) => {
  return styles.reduce((acc, style) => ({ ...acc, ...style }), {});
};

export default {
  labelHorizontalSx,
  labelVerticalSx,
  textFieldSx,
  textAreaSx,
  selectSx,
  checkBoxSx,
  radioSx,
  datePickerSx,
  numberInputSx,
  fileUploadSx,
  gridToolbarButtonSx,
  gridSx,
  modalSx,
  cardSx,
  alertSx,
  combineStyles,
};
