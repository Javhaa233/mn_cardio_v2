import React, { useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import FormLabel from "@mui/material/FormLabel";
import CircularProgress from "@mui/material/CircularProgress";
// @mui/icons-material
import CheckIcon from "@mui/icons-material/Check";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import CustomInput from "components/CustomInput/CustomInput.jsx";

export default function UserNameText(props) {
  const { t } = useTranslation();
  const [Value, setValue] = useState("");
  const [IsActive, setIsActive] = useState("-1");
  const [Loading, setLoading] = useState(false);
  const [HelperText, setHelperText] = useState("");

  const {
    Config = null,
    ChangeValue,
    CheckUserName,
    Width = "none",
    ReadOnly = false,
  } = props;

  const onChange = (Value) => {
    setValue(Value);
    Config && ChangeValue && ChangeValue(Config.Name, Value);
  };

  const getCheckUserName = (Value) => {
    let UserName = Value;
    setLoading(true);
    UserName = UserName.replace(/\s/g, "");
    onChange(UserName);
    CheckUserName &&
      CheckUserName(UserName, (Data, TimeDuration) => {
        const TimeOutDuration = isNaN(parseInt(TimeDuration))
          ? 1500
          : parseInt(TimeDuration);
        setTimeout(function () {
          setIsActive(Data.Success);
          setLoading(false);
          setHelperText(Data.Message);
        }, TimeOutDuration);
      });
  };

  return (
    <GridContainer style={{ marginBottom: "10px" }}>
      <GridItem xs={12} sm={6} md={4}>
        <FormLabel
          sx={{
            color: "#75736c",
            cursor: "pointer",
            display: "inline-flex",
            fontSize: "14px",
            lineHeight: "1.428571429",
            fontWeight: "400",
            paddingTop: "8px",
            marginRight: "0",
            textAlign: "right",
            "@media (min-width: 992px)": { float: "right" },
          }}
        >
          {Config && Config.Label
            ? t(Config.Label + "") + ":" + (Config.Required ? " *" : "")
            : ""}
        </FormLabel>
      </GridItem>
      <GridItem xs={12} sm={6} md={6}>
        <CustomInput
          error={!IsActive && IsActive !== "-1"}
          formControlProps={{
            fullWidth: true,
            style: {
              paddingTop: "0",
              marginBottom: "0",
              backgroundColor: "#FFF",
              width: Width,
            },
          }}
          inputProps={{
            value: Value ? Value : "",
            onChange: (e) => onChange(e.target.value),
            onBlur: (e) => getCheckUserName(e.target.value),
            type: Config ? Config.Type : "Text",
            error: !IsActive && IsActive !== "-1",
            disabled: Loading ? Loading : false,
            readOnly: ReadOnly,
          }}
          helperText={!IsActive && IsActive !== "-1" ? HelperText : null}
        />
      </GridItem>
      <GridItem xs={12} sm={6} md={2} style={{ position: "relative" }}>
        {Loading ? (
          <CircularProgress
            size={24}
            style={{
              color: "#01451b",
              position: "absolute",
              left: "-10px",
              top: "8px",
            }}
          />
        ) : (
          IsActive &&
          IsActive !== "-1" && (
            <CheckIcon
              style={{
                color: "#00a13e",
                position: "absolute",
                left: "-15px",
                top: "8px",
              }}
            />
          )
        )}
      </GridItem>
    </GridContainer>
  );
}
