// DevExtreme stub components (package not installed)
const TextBox = ({ children, ...props }) => <div>TextBox not available</div>;
const Validator = ({ children }) => null;
const TextBoxButton = ({ children }) => null;

import { useTranslation } from "react-i18next";
import React from "react";
// TODO: DevExtreme not installed
// import TextBox, { Button as TextBoxButton } from "devextreme-react/text-box";
// TODO: DevExtreme not installed
// // TODO: DevExtreme not installed
// import { Validator } from "devextreme-react/validator";
import useInput from "../useInput";

export default ({ config, ...props }) => {
  const { t } = useTranslation();
  const { value, changeValue, validate, validatorRef, mode, setMode } =
    useInput({ ...props, mode: "password" });
  return (
    <TextBox
      value={value}
      stylingMode={"outlined"}
      onFocusOut={validate}
      onValueChanged={(v) => changeValue(v.value)}
      {...config}
      mode={mode}
    >
      <Validator
        ref={validatorRef}
        validationRules={props.validationRules || []}
      />
      <TextBoxButton
        name="password"
        location="after"
        options={{
          icon: "key",
          type: "normal",
          onClick: () => {
            setMode(mode === "password" ? "text" : "password");
          },
        }}
      />
    </TextBox>
  );
};
