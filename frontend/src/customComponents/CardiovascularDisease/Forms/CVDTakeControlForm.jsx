import React from "react";
// translation
import { withTranslation } from "react-i18next";
import Divider from "@mui/material/Divider";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseRadio from "customComponents/BaseEditControls/BaseRadio";
import BaseNoData from "customComponents/BaseNoData";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
// import BaseTextField from "customComponents/BaseEditControls/BaseTextField";

// helper
import Helper from "helper";

class CVDTakeControlForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.DataId = props.DataId || null;
    this.ModifyObject = {
      MonitoringId: this.DataId,
      HynaltandOrson: null,
      HynaltandOrsonTorol: null,
      HynaltandDahihHugatsaa: null,
      Lavlagaa: null,
    };
  }

  componentDidMount() {
    this.GetFormConfig();
  }

  ChangeValueAfter = (Field, Value) => {
    const childDiv = Helper.BaseHelper.GetElementInActiveTab(Field + "Child");
    if (childDiv) {
      if (Value === "1") childDiv.style.display = "block";
      else childDiv.style.display = "none";
    }

    var ChildDiv1 = Helper.BaseHelper.GetElementInActiveTab(Field + "Child1");
    if (ChildDiv1) {
      if (Value === "2") {
        ChildDiv1.style.display = "block";
      } else {
        ChildDiv1.style.display = "none";
      }
    }
  };

  IsValidate() {
    if (this.ModifyObject["HynaltandOrsonTorol"] === "1") {
      delete this.ModifyObject["Lavlagaa"];
    } else if (this.ModifyObject["HynaltandOrsonTorol"] === "2") {
      delete this.ModifyObject["HynaltandDahihHugatsaa"];
    }

    const result = Object.values(this.ModifyObject);
    var bol = true;
    result &&
      result.map((item) => {
        if (item === null) {
          bol = false;
          return;
        }
      });
    return bol;
  }

  // Save
  Save = async (callback) => {
    let alert = null;
    if (this.IsValidate() && this.DataId) {
      await Helper.BaseCrudHelper.CallService(
        "/CVDMonitoring/TakeControl",
        { MonitoringId: this.DataId, Data: JSON.stringify(this.ModifyObject) },
        (resData) => {
          resData && callback && callback(resData.Success);
        },
      );
    } else {
      alert = Helper.BaseCrudHelper.ShowAlert(
        "Information is missing",
        false,
        () => {
          this.setState({ Alert: null });
          callback && callback(false);
        },
      );
      this.setState({ Alert: alert });
    }
  };

  CustomRender = () => {
    const { t } = this.props;
    const { Fields } = this.state;
    return (
      <GridContainer style={{ margin: "0", width: "100%" }}>
        <GridItem xs={12} md={12}>
          {Fields ? (
            <div>
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("HynaltandOrson")}
                md={4}
              />
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("HynaltandOrsonTorol")}
                md={4}
              />
              <div
                id="HynaltandOrsonTorolChild"
                style={{
                  position: "relative",
                  padding: "10px",
                  border: "1px solid #ccc",
                  margin: "10px",
                  backgroundColor: "#f5f5f5",
                  display: "none",
                }}
              >
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("HynaltandDahihHugatsaa")}
                  md={4}
                />
              </div>
              <div
                id="HynaltandOrsonTorolChild1"
                style={{
                  position: "relative",
                  padding: "10px",
                  border: "1px solid #ccc",
                  margin: "10px",
                  backgroundColor: "#f5f5f5",
                  display: "none",
                }}
              >
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("Lavlagaa")}
                  md={4}
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

export default withTranslation(undefined, { withRef: true })(
  CVDTakeControlForm,
);
