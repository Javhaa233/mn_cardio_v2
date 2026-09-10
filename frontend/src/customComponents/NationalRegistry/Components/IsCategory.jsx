import React from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";

export default function IsCategory(props) {
  const { t } = useTranslation();
  const { rowdata = {} } = props;

  const spanSx = { padding: "2px 4px", borderRadius: "2px", color: "white" };

  return (
    <div>
      {rowdata.n_category + "" === "neelttei" ? (
        <Box
          component="span"
          sx={spanSx}
          style={{ backgroundColor: "#003385" }}
        >
          {t("Нээлттэй мэс засал")}
        </Box>
      ) : rowdata.n_category + "" === "sudsan_dotuurh" ? (
        <Box
          component="span"
          sx={spanSx}
          style={{ backgroundColor: "#cf0083" }}
        >
          {t("Судсан дотуурх мэс засал")}
        </Box>
      ) : rowdata.n_category + "" === "katetr" ? (
        <Box
          component="span"
          sx={spanSx}
          style={{ backgroundColor: "#118f00" }}
        >
          {t("Катетр ангиографийн оношилгоо")}
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
