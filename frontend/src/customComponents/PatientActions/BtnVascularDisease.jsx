import React, { useRef, useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// default components
import Button from "components/CustomButtons/Button";
// custom components
import BaseDialog from "customComponents/BaseDialog";
import VascularDiseaseForm from "customComponents/Forms/NationalRegistry/VascularDisease/VascularDiseaseForm";

export default function BtnVascularDisease(props) {
  const { t } = useTranslation();

  const { PatientId, className = "", Save } = props;

  const [Dialog, setDialog] = useState(null);

  // refs
  const Form = useRef(null);
  const DialogRef = useRef(null);

  const ShowForm = () => {
    setDialog(
      <BaseDialog
        ref={DialogRef}
        Close={() => setDialog(null)}
        Title="Vascular disease"
        Save={(stopLoading) => {
          if (Form.current && Form.current.Save) {
            Form.current.Save((resData) => {
              if (resData && resData.Success) Save && Save(resData.Success);
              stopLoading && stopLoading();
            });
          } else {
            stopLoading && stopLoading();
          }
        }}
        ShowSave={true}
      >
        <VascularDiseaseForm
          ref={Form}
          ObjectName="VascularDisease"
          PatientId={PatientId}
        />
      </BaseDialog>,
    );
  };

  return (
    <div>
      {Dialog}
      {/* Opens a form: neutral. "rose" maps to the destructive (red) rank. */}
      <Button
        color="info"
        disabled={!PatientId ? true : false}
        className={className}
        onClick={ShowForm}
        size="sm"
      >
        {t("Vascular disease")}
      </Button>
    </div>
  );
}
