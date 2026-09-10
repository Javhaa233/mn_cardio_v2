import { editors } from "newComponents/BaseControls/BaseField";
import { getLookupDataStore, list } from "utils/rest/dataSource";
import i18n from "i18n";

export default (dispatch) => {
  return {
    objectName: "Organization",
    title: i18n.t("Organization"),
    keyField: "Id",
    labelField: "Name",
    fields: {
      Id: { Name: "Id", label: "Id", editor: { [editors.textBox]: {} } },
      ParentOrganizationId: {
        Name: "ParentOrganizationId",
        label: "Parent organization",
        editor: {
          [editors.lookupGrid]: {
            config: {
              valueExpr: "Id",
              displayExpr: "Name",
              columns: [{ dataField: "Name", caption: i18n.t("Нэр") }],
            },
            dataSource: () =>
              getLookupDataStore({
                key: "Id",
                objectName: "Organization",
                select: ["Id", "Name"],
              }),
          },
        },
      },
      OrganizationTypeId: {
        Name: "OrganizationTypeId",
        label: "Organization type",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "value", displayExpr: "label" },
            dataSource: () =>
              list({ objectName: "vwOrganizationType", key: "value" }),
          },
        },
      },
      level: {
        Name: "level",
        label: "Organization level",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "value", displayExpr: "label" },
            dataSource: () =>
              list({ objectName: "vwOrganizationLevel", key: "value" }),
          },
        },
      },

      Name: { Name: "Name", label: "Name", editor: { [editors.textBox]: {} } },
      // { Name: "Name", Label: "", Type: "Text", md: 4, Position: 1 },/

      addr_prov_city: {
        Name: "addr_prov_city",
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
      },

      addr_soum_dist: {
        Name: "addr_soum_dist",
        label: "Soum/district",
        editor: {
          [editors.selectBox]: {
            config: { valueExpr: "id_data", displayExpr: "name" },
            dataSource: (rootFilter) =>
              getLookupDataStore({
                key: "id_data",
                objectName: "DictSoumDistrict",
                select: ["id_data", "name"],
                rootFilter,
              }),
          },
        },
      },

      addr_bag_khoroo: {
        Name: "addr_bag_khoroo",
        label: "Bag/khoroo",
        editor: {
          [editors.selectBox]: {
            config: { valueExpr: "id_data", displayExpr: "name" },
            dataSource: (rootFilter) =>
              getLookupDataStore({
                key: "id_data",
                objectName: "DictBagKhoroo",
                select: ["id_data", "name"],
                rootFilter,
              }),
          },
        },
      },

      IsSoumHospital: {
        Name: "IsSoumHospital",
        label: "Сумын эмнэлэг мөн эсэх",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "value", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "OptionTypes",
                key: "value",
                options: { rootFilter: ["dico", "=", "yorn"] },
              }),
          },
        },
      },
      Logo: {
        Name: "Logo",
        label: "Logo",
        editor: {
          [editors.singleImage]: {},
        },
      },
    },
  };
};

export const layout = `
ParentOrganizationId
OrganizationTypeId
level
Name
addr_prov_city
addr_soum_dist
addr_bag_khoroo
IsSoumHospital
Logo
`;
