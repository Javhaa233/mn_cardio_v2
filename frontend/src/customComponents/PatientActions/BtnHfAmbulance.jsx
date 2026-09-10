import React, { useState, useRef } from "react";
// translation
import { useTranslation } from "react-i18next";
// default components
import Button from "components/CustomButtons/Button";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
// custom components
import BaseDialog from "customComponents/BaseDialog";
import HfAmbulanceForm from "customComponents/Forms/NationalRegistry/HeartFailure/HfAmbulanceForm";

export default function BtnHfAmbulance(props) {
  const { t } = useTranslation();

  const [Dialog, setDialog] = useState(null);

  const { PatientId, PatientRegNo, className = "" } = props;

  // refs
  const DialogRef = useRef(null);
  const FormRef = useRef(null);

  const ShowForm = () => {
    setDialog(
      <BaseDialog
        ref={DialogRef}
        Close={() => setDialog(null)}
        Title={t("Heart Failure (Ambulance)")}
        Confirm={() => {
          if (FormRef.current && FormRef.current.Confirm) {
            FormRef.current.Confirm((success) => {
              success && setDialog(null);
              if (DialogRef.current && DialogRef.current.setState) {
                DialogRef.current.setState({ ConfirmLoading: false });
              }
            });
          }
        }}
        Save={() => {
          if (FormRef.current && FormRef.current.SaveAll) {
            FormRef.current.SaveAll((success) => {
              if (success) {
                setDialog(null);
              }
            });
          }
        }}
        ShowSave={true}
        ShowPrint={false}
        ShowConfirm={true}
      >
        <HfAmbulanceForm
          ref={FormRef}
          ObjectName="HfAmbulance"
          PatientId={PatientId}
          PatientRegNo={PatientRegNo}
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
        {/* {t("Зүрхний дутагдлын хяналт")} */}
        <MonitorHeartIcon />
        {t("ЗД хяналтын үзлэг")}
      </Button>
    </div>
  );
}
