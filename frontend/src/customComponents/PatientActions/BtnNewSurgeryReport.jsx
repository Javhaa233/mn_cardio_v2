import React, { useRef, useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// default components
import Button from "components/CustomButtons/Button";
// custom components
import BaseDialog from "customComponents/BaseDialog";
import SurgeryReportForm from "customComponents/Forms/SurgeryReportForm";

export default function BtnNewSurgeryReport(props) {
  const { t } = useTranslation();

  const { PatientId = null, Save, className = "" } = props;

  const [Dialog, setDialog] = useState(null);

  // refs
  const FormRef = useRef(null);

  const ShowForm = () => {
    setDialog(
      <BaseDialog
        Close={() => setDialog(null)}
        Title="Open heart surgery"
        Save={() => {
          if (FormRef.current && FormRef.current.Save) {
            FormRef.current.Save((success) => {
              if (success) {
                Save && Save(success);
                setDialog(null);
              }
            });
          }
        }}
        ShowSave={true}
      >
        <SurgeryReportForm
          ref={FormRef}
          ObjectName="CardiacSurgeryReport"
          PatientId={PatientId}
        />
      </BaseDialog>,
    );
  };

  return (
    <div>
      {Dialog}
      <Button
        disabled={!PatientId ? true : false}
        color="danger"
        className={className}
        onClick={ShowForm}
        size="sm"
      >
        {t("Open heart surgery")}
      </Button>
    </div>
  );
}
