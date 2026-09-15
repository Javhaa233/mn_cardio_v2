// BaseDetailView.jsx (BaseDetailForm MERGED)
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent } from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";

import Button from "components/CustomButtons/Button";
import BaseLoading from "customComponents/BaseLoading";
import CustomTab from "customComponents/CustomTab";
import BaseField from "baseComponents/BaseField";
import { renderDetailViewFields } from "baseComponents/renderDetailViewFields.jsx";
import { useBaseForm } from "baseComponents/useBaseForm";
import { useDialogWindow } from "baseComponents/useDialogWindow";
import BaseDialogActions from "baseComponents/BaseDialogActions";
// This used to carry its own copy of the window title bar and grip - grey
// gradient, #878787 title, bordered circle buttons - so the two window
// implementations drifted. It now draws BaseDialog's.
import {
  DialogTitle,
  resizeGripStyle,
  windowPaperSx,
} from "customComponents/BaseDialog";

/* ================= MAIN ================= */

export default function BaseDetailView(props) {
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
    isDialog = true,
    labelWidth,
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

  const renderedFields = useMemo(() => {
    return renderDetailViewFields(
      fields,
      ObjectName,
      LayoutPattern,
      editObject,
      ChangeValue,
      DataId,
      labelWidth,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields, ObjectName, LayoutPattern, editObject, ChangeValue, DataId]);

  /* ================= INLINE RENDER (isDialog=false) ================= */

  if (!isDialog) {
    const allFlatFields = Array.isArray(fields)
      ? fields.flat().filter(Boolean)
      : [];
    const listViewFields = allFlatFields.filter((f) => f.Type === "ListView");
    const regularFields = allFlatFields.filter((f) => f.Type !== "ListView");

    const regularRendered =
      !loading && regularFields.length > 0
        ? renderDetailViewFields(
            [regularFields],
            ObjectName,
            LayoutPattern,
            editObject,
            ChangeValue,
            DataId,
            labelWidth,
          )
        : null;

    const tabs = listViewFields.map((field) => ({
      tabButton: t(field.Label || field.Name || ""),
      tabContent: (
        <BaseField
          Config={field}
          Value={null}
          ChangeValue={ChangeValue}
          ObjectName={ObjectName}
          DataId={DataId}
          isLast={true}
          FullHeight={true}
          MasterSaveAction={
            !HideSave ? (
              <Button
                color="success"
                size="sm"
                startIcon={<SaveIcon />}
                onClick={() => onSave(Save)}
              >
                {t("Save")}
              </Button>
            ) : null
          }
        />
      ),
    }));

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: "1 1 auto",
          minHeight: 0,
          height: "100%",
          // Scrolls when the page gives the detail less room than its fields
          // plus a usable grid (see the tab area below).
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {loading ? (
          <BaseLoading />
        ) : (
          <>
            {regularRendered && (
              <div
                style={{
                  flexShrink: 0,
                  padding: "8px 16px",
                  overflowY: "auto",
                }}
              >
                {regularRendered}
              </div>
            )}

            {tabs.length > 0 ? (
              <div
                style={{
                  flex: "1 1 auto",
                  // /optionType stacks two managers, so this detail got half
                  // the page; its fields took all of it and the child grid
                  // collapsed to a header and a footer with no rows. The grid
                  // keeps room for a few rows and the detail scrolls instead.
                  minHeight: "320px",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <CustomTab tabs={tabs} fillHeight={true} />
              </div>
            ) : (
              !HideSave && (
                <BaseDialogActions ShowSave={true} Save={() => onSave(Save)} />
              )
            )}
          </>
        )}
      </div>
    );
  }

  /* ================= DIALOG RENDER (isDialog=true) ================= */

  const resizeHandle =
    !isMaximized && !isMinimized ? (
      <div
        data-resize-handle="true"
        onPointerDown={onResizePointerDown}
        style={resizeGripStyle}
      />
    ) : null;

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
        {t(Title)}
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
