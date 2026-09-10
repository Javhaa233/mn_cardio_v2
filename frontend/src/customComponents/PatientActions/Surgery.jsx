import React, { useState, useRef } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
// default components
import Button from "components/CustomButtons/Button";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
// my components
import BaseDialog from "customComponents/BaseDialog";

// forms
import SurgeryReportForm from "customComponents/Forms/SurgeryReportForm";
import CathlabForm from "customComponents/Forms/CathlabForm";
import SurgeryPlansForm from "customComponents/Forms/SurgeryPlansForm";

export default function Surgery(props) {
  const { t } = useTranslation();

  const {
    PatientId = null,
    PatRegNo = null,
    SaveCathlab,
    SaveSurgeryReport,
    SaveSurgeryPlans,
    className = "",
  } = props;

  // const [ParentMenuOpen, setParentMenuOpen] = useState(false);
  const [MenuValue, setMenuValue] = useState(null);

  const [SurgeryReportDialog, setSurgeryReportDialog] = useState(null);
  const [CathlabDialog, setCathlabDialog] = useState(null);
  const [surgeryPlansDialog, setSurgeryPlansDialog] = useState(null);

  // refs
  const SurgeryReportDialogRef = useRef();
  const CathlabDialogRef = useRef();
  const SurgeryPlansDialogRef = useRef();

  const SurgeryReportFormRef = useRef();
  const CathlabFormRef = useRef();
  const SurgeryPlansFormRef = useRef();

  const ShowSurgeryReportForm = () => {
    setSurgeryReportDialog(
      <BaseDialog
        ref={(ref) => (SurgeryReportDialogRef.current = ref)}
        Close={() => setSurgeryReportDialog(null)}
        Title={t("Open heart surgery")}
        Save={(stopLoading) =>
          SurgeryReportFormRef.current?.Save &&
          SurgeryReportFormRef.current.Save((success) => {
            if (success) {
              SaveSurgeryReport && SaveSurgeryReport(success);
              setSurgeryReportDialog(null);
            }
            stopLoading && stopLoading();
          })
        }
        ShowSave={true}
      >
        <SurgeryReportForm
          ref={(ref) => (SurgeryReportFormRef.current = ref)}
          ObjectName="CardiacSurgeryReport"
          PatientId={PatientId}
          PatRegNo={PatRegNo}
        />
      </BaseDialog>,
    );
  };

  const ShowCathlabForm = () => {
    setCathlabDialog(
      <BaseDialog
        ref={(ref) => (CathlabDialogRef.current = ref)}
        Close={() => setCathlabDialog(null)}
        Title={t("Cathlab")}
        MaxWith={"lg"}
        Save={(stopLoading) =>
          CathlabFormRef.current?.Save &&
          CathlabFormRef.current.Save((Success) => {
            if (Success) {
              SaveCathlab && SaveCathlab(Success);
              setCathlabDialog(null);
            }
            stopLoading && stopLoading();
          })
        }
        Scroll="body"
        ShowSave={true}
      >
        <CathlabForm
          ref={(ref) => (CathlabFormRef.current = ref)}
          ObjectName="PCathlab"
          PatientId={PatientId}
          PatRegNo={PatRegNo}
        />
      </BaseDialog>,
    );
  };

  const ShowSurgeryPlansForm = () => {
    setSurgeryPlansDialog(
      <BaseDialog
        ref={(ref) => (SurgeryPlansDialogRef.current = ref)}
        Close={() => setSurgeryPlansDialog(null)}
        Title={t("Surgery plan")}
        MaxWith={"lg"}
        Save={(stopLoading) =>
          SurgeryPlansFormRef.current?.Save &&
          SurgeryPlansFormRef.current.Save((Success) => {
            if (Success) {
              SaveSurgeryPlans && SaveSurgeryPlans(Success);
              setSurgeryPlansDialog(null);
            }
            stopLoading && stopLoading();
          })
        }
        Scroll="body"
        ShowSave={true}
      >
        <SurgeryPlansForm
          ref={(ref) => (SurgeryPlansFormRef.current = ref)}
          ObjectName="SurgeryPlans"
          PatRegNo={PatRegNo}
        />
      </BaseDialog>,
    );
  };

  return (
    <div>
      {SurgeryReportDialog}
      {CathlabDialog}
      {surgeryPlansDialog}
      <Button
        disabled={!PatientId ? true : false}
        color="danger"
        onClick={(event) => {
          setMenuValue(event.currentTarget);
          // setParentMenuOpen(Boolean(event.currentTarget));
        }}
        size="sm"
        className={className}
      >
        <MedicalServicesIcon />
        {t("CardiacSurgeryProcedure")}
      </Button>
      <Menu
        anchorEl={MenuValue}
        keepMounted
        open={Boolean(MenuValue)}
        onClose={() => setMenuValue(null)}
        style={{ minWidth: "300px" }}
      >
        <MenuItem
          disabled={!PatientId ? true : false}
          onClick={() => {
            ShowSurgeryReportForm();
            setMenuValue(null);
          }}
        >
          {t("Open heart surgery")}
        </MenuItem>
        <MenuItem
          disabled={!PatientId ? true : false}
          onClick={() => {
            ShowCathlabForm();
            setMenuValue(null);
          }}
        >
          {t("Cathlab")}
        </MenuItem>
        <MenuItem
          disabled={!PatientId ? true : false}
          onClick={() => {
            ShowSurgeryPlansForm();
            setMenuValue(null);
          }}
        >
          {t("Surgery plan")}
        </MenuItem>
      </Menu>
    </div>
  );
}
