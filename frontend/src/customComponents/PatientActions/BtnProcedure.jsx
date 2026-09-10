import React, { useState, useRef } from "react";
// translation
import { useTranslation } from "react-i18next";

import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
// default components
import Button from "components/CustomButtons/Button";
import HealingIcon from "@mui/icons-material/Healing";
// custom components
import BaseDialog from "customComponents/BaseDialog";
import SubMenuItem from "customComponents/PatientActions/Components/SubMenuItem";
import PaceMakerOneForm from "customComponents/Forms/PaceMakerOneForm";
import PaceMakerTwoForm from "customComponents/Forms/PaceMakerTwoForm";
import PaceMakerThreeForm from "customComponents/Forms/PaceMakerThreeForm";
import AblationForm from "customComponents/Forms/AblationForm";

export default function BtnProcedure(props) {
  const { t } = useTranslation();

  const [MenuValue, setMenuValue] = useState(null);
  const [ParentMenuOpen, setParentMenuOpen] = useState(false);
  const [Dialog, setDialog] = useState(null);

  const { PatientId = null, StayId = null, className = "" } = props;

  const FormOne = useRef(null);
  const FormTwo = useRef(null);
  const FormThree = useRef(null);
  const DialogRef = useRef(null);

  const ShowForm = (Type) => {
    if (Type === "One") {
      setDialog(
        <BaseDialog
          ref={DialogRef}
          Close={() => setDialog(null)}
          Title={t("PrePacemakerEvaluation")}
          Save={(stopLoading) => {
            if (FormOne.current && FormOne.current.Save) {
              FormOne.current.Save(() => {
                stopLoading && stopLoading();
              });
            } else {
              stopLoading && stopLoading();
            }
          }}
          Print={() => {
            if (FormOne.current && FormOne.current.Print) {
              FormOne.current.Print(() => {
                if (DialogRef.current && DialogRef.current.setState) {
                  DialogRef.current.setState({ PrintLoading: false });
                }
              });
            }
          }}
          ShowPrintAndSave={true}
          ShowPrint={true}
        >
          <PaceMakerOneForm
            ref={FormOne}
            ObjectName="PacemakerTblOne"
            PatientId={PatientId}
            StayId={StayId}
          />
        </BaseDialog>,
      );
    } else if (Type === "Two") {
      setDialog(
        <BaseDialog
          ref={DialogRef}
          Close={() => setDialog(null)}
          Title={t("ConsentPermanentPacemaker")}
          Save={(stopLoading) => {
            if (FormTwo.current && FormTwo.current.Save) {
              FormTwo.current.Save(() => {
                stopLoading && stopLoading();
              });
            } else {
              stopLoading && stopLoading();
            }
          }}
          Print={() => {
            if (FormTwo.current && FormTwo.current.Print) {
              FormTwo.current.Print(() => {
                if (DialogRef.current && DialogRef.current.setState) {
                  DialogRef.current.setState({ PrintLoading: false });
                }
              });
            }
          }}
          ShowPrintAndSave={true}
          ShowPrint={true}
        >
          <PaceMakerTwoForm
            ref={FormTwo}
            ObjectName="PacemakerTblTwo"
            PatientId={PatientId}
            StayId={StayId}
          />
        </BaseDialog>,
      );
    } else if (Type === "Three") {
      setDialog(
        <BaseDialog
          ref={DialogRef}
          Close={() => setDialog(null)}
          Title={t("PacemakerInsertionNote")}
          Save={(stopLoading) => {
            if (FormThree.current && FormThree.current.Save) {
              FormThree.current.Save(() => {
                stopLoading && stopLoading();
              });
            } else {
              stopLoading && stopLoading();
            }
          }}
          Print={() => {
            if (FormThree.current && FormThree.current.Print) {
              FormThree.current.Print(() => {
                if (DialogRef.current && DialogRef.current.setState) {
                  DialogRef.current.setState({ PrintLoading: false });
                }
              });
            }
          }}
          ShowPrintAndSave={true}
          ShowPrint={true}
        >
          <PaceMakerThreeForm
            ref={FormThree}
            ObjectName="PacemakerTblThree"
            PatientId={PatientId}
            StayId={StayId}
          />
        </BaseDialog>,
      );
    } else if (Type === "Ablation") {
      setDialog(
        <BaseDialog
          Close={() => setDialog(null)}
          Title={t("AblationForm")}
          Save={(stopLoading) => {
            if (FormOne.current && FormOne.current.Save) {
              FormOne.current.Save((resData) => {
                if (resData && resData.Success) setDialog(null);
                stopLoading && stopLoading();
              });
            } else {
              stopLoading && stopLoading();
            }
          }}
          Print={() => {
            if (FormOne.current && FormOne.current.Print) {
              FormOne.current.Print();
            }
          }}
          ShowSave={true}
        >
          <AblationForm
            ref={FormOne}
            ObjectName="Ablation"
            PatientId={PatientId}
            StayId={StayId}
          />
        </BaseDialog>,
      );
    }
  };

  if (!PatientId || !StayId) {
    return null;
  } else {
    return (
      <div>
        {Dialog}
        <Button
          color="danger"
          disabled={!PatientId || !StayId ? true : false}
          className={className}
          onClick={(event) => {
            setMenuValue(event.currentTarget);
            setParentMenuOpen(Boolean(event.currentTarget));
          }}
          size="sm"
        >
          <HealingIcon />
          {t("Procedures")}
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
          <SubMenuItem Label={"Pacemaker"} parentMenuOpen={ParentMenuOpen}>
            <MenuItem
              onClick={() => {
                ShowForm("One");
                setMenuValue(null);
              }}
            >
              {t("Pacemaker")} 1
            </MenuItem>
            <MenuItem
              onClick={() => {
                ShowForm("Two");
                setMenuValue(null);
              }}
            >
              {t("Pacemaker")} 2
            </MenuItem>
            <MenuItem
              onClick={() => {
                ShowForm("Three");
                setMenuValue(null);
              }}
            >
              {t("Pacemaker")} 3
            </MenuItem>
          </SubMenuItem>
          <MenuItem
            onClick={() => {
              ShowForm("Ablation");
              setMenuValue(null);
            }}
          >
            {t("Ablation")}
          </MenuItem>
        </Menu>
      </div>
    );
  }
}
