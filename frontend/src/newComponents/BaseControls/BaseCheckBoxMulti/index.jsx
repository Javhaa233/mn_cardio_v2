// DevExtreme stub components (package not installed)
const CheckBox = ({ children, ...props }) => <div>CheckBox not available</div>;
const Validator = ({ children }) => null;

import { useTranslation } from "react-i18next";
import React from "react";
// TODO: DevExtreme not installed
// // TODO: DevExtreme not installed
// import CheckBox from "devextreme-react/check-box";
// TODO: DevExtreme not installed
// // TODO: DevExtreme not installed
// import { Validator } from "devextreme-react/validator";

import useSelect from "newComponents/BaseControls/useLocalSelect";

export default ({ config, ...props }) => {
  const { value, changeValue, dataSource, validatorRef } = useSelect(props);

  const changeValueLocal = (val, check) => {
    const { t } = useTranslation();
    let newValue = value ? Object.assign() : [];
    if (check) {
      if (!newValue.includes(val)) newValue.push(val);
    } else {
      if (newValue.includes(val)) newValue = newValue.filter((s) => s !== val);
    }
    changeValue(newValue);
  };

  if (!Array.isArray(dataSource)) return null;

  return (
    <div style={{ width: "100%", display: "flex" }}>
      {Array.isArray(dataSource) &&
        dataSource.map((d) => (
          <div
            key={d[config.valueExpr ? config.valueExpr : "id"]}
            style={{ padding: "4px" }}
          >
            <CheckBox
              value={d[config.valueExpr ? config.valueExpr : "id"] === value}
              text={d.label}
              onValueChanged={(v) => {
                changeValueLocal(
                  d[config.valueExpr ? config.valueExpr : "id"],
                  v.value,
                );
              }}
              {...config}
            >
              <Validator
                ref={validatorRef}
                validationRules={props.validationRules || []}
              />
            </CheckBox>
          </div>
        ))}
    </div>
  );
};
