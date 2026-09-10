// BaseDetailView.jsx (BaseDetailForm MERGED)
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { styled } from "@mui/material/styles";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import MuiDialogTitle from "@mui/material/DialogTitle";

import CloseIcon from "@mui/icons-material/Close";
import CropSquareIcon from "@mui/icons-material/CropSquare";
import FilterNoneIcon from "@mui/icons-material/FilterNone";
import MinimizeIcon from "@mui/icons-material/Minimize";
import SaveIcon from "@mui/icons-material/Save";

import Button from "components/CustomButtons/Button";
import BaseLoading from "customComponents/BaseLoading";
import BaseLabel from "customComponents/BaseViewControls/BaseLabel";
import CustomTab from "customComponents/CustomTab";
import BaseField from "baseComponents/BaseField";
import { renderDetailViewFields } from "baseComponents/renderDetailViewFields.jsx";
import { useBaseForm } from "baseComponents/useBaseForm";
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
          overflow: "hidden",
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
                  minHeight: 0,
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
        onMinimize={toggleMinimize}
        onMaximize={toggleMaximize}
        isMaximized={isMaximized}
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
