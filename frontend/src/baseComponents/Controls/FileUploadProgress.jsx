import React from "react";
import { useTranslation } from "react-i18next";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

/**
 * FileUploadProgress Component
 *
 * Displays upload progress with percentage and cancel button
 *
 * @param {number} progress - Upload progress (0-100)
 * @param {boolean} isUploading - Whether upload is in progress
 * @param {function} onCancel - Callback when cancel button is clicked
 * @param {string} fileName - Optional file name to display
 */
export default function FileUploadProgress({
  progress = 0,
  isUploading = false,
  onCancel,
  fileName = null,
}) {
  const { t } = useTranslation();

  if (!isUploading) {
    return null;
  }

  return (
    <Box
      sx={{
        width: "100%",
        padding: "12px",
        backgroundColor: "#f5f5f5",
        borderRadius: "4px",
        border: "1px solid #e0e0e0",
        marginTop: "8px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "8px",
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {fileName
            ? `${t("Uploading")}: ${fileName}`
            : t("Uploading files...")}
        </Typography>
        {onCancel && (
          <IconButton
            size="small"
            onClick={onCancel}
            sx={{
              padding: "4px",
              color: "#f44336",
              "&:hover": {
                backgroundColor: "rgba(244, 67, 54, 0.08)",
              },
            }}
            title={t("Cancel upload")}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box sx={{ width: "100%", marginRight: "8px" }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: "#e0e0e0",
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
                backgroundColor: progress === 100 ? "#4caf50" : "#2196f3",
              },
            }}
          />
        </Box>
        <Box sx={{ minWidth: 45 }}>
          <Typography
            variant="body2"
            sx={{ color: "#666", fontWeight: 500 }}
          >{`${Math.round(progress)}%`}</Typography>
        </Box>
      </Box>
      {progress === 100 && (
        <Typography
          variant="caption"
          sx={{ color: "#4caf50", marginTop: "4px", display: "block" }}
        >
          {t("Upload complete")}
        </Typography>
      )}
    </Box>
  );
}
