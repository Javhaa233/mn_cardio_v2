import React, { useEffect, useRef, useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// default components
import Button from "components/CustomButtons/Button";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
// custom components
import BaseDialog from "customComponents/BaseDialog";
import CustomTooltip from "customComponents/CustomTooltip";
import OrderHospitalizationForm from "customComponents/Forms/OrderHospitalizationForm";
// helper
import Helper from "helper";

export default function BtnHospitalize(props) {
  const { t } = useTranslation();

  const { PatientId, className = "" } = props;

  const [Dialog, setDialog] = useState(null);
  const [Check, setCheck] = useState(false);
  const [DisabledText, setDisabledText] = useState("");
  //   const DoctorId = Helper.AuthHelper.GetLogedDoctorLocal().id_data;

  // refs
  const FormRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const checkData = async () => {
      if (PatientId) {
        await Helper.OrderHospitalizationHelper.CheckPatient(
          PatientId,
          (resData) => {
            if (!isMounted) return;

            if (resData && resData.Success && resData.Data) {
              setCheck(resData.Data.Check);
              setDisabledText(resData.Data.Text);
            } else {
              setCheck(false);
              setDisabledText("");
            }
          },
        );
      } else {
        if (isMounted) {
          setCheck(false);
        }
      }
    };

    checkData();

    return () => {
      isMounted = false;
    };
  }, [PatientId]);

  const ShowForm = () => {
    setDialog(
      <BaseDialog
        Close={() => setDialog(null)}
        Title={t("To Hospitalize")}
        Width="700px"
        Height="500px"
        Save={() => {
          if (FormRef.current && FormRef.current.Save) {
            FormRef.current.Save((success) => {
              success && setDialog(null);
            });
          }
        }}
        ShowSave={true}
      >
        <OrderHospitalizationForm
          ref={FormRef}
          ObjectName="OrderHospitalization"
          PatientId={PatientId}
        />
      </BaseDialog>,
    );
  };

  return (
    <div>
      {Dialog}
      <CustomTooltip title={DisabledText}>
        <div style={{ display: "inline-block" }}>
          <Button
            disabled={!PatientId || !Check ? true : false}
            color="success"
            size="sm"
            className={className}
            onClick={ShowForm}
            sx={{
              color: "#fff",
              "&.Mui-disabled": { color: "#fff", opacity: 0.75 },
            }}
          >
            <LocalHospitalIcon />
            {t("To Hospitalize")}
          </Button>
        </div>
      </CustomTooltip>
    </div>
  );
}
