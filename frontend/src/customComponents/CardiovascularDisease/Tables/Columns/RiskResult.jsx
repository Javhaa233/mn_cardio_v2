import React from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";

export default function RiskResult(props) {
  const { t } = useTranslation();

  const { rowdata = {} } = props;

  const spanSx = { padding: "2px 4px", borderRadius: "2px", color: "white" };

  return (
    <div>
      {rowdata.Risk + "" === "1" ? (
        <Box component="span" sx={{ ...spanSx, backgroundColor: "#2bb559" }}>
          {t("Идэвхитэй")}
        </Box>
      ) : rowdata.Risk + "" === "2" ? (
        <Box
          component="span"
          sx={spanSx}
          style={{ backgroundColor: "#ff5757" }}
        >
          {t("Хяналтаас гарсан")}
        </Box>
      ) : rowdata.Risk + "" === "3" ? (
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
