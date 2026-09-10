import React, { useState, useRef } from "react";
// translation
import { useTranslation } from "react-i18next";
// default components
import Button from "components/CustomButtons/Button";
import AssignmentIcon from "@mui/icons-material/Assignment";
// custom components
import BaseDialog from "customComponents/BaseDialog";
import VisitForm from "customComponents/Forms/VisitForm";

export default function BtnNewVisit(props) {
  const { t } = useTranslation();

  const { PatientId = null, PatRegNo = null, Save, className = "" } = props;

  const [Dialog, setDialog] = useState(null);

  // refs
  const FormRef = useRef(null);
  const DialogRef = useRef(null);

  const ShowForm = () => {
    setDialog(
      <BaseDialog
        ref={DialogRef}
        Close={() => setDialog(null)}
        Title={t("Visit")}
        Save={async (stopLoading) => {
          // Get the actual form instance (withRef: true requires getWrappedInstance())
          const formInstance = FormRef.current?.getWrappedInstance
            ? FormRef.current.getWrappedInstance()
            : FormRef.current;

          if (formInstance && formInstance.Save) {
            formInstance.Save((success) => {
              if (success) {
                Save && Save(success);
                setDialog(null);
              }
              stopLoading && stopLoading();
            });
          } else {
            stopLoading && stopLoading();
          }
        }}
        ShowSave={true}
        ShowPrint={true}
        Print={(stopLoading) => {
          // Get the actual form instance (withRef: true requires getWrappedInstance())
          const formInstance = FormRef.current?.getWrappedInstance
            ? FormRef.current.getWrappedInstance()
            : FormRef.current;

          if (formInstance && formInstance.Print) {
            formInstance.Print(() => {
              stopLoading && stopLoading();
            });
          } else {
            stopLoading && stopLoading();
          }
        }}
      >
        <VisitForm
          ref={FormRef}
          ObjectName="Visit"
          PatientId={PatientId}
          PatRegNo={PatRegNo}
        />
      </BaseDialog>,
    );
  };
  return (
    <div>
      {Dialog}
      <Button
        color="danger"
        disabled={!PatientId ? true : false}
        className={className}
        onClick={ShowForm}
        size="sm"
      >
        <AssignmentIcon />
        {t("Visit")}
      </Button>
    </div>
  );
}
