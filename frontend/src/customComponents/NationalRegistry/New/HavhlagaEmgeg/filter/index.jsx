import React, { useEffect } from "react";
// TODO: DevExtreme not installed
// import Form, { Item } from "devextreme-react/form";
import { Form, Item } from "newComponents/BaseForm";
import BaseLoadButton from "newComponents/BaseLoadButton";
import { useBaseFilter } from "newComponents/BaseFilter";
import { useDispatch } from "react-redux";
import Config, { layout } from "./config";

export default ({ formName, ...props }) => {
  const dispatch = useDispatch();

  const config = Config(dispatch);

  const { filter, renderFields } = useBaseFilter({
    fields: config.fields,
    formName,
    ...props,
  });

  const clickFilter = () => {
    if (props.filter) {
      filter(props.filter);
    }
  };

  return (
    <Form colCount={3} labelLocation="left">
      {renderFields({ items: layout, fields: config.fields })}
      <Item>
        <BaseLoadButton
          selector={`form.${formName}.loading`}
          text="Шүүх"
          onClick={clickFilter}
          icon="search"
          type="default"
        />
      </Item>
    </Form>
  );
};
