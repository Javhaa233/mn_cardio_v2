import React, { useRef, useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// default components
import Button from "components/CustomButtons/Button";
// custom components
import BaseDialog from "customComponents/BaseDialog";
import CathlabForm from "customComponents/Forms/CathlabForm";

// import Helper from "helper";

export default function BtnCathlab(props) {
  const { t } = useTranslation();

  const { PatientId, className = "", Save } = props;

  const [Dialog, setDialog] = useState(null);

  const Form = useRef(null);

  const ShowForm = () => {
    setDialog(
      <BaseDialog
        Close={() => setDialog(null)}
        Title="Cathlab"
        MaxWith={"lg"}
        Save={() => {
          if (Form.current && Form.current.Save) {
            Form.current.Save((success) => {
              if (success) {
                Save && Save();
                setDialog(null);
              }
            });
          }
        }}
        Scroll="body"
        ShowSave={true}
      >
        <CathlabForm ref={Form} ObjectName="PCathlab" PatientId={PatientId} />
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
        {t("Cathlab")}
      </Button>
    </div>
  );
}
