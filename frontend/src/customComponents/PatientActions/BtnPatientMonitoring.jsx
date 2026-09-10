import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import Button from "components/CustomButtons/Button";

import Helper from "helper";

export default function BtnPatientMonitoring(props) {
  const { t } = useTranslation();

  const { PatientId = null, className = "" } = props;

  const [Check, setCheck] = useState(false);
  const [Alert, setAlert] = useState(null);

  useEffect(() => {
    GetData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PatientId]);

  const GetData = async () => {
    if (PatientId) {
      await Helper.PatientMonitoringHelper.CheckPatientMonitoring(
        PatientId,
        (resData) => {
          if (resData && resData.Success && resData.Data)
            setCheck(resData.Data.Check);
        },
      );
    }
  };

  const SavePatient = async () => {
    let alert = null;
    alert = Helper.BaseCrudHelper.ShowConfirm(
      "Хувийн хяналтандаа авахдаа итгэлтэй байна уу ?",
      async () => {
        setAlert(null);
        await Helper.PatientMonitoringHelper.SavePatient(
          { PatientId },
          (resData) => {
            if (resData) {
              alert = Helper.BaseCrudHelper.ShowAlert(
                resData.Message,
                resData.Success,
                () => {
                  setAlert(null);
                  GetData();
                },
              );
              setAlert(alert);
            }
          },
        );
      },
      () => setAlert(null),
    );
    setAlert(alert);
  };

  return (
    <div style={{ display: "inline-block" }}>
      {Alert}
      <Button
        color="danger"
        disabled={!PatientId || !Check ? true : false}
        className={className}
        onClick={SavePatient}
        size="sm"
      >
        {t("Take under monitoring")}
      </Button>
    </div>
  );
}
