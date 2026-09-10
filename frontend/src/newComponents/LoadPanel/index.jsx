// DevExtreme stub components (package not installed)
const LoadPanel = ({ children, ...props }) => (
  <div>LoadPanel not available</div>
);

import React from "react";
import { useSelector } from "react-redux";
// TODO: DevExtreme not installed
// // TODO: DevExtreme not installed
// import LoadPanel from "devextreme-react/load-panel";
import { getValue } from "utils/helper";

export default ({ targetId, loadingText, selector, ...props }) => {
  const loading =
    props.loading === undefined
      ? useSelector((state) => getValue(state, selector))
      : props.loading;

  const position = { of: "#" + targetId };
  return (
    <LoadPanel
      shadingColor="rgba(0,0,0,0.2)"
      position={position}
      visible={loading}
      showIndicator={true}
      shading={true}
      showPane={true}
      closeOnOutsideClick={false}
      message={loadingText ? loadingText : "Please wait ..."}
    />
  );
};
