import React, { useEffect, useState, useRef } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
// default components
import Button from "components/CustomButtons/Button";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
// my components
import BaseDialog from "customComponents/BaseDialog";
// import CustomTooltip from "customComponents/CustomTooltip";
import SubMenuItem from "customComponents/PatientActions/Components/SubMenuItem";

// forms
// import OrderHospitalizationForm from "customComponents/Forms/OrderHospitalizationForm";
import PatientTransferForm from "customComponents/Forms/PatientTransferForm";
// import PatientSendPageAForm from "customComponents/Forms/PatientSendPageAForm";
// import PatientSendPageBForm from "customComponents/Forms/PatientSendPageBForm";

import Helper from "helper";

export default function TransferAndMonitoring(props) {
  const { t } = useTranslation();

  const {
    PatientId = null,
    // PatRegNo = null,
    SavePatientTransfer,
    // SaveSendPage,
    className = "",
  } = props;

  const [MenuValue, setMenuValue] = useState(null);
  const [ParentMenuOpen, setParentMenuOpen] = useState(false);

  // Team monitoring
  const [DoctorTeams, setDoctorTeams] = useState([]);

  // Personal monitoring
  const [Check, setCheck] = useState(false);

  // Hospitalization
  // const [HospitalizationCheck, setHospitalizationCheck] = useState(false);
  // const [DisabledText, setDisabledText] = useState("");

  // const [HospitalizationDialog, setHospitalizationDialog] = useState(null);
  const [TransferDialog, setTransferDialog] = useState(null);
  // const [SendPageADialog, setSendPageADialog] = useState(null);
  // const [SendPageBDialog, setSendPageBDialog] = useState(null);
  const [Alert, setAlert] = useState(null);

  const Doctor = Helper.AuthHelper.GetLogedDoctorLocal();
  const DoctorId = Doctor ? Doctor.id_data : null;

  // refs
  // let OrderHospitalizationFormRef = useRef();
  let PatientTransferFormRef = useRef();
  // let PatientSendPageAFormRef = useRef();
  // let PatientSendPageBFormRef = useRef();

  // let OrderHospitalizationDialogRef = useRef();
  let PatientTransferDialogRef = useRef();
  // let PatientSendPageADialogRef = useRef();
  // let PatientSendPageBDialogRef = useRef();

  useEffect(() => {
    GetDoctorsTeam();
    CheckPatientMonitoring();
    // CheckHospitalization();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PatientId]);

  // Team monitoring
  const GetDoctorsTeam = async () => {
    if (PatientId) {
      await Helper.DoctorTeamHelper.GetDoctorsTeamsWithoutPatient(
        { DoctorId, PatientId },
        (resData) => resData && setDoctorTeams(resData.Data),
      );
    }
  };

  const AddToTeam = async (TeamId) => {
    let alert = null;
    alert = Helper.BaseCrudHelper.ShowConfirm(
      t("AddTeamConfirm"),
      async () => {
        setAlert(null);
        await Helper.DoctorTeamHelper.SavePatient(
          { patient_id: PatientId, team_id: TeamId },
          (resData) => {
            if (resData) {
              alert = Helper.BaseCrudHelper.ShowAlert(
                resData.Message,
                resData.Success,
                () => {
                  setAlert(null);
                  GetDoctorsTeam();
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

  // Personal monitoring
  const CheckPatientMonitoring = async () => {
    if (PatientId) {
      await Helper.PatientMonitoringHelper.CheckPatientMonitoring(
        PatientId,
        (resData) =>
          resData &&
          resData.Success &&
          resData.Data &&
          setCheck(resData.Data.Check),
      );
    }
  };

  const AddToPersonal = async () => {
    let alert = null;
    alert = Helper.BaseCrudHelper.ShowConfirm(
      t("AddToPersonalConfirm"),
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
                  CheckPatientMonitoring();
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

  // Hospitalization
  // const CheckHospitalization = async () => {
  //   if (PatientId) {
  //     await Helper.OrderHospitalizationHelper.CheckPatient(
  //       PatientId,
  //       (resData) => {
  //         if (resData && resData.Success && resData.Data) {
  //           setHospitalizationCheck(resData.Data.Check);
  //           setDisabledText(resData.Data.Text);
  //         } else {
  //           setHospitalizationCheck(false);
  //           setDisabledText("");
  //         }
  //       }
  //     );
  //   } else {
  //     setHospitalizationCheck(false);
  //   }
  // };

  // const ShowHospitalizationForm = () => {
  //   setHospitalizationDialog(
  //     <BaseDialog
  //       ref={(ref) => (OrderHospitalizationDialogRef = ref)}
  //       Close={() => setHospitalizationDialog(null)}
  //       Title="To Hospitalize"
  //       Width="800px"
  //       Save={() => {
  //         OrderHospitalizationFormRef.Save &&
  //           OrderHospitalizationFormRef.Save((success) => {
  //             OrderHospitalizationDialogRef.setState({ Loading: false });
  //             success && setHospitalizationDialog(null);
  //           });
  //       }}
  //       ShowSave={true}
  //     >
  //       <OrderHospitalizationForm
  //         ref={(ref) => (OrderHospitalizationFormRef = ref)}
  //         ObjectName="OrderHospitalization"
  //         PatientId={PatientId}
  //       />
  //     </BaseDialog>
  //   );
  // };

  const ShowTransferForm = () => {
    setTransferDialog(
      <BaseDialog
        ref={(ref) => (PatientTransferDialogRef = ref)}
        Close={() => setTransferDialog(null)}
        Title={t("Transfer")}
        Width="700px"
        Save={(stopLoading) => {
          PatientTransferFormRef.Save &&
            PatientTransferFormRef.Save((resData) => {
              if (resData && resData.Success) {
                SavePatientTransfer && SavePatientTransfer(resData.Success);
                setTransferDialog(null);
              }
              stopLoading && stopLoading();
            });
        }}
        ShowSave={true}
        Scroll="body"
      >
        <PatientTransferForm
          ref={(ref) => (PatientTransferFormRef = ref)}
          ObjectName="PatientTransfer"
          PatientId={PatientId}
        />
      </BaseDialog>,
    );
  };

  // Send page A-B
  // const ShowSendPageAForm = () => {
  //   setSendPageADialog(
  //     <BaseDialog
  //       ref={(ref) => (PatientSendPageADialogRef = ref)}
  //       Close={() => setSendPageADialog(null)}
  //       Title="АМ-13А"
  //       Width="700px"
  //       Save={() => {
  //         PatientSendPageAFormRef.Save &&
  //           PatientSendPageAFormRef.Save((resData) => {
  //             if (resData && resData.Success) {
  //               SaveSendPage && SaveSendPage(resData.Success);
  //               setSendPageADialog(null);
  //             }
  //             PatientSendPageADialogRef.setState({ Loading: false });
  //           });
  //       }}
  //       ShowSave={true}
  //       Scroll="body"
  //     >
  //       <PatientSendPageAForm
  //         ref={(ref) => (PatientSendPageAFormRef = ref)}
  //         ObjectName="PatientSendPage"
  //         PatientId={PatientId}
  //         PatRegNo={PatRegNo}
  //       />
  //     </BaseDialog>
  //   );
  // };

  // const ShowSendPageBForm = () => {
  //   setSendPageBDialog(
  //     <BaseDialog
  //       ref={(ref) => (PatientSendPageBDialogRef = ref)}
  //       Close={() => setSendPageBDialog(null)}
  //       Title="АМ-13Б"
  //       Width="700px"
  //       Save={() => {
  //         PatientSendPageBFormRef.Save &&
  //           PatientSendPageBFormRef.Save((resData) => {
  //             if (resData && resData.Success) {
  //               SaveSendPage && SaveSendPage(resData.Success);
  //               setSendPageBDialog(null);
  //             }
  //             PatientSendPageBDialogRef.setState({ Loading: false });
  //           });
  //       }}
  //       ShowSave={true}
  //       Scroll="body"
  //     >
  //       <PatientSendPageBForm
  //         ref={(ref) => (PatientSendPageBFormRef = ref)}
  //         ObjectName="PatientSendPage"
  //         PatientId={PatientId}
  //         PatRegNo={PatRegNo}
  //       />
  //     </BaseDialog>
  //   );
  // };

  return (
    <div>
      {Alert}
      {/* {HospitalizationDialog} */}
      {TransferDialog}
      {/* {SendPageADialog}
      {SendPageBDialog} */}
      <Button
        disabled={!PatientId ? true : false}
        color="primary"
        onClick={(event) => {
          setMenuValue(event.currentTarget);
          setParentMenuOpen(Boolean(event.currentTarget));
        }}
        size="sm"
        className={className}
      >
        <SwapHorizIcon />
        {t("Transfer, Monitoring")}
      </Button>
      <Menu
        anchorEl={MenuValue}
        keepMounted
        open={Boolean(MenuValue)}
        onClose={() => setMenuValue(null)}
        style={{ minWidth: "300px" }}
      >
        <SubMenuItem
          Label={t("TeamMonitoring")}
          parentMenuOpen={ParentMenuOpen}
        >
          {Array.isArray(DoctorTeams) &&
            DoctorTeams.map((Team, index) => {
              return (
                <MenuItem
                  key={index}
                  disabled={Team.IsActive === true ? false : true}
                  onClick={() => {
                    AddToTeam(Team.id_data);
                    setMenuValue(null);
                  }}
                >
                  {Team.name}
                </MenuItem>
              );
            })}
        </SubMenuItem>
        <MenuItem
          disabled={!PatientId || !Check ? true : false}
          onClick={() => {
            AddToPersonal();
            setMenuValue(null);
          }}
        >
          {t("Take under monitoring")}
        </MenuItem>
        {/* <div>
          <CustomTooltip title={DisabledText}>
            <div style={{ display: "inline-block" }}>
              <MenuItem
                disabled={!PatientId || !HospitalizationCheck ? true : false}
                onClick={() => {
                  ShowHospitalizationForm();
                  setMenuValue(null);
                }}
              >
                {t("To Hospitalize")}
              </MenuItem>
            </div>
          </CustomTooltip>
        </div> */}
        <MenuItem
          disabled={!PatientId ? true : false}
          onClick={() => {
            ShowTransferForm();
            setMenuValue(null);
          }}
        >
          {t("Transfer")}
        </MenuItem>
        {/* Send page */}
        {/* <SubMenuItem Label={"Send page"} parentMenuOpen={ParentMenuOpen}>
          <MenuItem
            onClick={() => {
              ShowSendPageAForm();
              setMenuValue(null);
            }}
          >
            {t("АМ-13A")}
          </MenuItem>
          <MenuItem
            onClick={() => {
              ShowSendPageBForm();
              setMenuValue(null);
            }}
          >
            {t("АМ-13Б")}
          </MenuItem>
        </SubMenuItem> */}
      </Menu>
    </div>
  );
}
