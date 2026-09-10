import React from "react";
// custom components
import BaseRadio from "customComponents/BaseEditControls/BaseRadio";
import BaseNoData from "customComponents/BaseNoData";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
// helper
import Helper from "helper";

class CVDHistoryForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.MonitoringId = null;
    this.ModifyObject = {
      BuurniiArhagUwchin: "n",
      GerbulNasbaralt: "n",
      Holestrin: "n",
      Stenokardi: "n",
      TamkhiTatdag: "n",
      TarkhiHarvalt: "n",
      TsusHomsroh: "n",
      TsusniiSahar: "n",
      ZahiinSudas: "n",
      ZurkhShigdees: "n",
      IsDaraltEm: "n",
      IsDiabeticEm: "n",
    };
  }

  componentDidMount() {
    this.GetFormConfig();
  }

  SetMonitoringId = (MonitoringId) => {
    this.MonitoringId = MonitoringId;
    this.GetFormConfig();
  };

  IsValidated = () => {
    const result = Object.assign({}, this.ModifyObject);
    let bol = true;

    Object.keys(result).map((item) => {
      if (result[item] === null) bol = false;
    });
    return bol ? this.ModifyObject : "n";
  };

  GetIsSmoke = () => {
    const IsSmoke = this.ModifyObject["TamkhiTatdag"];
    return IsSmoke ? IsSmoke : "n";
  };

  ChangeValueAfter = (Field, Value) => {
    const { setLevelNull } = this.props;
    setLevelNull && setLevelNull();
  };

  GetData = async () => {
    let ModifyObject = null;
    await Helper.BaseCrudHelper.CallService(
      "/CVDMonitoring/GetLastHistoryData",
      { MonitoringId: this.MonitoringId },
      (resData) => {
        if (resData && resData.Success && resData.Data) {
          ModifyObject = resData.Data;
          delete ModifyObject["Id"];
          delete ModifyObject["CreatedDate"];
          delete ModifyObject["CreateUserId"];
          this.ModifyObject = ModifyObject;
          this.setState({ EditObject: resData.Data });
        }
        this.setState({ isLoading: false });
      },
    );
  };

  CustomRender = () => {
    const { t } = this.props;
    const { Fields } = this.state;
    return (
      <div>
        {Fields ? (
          <div>
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("BuurniiArhagUwchin")}
              defaultValue={"n"}
              md={8}
              Left={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("Holestrin")}
              defaultValue={"n"}
              md={8}
              Left={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("TsusniiSahar")}
              defaultValue={"n"}
              md={8}
              Left={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("ZurkhShigdees")}
              defaultValue={"n"}
              md={8}
              Left={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("TarkhiHarvalt")}
              defaultValue={"n"}
              md={8}
              Left={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("Stenokardi")}
              defaultValue={"n"}
              md={8}
              Left={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("TsusHomsroh")}
              defaultValue={"n"}
              md={8}
              Left={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("ZahiinSudas")}
              defaultValue={"n"}
              md={8}
              Left={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("GerbulNasbaralt")}
              defaultValue={"n"}
              md={8}
              Left={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("TamkhiTatdag")}
              defaultValue={"n"}
              md={8}
              Left={true}
            />
            <div
              style={{
                position: "relative",
                display: "inline-block",
                width: "100%",
                borderTop: "1px solid #ccc",
                padding: "15px 0 0",
                marginTop: "25px",
              }}
            >
              <h5
                style={{
                  position: "absolute",
                  top: "-22px",
                  left: "12px",
                  fontSize: "0.8rem",
                  fontWeight: "400",
                  padding: "2px 8px",
                  borderRadius: "0.2rem",
                  color: "#FFF",
                  backgroundColor: "#5ec7ff",
                  boxShadow: "0 1px 4px 0 rgba(0, 0, 0, 0.14)",
                  textTransform: "uppercase",
                }}
              >
                Нэмэлт
              </h5>
            </div>
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("IsDaraltEm")}
              defaultValue={"n"}
              md={8}
              Left={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("IsDiabeticEm")}
              defaultValue={"n"}
              md={8}
              Left={true}
            />
          </div>
        ) : (
          <BaseNoData />
        )}
      </div>
    );
  };
}

export default CVDHistoryForm;
