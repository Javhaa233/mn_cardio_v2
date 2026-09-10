import { editors } from "newComponents/BaseControls/BaseField";

export default (dispatch) => {
  return {
    fields: {
      file: { label: "Файл", editor: editors.fileChooser },
      sheet: { label: "Хуудас", editor: editors.selectBox },
    },
  };
};

export const layout = ["f|file|1", "f|sheet|1"];
