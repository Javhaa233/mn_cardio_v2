import React from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";

export default function IsActive(props) {
  const { t } = useTranslation();
  const { rowdata = {} } = props;

  const spanSx = { padding: "2px 4px", borderRadius: "2px", color: "white" };

  return (
    <div>
      {rowdata.is_confirm + "" === "yes" ? (
        <Box component="span" sx={{ ...spanSx, backgroundColor: "#2bb559" }}>
          {t("Батлагдсан")}
        </Box>
      ) : rowdata.is_confirm + "" === "no" ? (
        <Box
          component="span"
          sx={spanSx}
          style={{ backgroundColor: "#ff5757" }}
        >
          {t("Батлагдаагүй")}
        </Box>
      ) : (
        <Box
          component="span"
          sx={spanSx}
          style={{ backgroundColor: "#ffcc00" }}
        >
          {t("Тодорхойгүй")}
        </Box>
      )}
    </div>
  );
}
