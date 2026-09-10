import React from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";

export default function IsActive(props) {
  const { t } = useTranslation();

  const { rowdata = {} } = props;

  const spanSx = { padding: "2px 4px", borderRadius: "2px", color: "white" };

  return (
    <div>
      {rowdata.Status + "" === "activated" ? (
        <Box
          component="span"
          sx={spanSx}
          style={{ backgroundColor: "#2bb559" }}
        >
          {t("Идэвхитэй")}
        </Box>
      ) : rowdata.Status + "" === "out_control" ? (
        <Box
          component="span"
          sx={spanSx}
          style={{ backgroundColor: "#ff5757" }}
        >
          {t("Хяналтаас гарсан")}
        </Box>
      ) : rowdata.Status + "" === "expired" ? (
        <Box
          component="span"
          sx={spanSx}
          style={{ backgroundColor: "#ffcc00" }}
        >
          {t("Үзлэгт хамрагдсан")}
        </Box>
      ) : (
        <Box
          component="span"
          sx={spanSx}
          style={{ backgroundColor: "#a9b0ab" }}
        >
          {t("Идэвхигүй")}
        </Box>
      )}
    </div>
  );
}
