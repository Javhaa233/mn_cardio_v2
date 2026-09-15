import React, { useState } from "react";
import { useTabContext } from "customComponents/PageTabs/TabContext";
import customHistory from "customHistory";
import { useTranslation } from "react-i18next";
// @mui/material components
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import Button from "components/CustomButtons/Button";

import Helper from "helper";

import baseControlsStyles from "assets/jss/material-dashboard-pro-react/custom/baseControlsStyles";
import { colors } from "@/theme/colors";

// eslint-disable-next-line no-control-regex
const RegistrationNumberRegex = /[^\u0000-\u007F][^\u0000-\u007F][0-9]{8}$/;

export default function PatientCheck() {
  const { t } = useTranslation();
  const tab = useTabContext();
  const [PatRegNo, setPatRegNo] = useState(() => {
    // The tab's own url, not the address bar: this initialiser runs on mount,
    // and a lazily-loaded page can mount after the doctor has switched tabs.
    const UrlPatRegNo = Helper.BaseHelper.getUrlParam(
      decodeURI((tab && tab.url) || document.location.href),
      "PatRegNo",
    );
    if (RegistrationNumberRegex.test(UrlPatRegNo)) {
      return UrlPatRegNo.replace(/\s/g, "");
    }
    return "";
  });
  const [Alert, setAlert] = useState(null);

  const Search = () => {
    if (RegistrationNumberRegex.test(PatRegNo)) {
      setPatRegNo(PatRegNo.replace(/\s/g, ""));
      customHistory.push(
        "/admin/Cardiovascular?PatRegNo=" +
          PatRegNo.replace(/\s/g, "").toUpperCase(),
      );
    } else {
      setAlert(
        Helper.BaseCrudHelper.ShowAlert(
          "Регистрийн дугаар буруу байна",
          false,
          () => setAlert(null),
        ),
      );
    }
  };

  return (
    <div style={{ display: "flex" }}>
      {Alert}
      <form>
        <TextField
          placeholder={t("Personal number")}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              Search();
            }
          }}
          value={PatRegNo}
          onChange={(event) => {
            setPatRegNo(event.target.value);
          }}
          style={{
            float: "left",
            width: "170px",
            margin: "0 10px",
          }}
          sx={{
            "& .MuiInputBase-input": {
              ...(baseControlsStyles.input || {}),
            },
            "& .MuiInput-underline:before": {
              borderColor: "#D2D2D2 !important",
              borderWidth: "1px !important",
            },
            "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
              borderColor: "#D2D2D2 !important",
              borderWidth: "1px !important",
            },
            "& .MuiInput-underline:after": { borderColor: colors.brand.cyan },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ marginRight: "-4px" }}>
                <SearchIcon style={{ color: "#999" }} />
              </InputAdornment>
            ),
          }}
        />
        <Button
          color="primary"
          size="sm"
          style={{ float: "left", boxShadow: "none" }}
          onClick={Search}
        >
          {t("Шалгах")}
        </Button>
      </form>
    </div>
  );
}
