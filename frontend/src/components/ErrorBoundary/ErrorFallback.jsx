import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Box, Alert, AlertTitle, Button } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

/**
 * Simple Error Fallback Component
 * Used for smaller sections that don't need full-page error display
 */
const ErrorFallback = ({ error, onReset, message }) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ padding: 2 }}>
      <Alert
        severity="error"
        action={
          onReset && (
            <Button
              color="inherit"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={onReset}
            >
              {t("Дахин оролдох")}
            </Button>
          )
        }
      >
        <AlertTitle>{t("Алдаа гарлаа")}</AlertTitle>
        {message || t("Уучлаарай, энэ хэсгийг ачаалахад алдаа гарлаа.")}
        {process.env.NODE_ENV === "development" && error && (
          <Box
            component="pre"
            sx={{
              marginTop: 1,
              fontSize: 12,
              overflow: "auto",
              maxHeight: 100,
            }}
          >
            {error.toString()}
          </Box>
        )}
      </Alert>
    </Box>
  );
};

ErrorFallback.propTypes = {
  error: PropTypes.object,
  onReset: PropTypes.func,
  message: PropTypes.string,
};

export default ErrorFallback;
