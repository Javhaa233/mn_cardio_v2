const EditorTypesConfig = {
  TextBox: {},
  DateBox: { dataType: "date", format: "yyyy-MM-dd" },

  DateTimeBox: { dataType: "datetime", format: "yyyy-MM-dd HH:mm" },
  NumberBox: { dataType: "number" },
};

export default {
  GetFieldConfig: (FieldName, Config, VisibleColumns) => {
    const visibleColumns = Array.isArray(VisibleColumns) ? VisibleColumns : [];
    var result = { dataField: FieldName };
    const Field = Config.Fields[FieldName];
    if (Field) {
      result.caption = Field.Label ? Field.Label : null;
      if (Field.Config) {
        result = { ...result, ...Field.Config };
      }
    }
    const EditorTypeConfig =
      EditorTypesConfig[Field.EditorType ? Field.EditorType : "TextBox"];
    if (EditorTypeConfig) {
      result = { ...result, ...EditorTypeConfig };
    }
    if (visibleColumns.length > 0 && !visibleColumns.includes(FieldName)) {
      result.visible = false;
    }
    return result;
  },
};
