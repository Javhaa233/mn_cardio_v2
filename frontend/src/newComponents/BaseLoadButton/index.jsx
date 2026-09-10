import React from "react";
// translation
import { useTranslation } from "react-i18next";
import { Button, CircularProgress } from "@mui/material";
import useBaseLoadButton from "./useBaseLoadButton";

export default ({
  icon,
  onClick,
  selector,
  loadingText,
  children,
  ...props
}) => {
  const { t } = useTranslation();

  const { loading, disable, loadingIcon } = useBaseLoadButton({
    selector,
    ...props,
  });

  // Convert devextreme properties to MUI equivalents
  const muiProps = {
    variant:
      props.type === "normal"
        ? "outlined"
        : props.type === "danger"
          ? "contained"
          : "contained",
    color: props.type === "danger" ? "error" : "primary",
    disabled: disable || loading,
    onClick: onClick,
    fullWidth: props.width === "100%",
    ...props,
  };

  // Remove devextreme-specific properties that don't apply to MUI
  delete muiProps.icon;
  delete muiProps.text;

  return (
    <Button {...muiProps}>
      {loading ? (
        <>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          {loadingText || t("Please wait ...")}
        </>
      ) : (
        <>
          {icon && <span style={{ marginRight: 8 }}>{icon}</span>}
          {children || t(props.text || "")}
        </>
      )}
    </Button>
  );
};
