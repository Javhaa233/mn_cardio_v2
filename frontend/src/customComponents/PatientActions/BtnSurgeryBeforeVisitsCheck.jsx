import React, { useEffect, useState, useRef } from "react";
// translation
import { useTranslation } from "react-i18next";
// default components
import Button from "components/CustomButtons/Button";
import ChecklistIcon from "@mui/icons-material/Checklist";
// custom components
import BaseDialog from "customComponents/BaseDialog";
import SurgeryBeforeVisitsCheckForm from "customComponents/Forms/SurgeryBeforeVisitsCheckForm";
// helper
import Helper from "helper";

export default function BtnSurgeryBeforeVisitsCheck(props) {
  const { t } = useTranslation();

  const { PatientId, DoctorsTeamPatientId, className = "" } = props;

  const [Dialog, setDialog] = useState(null);
  const [CreateProcedure, setCreateProcedure] = useState(false);

  const FormRef = useRef(null);
  const DialogRef = useRef(null);

  useEffect(() => {
    CheckProcedure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [DoctorsTeamPatientId]);

  const CheckProcedure = async () => {
    if (DoctorsTeamPatientId) {
      await Helper.DoctorTeamHelper.CheckSurgeryBeforeCheck(
        { DoctorsTeamPatientId },
        (resData) => resData && setCreateProcedure(resData.CheckData),
      );
    } else {
      setCreateProcedure(false);
    }
  };

  const ShowForm = () => {
    setDialog(
      <BaseDialog
        ref={DialogRef}
        Close={() => setDialog(null)}
        Title={t("Surgery Before Visits")}
        Width="570px"
        Save={() => {
          if (FormRef.current && FormRef.current.Save) {
            FormRef.current.Save(
              (resData) => resData && resData.Success && setDialog(null),
            );
          }
        }}
        Print={() => {
          if (FormRef.current && FormRef.current.Print) {
            FormRef.current.Print(() => {
              if (DialogRef.current && DialogRef.current.setState) {
                DialogRef.current.setState({ PrintLoading: false });
              }
            });
          }
        }}
        ShowPrint={true}
        ShowSave={true}
      >
        <SurgeryBeforeVisitsCheckForm
          ref={FormRef}
          ObjectName="SurgeryBeforeVisitsCheck"
          PatientId={PatientId}
          DoctorsTeamPatientId={DoctorsTeamPatientId}
        />
      </BaseDialog>,
    );
  };
  if (!CreateProcedure) {
    return null;
  } else {
    return (
      <div>
        {Dialog}
        <Button
          color="danger"
          disabled={!PatientId || !DoctorsTeamPatientId ? true : false}
          className={className}
          onClick={ShowForm}
          size="sm"
        >
          <ChecklistIcon />
          {t("Surgery Before Visits")}
        </Button>
      </div>
    );
  }
}
