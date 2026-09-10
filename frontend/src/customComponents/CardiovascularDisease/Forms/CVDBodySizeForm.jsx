import React from "react";
// translation
import i18n from "i18n";
// custom components
import BaseTextField from "customComponents/BaseEditControls/BaseTextField";
import BaseNoData from "customComponents/BaseNoData";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
// helper
import Helper from "helper";

class CVDBodySizeForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.MonitoringId = null;
    this.ModifyObject = {
      BJI: 0,
      Buselkhii: null,
      Cholesterol: 0,
      DaraltDeed: 0,
      DaraltDood: 0,
      HeartRate: 0,
      Height: null,
      RespiratoryRate: null,
      Sahar: null,
      SanamsarguiGlucose: null,
      Saturatsi: null,
      Tailbar: "",
      Temperature: 0,
      UlunGlucose: null,
      Weigth: null,
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
    result &&
      Object.keys(result).map((item) => {
        if (item !== "Cholesterol" && !result[item]) bol = false;
      });

    return bol ? this.ModifyObject : null;
  };

  GetData = async () => {
    let ModifyObject = null;
    await Helper.BaseCrudHelper.CallService(
      "/CVDMonitoring/GetLastBodySizeData",
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

  ChangeValueAfter = (Field, Value) => {
    const { setLevelNull } = this.props;
    setLevelNull && setLevelNull();
  };

  ChangeValue = (Field, Value) => {
    this.ModifyObject[Field] = Value;
    this.MarkDirty();

    if (this.ModifyObject["Height"] && this.ModifyObject["Weigth"]) {
      var BJI = 0;
      var Tailbar = "";
      var Height = isNaN(parseFloat(this.ModifyObject["Height"]))
        ? 0
        : parseFloat(this.ModifyObject["Height"]);
      var Weigth = isNaN(parseFloat(this.ModifyObject["Weigth"]))
        ? 0
        : parseFloat(this.ModifyObject["Weigth"]);

      if (
        this.ModifyObject["Height"] !== 0 &&
        this.ModifyObject["Weigth"] !== 0
      ) {
        BJI = (Weigth / (Height * Height)) * 10000;

        if (BJI < 18.5) {
          Tailbar = i18n.t("Жингийн дутагдалтай");
        } else if (BJI > 18.5 && BJI <= 24.9) {
          Tailbar = i18n.t("Хэвийн");
        } else if (BJI > 24.9 && BJI <= 29.9) {
          Tailbar = i18n.t("Жингийн илүүдэлтэй");
        } else if (BJI > 30 && BJI <= 34.9) {
          Tailbar = i18n.t("I-зэргийн таргалалттай");
        } else if (BJI > 34.9 && BJI <= 39.9) {
          Tailbar = i18n.t("II-зэргийн таргалалттай");
        } else if (BJI > 39.9) {
          Tailbar = i18n.t("III-зэргийн таргалалттай");
        } else {
          Tailbar = "";
        }

        this.ModifyObject["BJI"] = parseFloat(BJI.toFixed(2));
        Helper.BaseHelper.GetElementInActiveTab("BJI").value = parseFloat(
          BJI.toFixed(2),
        );
        this.ModifyObject["Tailbar"] = Tailbar;
        Helper.BaseHelper.GetElementInActiveTab("Tailbar").value = Tailbar;
      } else {
        this.ModifyObject["BJI"] = null;
        Helper.BaseHelper.GetElementInActiveTab("BJI").value = null;
        this.ModifyObject["Tailbar"] = null;
        Helper.BaseHelper.GetElementInActiveTab("Tailbar").value = null;
      }
    }
    process.env.NODE_ENV === "development" &&
      console.log({ ModifyObject: this.ModifyObject });
    this.ChangeValueAfter(Field, Value);
  };

  CustomRender = () => {
    const { t } = this.props;
    const { Fields } = this.state;
    return (
      <div>
        {Fields ? (
          <div>
            <BaseTextField
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("Height")}
              LabelWidth={70}
            />
            <BaseTextField
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("Weigth")}
              LabelWidth={70}
            />
            <BaseTextField
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("Buselkhii")}
              LabelWidth={70}
            />
            <BaseTextField
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("BJI")}
              LabelWidth={70}
              Id="BJI"
              Disabled={true}
            />
            <BaseTextField
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("Tailbar")}
              LabelWidth={70}
              Id="Tailbar"
              Disabled
            />
            <BaseTextField
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("HeartRate")}
              LabelWidth={70}
            />
            <BaseTextField
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("RespiratoryRate")}
              LabelWidth={70}
            />
            <BaseTextField
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("Temperature")}
              LabelWidth={70}
            />
            <BaseTextField
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("Saturatsi")}
              LabelWidth={70}
            />
            <BaseTextField
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("Sahar")}
              LabelWidth={70}
            />
            <BaseTextField
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("Cholesterol")}
              LabelWidth={70}
            />
            <BaseTextField
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("DaraltDeed")}
              LabelWidth={70}
            />
            <BaseTextField
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("DaraltDood")}
              LabelWidth={70}
            />
            <BaseTextField
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("UlunGlucose")}
              LabelWidth={70}
            />
            <BaseTextField
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("SanamsarguiGlucose")}
              LabelWidth={70}
            />
          </div>
        ) : (
          <BaseNoData />
        )}
      </div>
    );
  };
}

export default CVDBodySizeForm;
