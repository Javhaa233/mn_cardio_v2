// DevExtreme stub components (package not installed)
const Form = ({ children, ...props }) => <div>Form not available</div>;

import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
// TODO: DevExtreme not installed
// // TODO: DevExtreme not installed
// import Form from "devextreme-react/form";
import { Popup } from "components/customComponent/defaults";
import { layout } from "./config";
import useForm from "./useForm";

export default ({ saved, ...props }) => {
  const { t } = useTranslation();
  const formName = props.formName ? props.formName : "Pm";

  const { config, visible, close, save, renderFields } = useForm({
    formName,
    saved,
    ...props,
  });

  useEffect(() => {
    return () => close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <Popup
      visible={true}
      title={t("Пэйсмэйкер суулгах")}
      width={800}
      height={720}
      clickClose={close}
      clickSave={save}
      loadButtonSelector={`forms.${formName}.saveLoading`}
    >
      <Form labelLocation="left" colCount={2}>
        {renderFields({ fields: config.fields, items: layout })}
      </Form>
    </Popup>
  );
};
