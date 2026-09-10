import { useTranslation } from "react-i18next";
import PageContainer from "customComponents/PageContainer";
import React, { useEffect } from "react";
import BaseCrudManager from "baseComponents/BaseCrudManager";

import Helper from "helper";

export default function DrgroupHospitals() {
  const { t } = useTranslation();
  useEffect(() => {
    // Add field change handlers to Helper.EditObjectHelper
    Helper.EditObjectHelper.OnChanges.push({
      Field: "haid",
      callback: function (Value, EditObject, Fields, callback) {
        Helper.EditObjectHelper.GetField(Fields, "dsid", function (Field) {
          Field["DataFilter"] = [{ Field: "id_province", Op: "Equals", Value }];
        });
        EditObject.dsid = null;
        callback && callback(EditObject, Fields);
      },
    });

    Helper.EditObjectHelper.OnChanges.push({
      Field: "dsid",
      callback: function (Value, EditObject, Fields, callback) {
        Helper.EditObjectHelper.GetField(Fields, "khbid", function (Field) {
          Field["DataFilter"] = [{ Field: "id_soum", Op: "Equals", Value }];
        });
        EditObject.khbid = null;
        callback && callback(EditObject, Fields);
      },
    });

    // Set up dialog load handler
    Helper.EditObjectHelper.DialogLoad = function (
      Fields,
      EditObject,
      callback,
    ) {
      Helper.EditObjectHelper.GetField(Fields, "dsid", function (Field) {
        Field["DataFilter"] = [
          { Field: "id_province", Op: "Equals", Value: EditObject.haid },
        ];
      });
      Helper.EditObjectHelper.GetField(Fields, "khbid", function (Field) {
        Field["DataFilter"] = [
          { Field: "id_soum", Op: "Equals", Value: EditObject.dsid },
        ];
      });
      callback && callback(EditObject, Fields);
    };

    // Cleanup function to remove handlers if needed
    return () => {
      // Optionally remove the handlers if needed
    };
  }, []);

  return (
    <PageContainer>
      <BaseCrudManager
        ObjectName="DrgroupHospitals"
        GridHideCheck={true}
        ObjectHelper={Helper.EditObjectHelper}
      />
    </PageContainer>
  );
}
