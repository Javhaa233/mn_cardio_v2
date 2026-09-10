import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { renderDetailViewFields } from "baseComponents/renderDetailViewFields.jsx";
import { useBaseForm } from "baseComponents/useBaseForm";
import BaseDialogActions from "baseComponents/BaseDialogActions";
import BaseLoading from "customComponents/BaseLoading";
import Button from "components/CustomButtons/Button";

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
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <Button color="transparent" onClick={Close}>
            {t("Cancel")}
          </Button>
          <BaseDialogActions ShowSave={true} Save={() => onSave(Save)} />
        </div>
      )}
    </div>
  );
}
