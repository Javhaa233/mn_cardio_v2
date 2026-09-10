import { editors } from "newComponents/BaseControls/BaseField";
import { getLookupDataStore, list } from "utils/rest/dataSource";
import i18n from "i18n";

export default (dispatch) => {
  return {
    fields: {
      Name: {
        label: "Нэр",
        editor: editors.textBox,
        getArrayFilter: (value) => {
          if (!value) return null;
          return ["Name", "contains", value];
        },
      },
      OrganizationTypeId: {
        label: "Organization type",
        editor: {
          [editors.selectBox]: {
            config: { valueExpr: "value", displayExpr: "label" },
            dataSource: () =>
              list({ objectName: "vwOrganizationType", key: "value" }),
          },
        },
        getArrayFilter: (value) => {
          if (!value) return null;
          return ["OrganizationTypeId", "=", value];
        },
      },
      level: {
        label: "Organization level",
        editor: {
          [editors.selectBox]: {
            config: { valueExpr: "value", displayExpr: "label" },
            dataSource: () =>
              list({ objectName: "vwOrganizationLevel", key: "value" }),
          },
        },
        getArrayFilter: (value) => {
          if (!value) return null;
          return ["level", "=", value];
        },
      },
      addr_prov_city: {
        label: "Province/city",
        editor: {
          [editors.selectBox]: {
            config: { valueExpr: "id_data", displayExpr: "name" },
            dataSource: () =>
              getLookupDataStore({
                key: "id_data",
                objectName: "DictProvinceCity",
                select: ["id_data", "name"],
              }),
          },
        },
        getArrayFilter: (value) => {
          if (!value) return null;
          return ["addr_prov_city", "=", value];
        },
      },
    },
  };
};

export const layout = [
  "f|Name|3",
  "f|OrganizationTypeId|3",
  "f|level|3",
  "f|addr_prov_city|3",
];
