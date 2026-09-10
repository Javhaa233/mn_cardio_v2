// DevExtreme stub components (package not installed)
const DateBox = ({ children, ...props }) => <div>DateBox not available</div>;

import { useTranslation } from "react-i18next";
import React from "react";
import useInput from "newComponents/BaseControls/useInput";
// TODO: DevExtreme not installed
// // TODO: DevExtreme not installed
// import DateBox from "devextreme-react/date-box";
// import moment from "moment";

export default (props) => {
  const { t } = useTranslation();
  const { value, loading, changeValue, validate, validatorRef } =
    useInput(props);

  // useEffect(() => {
  //   if (!loading && !value) {
  //     const nowDate = moment().format("YYYY-MM-DD");
  //     changeValue({
  //       startDate: nowDate,
  //       endDate: nowDate,
  //     });
  //   }
  // }, [loading]);

  return (
    <div
      style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
    >
      <DateBox
        stylingMode="outlined"
        displayFormat="yyyy-MM-dd"
        value={value ? value.startDate : undefined}
        dateSerializationFormat="yyyy-MM-dd"
        max={value && value.endDate ? value.endDate : undefined}
        onValueChanged={(v) => changeValue({ ...value, startDate: v.value })}
        width={"48%"}
      />
      <i className="dx-icon dx-icon-minus"></i>
      <DateBox
        stylingMode="outlined"
        displayFormat="yyyy-MM-dd"
        value={value ? value.endDate : undefined}
        dateSerializationFormat="yyyy-MM-dd"
        min={value && value.startDate ? value.startDate : undefined}
        onValueChanged={(v) => changeValue({ ...value, endDate: v.value })}
        width={"48%"}
      />
    </div>
  );
};
