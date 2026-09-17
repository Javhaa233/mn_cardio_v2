import React from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material
import { styled } from "@mui/material/styles";
import {
  DialogContent,
  Dialog,
  Paper,
  IconButton,
  Typography,
} from "@mui/material";
import MuiDialogTitle from "@mui/material/DialogTitle";
// @mui/icons-material
import CloseIcon from "@mui/icons-material/Close";
import CropSquareIcon from "@mui/icons-material/CropSquare";
import FilterNoneIcon from "@mui/icons-material/FilterNone";
import MinimizeIcon from "@mui/icons-material/Minimize";

import BaseDialogActions from "baseComponents/BaseDialogActions";
import { useDialogWindow } from "baseComponents/useDialogWindow";
import { useIsCompact } from "helper/useResponsive";
import { colors } from "@/theme/colors";
import { radius, elevation, motion } from "@/theme/tokens";

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
  userSelect: movable ? "none" : "auto",
  // A flat white bar, as on the account dialogs. It used to be a grey gradient
  // with a #878787 title - the lightest text in the dialog on its most
  // important line. The hairline under it comes from the content's `dividers`.
  padding: "8px 10px 8px 20px",
  minHeight: "48px",
  display: "flex",
  alignItems: "center",
  backgroundColor: colors.brand.surface,
  borderTopLeftRadius: "inherit",
  borderTopRightRadius: "inherit",
}));

/**
 * Minimize / maximize / close. Quiet until hovered: the title is what the eye
 * should land on, not three bordered circles beside it.
 */
const WindowControlButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== "danger",
})(({ danger }) => ({
  width: 30,
  height: 30,
  padding: 0,
  borderRadius: radius.sm,
  color: colors.brand.inkDim,
  backgroundColor: "transparent",
  transition: `background-color ${motion.fast}, color ${motion.fast}`,
  "&:hover": {
    backgroundColor: danger ? "rgba(220, 53, 69, 0.08)" : colors.brand.tint,
    color: danger ? colors.status.danger : colors.brand.ink,
  },
  "&.Mui-focusVisible": {
    outline: `2px solid ${colors.brand.focus}`,
    outlineOffset: "1px",
  },
}));

const StyledDialogContent = styled(DialogContent)(() => ({
  "&::-webkit-scrollbar": { width: "10px", height: "10px" },
  "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: colors.brand.hairlineStrong,
    borderRadius: radius.pill,
    border: "2px solid transparent",
    backgroundClip: "content-box",
    "&:hover": { backgroundColor: colors.brand.inkDim },
  },
  display: "flex",
  flexDirection: "column",
}));

/** The corner grip on a resizable window, in the brand hairline. */
export const resizeGripStyle = {
  position: "absolute",
  width: "18px",
  height: "18px",
  right: 0,
  bottom: 0,
  cursor: "nwse-resize",
  zIndex: 1301,
  touchAction: "none",
  background: `linear-gradient(135deg, transparent 55%, ${colors.brand.hairlineStrong} 55%)`,
  backgroundSize: "10px 10px",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "bottom 3px right 3px",
  borderBottomRightRadius: radius.lg,
};

/** Paper styles shared by the two window implementations. */
export const windowPaperSx = {
  backgroundColor: colors.brand.surface,
  borderRadius: radius.lg,
  boxShadow: elevation[4],
};

// --- TITLE COMPONENT ---

/**
 * The window title bar, exported so `baseComponents/BaseDetailView` draws the
 * same one instead of a second copy.
 */
export const DialogTitle = (props) => {
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
          width: "100%",
          minWidth: 0,
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
            // component="div": DialogTitle is already an h2, and a nested bare
            // heading would be reachable by _misc.scss.
            <Typography
              variant="h4"
              component="div"
              noWrap
              title={typeof children === "string" ? children : undefined}
              sx={{ color: colors.brand.ink, minWidth: 0 }}
            >
              {children}
            </Typography>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {WinBoxStyle && ShowMinimize && (
            <WindowControlButton
              aria-label={IsMinimized ? "restore" : "minimize"}
              onClick={onMinimizeToggle}
            >
              <MinimizeIcon sx={{ fontSize: 18 }} />
            </WindowControlButton>
          )}
          {WinBoxStyle && ShowMaximize && (
            <WindowControlButton
              aria-label={IsMaximized ? "restore" : "maximize"}
              onClick={onMaximizeToggle}
            >
              {IsMaximized ? (
                <FilterNoneIcon sx={{ fontSize: 16 }} />
              ) : (
                <CropSquareIcon sx={{ fontSize: 18 }} />
              )}
            </WindowControlButton>
          )}
          {onClose && (
            <WindowControlButton danger aria-label="close" onClick={onClose}>
              <CloseIcon sx={{ fontSize: 20 }} />
            </WindowControlButton>
          )}
        </div>
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
    DeclineButtonText,
    DeclineIcon,
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
        style={resizeGripStyle}
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
        ...windowPaperSx,
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
          DeclineButtonText={DeclineButtonText}
          DeclineIcon={DeclineIcon}
        />
      )}
      {resizeHandle}
    </Dialog>
  );
});

export default BaseDialog;
