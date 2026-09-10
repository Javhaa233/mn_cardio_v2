import { editors } from "newComponents/BaseControls/BaseField";
import { getLookupDataStore } from "utils/rest/dataSource";

export default (dispatch) => {
  return {
    fields: {
      col1: {
        label: "Нэр",
        editor: editors.textBox,
        getArrayFilter: (value) => {
          if (!value) return null;
          return ["col1", "contains", value];
        },
      },
    },
  };
};

export const layout = ["f|col1|1"];
