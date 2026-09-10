import React from "react";
import Divider from "@mui/material/Divider";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseRadio from "customComponents/BaseEditControls/BaseRadio";
import BaseNoData from "customComponents/BaseNoData";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
import BaseTextField from "customComponents/BaseEditControls/BaseTextField";

// helper
import Helper from "helper";

class CVDControlAndTransitionForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.DataId = props.DataId || null;
    this.ModifyObject = {
      MonitoringId: props.DataId || null,
      HynaltiinUzleg: null,
      HynaltaasGarsan: null,
      Tamhi: null,
      EmiinTorol: null,
      EmiinNer: null,
      Glucose: null,
    };
  }

  componentDidMount() {
    this.GetFormConfig();
  }

  IsValidate() {
    const result = Object.values(this.ModifyObject);
    var bol = true;
    result.map((item) => {
      if (item === null) {
        bol = false;
        return;
      }
    });
    return bol;
  }

  Save = async (callback) => {
    let alert = null;
    if (this.IsValidate() && this.DataId) {
      await Helper.BaseCrudHelper.CallService(
        "/CVDMonitoring/CreateControlAndTransition",
        { MonitoringId: this.DataId, Data: JSON.stringify(this.ModifyObject) },
        (resData) => {
          if (resData) {
            alert = Helper.BaseCrudHelper.ShowAlert(
              resData.Message,
              resData.Success,
              () => {
                this.setState({ Alert: null });
                callback && callback(resData.Success);
              },
            );
            this.setState({ Alert: alert });
          }
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
                Config={this.GetConfigField("HynaltiinUzleg")}
                md={4}
              />
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("HynaltaasGarsan")}
                md={4}
              />
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("Tamhi")}
                md={4}
              />
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("EmiinTorol")}
                md={4}
              />
              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("EmiinNer")}
                md={4}
              />
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("Glucose")}
                md={4}
              />
            </div>
          ) : (
            <BaseNoData />
          )}
        </GridItem>
      </GridContainer>
    );
  };
}

export default CVDControlAndTransitionForm;
