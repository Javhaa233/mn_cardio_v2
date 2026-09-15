import React, { useRef, useState } from "react";
// translation
import { useTranslation } from "react-i18next";

import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
// default components
import Button from "components/CustomButtons/Button";
import MenuBookIcon from "@mui/icons-material/MenuBook";
// custom components
import SubMenuItem from "customComponents/PatientActions/Components/SubMenuItem";
import BaseDialog from "customComponents/BaseDialog";

// forms
// import HfAmbulanceForm from "customComponents/Forms/NationalRegistry/HeartFailure/HfAmbulanceForm";
import HfHospitalizationForm from "customComponents/Forms/NationalRegistry/HeartFailure/HfHospitalizationForm";
import VascularDiseaseForm from "customComponents/Forms/NationalRegistry/VascularDisease/VascularDiseaseForm";
import ValveDiseasesForm from "customComponents/Forms/NationalRegistry/ValveDisease/ValveDiseasesForm";
import ValveDiseasesEndoForm from "customComponents/Forms/NationalRegistry/ValveDisease/ValveDiseasesEndoForm";

// Turulhiin gajig
import NeeltteiForm from "customComponents/Forms/NationalRegistry/CongenitalMalformations/NeeltteiForm";
import SudasForm from "customComponents/Forms/NationalRegistry/CongenitalMalformations/SudasForm";
import KatetrForm from "customComponents/Forms/NationalRegistry/CongenitalMalformations/KatetrForm";

// Hem aldagdal
import AtrialRhythmForm from "customComponents/Forms/NationalRegistry/Rhythm/AtrialRhythmForm";
import AtrialRhythmNewForm from "customComponents/Forms/NationalRegistry/Rhythm/AtrialRhythmNewForm";
import PaceMakerRhythmForm from "customComponents/Forms/NationalRegistry/Rhythm/PaceMakerRhythmForm";
import ICDRhythmForm from "customComponents/Forms/NationalRegistry/Rhythm/ICDRhythmForm";
import MonitoringRhythmForm from "customComponents/Forms/NationalRegistry/Rhythm/MonitoringRhythmForm";

// import HavhlagaEmgeg from "customComponents/PatientShow/NationalRegistry/HavhlagaEmgeg/form";
import TurulhiinGajig from "customComponents/NationalRegistry/New/TurulhiinGajig/form";
import Pm from "customComponents/NationalRegistry/New/Pm/form";
import Icd from "customComponents/NationalRegistry/New/Icd/form";
import { setVisible, setEditDataAndModify } from "store/reducers/system/form";

import { useDispatch } from "react-redux";

export default function NationalRegistry(props) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const {
    PatientId = null,
    PatientRegNo = null,
    SaveHfHospitalization,
    SaveValveDiseases,
    SaveValveDiseasesEndo,
    SaveCongenitalMalformations,
    SaveAtrialRhythm,
    SaveAtrialRhythmNew,
    SavePaceMakerRhythm,
    SaveMonitoringRhythm,
    SaveICDRhythm,
    className = "",
  } = props;

  const [MenuValue, setMenuValue] = useState(null);
  const [ParentMenuOpen, setParentMenuOpen] = useState(false);

  // const [HfAmbulanceDialog, setHfAmbulanceDialog] = useState(null);
  const [HfHospitalizationDialog, setHfHospitalizationDialog] = useState(null);
  const [VascularDiseaseDialog, setVascularDiseaseDialog] = useState(null);
  const [ValveDiseasesDialog, setValveDiseasesDialog] = useState(null);
  const [ValveDiseasesEndoDialog, setValveDiseasesEndoDialog] = useState(null);
  const [CongenitalMalformationsDialog, setCongenitalMalformationsDialog] =
    useState(null);

  const [AtrialRhythmDialog, setAtrialRhythmDialog] = useState(null);
  const [AtrialRhythmNewDialog, setAtrialRhythmNewDialog] = useState(null);
  const [PaceMakerRhythmDialog, setPaceMakerRhythmDialog] = useState(null);
  const [ICDRhythmDialog, setICDRhythmDialog] = useState(null);
  const [MonitoringRhythmDialog, setMonitoringRhythmDialog] = useState(null);

  // dialogs ref
  // var HfAmbulanceDialogRef = useRef();
  let HospitalizationDialogRef = useRef();
  let VascularDiseaseDialogRef = useRef();
  let ValveDiseasesDialogRef = useRef();
  let ValveDiseasesEndoDialogRef = useRef();
  //
  let CongenitalMalformationsDialogRef = useRef();
  let AtrialRhythmDialogRef = useRef();
  let AtrialRhythmNewDialogRef = useRef();
  let PaceMakerRhythmDialogRef = useRef();
  let ICDRhythmDialogRef = useRef();
  let MonitoringRhythmDialogRef = useRef();

  // forms ref
  let HfHospitalizationFormRef = useRef();
  // let HfAmbulanceFormRef = useRef();
  let VascularDiseaseFormRef = useRef();
  let ValveDiseasesFormRef = useRef();
  let ValveDiseasesEndoFormRef = useRef();

  let NeeltteiFormRef = useRef();
  let SudasFormRef = useRef();
  let KatetrFormRef = useRef();

  let AtrialRhythmFormRef = useRef();
  let AtrialRhythmNewFormRef = useRef();
  let PaceMakerRhythmFormRef = useRef();
  let ICDRhythmFormRef = useRef();
  let MonitoringRhythmFormRef = useRef();

  // const ShowAmbulance = () => {
  //   setHfAmbulanceDialog(
  //     <BaseDialog
  //       ref={(ref) => (HfAmbulanceDialogRef = ref)}
  //       Close={() => setHfAmbulanceDialog(null)}
  //       Title="Heart Failure (Ambulance)"
  //       Confirm={() => {
  //         HfAmbulanceFormRef.Confirm &&
  //           HfAmbulanceFormRef.Confirm((Success) => {
  //             if (Success) {
  //               setHfAmbulanceDialog(null);
  //             }
  //             HfAmbulanceDialogRef.setState({ ConfirmLoading: false });
  //           });
  //       }}
  //       ShowSave={false}
  //       ShowPrint={false}
  //       ShowConfirm={true}
  //     >
  //       <HfAmbulanceForm
  //         ref={(ref) => (HfAmbulanceFormRef = ref)}
  //         ObjectName="HfAmbulance"
  //         PatientId={PatientId}
  //         PatientRegNo={PatientRegNo}
  //       />
  //     </BaseDialog>
  //   );
  // };

  const ShowHospitilzation = () => {
    setHfHospitalizationDialog(
      <BaseDialog
        ref={(ref) => (HospitalizationDialogRef.current = ref)}
        Close={() => setHfHospitalizationDialog(null)}
        Title={t("Heart Failure (Hospitalization)")}
        Save={(setLoading) =>
          HfHospitalizationFormRef.current?.Save &&
          HfHospitalizationFormRef.current.Save((Success) => {
            if (Success) {
              SaveHfHospitalization && SaveHfHospitalization();
              setHfHospitalizationDialog(null);
            } else {
              setLoading && setLoading(false);
            }
          })
        }
        Confirm={(setLoading) =>
          HfHospitalizationFormRef.current?.Confirm &&
          HfHospitalizationFormRef.current.Confirm((Success) => {
            if (Success) {
              SaveHfHospitalization && SaveHfHospitalization();
              setHfHospitalizationDialog(null);
            }
            setLoading && setLoading(false);
          })
        }
        ShowSave={true}
        ShowConfirm={true}
      >
        <HfHospitalizationForm
          ref={(ref) => (HfHospitalizationFormRef.current = ref)}
          ObjectName="HfHospitalization"
          PatientId={PatientId}
          PatientRegNo={PatientRegNo}
        />
      </BaseDialog>,
    );
  };

  const ShowVascularDesease = () => {
    setVascularDiseaseDialog(
      <BaseDialog
        ref={(ref) => (VascularDiseaseDialogRef.current = ref)}
        Close={() => setVascularDiseaseDialog(null)}
        Title={t("Vascular disease")}
        Confirm={(setLoading) => {
          VascularDiseaseFormRef.current?.Confirm &&
            VascularDiseaseFormRef.current.Confirm((Success) => {
              Success && setVascularDiseaseDialog(null);
              setLoading && setLoading(false);
            });
        }}
        ShowSave={false}
        ShowConfirm={true}
      >
        <VascularDiseaseForm
          ref={(ref) => (VascularDiseaseFormRef.current = ref)}
          ObjectName="VascularDisease"
          PatientId={PatientId}
          PatientRegNo={PatientRegNo}
        />
      </BaseDialog>,
    );
  };

  const ShowValveDeseases = () => {
    setValveDiseasesDialog(
      <BaseDialog
        ref={(ref) => (ValveDiseasesDialogRef.current = ref)}
        Close={() => setValveDiseasesDialog(null)}
        Title={t("Valve disease")}
        Save={(setLoading) =>
          ValveDiseasesFormRef.current?.Save &&
          ValveDiseasesFormRef.current.Save((Success) => {
            if (Success) {
              SaveValveDiseases && SaveValveDiseases();
              setValveDiseasesDialog(null);
            }
            setLoading && setLoading(false);
          })
        }
        Confirm={(setLoading) =>
          ValveDiseasesFormRef.current?.Confirm &&
          ValveDiseasesFormRef.current.Confirm((Success) => {
            if (Success) {
              SaveValveDiseases && SaveValveDiseases();
              setValveDiseasesDialog(null);
            }
            setLoading && setLoading(false);
          })
        }
        ShowSave={true}
        ShowConfirm={true}
      >
        <ValveDiseasesForm
          ref={(ref) => (ValveDiseasesFormRef.current = ref)}
          ObjectName="ValveDiseases"
          PatientId={PatientId}
          PatientRegNo={PatientRegNo}
        />
      </BaseDialog>,
    );
  };

  const ShowValveDeseasesEndo = () => {
    setValveDiseasesEndoDialog(
      <BaseDialog
        ref={(ref) => (ValveDiseasesEndoDialogRef.current = ref)}
        Close={() => setValveDiseasesEndoDialog(null)}
        Title={t("Valve disease (Endocarditis)")}
        Save={(setLoading) =>
          ValveDiseasesEndoFormRef.current?.Save &&
          ValveDiseasesEndoFormRef.current.Save((Success) => {
            if (Success) {
              SaveValveDiseasesEndo && SaveValveDiseasesEndo();
              setValveDiseasesEndoDialog(null);
            }
            setLoading && setLoading(false);
          })
        }
        Confirm={(setLoading) =>
          ValveDiseasesEndoFormRef.current?.Confirm &&
          ValveDiseasesEndoFormRef.current.Confirm((Success) => {
            if (Success) {
              SaveValveDiseasesEndo && SaveValveDiseasesEndo();
              setValveDiseasesEndoDialog(null);
            }
            setLoading && setLoading(false);
          })
        }
        ShowSave={true}
        ShowConfirm={true}
      >
        <ValveDiseasesEndoForm
          ref={(ref) => (ValveDiseasesEndoFormRef.current = ref)}
          ObjectName="ValveDiseasesEndo"
          PatientId={PatientId}
          PatientRegNo={PatientRegNo}
        />
      </BaseDialog>,
    );
  };

  const ShowCM = (category) => {
    let tempDialog = null;
    let tempTitle = "Congenital malformation";

    if (category === "neelttei") {
      tempDialog = (
        <BaseDialog
          ref={(ref) => (CongenitalMalformationsDialogRef.current = ref)}
          Close={() => setCongenitalMalformationsDialog(null)}
          Title={t("Open heart surgery")}
          Save={(setLoading) => {
            NeeltteiFormRef &&
              NeeltteiFormRef.current?.Save &&
              NeeltteiFormRef.current?.Save((Success) => {
                if (Success) {
                  SaveCongenitalMalformations && SaveCongenitalMalformations();
                  setCongenitalMalformationsDialog(null);
                }
                setLoading && setLoading(false);
              });
          }}
          Confirm={(setLoading) => {
            NeeltteiFormRef &&
              NeeltteiFormRef.current?.Confirm &&
              NeeltteiFormRef.current?.Confirm((Success) => {
                if (Success) {
                  SaveCongenitalMalformations && SaveCongenitalMalformations();
                  setCongenitalMalformationsDialog(null);
                }
                setLoading && setLoading(false);
              });
          }}
          ShowSave={true}
          ShowConfirm={true}
        >
          <NeeltteiForm
            ref={(ref) => (NeeltteiFormRef.current = ref)}
            ObjectName="CongenitalMalformations"
            PatientRegNo={PatientRegNo}
            Category={"neelttei"}
          />
        </BaseDialog>
      );
    } else if (category === "sudsan_dotuurh") {
      tempDialog = (
        <BaseDialog
          ref={(ref) => (CongenitalMalformationsDialogRef.current = ref)}
          Close={() => setCongenitalMalformationsDialog(null)}
          Title={t("Catheter-based surgery")}
          Save={(setLoading) => {
            SudasFormRef &&
              SudasFormRef.current?.Save &&
              SudasFormRef.current?.Save((Success) => {
                if (Success) {
                  SaveCongenitalMalformations && SaveCongenitalMalformations();
                  setCongenitalMalformationsDialog(null);
                }
                setLoading && setLoading(false);
              });
          }}
          Confirm={(setLoading) => {
            SudasFormRef &&
              SudasFormRef.current?.Confirm &&
              SudasFormRef.current?.Confirm((Success) => {
                if (Success) {
                  SaveCongenitalMalformations && SaveCongenitalMalformations();
                  setCongenitalMalformationsDialog(null);
                }
                setLoading && setLoading(false);
              });
          }}
          ShowSave={true}
          ShowConfirm={true}
        >
          <SudasForm
            ref={(ref) => (SudasFormRef.current = ref)}
            ObjectName="CongenitalMalformations"
            PatientId={PatientId}
            PatientRegNo={PatientRegNo}
            Category={"sudsan_dotuurh"}
          />
        </BaseDialog>
      );
    } else if (category === "katetr") {
      tempDialog = (
        <BaseDialog
          ref={(ref) => (CongenitalMalformationsDialogRef.current = ref)}
          Close={() => setCongenitalMalformationsDialog(null)}
          Title={t("Catheter angiography diagnosis")}
          Save={(setLoading) => {
            KatetrFormRef &&
              KatetrFormRef.current?.Save &&
              KatetrFormRef.current?.Save((Success) => {
                if (Success) {
                  SaveCongenitalMalformations && SaveCongenitalMalformations();
                  setCongenitalMalformationsDialog(null);
                }
                setLoading && setLoading(false);
              });
          }}
          Confirm={(setLoading) => {
            KatetrFormRef &&
              KatetrFormRef.current?.Confirm &&
              KatetrFormRef.current?.Confirm((Success) => {
                if (Success) {
                  SaveCongenitalMalformations && SaveCongenitalMalformations();
                  setCongenitalMalformationsDialog(null);
                }
                setLoading && setLoading(false);
              });
          }}
          ShowSave={true}
          ShowConfirm={true}
        >
          <KatetrForm
            ref={(ref) => (KatetrFormRef.current = ref)}
            ObjectName="CongenitalMalformations"
            PatientId={PatientId}
            PatientRegNo={PatientRegNo}
            Category={"katetr"}
          />
        </BaseDialog>
      );
    } else {
      setCongenitalMalformationsDialog(null);
    }

    setCongenitalMalformationsDialog(tempDialog);
  };

  const ShowAtrialRhythm = () => {
    setAtrialRhythmDialog(
      <BaseDialog
        ref={(ref) => (AtrialRhythmDialogRef.current = ref)}
        Close={() => setAtrialRhythmDialog(null)}
        Title={t("Atrial fibrillation")}
        Save={(setLoading) => {
          AtrialRhythmFormRef.current?.Save &&
            AtrialRhythmFormRef.current?.Save((Success) => {
              if (Success) {
                SaveAtrialRhythm && SaveAtrialRhythm();
                setAtrialRhythmDialog(null);
              }
              setLoading && setLoading(false);
            });
        }}
        Confirm={(setLoading) => {
          AtrialRhythmFormRef.current?.Confirm &&
            AtrialRhythmFormRef.current?.Confirm((Success) => {
              if (Success) {
                SaveAtrialRhythm && SaveAtrialRhythm();
                setAtrialRhythmDialog(null);
              }
              setLoading && setLoading(false);
            });
        }}
        ShowSave={true}
        ShowConfirm={true}
      >
        <AtrialRhythmForm
          ref={(ref) => (AtrialRhythmFormRef.current = ref)}
          ObjectName="AtrialRhythm"
          PatientId={PatientId}
          PatientRegNo={PatientRegNo}
        />
      </BaseDialog>,
    );
  };

  const ShowAtrialRhythmNew = () => {
    setAtrialRhythmNewDialog(
      <BaseDialog
        ref={(ref) => (AtrialRhythmNewDialogRef.current = ref)}
        Close={() => setAtrialRhythmNewDialog(null)}
        Title={t("Atrial fibrillation (New)")}
        Save={(setLoading) => {
          AtrialRhythmNewFormRef.current?.Save &&
            AtrialRhythmNewFormRef.current?.Save((Success) => {
              if (Success) {
                SaveAtrialRhythmNew && SaveAtrialRhythmNew();
                setAtrialRhythmNewDialog(null);
              }
              setLoading && setLoading(false);
            });
        }}
        Confirm={(setLoading) => {
          AtrialRhythmNewFormRef.current?.Confirm &&
            AtrialRhythmNewFormRef.current?.Confirm((Success) => {
              if (Success) {
                SaveAtrialRhythmNew && SaveAtrialRhythmNew();
                setAtrialRhythmNewDialog(null);
              }
              setLoading && setLoading(false);
            });
        }}
        ShowSave={true}
        ShowConfirm={true}
      >
        <AtrialRhythmNewForm
          ref={(ref) => (AtrialRhythmNewFormRef.current = ref)}
          ObjectName="AtrialRhythmNew"
          PatientId={PatientId}
          PatientRegNo={PatientRegNo}
        />
      </BaseDialog>,
    );
  };

  const ShowPaceMakerRhythm = () => {
    setPaceMakerRhythmDialog(
      <BaseDialog
        ref={(ref) => (PaceMakerRhythmDialogRef.current = ref)}
        Close={() => setPaceMakerRhythmDialog(null)}
        Title={t("Pacemaker")}
        Save={(setLoading) => {
          PaceMakerRhythmFormRef.current?.Save &&
            PaceMakerRhythmFormRef.current?.Save((Success) => {
              if (Success) {
                SavePaceMakerRhythm && SavePaceMakerRhythm();
                setPaceMakerRhythmDialog(null);
              } else {
                setLoading && setLoading(false);
              }
            });
        }}
        Confirm={(setLoading) => {
          PaceMakerRhythmFormRef.current?.Confirm &&
            PaceMakerRhythmFormRef.current?.Confirm((Success) => {
              if (Success) {
                SavePaceMakerRhythm && SavePaceMakerRhythm();
                setPaceMakerRhythmDialog(null);
              }
              setLoading && setLoading(false);
            });
        }}
        ShowSave={true}
        ShowConfirm={true}
      >
        <PaceMakerRhythmForm
          ref={(ref) => (PaceMakerRhythmFormRef.current = ref)}
          ObjectName="PaceMakerRhythm"
          PatientId={PatientId}
          PatientRegNo={PatientRegNo}
        />
      </BaseDialog>,
    );
  };

  const ShowICDRhythm = () => {
    setICDRhythmDialog(
      <BaseDialog
        ref={(ref) => (ICDRhythmDialogRef.current = ref)}
        Close={() => setICDRhythmDialog(null)}
        Title="ICD"
        Save={(setLoading) => {
          ICDRhythmFormRef.current?.Save &&
            ICDRhythmFormRef.current?.Save((Success) => {
              if (Success) {
                SaveICDRhythm && SaveICDRhythm();
                setICDRhythmDialog(null);
              }
              setLoading && setLoading(false);
            });
        }}
        Confirm={(setLoading) => {
          ICDRhythmFormRef.current?.Confirm &&
            ICDRhythmFormRef.current?.Confirm((Success) => {
              if (Success) {
                SaveICDRhythm && SaveICDRhythm();
                setICDRhythmDialog(null);
              }
              setLoading && setLoading(false);
            });
        }}
        ShowSave={true}
        ShowConfirm={true}
      >
        <ICDRhythmForm
          ref={(ref) => (ICDRhythmFormRef.current = ref)}
          ObjectName="ICDRhythm"
          PatientId={PatientId}
          PatientRegNo={PatientRegNo}
        />
      </BaseDialog>,
    );
  };

  const ShowMonitoringRhythm = () => {
    setMonitoringRhythmDialog(
      <BaseDialog
        ref={(ref) => (MonitoringRhythmDialogRef.current = ref)}
        Close={() => setMonitoringRhythmDialog(null)}
        Title={t("Rhythm monitoring")}
        Save={(setLoading) => {
          MonitoringRhythmFormRef.current?.Save &&
            MonitoringRhythmFormRef.current?.Save((Success) => {
              if (Success) {
                SaveMonitoringRhythm && SaveMonitoringRhythm();
                setMonitoringRhythmDialog(null);
              } else {
                setLoading && setLoading(false);
              }
            });
        }}
        Confirm={(setLoading) => {
          MonitoringRhythmFormRef.current?.Confirm &&
            MonitoringRhythmFormRef.current?.Confirm((Success) => {
              if (Success) {
                SaveMonitoringRhythm && SaveMonitoringRhythm();
                setMonitoringRhythmDialog(null);
              }
              setLoading && setLoading(false);
            });
        }}
        ShowSave={true}
        ShowConfirm={true}
      >
        <MonitoringRhythmForm
          ref={(ref) => (MonitoringRhythmFormRef.current = ref)}
          ObjectName="MonitoringRhythm"
          PatientId={PatientId}
          PatientRegNo={PatientRegNo}
        />
      </BaseDialog>,
    );
  };

  return (
    <div>
      {/* Zurhnii dutagdal */}
      {/* {HfAmbulanceDialog} */}
      {HfHospitalizationDialog}

      {/* Sudasnii emgeg */}
      {VascularDiseaseDialog}
      {/* Havhlagiin emgeg */}
      {ValveDiseasesDialog}
      {ValveDiseasesEndoDialog}

      {/* Төрөлхийн гажиг */}
      {CongenitalMalformationsDialog}

      {/* Hem aldagdal */}
      {AtrialRhythmDialog}
      {AtrialRhythmNewDialog}
      {PaceMakerRhythmDialog}
      {ICDRhythmDialog}
      {MonitoringRhythmDialog}
      <Pm formName="Pm" />
      <Icd formName="Icd" />
      <TurulhiinGajig formName="TurulhiinGajig" />

      {/* Main Button */}
      {/* Opens a menu: neutral. "rose" maps to the destructive (red) rank. */}
      <Button
        color="info"
        disabled={!PatientId ? true : false}
        size="sm"
        className={className}
        onClick={(event) => {
          setMenuValue(event.currentTarget);
          setParentMenuOpen(Boolean(event.currentTarget));
        }}
      >
        <MenuBookIcon />
        {t("National registry")}
      </Button>
      <Menu
        anchorEl={MenuValue}
        open={Boolean(MenuValue)}
        keepMounted
        onClose={() => {
          setMenuValue(null);
          setParentMenuOpen(false);
        }}
      >
        <SubMenuItem Label={t("Heart failure")} parentMenuOpen={ParentMenuOpen}>
          {/* <MenuItem
            onClick={() => {
              ShowAmbulance();
              setMenuValue(null);
            }}
          >
            {t("Амбулаторийн үзлэг")}
          </MenuItem> */}
          <MenuItem
            onClick={() => {
              ShowHospitilzation();
              setMenuValue(null);
            }}
          >
            {t("Hospitalization")}
          </MenuItem>
        </SubMenuItem>
        <MenuItem
          onClick={() => {
            ShowVascularDesease();
            setMenuValue(null);
          }}
        >
          {t("Vascular disease")}
        </MenuItem>

        <SubMenuItem
          Label={t("Congenital malformation")}
          parentMenuOpen={ParentMenuOpen}
        >
          {/* <MenuItem
            onClick={() => {
              dispatch(
                setEditDataAndModify({
                  formName: "TurulhiinGajig",
                  data: { patientRegister: PatientRegNo },
                })
              );
              dispatch(
                setVisible({ formName: "TurulhiinGajig", visible: true })
              );
            }}
          >
            {t("Congenital malformation")}
          </MenuItem> */}
          <MenuItem
            onClick={() => {
              ShowCM("neelttei");
              setMenuValue(null);
            }}
          >
            {t("Open heart surgery")}
          </MenuItem>
          <MenuItem
            onClick={() => {
              ShowCM("sudsan_dotuurh");
              setMenuValue(null);
            }}
          >
            {t("Catheter-based surgery")}
          </MenuItem>
          <MenuItem
            onClick={() => {
              ShowCM("katetr");
              setMenuValue(null);
            }}
          >
            {t("Catheter angiography diagnosis")}
          </MenuItem>
        </SubMenuItem>
        {/* <MenuItem
        >
          {t("")}
        </MenuItem> */}
        <SubMenuItem Label={t("Valve disease")} parentMenuOpen={ParentMenuOpen}>
          <MenuItem
            onClick={() => {
              ShowValveDeseases();
              setMenuValue(null);
            }}
          >
            {t("Valve disease")}
          </MenuItem>
          <MenuItem
            onClick={() => {
              ShowValveDeseasesEndo();
              setMenuValue(null);
            }}
          >
            {t("Endocarditis")}
          </MenuItem>
        </SubMenuItem>
        <SubMenuItem
          Label={t("Cardiac rhythm")}
          parentMenuOpen={ParentMenuOpen}
        >
          {/* <MenuItem
            onClick={() => {
              ShowAtrialRhythm();
              setMenuValue(null);
            }}
          >
            {t("Atrial fibrillation")}
          </MenuItem> */}
          <MenuItem
            onClick={() => {
              ShowAtrialRhythmNew();
              setMenuValue(null);
            }}
          >
            {t("Atrial fibrillation (New)")}
          </MenuItem>

          <MenuItem
            onClick={() => {
              ShowPaceMakerRhythm();
              setMenuValue(null);
            }}
          >
            {t("Pacemaker")}
          </MenuItem>
          <MenuItem
            onClick={() => {
              ShowICDRhythm();
              setMenuValue(null);
            }}
          >
            {t("ICD")}
          </MenuItem>
          <MenuItem
            onClick={() => {
              ShowMonitoringRhythm();
              setMenuValue(null);
            }}
          >
            {t("Monitoring")}
          </MenuItem>
        </SubMenuItem>
      </Menu>
    </div>
  );
}
