// DevExtreme stub components (package not installed)
const Button = () => <div>Button not available</div>;

import React, { useState, useEffect } from "react";
// TODO: DevExtreme not installed
// // TODO: DevExtreme not installed
// import Button from "devextreme-react/button";
// TODO: DevExtreme not installed
// // TODO: DevExtreme not installed
// import { Validator } from "devextreme-react/validator";
import useInput from "newComponents/BaseControls/useInput";

const values = ["bold", "italic", "underline"];
export default ({ ...props }) => {
  const { value, changeValue, loading } = useInput(props);
  const [valueArray, setValueArray] = useState([]);

  useEffect(() => {
    if (!loading) {
      if (value && typeof value === "string") {
        setValueArray(value.split(","));
      } else {
        setValueArray([]);
      }
    }
  }, [loading, value]);

  const clickStyle = (style) => {
    if (style) {
      const isHave = Array.isArray(valueArray) && valueArray.includes(style);
      if (!isHave) {
        setValueArray([...valueArray, style]);
      } else {
        const newArray = Array.isArray(valueArray)
          ? valueArray.filter((s) => s !== style)
          : [];
        setValueArray(newArray);
      }
    }
  };

  useEffect(() => {
    changeValue(valueArray.join(","));
  }, [valueArray, changeValue]);

  return (
    <div style={{ display: "flex" }}>
      {Array.isArray(values) &&
        values.map((v) => (
          <div key={v} style={{ padding: "2px" }}>
            <Button
              icon={v}
              stylingMode={
                Array.isArray(valueArray) && valueArray.includes(v)
                  ? "contained"
                  : "outlined"
              }
              type="default"
              onClick={() => clickStyle(v)}
            />
          </div>
        ))}
    </div>
  );
};
