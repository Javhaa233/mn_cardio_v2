import React, { useRef, useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// default components
import Button from "components/CustomButtons/Button";
// custom components
import BaseDialog from "customComponents/BaseDialog";
import EcgForm from "customComponents/Forms/EcgForm";

export default function BtnNewEcg(props) {
  const { t } = useTranslation();

  const { PatientId, className = "", Save } = props;

  const [Dialog, setDialog] = useState(null);

  // refs
  const FormRef = useRef(null);

  const ShowForm = () => {
    setDialog(
      <BaseDialog
        Close={() => setDialog(null)}
        Title="ECG"
        Save={() => {
          if (FormRef.current && FormRef.current.Save) {
            FormRef.current.Save((success) => {
              if (success) {
                Save && Save();
                setDialog(null);
              }
            });
          }
        }}
        ShowSave={true}
      >
        <EcgForm
          ref={FormRef}
          ObjectName="EcgExamination"
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
        {t("ECG")}
      </Button>
    </div>
  );
}
