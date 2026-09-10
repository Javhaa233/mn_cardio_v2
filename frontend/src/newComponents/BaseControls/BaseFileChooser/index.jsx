// DevExtreme stub components (package not installed)
const TextBox = ({ children, ...props }) => <div>TextBox not available</div>;
const Validator = ({ children }) => null;
const TextBoxButton = ({ children }) => null;

import { useTranslation } from "react-i18next";
import React, { useRef } from "react";
// TODO: DevExtreme not installed
// // TODO: DevExtreme not installed
// import { Validator } from "devextreme-react/validator";
// TODO: DevExtreme not installed
// import TextBox, { Button as TextBoxButton } from "devextreme-react/text-box";
import useInput from "newComponents/BaseControls/useInput";

export default ({ config, ...props }) => {
  const { t } = useTranslation();
  const { value, changeValue, validate, validatorRef } = useInput(props);
  const uploadFileRef = useRef();

  return (
    <>
      <TextBox
        value={value ? value.name : ""}
        stylingMode={"outlined"}
        onFocusOut={validate}
        // onValueChanged={(v) => {
        //   changeValue(v.value);
        // }}
        {...config}
      >
        <Validator
          ref={validatorRef}
          validationRules={props.validationRules || []}
        />
        <TextBoxButton
          name={"fileChoose"}
          options={{
            icon: "file",
            stylingMode: "text",
            onClick: () => uploadFileRef.current.click(),
          }}
        />
      </TextBox>
      <input
        ref={uploadFileRef}
        type="file"
        multiple={false}
        onChange={(e) => changeValue(e.target.files[0])}
        hidden
      />
    </>
  );
};
