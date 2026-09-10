import React, { useEffect, useRef, useState } from "react";
import customHistory from "customHistory";
// translation
import { useTranslation } from "react-i18next";
// default components
import Button from "components/CustomButtons/Button";
// custom components
import BaseDialog from "customComponents/BaseDialog";
import CustomTooltip from "customComponents/CustomTooltip";
import TicketForm from "customComponents/Forms/TicketForm";
// helper
import Helper from "helper";

export default function BtnNewTicket(props) {
  const { t } = useTranslation();

  const { PatientId = null, className = "" } = props;

  // const [Alert, setAlert] = useState(null);
  const [Dialog, setDialog] = useState(null);
  const [Check, setCheck] = useState(false);
  const [DisabledText, setDisabledText] = useState("");

  const DialogRef = useRef(null);
  const FormRef = useRef(null);
  // refs

  useEffect(() => {
    const CheckData = async () => {
      await Helper.AdviceHelper.CheckByPatient(PatientId, (resData) => {
        if (resData && resData.Data) {
          setCheck(resData.Data.CheckData);
          setDisabledText(resData.Data.Text);
        } else {
          setCheck(false);
        }
      });
    };

    PatientId && CheckData();
  }, [PatientId]);
  const ShowForm = () => {
    setDialog(
      <BaseDialog
        ref={DialogRef}
        Close={() => setDialog(null)}
        Title="Tickets"
        ShowSave={true}
        Save={(stopLoading) => {
          if (FormRef.current && FormRef.current.Save) {
            FormRef.current.Save((success, data) => {
              stopLoading && stopLoading();
              if (success) {
                const newId = data
                  ? data.id_data ||
                    data.DataId ||
                    (typeof data !== "object" ? data : null)
                  : null;
                if (newId) {
                  customHistory.push(`/admin/MyTicket?DataId=`);
                } else {
                  customHistory.push("/admin/MyTicket");
                }
              }
            });
          } else {
            stopLoading && stopLoading();
          }
        }}
        Width="600px"
        Height="400px"
      >
        <TicketForm ref={FormRef} ObjectName="Advice" PatientId={PatientId} />
      </BaseDialog>,
    );
  };
  return (
    <div>
      {Dialog}
      {/* {Alert} */}
      <CustomTooltip title={DisabledText}>
        <div style={{ display: "inline-block" }}>
          <Button
            color="danger"
            disabled={!PatientId || !Check ? true : false}
            className={className}
            onClick={ShowForm}
            size="sm"
          >
            {t("Ticket")}
          </Button>
        </div>
      </CustomTooltip>
    </div>
  );
}
