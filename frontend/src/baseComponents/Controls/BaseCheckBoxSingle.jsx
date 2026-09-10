import React, { useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import {
  FormLabel,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Checkbox,
} from "@mui/material";
// @mui/icons-material
import Check from "@mui/icons-material/Check";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

import styles from "assets/jss/material-dashboard-pro-react/custom/baseControlsStyles";

export default function BaseCheckBoxSingle(props) {
  const { t } = useTranslation();
  const { Config = null, Value = "0", ChangeValue, LabelledBy = null } = props;

  const [currentValue, setCurrentValue] = useState(Value);
  const checked = currentValue === "1";

  return (
    <FormControl
      component="fieldset"
      sx={{
        ...styles.formControl,
        padding: "5px 5px",
      }}
    >
      <FormControlLabel
        control={
          <Checkbox
            checked={checked}
            inputProps={{
              "aria-labelledby": LabelledBy || undefined,
              "aria-label":
                !LabelledBy && Config?.Label ? t(Config.Label + "") : undefined,
            }}
            onChange={(e, c) => {
              const v = c ? "1" : "0";
              setCurrentValue(v);
              ChangeValue && ChangeValue(v);
            }}
            checkedIcon={<Check sx={styles.checkedIcon} />}
            icon={<Check sx={styles.uncheckedIcon} />}
            sx={{
              ...styles.checkRoot,
              "&.Mui-checked": styles.checked,
            }}
          />
        }
        label={null}
      />

      {Config.HelperText && (
        <FormHelperText>{Config.HelperText}</FormHelperText>
      )}
    </FormControl>
  );
}
