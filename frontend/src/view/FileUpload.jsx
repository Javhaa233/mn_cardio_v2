import React, { useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// default components
import Button from "components/CustomButtons/Button";
// custom components
import BaseFileUpload from "baseComponents/Controls/BaseFileUpload";
// helper
import Helper from "helper";

export default function FileUpload() {
  const { t } = useTranslation();

  const [Alert, setAlert] = useState([]);
  const [Files, setFiles] = useState([]);

  const uploadFile = async (callback) => {
    var Value = Files;
    let alert = null;
    if (Value && Value.length > 0) {
      await Helper.BaseCrudHelper.baseUploadTest(
        {
          LinkedObjectInfo: {
            LinkedObjectName: "Test",
            LinkedObjectId: null,
            FieldName: "Files",
          },
          Value,
        },
        (resData) => {
          if (resData) {
            alert = Helper.BaseCrudHelper.ShowAlert(
              resData.Message,
              resData.Success,
              () => {
                setAlert(null);
                callback && callback(resData);
              },
            );
            setAlert(alert);
          }
        },
      );
    } else {
      alert = Helper.BaseCrudHelper.ShowAlert("Select your file", false, () => {
        setAlert(null);
        callback && callback({ Success: false, Data: null });
      });
      setAlert(alert);
    }
  };

  return (
    <div>
      {Alert}
      <div>
        <BaseFileUpload
          Value={Files}
          Config={{ Name: "Files" }}
          ChangeValue={(value) => setFiles(value)}
          WithLabel={false}
        />
      </div>
      <div>
        <Button
          color="info"
          style={{ padding: "6px 14px", boxShadow: "none" }}
          onClick={() => uploadFile(() => {})}
        >
          {t("Save")}
        </Button>
      </div>
    </div>
  );
}
