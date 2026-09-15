import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { renderDetailViewFields } from "baseComponents/renderDetailViewFields.jsx";
import { useBaseForm } from "baseComponents/useBaseForm";
import Button from "@mui/material/Button";
import SaveIcon from "@mui/icons-material/Save";
import BaseLoading from "customComponents/BaseLoading";
import { dialogActionSx } from "@/theme/controlStyles";

export default function AppsDetail(props) {
  const { t } = useTranslation();
  const {
    ObjectName,
    DataId,
    Config,
    Save,
    Close,
    IsNew,
    HideSave = false,
    LayoutPattern,
  } = props;

  const { loading, fields, editObject, ChangeValue, onSave } = useBaseForm({
    ObjectName,
    Config,
    DataId,
    IsNew,
  });

  // Force all fields to be editable for the view so they appear
  const visibleFields = useMemo(() => {
    if (!fields) return [];
    // Flatten and ensure EditField is true.
    // We also sort by position if available.
    return fields.flat().map((f) => ({ ...f, EditField: true }));
  }, [fields]);

  const renderedFields = useMemo(() => {
    return renderDetailViewFields(
      visibleFields,
      ObjectName,
      LayoutPattern,
      editObject,
      ChangeValue,
    );
  }, [visibleFields, ObjectName, LayoutPattern, editObject, ChangeValue]);

  if (loading) return <BaseLoading />;

  return (
    <div
      style={{
        padding: "20px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ flex: 1, overflowY: "auto" }}>{renderedFields}</div>
      {!HideSave && (
        // BaseDialogActions is a full-width dialog footer; dropped into this
        // row it pushed Cancel off the left edge of the card. Two plain
        // buttons with the same ranks instead.
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "8px",
            // Clear of the fixed chat button in the bottom-right corner.
            paddingRight: "72px",
          }}
        >
          <Button
            variant="outlined"
            onClick={Close}
            sx={dialogActionSx("neutral")}
          >
            {t("Cancel")}
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => onSave(Save)}
            sx={dialogActionSx("primary")}
          >
            {t("Save")}
          </Button>
        </div>
      )}
    </div>
  );
}
