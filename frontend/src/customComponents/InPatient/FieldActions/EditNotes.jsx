import React, { useState, useRef } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import IconButton from "@mui/material/IconButton";
// @mui/icons-material
import EditIcon from "@mui/icons-material/Edit";
// custom components
import BaseDialog from "customComponents/BaseDialog";
import EditBodyForm from "customComponents/InPatient/FieldActions/EditBodyForm";
import { colors } from "@/theme/colors";

export default function EditNotes(props) {
  const { t } = useTranslation();
  const { rowdata, Title = null, Field } = props;

  const [Dialog, setDialog] = useState(null);

  const Text = rowdata && Field ? rowdata[Field] : "";

  // refs
  const EditBodyFormRef = useRef();

  const ShowForm = () => {
    const Dialog = (
      <BaseDialog
        Title={Title}
        Close={() => setDialog(null)}
        Save={async (setLoading) => {
          if (EditBodyFormRef.current?.Save) {
            await EditBodyFormRef.current.Save();
            setDialog(null);
          }
          setLoading(false);
        }}
        ShowSave={true}
        Width="500px"
        Height="300px"
      >
        <EditBodyForm
          {...props}
          ref={(ref) => (EditBodyFormRef.current = ref)}
        />
      </BaseDialog>
    );
    setDialog(Dialog);
  };

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {Dialog}
      <IconButton
        aria-label={t("Edit")}
        onClick={ShowForm}
        style={{ margin: "2px", padding: "4px", color: colors.brand.cyanInk }}
      >
        <EditIcon fontSize="small" />
      </IconButton>
      {Text}
    </div>
  );
}
