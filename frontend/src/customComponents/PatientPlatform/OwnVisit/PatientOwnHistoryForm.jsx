import React from "react";
import Divider from "@mui/material/Divider";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseLoadButton from "customComponents/BaseLoadButton";
import BaseRadio from "customComponents/BaseEditControls/BaseRadio";
import BaseNoData from "customComponents/BaseNoData";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
// helper
import Helper from "helper";

class PatientOwnHistoryForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.PatRegNo = null;
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
    // this.GetFormConfig();
  }

  SetPatRegNo = (PatRegNo) => {
    this.PatRegNo = PatRegNo;
    this.GetFormConfig();
  };

  GetData = async () => {
    await this.GetLastData();
  };

  IsValidated = () => {
    const result = Object.assign({}, this.ModifyObject);
    var bol = true;
    Object.keys(result).forEach((item) => {
      if (result[item] === null || result[item] === "") bol = false;
    });
    return bol ? this.ModifyObject : false;
  };

  ChangeValueAfter = (Field, Value) => {
    const { setLevelNull } = this.props;
    setLevelNull && setLevelNull();
  };

  GetLastData = async () => {
    const { ObjectName } = this.state;
    let ModifyObject = null;
    this.setState({ isLoading: true });
    await Helper.BaseCrudHelper.CallService(
      "/CVDMonitoringPatient/GetLastData",
      { ObjectName, PatRegNo: this.PatRegNo },
      (resData) => {
        if (resData && resData.Success && resData.Data) {
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
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("BuurniiArhagUwchin")}
                md={8}
                Left={true}
              />

              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("Holestrin")}
                md={8}
                Left={true}
              />

              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("TsusniiSahar")}
                md={8}
                Left={true}
              />

              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("ZurkhShigdees")}
                md={8}
                Left={true}
              />

              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("TarkhiHarvalt")}
                md={8}
                Left={true}
              />

              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("Stenokardi")}
                md={8}
                Left={true}
              />

              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("TsusHomsroh")}
                md={8}
                Left={true}
              />

              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("ZahiinSudas")}
                md={8}
                Left={true}
              />

              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("GerbulNasbaralt")}
                md={8}
                Left={true}
              />

              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("TamkhiTatdag")}
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
                md={8}
                Left={true}
              />

              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("IsDiabeticEm")}
                md={8}
                Left={true}
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

export default PatientOwnHistoryForm;
