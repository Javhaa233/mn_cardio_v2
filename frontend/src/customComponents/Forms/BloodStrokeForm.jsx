import React from "react";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseTextField from "customComponents/BaseEditControls/BaseTextField";
// import BaseInputMask from "customComponents/BaseEditControls/BaseInputMask";
import BaseDate from "customComponents/BaseEditControls/BaseDate";
import BaseRadio from "customComponents/BaseEditControls/BaseRadio";
import BaseNoData from "customComponents/BaseNoData";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
// helper
import Helper from "helper";

class BloodStrokeForm extends BaseCustomForm {
  constructor(props) {
    super(props);
  }

  Save = async (callback) => {
    const { ObjectName, PatientId } = this.props;
    if (Object.keys(this.ModifyObject).length > 0) {
      await Helper.BaseCrudHelper.BaseCreate(
        { ObjectName, Data: { ...this.ModifyObject, PatientId, Files: null } },
        (resData) => {
          if (resData) {
            const alert = Helper.BaseCrudHelper.ShowAlert(
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
              <BaseDate
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("date")}
              />
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("type")}
              />
              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("inr_value")}
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

export default BloodStrokeForm;
