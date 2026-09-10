import React, { useRef, useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// default components
import Button from "components/CustomButtons/Button";
// custom components
import BaseDialog from "customComponents/BaseDialog";
import HfStayForm from "customComponents/Forms/HfStayForm";

export default function BtnHfStay(props) {
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
        Title="Heart failure"
        Save={(stopLoading) => {
          if (Form.current && Form.current.Save) {
            Form.current.Save((success) => {
              success && Save && Save(success);
              stopLoading && stopLoading();
            });
          } else {
            stopLoading && stopLoading();
          }
        }}
        ShowSave={true}
      >
        <HfStayForm ref={Form} ObjectName="HfStay" PatientId={PatientId} />
      </BaseDialog>,
    );
  };

  return (
    <div>
      {Dialog}
      <Button
        color="primary"
        disabled={!PatientId ? true : false}
        className={className}
        size="sm"
        onClick={ShowForm}
      >
        {t("Heart failure")}
      </Button>
    </div>
  );
}
