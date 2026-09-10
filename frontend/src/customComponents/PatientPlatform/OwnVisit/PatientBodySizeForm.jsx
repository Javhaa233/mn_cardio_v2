import React from "react";
import Divider from "@mui/material/Divider";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseLoadButton from "customComponents/BaseLoadButton";
import BaseTextField from "customComponents/BaseEditControls/BaseTextField";
import BaseNoData from "customComponents/BaseNoData";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
// helper
import Helper from "helper";

class PatientBodySizeForm extends BaseCustomForm {
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
    this.LogedUser = Helper.AuthHelper.GetLogedUserLocal();
  }

  componentDidMount() {
    // this.GetFormConfig();
  }

  SetPatRegNo = (PatRegNo) => {
    this.PatRegNo = PatRegNo;
    this.GetFormConfig();
  };

  GetData = async () => await this.GetLastData();

  IsValidated = () => {
    const result = Object.assign({}, this.ModifyObject);
    var bol = true;

    Object.keys(result).forEach((item) => {
      if (result[item] === null || result[item] === "") bol = false;
    });
    return bol ? this.ModifyObject : false;
  };

  GetLastData = async () => {
    const { ObjectName } = this.state;
    let ModifyObject = null;
    this.setState({ isLoading: true });
    await Helper.BaseCrudHelper.CallService(
      "/CVDMonitoringPatient/GetLastData",
      { ObjectName, PatRegNo: this.PatRegNo },
      (resData) => {
        if (resData.Success && resData.Data) {
          ModifyObject = Object.assign({}, resData.Data);
          delete ModifyObject["Id"];
          delete ModifyObject["CreatedDate"];
          delete ModifyObject["CreateUserId"];
          this.ModifyObject = ModifyObject;
          this.setState({ EditObject: resData.Data, isLoading: false });
        } else {
          this.setState({ isLoading: false });
        }
      },
    );
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
          Tailbar = "Жингийн дутагдалтай";
        } else if (BJI > 18.5 && BJI <= 24.9) {
          Tailbar = "Хэвийн";
        } else if (BJI > 24.9 && BJI <= 29.9) {
          Tailbar = "Жингийн илүүдэлтэй";
        } else if (BJI > 30 && BJI <= 34.9) {
          Tailbar = "I-зэргийн таргалалттай";
        } else if (BJI > 34.9 && BJI <= 39.9) {
          Tailbar = "II-зэргийн таргалалттай";
        } else if (BJI > 39.9) {
          Tailbar = "III-зэргийн таргалалттай";
        } else {
          Tailbar = "";
        }

        this.ModifyObject["BJI"] = parseFloat(BJI.toFixed(2));
        document.getElementById("BJI").value = parseFloat(BJI.toFixed(2));
        this.ModifyObject["Tailbar"] = Tailbar;
        document.getElementById("Tailbar").value = Tailbar;
      } else {
        this.ModifyObject["BJI"] = null;
        document.getElementById("BJI").value = null;
        this.ModifyObject["Tailbar"] = null;
        document.getElementById("Tailbar").value = null;
      }
    }
    process.env.NODE_ENV === "development" &&
      console.log({ ModifyObject: this.ModifyObject });
    this.ChangeValueAfter(Field, Value);
  };

  ChangeValueAfter = (Field, Value) => {
    // const { setLevelNull } = this.props;
    // setLevelNull && setLevelNull();
  };

  Save = async (callback) => {
    const { ObjectName, EditObject } = this.state;
    let alert = null;
    // check validation
    const isValidate = this.IsValidated();

    if (!isValidate) {
      alert = Helper.BaseCrudHelper.ShowAlert(
        "Мэдээлэл дутуу байна",
        false,
        () => {
          this.setState({ Alert: null });
          callback && callback();
        },
      );
      this.setState({ Alert: alert });
      return;
    }

    if (Object.keys(this.ModifyObject).length > 0) {
      if (EditObject && EditObject.Id) {
        await Helper.BaseCrudHelper.BaseUpdate(
          {
            ObjectName,
            Data: {
              ...this.ModifyObject,
              Id: EditObject.Id,
              PatRegNo: this.PatRegNo,
              Files: null,
            },
          },
          (resData) => {
            if (resData) {
              alert = Helper.BaseCrudHelper.ShowAlert(
                resData.Message,
                resData.Success,
                () => {
                  this.setState({ Alert: null });
                  callback && callback();
                },
              );
              this.setState({ Alert: alert });
            }
          },
        );
      } else {
        await Helper.BaseCrudHelper.BaseCreate(
          {
            ObjectName,
            Data: {
              ...this.ModifyObject,
              PatRegNo: this.PatRegNo,
              Files: null,
            },
          },
          (resData) => {
            if (resData) {
              alert = Helper.BaseCrudHelper.ShowAlert(
                resData.Message,
                resData.Success,
                () => {
                  this.setState({ Alert: null });
                  callback && callback();
                },
              );
              this.setState({ Alert: alert });
            }
          },
        );
      }
    } else {
      callback && callback();
    }
  };

  CustomRender = () => {
    const { t } = this.props;
    const { Fields } = this.state;
    return (
      <GridContainer style={{ margin: "0", width: "100%" }}>
        <GridItem xs={12} md={12}>
          {Fields && Fields.length > 0 ? (
            <div>
              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("Height")}
                md={4}
              />

              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("Weigth")}
                md={4}
              />

              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("Buselkhii")}
                md={4}
              />

              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("BJI")}
                md={4}
                Id="BJI"
                Disabled
              />

              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("Tailbar")}
                md={4}
                Id="Tailbar"
                Disabled
                FullWidth={true}
              />

              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("HeartRate")}
                md={4}
              />

              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("RespiratoryRate")}
                md={4}
              />

              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("Temperature")}
                md={4}
              />

              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("Saturatsi")}
                md={4}
              />

              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("Sahar")}
                md={4}
              />

              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("Cholesterol")}
                md={4}
              />

              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("DaraltDeed")}
                md={4}
              />

              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("DaraltDood")}
                md={4}
              />

              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("UlunGlucose")}
                md={4}
              />

              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("SanamsarguiGlucose")}
                md={4}
              />

              <div style={{ marginTop: "20px" }}>
                <BaseLoadButton
                  ButtonText="Хадгалах"
                  Color="success"
                  onClick={this.Save}
                />
              </div>
            </div>
          ) : (
            <BaseNoData />
          )}
        </GridItem>
      </GridContainer>
    );
  };
}

export default PatientBodySizeForm;
