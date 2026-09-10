/* eslint-disable no-undef */
import { useEffect } from "react";
import { useSelector } from "react-redux";
// TODO: DevExtreme not installed
// // TODO: DevExtreme not installed
// import notify from "devextreme/ui/notify";
import { getValue } from "utils/helper";
import i18n from "i18n";

export default ({ selector }) => {
  const alert = useSelector((state) => {
    return getValue(state, selector);
  });

  useEffect(() => {
    if (alert !== null) {
      notify(
        {
          displayTime: 2000,
          message: alert.message,
          width: 400,
        },
        alert.success ? "success" : "error",
      );
    }
  }, [alert]);
  return null;
};
