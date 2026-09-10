import React from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";

export default function IsType(props) {
  const { t } = useTranslation();
  const { rowdata = {} } = props;

  const spanSx = { padding: "2px 4px", borderRadius: "2px", color: "white" };

  return (
    <div>
      {rowdata.n_type + "" === "Насанд хүрэгчид" ? (
        <Box
          component="span"
          sx={spanSx}
          style={{ backgroundColor: "#2bb559" }}
        >
          {t(rowdata.n_type + "")}
        </Box>
      ) : rowdata.n_type + "" === "Хүүхэд" ? (
        <Box
          component="span"
          sx={spanSx}
          style={{ backgroundColor: "#ff5757" }}
        >
          {t(rowdata.n_type + "")}
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
