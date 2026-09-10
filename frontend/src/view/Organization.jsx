import { useTranslation } from "react-i18next";
import PageContainer from "customComponents/PageContainer";
import React, { useEffect } from "react";
// custom components
import BaseCrudManager from "baseComponents/BaseCrudManager";
// helper
import Helper from "helper";

export default function Organization() {
  const { t } = useTranslation();
  useEffect(() => {
    const onProvCity = {
      Field: "addr_prov_city",
      callback: function (Value, Fields, callback) {
        Helper.EditObjectHelper.GetField(Fields, "addr_soum_dist", (Field) => {
          Field["DataFilter"] = [{ Field: "id_province", Op: "Equals", Value }];
        });
        var ChangeObject = { addr_soum_dist: null };
        callback && callback({ ChangeObject, Fields });
      },
    };

    const onSoumDist = {
      Field: "addr_soum_dist",
      callback: function (Value, Fields, callback) {
        Helper.EditObjectHelper.GetField(Fields, "addr_bag_khoroo", (Field) => {
          Field["DataFilter"] = [{ Field: "id_soum", Op: "Equals", Value }];
        });
        var ChangeObject = { addr_bag_khoroo: null };
        callback && callback({ ChangeObject, Fields });
      },
    };

    const prevDialogLoad = Helper.EditObjectHelper.DialogLoad;

    Helper.EditObjectHelper.OnChanges.push(onProvCity);
    Helper.EditObjectHelper.OnChanges.push(onSoumDist);

    Helper.EditObjectHelper.DialogLoad = function (
      Fields,
      EditObject,
      callback,
    ) {
      Helper.EditObjectHelper.GetField(Fields, "addr_soum_dist", (Field) => {
        Field["DataFilter"] = [
          {
            Field: "id_province",
            Op: "Equals",
            Value: EditObject.addr_prov_city,
          },
        ];
      });
      Helper.EditObjectHelper.GetField(Fields, "addr_bag_khoroo", (Field) => {
        Field["DataFilter"] = [
          { Field: "id_soum", Op: "Equals", Value: EditObject.addr_soum_dist },
        ];
      });
      callback && callback(EditObject, Fields);
    };

    return () => {
      Helper.EditObjectHelper.OnChanges = (
        Helper.EditObjectHelper.OnChanges || []
      ).filter((s) => s !== onProvCity && s !== onSoumDist);
      Helper.EditObjectHelper.DialogLoad = prevDialogLoad;
    };
  }, []);

  return (
    <PageContainer>
      <BaseCrudManager
        ObjectName="Organization"
        ObjectHelper={Helper.EditObjectHelper}
        CreateDate="CreateDate"
        GridHideCheck={true}
      />
    </PageContainer>
  );
}
