import { useTranslation } from "react-i18next";
import React from "react";
import Divider from "@mui/material/Divider";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseTextField from "customComponents/BaseEditControls/BaseTextField";
import BaseNoData from "customComponents/BaseNoData";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
// helper
import Helper from "helper";

class CreatePatientForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      EditObject: { p_registration: props.PatRegNo || null },
    };
    this.ModifyObject = { p_registration: props.PatRegNo || null };
  }

  componentDidMount() {
    this.GetFormConfig();
  }

  Save = async (callback) => {
    const { EditObject } = this.state;
    let alert = null;
    if (EditObject.p_registration) {
      await Helper.BaseCrudHelper.CallService(
        "/CVDMonitoring/CreatePatient",
        { Data: JSON.stringify(this.ModifyObject) },
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
      alert = Helper.BaseCrudHelper.ShowAlert("РД олдсонгүй", false, () => {
        this.setState({ Alert: null });
        callback && callback(false);
      });
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
              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("p_registration")}
                md={4}
                FullWidth={true}
                ReadOnly={true}
              />
              <Divider variant="middle" />
              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("p_lastname")}
                md={4}
                FullWidth={true}
              />
              <Divider variant="middle" />
              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("p_firstname")}
                md={4}
                FullWidth={true}
              />
              {/* <Divider variant="middle" /> */}
            </div>
          ) : (
            <BaseNoData />
          )}
        </GridItem>
      </GridContainer>
    );
  };
}

export default CreatePatientForm;
