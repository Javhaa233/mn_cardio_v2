import React, { useEffect } from "react";
import { Grid } from "@mui/material";

import { Popup } from "components/customComponent/defaults";
import { layout } from "./config";
import useForm from "./useForm";
import i18n from "i18n";

export default ({ saved, ...props }) => {
  const formName = props.formName ? props.formName : "Organization";

  const { config, visible, close, save, renderFields } = useForm({
    formName,
    saved,
    ...props,
  });

  useEffect(() => {
    return () => close();
  }, [close]);

  if (!visible) return null;

  return (
    <Popup
      visible={true}
      title="Organization"
      width={800}
      height={720}
      clickClose={close}
      clickSave={save}
      loadButtonSelector={`forms.${formName}.saveLoading`}
    >
      <div style={{ padding: "10px" }}>
        {renderFields({ items: layout, fields: config.fields })}
      </div>
    </Popup>
  );
};
