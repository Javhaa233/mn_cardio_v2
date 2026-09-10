import React, { useRef, useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// default components
import Button from "components/CustomButtons/Button";
// custom components
import BaseDialog from "customComponents/BaseDialog";
import EchoForm from "customComponents/Forms/EchoForm";

export default function BtnNewEcho(props) {
  const { t } = useTranslation();

  const { PatientId, className = "", Save } = props;

  const [Dialog, setDialog] = useState(null);

  // refs
  const FormRef = useRef(null);

  const ShowForm = () => {
    setDialog(
      <BaseDialog
        Close={() => setDialog(null)}
        Title="ECHO"
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
        ShowPrint={true}
        Print={(stopLoading) => {
          if (FormRef.current && FormRef.current.Print) {
            FormRef.current.Print(() => {
              stopLoading && stopLoading();
            });
          }
        }}
        Scroll="body"
      >
        <EchoForm
          ref={FormRef}
          ObjectName="ExaminationEcho"
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
        {t("ECHO")}
      </Button>
    </div>
  );
}
