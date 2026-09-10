import { useTranslation } from "react-i18next";
import React from "react";
// translation
import { withTranslation } from "react-i18next";
// import Divider from "@mui/material/Divider";
// default components
import Button from "components/CustomButtons/Button";
// custom components
import BaseRadio from "customComponents/BaseEditControls/BaseRadio";
import BaseNoData from "customComponents/BaseNoData";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
import CustomTextArea from "customComponents/CardiovascularDisease/Forms/CustomTextArea";
// helper
import Helper from "helper";
import customHistory from "customHistory";

class CVDManagementForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.MonitoringId = null;
    this.ModifyObject = { IsSentLavlagaa: null, IsAdviceFromLavlagaa: null };
  }

  componentDidMount() {
    // this.GetFormConfig();
  }

  SetMonitoringId = (MonitoringId) => {
    this.MonitoringId = MonitoringId;
    this.GetFormConfig();
  };

  isValidation = () => {
    let validateMessage = "";

    if (!this.ModifyObject.IsSentLavlagaa) {
      validateMessage += "Лавлагаа тусламжинд илгээх эсэх сонгоно уу";
    }

    if (!this.ModifyObject.IsAdviceFromLavlagaa) {
      validateMessage += validateMessage ? ", " : "";
      validateMessage +=
        " Лавлагаа тусламжаас зөвлөмжтэй ирсэн эсэх сонгоно уу";
    }

    return validateMessage;
  };

  IsValidated = () => {
    const result = Object.values(this.ModifyObject);
    var bol = true;

    result &&
      result.map((item) => {
        if (item === null || item === "") bol = false;
      });

    return bol ? this.ModifyObject : null;
  };

  GetData = async () => {
    var ModifyObject = null;
    await Helper.BaseCrudHelper.CallService(
      "/CVDMonitoring/GetLastManagementData",
      { MonitoringId: this.MonitoringId },
      (resData) => {
        if (resData && resData.Success && resData.Data) {
          ModifyObject = resData.Data;
          delete ModifyObject["Id"];
          delete ModifyObject["CreatedDate"];
          delete ModifyObject["CreateUserId"];
          this.ModifyObject = ModifyObject;
        }
        this.setState({ EditObject: resData.Data, isLoading: false });
      },
    );
  };

  Save = async () => {
    let alert = null;
    const validateMessage = this.isValidation();
    if (validateMessage !== "") {
      alert = Helper.BaseCrudHelper.ShowAlert(validateMessage, false, () => {
        this.setState({ Alert: null });
        return;
      });
      this.setState({ Alert: alert });
      return;
    }

    var ModifyObject = this.ModifyObject;
    if (this.MonitoringId && ModifyObject) {
      await Helper.BaseCrudHelper.CallService(
        "/CVDMonitoring/CreateManagement",
        { MonitoringId: this.MonitoringId, Data: JSON.stringify(ModifyObject) },
        (resData) => {
          if (resData && resData.Success) {
            alert = Helper.BaseCrudHelper.ShowAlert(
              resData.Message,
              true,
              () => {
                this.setState({ Alert: null });
                const PatRegNo = Helper.BaseHelper.getUrlParam(
                  decodeURI(document.location.href),
                  "PatRegNo",
                );
                const source = Helper.BaseHelper.getUrlParam(
                  decodeURI(document.location.href),
                  "source",
                );

                if (PatRegNo && source === "PatientInfo") {
                  customHistory.push(
                    "/admin/PatientInfo?RegisterNo=" + PatRegNo,
                  );
                } else {
                  // Return to initial state (Cardiovascular search page)
                  customHistory.push("/admin/Cardiovascular");
                }
              },
            );
            this.setState({ Alert: alert });
          } else if (resData && !resData.Success) {
            alert = Helper.BaseCrudHelper.ShowAlert(
              resData.Message,
              false,
              () => this.setState({ Alert: null }),
            );
            this.setState({ Alert: alert });
          }
        },
      );
    } else {
      alert = Helper.BaseCrudHelper.ShowAlert(
        "Information is missing",
        false,
        () => this.setState({ Alert: null }),
      );
      this.setState({ Alert: alert });
    }
  };

  CustomRender = () => {
    const { t } = this.props;
    const { Fields, EditObject } = this.state;
    return (
      <div>
        <h5
          style={{
            margin: 0,
            padding: 0,
            fontWeight: "400",
            marginBottom: "10px",
            borderBottom: "1px solid #2e2e2e",
          }}
        >
          {t("Лавлагаа тусламжид илгээх эсэх")}
        </h5>
        {Fields ? (
          <div>
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("DiagnosedArterHypertension")}
              md={8}
              Left={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("DiagnosedDiabetes")}
              md={8}
              Left={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("PreventiveTreatment")}
              md={8}
              Left={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("IsSentLavlagaa")}
              md={8}
              Left={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("IsAdviceFromLavlagaa")}
              md={8}
              Left={true}
            />
            <h5
              style={{
                margin: 0,
                padding: 0,
                marginTop: "5px",
                color: "#75736c",
                display: "inline-flex",
                fontSize: "0.875rem",
                lineHeight: "1.428571429",
                fontWeight: "400",
              }}
            >
              {t("Цаашдын Зөвлөгөө")}
            </h5>
            <CustomTextArea
              ChangeValue={(Value) =>
                (this.ModifyObject["FutureAdvice"] = Value)
              }
              Value={EditObject?.FutureAdvice || ""}
            />
            <div>
              <Button
                variant="contained"
                color="success"
                size="sm"
                onClick={this.Save}
                style={{ float: "right" }}
              >
                {t("Save")}
              </Button>
              <div style={{ clear: "both" }}></div>
            </div>
          </div>
        ) : (
          <BaseNoData />
        )}
      </div>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(CVDManagementForm);
