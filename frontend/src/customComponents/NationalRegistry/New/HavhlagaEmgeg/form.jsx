import React, { useEffect } from "react";
// TODO: DevExtreme not installed
// // TODO: DevExtreme not installed
// import Form from "devextreme-react/form";
import { Form } from "newComponents/BaseForm";
import { Popup } from "components/customComponent/defaults";
import { layout } from "./config";
import useForm from "./useForm";
import i18n from "i18n";

export default ({ saved, ...props }) => {
  const formName = props.formName ? props.formName : "HavhlagaEmgeg";

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
      title="Хавхлагын эмгэг"
      width={800}
      height={720}
      clickClose={close}
      clickSave={save}
      loadButtonSelector={`forms.${formName}.saveLoading`}
    >
      <Form labelLocation="left" colCount={1}>
        {renderFields({ fields: config.fields, items: layout })}
      </Form>
    </Popup>
  );
};
