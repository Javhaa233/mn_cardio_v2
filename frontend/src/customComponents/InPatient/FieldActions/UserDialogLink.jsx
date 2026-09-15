import React, { useState } from "react";
import Box from "@mui/material/Box";
// @mui/icons-material
import PersonIcon from "@mui/icons-material/Person";

import BaseDialog from "customComponents/BaseDialog";
import UserProfile from "customComponents/DoctorProfile/UserProfile";
import { colors } from "@/theme/colors";

export default function UserDialogLink(props) {
  const { rowdata = {}, FieldName } = props;

  var [Dialog, setDialog] = useState(null);

  const UserId = rowdata[FieldName] ? rowdata[FieldName].Id : null;

  const SetInsertForm = () => {
    const Dialog = (
      <BaseDialog
        Close={() => setDialog(null)}
        Title="Doctor profile"
        Width="600px"
        Height="700px"
      >
        <UserProfile UserId={UserId} />
      </BaseDialog>
    );
    setDialog(Dialog);
  };

  return (
    <div>
      {Dialog}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          cursor: "pointer",
          "&:hover": { color: colors.brand.cyanInk, textDecoration: "underline" },
        }}
        onClick={() => UserId && SetInsertForm()}
      >
        <PersonIcon fontSize="small" style={{ color: colors.brand.cyanInk }} />
        {rowdata[FieldName] ? rowdata[FieldName].UserName : null}
      </Box>
    </div>
  );
}
