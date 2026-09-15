import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent } from "@mui/material";

import BaseLoading from "customComponents/BaseLoading";
import { renderDetailViewFields } from "baseComponents/renderDetailViewFields.jsx";
import { useBaseForm } from "baseComponents/useBaseForm";
import { useDialogWindow } from "baseComponents/useDialogWindow";
import BaseDialogActions from "baseComponents/BaseDialogActions";
// The window chrome is BaseDialog's; this file used to carry its own copy.
import {
  DialogTitle,
  resizeGripStyle,
  windowPaperSx,
} from "customComponents/BaseDialog";

/* ================= MAIN ================= */

export default function UsersDetail(props) {
  const { t } = useTranslation();

  const {
    ObjectName,
    DataId,
    Config,
    Save,
    Close,
    Title = "",
    IsNew = false,
    HideSave = false,
    LayoutPattern,
    formSize,
    NewObject,
  } = props;

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
    initialWidth: formSize?.width ? parseInt(formSize.width) : 900,
    initialHeight: formSize?.height
      ? parseInt(formSize.height)
      : window.innerHeight * 0.8,
  });

  /* ---------- FORM STATE ---------- */

  const { loading, fields, editObject, ChangeValue, onSave } = useBaseForm({
    ObjectName,
    Config,
    DataId,
    IsNew,
    NewObject,
  });

  /* ---------- RENDER FIELDS ---------- */

  // Force all fields to be editable for the view so they appear
  const visibleFields = useMemo(() => {
    if (!fields) return [];
    return fields.flat().map((f) => ({ ...f, EditField: true }));
  }, [fields]);

  const renderedFields = useMemo(() => {
    return renderDetailViewFields(
      visibleFields,
      ObjectName,
      LayoutPattern,
      editObject,
      ChangeValue,
      DataId,
    );
  }, [
    visibleFields,
    ObjectName,
    LayoutPattern,
    editObject,
    ChangeValue,
    DataId,
  ]);

  /* ================= RENDER ================= */

  const resizeHandle =
    !isMaximized && !isMinimized ? (
      <div
        data-resize-handle="true"
        onPointerDown={onResizePointerDown}
        style={resizeGripStyle}
      />
    ) : null;

  const displayTitle =
    Title || Config?.TitleObject?.EditObjectTitle || ObjectName;

  return (
    <Dialog
      open
      onClose={Close}
      PaperProps={{
        ref: paperRef,
        sx: {
          ...windowPaperSx,
          position: "fixed",
          top: pos.y + 8,
          left: pos.x + 8,
          margin: 0,
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
        Movable={true}
        WinBoxStyle={true}
        ShowMinimize={true}
        ShowMaximize={true}
        IsMaximized={isMaximized}
        IsMinimized={isMinimized}
        onMinimizeToggle={toggleMinimize}
        onMaximizeToggle={toggleMaximize}
        onPointerDown={onTitlePointerDown}
      >
        {t(displayTitle)}
      </DialogTitle>

      {!isMinimized && (
        <>
          <DialogContent dividers>
            {loading ? <BaseLoading /> : renderedFields}
          </DialogContent>

          {!HideSave && (
            <BaseDialogActions ShowSave={true} Save={() => onSave(Save)} />
          )}
        </>
      )}

      {resizeHandle}
    </Dialog>
  );
}
