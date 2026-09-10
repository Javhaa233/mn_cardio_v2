import React, { useState, useRef } from "react";
// translation
import { useTranslation } from "react-i18next";
// default components
import Button from "components/CustomButtons/Button";
// custom components
import BaseDialog from "customComponents/BaseDialog";
import OutPatientInfoForm from "customComponents/Forms/OutPatientInfoForm";

export default function BtnOutPatient(props) {
  const { t } = useTranslation();

  const { PatientId = null, className = "" } = props;

  const [Dialog, setDialog] = useState(null);

  const FormRef = useRef(null);

  const ShowForm = () => {
    setDialog(
      <BaseDialog
        Close={() => setDialog(null)}
        // Title="About hospitalized"
        Save={() => {
          if (FormRef.current && FormRef.current.Save) {
            FormRef.current.Save((resData) => {
              if (resData && resData.Success) {
                setDialog(null);
              }
            });
          }
        }}
        ShowSave={true}
      >
        <OutPatientInfoForm
          ref={FormRef}
          ObjectName="OutPatientInfo"
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
        {t("About hospitalized")}
      </Button>
    </div>
  );
}
