import React, { useEffect, useState, useRef } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
// default components
import Button from "components/CustomButtons/Button";
import BiotechIcon from "@mui/icons-material/Biotech";
// my components
import BaseDialog from "customComponents/BaseDialog";
import SubMenuItem from "customComponents/PatientActions/Components/SubMenuItem";

// forms
import EchoForm from "customComponents/Forms/EchoForm";
// import CathlabForm from "customComponents/Forms/CathlabForm";
import BloodStrokeForm from "customComponents/Forms/BloodStrokeForm";
import LaboratoryTestForm from "customComponents/Forms/LaboratoryTestForm";
import EcgForm from "customComponents/Forms/EcgForm";
import MonitoringRhythmForm from "customComponents/Forms/NationalRegistry/Rhythm/MonitoringRhythmForm";

// calculator forms
// import ATRIABleedingRiskScore from "customComponents/Forms/Calculators/ATRIABleedingRiskScore";
// import CHA2DS2VAScAtrialFibrillationStrokeRisk from "customComponents/Forms/Calculators/CHA2DS2VAScAtrialFibrillationStrokeRisk";
// import GenevaScore from "customComponents/Forms/Calculators/GenevaScore";
// import Nihss from "customComponents/Forms/Calculators/Nihss";
// import MeanArterialPressure from "customComponents/Forms/Calculators/MeanArterialPressure";

export default function DiagnosisAndExamination(props) {
  const { t } = useTranslation();

  const {
    PatientId = null,
    PatRegNo = null,
    SaveEcho,
    // SaveCathlab,
    SaveEcg,
    SaveBloodStroke,
    SaveLaboratoryTest,
    SaveMonitoringRhythm,
    // SaveCalculator,
    className = "",
  } = props;

  const [MenuValue, setMenuValue] = useState(null);
  const [ParentMenuOpen, setParentMenuOpen] = useState(false);

  const [EchoDialog, setEchoDialog] = useState(null);
  // const [CathDialog, setCathDialog] = useState(null);
  const [BloodStrokeDialog, setBloodStrokeDialog] = useState(null);
  const [LaboratoryTestDialog, setLaboratoryTestDialog] = useState(null);
  // const [CalculatorDialog, setCalculatorDialog] = useState(null);
  const [EcgDialog, setEcgDialog] = useState(null);
  const [MonitoringRhythmDialog, setMonitoringRhythmDialog] = useState(null);

  // dialogs
  let EchoDialogRef = useRef();
  // let CathlabDialogRef = useRef();
  let BloodStrokeDialogRef = useRef();
  let LaboratoryTestDialogRef = useRef();
  // let EcgDialogRef = useRef();

  let EchoFormRef = useRef();
  // let CathlabFormRef = useRef();
  let BloodStrokeFormRef = useRef();
  let LaboratoryTestFormRef = useRef();
  // let CalculatorFormRef = useRef();
  let EcgFormRef = useRef();
  let MonitoringRhythmDialogRef = useRef();
  let MonitoringRhythmFormRef = useRef();

  const menus = [
    {
      name: "echo",
      label: t("ECHO"),
      onClick: () => ShowEchoForm(),
    },
    // {
    //   name: "cathlab",
    //   label: t("Cathlab"),
    //   onClick: () => ShowCathlabForm(),
    // },
    {
      name: "inr",
      label: t("INR"),
      onClick: () => ShowBloodStrokeForm(),
    },
    {
      name: "cholesterol",
      label: t("Cholesterol"),
      onClick: () => {},
    },
    { name: "cbc", label: t("CBC"), onClick: () => {}, isSub: false },
    {
      name: "laboratory_test",
      label: t("Laboratory test"),
      onClick: () => ShowLaboratoryTestForm(),
    },
    {
      name: "tsahilgaan_bichleg",
      label: t("Cardiac rhythm"),
      onClick: () => ShowEcgForm(),
    },
    {
      name: "monitoring_rhythm",
      label: t("Monitoring Rhythm"),
      onClick: () => ShowMonitoringRhythmForm(),
    },
    // {
    //   name: "calculator",
    //   label: "Calculator",
    //   onClick: () => {},
    //   menus: [
    //     {
    //       name: "MeanArterialPressure",
    //       label: "Mean arterial pressure (MAP)",
    //       onClick: () => ShowCalculatorForm("MeanArterialPressure"),
    //     },
    //     {
    //       name: "ATRIABleedingRiskScore",
    //       label: "ATRIA Bleeding Risk Score",
    //       onClick: () => ShowCalculatorForm("ATRIABleedingRiskScore"),
    //     },
    //     {
    //       name: "CHA2DS2VAScAtrialFibrillationStrokeRisk",
    //       label: "CHA2DS2-VASc Score for Atrial Fibrillation Stroke Risk",
    //       onClick: () =>
    //         ShowCalculatorForm("CHA2DS2VAScAtrialFibrillationStrokeRisk"),
    //     },
    //     {
    //       name: "GenevaScore",
    //       label: "Geneva Score (Revised) for Pulmonary Embolism",
    //       onClick: () => ShowCalculatorForm("GenevaScore"),
    //     },
    //     {
    //       name: "Nihss",
    //       label: "NIHSS",
    //       onClick: () => ShowCalculatorForm("Nihss"),
    //     },
    //   ],
    // },
  ];

  useEffect(() => {}, [PatientId]);

  const ShowEchoForm = () => {
    setEchoDialog(
      <BaseDialog
        ref={(ref) => (EchoDialogRef = ref)}
        Close={() => setEchoDialog(null)}
        Title={t("ECHO")}
        Save={(stopLoading) => {
          EchoFormRef.Save &&
            EchoFormRef.Save((Success) => {
              if (Success) {
                SaveEcho && SaveEcho(Success);
                setEchoDialog(null);
              }
              stopLoading && stopLoading();
            });
        }}
        ShowSave={true}
        ShowPrint={true}
        Print={(stopLoading) => {
          EchoFormRef.Print &&
            EchoFormRef.Print(() => {
              stopLoading && stopLoading();
            });
        }}
        Scroll="body"
      >
        <EchoForm
          ref={(ref) => (EchoFormRef = ref)}
          ObjectName="ExaminationEcho"
          PatientId={PatientId}
        />
      </BaseDialog>,
    );
  };

  const ShowEcgForm = () => {
    setEcgDialog(
      <BaseDialog
        ref={(ref) => (EchoDialogRef = ref)}
        Close={() => setEcgDialog(null)}
        Title={t("ECG")}
        Width="700px"
        Height="300px"
        Save={(stopLoading) => {
          EcgFormRef.Save &&
            EcgFormRef.Save((Success) => {
              if (Success) {
                SaveEcg && SaveEcg(Success);
                setEcgDialog(null);
              }
              stopLoading && stopLoading();
            });
        }}
        ShowSave={true}
      >
        <EcgForm
          ref={(ref) => (EcgFormRef = ref)}
          ObjectName="EcgExamination"
          PatientId={PatientId}
        />
      </BaseDialog>,
    );
  };

  const ShowMonitoringRhythmForm = () => {
    setMonitoringRhythmDialog(
      <BaseDialog
        ref={(ref) => (MonitoringRhythmDialogRef = ref)}
        Close={() => setMonitoringRhythmDialog(null)}
        Title={t("Monitoring Rhythm")}
        Width="700px"
        Height="500px"
        Save={(stopLoading) =>
          MonitoringRhythmFormRef.Save &&
          MonitoringRhythmFormRef.Save((Success) => {
            if (Success) {
              SaveMonitoringRhythm && SaveMonitoringRhythm(Success);
              setMonitoringRhythmDialog(null);
            }
            stopLoading && stopLoading();
          })
        }
        ShowSave={true}
        Scroll="body"
      >
        <MonitoringRhythmForm
          ref={(ref) => (MonitoringRhythmFormRef = ref)}
          ObjectName="MonitoringRhythm"
          PatientRegNo={PatRegNo}
        />
      </BaseDialog>,
    );
  };

  const ShowBloodStrokeForm = () => {
    setBloodStrokeDialog(
      <BaseDialog
        ref={(ref) => (BloodStrokeDialogRef = ref)}
        Close={() => setBloodStrokeDialog(null)}
        Title={t("INR")}
        Width="700px"
        Height="400px"
        Save={(stopLoading) =>
          BloodStrokeFormRef.Save &&
          BloodStrokeFormRef.Save((Success) => {
            if (Success) {
              SaveBloodStroke && SaveBloodStroke(Success);
              setBloodStrokeDialog(null);
            }
            stopLoading && stopLoading();
          })
        }
        ShowSave={true}
        Scroll="body"
      >
        <BloodStrokeForm
          ref={(ref) => (BloodStrokeFormRef = ref)}
          ObjectName="BloodStroke"
          PatientId={PatientId}
        />
      </BaseDialog>,
    );
  };

  const ShowLaboratoryTestForm = () => {
    setLaboratoryTestDialog(
      <BaseDialog
        ref={(ref) => (LaboratoryTestDialogRef = ref)}
        Close={() => setLaboratoryTestDialog(null)}
        Title={t("Laboratory test")}
        Save={(stopLoading) =>
          LaboratoryTestFormRef.Save &&
          LaboratoryTestFormRef.Save((Success) => {
            if (Success) {
              SaveLaboratoryTest && SaveLaboratoryTest(Success);
              setLaboratoryTestDialog(null);
            }
            stopLoading && stopLoading();
          })
        }
        ShowSave={true}
      >
        <LaboratoryTestForm
          ref={(ref) => (LaboratoryTestFormRef = ref)}
          ObjectName="LaboratoryTest"
          PatientId={PatientId}
        />
      </BaseDialog>,
    );
  };

  // const ShowCalculatorForm = (Type) => {
  //   let FormComponent = null;
  //   let Title = "";
  //   if (Type === "ATRIABleedingRiskScore") {
  //     FormComponent = ATRIABleedingRiskScore;
  //     Title = "ATRIA Bleeding Risk Score";
  //   }
  //   if (Type === "CHA2DS2VAScAtrialFibrillationStrokeRisk") {
  //     FormComponent = CHA2DS2VAScAtrialFibrillationStrokeRisk;
  //     Title = "CHA2DS2-VASc Score for Atrial Fibrillation Stroke Risk";
  //   }
  //   if (Type === "GenevaScore") {
  //     FormComponent = GenevaScore;
  //     Title = "Geneva Score (Revised) for Pulmonary Embolism";
  //   }
  //   if (Type === "Nihss") {
  //     FormComponent = Nihss;
  //     Title = "Nihss";
  //   }
  //   if (Type === "MeanArterialPressure") {
  //     FormComponent = MeanArterialPressure;
  //     Title = "Mean arterial pressure (MAP)";
  //   }

  //   setCalculatorDialog(
  //     <BaseDialog
  //       Close={() => setCalculatorDialog(null)}
  //       Title={Title}
  //       MaxWidth={"lg"}
  //       Save={() => {
  //         CalculatorFormRef.Save &&
  //           CalculatorFormRef.Save((Success) => {
  //             if (Success) {
  //               SaveCalculator && SaveCalculator(Success);
  //               setCalculatorDialog(null);
  //             }
  //           });
  //       }}
  //       ShowSave={true}
  //     >
  //       <FormComponent
  //         ref={(ref) => (CalculatorFormRef = ref)}
  //         ObjectName="Calculator"
  //         PatientId={PatientId}
  //       />
  //     </BaseDialog>
  //   );
  // };

  return (
    <div>
      {EchoDialog}
      {/* {CathDialog} */}
      {BloodStrokeDialog}
      {LaboratoryTestDialog}
      {/* {CalculatorDialog} */}
      {EcgDialog}
      {MonitoringRhythmDialog}
      <Button
        disabled={!PatientId ? true : false}
        color="success"
        onClick={(event) => {
          setMenuValue(event.currentTarget);
          setParentMenuOpen(Boolean(event.currentTarget));
        }}
        size="sm"
        className={className}
      >
        <BiotechIcon />
        {t("Diagnosis, examination")}
      </Button>
      <Menu
        anchorEl={MenuValue}
        keepMounted
        open={Boolean(MenuValue)}
        onClose={() => setMenuValue(null)}
        style={{ minWidth: "300px" }}
      >
        {Array.isArray(menus) &&
          menus.map((e, index) => {
            if (Array.isArray(e.menus)) {
              return (
                <SubMenuItem
                  key={index}
                  Label={e.label}
                  parentMenuOpen={ParentMenuOpen}
                >
                  {e.menus.map((ev, key) => (
                    <MenuItem
                      key={key}
                      onClick={() => {
                        ev.onClick();
                        setMenuValue(null);
                      }}
                    >
                      {t(ev.label + "")}
                    </MenuItem>
                  ))}
                </SubMenuItem>
              );
            } else {
              return (
                <MenuItem
                  key={index}
                  onClick={() => {
                    e.onClick();
                    setMenuValue(null);
                  }}
                >
                  {t(e.label + "")}
                </MenuItem>
              );
            }
          })}
      </Menu>
    </div>
  );
}
