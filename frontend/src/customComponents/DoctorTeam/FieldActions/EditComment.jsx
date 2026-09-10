import React, { useState, useRef } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
// @mui/icons-material
import EditIcon from "@mui/icons-material/Edit";
// custom components
import BaseDialog from "customComponents/BaseDialog";
import EditCommentForm from "customComponents/DoctorTeam/FieldActions/EditCommentForm";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/tokens";

export default function EditComment(props) {
  const { t } = useTranslation();

  const { rowdata, Title = null, Field, Save } = props;

  const Text = rowdata && Field ? rowdata[Field] : "";

  const [Dialog, setDialog] = useState(null);

  // refs
  const EditBodyFormRef = useRef();

  const ShowForm = () => {
    const Dialog = (
      <BaseDialog
        Title={Title}
        Close={() => setDialog(null)}
        Save={async (setLoading) => {
          if (EditBodyFormRef.current && EditBodyFormRef.current.Save) {
            const result = await EditBodyFormRef.current.Save();
            if (result !== false) {
              setDialog(null);
            }
          }
          setLoading(false);
        }}
        ShowSave={true}
        Width="400px"
        Height="200px"
      >
        <EditCommentForm
          rowdata={rowdata}
          Field={Field}
          Save={Save}
          ref={EditBodyFormRef}
        />
      </BaseDialog>
    );
    setDialog(Dialog);
  };

  return (
    <Box
      sx={{ display: "flex", alignItems: "center", gap: "2px", minWidth: 0 }}
    >
      {Dialog}
      <Tooltip title={t("Notes")}>
        <IconButton
          onClick={ShowForm}
          aria-label={t("Notes")}
          size="small"
          sx={{
            flex: "0 0 auto",
            width: "24px",
            height: "24px",
            padding: 0,
            borderRadius: radius.xs,
            color: colors.brand.inkDim,
            "& svg": { fontSize: "15px" },
            "&:hover": {
              backgroundColor: colors.brand.tint,
              color: colors.brand.cyanInk,
            },
            "&:focus-visible": {
              outline: `2px solid ${colors.brand.focus}`,
              outlineOffset: "1px",
            },
          }}
        >
          <EditIcon />
        </IconButton>
      </Tooltip>
      {/* An empty cell that is still editable should say so, rather than look
          like a rendering gap. */}
      <Box
        component="span"
        sx={{
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          color: Text ? "inherit" : colors.brand.inkDim,
          fontStyle: Text ? "normal" : "italic",
        }}
      >
        {Text || t("Тэмдэглэл алга")}
      </Box>
    </Box>
  );
}
