import React, { useRef } from "react";

// DevExtreme stub components (package not installed)
const Dropdown = React.forwardRef(({ children, ...props }, ref) => (
  <div>Dropdown not available</div>
));
const DataGrid = ({ children, ...props }) => <div>DataGrid not available</div>;
const Validator = ({ children }) => null;
// translation
import { useTranslation } from "react-i18next";

// TODO: DevExtreme not installed
// // TODO: DevExtreme not installed
// import Dropdown from "devextreme-react/drop-down-box";
// TODO: DevExtreme not installed
// // TODO: DevExtreme not installed
// import DataGrid from "devextreme-react/data-grid";
// TODO: DevExtreme not installed
// // TODO: DevExtreme not installed
// import { Validator } from "devextreme-react/validator";

import useSelect from "../useSelect";
import defaultConfig from "newComponents/BaseGrid/defaultConfig";

export default ({ config, getDataSource, ...props }) => {
  const { t } = useTranslation();

  const { dataSource, value, changeValue, validate, validatorRef } = useSelect({
    config,
    getDataSource,
    ...props,
  });

  const dropDownRef = useRef();

  const hide = () => {
    //dropDownRef.current.instance.option({ opened: false });
  };

  return (
    <Dropdown
      placeholder={t("-- Select --")}
      stylingMode="outlined"
      showClearButton
      dataSource={dataSource}
      onFocusOut={validate}
      ref={dropDownRef}
      value={value}
      onValueChanged={(value) => {
        if (value.value === null) {
          changeValue(null);
        }
      }}
      {...config}
      contentRender={() => {
        return (
          <DataGrid
            style={{ padding: "10px" }}
            dataSource={dataSource}
            selectedRowKeys={value ? value : []}
            onSelectionChanged={(e) => {
              // if (
              //     e.selectedRowKeys[0] &&
              //     value &&
              //     e.selectedRowKeys[0] !== value
              // ) {
              hide();
              changeValue(e.selectedRowKeys);
              //}
            }}
            hoverStateEnabled={true}
            {...defaultConfig}
            height={360}
            columns={config.columns}
            keyExpr={config.valueExpr}
            searchPanel={{ visible: true, placeholder: "Хайлт" }}
            selection={{ mode: "multiple" }}
          />
        );
      }}
    >
      <Validator
        ref={validatorRef}
        validationRules={props.validationRules || []}
      />
    </Dropdown>
  );
};
