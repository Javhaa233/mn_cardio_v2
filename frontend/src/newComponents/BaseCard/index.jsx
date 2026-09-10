import React, { useEffect } from "react";

import { useDispatch } from "react-redux";
import { setTitle } from "store/reducers/system";
import i18n from "i18n";

export default ({ title, subTitle, children, style }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setTitle(title));
    document.title = title || "MnCardio";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "4px 10px 4px 10px",
        ...style,
      }}
    >
      {subTitle && (
        <div
          style={{
            borderBottom: "1px solid #ccc",
            margin: "6px",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex" }}>
            <h4
              style={{
                padding: "0 10px",
                margin: "0 0 2px 0",
                color: "black",
                fontWeight: "400",
                fontSize: "16px",
              }}
            >
              {subTitle}
            </h4>
          </div>
        </div>
      )}
      {children}
    </div>
  );
};
