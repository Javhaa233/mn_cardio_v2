import React, { useRef, useState } from "react";
// translation
import { useTranslation } from "react-i18next";

import Button from "components/CustomButtons/Button";

import BaseDialog from "customComponents/BaseDialog";
import BloodStrokeForm from "customComponents/Forms/BloodStrokeForm";

export default function BtnNewBloodStroke(props) {
  const { t } = useTranslation();

  const { PatientId, className = "", Save } = props;

  // const [Alert, setAlert] = useState(null);
  const [Dialog, setDialog] = useState(null);

  // refs
  const FormRef = useRef(null);

  const ShowForm = () => {
    setDialog(
      <BaseDialog
        Close={() => setDialog(null)}
        Title="INR"
        overflowInherit={true}
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
        <BloodStrokeForm
          ref={FormRef}
          ObjectName="BloodStroke"
          PatientId={PatientId}
        />
      </BaseDialog>,
    );
  };

  return (
    <div>
      {Dialog}
      {/* {Alert} */}
      <Button
        color="danger"
        disabled={!PatientId ? true : false}
        className={className}
        size="sm"
        onClick={ShowForm}
      >
        {t("INR")}
      </Button>
    </div>
  );
}
