import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setState, disposeComponent } from "store/reducers/system/component";
import ToolBar from "./ToolBar";
import { getValue } from "utils/helper";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";

export default ({ componentName, title, ...props }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const src = useSelector((state) =>
    getValue(state, `component.${componentName}.src`),
  );
  const visble = useSelector((state) =>
    getValue(state, `component.${componentName}.visible`),
  );

  const hide = () => {
    dispatch(
      setState({ componentName, values: { visible: false, src: null } }),
    );
  };

  useEffect(() => {
    return () => dispatch(disposeComponent(componentName));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visble) {
    return null;
  }

  return (
    <>
      <Dialog open={true} onClose={hide} fullWidth maxWidth="lg" {...props}>
        {title && <DialogTitle>{title}</DialogTitle>}
        <DialogContent style={{ height: "600px", padding: 0 }}>
          <div style={{ width: "100%", height: "100%" }}>
            <embed src={src} style={{ height: "100%", width: "100%" }} />
          </div>
        </DialogContent>
        <ToolBar clickClose={hide} />
      </Dialog>
    </>
  );
};

//</ScrollView>;
