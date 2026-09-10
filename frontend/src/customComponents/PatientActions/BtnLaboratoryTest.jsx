import React, { useState, useRef } from "react";
// translation
import { useTranslation } from "react-i18next";
// default components
import Button from "components/CustomButtons/Button";
// custom components
import BaseDialog from "customComponents/BaseDialog";
import LaboratoryTestForm from "customComponents/Forms/LaboratoryTestForm";

export default function BtnLaboratoryTest(props) {
  const { t } = useTranslation();

  const { PatientId, className = "", Save } = props;

  const [Dialog, setDialog] = useState(null);

  // refs
  const FormRef = useRef(null);

  const ShowForm = () => {
    setDialog(
      <BaseDialog
        Close={() => setDialog(null)}
        Title="Laboratory test"
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
        <LaboratoryTestForm
          ref={FormRef}
          ObjectName="LaboratoryTest"
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
        color="success"
        size="sm"
        className={className}
        onClick={ShowForm}
      >
        {t("Laboratory test")}
      </Button>
    </div>
  );
}
