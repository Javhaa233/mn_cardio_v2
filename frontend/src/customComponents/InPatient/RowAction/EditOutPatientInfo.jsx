import React, { useRef, useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import IconButton from "@mui/material/IconButton";
// @mui/icons-material
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
// default components
import Button from "components/CustomButtons/Button";
// custom components
import BaseDialog from "customComponents/BaseDialog";
import OutPatientInfoForm from "customComponents/Forms/OutPatientInfoForm";
import OutPatientInfoReport from "customComponents/Report/OutPatientInfoReport";
// helper
import Helper from "helper";
import { colors } from "@/theme/colors";

export default function EditOutPatientInfo(props) {
  const { t: tHook } = useTranslation();

  const {
    rowdata = {},
    OutPatientInfoField,
    StayField,
    PatientField,
    PatRegField,
    Where,
    t: tProp,
    IsIconButton,
  } = props;

  const t = tProp || tHook;

  const [Dialog, setDialog] = useState(null);
  const [Alert, setAlert] = useState(null);

  const Id =
    OutPatientInfoField && rowdata[OutPatientInfoField]
      ? rowdata[OutPatientInfoField].Id
      : null;
  const StayId = StayField ? rowdata[StayField] : null;
  const PatientId = PatientField ? rowdata[PatientField] : null;
  const patientRegister = PatRegField ? rowdata[PatRegField] : null;
  const Tasag = rowdata["DrgroupDepartments"]
    ? rowdata["DrgroupDepartments"]["name"]
    : null;

  // refs
  var DialogRef = useRef();
  var OutPatientInfoFormRef = useRef();
  var OutPatientInfoReportRef = useRef();

  const SetInsertForm = () => {
    let Data = null;
    if (StayId && PatientId) {
      if (Where === "InPatient") {
        Data = (
          <BaseDialog
            ref={(ref) => (DialogRef = ref)}
            Title={
              Tasag ? Tasag + t("AboutHospitalizedIn") : t("About hospitalized")
            }
            Close={() => setDialog(null)}
            Save={(stopLoading) => {
              OutPatientInfoFormRef.Save &&
                OutPatientInfoFormRef.Save(() => stopLoading && stopLoading());
            }}
            Print={(stopLoading) => {
              OutPatientInfoFormRef.Print &&
                OutPatientInfoFormRef.Print(() => stopLoading && stopLoading());
            }}
            ShowPrint={true}
            ShowSave={true}
            Width="900px"
          >
            <OutPatientInfoForm
              ref={(ref) => (OutPatientInfoFormRef = ref)}
              ObjectName="OutPatientInfo"
              StayId={StayId}
              PatientId={PatientId}
              patientRegister={patientRegister}
            />
          </BaseDialog>
        );
      }
      if (Where === "Archive") {
        if (Id) {
          Data = (
            <BaseDialog
              ref={(ref) => (DialogRef = ref)}
              Title={
                Tasag
                  ? Tasag + t("AboutHospitalizedIn")
                  : t("About hospitalized")
              }
              Close={() => setDialog(null)}
              Print={(stopLoading) => {
                OutPatientInfoReportRef.Print &&
                  OutPatientInfoReportRef.Print(
                    () => stopLoading && stopLoading(),
                  );
              }}
              ShowPrint={true}
            >
              <OutPatientInfoReport
                ref={(ref) => (OutPatientInfoReportRef = ref)}
                DataId={Id}
                IsInPatient={true}
              />
            </BaseDialog>
          );
        } else {
          Data = (
            <BaseDialog
              ref={(ref) => (DialogRef = ref)}
              Title={
                Tasag
                  ? Tasag + t("AboutHospitalizedIn")
                  : t("About hospitalized")
              }
              Close={() => setDialog(null)}
              Save={(stopLoading) => {
                OutPatientInfoFormRef.Save &&
                  OutPatientInfoFormRef.Save(
                    () => stopLoading && stopLoading(),
                  );
              }}
              Print={(stopLoading) => {
                OutPatientInfoFormRef.Print &&
                  OutPatientInfoFormRef.Print(
                    () => stopLoading && stopLoading(),
                  );
              }}
              ShowPrint={true}
              ShowSave={true}
              Width="900px"
            >
              <OutPatientInfoForm
                ref={(ref) => (OutPatientInfoFormRef = ref)}
                ObjectName="OutPatientInfo"
                StayId={StayId}
                PatientId={PatientId}
                patientRegister={patientRegister}
              />
            </BaseDialog>
          );
        }
      }
      setDialog(Data);
    }
  };

  const title = Tasag
    ? Tasag + t("AboutHospitalizedIn")
    : t("About hospitalized");

  return (
    <div>
      {Alert}
      {Dialog}
      {IsIconButton ? (
        <IconButton
          style={{ margin: "2px", padding: "4px", color: colors.brand.cyanInk }}
          title={title}
          onClick={SetInsertForm}
        >
          <ExitToAppIcon fontSize="small" />
        </IconButton>
      ) : (
        <Button
          variant="contained"
          color="info"
          size="sm"
          onClick={SetInsertForm}
          style={{ padding: "4px 8px 3px" }}
        >
          {title}
        </Button>
      )}
    </div>
  );
}
