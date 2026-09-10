import React, { useRef, useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
// custom components
import BaseDialog from "customComponents/BaseDialog";
import Button from "components/CustomButtons/Button";
import CalculateIcon from "@mui/icons-material/Calculate";
import ATRIABleedingRiskScore from "customComponents/Forms/Calculators/ATRIABleedingRiskScore";
import CHA2DS2VAScAtrialFibrillationStrokeRisk from "customComponents/Forms/Calculators/CHA2DS2VAScAtrialFibrillationStrokeRisk";
import GenevaScore from "customComponents/Forms/Calculators/GenevaScore";
import Nihss from "customComponents/Forms/Calculators/Nihss";
import MeanArterialPressure from "customComponents/Forms/Calculators/MeanArterialPressure";

export default function BtnNewCalculator(props) {
  const { t } = useTranslation();

  const { PatientId = null, className = "", Save } = props;

  const [MenuValue, setMenuValue] = useState(null);
  const [Dialog, setDialog] = useState(null);

  // refs
  const DialogRef = useRef(null);
  const FormRef = useRef(null);

  const ShowForm = (Type) => {
    let FormComponent = null;
    let Title = "";
    if (Type === "ATRIABleedingRiskScore") {
      FormComponent = ATRIABleedingRiskScore;
      Title = t("ATRIA Bleeding Risk Score");
    }
    if (Type === "CHA2DS2VAScAtrialFibrillationStrokeRisk") {
      FormComponent = CHA2DS2VAScAtrialFibrillationStrokeRisk;
      Title = t("CHA2DS2-VASc Score for Atrial Fibrillation Stroke Risk");
    }
    if (Type === "GenevaScore") {
      FormComponent = GenevaScore;
      Title = t("Geneva Score (Revised) for Pulmonary Embolism");
    }
    if (Type === "Nihss") {
      FormComponent = Nihss;
      Title = t("NIHSS");
    }
    if (Type === "MeanArterialPressure") {
      FormComponent = MeanArterialPressure;
      Title = t("Mean arterial pressure (MAP)");
    }

    setDialog(
      <BaseDialog
        ref={DialogRef}
        Close={() => setDialog(null)}
        Title={Title}
        MaxWidth={"lg"}
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
      >
        <FormComponent
          ref={FormRef}
          ObjectName="Calculator"
          PatientId={PatientId}
        />
      </BaseDialog>,
    );
  };

  if (!PatientId) {
    return null;
  } else {
    return (
      <div>
        {Dialog}
        <Button
          color="danger"
          disabled={!PatientId ? true : false}
          className={className}
          size="sm"
          onClick={(event) => setMenuValue(event.currentTarget)}
        >
          <CalculateIcon />
          {t("Calculator")}
        </Button>
        <Menu
          anchorEl={MenuValue}
          open={Boolean(MenuValue)}
          keepMounted
          onClose={() => setMenuValue(null)}
        >
          <MenuItem
            onClick={() => {
              ShowForm("MeanArterialPressure");
              setMenuValue(null);
            }}
          >
            {t("Mean arterial pressure (MAP)")}
          </MenuItem>
          <MenuItem
            onClick={() => {
              ShowForm("ATRIABleedingRiskScore");
              setMenuValue(null);
            }}
          >
            {t("ATRIA Bleeding Risk Score")}
          </MenuItem>
          <MenuItem
            onClick={() => {
              ShowForm("CHA2DS2VAScAtrialFibrillationStrokeRisk");
              setMenuValue(null);
            }}
          >
            {t("CHA2DS2-VASc Score for Atrial Fibrillation Stroke Risk")}
          </MenuItem>
          <MenuItem
            onClick={() => {
              ShowForm("GenevaScore");
              setMenuValue(null);
            }}
          >
            {t("Geneva Score (Revised) for Pulmonary Embolism")}
          </MenuItem>

          <MenuItem
            onClick={() => {
              ShowForm("Nihss");
              setMenuValue(null);
            }}
          >
            {t("NIHSS")}
          </MenuItem>
        </Menu>
      </div>
    );
  }
}
