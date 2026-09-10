import React, { useRef, useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// default components
import Button from "components/CustomButtons/Button";
// custom components
import BaseDialog from "customComponents/BaseDialog";
import PatientTransferForm from "customComponents/Forms/PatientTransferForm";

export default function BtnPatientTransfer(props) {
  const { t } = useTranslation();

  const { PatientId = null, className = "", Save } = props;

  const [Dialog, setDialog] = useState(null);

  const FormRef = useRef(null);

  const ShowForm = () => {
    setDialog(
      <BaseDialog
        Close={() => setDialog(null)}
        Title="Transfer"
        Width="700px"
        Save={() => {
          if (FormRef.current && FormRef.current.Save) {
            FormRef.current.Save((resData) => {
              if (resData && resData.Success) {
                Save && Save(resData.Success);
                setDialog(null);
              }
            });
          }
        }}
        ShowSave={true}
        Scroll="body"
      >
        <PatientTransferForm
          ref={FormRef}
          ObjectName="PatientTransfer"
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
        {t("Transfer")}
      </Button>
    </div>
  );
}
