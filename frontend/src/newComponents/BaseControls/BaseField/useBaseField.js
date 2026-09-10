import { useDispatch } from "react-redux";
import * as FormActions from "store/reducers/FormReducer";

export default ({
  Name,
  ObjectName,
  FormName,
  ChangeValue,
  EditorType,
  Config,
}) => {
  const dispatch = useDispatch();
  const ChangeValueLocal = (value) => {
    dispatch(
      FormActions.SetFieldValue({
        Name: FormName,
        Field: Name,
        Value: value,
      }),
    );
  };

  const FieldProps = {
    Name: Name,
    FormName: FormName,
    ObjectName: ObjectName,
    DataSourceSelector: "Form." + FormName + ".Fields." + Name + ".DataSource",
    ValueSelector: "Form." + FormName + ".RealObject." + Name,
    ChangeValue: ChangeValue ? ChangeValue : ChangeValueLocal,
    Config,
  };

  return {
    Name,
    ObjectName,
    FieldProps,
    ChangeValue,
    EditorType,
  };
};
