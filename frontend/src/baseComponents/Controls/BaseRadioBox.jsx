import React, { useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@mui/material";
// @mui/icons-material
import FiberManualRecord from "@mui/icons-material/FiberManualRecord";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

import styles from "assets/jss/material-dashboard-pro-react/custom/baseControlsStyles";

export default function BaseRadioBox(props) {
  const { t } = useTranslation();
  const generatedId = React.useId();
  const {
    Config = null,
    Value = null,
    WithLabel = false,
    HideLabel = false,
    md = 3,
    ChangeValue,
    Id = null,
    LabelledBy = null,
  } = props;

  // A radio group is named with aria-labelledby, not <label htmlFor>.
  const labelId = LabelledBy || (Id || generatedId) + "-label";

  const [currentValue, setCurrentValue] = useState(Value);

  const Data = Config && Config.Data ? Config.Data : [];

  const GetRadioBoxes = () => {
    var RadioBoxes = [];
    for (var i = 0; i < Data.length; i++) {
      RadioBoxes.push(
        <GridItem xs={12} sm={12} md={6} key={"GridItem" + i}>
          <FormControlLabel
            key={"Label" + i}
            style={{ color: "#6e6e6e", fontWeight: "300" }}
            value={Data[i].Value}
            control={
              <Radio
                key={"Radio" + i}
                icon={<FiberManualRecord sx={styles.radioUnchecked} />}
                checkedIcon={<FiberManualRecord sx={styles.radioChecked} />}
                sx={{
                  ...styles.radioRoot,
                  "&.Mui-checked": styles.radio,
                }}
              />
            }
            sx={{
              "& .MuiFormControlLabel-label": styles.label,
              ...styles.labelRoot,
              marginLeft: "1px",
            }}
            label={t(Data[i].Label + "")}
          />
        </GridItem>,
      );
    }
    return (
      <RadioGroup
        key={"RadioGroup"}
        aria-labelledby={labelId}
        value={currentValue + ""}
        onChange={(event) => {
          const value = event.target.value + "";
          setCurrentValue(value);
          ChangeValue && ChangeValue(value);
        }}
      >
        <GridContainer key="MainCon">{RadioBoxes}</GridContainer>
      </RadioGroup>
    );
  };

  const GetControl = () => {
    return (
      <FormControl component="fieldset" style={{ width: "100%", margin: "0" }}>
        {!WithLabel && !HideLabel ? (
          <FormLabel
            component="legend"
            id={labelId}
            style={{
              fontSize: "14px",
              color: "#6e6e6e",
              fontWeight: "300",
              margin: "0px",
            }}
          >
            {t(Config.Label + "")}
          </FormLabel>
        ) : null}
        {GetRadioBoxes()}
      </FormControl>
    );
  };

  if (Config) {
    return (
      <div>
        {WithLabel ? (
          <GridContainer>
            <GridItem xs={12} sm={12} md={md}>
              <FormLabel
                component="span"
                id={labelId}
                sx={styles.labelHorizontal}
              >
                {Config.Label
                  ? Config.Label + ":" + (Config.Required ? " *" : "")
                  : ""}
              </FormLabel>
            </GridItem>
            <GridItem xs={12} sm={12} md={12 - md}>
              {GetControl()}
            </GridItem>
          </GridContainer>
        ) : (
          GetControl()
        )}
      </div>
    );
  } else {
    return null;
  }
}
