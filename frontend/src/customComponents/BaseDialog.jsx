import React from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material
import { styled } from "@mui/material/styles";
import { DialogContent, Dialog, Paper, IconButton } from "@mui/material";
import MuiDialogTitle from "@mui/material/DialogTitle";
// @mui/icons-material
import CloseIcon from "@mui/icons-material/Close";
import CropSquareIcon from "@mui/icons-material/CropSquare";
import FilterNoneIcon from "@mui/icons-material/FilterNone";
import MinimizeIcon from "@mui/icons-material/Minimize";

import BaseLabel from "customComponents/BaseViewControls/BaseLabel";
import BaseDialogActions from "baseComponents/BaseDialogActions";
import { useDialogWindow } from "baseComponents/useDialogWindow";
import { useIsCompact } from "helper/useResponsive";

// --- STYLED COMPONENTS ---

const StyledDialogTitle = styled(MuiDialogTitle, {
  shouldForwardProp: (prop) => prop !== "movable",
})(({ movable }) => ({
  margin: 0,
  overflow: "visible",
  // `touchAction: none` is what makes the drag-to-move gesture work, and it
  // also tells the browser to ignore touch scrolling that begins on this
  // element. It was unconditional, so on a touch device a swipe starting
  // anywhere on the header did nothing at all. It now applies only when the
  // dialog is actually draggable (never on a compact screen).
  touchAction: movable ? "none" : "auto",
  padding: "10px 12px",
  background:
    "linear-gradient(180deg, rgba(245, 247, 250, 1) 0%, rgba(236, 240, 244, 1) 100%)",
  borderBottom: "1px solid rgba(0,0,0,0.06)",
}));

const StyledCloseButton = styled(IconButton)(({ theme }) => ({
  fontSize: "18px",
  padding: "4px",
  color: theme.palette.grey[700],
}));

const WindowControlButton = styled(IconButton)(({ theme }) => ({
  width: 22,
  height: 22,
  padding: 0,
  borderRadius: 999,
  border: "1px solid rgba(0,0,0,0.15)",
  color: theme.palette.grey[700],
  backgroundColor: "rgba(255,255,255,0.9)",
  "&:hover": {
    backgroundColor: "rgba(255,255,255,1)",
  },
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

// --- TITLE COMPONENT ---

const DialogTitle = (props) => {
  const {
    children,
    headerContent,
    onClose,
    Movable,
    onPointerDown,
    WinBoxStyle,
    IsMaximized,
    IsMinimized,
    ShowMinimize,
    ShowMaximize,
    onMinimizeToggle,
    onMaximizeToggle,
    ...other
  } = props;

  return (
    <StyledDialogTitle
      {...other}
      movable={Movable ? 1 : 0}
      onPointerDown={onPointerDown}
      sx={{ cursor: Movable ? "move" : "default" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            minWidth: 0,
            flex: 1,
          }}
        >
          {headerContent ? (
            headerContent
          ) : (
            <BaseLabel
              Label={children}
              Size="16px"
              Weight="400"
              Color="#878787"
            />
          )}
        </div>

        {WinBoxStyle ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {ShowMinimize && (
              <WindowControlButton
                aria-label={IsMinimized ? "restore" : "minimize"}
                onClick={onMinimizeToggle}
              >
                <MinimizeIcon sx={{ fontSize: 16 }} />
              </WindowControlButton>
            )}
            {ShowMaximize && (
              <WindowControlButton
                aria-label={IsMaximized ? "restore" : "maximize"}
                onClick={onMaximizeToggle}
              >
                {IsMaximized ? (
                  <FilterNoneIcon sx={{ fontSize: 16 }} />
                ) : (
                  <CropSquareIcon sx={{ fontSize: 16 }} />
                )}
              </WindowControlButton>
            )}
            {onClose && (
              <WindowControlButton aria-label="close" onClick={onClose}>
                <CloseIcon sx={{ fontSize: 16 }} />
              </WindowControlButton>
            )}
          </div>
        ) : (
          onClose && (
            <StyledCloseButton aria-label="close" onClick={onClose}>
              <CloseIcon />
            </StyledCloseButton>
          )
        )}
      </div>
    </StyledDialogTitle>
  );
};

// --- MAIN FUNCTIONAL COMPONENT ---

const BaseDialog = React.forwardRef((props, ref) => {
  const { t } = useTranslation();
  // Phone AND tablet portrait: everywhere the permanent sidebar is absent.
  const isCompact = useIsCompact();
  const {
    Width = "auto",
    Height,
    MaxWidth = "md",
    Scroll = "paper",
    Title = "",
    HeaderContent = null,
    MarginBottom = "auto",
    MinHeight = "30px",
    Padding = "8px 24px",
    overflowInherit = false,
    Movable = true,
    Resizable = true,
    WinBoxStyle = true,
    ShowMinimize = true,
    ShowMaximize = true,
    ShowPrintAndSave = false,
    ShowDecline = false,
    ShowSave = false,
    ShowConfirm = false,
    Save,
    Confirm,
    ConfirmButtonText = "Confirm",
    Decline,
    ShowPrint = false,
    Print,
    SaveButtonText = "Save",
    ShowSaveNotLoad = false,
    Close,
    children,
  } = props;

  // Parse Width and Height props
  const initialWidth =
    Width && typeof Width === "string" && Width.endsWith("px")
      ? parseInt(Width, 10)
      : Width === "auto" || !Width
        ? 900 // default width
        : typeof Width === "number"
          ? Width
          : 900; // fallback to default

  const initialHeight =
    Height && typeof Height === "string" && Height.endsWith("px")
      ? parseInt(Height, 10)
      : Height || window.innerHeight * 0.8;

  // Use the window management hook
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
    initialWidth,
    initialHeight,
    Movable,
    Resizable,
  });

  // Resize Handle. Never on a compact screen: an 18px corner target is below
  // any usable touch size, and there is nothing to resize when the dialog is
  // the whole viewport.
  const resizeHandle =
    Resizable && !isMaximized && !isMinimized && !isCompact ? (
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

  /**
   * Below `md` the dialog stops being a floating window and becomes the screen.
   *
   * This component hosts every clinical form (see
   * customComponents/PatientActions/NationalRegistry.jsx), so its shape matters
   * more than any individual form's. As a window it was wrong on a tablet in
   * three separate ways:
   *
   *  - It opens at 900x80vh. `useDialogWindow` clamps that to the viewport ONCE,
   *    at open, and the paper is `position: fixed` with a translate - so
   *    rotating the device left it sized and positioned for the old
   *    orientation, frequently half off-screen.
   *  - Dragging by the title bar and resizing from an 18px corner grip are
   *    mouse gestures. The grip is smaller than a fingertip, and the title bar
   *    sets `touchAction: none`, which swallows the scroll gesture.
   *  - A 900px window on a 768px tablet is already effectively full screen,
   *    just with the edges cut off.
   *
   * Full screen removes all three at once, and the flex column below keeps the
   * action bar pinned to the bottom the same way it is on desktop.
   */
  const paperSx = isCompact
    ? {
        position: "relative",
        margin: 0,
        width: "100%",
        maxWidth: "100%",
        height: "100%",
        maxHeight: "100%",
        borderRadius: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "visible",
      }
    : {
        position: WinBoxStyle ? "fixed" : "relative",
        top: WinBoxStyle ? 8 : undefined,
        left: WinBoxStyle ? 8 : undefined,
        margin: 0,
        transform: `translate(${Math.max(0, pos.x)}px, ${Math.max(0, pos.y)}px)`,
        width: size.width,
        height: isMinimized ? "auto" : size.height,
        maxWidth: "100vw",
        maxHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "visible",
      };

  return (
    <Dialog
      open
      fullScreen={isCompact}
      fullWidth={Width !== "auto" ? false : true}
      onClose={Close}
      maxWidth={MaxWidth}
      disableEscapeKeyDown={false}
      ref={ref}
      sx={{
        "& .MuiDialog-container": {
          alignItems: "flex-start",
          justifyContent: "flex-start",
        },
        "& .MuiDialog-paperScrollPaper": { margin: 0, overflow: "visible" },
        "& .MuiDialog-paper": { overflowY: "initial" },
      }}
      scroll={Scroll}
      PaperProps={{
        ref: paperRef,
        component: Paper,
        sx: paperSx,
      }}
    >
      <DialogTitle
        onClose={Close}
        // Dragging a full-screen dialog is meaningless, and `Movable` is what
        // puts `touchAction: none` on the title bar - which swallows touch
        // scrolling that starts anywhere near the header.
        Movable={Movable && !isCompact}
        onPointerDown={onTitlePointerDown}
        WinBoxStyle={WinBoxStyle}
        IsMaximized={isMaximized}
        IsMinimized={isMinimized}
        // Minimize/maximize are window gestures on 22px buttons. Full screen
        // has no window to manage, and the buttons sit next to Close.
        ShowMinimize={ShowMinimize && !isCompact}
        ShowMaximize={ShowMaximize && !isCompact}
        onMinimizeToggle={toggleMinimize}
        onMaximizeToggle={toggleMaximize}
        headerContent={HeaderContent}
      >
        {t(Title + "")}
      </DialogTitle>
      {!isMinimized ? (
        <StyledDialogContent
          dividers
          sx={{
            marginBottom: MarginBottom,
            width: "100%",
            padding: Padding,
            overflow: overflowInherit ? "inherit" : "auto",
            flex: "1 1 auto",
            minHeight: MinHeight || 0,
            position: "relative",
          }}
        >
          {children}
        </StyledDialogContent>
      ) : (
        <div style={{ height: 0, overflow: "hidden" }}></div>
      )}
      {!isMinimized && (
        <BaseDialogActions
          ShowPrintAndSave={ShowPrintAndSave}
          ShowDecline={ShowDecline}
          ShowSave={ShowSave}
          ShowConfirm={ShowConfirm}
          ShowPrint={ShowPrint}
          ShowSaveNotLoad={ShowSaveNotLoad}
          Save={Save}
          Decline={Decline}
          Confirm={Confirm}
          Print={Print}
          SaveButtonText={SaveButtonText}
          ConfirmButtonText={ConfirmButtonText}
        />
      )}
      {resizeHandle}
    </Dialog>
  );
});

export default BaseDialog;
