import React from "react";
import { useSelector } from "react-redux";

import { getValue } from "utils/helper";
import BaseAlert from "baseComponents/BaseAlert";
//import { NotificationManager } from "react-notifications";

//'success' | 'danger' | 'info' | 'default' | 'warning'

export default ({ selector, onDismiss }) => {
  const data = useSelector((state) => {
    return getValue(state, selector);
  });

  //   if (data && data.message) {
  //     if (data.type === "success") {
  //       NotificationManager.success(
  //         data.message ? data.message : " ",
  //         data.title ? data.title : " ",
  //         2000
  //       );
  //     } else if (data.type === "error") {
  //       NotificationManager.error(
  //         data.message ? data.message : " ",
  //         data.title ? data.title : " ",
  //         4000
  //       );
  //     } else if (data.type === "warning") {
  //       NotificationManager.warning(
  //         data.message ? data.message : " ",
  //         data.title ? data.title : " ",
  //         4000
  //       );
  //     }

  //     onDismiss && onDismiss();
  //  }

  if (!data || !data.message) {
    return null;
  }

  // Alerts reach here in two shapes: a normalised one carrying `type`, and a
  // raw one carrying only a `success` boolean. Accept either, and let an
  // explicit error/warning `type` win over a stale `success` flag.
  const isError = data.type === "error" || data.type === "warning";
  const isSuccess =
    !isError && (data.type === "success" || data.success === true);

  return (
    <BaseAlert
      Hide={() => onDismiss()}
      success={isSuccess}
      Type="Message"
      Message={data.message}
    />
  );
};
