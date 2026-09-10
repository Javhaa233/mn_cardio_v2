// DevExtreme stub components (package not installed)
const DateBox = ({ children, ...props }) => <div>DateBox not available</div>;
const Validator = ({ children }) => null;

import { useTranslation } from "react-i18next";
import React from "react";
import useInput from "newComponents/BaseControls/useInput";
// TODO: DevExtreme not installed
// // TODO: DevExtreme not installed
// import DateBox from "devextreme-react/date-box";
// TODO: DevExtreme not installed
// // TODO: DevExtreme not installed
// import { Validator } from "devextreme-react/validator";

export default ({ config, ...props }) => {
  const { t } = useTranslation();
  const { value, changeValue, validatorRef, validate } = useInput(props);

  return (
    <DateBox
      displayFormat="yyyy-MM-dd HH:mm:ss"
      dateSerializationFormat="yyyy-MM-dd HH:mm:ss"
      value={value}
      showClearButton
      onFocusOut={validate}
      type="datetime"
      stylingMode="outlined"
      onValueChanged={(v) => changeValue(v.value)}
      {...config}
    >
      <Validator
        ref={validatorRef}
        validationRules={props.validationRules || []}
      />
    </DateBox>
  );
};
