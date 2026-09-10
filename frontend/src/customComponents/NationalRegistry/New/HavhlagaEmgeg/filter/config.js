import { editors } from "newComponents/BaseControls/BaseField";
import { getLookupDataStore } from "utils/rest/dataSource";

export default (dispatch) => {
  return {
    fields: {
      name: {
        label: "Нэр",
        editor: editors.textBox,
        getArrayFilter: (value) => {
          if (!value) return null;
          return ["name", "contains", value];
        },
      },
    },
  };
};

export const layout = ["f|name|1"];
