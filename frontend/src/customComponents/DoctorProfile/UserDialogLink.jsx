import React, { useState } from "react";

import { useTranslation } from "react-i18next";
import BaseDialog from "customComponents/BaseDialog";
import UserProfile from "customComponents/DoctorProfile/UserProfile";

export default function UserDialogLink(props) {
  const { t } = useTranslation();
  const { DoctorId = null, UserId = null, children } = props;

  const [DialogData, setDialogData] = useState(null);

  const SetInsertForm = (DoctorId, UserId) => {
    const DialogDatas = (
      <BaseDialog
        Close={() => setDialogData(null)}
        Title={t("Doctor profile")}
        Width="500px"
      >
        <UserProfile DoctorId={DoctorId} UserId={UserId} />
      </BaseDialog>
    );
    setDialogData(DialogDatas);
  };

  return (
    <div>
      {DialogData}
      <div
        style={{
          float: "left",
          display: "inline",
          cursor: "pointer",
          color: "inherit",
          textDecoration: "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "#9c27b0";
          e.currentTarget.style.textDecoration = "underline";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "inherit";
          e.currentTarget.style.textDecoration = "none";
        }}
        onClick={() => (DoctorId || UserId) && SetInsertForm(DoctorId, UserId)}
      >
        {children}
      </div>
    </div>
  );
}
