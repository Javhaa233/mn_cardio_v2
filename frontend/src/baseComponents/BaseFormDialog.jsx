import React from "react";
import { useTranslation } from "react-i18next";
import { styled } from "@mui/material/styles";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import MuiDialogTitle from "@mui/material/DialogTitle";

import CloseIcon from "@mui/icons-material/Close";
import CropSquareIcon from "@mui/icons-material/CropSquare";
import FilterNoneIcon from "@mui/icons-material/FilterNone";
import MinimizeIcon from "@mui/icons-material/Minimize";

import BaseLabel from "customComponents/BaseViewControls/BaseLabel";
import { useDialogWindow } from "baseComponents/useDialogWindow";
import BaseDialogActions from "baseComponents/BaseDialogActions";

/* ================= STYLES ================= */

const StyledDialogTitle = styled(MuiDialogTitle)(() => ({
  margin: 0,
  padding: "10px 12px",
  cursor: "move",
  userSelect: "none",
  background:
    "linear-gradient(180deg, rgba(245,247,250,1) 0%, rgba(236,240,244,1) 100%)",
  borderBottom: "1px solid rgba(0,0,0,0.06)",
}));

const WindowButton = styled(IconButton)(({ theme }) => ({
  width: 22,
  height: 22,
  padding: 0,
  borderRadius: 999,
  border: "1px solid rgba(0,0,0,0.15)",
  color: theme.palette.grey[700],
  backgroundColor: "rgba(255,255,255,0.9)",
  "&:hover": { backgroundColor: "rgba(255,255,255,1)" },
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  "&::-webkit-scrollbar": { width: "12px", height: "12px" },
  "&::-webkit-scrollbar-track": {
    backgroundColor: "rgba(136, 136, 136, 0.1)",
    "&:hover": { backgroundColor: "rgba(173, 173, 173, 0.4)" },
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(136, 136, 136, 0.6)",
    borderRadius: "6px",
    width: "12px",
    "&:hover": { backgroundColor: "rgba(136, 136, 136, 0.9)" },
  },
  display: "flex",
  flexDirection: "column",
}));

/* ================= TITLE ================= */

const DialogTitle = ({
  children,
  onClose,
  onMinimize,
  onMaximize,
  isMaximized,
  onPointerDown,
}) => (
  <StyledDialogTitle onPointerDown={onPointerDown}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <BaseLabel Label={children} Size="16px" Weight="400" Color="#878787" />
      <div style={{ display: "flex", gap: 8 }}>
        <WindowButton onClick={onMinimize}>
          <MinimizeIcon sx={{ fontSize: 16 }} />
        </WindowButton>
        <WindowButton onClick={onMaximize}>
          {isMaximized ? (
            <FilterNoneIcon sx={{ fontSize: 16 }} />
          ) : (
            <CropSquareIcon sx={{ fontSize: 16 }} />
          )}
        </WindowButton>
        <WindowButton onClick={onClose}>
          <CloseIcon sx={{ fontSize: 16 }} />
        </WindowButton>
      </div>
    </div>
  </StyledDialogTitle>
);

/* ================= MAIN ================= */

/**
 * BaseFormDialog - Wrapper component that adds dialog window functionality to custom forms
 *
 * Usage:
 * <BaseFormDialog
 *   Title="My Form"
 *   Close={handleClose}
 *   Save={handleSave}
 *   ShowSave={true}
 * >
 *   <YourCustomForm {...formProps} />
 * </BaseFormDialog>
 *
 * @param {Object} props - Component props
 * @param {string} props.Title - Dialog title
 * @param {Function} props.Close - Close handler
 * @param {Function} props.Save - Save handler
 * @param {boolean} props.ShowSave - Show save button
 * @param {boolean} props.ShowPrint - Show print button
 * @param {boolean} props.ShowDecline - Show decline button
 * @param {number} props.Width - Initial width (default: 900)
 * @param {number} props.Height - Initial height (default: 80% of viewport)
 * @param {React.ReactNode} props.children - Form content
 */
export default function BaseFormDialog(props) {
  const { t } = useTranslation();

  const {
    Title = "Form",
    Close,
    Save,
    ShowSave = false,
    ShowPrint = false,
    ShowPrintAndSave = false,
    ShowDecline = false,
    ShowConfirm = false,
    Decline,
    Confirm,
    Print,
    SaveButtonText = "Save",
    ConfirmButtonText = "Confirm",
    Width = 900,
    Height,
    Padding = "8px 24px",
    children,
  } = props;

  const initialHeight = Height || window.innerHeight * 0.8;

  /* ---------- WINDOW STATE ---------- */

  const {
    paperRef,
    pos,
    size,
    isMaximized,
    isMinimized,
    onTitlePointerDown,
    onResizePointerDown,
    toggleMaximize,
    toggleMinimize,
  } = useDialogWindow({
    initialWidth: Width,
    initialHeight,
  });

  /* ================= RENDER ================= */

  const resizeHandle =
    !isMaximized && !isMinimized ? (
      <div
        data-resize-handle="true"
        onPointerDown={onResizePointerDown}
        style={{
          position: "absolute",
          width: "18px",
          height: "18px",
          right: 0,
          bottom: 0,
          cursor: "nwse-resize",
          zIndex: 1301,
          touchAction: "none",
          background: "linear-gradient(135deg, transparent 50%, #9e9e9e 50%)",
          backgroundSize: "12px 12px",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "bottom right",
          borderBottomRightRadius: "4px",
        }}
      />
    ) : null;

  return (
    <Dialog
      open
      onClose={Close}
      PaperProps={{
        ref: paperRef,
        sx: {
          position: "fixed",
          top: 8,
          left: 8,
          margin: 0,
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          width: size.width,
          height: isMinimized ? "auto" : size.height,
          maxWidth: "none",
          maxHeight: "none",
          overflow: "visible",
        },
      }}
      sx={{
        "& .MuiDialog-container": {
          alignItems: "flex-start",
          justifyContent: "flex-start",
        },
      }}
    >
      <DialogTitle
        onClose={Close}
        onMinimize={toggleMinimize}
        onMaximize={toggleMaximize}
        isMaximized={isMaximized}
        onPointerDown={onTitlePointerDown}
      >
        {t(Title)}
      </DialogTitle>

      {!isMinimized && (
        <>
          <StyledDialogContent
            dividers
            sx={{
              padding: Padding,
              overflow: "auto",
              flex: "1 1 auto",
              position: "relative",
            }}
          >
            {children}
          </StyledDialogContent>

          {(ShowSave ||
            ShowPrint ||
            ShowPrintAndSave ||
            ShowDecline ||
            ShowConfirm) && (
            <BaseDialogActions
              ShowSave={ShowSave}
              ShowPrint={ShowPrint}
              ShowPrintAndSave={ShowPrintAndSave}
              ShowDecline={ShowDecline}
              ShowConfirm={ShowConfirm}
              Save={Save}
              Decline={Decline}
              Confirm={Confirm}
              Print={Print}
              SaveButtonText={SaveButtonText}
              ConfirmButtonText={ConfirmButtonText}
            />
          )}
        </>
      )}

      {resizeHandle}
    </Dialog>
  );
}
